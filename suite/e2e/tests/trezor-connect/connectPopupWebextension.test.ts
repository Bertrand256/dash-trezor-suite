import { type Page, chromium } from '@playwright/test';
import path from 'path';
import { existsSync, readdirSync, statSync } from 'fs';

import { createTestAnnotation } from '@trezor/e2e-utils';
import { TrezorUserEnvLink } from '@trezor/trezor-user-env-link';

import { mockRemoteMessageSystem } from '../../support/common';
import { expect, test } from '../../support/fixtures';
import { AnalyticsSection } from '../../support/pageObjects/analyticsSection';
import { ConnectPermissionsModal } from '../../support/pageObjects/connectPermissionsModal';
import { DevicePrompt } from '../../support/pageObjects/devicePrompt';
import { OnboardingPage } from '../../support/pageObjects/onboarding/onboardingPage';
import { SettingsPage } from '../../support/pageObjects/settings/settingsPage';
import { enhancePage } from '../../support/testExtends/enhancePage';

function getSuiteWebUrl() {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
        // Local development
        return 'http://localhost:8000';
    }

    // Extract branch from BASE_URL (e.g., "https://dev.suite.sldev.cz/suite-web/develop/web" -> "develop")
    const branchMatch = baseUrl.match(/suite-web\/(.*?)\/web/);
    if (branchMatch) {
        return `https://dev.suite.sldev.cz/suite-web/${branchMatch[1]}/web`;
    }

    return 'http://localhost:8000';
}

const suiteWebUrl = getSuiteWebUrl();

