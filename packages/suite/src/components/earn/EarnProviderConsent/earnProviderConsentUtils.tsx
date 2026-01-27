import { ReactNode } from 'react';

import { Translation } from '@suite/intl';
import { EarnFlow, EarnProvider } from '@suite-common/suite-types/src/staking';
import { NetworkType } from '@suite-common/wallet-config';
import { IconName } from '@trezor/components';
import { exhaustive } from '@trezor/type-utils';

type EarnProviderConsentBanner = {
    icon: IconName;
    message: ReactNode;
};

type EarnProviderConsentConfig = {
    heading: ReactNode;
    description: ReactNode;
    banners: EarnProviderConsentBanner[];
    consentText: ReactNode;
};

type EarnProviderConsentContext = {
    flow: EarnFlow;
    provider: EarnProvider;
    networkType: NetworkType;
    displaySymbol: string;
};

export const getEarnProviderName = (provider: EarnProvider): string => {
    switch (provider) {
        case EarnProvider.Everstake:
            return 'Everstake';
        case EarnProvider.YieldXyz:
            return 'Yield.xyz';
        default:
            return exhaustive(provider);
    }
};

const buildHeading = (flow: EarnFlow, displaySymbol: string): ReactNode => {
    switch (flow) {
        case EarnFlow.Stake:
            return <Translation id="TR_EARN_STAKE_TOKEN" values={{ symbol: displaySymbol }} />;
        case EarnFlow.UpdateProvider:
            return <Translation id="TR_EARN_UPDATE_PROVIDER" />;
        case EarnFlow.Yield:
            return <Translation id="TR_EARN_SUPPLY_TOKEN" values={{ symbol: displaySymbol }} />;
        default:
            return exhaustive(flow);
    }
};

const buildStakingBanners = (
    networkType: NetworkType,
    displaySymbol: string,
): EarnProviderConsentBanner[] =>
    networkType === 'ethereum'
        ? [
              {
                  icon: 'fileFilled',
                  message: (
                      <Translation
                          id="TR_EARN_STAKE_EVERSTAKE_MANAGES"
                          values={{
                              networkDisplaySymbol: displaySymbol,
                              t: text => <strong>{text}</strong>,
                          }}
                      />
                  ),
              },
              {
                  icon: 'shieldWarningFilled',
                  message: <Translation id="TR_EARN_STAKE_TREZOR_NO_LIABILITY" />,
              },
          ]
        : [
              {
                  icon: 'fileFilled',
                  message: (
                      <Translation
                          id="TR_EARN_BY_STAKING_YOU_CAN_EARN_REWARDS"
                          values={{
                              networkDisplaySymbol: displaySymbol,
                              t: text => <strong>{text}</strong>,
                          }}
                      />
                  ),
              },
              {
                  icon: 'shieldWarningFilled',
                  message: (
                      <Translation
                          id="TR_EARN_SECURELY_DELEGATE_TO_EVERSTAKE"
                          values={{ symbol: displaySymbol }}
                      />
                  ),
              },
          ];

const buildYieldBanners = (
    displaySymbol: string,
    providerName: string,
): EarnProviderConsentBanner[] => [
    {
        icon: 'fileFilled',
        message: (
            <Translation
                id="TR_EARN_SUPPLY_PROVIDER_MANAGES"
                values={{
                    providerName,
                    networkDisplaySymbol: displaySymbol,
                    t: text => <strong>{text}</strong>,
                }}
            />
        ),
    },
    {
        icon: 'shieldWarningFilled',
        message: (
            <Translation id="TR_EARN_SUPPLY_PROVIDER_NO_LIABILITY" values={{ providerName }} />
        ),
    },
];

const buildDescription = (flow: EarnFlow, providerName: string): ReactNode => {
    switch (flow) {
        case EarnFlow.Stake:
        case EarnFlow.UpdateProvider:
            return (
                <Translation id="TR_EARN_YOUR_STAKED_FUNDS_MAINTAINED" values={{ providerName }} />
            );
        case EarnFlow.Yield:
            return (
                <Translation
                    id="TR_EARN_YOUR_SUPPLIED_FUNDS_MAINTAINED"
                    values={{ providerName }}
                />
            );
        default:
            return exhaustive(flow);
    }
};

const buildConsentText = (flow: EarnFlow, providerName: string): ReactNode => {
    switch (flow) {
        case EarnFlow.Stake:
        case EarnFlow.UpdateProvider:
            return (
                <Translation
                    id="TR_EARN_CONSENT_TO_STAKING_WITH_PROVIDER"
                    values={{ providerName }}
                />
            );
        case EarnFlow.Yield:
            return (
                <Translation
                    id="TR_EARN_CONSENT_TO_SUPPLY_WITH_PROVIDER"
                    values={{ providerName }}
                />
            );
        default:
            return exhaustive(flow);
    }
};

export const getEarnProviderConsentConfig = ({
    flow,
    provider,
    networkType,
    displaySymbol,
}: EarnProviderConsentContext): EarnProviderConsentConfig => {
    const providerName = getEarnProviderName(provider);

    return {
        heading: buildHeading(flow, displaySymbol),
        description: buildDescription(flow, providerName),
        banners:
            flow === EarnFlow.Yield
                ? buildYieldBanners(displaySymbol, providerName)
                : buildStakingBanners(networkType, displaySymbol),
        consentText: buildConsentText(flow, providerName),
    };
};
