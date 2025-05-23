export type DeviceBluetoothConnectionStatus =
    | { type: 'disconnected' }
    | { type: 'pairing'; pin?: string }
    | { type: 'paired' }
    | { type: 'connecting' }
    | { type: 'connected' }
    | {
          type: 'pairing-error'; // This device cannot be paired ever again (new macAddress, new device)
          error: string;
      }
    | {
          type: 'connection-error'; // Out-of-range, offline, in the faraday cage, ...
          error: string; // Timeout, connection aborted, ...
      };

export interface BluetoothDevice {
    id: string;
    name: string;
    data: number[]; // TODO: https://github.com/trezor/trezor-suite/pull/18376
    lastUpdatedTimestamp: number;
    connectionStatus: DeviceBluetoothConnectionStatus;
}
