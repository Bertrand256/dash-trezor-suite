import { type ReactNode } from 'react';

import { Translation } from '@suite/intl';
import { EarnFlow } from '@suite-common/suite-types/src/staking';
import { NetworkType, StakingNetworkType } from '@suite-common/wallet-config';
import {
    CARDANO_ACTIVATION_PERIOD_DAYS,
    CARDANO_EPOCH_DAYS,
    SOLANA_EPOCH_DAYS,
} from '@suite-common/wallet-constants';
import { isStakingNetworkType } from '@suite-common/wallet-utils';
import { exhaustive } from '@trezor/type-utils';

import { formatApyValue } from 'src/views/wallet/staking/utils/formatStakeValues';

type EarnInfoRowData = {
    heading: ReactNode;
    subheading?: ReactNode;
    content?: {
        text: ReactNode;
        isBadge?: boolean;
    };
};

type EarnSupplyingContext = {
    flow: EarnFlow;
    networkType: NetworkType;
    displaySymbol: string;
    daysToAddToPool?: number;
    apy: number | null;
};

type StakingSupplyingContext = Omit<EarnSupplyingContext, 'networkType'> & {
    networkType: StakingNetworkType;
};

const buildSupplyingSignRow = ({ flow }: EarnSupplyingContext): EarnInfoRowData => ({
    heading: (
        <Translation
            id={
                flow === EarnFlow.Yield
                    ? 'TR_EARN_SIGN_WITHDRAWAL_TRANSACTION'
                    : 'TR_EARN_SIGN_STAKING_TRANSACTION'
            }
        />
    ),
    content: { text: <Translation id="TR_TRADING_NETWORK_FEE" />, isBadge: true },
});

const buildSupplyingRewardsPeriodRow = ({
    flow,
    networkType,
    displaySymbol,
    daysToAddToPool,
}: StakingSupplyingContext): EarnInfoRowData => {
    switch (networkType) {
        case 'ethereum':
            return {
                heading: <Translation id="TR_EARN_ENTER_THE_STAKING_POOL" />,
                subheading: (
                    <Translation
                        id="TR_EARN_STAKING_GETTING_READY"
                        values={{ networkDisplaySymbol: displaySymbol }}
                    />
                ),
                content: {
                    text: (
                        <Translation
                            id="TR_EARN_APPROXIMATE_DAYS"
                            values={{ count: daysToAddToPool }}
                        />
                    ),
                },
            };
        case 'solana':
            return {
                heading: <Translation id="TR_EARN_WARM_UP_PERIOD" />,
                subheading: (
                    <Translation
                        id="TR_EARN_STAKE_WAIT_FOR_ACTIVATION"
                        values={{ networkDisplaySymbol: displaySymbol }}
                    />
                ),
                content: {
                    text: <Translation id="TR_UP_TO_DAYS" values={{ count: SOLANA_EPOCH_DAYS }} />,
                },
            };
        case 'cardano':
            return {
                heading: (
                    <Translation
                        id={
                            flow === EarnFlow.UpdateProvider
                                ? 'TR_EARN_KEEP_EARNING_REWARDS_WITH_CURRENT_PROVIDER'
                                : 'TR_EARN_ENTER_ACTIVATION_PERIOD'
                        }
                        values={{ days: CARDANO_ACTIVATION_PERIOD_DAYS }}
                    />
                ),
                subheading: <Translation id="TR_EARN_TIME_TO_START_EARNING" />,
                content: {
                    text: (
                        <Translation
                            id="TR_EARN_APPROXIMATE_DAYS"
                            values={{ count: CARDANO_ACTIVATION_PERIOD_DAYS }}
                        />
                    ),
                },
            };
        default:
            return exhaustive(networkType);
    }
};

const buildSupplyingRewardsEarningRow = ({
    flow,
    networkType,
    apy,
}: StakingSupplyingContext): EarnInfoRowData => {
    const heading = (() => {
        switch (networkType) {
            case 'ethereum':
                return <Translation id="TR_EARN_REWARDS_WEEKLY" />;
            case 'solana':
                return (
                    <Translation id="TR_EARN_REWARDS_EVERY" values={{ days: SOLANA_EPOCH_DAYS }} />
                );
            case 'cardano':
                return (
                    <Translation
                        id={
                            flow === EarnFlow.UpdateProvider
                                ? 'TR_EARN_START_EARNING_FROM_NEW_PROVIDER'
                                : 'TR_EARN_REWARDS_EVERY'
                        }
                        values={{ days: CARDANO_EPOCH_DAYS }}
                    />
                );
            default:
                return exhaustive(networkType);
        }
    })();

    return {
        heading,
        subheading: <Translation id="TR_EARN_REWARDS_ARE_RESTAKED" />,
        content: {
            text: (
                <Translation id="TR_EARN_APY_APPROX" values={{ apyPercent: formatApyValue(apy) }} />
            ),
        },
    };
};

export const buildEarnSupplyingInfoRows = (context: EarnSupplyingContext): EarnInfoRowData[] => {
    if (!isStakingNetworkType(context.networkType)) return [];

    const stakingContext: StakingSupplyingContext = {
        ...context,
        networkType: context.networkType,
    };

    switch (stakingContext.flow) {
        case EarnFlow.Stake:
        case EarnFlow.Yield:
            switch (stakingContext.networkType) {
                case 'ethereum':
                case 'solana':
                case 'cardano':
                    return [
                        buildSupplyingSignRow(stakingContext),
                        buildSupplyingRewardsPeriodRow(stakingContext),
                        buildSupplyingRewardsEarningRow(stakingContext),
                    ];
                default:
                    return exhaustive(stakingContext.networkType);
            }
        case EarnFlow.UpdateProvider:
            switch (stakingContext.networkType) {
                case 'ethereum':
                case 'solana':
                case 'cardano':
                    return [
                        buildSupplyingSignRow(stakingContext),
                        buildSupplyingRewardsPeriodRow(stakingContext),
                        buildSupplyingRewardsEarningRow(stakingContext),
                    ];
                default:
                    return exhaustive(stakingContext.networkType);
            }
        default:
            return exhaustive(stakingContext.flow);
    }
};
