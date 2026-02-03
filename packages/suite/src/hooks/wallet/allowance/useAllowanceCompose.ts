import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { isFulfilled } from '@reduxjs/toolkit';

import { DEFAULT_PAYMENT, DEFAULT_VALUES } from '@suite-common/wallet-constants';
import {
    ComposeAllowanceTransactionThunkParams,
    composeAllowanceTransactionThunk,
    selectRawNetworkFeeInfo,
} from '@suite-common/wallet-core';
import { Account, FeeLevelLabel, FormState, PrecomposedLevels } from '@suite-common/wallet-types';
import {
    buildApprovalTransactionData,
    getConvertedOrDefaultFeeInfo,
} from '@suite-common/wallet-utils';
import { TokenInfo } from '@trezor/blockchain-link-types';
import { useDebounce } from '@trezor/react-utils';

import { useDispatch, useSelector } from 'src/hooks/suite';
import { useFees } from 'src/hooks/wallet/form/useFees';

interface UseAllowanceComposeParams {
    account: Account;
    contract: string;
    spender: string;
    amount: string;
    token?: TokenInfo;
}

export const useAllowanceCompose = ({
    account,
    contract,
    spender,
    amount,
    token,
}: UseAllowanceComposeParams) => {
    const dispatch = useDispatch();
    const debounce = useDebounce();

    const { networkType, symbol } = account;

    const rawFeeInfo = useSelector(state => selectRawNetworkFeeInfo(state, symbol));
    const feeInfo = useMemo(
        () => getConvertedOrDefaultFeeInfo({ networkType, feeInfo: rawFeeInfo }),
        [networkType, rawFeeInfo],
    );

    const methods = useForm<FormState>({
        mode: 'onChange',
        defaultValues: {
            ...DEFAULT_VALUES,
            outputs: [],
            options: ['broadcast'],
        },
    });

    const [isComposing, setIsComposing] = useState(false);
    const [composedLevels, setComposedLevels] = useState<PrecomposedLevels | undefined>(undefined);
    const composeRequestIdRef = useRef(0);
    const prevFeeInfoBlockHeightRef = useRef<number | null>(null);

    const data = useMemo(
        () => buildApprovalTransactionData({ amount, spender }),
        [amount, spender],
    );

    const composeRequest = useCallback(
        async (_field?: string) => {
            setComposedLevels(undefined);
            setIsComposing(true);

            composeRequestIdRef.current += 1;
            const currentRequestId = composeRequestIdRef.current;

            const formValues = methods.getValues();
            const feeLevel = (formValues.selectedFee ?? 'normal') as FeeLevelLabel;

            const customFee =
                feeLevel === 'custom'
                    ? {
                          feePerUnit: formValues.feePerUnit ?? '',
                          feeLimit: formValues.feeLimit ?? '',
                          maxFeePerGas: formValues.maxFeePerGas,
                          maxPriorityFeePerGas: formValues.maxPriorityFeePerGas,
                      }
                    : undefined;

            const thunkParams: ComposeAllowanceTransactionThunkParams = {
                feeInfo,
                account,
                contract,
                data,
                selectedFee: feeLevel,
                customFee,
            };

            const result = await debounce(() =>
                dispatch(composeAllowanceTransactionThunk(thunkParams)).then(res =>
                    isFulfilled(res) ? res.payload : undefined,
                ),
            );

            if (currentRequestId !== composeRequestIdRef.current) {
                setIsComposing(false);

                return;
            }

            setIsComposing(false);

            if (!result) {
                return;
            }

            const levels = result as PrecomposedLevels;
            setComposedLevels(levels);

            const selected = levels[feeLevel];
            if (selected?.type === 'final' && selected.estimatedFeeLimit) {
                methods.setValue('estimatedFeeLimit', selected.estimatedFeeLimit, {
                    shouldDirty: true,
                });
            }
        },
        [account, contract, data, debounce, dispatch, feeInfo, methods],
    );

    const onFeeLevelChange = useCallback(
        (prev?: string, current?: string) => {
            if (!current || !composedLevels) return;

            if (current === 'custom') {
                const prevLevel = composedLevels[prev || 'normal'];
                setComposedLevels({
                    ...composedLevels,
                    custom: prevLevel,
                });
            }
        },
        [composedLevels],
    );

    const { changeFeeLevel, selectedFee: formSelectedFee } = useFees({
        ...methods,
        defaultValue: 'normal',
        feeInfo,
        onChange: onFeeLevelChange,
        composeRequest,
        composedLevels,
    });
    const selectedFee = formSelectedFee ?? 'normal';

    const composedTransaction = useMemo(() => {
        if (!composedLevels) return undefined;

        const selected = composedLevels[selectedFee];

        return selected?.type === 'final' ? selected : undefined;
    }, [composedLevels, selectedFee]);

    useEffect(() => {
        methods.setValue('transactionData', data, { shouldDirty: true });
        methods.setValue(
            'outputs',
            [
                {
                    ...DEFAULT_PAYMENT,
                    address: contract,
                    amount: '0',
                    token: token?.contract ?? null,
                },
            ],
            { shouldDirty: true },
        );
    }, [contract, data, methods, token?.contract]);

    useEffect(() => {
        if (prevFeeInfoBlockHeightRef.current === null) {
            prevFeeInfoBlockHeightRef.current = feeInfo.blockHeight;

            return;
        }

        if (feeInfo.blockHeight > prevFeeInfoBlockHeightRef.current && composedLevels) {
            prevFeeInfoBlockHeightRef.current = feeInfo.blockHeight;

            composeRequest();
        }
    }, [composeRequest, composedLevels, feeInfo.blockHeight]);

    return {
        data,
        feeInfo,
        isComposing,
        composedLevels,
        composedTransaction,
        selectedFee,
        composeRequest,
        methods,
        changeFeeLevel,
    };
};
