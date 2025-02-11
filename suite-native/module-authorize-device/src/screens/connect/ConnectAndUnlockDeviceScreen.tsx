import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useIsFocused } from '@react-navigation/native';

import {
    authorizeDeviceThunk,
    selectIsDeviceAuthorized,
    selectIsDeviceConnected,
} from '@suite-common/wallet-core';
import { ConnectAndUnlockDeviceScreenContent } from '@suite-native/device';
import { requestPrioritizedDeviceAccess } from '@suite-native/device-mutex';
import {
    AuthorizeDeviceStackParamList,
    AuthorizeDeviceStackRoutes,
    RootStackParamList,
    Screen,
    StackToStackCompositeScreenProps,
} from '@suite-native/navigation';

import { ConnectDeviceScreenHeader } from '../../components/connect/ConnectDeviceScreenHeader';

export const ConnectAndUnlockDeviceScreen = ({
    route: { params },
    navigation,
}: StackToStackCompositeScreenProps<
    AuthorizeDeviceStackParamList,
    AuthorizeDeviceStackRoutes.ConnectAndUnlockDevice,
    RootStackParamList
>) => {
    const dispatch = useDispatch();

    const isDeviceAuthorized = useSelector(selectIsDeviceAuthorized);
    const isFocused = useIsFocused();
    const isDeviceConnected = useSelector(selectIsDeviceConnected);

    const navigateBack = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    }, [navigation]);

    const navigateToConnectBluetoothDeviceScreen = () => {
        navigation.replace(AuthorizeDeviceStackRoutes.ConnectBluetoothDevice);
    };

    useEffect(() => {
        if (!isFocused || !isDeviceConnected) return;

        if (isDeviceAuthorized) {
            // When selected device become connected, we need to navigate out of this screen.
            navigateBack();
        } else {
            // If user cancelled the authorization, we need to authorize the device again.
            requestPrioritizedDeviceAccess({
                deviceCallback: () => dispatch(authorizeDeviceThunk()),
            });
        }
    }, [isDeviceAuthorized, isDeviceConnected, dispatch, isFocused, navigateBack]);

    return (
        <Screen
            header={
                <ConnectDeviceScreenHeader
                    onCancelNavigationTarget={params?.onCancelNavigationTarget}
                />
            }
            noHorizontalPadding
            noBottomPadding
            hasBottomInset={false}
            isScrollable={false}
        >
            <ConnectAndUnlockDeviceScreenContent
                onConnectViaBluetooth={navigateToConnectBluetoothDeviceScreen}
            />
        </Screen>
    );
};
