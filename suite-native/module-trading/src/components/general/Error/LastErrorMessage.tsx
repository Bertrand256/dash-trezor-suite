import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    TradingRootState,
    TradingType,
    selectTradingLastErrorMessageByTradeType,
    tradingThunks,
} from '@suite-common/trading';

import { GeneralAlert } from '../GeneralAlert';

export type LastErrorMessageProps = {
    tradingType: TradingType;
};

export const LastErrorMessage = ({ tradingType }: LastErrorMessageProps) => {
    const dispatch = useDispatch();

    const lastErrorMessage = useSelector((state: TradingRootState) =>
        selectTradingLastErrorMessageByTradeType(state, tradingType),
    );

    useEffect(
        () => () => {
            dispatch(
                tradingThunks.setLastErrorMessageByTradingType({
                    tradingType,
                    errorMessage: undefined,
                }),
            );
        },
        [tradingType, dispatch],
    );

    return <GeneralAlert text={lastErrorMessage} />;
};
