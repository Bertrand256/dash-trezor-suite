## Important information

### First release of Dash Trezor Suite
This is the initial release of Dash Trezor Suite, based on Trezor Suite v25.1.2. Independent version numbering has been introduced from this point forward to distinguish this application from the original Trezor Suite.

### Unsigned release binaries
The release binaries are not signed with Apple or Microsoft code signing certificates. As a result, you may need to take additional steps to launch the application:

- **macOS**: Open the Terminal and run:
  `sudo xattr -rd com.apple.quarantine /Applications/Dash-Trezor-Suite.app`
  (Replace `/Applications/Dash-Trezor-Suite.app` with the actual path if different). Alternatively, allow the application in **Settings > Privacy & Security**.
- **Windows**: If Windows Defender SmartScreen appears, click **More info** and then **Run anyway**.

## Release notes

### New features
- New backend nodes supporting Dash have been launched and added to the default configuration, removing the need for manual setup.
- Added support for Dash Testnet.
- Removed ads, banners, and other UI elements unrelated to Dash.
- Changed the default color scheme from green to blue (Dash-themed) to prevent confusion with the official Trezor Suite.
