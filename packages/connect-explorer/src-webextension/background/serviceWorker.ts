/// <reference lib="webworker" />

// importing '@trezor/connect-webextension fails in CI build but works locally. I don't get it why
import TrezorConnect, { DEVICE_EVENT } from '../../../connect-webextension/src/index';

// Example use of TrezorConnect
// Without this, the import would be removed by Webpack tree-shaking
TrezorConnect.on(DEVICE_EVENT, (event: any) => {
    console.log('DEVICE_EVENT', event);
});
