import { useSelector } from 'react-redux';

import {
    Context,
    MessageSystemRootState,
    selectContextMessage,
} from '@suite-common/message-system';
import { Message } from '@suite-common/suite-types';
import { AlertBox, AlertBoxVariant } from '@suite-native/atoms';

import { MessageLink } from './MessageLink';

type ContextMessageProps = {
    context: (typeof Context)[keyof typeof Context];
};

const getAlertBoxVariantForMessage = (message: Message): AlertBoxVariant => {
    switch (message.variant) {
        case 'info':
            return 'info';
        case 'warning':
            return 'warning';
        case 'critical':
            return 'error';

        default:
            return 'info';
    }
};

export const ContextMessage = ({ context }: ContextMessageProps) => {
    // TODO: We use only English locale in suite-native so far. When the localization to other
    // languages is implemented, the language selection logic has to be added here.
    const language = 'en';
    const message = useSelector((state: MessageSystemRootState) =>
        selectContextMessage(state, context),
    ) as any as Message;

    if (!message) return null;

    return (
        <AlertBox
            variant={getAlertBoxVariantForMessage(message)}
            textVariant="hint"
            title={message.content[language]}
            rightButton={message.cta && <MessageLink messageCTA={message.cta} textVariant="hint" />}
        />
    );
};
