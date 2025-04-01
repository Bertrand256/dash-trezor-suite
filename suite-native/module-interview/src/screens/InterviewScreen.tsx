import { Text } from '@suite-native/atoms';
import { Screen } from '@suite-native/navigation';

export const InterviewScreen = () => {
    // work here
    const accounts = ['work here'];

    return (
        <Screen>
            <Text>{accounts[0]}</Text>
        </Screen>
    );
};
