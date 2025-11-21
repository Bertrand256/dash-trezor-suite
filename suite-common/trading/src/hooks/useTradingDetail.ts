import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import type { TradingType } from '@suite-common/suite-types';

import { useSelector } from './useSelector';
import { selectTradingDetailData } from '../selectors/tradingSelectors';
import { tradingThunks } from '../thunks';
import type {
    TradingTradeInfoMapProps,
    TradingTradeTransactionMapProps,
    TradingUseDetailOutputProps,
    TradingUseDetailProps,
} from '../types/tradingDetail';

export const useTradingDetailData = <T extends TradingType>(
    tradeType: TradingType,
): Omit<TradingUseDetailOutputProps<T>, 'account'> => {
    const { info, transactionId, trade } = useSelector(state =>
        selectTradingDetailData(state, tradeType),
    ) as {
        info: TradingTradeInfoMapProps[T] | undefined;
        transactionId: string | undefined;
        trade: TradingTradeTransactionMapProps[T] | undefined;
    };
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(tradingThunks.loadInitialDataThunk({ activeSection: tradeType }));
    }, [dispatch, tradeType]);

    return {
        trade,
        transactionId,
        info,
    };
};

export const useTradingDetail = <T extends TradingType>({
    selectedAccount,
    tradeType,
}: TradingUseDetailProps): TradingUseDetailOutputProps<T> => {
    const { account } = selectedAccount;
    const { info, transactionId, trade } = useTradingDetailData(tradeType);

    return {
        account,
        info: info as TradingTradeInfoMapProps[T] | undefined,
        transactionId,
        trade: trade as TradingTradeTransactionMapProps[T] | undefined,
    };
};
