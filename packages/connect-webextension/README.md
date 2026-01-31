# @trezor/connect-webextension

[![Build Status](https://github.com/trezor/trezor-suite/actions/workflows/test-connect.yml/badge.svg)](https://github.com/trezor/trezor-suite/actions/workflows/test-connect.yml)
[![NPM](https://img.shields.io/npm/v/@trezor/connect-webextension.svg)](https://www.npmjs.org/package/@trezor/connect-webextension)
[![Known Vulnerabilities](https://snyk.io/test/github/trezor/connect-webextension/badge.svg?targetFile=package.json)](https://snyk.io/test/github/trezor/trezor-suite?targetFile=packages/connect-webextension/package.json)

The `@trezor/connect-webextension` package provides an implementation of `@trezor/connect` designed specifically for MV3 web extensions. Key features include:

- Compatibility with service worker environments.
- Full access to the TrezorConnect API.
- Popup-based user interaction through Suite Web.
- Response delivery back to the calling service worker.

## Architecture (externally_connectable only)

This package exclusively uses the `externally_connectable` API. It does **not** inject `connect-script`, does **not** use inline iframes, and does **not** rely on content scripts.

The flow is:

1. Your extension (service worker) calls `@trezor/connect`.
2. The service worker opens a Suite Web popup (`/connect-popup`).
3. The popup communicates back to the service worker via `chrome.runtime.sendMessage`.

## Setup

### 1) manifest.json

Allow Suite Web origins to message your extension using `externally_connectable`:

```json
"externally_connectable": {
  "matches": [
    "https://suite.trezor.io/*",
    "http://localhost:8000/*"
  ]
}
```

Use only the origins you actually need (production, staging, localhost). This allowlist is required for the popup to send responses back to the service worker.

### 2) Service worker

Import the library in your service worker (MV3 background):

```javascript
import TrezorConnect from '@trezor/connect-webextension';
```

The library is available in the service worker context. If you need to call it from your extension UI, communicate with the service worker using your own messaging layer.

Note: the service worker may be suspended when idle, so you should wake it up before invoking `TrezorConnect`.

## Adding your webextension to `knownHosts`

To ensure your extension is displayed with its name rather than its ID, you need to open a Pull Request to include it in the `knownHosts` section of the file located at https://github.com/trezor/trezor-suite/blob/develop/packages/connect/src/data/config.ts

## Development

For dev, please check

```
yarn workspace @trezor/connect-explorer build:webextension
```
