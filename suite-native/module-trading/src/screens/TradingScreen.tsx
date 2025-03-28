import { useSelector } from 'react-redux';

import { Context } from '@suite-common/message-system';
import { Text, VStack } from '@suite-native/atoms';
import { DeviceManagerScreenHeader } from '@suite-native/device-manager';
import { Translation } from '@suite-native/intl';
import { ContextMessage } from '@suite-native/message-system';
import { Screen } from '@suite-native/navigation';

import { BuyForm } from '../components/buy/BuyForm';
import { BuyFormSkeleton } from '../components/buy/BuyFormSkeleton';
import { TradingFooter } from '../components/general/TradingFooter';
import { useTradingBuyData } from '../hooks/useTradingBuyData';
import { selectIsTradingBuyEnabled } from '../selectors/commonSelectors';

export const TradingScreen = () => {
    const isTradingBuyEnabled = useSelector(selectIsTradingBuyEnabled);
    const { isLoading, lastLoadedTimestamp } = useTradingBuyData();

    const displaySkeleton = isLoading || lastLoadedTimestamp === 0;

    return (
        <Screen header={<DeviceManagerScreenHeader />}>
            <VStack spacing="sp16">
                <ContextMessage context={Context.trading} />
                {isTradingBuyEnabled && (
                    <>
                        <Text variant="titleSmall" color="textDefault">
                            <Translation id="moduleTrading.tradingScreen.buyTitle" />
                        </Text>
                        {displaySkeleton ? <BuyFormSkeleton /> : <BuyForm />}
                        <TradingFooter />
                    </>
                )}
            </VStack>
        </Screen>
    );
};
