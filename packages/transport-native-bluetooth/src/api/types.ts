import { DeviceBluetoothConnectionStatus } from '@suite-common/bluetooth/src/bluetoothReducer';

export interface BluetoothDevice {
    id: string;
    name: string;
    data: number[]; // TODO: https://github.com/trezor/trezor-suite/pull/18376
    lastUpdatedTimestamp: number;
    connectionStatus: DeviceBluetoothConnectionStatus;
}
