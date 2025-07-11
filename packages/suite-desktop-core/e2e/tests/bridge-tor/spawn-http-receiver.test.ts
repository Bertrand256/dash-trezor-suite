import { HttpServer, findProcessFromIncomingPort } from '@trezor/node-utils';

import { skipFixture } from '../../support/common';
import { launchSuite } from '../../support/electron';
import { expect, test } from '../../support/fixtures';
import { enhancePage } from '../../support/testExtends/enhancePage';

test.use({ exceptionLogger: skipFixture });
test.describe.serial('http-receiver', { tag: ['@group=suite', '@desktopOnly'] }, () => {
    test('App spawns spawns http receiver on the first unoccupied port from ports list', async ({}, testInfo) => {
        // block http-receiver default port
        const blockingServer = new HttpServer({
            // @ts-expect-error
            logger: console,
            port: 21335,
        });

        await blockingServer.start();

        const suite = await launchSuite({
            artefactFolder: testInfo.outputDir,
            viewport: testInfo.project.use.viewport!,
        });
        enhancePage(suite.window);
        await suite.window.title();

        // some very basic assertion that tells us that both the blocking server and the http-receiver spun up on an alternative port are running
        expect(await findProcessFromIncomingPort(21335)).toMatchObject({ name: 'node' });
        expect(await findProcessFromIncomingPort(21336)).toMatchObject({ name: 'electron' });

        // todo: it would be nice to assert that the http-receiver is indeed running.
        // you could for example fetch http://127.0.0.1:21336/oauth page (it should return 200), but it becomes
        // active only after user has initiated labeling log in flow.
    });
});
