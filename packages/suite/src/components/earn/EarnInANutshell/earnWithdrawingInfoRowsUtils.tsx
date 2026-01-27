import { type ReactNode } from 'react';

import { Translation } from '@suite/intl';
import { EarnFlow } from '@suite-common/suite-types/src/staking';
import { NetworkType, StakingNetworkType } from '@suite-common/wallet-config';
import { SOLANA_EPOCH_DAYS } from '@suite-common/wallet-constants';
import { isStakingNetworkType } from '@suite-common/wallet-utils';
import { exhaustive } from '@trezor/type-utils';

type EarnInfoRowData = {
    heading: ReactNode;
    subheading?: ReactNode;
    content?: {
        text: ReactNode;
        isBadge?: boolean;
    };
};

type EarnWithdrawingContext = {
    flow: EarnFlow;
    networkType: NetworkType;
    displaySymbol: string;
    daysToUnstake?: number;
};

type StakingWithdrawingContext = Omit<EarnWithdrawingContext, 'networkType'> & {
    networkType: StakingNetworkType;
};

const buildWithdrawingSignRow = ({ flow }: EarnWithdrawingContext): EarnInfoRowData => ({
    heading: (
        <Translation
            id={
                flow === EarnFlow.Yield
                    ? 'TR_EARN_SIGN_WITHDRAWAL_TRANSACTION'
                    : 'TR_EARN_SIGN_UNSTAKING_TRANSACTION'
            }
        />
    ),
    content: {
        text: <Translation id="TR_TRADING_NETWORK_FEE" />,
        isBadge: true,
    },
});

const buildWithdrawingDeactivateRow = ({
    networkType,
    displaySymbol,
    daysToUnstake,
}: StakingWithdrawingContext): EarnInfoRowData => {
    switch (networkType) {
        case 'ethereum':
            return {
                heading: <Translation id="TR_EARN_LEAVE_STAKING_POOL" />,
                subheading: (
                    <Translation
                        id="TR_EARN_STAKING_CONSOLIDATING_FUNDS"
                        values={{ networkDisplaySymbol: displaySymbol }}
                    />
                ),
                content: {
                    text: (
                        <Translation
                            id="TR_EARN_APPROXIMATE_DAYS"
                            values={{ count: daysToUnstake }}
                        />
                    ),
                },
            };
        case 'solana':
            return {
                heading: <Translation id="TR_EARN_COOL_DOWN_PERIOD" />,
                subheading: (
                    <Translation
                        id="TR_EARN_STAKING_WAIT_FOR_DEACTIVATION"
                        values={{ networkDisplaySymbol: displaySymbol }}
                    />
                ),
                content: {
                    text: <Translation id="TR_UP_TO_DAYS" values={{ count: SOLANA_EPOCH_DAYS }} />,
                },
            };
        case 'cardano':
            return {
                heading: <Translation id="TR_EARN_RECEIVE_DEPOSIT_IN_ACCOUNT" />,
                subheading: (
                    <Translation
                        id="TR_EARN_YOUR_DEPOSIT_IS_RETURNED"
                        values={{ networkDisplaySymbol: displaySymbol }}
                    />
                ),
                content: {
                    text: <Translation id="TR_EARN_INSTANTLY" />,
                },
            };
        default:
            return exhaustive(networkType);
    }
};

const buildWithdrawingClaimRow = ({
    displaySymbol,
}: StakingWithdrawingContext): EarnInfoRowData => ({
    heading: (
        <Translation id="TR_EARN_CLAIM_UNSTAKED" values={{ networkDisplaySymbol: displaySymbol }} />
    ),
    subheading: (
        <Translation
            id="TR_EARN_YOUR_UNSTAKED_FUNDS"
            values={{ networkDisplaySymbol: displaySymbol }}
        />
    ),
    content: {
        text: <Translation id="TR_TRADING_NETWORK_FEE" />,
        isBadge: true,
    },
});

const buildWithdrawingReceiveRow = ({
    displaySymbol,
}: StakingWithdrawingContext): EarnInfoRowData => ({
    heading: (
        <Translation
            id="TR_EARN_RECEIVE_IN_ACCOUNT"
            values={{ networkDisplaySymbol: displaySymbol }}
        />
    ),
});

export const buildEarnWithdrawingInfoRows = (
    context: EarnWithdrawingContext,
): EarnInfoRowData[] => {
    if (!isStakingNetworkType(context.networkType)) return [];

    const stakingContext: StakingWithdrawingContext = {
        ...context,
        networkType: context.networkType,
    };

    switch (stakingContext.networkType) {
        case 'cardano':
            return [
                buildWithdrawingSignRow(stakingContext),
                buildWithdrawingDeactivateRow(stakingContext),
            ];
        case 'ethereum':
        case 'solana':
            return [
                buildWithdrawingSignRow(stakingContext),
                buildWithdrawingDeactivateRow(stakingContext),
                buildWithdrawingClaimRow(stakingContext),
                buildWithdrawingReceiveRow(stakingContext),
            ];
        default:
            return exhaustive(stakingContext.networkType);
    }
};
