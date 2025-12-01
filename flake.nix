{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
    mkCli.url = "github:cprussin/mkCli";
  };

  outputs = {
    nixpkgs,
    flake-utils,
    mkCli,
    ...
  }: let
    cli-overlay = nixpkgs.lib.composeExtensions mkCli.overlays.default (final: _: {
      cli = final.lib.mkCli "cli" {
        _noAll = true;

        build = "${final.lib.getExe final.pnpm} turbo run build";
        build-docs = "${final.lib.getExe final.pnpm} turbo run build:docs";

        check-commits = "${final.lib.getExe final.pnpm} exec commitlint --";

        publish = final.writeShellScript "publish" ''
          set -e
          for package in packages/*; do
            mv "$package" "$package-old"
            mv "$package-old/dist" "$package"
            rm -rf "$package-old"
          done

          # Set up npmrc for trusted publishing
          echo 'registry.npmjs.org/:_authToken=''${NODE_AUTH_TOKEN}\nregistry=registry.npmjs.org/' > .nmprc
          export NPM_CONFIG_USERCONFIG=.npmrc

          ${final.lib.getExe final.pnpm} exec changeset publish
        '';

        test = {
          nix = {
            lint = "${final.statix}/bin/statix check --ignore node_modules .";
            dead-code = "${final.deadnix}/bin/deadnix --exclude ./node_modules .";
            format = "${final.alejandra}/bin/alejandra --exclude ./node_modules --check .";
          };
          turbo = "${final.lib.getExe final.pnpm} turbo test -- --ui stream";
        };

        fix = {
          nix = {
            lint = "${final.statix}/bin/statix fix --ignore node_modules .";
            dead-code = "${final.deadnix}/bin/deadnix --exclude ./node_modules -e .";
            format = "${final.alejandra}/bin/alejandra --exclude ./node_modules .";
          };
          turbo = "${final.lib.getExe final.pnpm} turbo fix -- --ui stream";
        };
      };
    });

    project-shell-overlay = final: _: {
      project-shell = final.mkShell {
        name = "project-shell";
        buildInputs = [
          final.cli
          final.git
          final.nodejs
          final.pnpm
        ];
        FORCE_COLOR = 1;
      };
    };
  in
    (flake-utils.lib.eachDefaultSystem
      (
        system: let
          pkgs = import nixpkgs {
            inherit system;
            overlays = [cli-overlay project-shell-overlay];
            config = {};
          };
        in {
          packages = {
            inherit (pkgs) cli project-shell;
          };
          devShells.default = pkgs.project-shell;
        }
      ))
    // {
      overlays = {
        cli = cli-overlay;
        project-shell = project-shell-overlay;
      };
    };
}
