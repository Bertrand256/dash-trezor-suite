import { useCallback } from 'react';

import { useNavigation } from '@react-navigation/native';

import { useAlert } from '@suite-native/alerts';
import { Button, Text, VStack } from '@suite-native/atoms';
import { useBluetoothDevice, useBluetoothSettings } from '@suite-native/bluetooth';
import { Translation } from '@suite-native/intl';
import {
    DeviceSettingsStackParamList,
    DeviceStackRoutes,
    StackNavigationProps,
} from '@suite-native/navigation';
import { SettingsCardWithIconLayout } from '@suite-native/settings';
import { useToast } from '@suite-native/toasts';

type NavigationProp = StackNavigationProps<
    DeviceSettingsStackParamList,
    DeviceStackRoutes.DeviceSettings
>;

export const DeviceBluetoothCard = () => {
    const { showAlert } = useAlert();
    const { showToast } = useToast();
    const navigation = useNavigation<NavigationProp>();

    const { unpairBluetoothDevice } = useBluetoothDevice();
    const { openBluetoothSettings } = useBluetoothSettings();

    const unpairTrezor = useCallback(async () => {
        navigation.navigate(DeviceStackRoutes.ContinueOnTrezor);
        await unpairBluetoothDevice({
            onSuccess: () => {
                showToast({
                    icon: 'check',
                    variant: 'success',
                    message: <Translation id="moduleDeviceSettings.bluetooth.successMessage" />,
                });
                openBluetoothSettings();
            },
            onCancel: () => navigation.goBack(),
        });
    }, [navigation, unpairBluetoothDevice, showToast, openBluetoothSettings]);

    const showInfoAlert = () => {
        showAlert({
            title: <Translation id="moduleDeviceSettings.bluetooth.info.title" />,
            description: <Translation id="moduleDeviceSettings.bluetooth.info.description" />,
            primaryButtonTitle: (
                <Translation id="moduleDeviceSettings.bluetooth.unpairTrezorButton" />
            ),
            secondaryButtonTitle: <Translation id="generic.buttons.cancel" />,
            onPressPrimaryButton: unpairTrezor,
        });
    };

    return (
        <SettingsCardWithIconLayout
            icon="bluetooth"
            title={<Translation id="moduleDeviceSettings.bluetooth.title" />}
        >
            <VStack marginTop="sp2" spacing="sp16">
                <Text variant="body" color="textSubdued">
                    <Translation id="moduleDeviceSettings.bluetooth.content" />
                </Text>
                <Button onPress={showInfoAlert} colorScheme="tertiaryElevation0" size="small">
                    <Translation id="moduleDeviceSettings.bluetooth.unpairTrezorButton" />
                </Button>
            </VStack>
        </SettingsCardWithIconLayout>
    );
};
