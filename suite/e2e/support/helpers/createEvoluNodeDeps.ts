// tests/helpers/createNodeEvoluDeps.ts (ESM / TypeScript)
import {
    createConsole,
    createRandom,
    createRandomBytes,
    createSqlite,
    createTestTime,
    SimpleName,
    getOrThrow,
    createWebSocket,
} from '@evolu/common';
import {
    createDbWorkerForPlatform,
    type DbWorkerInput,
    type DbWorkerOutput,
} from '@evolu/common/local-first';

let instanceCounter = 0;

// Create a Node-friendly CreateWebSocket implementation when possible
// Tries to dynamically import 'ws' and uses it as WebSocket constructor. Falls
// back to a no-op dummy connector when 'ws' is not available (keeps tests fast
// and local-only).
const createNodeWebSocketDep = async () => {
    try {
        const wsModule = await import('ws');
        const WebSocketConstructor = (wsModule && (wsModule.WebSocket ?? wsModule.default ?? wsModule)) as unknown as typeof globalThis.WebSocket;

        return {
            createWebSocket: (url: string, options?: any) =>
                createWebSocket(url, { ...options, WebSocketConstructor }),
        };
    } catch (err) {
        // ws not available - warn and fall back to a dummy WebSocket constructor
        // that never opens (so init doesn't throw). Tests that need real
        // transport should add 'ws' to devDependencies.
        // eslint-disable-next-line no-console
        console.warn('createNodeWebSocketDep: "ws" package not available, using dummy WebSocket (no real WS connections).');

        class DummyWS {
            public readyState = 3; // CLOSED
            public onopen: any = null;
            public onclose: any = null;
            public onmessage: any = null;
            public onerror: any = null;
            constructor() {
                setTimeout(() => this.onerror && this.onerror(new Event('error')), 0);
            }
            send() {}
            close() {}
        }

        return {
            createWebSocket: (url: string, options?: any) =>
                createWebSocket(url, { ...options, WebSocketConstructor: DummyWS as unknown as typeof globalThis.WebSocket }),
        };
    }
};

export const createNodeEvoluDeps = async () => {
    const instanceName = SimpleName.orThrow(`Test${instanceCounter++}`);

    // createSqliteDriver (same as tests): uses better-sqlite3
    const createSqliteDriver = async () => {
        const BetterSQLite = (await import('better-sqlite3')).default;
        type Statement = import('better-sqlite3').Statement;
        const db = new BetterSQLite(':memory:');
        let disposed = false;

        const cache = (await import('@evolu/common')).createPreparedStatementsCache<Statement>(
            sql => db.prepare(sql),
            () => {},
        );

        const driver = {
            exec: (query: any, isMutation?: boolean) => {
                const prepared = cache.get(query, true);
                const rows = isMutation ? [] : (prepared.all(query.parameters) as any[]);
                const changes = isMutation ? prepared.run(query.parameters).changes : 0;
                return { rows, changes };
            },
            export: () => db.serialize(),
            [Symbol.dispose]: () => {
                if (disposed) return;
                disposed = true;
                cache[Symbol.dispose]();
                db.close();
            },
        } as const;
        return driver;
    };

    // track postMessage calls (handy for tests)
    const postMessageCalls: Array<DbWorkerInput> = [];
    let onMessageCallback: ((message: DbWorkerOutput) => void) | undefined;

    // inner worker (actual DB worker implementation)
    const nodeWebSocketDep = await createNodeWebSocketDep();

    const innerDbWorker = createDbWorkerForPlatform({
        console: createConsole(),
        createSqliteDriver,
        createWebSocket: nodeWebSocketDep.createWebSocket as any,
        random: createRandom(),
        randomBytes: createRandomBytes(),
        time: createTestTime(),
    });

    // expose createDbWorker for the platform (in-memory bridge to innerDbWorker)
    const deps = {
        console: createConsole(),
        createDbWorker: () => ({
            onMessage: (cb: (m: DbWorkerOutput) => void) => {
                onMessageCallback = cb;
                innerDbWorker.onMessage(cb);
            },
            postMessage: (message: Parameters<typeof innerDbWorker.postMessage>[0]) => {
                postMessageCalls.push(message);
                innerDbWorker.postMessage(message);
            },
        }),
        randomBytes: createRandomBytes(),
        reloadApp: () => {}, // noop
        time: createTestTime(),
    };

    // create sqlite instance (optional, useful to inspect DB)
    const sqlite = getOrThrow(await createSqlite({ createSqliteDriver })(instanceName));

    return {
        instanceName,
        deps,
        postMessageCalls,
        sqlite,
        innerDbWorker,
        getOnMessageCallback: () => onMessageCallback,
    };
};
