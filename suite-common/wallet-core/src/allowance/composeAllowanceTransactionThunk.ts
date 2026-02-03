import { createThunk } from '@suite-common/redux-utils';
import { ETH_CONTRACT_CALL_BACKUP_GAS_LIMIT } from '@suite-common/wallet-constants';
import { Account, FeeInfo, FeeLevelLabel, PrecomposedLevels } from '@suite-common/wallet-types';
import { findToken, getAccountIdentity, isApprovalFlowSupported } from '@suite-common/wallet-utils';
import TrezorConnect from '@trezor/connect';
import { BigNumber } from '@trezor/utils';

import { ALLOWANCE_MODULE_PREFIX } from './allowanceConstants';
import { buildAllowanceTransaction } from './buildAllowanceTransaction';
import { selectSelectedDevice } from '../device/deviceSelectors';
import { ETHEREUM_ADJUST_GAS_LIMIT } from '../fees/feesUtils';
import { ComposeFeeLevelsError } from '../send/sendFormTypes';

export interface ComposeAllowanceTransactionThunkParams {
    feeInfo: FeeInfo;
    account: Account;
    contract: string;
    data: string;
    selectedFee?: FeeLevelLabel;
    customFee?: {
        feeLimit: string;
        feePerUnit: string;
        maxFeePerGas?: string;
        maxPriorityFeePerGas?: string;
    };
}

export const composeAllowanceTransactionThunk = createThunk<
    PrecomposedLevels,
    ComposeAllowanceTransactionThunkParams,
    { rejectValue: ComposeFeeLevelsError }
>(
    `${ALLOWANCE_MODULE_PREFIX}/composeAllowanceTransactionThunk`,
    async (
        { feeInfo, account, contract, selectedFee, customFee, data },
        { getState, rejectWithValue },
    ) => {
        const device = selectSelectedDevice(getState());

        if (!isApprovalFlowSupported(device)) {
            return rejectWithValue({
                error: 'fee-levels-compose-failed',
                message: 'Approval flow is not supported on the connected device.',
            });
        }

        const token = findToken(account.tokens, contract);

        if (!token) {
            return rejectWithValue({
                error: 'fee-levels-compose-failed',
                message: 'Token not found in account tokens.',
            });
        }

        const estimatedFee = await TrezorConnect.blockchainEstimateFee({
            coin: account.symbol,
            identity: getAccountIdentity(account),
            request: {
                blocks: [2],
                specific: {
                    from: account.descriptor,
                    to: contract,
                    value: '0x0',
                    data,
                },
            },
        });

        const estimatedGasLimit = estimatedFee.success
            ? new BigNumber(
                  estimatedFee.payload.levels[0].feeLimit || ETH_CONTRACT_CALL_BACKUP_GAS_LIMIT,
              )
            : new BigNumber(ETH_CONTRACT_CALL_BACKUP_GAS_LIMIT);

        const adjustedGasLimit = estimatedGasLimit
            .multipliedBy(ETHEREUM_ADJUST_GAS_LIMIT)
            .integerValue(BigNumber.ROUND_UP);

        const predefinedLevels = feeInfo.levels
            .filter(l => l.label !== 'custom')
            .map(l => ({ ...l, feeLimit: adjustedGasLimit.toFixed(0) }));

        if (selectedFee === 'custom' && customFee) {
            predefinedLevels.push({
                label: 'custom',
                feePerUnit: customFee.feePerUnit,
                feeLimit: customFee.feeLimit,
                maxFeePerGas: customFee.maxFeePerGas,
                maxPriorityFeePerGas: customFee.maxPriorityFeePerGas,
                blocks: -1,
            });
        }

        const levels: PrecomposedLevels = Object.fromEntries(
            predefinedLevels.map(level => [
                level.label,
                buildAllowanceTransaction(
                    account.availableBalance,
                    contract,
                    level,
                    token,
                    adjustedGasLimit.toFixed(0),
                ),
            ]),
        );

        return levels;
    },
);
