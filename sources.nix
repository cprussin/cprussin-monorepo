let
  nivSrc = fetchTarball {
    url = "https://github.com/nmattia/niv/tarball/f7c538837892dd2eb83567c9f380a11efb59b53f";
    sha256 = "0xl33k24vfc29cg9lnp95kvcq69qbq5fzb7jk9ig4lgrhaarh651";
  };
  sources = import "${nivSrc}/nix/sources.nix" {
    sourcesFile = ./sources.json;
  };
  niv = import nivSrc {};
in
  niv // sources
