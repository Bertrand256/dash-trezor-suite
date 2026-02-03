import { useEffect, useState } from 'react';

import styled, { DefaultTheme, keyframes } from 'styled-components';

import { EventType } from '@suite/analytics';
import { Translation } from '@suite/intl';
import {
    TradingExchangeType,
    tokenSupportsIncreasingAllowance,
    useTradingUtils,
} from '@suite-common/trading';
import { selectHasRunningDiscovery } from '@suite-common/wallet-core';
import { Banner, Button, Column, Icon, Link, Paragraph, Row } from '@trezor/components';

import { openModal } from 'src/actions/suite/modalActions';
import { Address } from 'src/components/suite/Address';
import { useDispatch, useSelector } from 'src/hooks/suite';
import { AllowanceType, useAllowanceContext } from 'src/hooks/wallet/allowance';
import { useTradingFormContext } from 'src/hooks/wallet/trading/form/useTradingCommonForm';
import { useTradingExchangeCryptoAndProviderInfo } from 'src/hooks/wallet/trading/form/useTradingExchangeCryptoAndProviderInfo';
import { useLegacyAnalytics } from 'src/support/useAnalytics';

const TextButton = styled.div<{ $disabled: boolean }>`
    color: ${({ theme, $disabled }) =>
        $disabled ? theme.textDisabled : theme['textPrimaryDefault' as keyof DefaultTheme]};
    cursor: pointer;

    &:hover {
        color: ${({ theme, $disabled }) =>
            $disabled ? theme.textDisabled : theme['textPrimaryPressed' as keyof DefaultTheme]};
    }
`;

const loadingAnimation = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`;

const IconWrapper = styled.div`
    background-color: inherit;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateY(2px);

    animation: ${loadingAnimation} 1s linear infinite;
