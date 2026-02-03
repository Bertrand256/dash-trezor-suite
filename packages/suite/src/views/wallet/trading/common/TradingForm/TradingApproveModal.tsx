import { useMemo } from 'react';

import { CryptoId } from 'invity-api';

import { getEvmApprovalTxData } from '@suite-common/wallet-utils';

import { ApproveModal } from 'src/components/suite/modals/ReduxModal/UserContextModal/AllowanceModals/ApproveModal';
import { useTradingFormContext } from 'src/hooks/wallet/trading/form/useTradingCommonForm';
import {
    getProvidersInfoProps,
    isTradingExchangeContext,
} from 'src/utils/wallet/trading/tradingTypingUtils';

interface TradingApproveModalProps {
    amount: string;
    cryptoId: CryptoId;
    setIsWaitingForDevice: (value: boolean) => void;
    onClose: (isSubmitting?: boolean) => void;
    onSubmit?: (txid: string) => void;
}

export const TradingApproveModal = ({
    amount,
    cryptoId,
    setIsWaitingForDevice,
    onClose,
    onSubmit,
}: TradingApproveModalProps) => {
    const context = useTradingFormContext();

    const approveParams = useMemo(() => {
        if (!isTradingExchangeContext(context)) {
            return null;
        }

        const providersInfo = getProvidersInfoProps(context);
        const exchange = context.selectedQuote?.exchange;
        const provider = exchange ? providersInfo?.[exchange] : null;

        const approvalData = getEvmApprovalTxData(context.selectedQuote?.dexTx?.data);
        const spender = approvalData?.spender ?? null;

        return {
            provider,
            spender,
        };
    }, [context]);

    const { provider, spender } = approveParams ?? {};

    if (!provider || !spender) return null;

    return (
        <ApproveModal
            amount={amount}
            cryptoId={cryptoId}
            account={context.account}
            provider={provider}
            spender={spender}
            setIsWaitingForDevice={setIsWaitingForDevice}
            onCancel={onClose}
            onSubmit={onSubmit}
        />
    );
};
