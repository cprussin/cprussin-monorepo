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
    # This has to be a command with no arguments because the changeset github
    # action we use to publish splits the command on spaces (see
    # https://github.com/changesets/action/blob/595655c3eae7136ff5ba18200406898904362926/src/run.ts#L281),
    # which means running something like `nix shell --run 'foo bar'` will break
    # the 'foo bar' argument to nix shell.
    publish-overlay = final: _: {
      publish = final.writeShellScriptBin "publish" ''
        set -e
        for package in packages/*; do
          mv "$package" "$package-old"
          mv "$package-old/dist" "$package"
          rm -rf "$package-old"
        done
        ${final.nodePackages.pnpm}/bin/pnpm exec changeset publish
      '';
    };

    cli-overlay = nixpkgs.lib.composeExtensions mkCli.overlays.default (final: _: {
      cli = final.lib.mkCli "cli" {
        _noAll = true;

        build = "${final.lib.getExe final.pnpm} turbo run build";
        build-docs = "${final.lib.getExe final.pnpm} turbo run build:docs";

        check-commits = "${final.nodePackages.pnpm}/bin/pnpm exec commitlint --";

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
          final.publish
          final.cli
          final.git
          final.nodejs
          final.pnpm
        ];
      };
    };
  in
    (flake-utils.lib.eachDefaultSystem
      (
        system: let
          pkgs = import nixpkgs {
            inherit system;
            overlays = [publish-overlay cli-overlay project-shell-overlay];
            config = {};
          };
        in {
          packages = {
            inherit (pkgs) publish cli project-shell;
          };
          devShells.default = pkgs.project-shell;
        }
      ))
    // {
      overlays = {
        publish = publish-overlay;
        cli = cli-overlay;
        project-shell = project-shell-overlay;
      };
    };
}
