import { test } from '../support/fixtures';

test.use({ startEmulator: false });
test.describe('Start electron without emulator', { tag: ['@group=suite'] }, () => {
    test('Start electron without emulator', async ({ onboardingPage }) => {
        await onboardingPage.verifySuiteIsLoaded();
    });
});
