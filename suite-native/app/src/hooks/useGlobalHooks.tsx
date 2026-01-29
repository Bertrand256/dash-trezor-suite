import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { useReportDeviceCompromised } from '@suite-common/firmware-authenticity';
import { selectSelectedDevice } from '@suite-common/wallet-core';
import { useBluetoothAdapter } from '@suite-native/bluetooth';
import {
    useDeviceCompromisedNotification,
    useRenderDeviceDangerBanner,
    useRetryFwAuthenticityChecks,
} from '@suite-native/device';
import { useDetectDeviceError } from '@suite-native/device/src/hooks/useDetectDeviceError';
import { useHandleDeviceAuthorization } from '@suite-native/device-authorization';
import { useConnectPopupNavigation } from '@suite-native/module-connect-popup';
import { captureSentryException } from '@suite-native/sentry';

/**
 * @description This hook is used to initialize all the hooks,
 * that are supposed to be active globally once the app is ready.
 */
export const useGlobalHooks = () => {
    const device = useSelector(selectSelectedDevice);

    useConnectPopupNavigation();

    useBluetoothAdapter();

    useEffect(() => {
        setInterval(() => {
            captureSentryException(
                new Error('TESTING ERROR FROM A LOOP ' + (Math.random() * 1e6).toFixed()),
            );
        }, 1000);
    }, []);

    useDetectDeviceError();
    useHandleDeviceAuthorization();
    useReportDeviceCompromised({ device });
    useRenderDeviceDangerBanner();
    useDeviceCompromisedNotification();

    useRetryFwAuthenticityChecks();
};
