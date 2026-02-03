# YAMLResume

[English](./README.md) | [Français](./README-fr.md) | [日本語](./README-ja.md) | [简体中文](./README-zh-cn.md)

[![GitHub CI](https://github.com/yamlresume/yamlresume/workflows/test/badge.svg)](https://github.com/yamlresume/yamlresume/actions/workflows/test.yml)
[![Codecov](https://img.shields.io/codecov/c/github/yamlresume/yamlresume?style=flat-square&logo=codecov)](https://codecov.io/gh/yamlresume/yamlresume)
[![Security Rating](https://img.shields.io/badge/Security-A+-brightgreen?style=flat-square&logo=shield)](https://github.com/yamlresume/yamlresume/security)
[![Documentation](https://img.shields.io/badge/docs-yamlresume.dev-blue?style=flat-square&logo=gitbook)](https://yamlresume.dev/zh-tw)
[![Discord](https://img.shields.io/discord/1371488902023479336?style=flat-square&logo=discord&color=5865F2)](https://discord.gg/9SyT7mVV4K)

[![Node.js Version](https://img.shields.io/node/v/yamlresume.svg?style=flat-square&logo=node.js&color=339933)](https://nodejs.org/)
[![npm version](https://img.shields.io/npm/v/yamlresume.svg?style=flat-square&logo=npm)](https://www.npmjs.com/package/yamlresume)
[![npm downloads](https://img.shields.io/npm/dm/yamlresume.svg?style=flat-square&logo=npm&color=CB3837)](https://www.npmjs.com/package/yamlresume)
[![Docker Pulls](https://img.shields.io/docker/pulls/yamlresume/yamlresume.svg?style=flat-square&logo=docker)](https://hub.docker.com/r/yamlresume/yamlresume)
[![Docker Image Size](https://img.shields.io/docker/image-size/yamlresume/yamlresume/latest.svg?style=flat-square&logo=docker&color=2496ED)](https://hub.docker.com/r/yamlresume/yamlresume)

[![LaTeX](https://img.shields.io/badge/LaTeX-Typesetting-008080?style=flat-square&logo=latex)](https://www.latex-project.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PNPM](https://img.shields.io/badge/PNPM-Workspace-orange?style=flat-square&logo=pnpm)](https://pnpm.io/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-FE5196?style=flat-square&logo=conventionalcommits)](https://conventionalcommits.org)
[![Biome](https://img.shields.io/badge/Biome-Linted-60a5fa?style=flat-square&logo=biome)](https://biomejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-Tested-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev/)

撰寫履歷或許不難，但往往繁瑣乏味且容易出錯。

[YAMLResume](https://yamlresume.dev/zh-tw) 讓你以 [YAML](https://yaml.org/) 管理並版本控制你的履歷，並一鍵產生專業的 PDF，擁有優雅的排版。

![YAMLResume YAML and PDF](./docs/static/images/yamlresume-yaml-and-pdf.webp)

## 設計理念

本專案最初是 [PPResume](https://ppresume.com/?ref=yamlresume) 的核心排版引擎。經過審慎考量，我們決定將其開源，讓每個人都能對廠商鎖定說不。

YAMLResume 的核心設計理念是[關注點分離](https://zh.wikipedia.org/zh-tw/%E9%97%9C%E6%B3%A8%E9%BB%9E%E5%88%86%E9%9B%A2)。如同 HTML 與 CSS——HTML 負責內容結構，CSS 定義呈現樣式。

遵循該原則，YAMLResume 滿足以下要求：

- 內容以純文字撰寫
- 使用 YAML 結構化內容（相較 JSON 更易讀易寫）
- 將 YAML 渲染為 PDF，排版引擎可插拔
- 佈局可透過字體大小、頁邊距等選項自由調整

## 快速開始

若已安裝 Docker，可直接體驗已打包好依賴的映像：

[![YAMLResume Docker Demo](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

或使用你偏好的套件管理器安裝 `yamlresume`：

```
# using npm
$ npm install -g yamlresume

# using yarn
$ yarn global add yamlresume

# using pnpm
$ pnpm add -g yamlresume

# using bun
$ bun add -g yamlresume
```

驗證安裝：

```
$ yamlresume help
Usage: yamlresume [options] [command]

YAMLResume — Resume as Code in YAML

 __   __ _    __  __ _     ____
 \ \ / // \  |  \/  | |   |  _ \ ___  ___ _   _ ___  ___   ___
  \ V // _ \ | |\/| | |   | |_) / _ \/ __| | | / _ \/ _ \ / _ \
   | |/ ___ \| |  | | |___|  _ <  __/\__ \ |_| | | | | | |  __/
   |_/_/   \_\_|  |_|_____|_| \_\___||___/\____|_| |_| |_|\___|


Options:
  -V, --version                  output the version number
  -v, --verbose                  verbose output
  -h, --help                     display help for command

Commands:
  new [filename]                 create a new resume
  build [options] <resume-path>  build a resume to LaTeX and PDF
  dev [options] <resume-path>    build a resume on file changes (watch mode)
  languages                      i18n and l10n support
  templates                      manage resume templates
  validate <resume-path>         validate a resume against the YAMLResume schema
  help [command]                 display help for command
```

## 建立新履歷

你可以從我們的[範例履歷](./packages/cli/src/commands/fixtures/software-engineer.yml)開始：

```
$ yamlresume new my-resume.yml
✔ Created my-resume.yml successfully.

$ yamlresume build my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume markdown file successfully: my-resume.md
✔ Generated resume html file successfully: my-resume.html
```

或使用 [`dev` 指令](https://yamlresume.dev/zh-tw/docs/cli#dev) 監聽變更並自動建置：

```
$ yamlresume dev my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
◐ Watching file changes: my-resume.yml...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume markdown file successfully: my-resume.md
```

產生的 PDF 範例：[點此查看](./docs/static/images/resume.pdf)。

## 驗證履歷

YAMLResume 提供[內建 Schema](https://yamlresume.dev/zh-tw/docs/compiler/schema)，可在建置前驗證履歷，避免低階錯誤。

## 排版

YAMLResume 採用 [LaTeX](https://www.latex-project.org/) 作為預設排版引擎，並遵循[履歷排版最佳實踐](https://docs.ppresume.com/guide?ref=yamlresume)，確保像素級精緻的呈現。

它還支援 [HTML/CSS 佈局引擎](https://yamlresume.dev/docs/layouts/html)，讓你可產生對 Web 友善的履歷。

## 生態系

- [@yamlresume/playground](https://www.npmjs.com/package/@yamlresume/playground) 是一個用於建置你自己的履歷編輯器的 React 元件。它驅動了官方的 [Playground](https://yamlresume.dev/playground)。

- [create-yamlresume](https://yamlresume.dev/zh-tw/docs/ecosystem/create-yamlresume)：一鍵初始化專案並產生範例
- [json2yamlresume](https://yamlresume.dev/zh-tw/docs/ecosystem/json2yamlresume)：將 JSON Resume 轉換為 YAMLResume

## 貢獻

專案仍在積極開發中，公開 API 尚未完全穩定，歡迎耐心等候並協助改進。

非常歡迎任何形式的貢獻！在提交 PR 之前，請閱讀[貢獻指南](./CONTRIBUTING.md)。

### Star 歷史

[![YAMLResume Star History Chart](https://api.star-history.com/svg?repos=yamlresume/yamlresume&type=Date)](https://www.star-history.com/#yamlresume/yamlresume&Date)

## 路線圖

- [ ] 更多履歷模板
- [ ] 更多佈局引擎 (typst, docx)

## 支援本專案

如果你覺得 YAMLResume 有幫助，歡迎支持我們：

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
