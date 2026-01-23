import { NetworkSymbol } from '@suite-common/wallet-config';
import { TestCategory, TestPriority, TestStream, createTestAnnotation } from '@trezor/e2e-utils';

import { isDesktopProject } from '../../support/common';
import { expect, test } from '../../support/fixtures';
import { PromoBannerType } from '../../support/pageObjects/dashboardPage';
import {
    CLIENT_METADATA,
    CONNECT_PARAMS,
    generateWalletConnectLink,
} from '../../support/walletConnectLinkGen';

test.describe('Analytics Events', { tag: ['@T3T1', '@smoke'] }, () => {
    test.beforeEach(async ({ onboardingPage, settingsPage }) => {
        await onboardingPage.completeOnboarding();
        await settingsPage.changeNetworks({
            enableNetworks: ['eth', 'ada'],
        });
    });

    // --- Staking Navigation Events ---
    const coins: NetworkSymbol[] = ['eth', 'ada'];
    const STAKING_EVENT = 'staking/navigate';

    for (const coin of coins) {
        test(
            `Should log the event ${STAKING_EVENT} - ${coin.toUpperCase()} from account menu`,
            {
                annotation: createTestAnnotation({
                    testCase: `Verify that the ${STAKING_EVENT} event is logged for ${coin.toUpperCase()} when navigating from the account menu`,
                    category: TestCategory.General,
                    priority: TestPriority.Medium,
                    stream: TestStream.Foundation,
                }),
            },
            async ({ analyticsSection, walletPage }) => {
                await walletPage.openAccount({ symbol: coin });

                // Set up listeners
                const analyticsPromise = analyticsSection.waitForAnalytics({
                    c_type: STAKING_EVENT,
                    networkSymbol: coin,
                });

                // Perform the action
                await walletPage.stakingButton.click();

                // Await the listeners
                const payload = await analyticsPromise;

                expect(payload).toMatchObject({ c_type: STAKING_EVENT, networkSymbol: coin });
            },
        );

        test(
            `Should log ${STAKING_EVENT} - ${coin.toUpperCase()} from dashboard assets`,
            {
                annotation: createTestAnnotation({
                    testCase: `Verify that the ${STAKING_EVENT} event is logged for ${coin.toUpperCase()} when navigating from the dashboard`,
                    category: TestCategory.General,
                    priority: TestPriority.Medium,
                    stream: TestStream.Foundation,
                }),
            },
            async ({ analyticsSection, dashboardPage }) => {
                await dashboardPage.navigateTo();

                // Set up listeners
                const analyticsPromise = analyticsSection.waitForAnalytics({
                    c_type: STAKING_EVENT,
                    networkSymbol: coin,
                });

                // Perform the actin
                await dashboardPage.stakeButton(coin).click();

                // Await the listeners
                const payload = await analyticsPromise;

                expect(payload).toMatchObject({ c_type: STAKING_EVENT, networkSymbol: coin });
            },
        );
    }

    // --- Promo Banner Events ---
    const bannerTypes: PromoBannerType[] = ['tex', 'ts7'];
    const PROMO_EVENT = 'promo/dashboard-banner';

    for (const bannerType of bannerTypes) {
        test(
            `Should log ${PROMO_EVENT} - ${bannerType.toLocaleUpperCase()} from dashboard promo banner`,
            {
                annotation: createTestAnnotation({
                    testCase: `Verify that the ${PROMO_EVENT} event is logged for ${bannerType.toUpperCase()} when navigating from the dashboard promo banner`,
                    category: TestCategory.General,
                    priority: TestPriority.Medium,
                    stream: TestStream.Foundation,
                }),
            },
            async ({ analyticsSection, dashboardPage, settingsPage, page, target }) => {
                await test.step('Add dashboard promo banner', async () => {
                    await settingsPage.toggleDebugModeInSettings();
                    await settingsPage.navigateTo('debug');
                    await settingsPage.debugTab.addBanner(bannerType);
                });

                await test.step(`Trigger & verify ${PROMO_EVENT} - ${bannerType.toUpperCase()}`, async () => {
                    await dashboardPage.navigateTo();

                    /**
                     * Set up listener
                     *
                     * analyticsPromise - wait for the analytics event
                     */
                    const analyticsPromise = analyticsSection.waitForAnalytics({
                        c_type: PROMO_EVENT,
                        bannerType,
                    });

                    let payload: any;

                    if (isDesktopProject(target)) {
                        // Perform the action
                        await dashboardPage.promoBannerButton(bannerType).click();

                        // Await the listeners
                        payload = await analyticsPromise;
                    } else {
                        /**
                         * Set up listener
                         *
                         * pagePromise - wait for new page being opened by open the link from the banner
                         */
                        const pagePromise = page.context().waitForEvent('page');
                        // Perform the action
                        await dashboardPage.promoBannerButton(bannerType).click();

                        // Await the listeners
                        let newPage: any;
                        [payload, newPage] = await Promise.all([analyticsPromise, pagePromise]);

                        await newPage.close();
                    }

                    expect(payload).toMatchObject({ c_type: PROMO_EVENT, bannerType });
                });
            },
        );
    }
});

