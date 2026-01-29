import { TestCategory, TestPriority, TestStream } from '@trezor/e2e-utils';

import { test } from '../../../support/fixtures';
import { createTestAnnotation } from '../../../support/reporters/annotations';

test.describe.skip('Cross-chain CEX Swap', { tag: ['@group=manual'] }, () => {
    test(
        'Swap BTC -> ETH (Non-EVM <-> EVM)',
        {
            annotation: createTestAnnotation({
                testCase: 'Verifies cross-chain CEX swap from Bitcoin to Ethereum.',
                prerequisites: ['Seeded Trezor device', 'Trezor Suite with a funded BTC wallet'],
                steps: [
                    'Navigate to the "Accounts"',
                    'Select "Bitcoin"',
                    'Click on "Swap" tab',
                    'Select "Swap"',
                    'Select "To" asset: ETH (Ethereum)',
                    'Verify CEX offers are displayed (e.g., ChangeNOW, Changelly)',
                    'Select a CEX offer',
                    'Proceed with the swap flow',
                ],
                category: TestCategory.Swap,
                priority: TestPriority.Medium,
                stream: TestStream.Trade,
            }),
        },
        async () => {},
    );

    test(
        'Swap ADA -> XRP (Non-EVM <-> Non-EVM)',
        {
            annotation: createTestAnnotation({
                testCase: 'Verifies cross-chain CEX swap from Cardano to XRP.',
                prerequisites: ['Seeded Trezor device', 'Trezor Suite with a funded ADA wallet'],
                steps: [
                    'Navigate to the "Accounts"',
                    'Select "Cardano"',
                    'Click on "Swap" tab',
                    'Select "Swap"',
                    'Select "To" asset: XRP (Ripple)',
                    'Verify CEX offers are displayed',
                    'Select a CEX offer',
                    'Proceed with the swap flow',
                ],
                category: TestCategory.Swap,
                priority: TestPriority.Medium,
                stream: TestStream.Trade,
            }),
        },
        async () => {},
    );

    test(
        'Swap LTC -> XLM (Non-EVM <-> Non-EVM)',
        {
            annotation: createTestAnnotation({
                testCase: 'Verifies cross-chain CEX swap from Litecoin to XLM.',
                prerequisites: ['Seeded Trezor device', 'Trezor Suite with a funded LTC wallet'],
                steps: [
                    'Navigate to the "Accounts"',
                    'Select "Litecoin"',
                    'Click on "Swap" tab',
                    'Select "Swap"',
                    'Select "To" asset: XLM (Stellar)',
                    'Verify CEX offers are displayed',
                    'Select a CEX offer',
                    'Proceed with the swap flow',
                ],
                category: TestCategory.Swap,
                priority: TestPriority.Medium,
                stream: TestStream.Trade,
            }),
        },
        async () => {},
    );
});
