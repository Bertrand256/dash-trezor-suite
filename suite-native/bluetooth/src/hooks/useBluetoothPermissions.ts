import { useCallback } from 'react';
import { Platform } from 'react-native';
import {
    PERMISSIONS,
    check,
    checkMultiple,
    request,
    requestMultiple,
} from 'react-native-permissions';
import { useDispatch } from 'react-redux';

import Constants from 'expo-constants';

import { bluetoothActions } from '@suite-common/bluetooth';
import { BluetoothPermissionStatus } from '@suite-common/bluetooth/src/bluetoothReducer';

type PermissionMethod = typeof check;

const queryIosPermission = (
    permissionMethod: PermissionMethod,
): Promise<BluetoothPermissionStatus> => permissionMethod(PERMISSIONS.IOS.BLUETOOTH);

const queryAndroidPermission = async (
    permissionMethod: PermissionMethod,
): Promise<BluetoothPermissionStatus> => {
    if ((Constants.systemVersion ?? 0) >= 12) {
        const permissionMethodMultiple =
            permissionMethod === check ? checkMultiple : requestMultiple;
        const statuses = await permissionMethodMultiple([
            PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
            PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        ]);

        const scanStatus = statuses[PERMISSIONS.ANDROID.BLUETOOTH_SCAN];
        const connectStatus = statuses[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT];

        return scanStatus === connectStatus ? scanStatus : 'denied';
    }

    return permissionMethod(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
};

export const useBluetoothPermissions = () => {
    const dispatch = useDispatch();

    const queryBluetoothPermission = useCallback(
        async (permissionMethod: PermissionMethod) => {
            let status: BluetoothPermissionStatus = 'unavailable';
            if (Platform.OS === 'ios') {
                status = await queryIosPermission(permissionMethod);
            } else if (Platform.OS === 'android') {
                status = await queryAndroidPermission(permissionMethod);
            }
            dispatch(bluetoothActions.permissionEventAction({ status }));
        },
        [dispatch],
    );

    const checkBluetoothPermission = useCallback(
        () => queryBluetoothPermission(check),
        [queryBluetoothPermission],
    );
    const requestBluetoothPermission = useCallback(() => {
        dispatch(bluetoothActions.permissionEventAction({ status: 'requested' }));
        queryBluetoothPermission(request);
    }, [dispatch, queryBluetoothPermission]);

    return {
        checkBluetoothPermission,
        requestBluetoothPermission,
    };
};
