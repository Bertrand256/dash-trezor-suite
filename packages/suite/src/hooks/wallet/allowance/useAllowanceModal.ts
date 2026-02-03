import { useCallback, useEffect, useState } from 'react';

import { CryptoId, DexApprovalType } from 'invity-api';

import { parseCryptoId } from '@suite-common/trading';
import { Account } from '@suite-common/wallet-types';
import { asAmountSubunit, findToken, getAllowanceAmount } from '@suite-common/wallet-utils';
import { BigNumber } from '@trezor/utils';

import { useAllowanceCompose } from './useAllowanceCompose';
import { AllowanceType } from './useAllowanceContext';
import { useAllowanceSend } from './useAllowanceSend';

interface UseAllowanceModalProps {
    type: AllowanceType;
    amount: string;
    cryptoId: CryptoId;
    account: Account;
    spender: string;
    onSelectApprovalType?: (type: DexApprovalType) => void;
    setIsWaitingForDevice: (value: boolean) => void;
    onCancel: (isSubmitting?: boolean) => void;
    onSubmit?: (txid: string) => void;
}

export const useAllowanceModal = ({
    type,
    amount: rawAmount,
    cryptoId,
    account,
    spender,
    onSelectApprovalType,
    setIsWaitingForDevice,
    onCancel,
    onSubmit,
}: UseAllowanceModalProps) => {
    const [approvalType, setApprovalType] = useState<DexApprovalType>(
        type === 'REVOKE' ? 'ZERO' : 'MINIMAL',
    );

    const { contractAddress: contract = '' } = parseCryptoId(cryptoId);
    const token = findToken(account.tokens, contract);

    const { inputAmount = asAmountSubunit(new BigNumber(0)), allowanceAmount = '0' } = token
        ? getAllowanceAmount({ rawAmount, approvalType, token })
        : {};

    const {
        data,
        feeInfo,
        isComposing,
        composedLevels,
        composedTransaction,
        selectedFee,
        composeRequest,
        methods,
        changeFeeLevel,
    } = useAllowanceCompose({
        account,
        amount: allowanceAmount,
        contract,
        spender,
        token,
    });

    const { send } = useAllowanceSend({
        account,
        methods,
    });

    useEffect(() => {
        composeRequest();
    }, [composeRequest, allowanceAmount]);

    const selectApprovalType = useCallback(
        (type: DexApprovalType) => {
            setApprovalType(type);
            onSelectApprovalType?.(type);
        },
        [onSelectApprovalType],
    );

    const confirmAndSend = useCallback(async () => {
        if (!composedTransaction) return;

        onCancel(true);
        setIsWaitingForDevice(true);

        try {
            const result = await send({ composedTransaction });

            if (result?.txid) {
                onSubmit?.(result.txid);
            }
        } finally {
            setIsWaitingForDevice(false);
        }
    }, [composedTransaction, send, setIsWaitingForDevice, onSubmit, onCancel]);

    const handleClose = useCallback(() => {
        onCancel();
    }, [onCancel]);

    return {
        approvalType,
        isLoading: isComposing,
        allowanceAmount,
        inputAmount,
        token,
        feeInfo,
        composedLevels,
        composedTransaction,
        selectedFee,
        data,
        methods,
        selectApprovalType,
        confirmAndSend,
        handleClose,
        handleFeeChange: changeFeeLevel,
    };
};
