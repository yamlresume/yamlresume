# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.3.0](https://github.com/yamlresume/yamlresume/compare/v0.2.4...v0.3.0) (2025-05-19)


### Features

* add option to toggle verbose logging ([6e37a12](https://github.com/yamlresume/yamlresume/commit/6e37a12d2e930811b7991a9e734df529178de706))
* migrate raw console.log to consola ([bc167a6](https://github.com/yamlresume/yamlresume/commit/bc167a6c0f093b975a24c4a51f5ff61fba42d2e7))
* revise build command output message ([e32c935](https://github.com/yamlresume/yamlresume/commit/e32c9356b49d1585abeb16ab3d82c377490efec1))
* revise error handling ([6e4e3d0](https://github.com/yamlresume/yamlresume/commit/6e4e3d091370f3e2f6825b3fc6646fd3ec224195))
* revise new command output message ([5e2a7b8](https://github.com/yamlresume/yamlresume/commit/5e2a7b875a4df30c4cfd59c1e87191b1bb3d3d59))


### Bug Fixes

* revise tectonic CLI flag ([ec3f663](https://github.com/yamlresume/yamlresume/commit/ec3f6633d2bf15a86de5ce91e649ed108c472c53))

## [0.2.4](https://github.com/yamlresume/yamlresume/compare/v0.2.3...v0.2.4) (2025-04-29)

## [0.2.3](https://github.com/yamlresume/yamlresume/compare/v0.2.2...v0.2.3) (2025-04-29)


### Bug Fixes

* wrong default resume name when call new command ([16dde80](https://github.com/yamlresume/yamlresume/commit/16dde8022cdb62a0591e0983d57fbbc783772533))

## [0.2.2](https://github.com/yamlresume/yamlresume/compare/v0.2.1...v0.2.2) (2025-04-29)

## [0.2.1](https://github.com/yamlresume/yamlresume/compare/v0.2.0...v0.2.1) (2025-04-29)


### Bug Fixes

* remove the deprecated mdast package ([63191de](https://github.com/yamlresume/yamlresume/commit/63191deb0021dde1660d4e53474552e7dea4076f))
* revise publish CI ([9a2302f](https://github.com/yamlresume/yamlresume/commit/9a2302fc18ac9d8b0976733677da5a48f9ea1754))

## [0.2.0](https://github.com/yamlresume/yamlresume/compare/v0.1.0...v0.2.0) (2025-04-29)


### Features

* rename init command to new command ([96d857f](https://github.com/yamlresume/yamlresume/commit/96d857f900186cbff088b9f33e670b58406ec374))

## [0.1.0](https://github.com/yamlresume/yamlresume/tree/v0.1.0) (2025-04-25)

Initial public release.

### Features

- support both XeTeX and Tectonic as typesetting engines
- support multiple resume templates: `"moderncv-banking" | "moderncv-casual" |
  "moderncv-classic"`
- support multiple languages: `"en" | "es" | "zh-Hans" | "zh-Hans-HK" |
  "zh-Hans-TW"`
- support optional Linux Libertine font for latin alphabet and Google Noto font
  for CJK characters