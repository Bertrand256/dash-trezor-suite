{
  description = "Trezor Suite development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    playwright-web-flake.url = "github:pietdevries94/playwright-web-flake/1.57.0";
    old-gcc-nixpkgs.url = "github:NixOS/nixpkgs/a78ed5cbdd5427c30ca02a47ce6cccc9b7d17de4"; # For GCC 10.2.0

    # Android environment (local flake)
    android-env.url = "path:./nix/android-env";
    android-env.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      playwright-web-flake,
      old-gcc-nixpkgs,
      android-env,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        overlay = final: prev: {
          # Overlay playwright packages with chromium from nixpkgs unstable
          playwright-driver = (
            playwright-web-flake.packages.${system}.playwright-driver.override {
              chromium = prev.chromium;
            }
          );
          playwright-test = playwright-web-flake.packages.${system}.playwright-test;

          # Override GCC with older version
          gccPkgs = import old-gcc-nixpkgs { system = prev.system; };
        };

        pkgs = import nixpkgs {
          inherit system;
          overlays = [ overlay ];
          config.allowUnfree = true;
          config.android_sdk.accept_license = true;
        };

        androidEnvPkgs = android-env.packages.${system};
        androidEnvLib = android-env.lib.${system};

        commonBuildInputs = [
          pkgs.bash
          pkgs.git
          pkgs.git-lfs
          pkgs.gnupg
          pkgs.mdbook
          pkgs.xorg.xhost
          pkgs.docker
          pkgs.docker-compose
          pkgs.nodejs_24
          (pkgs.yarn.override { nodejs = null; })
          pkgs.python3
          pkgs.python3Packages.pip
          pkgs.electron_39
          pkgs.pkg-config
          pkgs.pixman # build dependencies for node-canvas
          pkgs.cairo # build dependencies for node-canvas
          pkgs.giflib # build dependencies for node-canvas
          pkgs.libjpeg # build dependencies for node-canvas
          pkgs.libpng # build dependencies for node-canvas
          pkgs.librsvg # build dependencies for node-canvas
          pkgs.pango # build dependencies for node-canvas
          pkgs.shellcheck
          pkgs.playwright-test # From playwright-web-flake
          pkgs.vips
        ]
        ++ pkgs.lib.optionals pkgs.stdenv.isLinux [
          pkgs.nsis
          pkgs.p7zip
          pkgs.openjpeg
          pkgs.osslsigncode
          pkgs.squashfsTools
          pkgs.gccPkgs.gcc # Older GCC
          pkgs.udev # used by node_module: usb
        ]
        ++ pkgs.lib.optionals pkgs.stdenv.isDarwin (
          with pkgs.darwin.apple_sdk.frameworks;
          [
            Cocoa
            CoreServices
          ]
        );

        commonShellHook = ''
          export NODE_OPTIONS=--max_old_space_size=4096
          export CURDIR="$(pwd)"
          export PATH="$PATH:$CURDIR/node_modules/.bin"
          export ELECTRON_BUILDER_CACHE="$CURDIR/.cache/electron-builder"
          export ELECTRON_DISABLE_SANDBOX=1
          export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
          export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
          export PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}"
        ''
        + pkgs.lib.optionalString pkgs.stdenv.isDarwin ''
          export ELECTRON_OVERRIDE_DIST_PATH="${pkgs.electron_39}/Applications/"
        ''
        + pkgs.lib.optionalString pkgs.stdenv.isLinux ''
          export ELECTRON_OVERRIDE_DIST_PATH="${pkgs.electron_39}/bin/"
          export npm_config_build_from_source=true
        '';

        welcomeMessage = ''
          echo "welcome to the Trezor Suite development environment"
          echo "- Node.js $(node --version)"
          echo "- npm $(npm --version)"
          echo "- Yarn $(yarn --version)"
          echo "- Playwright $(playwright --version)"
        '';

        welcomeMessageAndroid = ''
          echo "- Java $(java -version 2>&1 | head -n1)"
          command -v adb >/dev/null 2>&1 && echo "- adb $(adb version | head -n1)" || echo "- adb not found (install SDK packages)"
          command -v emulator >/dev/null 2>&1 && echo "- emulator $(emulator -version | head -n1)" || echo "- emulator not found"
        '';

      in
      {
        devShells = {
          default = pkgs.mkShell {
            buildInputs = commonBuildInputs;
            NIX_PATCHELF_LIBRARY_PATH = "${pkgs.openssl.out}/lib:${pkgs.zlib}/lib:${pkgs.gcc.cc.lib}/lib";
            NIX_CC = "${pkgs.gcc}";
            shellHook = commonShellHook + welcomeMessage;
          };

          android = pkgs.mkShell {
            buildInputs = commonBuildInputs ++ [
              androidEnvPkgs.jdk
              androidEnvPkgs.androidSdk
            ];

            NIX_PATCHELF_LIBRARY_PATH = "${pkgs.openssl.out}/lib:${pkgs.zlib}/lib:${pkgs.gcc.cc.lib}/lib";
            NIX_CC = "${pkgs.gcc}";

            # Emulator library paths
            LD_LIBRARY_PATH = "${androidEnvPkgs.androidSdk}/libexec/android-sdk/emulator/lib:${androidEnvPkgs.androidSdk}/libexec/android-sdk/emulator/lib64:$LD_LIBRARY_PATH";

            shellHook =
              commonShellHook + androidEnvLib.androidShellHook + welcomeMessage + welcomeMessageAndroid;
          };
        };
      }
    );
}
