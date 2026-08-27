# YAMLResume

[English](./README.md) | [Français](./readmes/README-fr.md) |
[Deutsch](./readmes/README-de.md) | [Español](./readmes/README-es.md) |
[Português](./readmes/README-pt.md) | [Bahasa Indonesia](./readmes/README-id.md)
| [日本語](./readmes/README-ja.md) | [简体中文](./readmes/README-zh-cn.md) |
[繁體中文](./readmes/README-zh-tw.md)

<!-- Build, Quality & Docs -->

[![GitHub CI](https://github.com/yamlresume/yamlresume/workflows/test/badge.svg)](https://github.com/yamlresume/yamlresume/actions/workflows/test.yml)
[![Documentation](https://img.shields.io/badge/docs-yamlresume.dev-blue?style=flat-square&logo=gitbook)](https://yamlresume.dev)
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

> **News:**
> [YAMLResume v0.15](https://github.com/yamlresume/yamlresume/releases) is out
> with curated sample resumes in 12 locales and AI-powered resume generation.
> Also check out the
> [YAMLResume GitHub Action](https://github.com/marketplace/actions/yamlresume)
> to automate PDF builds in CI/CD.

Writing resumes may not be hard, but it is definitely not fun and it's tedious.

[YAMLResume](https://yamlresume.dev) lets you manage and version-control your
resumes as plain-text [YAML](https://yaml.org/) and turn them into beautifully
typeset, professional documents with a single command.

![YAMLResume Playground](./docs/static/images/yamlresume-playground.webp)

## The Design Principle

This project started as the core typesetting engine for
[PPResume](https://ppresume.com/?ref=yamlresume), a LaTeX-based, pixel-perfect
resume builder. After careful consideration, we decided to open source it so
people can always say
[no to vendor lock-in](https://blog.ppresume.com/posts/no-vendor-lock-in).

YAMLResume follows
[Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns):

- **Content** lives in plain-text YAML.
- **Structure and validation** are enforced by the compiler and a strict schema.
- **Presentation** is handled by pluggable layout engines (LaTeX, HTML,
  Markdown, DOCX).

You edit the what; YAMLResume handles the how.

## Features at a Glance

- **One source, multiple outputs.** From a single `resume.yml` generate
  pixel-perfect PDFs (via LaTeX), clean Markdown, responsive HTML, and Microsoft
  Word DOCX files.
- **A real resume compiler.** Parse, validate, transform, and render. Catch
  errors early with Zod runtime validation and JSON Schema editor integration.
- **Great developer experience.** Watch mode with `yamlresume dev`, environment
  diagnostics with `yamlresume doctor`, and instant schema validation.
- **AI-powered generation.** Bootstrap a complete resume from a job title and
  locale with `yamlresume ai generate`.
- **Flexible layouts.** Rename and reorder sections, switch templates, tune
  typography, paper size, line spacing, and toggle icons.
- **Global i18n.** Built-in support for 10 languages across 12 locale codes.
- **Rich ecosystem.** Docker image, Homebrew formula, GitHub Action, embeddable
  Playground, curated samples, and a JSON Resume converter.

## Quick Start

The fastest way to try YAMLResume is with Docker. The image ships with the CLI,
XeTeX, and recommended fonts:

```sh
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume new my-resume.yml
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume build my-resume.yml
```

[![YAMLResume Docker Demo](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

You can also install `yamlresume` with your favorite package manager (Node.js
>= 22 is required):

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

Verify the installation and check your environment:

```sh
yamlresume help
yamlresume doctor
```

For detailed installation steps, including how to set up a typesetting engine,
see the [installation guide](https://yamlresume.dev/docs/installation).

## Create a new resume

You can create your own resume by cloning one of our sample resumes
[here](./packages/cli/src/commands/fixtures/software-engineer.yml). Once you
have the sample resume on your computer, you can generate a PDF with:

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

You can also use the [`dev` command](https://yamlresume.dev/docs/cli#dev) to
rebuild the resume on each file change, which provides **a modern web
development-like experience**:

```sh
$ yamlresume dev my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
◐ Watching file changes: my-resume.yml...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume docx file successfully: my-resume.docx
✔ Generated resume markdown file successfully: my-resume.md
```

Check out the generated PDF [here](./docs/static/images/resume.pdf).

![Software Engineer Page 1](./docs/static/images/resume-1.webp)
![Software Engineer Page 2](./docs/static/images/resume-2.webp)

[PPResume Gallery](https://ppresume.com/gallery/?ref=yamlresume) provides a
showcase of all the possible types of resumes, categorized by languages and
templates.

## Multi-Layout Output

Layouts decouple your content from presentation. Add as many output formats as
you need in `resume.yml`:

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

Learn more about each engine:

- [LaTeX / PDF](https://yamlresume.dev/docs/layouts/latex)
- [HTML](https://yamlresume.dev/docs/layouts/html)
- [Markdown](https://yamlresume.dev/docs/layouts/markdown)
- [DOCX](https://yamlresume.dev/docs/layouts/docx)

## Watch Mode

Use `yamlresume dev` to rebuild your resume automatically as you edit the YAML
file:

```sh
yamlresume dev my-resume.yml
```

This gives you a tight feedback loop similar to modern web development: save the
file and the PDF updates moments later. You can pass `--no-pdf` or
`--no-validate` to speed things up during drafting.

## Validating Resumes

YAMLResume provides a built-in
[schema](https://yamlresume.dev/docs/compiler/schema) that validates your resume
before rendering. Add the schema header to your YAML file for IDE autocomplete,
hover documentation, and real-time format checks:

```yml
# yaml-language-server: $schema=https://yamlresume.dev/schema.json
```

Run `yamlresume validate my-resume.yml` for clang-style diagnostics:

![YAMLResume validate output](./docs/static/images/yamlresume-validate.webp)

## AI-Powered Resume Generation

New in v0.14, `yamlresume ai generate` creates a complete, schema-valid resume
from a position and language:

```sh
export OPENAI_API_KEY=sk-...
yamlresume ai generate --position "Software Engineer" --language en resume.yml
```

Supported providers include OpenAI, DeepSeek, Kimi, and Ollama. Read the
[AI documentation](https://yamlresume.dev/docs/ai) for setup details.

## Templates

YAMLResume ships with a growing set of templates across engines:

| Engine | Templates                                                         |
| ------ | ----------------------------------------------------------------- |
| LaTeX  | `moderncv-banking`, `moderncv-casual`, `moderncv-classic`, `jake` |
| HTML   | `calm`, `vscode`                                                  |
| DOCX   | `calm`                                                            |

Run `yamlresume templates list` to see everything that is installed.

![HTML Calm template](./docs/static/images/html-calm-template.webp)
![HTML VS Code template](./docs/static/images/html-vscode-template.webp)
![DOCX Calm template](./docs/static/images/docx-calm-template.webp)

## Languages

YAMLResume supports localization out of the box. Set your locale in
`resume.yml`:

```yml
locale:
  language: en
```

Supported languages include English, Chinese (Simplified, Traditional TW/HK),
Spanish, French, Norwegian, Dutch, Japanese, German, Indonesian, and Brazilian
Portuguese. See the [locale docs](https://yamlresume.dev/docs/locale) for the
full list.

## Ecosystem

YAMLResume provides a set of tools to help you create, convert, and manage your
resumes more efficiently:

- [`@yamlresume/ai`](https://www.npmjs.com/package/@yamlresume/ai) —
  Programmatic AI-powered resume generation.
- [`@yamlresume/playground`](https://www.npmjs.com/package/@yamlresume/playground)
  — Embeddable React component for building your own resume editor. It powers
  the official [Playground](https://yamlresume.dev/playground).
- [`@yamlresume/samples`](https://www.npmjs.com/package/@yamlresume/samples) —
  Curated sample resumes for common positions in 12 locales.
- [`yamlresume/action`](https://github.com/marketplace/actions/yamlresume) —
  GitHub Action for automating resume builds in CI/CD.
- [`create-yamlresume`](https://yamlresume.dev/docs/ecosystem/create-yamlresume)
  — Scaffold a new YAMLResume project with one command.
- [`json2yamlresume`](https://yamlresume.dev/docs/ecosystem/json2yamlresume) —
  Convert [JSON Resume](https://jsonresume.org/) files to YAMLResume format.
- [Docker image](https://hub.docker.com/r/yamlresume/yamlresume) and
  [Homebrew formula](https://formulae.brew.sh/formula/yamlresume) for easy
  installation.

## Contributing

YAMLResume is under active development and new features land regularly.
Contributions are deeply appreciated. Please read the
[guidelines](./CONTRIBUTING.md) before submitting a pull request.

### Star History

[![YAMLResume Star History Chart](https://star-history.dera.page/svg?repos=yamlresume/yamlresume&type=Date)](https://star-history.dera.page/#yamlresume/yamlresume&Date)

## Roadmap

- [ ] more resume templates
- [ ] more layout engines (typst, and others)
- [ ] more languages and locales
- [ ] ATS optimization features

## Support the Project

If you find YAMLResume helpful, please consider supporting the project:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
