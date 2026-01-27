import { useMemo, useState } from 'react';

import { Translation } from '@suite/intl';
import { EarnFlow, EarnProvider } from '@suite-common/suite-types/src/staking';
import { getNetworkDisplaySymbol } from '@suite-common/wallet-config';
import { selectVotingDelegationOption } from '@suite-common/wallet-core';
import { validateCardanoDrep } from '@suite-common/wallet-utils';
import { Banner, Card, Checkbox, Column, Modal } from '@trezor/components';

import { openModal } from 'src/actions/suite/modalActions';
import { earnFlowToEventTypeMap } from 'src/constants/suite/staking';
import { useDispatch, useSelector } from 'src/hooks/suite';
import { selectSelectedAccount } from 'src/reducers/wallet/selectedAccountReducer';
import { useAnalytics } from 'src/support/useAnalytics';

import { VotingDelegations } from '../EarnProviderConsent/VotingDelegations';
import { getEarnProviderConsentConfig } from '../EarnProviderConsent/earnProviderConsentUtils';

interface EarnProviderConsentModalProps {
    onCancel: () => void;
    flow: EarnFlow;
    provider: EarnProvider;
}

export const EarnProviderConsentModal = ({
    onCancel,
    flow,
    provider,
}: EarnProviderConsentModalProps) => {
    const dispatch = useDispatch();
    const analytics = useAnalytics();
    const [hasAgreed, setHasAgreed] = useState(false);
    const account = useSelector(selectSelectedAccount);
    const selectedVotingDelegation = useSelector(selectVotingDelegationOption);
    const isCardanoNetworkType = account?.networkType === 'cardano';

    const isDrepValid = useMemo(() => {
        if (!isCardanoNetworkType || selectedVotingDelegation.type !== 'another_drep') {
            return true;
        }

        return validateCardanoDrep(selectedVotingDelegation.drepId);
    }, [selectedVotingDelegation, isCardanoNetworkType]);

    const proceedToStaking = () => {
        onCancel();
        dispatch(openModal({ type: 'stake', flow }));

        analytics.report({
            type: earnFlowToEventTypeMap[flow],
            payload: {
                action: 'continue',
                step: 'funds-maintained-modal',
                networkSymbol: account?.symbol,
                ...(flow === EarnFlow.UpdateProvider
                    ? { votingDelegation: selectedVotingDelegation.type }
                    : {}),
            },
        });
    };

    const onCancelClick = () => {
        onCancel();

        analytics.report({
            type: earnFlowToEventTypeMap[flow],
            payload: {
                action: 'cancel',
                step: 'funds-maintained-modal',
                networkSymbol: account?.symbol,
                ...(flow === EarnFlow.UpdateProvider
                    ? { votingDelegation: selectedVotingDelegation.type }
                    : {}),
            },
        });
    };

    if (!account) return null;

    const displaySymbol = getNetworkDisplaySymbol(account.symbol);
    const { heading, description, banners, consentText } = getEarnProviderConsentConfig({
        flow,
        provider,
        networkType: account.networkType,
        displaySymbol,
    });

    return (
        <Modal
            heading={heading}
            description={description}
            onCancel={onCancelClick}
            width={600}
            bottomContent={
                <>
                    <Modal.Button
                        isDisabled={!hasAgreed || !isDrepValid}
                        onClick={proceedToStaking}
                        data-testid="@modal/staking/confirm-button"
                    >
                        <Translation id="TR_CONFIRM" />
                    </Modal.Button>
                    <Modal.Button intent="neutral" priority="secondary" onClick={onCancelClick}>
                        <Translation id="TR_CANCEL" />
                    </Modal.Button>
                </>
            }
        >
            <Column gap={12} margin={{ top: 8, bottom: 20 }}>
                {banners.map(({ icon, message }, index) => (
                    <Banner icon={icon} intent="info" key={index} description={message} />
                ))}
            </Column>
            <Column gap={12}>
                <VotingDelegations />
                <Card>
                    <Checkbox
                        data-testid="@staking/provider-acknowledge-checkbox"
                        verticalAlignment="center"
                        onClick={() => setHasAgreed(!hasAgreed)}
                        isChecked={hasAgreed}
                    >
                        {consentText}
                    </Checkbox>
                </Card>
            </Column>
        </Modal>
    );
};
