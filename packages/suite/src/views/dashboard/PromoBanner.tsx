import styled, { css } from 'styled-components';

import { SUITE_URL } from '@trezor/urls';
import { EventType, analytics } from '@trezor/suite-analytics';
import { Button, Icon, Image, variables } from '@trezor/components';
import { isWeb } from '@trezor/env-utils';

import { Translation, TrezorLink } from 'src/components/suite';
import { useLayoutSize } from 'src/hooks/suite/useLayoutSize';
import { HORIZONTAL_LAYOUT_PADDINGS } from 'src/constants/suite/layout';


const Container = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
    height: 70px;
    border-top: 1px solid ${({ theme }) => theme.legacy.STROKE_GREY};
    font-size: ${variables.FONT_SIZE.SMALL};

    ${variables.SCREEN_QUERY.BELOW_LAPTOP} {
        border-radius: 20px;
        box-shadow: 0 -4px 6px -4px ${({ theme }) => theme.legacy.BOX_SHADOW_OPTION_CARD};
    }
`;

const promoContainerCss = css`
    display: flex;
    align-items: center;
    flex: 1;
    gap: 16px;
    height: 100%;
    padding: 0 ${HORIZONTAL_LAYOUT_PADDINGS};

    span {
        min-width: 100px;
    }
`;

const DesktopPromoContainer = styled.div`
    ${promoContainerCss}
    min-width: 50%;
    border-right: 1px solid ${({ theme }) => theme.legacy.STROKE_GREY};
`;

const OSIcons = styled.div`
    display: flex;
    align-self: center;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
    opacity: 0.7;
`;

const StyledLink = styled(TrezorLink)`
    margin-left: auto;
`;

// eslint-disable-next-line local-rules/no-override-ds-component
const DesktopLinkButton = styled(Button)`
    background: ${({ theme }) => theme.legacy.STROKE_GREY};
    color: ${({ theme }) => theme.legacy.TYPE_DARK_GREY};
    font-size: ${variables.FONT_SIZE.SMALL};
    transition: opacity 0.15s;
    opacity: 0.6;

    &:hover,
    &:focus {
        background: ${({ theme }) => theme.legacy.STROKE_GREY};
        opacity: 1;
    }
`;

export const PromoBanner = () => {
    const { isMobileLayout } = useLayoutSize();

    return (
        <Container>
            {isWeb() && !isMobileLayout && (
                <DesktopPromoContainer>
                    <Image image="HOLLOW_APP_LOGO" width={44} height={44} />

                    <div>
                        <Translation id="TR_MOBILE_APP_PROMO_TEXT" />

                        <OSIcons>
                            <Icon name="osMac" size={14} />
                            <Icon name="osLinux" size={14} />
                            <Icon name="osWindows" size={12} />
                        </OSIcons>
                    </div>

                    <StyledLink
                        href={SUITE_URL}
                        variant="nostyle"
                        onClick={() =>
                            analytics.report({
                                type: EventType.GetDesktopApp,
                            })
                        }
                    >
                        <DesktopLinkButton>
                            <Translation id="TR_DESKTOP_APP_PROMO_GET" />
                        </DesktopLinkButton>
                    </StyledLink>
                </DesktopPromoContainer>
            )}
        </Container>
    );
};
