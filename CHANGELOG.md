# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.4.2](https://github.com/yamlresume/yamlresume/compare/v0.4.1...v0.4.2) (2025-06-18)


### Features

* add 50+ languages ([790fe20](https://github.com/yamlresume/yamlresume/commit/790fe20772f284cb5be21a396d087a81e2028346))
* add some fancy badges ([c49a5e2](https://github.com/yamlresume/yamlresume/commit/c49a5e2514a4118e85fa5686442b298d9065c4db))
* default to MarkdownParser for renderer's summary parser ([6e7f219](https://github.com/yamlresume/yamlresume/commit/6e7f219488921b8eb902b5bb5242a76263e20df2))
* sunset TiptapParser and related tiptap code ([36b86b1](https://github.com/yamlresume/yamlresume/commit/36b86b192eeb0163850661af26a6ec32a9556434))


### Bug Fixes

* fallback to default value for unknown option ([f3edc01](https://github.com/yamlresume/yamlresume/commit/f3edc01cb69d39ea0e6393238a7207742f588a70))

## [0.4.1](https://github.com/yamlresume/yamlresume/compare/v0.4.0...v0.4.1) (2025-06-16)


### Bug Fixes

* align log output for build command ([ff771e6](https://github.com/yamlresume/yamlresume/commit/ff771e6d18204a8ed15b851b5ce7d2ae7594e465))
* tolerate undefined/null properties for resumes ([920da87](https://github.com/yamlresume/yamlresume/commit/920da87077d9cb703d7182980d94faab9eabe144))

## [0.4.0](https://github.com/yamlresume/yamlresume/compare/v0.3.3...v0.4.0) (2025-06-04)


### Features

* slugify locale language code ([68e1dbc](https://github.com/yamlresume/yamlresume/commit/68e1dbc41281ed0ba2444f3e8e1a02d73b054b30))
* support --no-pdf option for build command ([cdee633](https://github.com/yamlresume/yamlresume/commit/cdee633f66f787ca6d6694f33fe2602a78569756))

## [0.3.3](https://github.com/yamlresume/yamlresume/compare/v0.3.2...v0.3.3) (2025-06-03)


### Features

* dockerize yamlresume ([60a096c](https://github.com/yamlresume/yamlresume/commit/60a096c6259f58082892ce6a5cbed35901e3a851))
* make layout optional ([817059b](https://github.com/yamlresume/yamlresume/commit/817059b39310b4d65fd0bfd433df969b7aeee623))

## [0.3.2](https://github.com/yamlresume/yamlresume/compare/v0.3.1...v0.3.2) (2025-06-02)


### Bug Fixes

* throw error when non-basics summary is blank ([433cbe5](https://github.com/yamlresume/yamlresume/commit/433cbe5d353058257d0e5e49c80d5317776fe0aa))

## [0.3.1](https://github.com/yamlresume/yamlresume/compare/v0.3.0...v0.3.1) (2025-05-25)


### Bug Fixes

* render resumes with absent sections ([d171fc2](https://github.com/yamlresume/yamlresume/commit/d171fc26d79e0c1fbfc618aadcba95fb53030408))

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
- support multiple languages: `"en" | "es" | "zh-Hans" | "zh-Hant-HK" |
  "zh-Hant-TW"`
- support optional Linux Libertine font for latin alphabet and Google Noto font
  for CJK characters