import { createContext, useContext } from 'react';

import {
    type TradingType,
    type TradingUseDetailOutputProps,
    type TradingUseDetailProps,
    useTradingDetail as useTradingDetailCommon,
} from '@suite-common/trading';

import { useServerEnvironment } from 'src/hooks/wallet/trading/useServerEnviroment';
import { useTradingWatchTrade } from 'src/hooks/wallet/trading/useTradingWatchTrade';
import type { TradingDetailContextValues } from 'src/types/trading/tradingDetail';

/**
 * Suite-specific wrapper around the common useTradingDetail hook
 * Adds platform-specific functionality like server environment setup and trade watching
 */
export const useTradingDetail = <T extends TradingType>(
    props: TradingUseDetailProps & { tradeType: T },
): TradingUseDetailOutputProps<T> => {
    const result = useTradingDetailCommon<T>(props);

    // Setup server environment from suite settings
    useServerEnvironment();

    // Watch for trade updates
    useTradingWatchTrade({ account: result.account, trade: result.trade });

    return result;
};

export const TradingDetailContext = createContext<TradingDetailContextValues<any> | null>(null);
TradingDetailContext.displayName = 'TradingDetailContext';

export const useTradingDetailContext = <T extends TradingType>() => {
    const context = useContext<TradingDetailContextValues<T> | null>(TradingDetailContext);
    if (context === null) throw Error('TradingDetailContext used without Context');

    return context;
};