test.describe(
    'TrezorConnect webextension -> Suite Web',
    { tag: ['@smoke', '@T3T1', '@webOnly'] },
    () => {
        test(
            'webextension can export address via suite-web popup',
            {
                annotation: createTestAnnotation({
                    testCase:
                        'Suite Web Connect (webextension): Happy path scenario with getAddress via suite-web',
                }),
            },
            async ({ model, device, context: defaultContext }) => {
                console.log('closing dafautl context');
                await defaultContext.close();
                console.log('default context closed');

                // i know this is not the preferred way of doing things but it looks like
                // when running in CI, suite is not detecting device. is it because of the
                // context close stopped it too?
                await new Promise(resolve => setTimeout(resolve, 1000));
                // @ts-ignore
                await TrezorUserEnvLink.startEmu({ model: 'T3T1', wipe: true });
                await new Promise(resolve => setTimeout(resolve, 1000));

                await TrezorUserEnvLink.setupEmu();
                await new Promise(resolve => setTimeout(resolve, 1000));

                await TrezorUserEnvLink.startBridge();
                await new Promise(resolve => setTimeout(resolve, 1000));

                const extensionPath = path.join(
                    __dirname,
                    '../../../../packages/connect-explorer/build-webextension',
                );

                const userDataDir = path.join(
                    test.info().outputDir,
                    'connect-explorer-webextension',
                );
                console.log('[DEBUG] Launching persistent context with extension:', extensionPath);
                console.log('[DEBUG] Extension path:', extensionPath);
                console.log('[DEBUG] Extension path exists:', existsSync(extensionPath));
                if (existsSync(extensionPath)) {
                    try {
                        const files = readdirSync(extensionPath);
                        const stats = statSync(extensionPath);
                        console.log(
                            '[DEBUG] Extension directory is readable:',
                            stats.isDirectory(),
                        );
                        console.log('[DEBUG] Extension directory contents:', files.slice(0, 20)); // First 20 files
                        console.log(
                            '[DEBUG] manifest.json exists:',
                            existsSync(path.join(extensionPath, 'manifest.json')),
                        );
                    } catch (e) {
                        console.log('[DEBUG] Error reading extension directory:', e);
                    }
                } else {
                    console.log('[DEBUG] WARNING: Extension path does not exist!');
                }
                console.log('[DEBUG] User data dir:', userDataDir);
                console.log('[DEBUG] BASE_URL env var:', process.env.BASE_URL);
                const context = await chromium.launchPersistentContext(userDataDir, {
                    // https://playwright.dev/docs/chrome-extensions#headless-mode
                    // By default, Chrome's headless mode in Playwright does not support Chrome extensions.
                    // To overcome this limitation, you can run Chrome's persistent context with a new headless mode.
                    // using `--headless=new`
                    headless: false,
                    args: [
                        process.env.BASE_URL ? `--headless=new` : '', // the new headless arg for chrome v109+. Use '--headless=chrome' as arg for browsers v94-108.
                        `--disable-extensions-except=${extensionPath}`,
                        `--load-extension=${extensionPath}`,
                    ],
                    viewport: { width: 1280, height: 720 },
                    permissions: ['local-network-access'],
                });

                console.log('[DEBUG] Persistent context launched');

                try {
                    // Check if extension loaded
                    console.log('[DEBUG] Checking for service workers immediately after launch');
                    console.log(
                        '[DEBUG] Initial service workers:',
                        context.serviceWorkers().length,
                    );

                    await context.addInitScript(() => {
                        (window as any).Playwright = true;
                    });

                    // Complete onboarding on Suite Web first
                    console.log('[DEBUG] Creating new page for onboarding');
                    const onboardingPage = await context.newPage();
                    enhancePage(onboardingPage);

                    console.log('[DEBUG] Navigating to Suite Web:', suiteWebUrl);
                    await onboardingPage.goto(suiteWebUrl, {
                        timeout: 30000,
                        waitUntil: 'load',
                    });

                    console.log('[DEBUG] Page navigated, checking readiness');

                    await onboardingPage.locator('[data-testid="@welcome-layout/body"]').waitFor({
                        state: 'visible',
                        timeout: 30000,
                    });

                    console.log('[DEBUG] Mocking remote message system');
                    await mockRemoteMessageSystem(onboardingPage);

                    console.log('[DEBUG] Creating OnboardingPage object');
                    const onboarding = new OnboardingPage(
                        onboardingPage,
                        device,
                        new DevicePrompt(onboardingPage, model as any),
                        new AnalyticsSection(onboardingPage),
                        new SettingsPage(onboardingPage, device),
                    );

                    console.log('[DEBUG] Starting completeOnboarding');
                    await onboarding.completeOnboarding();

                    console.log('[DEBUG] Closing onboarding page');
                    await onboardingPage.close();

                    console.log('[DEBUG] Checking service workers after onboarding page close');
                    console.log('[DEBUG] Service worker count:', context.serviceWorkers().length);

                    let serviceWorker = context.serviceWorkers()[0];
                    if (!serviceWorker) {
                        console.log(
                            '[DEBUG] No service worker found immediately, waiting for event...',
                        );
                        try {
                            serviceWorker = await context.waitForEvent('serviceworker', {
                                timeout: 10_000,
                            });
                            console.log('[DEBUG] Service worker found via event');
                        } catch (e) {
                            console.log('[DEBUG] Service worker wait event timed out:', e);
                            console.log(
                                '[DEBUG] All pages in context:',
                                context.pages().map(p => p.url()),
                            );
                            throw new Error(
                                `Connect Explorer webextension service worker not found. Service workers available: ${context.serviceWorkers().length}`,
                            );
                        }
                    } else {
                        console.log('[DEBUG] Service worker found immediately');
                    }

                    if (!serviceWorker) {
                        throw new Error('Connect Explorer webextension service worker not found');
                    }

                    console.log('[DEBUG] Service worker URL:', serviceWorker.url());
                    const extensionId = serviceWorker.url().split('/')[2];
                    console.log('[DEBUG] Extension ID:', extensionId);
                    const extensionUrl = `chrome-extension://${extensionId}/methods/bitcoin/getAddress/index.html?core-mode=suite-web`;
                    console.log('[DEBUG] Extension URL:', extensionUrl);

                    const popupPage = await context.newPage();
                    console.log('[DEBUG] Popup page created, navigating to extension');
                    await popupPage.goto(extensionUrl, { waitUntil: 'domcontentloaded' });
                    console.log('[DEBUG] Popup page navigated');

                    await popupPage.getByTestId('@api-playground/collapsible-box').click();
                    await expect(popupPage.getByTestId('@submit-button')).toBeVisible();
                    await popupPage.getByTestId('@submit-button').click();

                    // Wait for Suite popup to open
                    let suite: Page | undefined;

                    console.log(
                        '[DEBUG] All pages:',
                        context.pages().map(p => ({ url: p.url(), title: p.title() })),
                    );
                    const suitePages = context.pages().filter(p => p.url().includes(suiteWebUrl));
                    console.log('[DEBUG] Suite pages found:', suitePages.length);

                    if (suitePages.length === 0) {
                        // Wait for Suite page to open
                        console.log('[DEBUG] Waiting for new page with timeout 5000ms...');
                        suite = await context.waitForEvent('page', { timeout: 5000 });
                        console.log('[DEBUG] New page event received:', suite.url());
                    } else {
                        console.log('[DEBUG] Found existing Suite page:', suitePages[0].url());
                        suite = suitePages[0];
                    }

                    if (!suite) {
                        throw new Error('Suite popup page not found');
                    }

                    // Wait for Suite to load fully (already onboarded from earlier step)
                    await suite.waitForLoadState('domcontentloaded', { timeout: 10_000 });

                    // Wait for the modal to appear
                    const connectPermissionsModal = new ConnectPermissionsModal(suite);

                    await expect(connectPermissionsModal.appName).toHaveText(
                        'Trezor Connect Explorer',
                        {
                            timeout: 15_000,
                        },
                    );
                    connectPermissionsModal.confirmButton.click();

                    await expect(connectPermissionsModal.loadingHeader).toHaveText(
                        'Export Bitcoin address',
                    );
                    await suite.getByTestId('@connect-address-confirmation/confirm-button').click();

                    await expect(
                        suite.getByTestId('@connect-address-confirmation/verify-button/0'),
                    ).toBeDisabled();
                    await suite.waitForTimeout(1000);
                    await device.pressYes();

                    await expect(
                        suite.getByTestId('@connect-address-confirmation/verified-badge/0'),
                    ).toBeVisible();

                    await suite.getByTestId('@connect-address-confirmation/close-button').click();

                    const response = popupPage.getByTestId('@response');
                    await expect(response).toHaveText(/success: true/);
                } finally {
                    await context.close();
                }
            },
        );
    },
);
