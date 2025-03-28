import { CTA } from '@suite-common/suite-types';
import { Link } from '@suite-native/link';
import { TypographyStyle } from '@trezor/theme';

type MessageLinkProps = {
    messageCTA?: CTA;
    textVariant?: TypographyStyle;
};
export const MessageLink = ({ messageCTA, textVariant = 'hint' }: MessageLinkProps) => {
    // TODO: We use only English locale in suite-native so far. When the localization to other
    // languages is implemented, the language selection logic has to be added here.
    const messageLinkLabel = messageCTA?.label.en;
    const messageLink = messageCTA?.link;
    const isExternalLink = messageCTA?.action === 'external-link';

    const isLinkDisplayable = isExternalLink && messageLinkLabel && messageLink;

    if (!isLinkDisplayable) return null;

    return (
        <Link
            href={messageLink}
            label={messageLinkLabel}
            isUnderlined
            textColor="textDefault"
            textPressedColor="textSubdued"
            textVariant={textVariant}
        />
    );
};
