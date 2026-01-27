import { Translation } from '@suite/intl';
import { EarnFlow, EarnProvider } from '@suite-common/suite-types/src/staking';
import { getNetworkDisplaySymbol } from '@suite-common/wallet-config';
import { selectPoolStatsApyData, selectValidatorsQueueData } from '@suite-common/wallet-core';
import { getUnstakingPeriodInDays } from '@suite-common/wallet-utils';
import {
    Badge,
    CollapsibleBox,
    Column,
    Divider,
    Icon,
    List,
    Modal,
    Paragraph,
    Row,
    Text,
} from '@trezor/components';

import { openModal } from 'src/actions/suite/modalActions';
import { earnFlowToEventTypeMap } from 'src/constants/suite/staking';
import { useDispatch, useSelector } from 'src/hooks/suite';
import { selectSelectedAccount } from 'src/reducers/wallet/selectedAccountReducer';
import { useAnalytics } from 'src/support/useAnalytics';
import { formatApyValue } from 'src/views/wallet/staking/utils/formatStakeValues';

import { getEarnInANutshellConfig } from '../EarnInANutshell/earnInANutshellUtils';

interface EarnInANutshellModalProps {
    onCancel: () => void;
    flow: EarnFlow;
    provider: EarnProvider;
}

export const EarnInANutshellModal = ({ onCancel, flow, provider }: EarnInANutshellModalProps) => {
    const analytics = useAnalytics();
    const account = useSelector(selectSelectedAccount);
    const dispatch = useDispatch();
    const { validatorWithdrawTime, validatorExitTime } = useSelector(state =>
        selectValidatorsQueueData(state, account?.symbol),
    );
    const apy = useSelector(state => selectPoolStatsApyData(state, account));

    const handleContinue = () => {
        onCancel();
        dispatch(openModal({ type: 'earn-provider-consent', flow, provider }));

        analytics.report({
            type: earnFlowToEventTypeMap[flow],
            payload: {
                action: 'continue',
                step: 'stake-in-a-nutshell-modal',
                networkSymbol: account?.symbol,
            },
        });
    };

    const onCancelClick = () => {
        onCancel();

        analytics.report({
            type: earnFlowToEventTypeMap[flow],
            payload: {
                action: 'cancel',
                step: 'stake-in-a-nutshell-modal',
                networkSymbol: account?.symbol,
            },
        });
    };

    if (!account) return null;

    const unstakingPeriod = getUnstakingPeriodInDays({
        networkType: account.networkType,
        validatorWithdrawTime,
        validatorExitTime,
    });

    const { heading, highlights, processes } = getEarnInANutshellConfig(flow, account.networkType, {
        networkDisplaySymbol: getNetworkDisplaySymbol(account.symbol),
        count: unstakingPeriod,
        apy: formatApyValue(apy),
    });

    return (
        <Modal
            heading={heading}
            width={400}
            onCancel={onCancelClick}
            bottomContent={
                <Modal.Button onClick={handleContinue} data-testid="@modal/staking/continue-button">
                    <Translation id="TR_CONTINUE" />
                </Modal.Button>
            }
        >
            <List gap={20} bulletGap={16} typographyStyle="hint" margin={{ top: 8 }}>
                {highlights.map(({ icon, content }, index) => (
                    <List.Item key={index} bulletComponent={<Icon name={icon} variant="primary" />}>
                        <Paragraph variant="tertiary">{content}</Paragraph>
                    </List.Item>
                ))}
            </List>
            <Divider margin={{ top: 24, bottom: 16 }} />
            <Column gap={20}>
                {processes.map(({ heading, badge, content }, index) => (
                    <CollapsibleBox
                        key={index}
                        heading={
                            <Row gap={8}>
                                <Text variant="tertiary">{heading}</Text>
                                <Badge size="small">{badge}</Badge>
                            </Row>
                        }
                        fillType="none"
                        paddingType="none"
                        hasDivider={false}
                    >
                        {content}
                    </CollapsibleBox>
                ))}
            </Column>
        </Modal>
    );
};
