import { useMemo } from 'react';

import { CryptoId } from 'invity-api';

import { getEvmApprovalTxData } from '@suite-common/wallet-utils';

import { RevokeModal } from 'src/components/suite/modals/ReduxModal/UserContextModal/AllowanceModals/RevokeModal';
import { useTradingFormContext } from 'src/hooks/wallet/trading/form/useTradingCommonForm';
import {
    getProvidersInfoProps,
    isTradingExchangeContext,
} from 'src/utils/wallet/trading/tradingTypingUtils';

interface TradingRevokeModalProps {
    cryptoId: CryptoId;
    setIsWaitingForDevice: (value: boolean) => void;
    onClose: (isSubmitting?: boolean) => void;
    onSubmit?: (txid: string) => void;
}

export const TradingRevokeModal = ({
    cryptoId,
    setIsWaitingForDevice,
    onClose,
    onSubmit,
}: TradingRevokeModalProps) => {
    const context = useTradingFormContext();

    const revokeParams = useMemo(() => {
        if (!isTradingExchangeContext(context)) return null;

        const providersInfo = getProvidersInfoProps(context);
        const exchange = context.selectedQuote?.exchange;
        const provider = exchange ? providersInfo?.[exchange] : null;

        const dexTxData = context.selectedQuote?.dexTx?.data;
        const approvalData = getEvmApprovalTxData(dexTxData);
        const spender = approvalData?.spender ?? null;

        const preapprovedAmount = context.selectedQuote?.preapprovedStringAmount;

        return {
            provider,
            spender,
            preapprovedAmount,
        };
    }, [context]);

    const { provider, spender, preapprovedAmount } = revokeParams || {};

    if (!provider || !spender) return null;

    return (
        <RevokeModal
            cryptoId={cryptoId}
            account={context.account}
            provider={provider}
            spender={spender}
            preapprovedAmount={preapprovedAmount}
            setIsWaitingForDevice={setIsWaitingForDevice}
            onCancel={onClose}
            onSubmit={onSubmit}
        />
    );
};
