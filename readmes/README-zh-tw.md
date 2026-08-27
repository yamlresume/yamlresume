# YAMLResume

[English](../README.md) | [Français](./README-fr.md) | [Deutsch](./README-de.md) | [Español](./README-es.md) | [Português](./README-pt.md) | [Bahasa Indonesia](./README-id.md) | [日本語](./README-ja.md) | [简体中文](./README-zh-cn.md) | [繁體中文](./README-zh-tw.md)

<!-- Build, Quality & Docs -->

[![GitHub CI](https://github.com/yamlresume/yamlresume/workflows/test/badge.svg)](https://github.com/yamlresume/yamlresume/actions/workflows/test.yml)
[![Documentation](https://img.shields.io/badge/docs-yamlresume.dev-blue?style=flat-square&logo=gitbook)](https://yamlresume.dev/zh-tw)
[![Discord](https://img.shields.io/discord/1371488902023479336?style=flat-square&logo=discord&color=5865F2)](https://discord.gg/9SyT7mVV4K)
[![Codecov](https://img.shields.io/codecov/c/github/yamlresume/yamlresume?style=flat-square&logo=codecov)](https://codecov.io/gh/yamlresume/yamlresume)
[![Security Rating](https://img.shields.io/badge/Security-A+-brightgreen?style=flat-square&logo=shield)](https://github.com/yamlresume/yamlresume/security)
[![Debuggix Security](https://api.debuggix.space/badge/inline/yamlresume/yamlresume)](https://debuggix.space/verified)

<!-- Package & Distribution -->

[![Node.js Version](https://img.shields.io/node/v/yamlresume.svg?style=flat-square&logo=node.js&color=339933)](https://nodejs.org/)
[![npm version](https://img.shields.io/npm/v/yamlresume.svg?style=flat-square&logo=npm)](https://www.npmjs.com/package/yamlresume)
[![npm downloads](https://img.shields.io/npm/dm/yamlresume.svg?style=flat-square&logo=npm&color=CB3837)](https://www.npmjs.com/package/yamlresume)
[![Docker Pulls](https://img.shields.io/docker/pulls/yamlresume/yamlresume.svg?style=flat-square&logo=docker)](https://hub.docker.com/r/yamlresume/yamlresume)
[![Docker Image Size](https://img.shields.io/docker/image-size/yamlresume/yamlresume/latest.svg?style=flat-square&logo=docker&color=2496ED)](https://hub.docker.com/r/yamlresume/yamlresume)

<!-- Technology Stack -->

[![LaTeX](https://img.shields.io/badge/LaTeX-Typesetting-008080?style=flat-square&logo=latex)](https://www.latex-project.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PNPM](https://img.shields.io/badge/PNPM-Workspace-orange?style=flat-square&logo=pnpm)](https://pnpm.io/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-FE5196?style=flat-square&logo=conventionalcommits)](https://conventionalcommits.org)
[![Biome](https://img.shields.io/badge/Biome-Linted-60a5fa?style=flat-square&logo=biome)](https://biomejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-Tested-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev/)

> **最新消息：**
> [YAMLResume v0.15](https://github.com/yamlresume/yamlresume/releases) 已發布，
> 包含為 12 個語言環境精選的履歷範本以及 AI 驅動的履歷生成功能。另請查看
> [YAMLResume GitHub Action](https://github.com/marketplace/actions/yamlresume)，
> 在 CI/CD 中自動生成 PDF。

撰寫履歷可能並不難，但這顯然不是一件有趣的事，而且非常繁瑣。

[YAMLResume](https://yamlresume.dev/zh-tw) 讓您能夠將履歷以純文字
[YAML](https://yaml.org/) 格式進行管理和版本控制，並透過一條命令將其轉換為
排版精美的專業文件。

![YAMLResume Playground](../docs/static/images/yamlresume-playground.webp)

## 設計理念

該專案最初是 [PPResume](https://ppresume.com/?ref=yamlresume) 的核心排版引擎。
PPResume 是一個基於 LaTeX 的像素級精確履歷生成器。經過深思熟慮，我們決定將其開源，
讓每個人都能
[對供應商鎖定說不](https://blog.ppresume.com/posts/no-vendor-lock-in)。

YAMLResume 遵循
[關注點分離](https://zh.wikipedia.org/wiki/%E9%97%9C%E6%B3%A8%E9%BB%9E%E5%88%86%E9%9B%A2)
原則：

- **內容** 儲存在純文字 YAML 中。
- **結構和驗證** 由編譯器和嚴格的模式強制執行。
- **呈現方式** 由可互換的佈局引擎（LaTeX、HTML、Markdown、DOCX）處理。

您編輯「什麼」；YAMLResume 負責「如何」呈現。

## 功能概覽

- **一個來源，多種輸出。** 從單個 `resume.yml` 生成像素級精確的 PDF（透過 LaTeX）、
  乾淨的 Markdown、響應式 HTML 和 Microsoft Word DOCX 檔案。
- **真正的履歷編譯器。** 解析、驗證、轉換和渲染。借助 Zod 執行時驗證和編輯器中的
  JSON Schema 整合，及早發現錯誤。
- **卓越的開發者體驗。** 使用 `yamlresume dev` 的監視模式、`yamlresume doctor`
  的環境診斷以及即時的模式驗證。
- **AI 驅動的生成。** 使用 `yamlresume ai generate` 從職位名稱和語言環境建立
  完整的履歷。
- **靈活的佈局。** 重新命名和重新組織章節、切換範本、調整排版、紙張格式、行距，
  以及啟用/禁用圖示。
- **完整的國際化。** 原生支援 12 個語言環境中的 10 種語言。
- **豐富的生態系統。** Docker 映像、Homebrew 公式、GitHub Action、可嵌入的
  Playground、精選範例和 JSON Resume 轉換器。

## 快速開始

試用 YAMLResume 最快的方式是使用 Docker。映像包含 CLI、XeTeX 和推薦字體：

```sh
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume new my-resume.yml
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume build my-resume.yml
```

[![YAMLResume Docker 演示](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

您也可以使用喜歡的套件管理器安裝 `yamlresume`（需要 Node.js >= 22）：

```sh
# npm
npm install -g yamlresume

# pnpm
pnpm add -g yamlresume

# yarn
yarn global add yamlresume

# bun
bun add -g yamlresume

# Homebrew (macOS)
brew install yamlresume
```

驗證安裝和環境：

```sh
yamlresume help
yamlresume doctor
```

詳細的安裝步驟（包括排版引擎的設定）請參閱
[安裝指南](https://yamlresume.dev/zh-tw/docs/installation)。

## 建立新履歷

您可以透過複製我們在此處的範本之一來建立自己的履歷
[範本檔案](../packages/cli/src/commands/fixtures/software-engineer.yml)。
一旦範本在您的電腦上，您就可以使用以下命令生成 PDF：

```sh
$ yamlresume new my-resume.yml
✔ Created my-resume.yml successfully.

$ yamlresume build my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume docx file successfully: my-resume.docx
✔ Generated resume markdown file successfully: my-resume.md
✔ Generated resume html file successfully: my-resume.html
```

您也可以使用 [`dev` 命令](https://yamlresume.dev/zh-tw/docs/cli#dev)在檔案變更時
重建履歷，提供**類似現代 Web 開發的體驗**：

```sh
$ yamlresume dev my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
◐ Watching file changes: my-resume.yml...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume docx file successfully: my-resume.docx
✔ Generated resume markdown file successfully: my-resume.md
```

在此處查看生成的 [PDF](../docs/static/images/resume.pdf)。

![Software Engineer Page 1](../docs/static/images/resume-1.webp)
![Software Engineer Page 2](../docs/static/images/resume-2.webp)

[PPResume Gallery](https://ppresume.com/gallery/?ref=yamlresume) 展示了按語言和
範本分類的所有可能的履歷類型概覽。

## 多佈局輸出

佈局將您的內容與呈現方式分離。在 `resume.yml` 中新增所需的任意數量的輸出格式：

```yml
layouts:
  - engine: latex
    template: moderncv-banking
    typography:
      fontSize: 11pt
  - engine: markdown
  - engine: html
    template: calm
  - engine: docx
    template: calm
```

瞭解每種引擎的更多資訊：

- [LaTeX / PDF](https://yamlresume.dev/zh-tw/docs/layouts/latex)
- [HTML](https://yamlresume.dev/zh-tw/docs/layouts/html)
- [Markdown](https://yamlresume.dev/zh-tw/docs/layouts/markdown)
- [DOCX](https://yamlresume.dev/zh-tw/docs/layouts/docx)

## 監視模式

使用 `yamlresume dev` 在 YAML 檔案被編輯時自動重建履歷：

```sh
yamlresume dev my-resume.yml
```

這為您提供了類似現代 Web 開發的快速回饋迴圈：儲存檔案，PDF 就會在稍後更新。
您可以在草稿時傳遞 `--no-pdf` 或 `--no-validate` 來節省時間。

## 驗證履歷

YAMLResume 提供內建的[模式](https://yamlresume.dev/zh-tw/docs/compiler/schema)，
在渲染前驗證您的履歷。將模式標頭新增到您的 YAML 檔案，以獲得 IDE 自動補全、懸浮文件
和即時格式檢查：

```yml
# yaml-language-server: $schema=https://yamlresume.dev/schema.json
```

執行 `yamlresume validate my-resume.yml` 取得 clang 風格的診斷資訊：

![YAMLResume validate output](../docs/static/images/yamlresume-validate.webp)

## AI 驅動的履歷生成

v0.14 中的新功能，`yamlresume ai generate` 從職位和語言建立完整的、符合模式的履歷：

```sh
export OPENAI_API_KEY=sk-...
yamlresume ai generate --position "Software Engineer" --language en resume.yml
```

支援的提供者包括 OpenAI、DeepSeek、Kimi 和 Ollama。有關配置詳情，請參閱
[AI 文件](https://yamlresume.dev/zh-tw/docs/ai)。

## 範本

YAMLResume 為各種引擎提供不斷增長的範本集合：

| 引擎   | 範本                                                             |
| ------ | ---------------------------------------------------------------- |
| LaTeX  | `moderncv-banking`、`moderncv-casual`、`moderncv-classic`、`jake` |
| HTML   | `calm`、`vscode`                                                 |
| DOCX   | `calm`                                                           |

執行 `yamlresume templates list` 檢視所有已安裝的範本。

![HTML Calm template](../docs/static/images/html-calm-template.webp)
![HTML VS Code template](../docs/static/images/html-vscode-template.webp)
![DOCX Calm template](../docs/static/images/docx-calm-template.webp)

## 語言

YAMLResume 原生支援本地化。在 `resume.yml` 中設定您的語言環境：

```yml
locale:
  language: en
```

支援的語言包括英語、中文（簡體、繁體 TW/HK）、西班牙語、法語、挪威語、荷蘭語、
日語、德語、印尼語和巴西葡萄牙語。完整列表請參閱
[Locale 文件](https://yamlresume.dev/zh-tw/docs/locale)。

## 生態系統

YAMLResume 提供一系列工具，幫助您更高效地建立、轉換和管理履歷：

- [`@yamlresume/ai`](https://www.npmjs.com/package/@yamlresume/ai) — 可程式化的
  AI 驅動履歷生成。
- [`@yamlresume/playground`](https://www.npmjs.com/package/@yamlresume/playground) —
  可嵌入的 React 元件，用於建立您自己的履歷編輯器。它驅動官方的
  [Playground](https://yamlresume.dev/playground)。
- [`@yamlresume/samples`](https://www.npmjs.com/package/@yamlresume/samples) —
  為 12 個語言環境中的常見職位精選的履歷範本。
- [`yamlresume/action`](https://github.com/marketplace/actions/yamlresume) —
  在 CI/CD 中自動化履歷生成的 GitHub Action。
- [`create-yamlresume`](https://yamlresume.dev/zh-tw/docs/ecosystem/create-yamlresume) —
  一條命令建立新的 YAMLResume 專案。
- [`json2yamlresume`](https://yamlresume.dev/zh-tw/docs/ecosystem/json2yamlresume) —
  將 [JSON Resume](https://jsonresume.org/) 檔案轉換為 YAMLResume 格式。
- [Docker 映像](https://hub.docker.com/r/yamlresume/yamlresume)和
  [Homebrew 公式](https://formulae.brew.sh/formula/yamlresume)，輕鬆安裝。

## 參與貢獻

YAMLResume 正在積極開發中，新功能定期新增。非常歡迎貢獻！請在提交 Pull Request 之前
閱讀[貢獻指南](../CONTRIBUTING.md)。

### 星標歷史

[![YAMLResume 星標歷史圖表](https://star-history.dera.page/svg?repos=yamlresume/yamlresume&type=Date)](https://star-history.dera.page/#yamlresume/yamlresume&Date)

## 路線圖

- [ ] 更多履歷範本
- [ ] 更多佈局引擎（typst 及其他）
- [ ] 更多語言和語言環境
- [ ] ATS 優化功能

## 支援專案

如果您覺得 YAMLResume 對您有幫助，請考慮支援該專案：

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
