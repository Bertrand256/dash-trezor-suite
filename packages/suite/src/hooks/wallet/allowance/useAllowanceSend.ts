import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { Account, FormState, PrecomposedTransactionFinal } from '@suite-common/wallet-types';

import { signAndPushSendFormTransactionThunk } from 'src/actions/wallet/send/sendFormThunks';
import { useDispatch } from 'src/hooks/suite';

interface UseAllowanceSendParams {
    account: Account;
    methods: UseFormReturn<FormState>;
}

interface SendParams {
    composedTransaction: PrecomposedTransactionFinal;
}

export const useAllowanceSend = ({ account, methods }: UseAllowanceSendParams) => {
    const dispatch = useDispatch();

    const send = useCallback(
        async ({ composedTransaction }: SendParams): Promise<{ txid: string } | null> => {
            const formState: FormState = methods.getValues();

            const result = await dispatch(
                signAndPushSendFormTransactionThunk({
                    formState,
                    precomposedTransaction: composedTransaction,
                    selectedAccount: account,
                }),
            ).unwrap();

            if (!result) {
                return null;
            }

            const { payload } = result;

            if ('txid' in payload) {
                return { txid: payload.txid };
            }

            if ('error' in payload) {
                throw new Error(payload.error);
            }

            return null;
        },
        [methods, dispatch, account],
    );

    return { send };
};
