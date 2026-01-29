import { TestCategory, TestPriority, TestStream } from '@trezor/e2e-utils';

import { test } from '../../../support/fixtures';
import { createTestAnnotation } from '../../../support/reporters/annotations';

test.describe.skip('Trading form inputs', { tag: ['@group=manual'] }, () => {
    test(
        'Buy form inputs validation',
        {
            annotation: createTestAnnotation({
                testCase: 'Verifies robustness of the Buy form inputs.',
                prerequisites: ['Seeded Trezor device', 'Trezor Suite with a wallet connected'],
                steps: [
                    'Navigate to the "Accounts"',
                    'Select "Bitcoin" (or any other coin)',
                    'Click on "Swap" tab',
                    'Verify "Trade history" button is present',
                    'Select "Buy"',
                    'Try entering values below minimum limits -> verify error message',
                    'Try entering values above maximum limits -> verify error message',
                    'Toggle Fiat/Crypto amount input -> verify conversion updates',
                    'Switch asset to buy -> verify form resets/updates',
                ],
                category: TestCategory.Buy,
                priority: TestPriority.Medium,
                stream: TestStream.Trade,
            }),
        },
        async () => {},
    );

    test(
        'Sell form inputs validation',
        {
            annotation: createTestAnnotation({
                testCase: 'Verifies robustness of the Sell form inputs.',
                prerequisites: ['Seeded Trezor device', 'Trezor Suite with a funded wallet'],
                steps: [
                    'Navigate to the "Accounts"',
                    'Select "Bitcoin" (or any other coin)',
                    'Click on "Swap" tab',
                    'Verify "Trade history" button is present',
                    'Select "Sell"',
                    'Try entering values exceeding balance -> verify error message',
                    'Use "Fraction buttons" (25%, 50%, etc.) -> verify amount updates',
                    'Toggle Fiat/Crypto amount input',
                    'Select different Fee levels -> verify total updates',
                ],
                category: TestCategory.Sell,
                priority: TestPriority.Medium,
                stream: TestStream.Trade,
            }),
        },
        async () => {},
    );

    test(
        'Exchange form inputs validation',
        {
            annotation: createTestAnnotation({
                testCase: 'Verifies robustness of the Exchange form inputs.',
                prerequisites: [
                    'Seeded Trezor device',
                    'Trezor Suite with a funded wallet',
                    'Coin availability for exchange',
                ],
                steps: [
                    'Navigate to the "Accounts"',
                    'Select "Bitcoin" (or any other coin)',
                    'Click on "Swap" tab',
                    'Verify "Trade history" button is present',
                    'Select "Exchange"',
                    'Select different "To" asset',
                    'Verify rate estimation updates',
                    'Use "Fraction buttons" (10%, 25%, 50%, Max)',
                    'Try entering values exceeding balance -> verify error message',
                ],
                category: TestCategory.Swap,
                priority: TestPriority.Medium,
                stream: TestStream.Trade,
            }),
        },
        async () => {},
    );
});
