import React from 'react';

import { getDaysToAddToPoolInitial } from '@suite-common/staking';
import { EarnFlow } from '@suite-common/suite-types/src/staking';
import { getNetworkDisplaySymbol } from '@suite-common/wallet-config';
import { selectPoolStatsApyData, selectValidatorsQueueData } from '@suite-common/wallet-core';
import { BulletList } from '@trezor/components';

import { useSelector } from 'src/hooks/suite';
import { CoinjoinRootState } from 'src/reducers/wallet/coinjoinReducer';

import { EarnInfoRow } from './EarnInfoRow';
import { buildEarnSupplyingInfoRows } from './earnSupplyingInfoRowsUtils';

interface EarnSupplyingInfoProps {
    isExpanded?: boolean;
    flow: EarnFlow;
}

export const EarnSupplyingInfo = ({ isExpanded, flow }: EarnSupplyingInfoProps) => {
    const { account } = useSelector((state: CoinjoinRootState) => state.wallet.selectedAccount);

    const validatorsQueue = useSelector(state => selectValidatorsQueueData(state, account?.symbol));

    const apy = useSelector(state => selectPoolStatsApyData(state, account));

    if (!account) return null;

    const daysToAddToPoolInitial = getDaysToAddToPoolInitial(validatorsQueue);
    const infoRows = buildEarnSupplyingInfoRows({
        flow,
        networkType: account.networkType,
        displaySymbol: getNetworkDisplaySymbol(account.symbol),
        daysToAddToPool: daysToAddToPoolInitial,
        apy,
    });

    return (
        <BulletList bulletGap={12} gap={16} bulletSize="small" titleGap={2}>
            {infoRows.map(({ heading, content, subheading }, index) => (
                <EarnInfoRow key={index} {...{ heading, subheading, content, isExpanded }} />
            ))}
        </BulletList>
    );
};