`;

type ApprovalStep = 'REQUIRED' | 'APPROVED' | 'LOADING' | 'ERROR';

interface TradingFormApprovalProps {
    openApproveModal: () => void;
    openRevokeModal: () => void;
}

export const TradingFormApproval = ({
    openApproveModal,
    openRevokeModal,
}: TradingFormApprovalProps) => {
    const context = useTradingFormContext<TradingExchangeType>();
    const dispatch = useDispatch();
    const analytics = useLegacyAnalytics();

    const { tx, state: allowanceState } = useAllowanceContext();

    const {
        selectQuote,
        approveTransaction,
        revokeApproval,
        refreshQuotes,
        confirmApproval,
        resetSelectedOffer,
        selectedQuote,
        preselectedQuote,
        isScheduledQuotesRefresh,
        form: {
            state: { isFormLoading },
        },
        account,
    } = context;

    const getCryptoInfo = useTradingExchangeCryptoAndProviderInfo();

    const currentQuoteStatus = selectedQuote?.status;
    const isDiscoveryRunning = useSelector(selectHasRunningDiscovery);

    const [isApproveButtonLoading, setIsApproveButtonLoading] = useState(false);
    const [isRevokeButtonLoading, setIsRevokeButtonLoading] = useState(false);
    const [isSwapButtonLoading, setIsSwapButtonLoading] = useState(false);
    const [isRefreshButtonLoading, setIsRefreshButtonLoading] = useState(false);

    const [approvalStep, setApprovalStep] = useState<ApprovalStep | undefined>();

    const { cryptoIdToSymbolAndContractAddress } = useTradingUtils();

    const [txApprovalType, setTxApprovalType] = useState<AllowanceType | null>(null);

    useEffect(() => {
        if (tx.approvalTxid && tx.status.isPending && !txApprovalType) {
            setTxApprovalType(allowanceState.approvalType);
        }
    }, [tx.approvalTxid, tx.status.isPending, allowanceState.approvalType, txApprovalType]);

    useEffect(() => {
        if (!tx.approvalTxid) return;

        if (tx.status.isPending) {
            setApprovalStep('LOADING');

            return;
        }

        if (tx.status.isFailed) {
            setApprovalStep('REQUIRED');

            return;
        }

        if (tx.status.isConfirmed && txApprovalType) {
            setApprovalStep(txApprovalType === 'APPROVE' ? 'APPROVED' : 'REQUIRED');

            refreshQuotes().finally(() => {
                tx.setApprovalTxid(null);
                setTxApprovalType(null);
            });
        }
    }, [refreshQuotes, tx, txApprovalType]);

    useEffect(() => {
        if (tx.approvalTxid) return;

        if (currentQuoteStatus === 'ERROR') {
            return setApprovalStep('ERROR');
        }

        if (currentQuoteStatus === 'APPROVAL_REQ') {
            return setApprovalStep('REQUIRED');
        }

        if (currentQuoteStatus === 'CONFIRM' || currentQuoteStatus === 'SIGN_DATA') {
            return setApprovalStep('APPROVED');
        }
    }, [currentQuoteStatus, tx.approvalTxid]);

    const onApproveTransactionClick = async () => {
        if (!selectedQuote || !selectedQuote.isDex) {
            return;
        }

        analytics.report({
            type: EventType.TradingExchangeApproval,
            payload: {
                type: 'exchange-form',
                action: 'approve',
                ...getCryptoInfo(),
            },
        });

        allowanceState.setApprovalType('APPROVE');
        setIsApproveButtonLoading(true);

        await approveTransaction(selectedQuote);

        setIsApproveButtonLoading(false);
        openApproveModal();
    };

    const onRevokeApprovalClick = async () => {
        if (!selectedQuote || !selectedQuote.receiveAddress) {
            return;
        }

        analytics.report({
            type: EventType.TradingExchangeApproval,
            payload: {
                type: 'exchange-form',
                action: 'revoke',
                ...getCryptoInfo(),
            },
        });

        allowanceState.setApprovalType('REVOKE');
        setIsRevokeButtonLoading(true);

        await revokeApproval(selectedQuote);

        setIsRevokeButtonLoading(false);
        openRevokeModal();
    };

    const onProceedToSwapClick = async () => {
        if (!selectedQuote || !selectedQuote.receiveAddress) {
            return;
        }

        analytics.report({
            type: EventType.TradingExchangeApproval,
            payload: {
                type: 'exchange-form',
                action: 'swap',
                ...getCryptoInfo(),
            },
        });

        setIsSwapButtonLoading(true);

        const newTrade = await confirmApproval({
            trade: { ...selectedQuote, status: 'CONFIRM', approvalType: undefined },
            receiveAddress: selectedQuote.receiveAddress,
        });

        setIsSwapButtonLoading(false);

        if (!newTrade || newTrade.status === 'ERROR') {
            return;
        }

        selectQuote(selectedQuote);
    };

    const onRefreshClick = async () => {
        analytics.report({
            type: EventType.TradingExchangeApproval,
            payload: {
                type: 'exchange-form',
                action: 'refresh',
                ...getCryptoInfo(),
            },
        });

        setIsRefreshButtonLoading(true);

        resetSelectedOffer();
        await refreshQuotes();

        setIsRefreshButtonLoading(false);
    };

    const isApproveButtonDisabled =
        isApproveButtonLoading ||
        (approvalStep === 'LOADING' && allowanceState.approvalType === 'REVOKE') ||
        isFormLoading ||
        isScheduledQuotesRefresh ||
        isDiscoveryRunning ||
        allowanceState.isWaitingForDevice;

    const isSwapButtonDisabled =
        isSwapButtonLoading ||
        (approvalStep === 'LOADING' && allowanceState.approvalType === 'APPROVE') ||
        isFormLoading ||
        isScheduledQuotesRefresh ||
        isDiscoveryRunning ||
        allowanceState.isWaitingForDevice;

    const isRevokeButtonDisabled =
        isRevokeButtonLoading ||
        (approvalStep === 'LOADING' && allowanceState.approvalType === 'APPROVE') ||
        isFormLoading ||
        isScheduledQuotesRefresh ||
        isDiscoveryRunning ||
        allowanceState.isWaitingForDevice;

    const isRefreshButtonDisabled =
        isRefreshButtonLoading || isFormLoading || isScheduledQuotesRefresh || isDiscoveryRunning;

    const isApprovalTxPreApproved =
        selectedQuote?.preapprovedStringAmount && selectedQuote.preapprovedStringAmount !== '0';

    const { contractAddress } = cryptoIdToSymbolAndContractAddress(selectedQuote?.send);
    const isIncreasingAllowanceSupported = tokenSupportsIncreasingAllowance(contractAddress);

    return (
        <Column gap={16} alignItems="center">
            {approvalStep === 'REQUIRED' && (
                <>
                    {isApprovalTxPreApproved ? (
                        <>
                            {!isIncreasingAllowanceSupported ? (
                                <>
                                    <Button
                                        onClick={onRevokeApprovalClick}
                                        intent="brand"
                                        width="100%"
                                        isLoading={isRevokeButtonLoading}
                                        isDisabled={isRevokeButtonDisabled}
                                    >
                                        <Translation id="TR_EXCHANGE_APPROVAL_FORM_REVOKE_BUTTON" />
                                    </Button>

                                    <Banner
                                        intent="warning"
                                        icon="warning"
                                        description={
                                            <Translation id="TR_EXCHANGE_APPROVAL_FORM_REVOKE_BANNER" />
                                        }
                                    />
                                </>
                            ) : (
                                <>
                                    <Button
                                        onClick={onApproveTransactionClick}
                                        intent="brand"
                                        width="100%"
                                        isLoading={
                                            isApproveButtonLoading ||
                                            isRevokeButtonLoading ||
                                            (preselectedQuote && isFormLoading)
                                        }
                                        isDisabled={
                                            isApproveButtonDisabled || isRevokeButtonDisabled
                                        }
                                    >
                                        <Translation id="TR_EXCHANGE_APPROVAL_FORM_INCREASE_BUTTON" />
                                    </Button>

                                    <TextButton
                                        onClick={() =>
                                            isRevokeButtonDisabled ||
                                            isRevokeButtonLoading ||
                                            isApproveButtonDisabled ||
                                            isApproveButtonLoading
                                                ? null
                                                : onRevokeApprovalClick()
                                        }
                                        $disabled={
                                            isRevokeButtonDisabled || isApproveButtonDisabled
                                        }
                                    >
                                        <Translation id="TR_EXCHANGE_APPROVAL_FORM_REVOKE_BUTTON" />
                                    </TextButton>
                                </>
                            )}
                        </>
                    ) : (
                        <Button
                            onClick={onApproveTransactionClick}
                            intent="brand"
                            width="100%"
                            isLoading={isApproveButtonLoading}
                            isDisabled={isApproveButtonDisabled}
                        >
                            <Translation id="TR_EXCHANGE_APPROVAL_FORM_APPROVE_BUTTON" />
                        </Button>
                    )}
                </>
            )}

            {approvalStep === 'APPROVED' && (
                <>
                    <Button
                        onClick={onProceedToSwapClick}
                        intent="brand"
                        width="100%"
                        isLoading={
                            isSwapButtonLoading ||
                            isRevokeButtonLoading ||
                            (preselectedQuote && isFormLoading)
                        }
                        isDisabled={isSwapButtonDisabled || isRevokeButtonDisabled}
                    >
                        <Translation id="TR_TRADING_SWAP" />
                    </Button>

                    <TextButton
                        onClick={() =>
                            isRevokeButtonDisabled ||
                            isRevokeButtonLoading ||
                            isSwapButtonDisabled ||
                            isSwapButtonLoading
                                ? null
                                : onRevokeApprovalClick()
                        }
                        $disabled={isRevokeButtonDisabled || isSwapButtonDisabled}
                    >
                        <Translation id="TR_EXCHANGE_APPROVAL_FORM_REVOKE_BUTTON" />
                    </TextButton>
                </>
            )}

            {approvalStep === 'LOADING' && (
                <Button intent="brand" width="100%" isDisabled={true}>
                    <Translation id="TR_TRADING_SWAP" />
                </Button>
            )}

            {(!approvalStep || approvalStep === 'ERROR') && (
                <Button
                    onClick={onRefreshClick}
                    intent="brand"
                    width="100%"
                    isLoading={isRefreshButtonLoading}
                    isDisabled={isRefreshButtonDisabled}
                >
                    <Translation id="TR_EXCHANGE_APPROVAL_FORM_REFRESH_BUTTON" />
                </Button>
            )}

            {approvalStep === 'LOADING' && (
                <Column width="100%" alignItems="flex-start">
                    <Row alignItems="flex-start" gap={12}>
                        <IconWrapper>
                            <Icon name="spinnerGap" size="mediumLarge" />
                        </IconWrapper>

                        <Column>
                            <Paragraph typographyStyle="body" variant="tertiary" align="start">
                                <Translation
                                    id={
                                        allowanceState.approvalType === 'APPROVE'
                                            ? 'TR_EXCHANGE_APPROVAL_FORM_CONFIRMING_APPROVAL'
                                            : 'TR_EXCHANGE_APPROVAL_FORM_REVOKING_APPROVAL'
                                    }
                                />
                            </Paragraph>

                            <Paragraph typographyStyle="body" variant="tertiary" align="start">
                                <Translation id="TR_EXCHANGE_APPROVAL_FORM_TRANSACTION_ID" />
                            </Paragraph>

                            {tx.approvalTxid && (
                                <Link
                                    onClick={() => {
                                        const txid = tx.approvalTxid;
                                        if (txid) {
                                            dispatch(
                                                openModal({
                                                    type: 'transaction-detail',
                                                    txid,
                                                    descriptor: account.descriptor,
                                                    symbol: account.symbol,
                                                    deviceState: account.deviceState,
                                                    flow: 'detail',
                                                }),
                                            );
                                        }
                                    }}
                                >
                                    <Address
                                        isTruncated
                                        value={tx.approvalTxid}
                                        variant="primary"
                                        typographyStyle="body"
                                    />
                                </Link>
                            )}
                        </Column>
                    </Row>
                </Column>
            )}
        </Column>
    );
};
