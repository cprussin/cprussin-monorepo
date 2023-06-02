{
  sources ? import ./sources.nix,
  nixpkgs ? sources.nixpkgs,
  niv ? sources.niv,
  mkCli ? sources.mkCli,
}: let
  niv-overlay = self: _: {
    niv = self.symlinkJoin {
      name = "niv";
      paths = [niv];
      buildInputs = [self.makeWrapper];
      postBuild = ''
        wrapProgram $out/bin/niv \
          --add-flags "--sources-file ${toString ./sources.json}"
      '';
    };
  };

  mkCli-overlay = import "${mkCli}/overlay.nix";

  pkgs = import nixpkgs {
    overlays = [
      niv-overlay
      mkCli-overlay
    ];
    config = {};
  };

  # This has to be a command with no arguments because the changeset github
  # action we use to publish splits the command on spaces (see
  # https://github.com/changesets/action/blob/595655c3eae7136ff5ba18200406898904362926/src/run.ts#L281),
  # which means running something like `nix-shell --run 'foo bar'` will break
  # the 'foo bar' argument to nix-shell.
  publish = pkgs.writeShellScriptBin "publish" ''
    set -e
    for package in packages/*; do
      mv "$package" "$package-old"
      mv "$package-old/dist" "$package"
      rm -rf "$package-old"
    done
    ${pkgs.nodePackages.pnpm}/bin/pnpm exec changeset publish
  '';

  cli = pkgs.lib.mkCli "cli" {
    _noAll = true;

    build = "${pkgs.turbo}/bin/turbo run build";
    build-docs = "${pkgs.turbo}/bin/turbo run build:docs";

    check-commits = "${pkgs.nodePackages.pnpm}/bin/pnpm exec commitlint --";

    test = {
      nix = {
        lint = "${pkgs.statix}/bin/statix check --ignore node_modules .";
        dead-code = "${pkgs.deadnix}/bin/deadnix .";
        format = "${pkgs.alejandra}/bin/alejandra --exclude ./node_modules --check .";
      };
      turbo = "${pkgs.turbo}/bin/turbo run test";
    };

    fix = {
      nix = {
        lint = "${pkgs.statix}/bin/statix fix --ignore node_modules .";
        dead-code = "${pkgs.deadnix}/bin/deadnix -e .";
        format = "${pkgs.alejandra}/bin/alejandra --exclude ./node_modules .";
      };
      turbo = "${pkgs.turbo}/bin/turbo run fix";
    };
  };
in
  pkgs.mkShell {
    FORCE_COLOR = 1;
    buildInputs = [
      cli
      publish
      pkgs.git
      pkgs.niv
      pkgs.nodePackages.pnpm
      pkgs.nodejs
      pkgs.turbo
    ];
  }
