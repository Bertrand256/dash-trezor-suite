import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { selectVisibleDeviceAccounts } from '@suite-common/wallet-core';
import { Box, Button, Card, Divider, HStack, Text, VStack } from '@suite-native/atoms';
import { CryptoIcon } from '@suite-native/icons';
import { Screen } from '@suite-native/navigation';

export const InterviewScreen = () => {
    // work here
    const accounts = useSelector(selectVisibleDeviceAccounts);
    const [selectedNetwork, setSelectedNetwork] = useState('btc');
    const filteredAccounts = useMemo(
        () => accounts.filter(a => a.symbol === selectedNetwork),
        [accounts, selectedNetwork],
    );

    return (
        <Screen>
            <Box flexDirection="row" style={{ gap: 8, paddingVertical: 20 }}>
                <Button onPress={() => setSelectedNetwork('btc')} style={{ flex: 1 }}>
                    btc
                </Button>
                <Button
                    onPress={() => setSelectedNetwork('eth')}
                    style={{ flex: 1 }}
                    colorScheme="blueBold"
                >
                    eth
                </Button>
                <Button
                    onPress={() => setSelectedNetwork('sol')}
                    style={{ flex: 1 }}
                    colorScheme="yellowBold"
                >
                    sol
                </Button>
            </Box>
            <Card>
                <Text variant="titleSmall">{selectedNetwork}</Text>
                {filteredAccounts.map(a => (
                    <>
                        <HStack
                            key={a.descriptor}
                            alignItems="center"
                            style={{ minHeight: 70, gap: 16 }}
                            paddingVertical="sp4"
                            alignContent="space-between"
                        >
                            <CryptoIcon symbol={a.symbol} />
                            <VStack>
                                <Text variant="highlight">{a.accountLabel}</Text>
                                {a.accountType && a.accountType !== 'normal' && (
                                    <Text variant="hint">{a.accountType}</Text>
                                )}
                            </VStack>
                        </HStack>
                        <Divider />
                    </>
                ))}
            </Card>
        </Screen>
    );
};
