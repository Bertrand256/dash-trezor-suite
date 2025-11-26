import { expect, test } from '../../support/fixtures';

test.describe('safety_checks Warnings', { tag: ['@group=suite'] }, () => {
    test.beforeEach(async ({ onboardingPage, settingsPage }) => {
        await onboardingPage.completeOnboarding();
        await settingsPage.changeSafetyChecksLevel('prompt');
    });

    test('Dismissible warning appears when safety_checks to prompt', async ({
        page,
        dashboardPage,
    }) => {
        await dashboardPage.suiteBannersContainer.click();
        await expect(page.getByTestId('@banner/safety-checks/button')).toBeVisible();
        await expect(page.getByTestId('@banner/safety-checks/dismiss')).toBeVisible();
    });

    test('CTA button opens device settings when safety_checks to prompt', async ({
        page,
        settingsPage,
        dashboardPage,
    }) => {
        await dashboardPage.suiteBannersContainer.click();
        await page.getByTestId('@banner/safety-checks/button').click();
        await expect(settingsPage.settingsHeader).toBeVisible();
    });

    test('Dismiss button hides the warning when safety_checks to prompt', async ({
        page,
        dashboardPage,
    }) => {
        await dashboardPage.suiteBannersContainer.click();
        await page.getByTestId('@banner/safety-checks/dismiss').click();
        await expect(page.getByTestId('@banner/safety-checks/button')).toBeHidden();
    });

    test('Warning disappears when safety_checks are set to strict from prompt', async ({
        page,
        settingsPage,
    }) => {
        await settingsPage.changeSafetyChecksLevel('strict');

        await expect(page.getByTestId('@banner/safety-checks/button')).toBeHidden();
    });

    test('Dismissed warning re-appears when safety_checks are set to strict and then to Prompt again', async ({
        page,
        settingsPage,
        dashboardPage,
    }) => {
        await settingsPage.changeSafetyChecksLevel('strict');

        await expect(page.getByTestId('@banner/safety-checks/button')).toBeHidden();
        // Set safety_checks back to PromptTemporarily
        await settingsPage.changeSafetyChecksLevel('prompt');

        // Assert the warning appears again.
        await dashboardPage.suiteBannersContainer.click();
        await expect(page.getByTestId('@banner/safety-checks/button')).toBeVisible();
    });
});