test.describe('Analytics Events', { tag: ['@T3W1'] }, () => {
    let wcUri: string;

    test.beforeEach(async ({ onboardingPage, settingsPage }) => {
        await test.step('Generate WalletConnect URI', async () => {
            const result = await generateWalletConnectLink(CLIENT_METADATA, CONNECT_PARAMS);
            wcUri = result.uri;
        });
        await test.step('Onboarding', async () => {
            await onboardingPage.completeOnboarding();
            await settingsPage.changeNetworks({
                enableNetworks: ['eth', 'ada'],
            });
        });
    });

    test(
        `Should log 'wallet-connect/init' when loading Suite`,
        {
            annotation: createTestAnnotation({
                testCase: `Verify that the 'wallet-connect/init' event is triggered automatically when the application starts`,
                category: TestCategory.General,
                priority: TestPriority.Medium,
                stream: TestStream.Foundation,
            }),
        },
        async ({ analyticsSection, page }) => {
            const WALLECT_CONNECT_INIT = 'wallet-connect/init';

            // Set up listeners
            const analyticsPromise = analyticsSection.waitForAnalytics({
                c_type: WALLECT_CONNECT_INIT,
            });

            // Perform the action
            await page.reload();

            // Await the listeners
            const payload = await analyticsPromise;

            expect(payload).toMatchObject({ c_type: WALLECT_CONNECT_INIT });
        },
    );

    test(
        `Should log 'wallet-connect/proposal-approved' when approving connection`,
        {
            annotation: createTestAnnotation({
                testCase:
                    "Verify that 'wallet-connect/proposal-approved' and related events are logged when the user confirms a WalletConnect proposal",
                category: TestCategory.General,
                priority: TestPriority.Medium,
                stream: TestStream.Foundation,
            }),
        },
        async ({ settingsPage, analyticsSection }) => {
            const EXPECTED_WC_EVENTS = [
                'wallet-connect/paired',
                'wallet-connect/proposal',
                'wallet-connect/proposal-approved',
            ];

            // Set up listeners
            const analyticsPromise = analyticsSection.waitForMultipleAnalytics(EXPECTED_WC_EVENTS);

            await test.step('Add connection', async () => {
                await settingsPage.navigateTo('connect');
                await settingsPage.walletConnectTab.addConnection(wcUri);
            });

            await test.step('Approve proposal & verify payloads', async () => {
                // Perform the action
                await settingsPage.walletConnectTab.approveProposal(0);
                // Await the listeners
                const payloads = await analyticsPromise;

                expect(payloads.map(p => p.c_type).sort()).toEqual([...EXPECTED_WC_EVENTS].sort());
            });
        },
    );

    test(
        "Should log 'wallet-connect/proposal-rejected' when cancelling connection",
        {
            annotation: createTestAnnotation({
                testCase:
                    "Verify that 'wallet-connect/proposal-rejected' is logged when the user cancel a WalletConnect proposal",
                category: TestCategory.General,
                priority: TestPriority.Medium,
                stream: TestStream.Foundation,
            }),
        },
        async ({ settingsPage, analyticsSection }) => {
            const EXPECTED_WC_EVENTS = [
                'wallet-connect/paired',
                'wallet-connect/proposal',
                'wallet-connect/proposal-rejected',
            ];

            // Set up listeners
            const analyticsPromise = analyticsSection.waitForMultipleAnalytics(EXPECTED_WC_EVENTS);

            await test.step('Add connection', async () => {
                await settingsPage.navigateTo('connect');
                await settingsPage.walletConnectTab.addConnection(wcUri);
            });

            await test.step('Approve proposal & verify payloads', async () => {
                // Perform the action
                await settingsPage.walletConnectTab.rejectProposal();
                // Await the listeners
                const payloads = await analyticsPromise;

                expect(payloads.map(p => p.c_type).sort()).toEqual([...EXPECTED_WC_EVENTS].sort());
            });
        },
    );
});
