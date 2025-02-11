import {
    prepareSelectAllDevices,
    selectAdapterStatus,
    selectKnownDevices,
    selectNearbyDevices,
} from '@suite-common/bluetooth';
import {
    WithBluetoothState,
    selectPermissionStatus,
} from '@suite-common/bluetooth/src/bluetoothSelectors';
import { createWeakMapSelector } from '@suite-common/redux-utils';
import { BluetoothDevice } from '@trezor/transport-native-bluetooth';

export type BluetoothDeviceWithBluetoothState = WithBluetoothState<BluetoothDevice>;

const createMemoizedSelector = createWeakMapSelector.withTypes<BluetoothDeviceWithBluetoothState>();

export const selectBluetoothPermissionStatus = (state: BluetoothDeviceWithBluetoothState) =>
    selectPermissionStatus(state);

export const selectBluetoothAdapterStatus = (state: BluetoothDeviceWithBluetoothState) =>
    selectAdapterStatus(state);

export const selectKnownBluetoothDevices = (state: BluetoothDeviceWithBluetoothState) =>
    selectKnownDevices(state);

export const selectIsKnownBluetoothDevice = createMemoizedSelector(
    [selectKnownBluetoothDevices, (_, device: BluetoothDevice) => device],
    (knownBluetoothDevices, device) => knownBluetoothDevices.some(d => d.id === device.id),
);

export const selectNearbyBluetoothDevices = createMemoizedSelector(
    [selectNearbyDevices],
    nearbyDevices => nearbyDevices ?? [],
);

export const selectIsNearbyBluetoothDevice = createMemoizedSelector(
    [selectNearbyBluetoothDevices, (_, device: BluetoothDevice) => device],
    (nearbyBluetoothDevices, device) => nearbyBluetoothDevices.some(d => d.id === device.id),
);

export const selectKnownConnectableBluetoothDevices = createMemoizedSelector(
    [selectNearbyBluetoothDevices, selectKnownBluetoothDevices],
    (nearbyBluetoothDevices, knownBluetoothDevices) =>
        nearbyBluetoothDevices.filter(nearbyDevice =>
            knownBluetoothDevices.some(
                knownDevice =>
                    nearbyDevice.id === knownDevice.id &&
                    knownDevice.connectionStatus.type === 'disconnected',
            ),
        ),
);

export const selectAllBluetoothDevices = prepareSelectAllDevices<BluetoothDevice>();
