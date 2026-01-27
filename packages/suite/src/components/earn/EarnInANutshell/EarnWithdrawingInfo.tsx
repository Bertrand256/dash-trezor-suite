import React from 'react';

import { EarnFlow } from '@suite-common/suite-types/src/staking';
import { getNetworkDisplaySymbol } from '@suite-common/wallet-config';
import { selectValidatorsQueue } from '@suite-common/wallet-core';
import { getUnstakingPeriodInDays } from '@suite-common/wallet-utils';
import { BulletList } from '@trezor/components';

import { useSelector } from 'src/hooks/suite';
import { CoinjoinRootState } from 'src/reducers/wallet/coinjoinReducer';

import { EarnInfoRow } from './EarnInfoRow';
import { buildEarnWithdrawingInfoRows } from './earnWithdrawingInfoRowsUtils';

interface EarnWithdrawingInfoProps {
    isExpanded?: boolean;
    flow: EarnFlow;
}

export const EarnWithdrawingInfo = ({ isExpanded, flow }: EarnWithdrawingInfoProps) => {
    const { account } = useSelector((state: CoinjoinRootState) => state.wallet.selectedAccount);

    const { data } = useSelector(state => selectValidatorsQueue(state, account?.symbol)) || {};

    if (!account) return null;

    const daysToUnstake = getUnstakingPeriodInDays({
        networkType: account.networkType,
        validatorWithdrawTime: data?.validatorWithdrawTime,
        validatorExitTime: data?.validatorExitTime,
    });

    const displaySymbol = getNetworkDisplaySymbol(account.symbol);
    const visibleInfoRows = buildEarnWithdrawingInfoRows({
        flow,
        networkType: account.networkType,
        displaySymbol,
        daysToUnstake,
    });

    return (
        <BulletList bulletGap={12} gap={16} bulletSize="small" titleGap={4}>
            {visibleInfoRows.map((data, index) => (
                <EarnInfoRow key={index} isExpanded={isExpanded} {...data} />
            ))}
        </BulletList>
    );
};
