# YAMLResume

<!-- Build, Quality & Docs -->
[![GitHub CI](https://github.com/yamlresume/yamlresume/workflows/test/badge.svg)](https://github.com/yamlresume/yamlresume/actions/workflows/test.yml)
[![Security Rating](https://img.shields.io/badge/Security-A+-brightgreen?style=flat-square&logo=shield)](https://github.com/yamlresume/yamlresume/security)
[![Documentation](https://img.shields.io/badge/docs-yamlresume.dev-blue?style=flat-square&logo=gitbook)](https://yamlresume.dev)
[![Discord](https://img.shields.io/discord/1371488902023479336?style=flat-square&logo=discord&color=5865F2)](https://discord.gg/9SyT7mVV4K)

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


Writing resumes may not be hard, but it is definitely not fun and tedious.

[YAMLResume](https://yamlresume.dev) allows you to manage and version control
your resumes using [YAML](https://yaml.org/) and generate professional looking
PDFs with beautiful typesetting in a breeze.

![YAMLResume YAML and PDF](./docs/static/images/yamlresume-yaml-and-pdf.webp)

## The Design Principle

This project was started as the core typesetting engine for
[PPResume](https://ppresume.com/?ref=yamlresume), a LaTeX based, pixel perfect
resume builder. After careful consideration, we decided to open source it so
people can always have the right to say [no to vendor
lock-in](https://blog.ppresume.com/posts/no-vendor-lock-in).

The core design principle of YAMLResume is [Separation of
Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns). One of the most
famous examples that follows this principle is HTML & CSS, which are the
foundation of the modern web—HTML is used for organization of webpage content,
CSS is used for definition of content presentation style.

Following the core principle, YAMLResume is implemented by satisfying the
following requirements:

- the resume content is drafted in plain text
- the plain text is structured using YAML—YAML is better than JSON because it is
  more human-readable and human-writable
- the YAML plain text is then rendered into a PDF with a pluggable typesetting
  engine
- the layout can be adjusted with options like font sizes, page margins, etc.

## Quick Start

If you have docker installed, you can get started with `yamlresume` in one
second, this has packaged `yamlresume` and all its dependencies:

[![YAMLResume Docker Demo](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

Otherwise you can install `yamlresume` with your favorite JavaScript package
manager:

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

Verify `yamlresume` is installed successfully:

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
  -V, --version             output the version number
  -v, --verbose             verbose output
  -h, --help                display help for command

Commands:
  new [filename]            create a new resume
  build [options] <source>  build a resume to LaTeX and PDF
  languages                 i18n and l10n support
  templates                 manage resume templates
  help [command]            display help for command
```

You then need to install a typesetting engine,
[XeTeX](http://yamlresume.dev/docs/getting-started#xetex) or
[Tectonic](http://yamlresume.dev/docs/getting-started#xetex) in order to
generate PDFs.

Last but not least, we recommend you to install [Linux
Libertine](http://yamlresume.dev/docs/getting-started#linux-libertine) font in
order to get the best looking PDFs.

Check our [installation guide](http://yamlresume.dev/docs/installation) for more
details.

## Create a new resume

You can create your own resume by cloning one of our sample resumes
[here](./packages/cli/resources/software-engineer.yml), so once you have the
sample resume on your local, you can get a pdf with:

```
$ yamlresume new my-resume.yml
✔ Created my-resume.yml successfully.

$ yamlresume build my-resume.yml
◐ Generating resume PDF with command: xelatex -halt-on-error my-resume.tex...
✔ Generated resume PDF file successfully.
```

Check the generated PDF [here](./packages/cli/resources/resume.pdf).

![Software Engineer Page 1](./docs/static/images/resume-1.webp)
![Software Engineer Page 2](./docs/static/images/resume-2.webp)

[PPResume Gallery](https://ppresume.com/gallery/?ref=yamlresume) provides a
showcase for all possible kind of resumes categoried by languages and templates.

More samples would come soon!

## Typesetting

YAMLResume adopts [LaTeX](https://www.latex-project.org/) as the default
typesetting engine, which is the state of the art typesetting system in the
academic and technical publishing industry.

Meanwhile, by following the [resume typesetting best
practices](https://docs.ppresume.com/guide?ref=yamlresume), YAMLResume always
guarantees you **Pixel Perfect** resumes.

In the future we may support other typesetting engines like
[Typst](https://github.com/typst/typst), HTML/CSS, etc.

## Contributing

This project is still under active development, we are constantly working on
new features and bug fixes. The public API is not stable yet, so please be
patient and spare us some time.

Any kind of contributions will be deeply appreciated! Please read the
[contributing guidelines](./CONTRIBUTING.md) before submitting a pull request.

### Star History

[![YAMLResume Star History Chart](https://api.star-history.com/svg?repos=yamlresume/yamlresume&type=Date)](https://www.star-history.com/#yamlresume/yamlresume&Date)

## Roadmap

- [ ] support more font families
- [ ] section alias
- [ ] section reordering
- [ ] section cloning
- [ ] more resume templates
- [ ] more locale languages
