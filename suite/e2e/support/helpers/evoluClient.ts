// import { createEvoluAppOwnerFromTrezorData, Schema } from '@suite-common/suite-sync-evolu';
// import { createEvolu, createOwnerWebSocketTransport, OwnerId } from '@evolu/common/local-first';
// import { SimpleName } from '@evolu/common';
// import { createNodeEvoluDeps } from './createEvoluNodeDeps';

const ownerId = 'yg0UgROParTpm60ltI3hDw';
const ownerSecret =
    'e17818d7c458f171885280eeef2d70078c6842b51e18ec6f2f8c9f44d3d171fd0f49a3aeff32a560d7f823321fcd24f8d8773ffa59855c6447b11af88a2fd7b5';

export const createEvoluClient = async () => {
    const { SimpleName } = await import('@evolu/common');
    const { createEvoluAppOwnerFromTrezorData, Schema } =
        await import('@suite-common/suite-sync-evolu');
    // const { deps } = await createNodeEvoluDeps();

    const owner = createEvoluAppOwnerFromTrezorData({ data: ownerSecret });

    if (!owner.ok) {
        console.error(owner.error);

        throw owner.error;
    }

    // better var name
    const ownerIdResult = OwnerId.fromUnknown(ownerId);
    if (!ownerIdResult.ok) {
        throw ownerIdResult.error; // invalid OwnerId
    }

    const sanitizedOwnerId = ownerId.replaceAll('_', '-');
    const databaseName = SimpleName.from(`trezor-suite-e2e-${sanitizedOwnerId}`);
    if (!databaseName.ok) {
        console.error(databaseName.error);

        throw databaseName.error;
    }
    console.log('Database name:', databaseName);
    console.log('Owner:', owner);

    // const evolu = createEvolu(deps)(Schema, {
    //     name: databaseName.value,
    //     transports: [
    //         createOwnerWebSocketTransport({
    //             url: 'http://localhost:4000',
    //             ownerId: ownerIdResult.value,
    //         }),
    //     ],
    //     externalAppOwner: owner.value,
    //     // This turns on the Encryption-at-rest (encryption of the SQLLite file),
    //     encryptionKey: owner.value.encryptionKey,
    // });

    // // wait for appOwner ready if you need: await evolu.appOwner;
    // // get by using the public API:
    // const walletData = await evolu.loadQuery(
    //     evolu.createQuery(db => db.selectFrom('wallet').selectAll()),
    // );
    // console.log('Wallet data', walletData);
};
