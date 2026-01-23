import { SignClient as SignClientClass } from '@walletconnect/sign-client';
import type { ISignClient } from '@walletconnect/types';
import { EngineTypes, SessionTypes, SignClientTypes } from '@walletconnect/types';

export const CLIENT_METADATA: SignClientTypes.Metadata = {
    name: 'Trezor E2E Test',
    description: 'Internal Testing',
    url: 'https://trezor.io',
    icons: ['https://trezor.io/static/images/logo.png'],
};

export const CONNECT_PARAMS: EngineTypes.ConnectParams = {
    optionalNamespaces: {
        // Ethereum
        eip155: {
            methods: ['eth_sendTransaction', 'personal_sign'],
            chains: ['eip155:1'],
            events: ['chainChanged', 'accountsChanged'],
        },
    },
};

let client: ISignClient | null = null;

export async function generateWalletConnectLink(
    metadata: SignClientTypes.Metadata,
    connectParams: EngineTypes.ConnectParams,
): Promise<{
    uri: string;
    approval: () => Promise<SessionTypes.Struct>;
}> {
    const projectId: string =
        process.env.WALLETCONNECT_PROJECT_ID || 'ff166fd793f2da788f3518714a227814';

    if (!client) {
        client = await SignClientClass.init({
            projectId,
            metadata,
            logger: 'silent',
        });
    }

    const { uri, approval } = await client.connect(connectParams);

    if (!uri) {
        throw new Error('Failed to generate WalletConnect URI.');
    }

    return { uri, approval };
}
