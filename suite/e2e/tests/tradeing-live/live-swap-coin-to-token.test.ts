import { getCryptoId } from '@suite-common/trading';
import { localizeNumber } from '@suite-common/wallet-utils';

import { expect, test } from '../../support/fixtures';

const tenMinutes = 10 * 60 * 1000;
const sendAmount = '0.053329';
const usdcMint = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
const formattedSendAmount = `${localizeNumber(sendAmount)} SOL`;
const accountLabel = 'Solana #1';

// limiting number of runs due to fees onchain - by using specific models and FW tags
test.describe('Trading - Swap coin to token', { tag: ['@nightlyOnly', '@T3T1', '@T3W1'] }, () => {
    test.setTimeout(tenMinutes);
    test.use({
        deviceSetup: { mnemonic: 'mnemonic_academic', passphrase_protection: true },
    });
    test.beforeEach(async ({ onboardingPage, dashboardPage, walletPage, settingsPage }) => {
        await onboardingPage.completeOnboarding();
        await settingsPage.changeNetworks({
            enableNetworks: ['sol', 'base'],
            disableNetworks: ['btc'],
        });
        await dashboardPage.deviceSwitchingOpenButton.click();
        await dashboardPage.addHiddenWallet(process.env.PASSPHRASE_LIVE!);

        await walletPage.openSwapTrading({ symbol: 'sol', atIndex: 0 });
    });

    test('Swap Solana to USDC', async ({ tradingPage, page, devicePrompt }) => {
        await test.step('Fill in a Swap form', async () => {
            await tradingPage.fillSwapForm({
                amount: sendAmount,
                sellAsset: {
                    searchFilter: 'Solana',
                    networkSymbol: 'sol',
                    assetCryptoId: getCryptoId('sol'),
                },
                buyAsset: {
                    searchFilter: 'USDC',
                    networkFilter: 'base',
                    tokenSymbol: 'USDC',
                    networkSymbol: 'base',
                    assetCryptoId: getCryptoId('base', usdcMint),
                },

                selectReceiveAddress: async () => {
                    await tradingPage.selectSuiteReceiveAccount(0, 'base');
                },
            });
        });
        let receiveAmount: string;
        await test.step('Confirm the Swap trade', async () => {
            await expect(tradingPage.bestOfferAmount).toHaveText(/^\d+(\.\d+)?\s+USDC$/);
            const receiveAmountUnformated = (await tradingPage.bestOfferAmount.innerText()).split(
                ' ',
            )[0];
            receiveAmount = Number(receiveAmountUnformated).toFixed(8);
            await tradingPage.swapBestOfferButton.click();
            //await tradingPage.clickSwapBestOfferAndWaitForFees(); in case of solana fee instability use this
        });

        await test.step('Initiate send', async () => {
            await tradingPage.initiateSendConfirmation();
            await expect(devicePrompt.headerParagraph).toContainText(accountLabel);
            await expect(devicePrompt.outputValueOf('address')).toHaveText(
                /^[1-9A-HJ-NP-Za-km-z\s]{53,54}$/,
            ); // base58 with spaces/newlines

            await expect(devicePrompt.cryptoAmountWithSymbolOf('total')).toHaveText(
                formattedSendAmount,
            );
            await expect(devicePrompt.cryptoAmountOf('fee')).toHaveTextGreaterThan(0);
        });

        await test.step('Send crypto to provider', async () => {
            await devicePrompt.sendButton.click();

            await expect(page.getByTestId('@toast/tx-exchange')).toHaveTranslation(
                'TOAST_TX_EXCHANGE_BROADCASTED',
                {
                    values: {
                        sendAmount,
                        sendAsset: 'SOL',
                        sendAccount: accountLabel,
                        receiveAmount,
                        receiveAsset: 'USDC',
                        receiveAccount: 'Base #1',
                    },
                },
            );

            await expect(tradingPage.transactionDetailStatus).toHaveTranslation(
                'TR_EXCHANGE_DETAIL_SUCCESS_TITLE',
                { timeout: tenMinutes },
            );
            await expect(tradingPage.confirmationCryptoAmount.first()).toHaveText(
                formattedSendAmount,
            );
        });

        await test.step('Return to account swap form', async () => {
            await tradingPage.backToAccountButton('Swap').click();
            await expect(
                page.getByTestId('@trading/menu/wallet-trading-transactions'),
            ).toBeVisible();
        });
    });
    test.afterEach(async ({ tradingPage, devicePrompt, walletPage }) => {
        const usdcBalanceValue = await walletPage.getTokenBalance({
            symbol: 'base',
            atIndex: 0,
            tokenName: 'USD Coin',
        });
        if (usdcBalanceValue < 25) return;
        const lowerUsdcBalanceValue = usdcBalanceValue - 0.5;

        await walletPage.openSwapTrading({ symbol: 'base', atIndex: 0 });
        await test.step('Fill in a Swap form', async () => {
            await tradingPage.fillSwapForm({
                amount: lowerUsdcBalanceValue.toString(),
                sellAsset: {
                    searchFilter: 'USDC',
                    networkSymbol: 'base',
                    tokenSymbol: 'USDC',
                    assetCryptoId: getCryptoId('base', usdcMint),
                },
                buyAsset: {
                    searchFilter: 'Solana',
                    assetCryptoId: getCryptoId('sol'),
                },

                selectReceiveAddress: async () => {
                    await tradingPage.selectSuiteReceiveAccount(0, 'sol');
                },
            });
        });

        await test.step('Confirm the Swap trade', async () => {
            await expect(tradingPage.bestOfferAmount).toHaveText(/^\d+(\.\d+)?\s+SOL$/);
            await tradingPage.swapBestOfferButton.click();
        });

        await test.step('Initiate send', async () => {
            await tradingPage.initiateSendConfirmation();
        });

        await test.step('Send crypto to provider', async () => {
            await devicePrompt.sendButton.click();
        });
    });
});
