# YAMLResume

[English](../README.md) | [Français](./README-fr.md) | [Deutsch](./README-de.md) | [Español](./README-es.md) | [Português](./README-pt.md) | [Bahasa Indonesia](./README-id.md) | [日本語](./README-ja.md) | [简体中文](./README-zh-cn.md) | [繁體中文](./README-zh-tw.md)

<!-- Build, Quality & Docs -->

[![GitHub CI](https://github.com/yamlresume/yamlresume/workflows/test/badge.svg)](https://github.com/yamlresume/yamlresume/actions/workflows/test.yml)
[![Documentation](https://img.shields.io/badge/docs-yamlresume.dev-blue?style=flat-square&logo=gitbook)](https://yamlresume.dev/zh-cn)
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
> [YAMLResume v0.15](https://github.com/yamlresume/yamlresume/releases) 已发布，
> 包含为 12 个语言环境精选的简历样本以及 AI 驱动的简历生成功能。另请查看
> [YAMLResume GitHub Action](https://github.com/marketplace/actions/yamlresume)，
> 在 CI/CD 中自动生成 PDF。

写简历可能并不难，但这显然不是一件有趣的事，而且非常繁琐。

[YAMLResume](https://yamlresume.dev/zh-cn) 让您能够将简历以纯文本
[YAML](https://yaml.org/) 格式进行管理和版本控制，并通过一条命令将其转换为
排版精美的专业文档。

![YAMLResume Playground](../docs/static/images/yamlresume-playground.webp)

## 设计理念

该项目最初是 [PPResume](https://ppresume.com/?ref=yamlresume) 的核心排版引擎。
PPResume 是一个基于 LaTeX 的像素级精确简历生成器。经过深思熟虑，我们决定将其开源，
让每个人都能
[对供应商锁定说不](https://blog.ppresume.com/posts/no-vendor-lock-in)。

YAMLResume 遵循
[关注点分离](https://zh.wikipedia.org/wiki/%E5%85%B3%E6%B3%A8%E7%82%B9%E5%88%86%E7%A6%BB)
原则：

- **内容** 存储在纯文本 YAML 中。
- **结构和验证** 由编译器和严格的模式强制执行。
- **呈现方式** 由可互换的布局引擎（LaTeX、HTML、Markdown、DOCX）处理。

您编辑"什么"；YAMLResume 负责"如何"呈现。

## 功能概览

- **一个源，多种输出。** 从单个 `resume.yml` 生成像素级精确的 PDF（通过 LaTeX）、
  干净的 Markdown、响应式 HTML 和 Microsoft Word DOCX 文件。
- **真正的简历编译器。** 解析、验证、转换和渲染。借助 Zod 运行时验证和编辑器中的
  JSON Schema 集成，及早发现错误。
- **卓越的开发者体验。** 使用 `yamlresume dev` 的监视模式、`yamlresume doctor`
  的环境诊断以及即时的模式验证。
- **AI 驱动的生成。** 使用 `yamlresume ai generate` 从职位名称和语言环境创建
  完整的简历。
- **灵活的布局。** 重命名和重新组织章节、切换模板、调整排版、纸张格式、行间距，
  以及启用/禁用图标。
- **完整的国际化。** 原生支持 12 个语言环境中的 10 种语言。
- **丰富的生态系统。** Docker 镜像、Homebrew 公式、GitHub Action、可嵌入的
  Playground、精选示例和 JSON Resume 转换器。

## 快速开始

试用 YAMLResume 最快的方式是使用 Docker。镜像包含 CLI、XeTeX 和推荐字体：

```sh
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume new my-resume.yml
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume build my-resume.yml
```

[![YAMLResume Docker 演示](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

您也可以使用喜欢的包管理器安装 `yamlresume`（需要 Node.js >= 22）：

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

验证安装和环境：

```sh
yamlresume help
yamlresume doctor
```

详细的安装步骤（包括排版引擎的设置）请参阅
[安装指南](https://yamlresume.dev/zh-cn/docs/installation)。

## 创建新简历

您可以通过克隆我们在此处的示例之一来创建自己的简历
[示例文件](../packages/cli/src/commands/fixtures/software-engineer.yml)。
一旦示例在您的计算机上，您就可以使用以下命令生成 PDF：

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

您也可以使用 [`dev` 命令](https://yamlresume.dev/zh-cn/docs/cli#dev)在文件更改时
重建简历，提供**类似现代 Web 开发的体验**：

```sh
$ yamlresume dev my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
◐ Watching file changes: my-resume.yml...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume docx file successfully: my-resume.docx
✔ Generated resume markdown file successfully: my-resume.md
```

在此处查看生成的 [PDF](../docs/static/images/resume.pdf)。

![Software Engineer Page 1](../docs/static/images/resume-1.webp)
![Software Engineer Page 2](../docs/static/images/resume-2.webp)

[PPResume Gallery](https://ppresume.com/gallery/?ref=yamlresume) 展示了按语言和
模板分类的所有可能的简历类型概览。

## 多布局输出

布局将您的内容与呈现方式分离。在 `resume.yml` 中添加所需的任意数量的输出格式：

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

了解每种引擎的更多信息：

- [LaTeX / PDF](https://yamlresume.dev/zh-cn/docs/layouts/latex)
- [HTML](https://yamlresume.dev/zh-cn/docs/layouts/html)
- [Markdown](https://yamlresume.dev/zh-cn/docs/layouts/markdown)
- [DOCX](https://yamlresume.dev/zh-cn/docs/layouts/docx)

## 监视模式

使用 `yamlresume dev` 在 YAML 文件被编辑时自动重建简历：

```sh
yamlresume dev my-resume.yml
```

这为您提供了类似现代 Web 开发的快速反馈循环：保存文件，PDF 就会在稍后更新。
您可以在起草时传递 `--no-pdf` 或 `--no-validate` 来节省时间。

## 验证简历

YAMLResume 提供内置的[模式](https://yamlresume.dev/zh-cn/docs/compiler/schema)，
在渲染前验证您的简历。将模式头添加到您的 YAML 文件，以获得 IDE 自动补全、悬停文档
和实时格式检查：

```yml
# yaml-language-server: $schema=https://yamlresume.dev/schema.json
```

运行 `yamlresume validate my-resume.yml` 获取 clang 风格的诊断信息：

![YAMLResume validate output](../docs/static/images/yamlresume-validate.webp)

## AI 驱动的简历生成

v0.14 中的新功能，`yamlresume ai generate` 从职位和语言创建完整的、符合模式的简历：

```sh
export OPENAI_API_KEY=sk-...
yamlresume ai generate --position "Software Engineer" --language en resume.yml
```

支持的提供商包括 OpenAI、DeepSeek、Kimi 和 Ollama。有关配置详情，请参阅
[AI 文档](https://yamlresume.dev/zh-cn/docs/ai)。

## 模板

YAMLResume 为各种引擎提供不断增长的模板集合：

| 引擎   | 模板                                                             |
| ------ | ---------------------------------------------------------------- |
| LaTeX  | `moderncv-banking`、`moderncv-casual`、`moderncv-classic`、`jake` |
| HTML   | `calm`、`vscode`                                                 |
| DOCX   | `calm`                                                           |

运行 `yamlresume templates list` 查看所有已安装的模板。

![HTML Calm template](../docs/static/images/html-calm-template.webp)
![HTML VS Code template](../docs/static/images/html-vscode-template.webp)
![DOCX Calm template](../docs/static/images/docx-calm-template.webp)

## 语言

YAMLResume 原生支持本地化。在 `resume.yml` 中设置您的语言环境：

```yml
locale:
  language: en
```

支持的语言包括英语、中文（简体、繁体 TW/HK）、西班牙语、法语、挪威语、荷兰语、
日语、德语、印尼语和巴西葡萄牙语。完整列表请参阅
[Locale 文档](https://yamlresume.dev/zh-cn/docs/locale)。

## 生态系统

YAMLResume 提供一系列工具，帮助您更高效地创建、转换和管理简历：

- [`@yamlresume/ai`](https://www.npmjs.com/package/@yamlresume/ai) — 可编程的
  AI 驱动简历生成。
- [`@yamlresume/playground`](https://www.npmjs.com/package/@yamlresume/playground) —
  可嵌入的 React 组件，用于创建您自己的简历编辑器。它驱动官方的
  [Playground](https://yamlresume.dev/playground)。
- [`@yamlresume/samples`](https://www.npmjs.com/package/@yamlresume/samples) —
  为 12 个语言环境中的常见职位精选的简历样本。
- [`yamlresume/action`](https://github.com/marketplace/actions/yamlresume) —
  在 CI/CD 中自动化简历生成的 GitHub Action。
- [`create-yamlresume`](https://yamlresume.dev/zh-cn/docs/ecosystem/create-yamlresume) —
  一条命令创建新的 YAMLResume 项目。
- [`json2yamlresume`](https://yamlresume.dev/zh-cn/docs/ecosystem/json2yamlresume) —
  将 [JSON Resume](https://jsonresume.org/) 文件转换为 YAMLResume 格式。
- [Docker 镜像](https://hub.docker.com/r/yamlresume/yamlresume)和
  [Homebrew 公式](https://formulae.brew.sh/formula/yamlresume)，轻松安装。

## 参与贡献

YAMLResume 正在积极开发中，新功能定期添加。非常欢迎贡献！请在提交 Pull Request 之前
阅读[贡献指南](../CONTRIBUTING.md)。

### 星标历史

[![YAMLResume 星标历史图表](https://star-history.dera.page/svg?repos=yamlresume/yamlresume&type=Date)](https://star-history.dera.page/#yamlresume/yamlresume&Date)

## 路线图

- [ ] 更多简历模板
- [ ] 更多布局引擎（typst 及其他）
- [ ] 更多语言和语言环境
- [ ] ATS 优化功能

## 支持项目

如果您觉得 YAMLResume 对您有帮助，请考虑支持该项目：

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
