# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.8.1](https://github.com/yamlresume/yamlresume/compare/v0.8.0...v0.8.1) (2025-11-28)


### Bug Fixes

* align templates and languages list command output ([4f28843](https://github.com/yamlresume/yamlresume/commit/4f28843be21fe0b4f43c6d5d36beff115c752bc4))

## [0.8.0](https://github.com/yamlresume/yamlresume/compare/v0.7.5...v0.8.0) (2025-11-26)


### Features

* add French language support ([114227a](https://github.com/yamlresume/yamlresume/commit/114227ad2b4db6b1125c161ab81655067a8703a6))
* **breaking:** support multi layouts, starting with markdown ([56f38c2](https://github.com/yamlresume/yamlresume/commit/56f38c2c726898246ab3d7a0f1ab017989db33f3))
* **cli:** add engine column for templates list command ([16e4cc6](https://github.com/yamlresume/yamlresume/commit/16e4cc6d12f9a53cd1f8012fe0e04080eec9a5e9))
* move `layout.margins` to `layout.page.margins` ([d5935ea](https://github.com/yamlresume/yamlresume/commit/d5935ea82ad483a2842ad64276cb97d2af8da1f5))
* remove "S.A.R." postfix in Hong Kong and Macau ([c9b2712](https://github.com/yamlresume/yamlresume/commit/c9b2712aab02d41fe3ccd4d95c7ceb4edf3fee63))
* support --output/-o option for build/dev command ([ed39ff3](https://github.com/yamlresume/yamlresume/commit/ed39ff3ed44aa4820969b19a4870fa10481a488b))

## [0.7.5](https://github.com/yamlresume/yamlresume/compare/v0.7.4...v0.7.5) (2025-08-28)


### Bug Fixes

* include `.gitignore` in create-yamlresume npm packge ([ed6523a](https://github.com/yamlresume/yamlresume/commit/ed6523a7a9711a971fb26def848f34aef73af3aa))
* revise minimum length of headline from 8 to 2 ([8d030b4](https://github.com/yamlresume/yamlresume/commit/8d030b467bd04ad588077906ae31b35f73027972))

## [0.7.4](https://github.com/yamlresume/yamlresume/compare/v0.7.3...v0.7.4) (2025-08-27)


### Features

* add a new json2yamlresume package ([349709e](https://github.com/yamlresume/yamlresume/commit/349709e27fad86208d3dde051510384cc07bf880))
* add create-yamlresume package ([5baca0a](https://github.com/yamlresume/yamlresume/commit/5baca0a9bd94d861fc44221649258c2cb7fc303a))


### Bug Fixes

* remove space in margins's unit for DEFAULT_RESUME_LAYOUT ([d31f6bb](https://github.com/yamlresume/yamlresume/commit/d31f6bb17aebfa835636a1211cae592951acbfe3))

## [0.7.3](https://github.com/yamlresume/yamlresume/compare/v0.7.2...v0.7.3) (2025-08-17)


### Bug Fixes

* no `null`/`undefined` should be allowed in output PDF ([1a16b35](https://github.com/yamlresume/yamlresume/commit/1a16b351f290b274a155b94d45cbd72ee75cc226))
* revert "fix: normalize object leaf values for parsed resumes" ([9fa8c3f](https://github.com/yamlresume/yamlresume/commit/9fa8c3f9a64c8be0892e49273fa3f5bc8bbf3c9c))

## [0.7.2](https://github.com/yamlresume/yamlresume/compare/v0.7.1...v0.7.2) (2025-08-14)


### Bug Fixes

* adopt chokidar for more robust watch mode ([a684dfe](https://github.com/yamlresume/yamlresume/commit/a684dfef2c926a7ab2a9955632ea007c3cd2ce3f))

## [0.7.1](https://github.com/yamlresume/yamlresume/compare/v0.7.0...v0.7.1) (2025-08-11)


### Bug Fixes

* a critical security alert for a dev dependency form-data ([9ce7468](https://github.com/yamlresume/yamlresume/commit/9ce74683887b7c34ec65fd56f2bed31a7c84c1aa))
* move coalescifn to runtime dependency ([c911853](https://github.com/yamlresume/yamlresume/commit/c9118538b73c5e8d689189e256431303dc0f3533))

## [0.7.0](https://github.com/yamlresume/yamlresume/compare/v0.6.0...v0.7.0) (2025-08-10)


### Features

* add a dev sub-command ([8fd6265](https://github.com/yamlresume/yamlresume/commit/8fd62655d48ee6929671cf10b6b9acc8da1b2e5b))
* add Norwegian language translation ([#44](https://github.com/yamlresume/yamlresume/issues/44)) ([5cae8bf](https://github.com/yamlresume/yamlresume/commit/5cae8bf884fc84521621589fcbaa2a5b5853a0dc))
* render proper babel config for norwegian language ([b72a444](https://github.com/yamlresume/yamlresume/commit/b72a4441ad2542873f449bc35a265e7208eafbe7))
* support links with underline ([e6ab8a6](https://github.com/yamlresume/yamlresume/commit/e6ab8a6dab26ea60f98220c6b17574b4fff20bfb))


### Bug Fixes

* normalize object leaf values for parsed resumes ([cad07fd](https://github.com/yamlresume/yamlresume/commit/cad07fdda24357cf48af19b8dd55b4d1f3a937ce))
* revise font loading for CJK resumes in CTeX package ([80cf55d](https://github.com/yamlresume/yamlresume/commit/80cf55d7ea96dca573b6b2e35eab143cb9b04651))

## [0.6.0](https://github.com/yamlresume/yamlresume/compare/v0.5.1...v0.6.0) (2025-07-21)


### Features

* add docs link to sample resume preamble ([07de6d4](https://github.com/yamlresume/yamlresume/commit/07de6d4f75f55dc7d705c50b994b96ee29c2d6aa))
* aliasing sections with new titles ([e9b955b](https://github.com/yamlresume/yamlresume/commit/e9b955bb5df1edd3ba6f94590c88cfa6b86036ff))
* support section reordering ([4841635](https://github.com/yamlresume/yamlresume/commit/4841635b50d61da3ad836f104b545d8ac0d6b3c4))
* tolerate invalid date and fallback to string ([8c72cb3](https://github.com/yamlresume/yamlresume/commit/8c72cb3d68d84543525576472acf02eaf3ebc936))


### Bug Fixes

* missing the end dot in option schema message ([1e26c3b](https://github.com/yamlresume/yamlresume/commit/1e26c3b4c0f9f272b65ed242d1718897e902bb79))
* typo in name schema example ([ba4ae63](https://github.com/yamlresume/yamlresume/commit/ba4ae639f63f65062ad16860708e83fb92bdffdc))

## [0.5.1](https://github.com/yamlresume/yamlresume/compare/v0.5.0...v0.5.1) (2025-07-15)


### Features

* bump schema.json version from 0.5.0 to 0.5.1 ([2882a01](https://github.com/yamlresume/yamlresume/commit/2882a019d326a666e94278521ccfb6d8d87e920a))
* capitalize schema names to better align with types ([b1221b1](https://github.com/yamlresume/yamlresume/commit/b1221b19d129d28255b24b9344a6ce43348359a7))
* prettify yaml.parse error in clang style ([deb61bf](https://github.com/yamlresume/yamlresume/commit/deb61bf34703b7222e6f282100e2504adb093190))


### Bug Fixes

* fixed broken references in README.md ([#35](https://github.com/yamlresume/yamlresume/issues/35)) ([b992dba](https://github.com/yamlresume/yamlresume/commit/b992dba8c67ab4b474d7a0ba6cce0483e1835dd2))
* nullish fields should show metadata even when null ([682016b](https://github.com/yamlresume/yamlresume/commit/682016b9e474142322e7a886fb1fcff3e0ab5721))
* sort validate errors by line numbers ascendingly ([47e0db4](https://github.com/yamlresume/yamlresume/commit/47e0db401e7efcae3a547b18d73df4a1a1366a7f))
* sunset datetime for validation error message ([d34a6b0](https://github.com/yamlresume/yamlresume/commit/d34a6b0422fe5db77f05cf94ab32e0ed88c935f2))

## [0.5.0](https://github.com/yamlresume/yamlresume/compare/v0.4.2...v0.5.0) (2025-07-08)


### Features

* add `--no-validate` flag to build command ([4fc0ec2](https://github.com/yamlresume/yamlresume/commit/4fc0ec2474b5725c6c138a44c6e4c64410d842f6))
* add metadata for content schemas ([b16a200](https://github.com/yamlresume/yamlresume/commit/b16a200014b0bc0296a9185d87e8da3912f10ff4))
* add metadata for layout schemas ([59edb59](https://github.com/yamlresume/yamlresume/commit/59edb595147b6ff809b4490ea5cd66355b0c255f))
* add metadata to primitive schemas ([2a711df](https://github.com/yamlresume/yamlresume/commit/2a711dfd021f52ffc09de69bb6dd38a017086ae3))
* add resume schema ([4336dfa](https://github.com/yamlresume/yamlresume/commit/4336dfa86c4a2f1220a98496161d64bd0acc7f82))
* add validate command ([931fddd](https://github.com/yamlresume/yamlresume/commit/931fddd85fa2f062ec6225f0c915dc758a26b776))
* add yaml-language-server schema to sample resume ([e574220](https://github.com/yamlresume/yamlresume/commit/e574220ef8636b81f36697b0e5b56519760456ef))
* making optional field nullish ([8eb4d8d](https://github.com/yamlresume/yamlresume/commit/8eb4d8d484b69ce9a18f5b5d305784348e847e98))
* move fontspec config to layout.latex object ([a27f009](https://github.com/yamlresume/yamlresume/commit/a27f00995370a772c64e04ae1eeae222ba585f52))
* new zod schema for resume content ([fa9f3dd](https://github.com/yamlresume/yamlresume/commit/fa9f3dd1471649b3d2305b8a1f47a0dae406dbdd))
* new zod schema for resume layout ([7cd04df](https://github.com/yamlresume/yamlresume/commit/7cd04df7e25433ab6417dff5d6034abbe69f1d6c))
* sunset underline mark node in AST ([3a329be](https://github.com/yamlresume/yamlresume/commit/3a329be550e77df1f5aac8d0c819908c64a1f20f))


### Bug Fixes

* fix typo 'scalibility' to 'scalability' in fixtures ([6db8ec6](https://github.com/yamlresume/yamlresume/commit/6db8ec6b1967c0e5ae25463352c9ee8999c62aad))
* regenerate assets after fixing typos in resume.yml ([b6399c4](https://github.com/yamlresume/yamlresume/commit/b6399c406181bebd846f16d8973e22aaf0808a4a))
* revise option schema error message ([1007a8c](https://github.com/yamlresume/yamlresume/commit/1007a8c5006c21943a7fc73febdecef1a16f82c9))

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