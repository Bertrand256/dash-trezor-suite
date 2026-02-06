import { Network, getMainnets, getTestnets } from '@suite-common/wallet-config';
import { selectDeviceSupportedNetworks } from '@suite-common/wallet-core';
import { arrayPartition } from '@trezor/utils';

import { useSelector } from 'src/hooks/suite';
import {
    selectIsDebugModeActive
} from 'src/reducers/suite/suiteReducer';

export const useNetworkSupport = () => {
    const isDebug = useSelector(selectIsDebugModeActive);
    const deviceSupportedNetworkSymbols = useSelector(selectDeviceSupportedNetworks);

    const mainnets = getMainnets(isDebug);
    const testnets = getTestnets(isDebug);

    const isNetworkSupported = (network: Network) =>
        deviceSupportedNetworkSymbols.includes(network.symbol) &&
        (network.symbol === 'dash' || network.symbol === 'tdash' || !network.isHidden);

    const [supportedMainnets, unsupportedMainnets] = arrayPartition(mainnets, isNetworkSupported);
    const supportedTestnets = testnets.filter(isNetworkSupported);

    const showUnsupportedCoins = false;

    return {
        supportedMainnets,
        unsupportedMainnets,
        supportedTestnets,
        showUnsupportedCoins,
    };
};
