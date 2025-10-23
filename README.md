# Device checks playground

Easily test the UX of device checks failures by simulating them in Connect.

- [Run Suite Web](https://dev.suite.sldev.cz/suite-web/FW-check-UI-testing-branch/web) without device
  - also works with Suite Lite on local Android emu
- Open console
- Enter one of the following commands
- Connect device

```js
authenticityCheckOptiga = 'fail';
authenticityCheckTropic = 'fail';
entropyCheck = 'fail';

hashCheck = 'other-error';
hashCheck = 'hash-mismatch';

revisionCheck = 'revision-mismatch';
revisionCheck = 'firmware-version-unknown';
revisionCheck = 'cannot-perform-check-offline';
revisionCheck = 'other-error';
```

You may reset the variables to `undefined`, set different ones and **reconnect device** without restarting Suite :)
