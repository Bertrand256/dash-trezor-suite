import type { SellCryptoPaymentMethod, SellFiatTrade } from 'invity-api';

import type { UseFormReturn } from '@suite-native/forms';

import type {
    BaseFormValues,
    FormWithFiatCurrencyValues,
    FormWithSendAccountValues,
} from './general';

export type ExtendedSellCryptoPaymentMethod = SellCryptoPaymentMethod | string;

export type SellFormValues = BaseFormValues<
    'cryptoStringAmount' | 'fiatStringAmount',
    SellFiatTrade
> &
    FormWithSendAccountValues &
    FormWithFiatCurrencyValues;

export type SellFormType = UseFormReturn<SellFormValues>;
