import {
    TRADING_FORM_CRYPTO_CURRENCY_SELECT,
    TRADING_FORM_RECEIVE_CRYPTO_CURRENCY_SELECT,
    TRADING_FORM_SEND_CRYPTO_CURRENCY_SELECT,
    TradingAssetOption,
    TradingAssetSellOption,
} from '@suite-common/trading';
import { Flex, Row, Text } from '@trezor/components';
import { AssetLogo, CoinLogo } from '@trezor/product-components';
import { spacings } from '@trezor/theme';

export type AssetPickerInputContentProps = {
    dataTestId?: string;
} & (
    | {
          name: typeof TRADING_FORM_SEND_CRYPTO_CURRENCY_SELECT;
          value: TradingAssetSellOption;
      }
    | {
          name:
              | typeof TRADING_FORM_RECEIVE_CRYPTO_CURRENCY_SELECT
              | typeof TRADING_FORM_CRYPTO_CURRENCY_SELECT;
          value: TradingAssetOption;
      }
);

export function AssetPickerInputContent({ value, dataTestId }: AssetPickerInputContentProps) {
    return (
        <Row gap={spacings.sm}>
            {value.isNativeToken ? (
                <CoinLogo size={32} symbol={value.symbol} type="tokenWithNetwork" />
            ) : (
                <AssetLogo
                    size={32}
                    coingeckoId={value.coingeckoId}
                    symbol={value.networkSymbol}
                    contractAddress={value.contractAddress}
                    placeholder={value.displaySymbol}
                    showNetworkIcon={true}
                />
            )}
            <Flex direction="column" alignItems="start">
                <Text data-testid={dataTestId ? `${dataTestId}/display-symbol` : undefined}>
                    {value.displaySymbol}
                </Text>
                <Text variant="tertiary" typographyStyle="label">
                    {value.name}
                </Text>
            </Flex>
        </Row>
    );
}
