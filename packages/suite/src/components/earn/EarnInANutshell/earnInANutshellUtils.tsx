import { ReactNode } from 'react';

import { ExtendedMessageDescriptor, Translation } from '@suite/intl';
import { EarnFlow } from '@suite-common/suite-types/src/staking';
import { NetworkType } from '@suite-common/wallet-config';
import { isStakingNetworkType } from '@suite-common/wallet-utils';
import { IconName } from '@trezor/components';
import { exhaustive } from '@trezor/type-utils';

import { EarnSupplyingInfo } from './EarnSupplyingInfo';
import { EarnWithdrawingInfo } from './EarnWithdrawingInfo';

type EarnHighlight = {
    icon: IconName;
    content: ReactNode;
};

type EarnProcess = {
    heading: ReactNode;
    badge?: ReactNode;
    content: ReactNode;
};

type EarnInANutshellConfig = {
    heading: ReactNode;
    highlights: EarnHighlight[];
    processes: EarnProcess[];
};

export const buildEarnHeading = (flow: EarnFlow): ReactNode => {
    switch (flow) {
        case EarnFlow.Stake:
        case EarnFlow.UpdateProvider:
            return <Translation id="TR_EARN_STAKING_IN_A_NUTSHELL" />;
        case EarnFlow.Yield:
            return <Translation id="TR_EARN_SUPPLYING_IN_A_NUTSHELL" />;
        default:
            return exhaustive(flow);
    }
};

type EarnHighlightKey =
    | 'earnApy'
    | 'fundsAccessible'
    | 'allFundsStaked'
    | 'returnableDeposit'
    | 'lockedAmount'
    | 'rewardsEarn'
    | 'unstakingEth'
    | 'unstakingSol';

const buildHighlight = (
    highlightKey: EarnHighlightKey,
    translationValues: ExtendedMessageDescriptor['values'],
): EarnHighlight => {
    switch (highlightKey) {
        case 'earnApy':
            return {
                icon: 'piggyBank',
                content: <Translation id="TR_EARN_APY_WITH_EVERSTAKE" values={translationValues} />,
            };
        case 'fundsAccessible':
            return {
                icon: 'wallet',
                content: (
                    <Translation
                        id="TR_EARN_YOUR_FUNDS_STAY_ACCESSIBLE"
                        values={translationValues}
                    />
                ),
            };
        case 'allFundsStaked':
            return {
                icon: 'handCoins',
                content: (
                    <Translation
                        id="TR_EARN_STAKE_ALL_YOUR_FUNDS_IS_STAKED"
                        values={translationValues}
                    />
                ),
            };
        case 'returnableDeposit':
            return {
                icon: 'scroll',
                content: (
                    <Translation
                        id="TR_EARN_RETURNABLE_DEPOSIT_IS_REQUIRED"
                        values={translationValues}
                    />
                ),
            };
        case 'lockedAmount':
            return {
                icon: 'lockSimple',
                content: (
                    <Translation id="TR_EARN_STAKED_AMOUNT_LOCKED" values={translationValues} />
                ),
            };
        case 'rewardsEarn':
            return {
                icon: 'handCoins',
                content: <Translation id="TR_EARN_STAKE_REWARDS" values={translationValues} />,
            };
        case 'unstakingEth':
            return {
                icon: 'arrowBendDoubleUpLeft',
                content: (
                    <Translation id="TR_EARN_ETH_UNSTAKING_TAKES" values={translationValues} />
                ),
            };
        case 'unstakingSol':
            return {
                icon: 'arrowBendDoubleUpLeft',
                content: (
                    <Translation id="TR_EARN_SOL_UNSTAKING_TAKES" values={translationValues} />
                ),
            };
        default:
            return exhaustive(highlightKey);
    }
};

const buildEarnHighlights = (
    flow: EarnFlow,
    networkType: NetworkType,
    translationValues: ExtendedMessageDescriptor['values'],
): EarnHighlight[] => {
    if (!isStakingNetworkType(networkType)) return [];

    let highlightKeys: readonly EarnHighlightKey[] = [];

    switch (flow) {
        case EarnFlow.Stake:
        case EarnFlow.Yield:
            switch (networkType) {
                case 'ethereum':
                    highlightKeys = ['lockedAmount', 'rewardsEarn', 'unstakingEth'];
                    break;
                case 'solana':
                    highlightKeys = ['lockedAmount', 'rewardsEarn', 'unstakingSol'];
                    break;
                case 'cardano':
                    highlightKeys = ['fundsAccessible', 'allFundsStaked', 'returnableDeposit'];
                    break;
                default:
                    exhaustive(networkType);
            }
            break;
        case EarnFlow.UpdateProvider:
            highlightKeys = ['earnApy', 'fundsAccessible', 'allFundsStaked'];
            break;
        default:
            return exhaustive(flow);
    }

    return highlightKeys.map(key => buildHighlight(key, translationValues));
};

const buildEarnProcesses = (flow: EarnFlow, networkType: NetworkType): EarnProcess[] => {
    let supplyingProcessHeadingId: ExtendedMessageDescriptor['id'];
    let withdrawingProcessHeadingId: ExtendedMessageDescriptor['id'];

    switch (flow) {
        case EarnFlow.Stake:
            supplyingProcessHeadingId = 'TR_EARN_STAKING_PROCESS';
            withdrawingProcessHeadingId = 'TR_EARN_UNSTAKING_PROCESS';
            break;
        case EarnFlow.Yield:
            supplyingProcessHeadingId = 'TR_EARN_SUPPLYING_PROCESS';
            withdrawingProcessHeadingId = 'TR_EARN_WITHDRAWING_PROCESS';
            break;
        case EarnFlow.UpdateProvider:
            supplyingProcessHeadingId = 'TR_EARN_PROVIDER_UPDATE';
            withdrawingProcessHeadingId = 'TR_EARN_UNSTAKING_PROCESS';
            break;
        default:
            return exhaustive(flow);
    }

    let withdrawalBadge: ReactNode;
    switch (networkType) {
        case 'cardano':
            withdrawalBadge = <Translation id="TR_TX_FEE" />;
            break;
        default:
            withdrawalBadge = (
                <>
                    <Translation id="TR_TX_CONFIRMATIONS" values={{ confirmationsCount: 2 }} />{' '}
                    <Translation id="TR_TX_FEE" />
                </>
            );
    }

    return [
        {
            heading: <Translation id={supplyingProcessHeadingId} />,
            badge: <Translation id="TR_TX_FEE" />,
            content: <EarnSupplyingInfo flow={flow} />,
        },
        {
            heading: <Translation id={withdrawingProcessHeadingId} />,
            badge: withdrawalBadge,
            content: <EarnWithdrawingInfo flow={flow} />,
        },
    ];
};

export const getEarnInANutshellConfig = (
    flow: EarnFlow,
    networkType: NetworkType,
    translationValues: ExtendedMessageDescriptor['values'],
): EarnInANutshellConfig => ({
    heading: buildEarnHeading(flow),
    highlights: buildEarnHighlights(flow, networkType, translationValues),
    processes: buildEarnProcesses(flow, networkType),
});
