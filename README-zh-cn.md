# YAMLResume

[English](./README.md) | [Français](./README-fr.md) | [日本語](./README-ja.md) | [繁體中文](./README-zh-tw.md)

[![GitHub CI](https://github.com/yamlresume/yamlresume/workflows/test/badge.svg)](https://github.com/yamlresume/yamlresume/actions/workflows/test.yml)
[![Codecov](https://img.shields.io/codecov/c/github/yamlresume/yamlresume?style=flat-square&logo=codecov)](https://codecov.io/gh/yamlresume/yamlresume)
[![Security Rating](https://img.shields.io/badge/Security-A+-brightgreen?style=flat-square&logo=shield)](https://github.com/yamlresume/yamlresume/security)
[![Documentation](https://img.shields.io/badge/docs-yamlresume.dev-blue?style=flat-square&logo=gitbook)](https://yamlresume.dev/zh-cn)
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

撰写简历或许不难，但往往枯燥乏味且容易出错。

[YAMLResume](https://yamlresume.dev/zh-cn) 让你以 [YAML](https://yaml.org/) 管理并版本化你的简历，并一键生成专业的 PDF，拥有优雅的排版。

![YAMLResume YAML and PDF](./docs/static/images/yamlresume-yaml-and-pdf.webp)

## 设计理念

本项目最初是 [PPResume](https://ppresume.com/?ref=yamlresume) 的核心排版引擎。经过慎重考虑，我们决定将其开源，让每个人都能对厂商锁定说不。

YAMLResume 的核心设计理念是[关注点分离](https://zh.wikipedia.org/wiki/%E5%85%B3%E6%B3%A8%E7%82%B9%E5%88%86%E7%A6%BB)。就像 HTML 与 CSS —— HTML 负责结构化内容，CSS 定义内容的呈现样式。

遵循该原则，YAMLResume 满足以下要求：

- 内容以纯文本撰写
- 使用 YAML 组织结构（相较 JSON 更易读易写）
- 将 YAML 渲染为 PDF，排版引擎可插拔
- 布局可通过字体大小、页边距等选项自由调整

## 快速开始

若已安装 Docker，可直接体验已打包好依赖的镜像：

[![YAMLResume Docker Demo](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

或使用你偏好的包管理器安装 `yamlresume`：

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

验证安装：

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

你需要安装排版引擎以生成 PDF：推荐 [XeTeX](https://yamlresume.dev/zh-cn/docs#install-typesetting-engine) 或 [Tectonic](https://yamlresume.dev/zh-cn/docs#install-typesetting-engine)。

建议安装 [Linux Libertine](https://yamlresume.dev/zh-cn/docs#linux-libertine-font) 字体以获得最佳视觉效果。

更多细节见[安装指南](https://yamlresume.dev/zh-cn/docs/installation)。

## 创建一份新简历

你可以从我们的[示例简历](./packages/cli/src/commands/fixtures/software-engineer.yml)开始：

```
$ yamlresume new my-resume.yml
✔ Created my-resume.yml successfully.

$ yamlresume build my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume markdown file successfully: my-resume.md
```

或使用 [`dev` 命令](https://yamlresume.dev/zh-cn/docs/cli#dev)监听变更并自动构建：

```
$ yamlresume dev my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
◐ Watching file changes: my-resume.yml...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume markdown file successfully: my-resume.md
```

生成的 PDF 示例：[点此查看](./docs/static/images/resume.pdf)。

## 校验简历

YAMLResume 提供了[内置 Schema](https://yamlresume.dev/zh-cn/docs/compiler/schema)，用于在构建前校验简历，避免低级错误。

## 排版

YAMLResume 采用 [LaTeX](https://www.latex-project.org/) 作为默认排版引擎，并遵循[简历排版最佳实践](https://docs.ppresume.com/guide?ref=yamlresume)，确保像素级精致的呈现。

未来我们也可能支持 [Typst](https://github.com/typst/typst)、HTML/CSS 等其他引擎。

## 生态

- [create-yamlresume](https://yamlresume.dev/zh-cn/docs/ecosystem/create-yamlresume)：一条命令初始化项目并生成示例
- [json2yamlresume](https://yamlresume.dev/zh-cn/docs/ecosystem/json2yamlresume)：将 JSON Resume 转换为 YAMLResume

## 参与贡献

项目仍在积极开发中，公共 API 尚未完全稳定，欢迎耐心等候并参与改进。

任何形式的贡献都非常欢迎！在提交 PR 之前，请阅读[贡献指南](./CONTRIBUTING.md)。

### Star 历史

[![YAMLResume Star History Chart](https://api.star-history.com/svg?repos=yamlresume/yamlresume&type=Date)](https://www.star-history.com/#yamlresume/yamlresume&Date)

## 路线图

- [ ] 支持更多字体族
- [ ] 增加更多简历模板
- [ ] 增加更多本地化语言

## 支持本项目

如果 YAMLResume 对你有帮助，欢迎支持我们：

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
