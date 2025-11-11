import { ReactNode } from 'react';

import { Card, HStack, Text, VStack } from '@suite-native/atoms';
import { Translation } from '@suite-native/intl';
import { TradeInfoHeader, TradeInfoRow } from '@suite-native/trading-atoms';
import type { ExtendedSellCryptoPaymentMethod } from '@suite-native/trading-types';

import { FiatCurrencyIcon } from '../FiatCurrencyIcon';

export type TradeFiatSideCardProps = {
    paymentMethod: ExtendedSellCryptoPaymentMethod;
    amount: ReactNode;
    title: ReactNode;
};

const getPaymentMethodTranslation = (paymentMethod: ExtendedSellCryptoPaymentMethod) => {
    switch (paymentMethod) {
        case 'bankTransfer':
            return (
                <Translation id="moduleTrading.tradingSellPreviewScreen.paymentMethods.bankTransfer" />
            );
        case 'creditCard':
            return (
                <Translation id="moduleTrading.tradingSellPreviewScreen.paymentMethods.creditCard" />
            );
        case 'sepa':
            return <Translation id="moduleTrading.tradingSellPreviewScreen.paymentMethods.sepa" />;
        case 'ach':
            return <Translation id="moduleTrading.tradingSellPreviewScreen.paymentMethods.ach" />;
        case 'skrill':
            return (
                <Translation id="moduleTrading.tradingSellPreviewScreen.paymentMethods.skrill" />
            );
        case 'neteller':
            return (
                <Translation id="moduleTrading.tradingSellPreviewScreen.paymentMethods.neteller" />
            );
        case 'payid':
            return <Translation id="moduleTrading.tradingSellPreviewScreen.paymentMethods.payid" />;
        case 'dcinterac':
            return (
                <Translation id="moduleTrading.tradingSellPreviewScreen.paymentMethods.dcinterac" />
            );
        case 'fasterPayment':
            return (
                <Translation id="moduleTrading.tradingSellPreviewScreen.paymentMethods.fasterPayment" />
            );
        default:
            // api can return even unknown payment methods
            return paymentMethod;
    }
};

export const TradeFiatSideCard = ({ paymentMethod, amount, title }: TradeFiatSideCardProps) => (
    <Card noPadding>
        <TradeInfoHeader title={title} />
        <TradeInfoRow>
            <Text variant="hint">{getPaymentMethodTranslation(paymentMethod)}</Text>
        </TradeInfoRow>

        <TradeInfoRow>
            <HStack alignItems="center">
                <FiatCurrencyIcon size="small" />
                <VStack spacing="sp2">{amount}</VStack>
            </HStack>
        </TradeInfoRow>
    </Card>
);
