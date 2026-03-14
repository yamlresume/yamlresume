# YAMLResume

[English](../README.md) | [Français](./README-fr.md) | [Deutsch](./README-de.md) | [Español](./README-es.md) | [Português](./README-pt.md) | [Bahasa Indonesia](./README-id.md) | [日本語](./README-ja.md) | [简体中文](./README-zh-cn.md) | [繁體中文](./README-zh-tw.md)

<!-- Build, Quality & Docs -->
[![GitHub CI](https://github.com/yamlresume/yamlresume/workflows/test/badge.svg)](https://github.com/yamlresume/yamlresume/actions/workflows/test.yml)
[![Codecov](https://img.shields.io/codecov/c/github/yamlresume/yamlresume?style=flat-square&logo=codecov)](https://codecov.io/gh/yamlresume/yamlresume)
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

> 📢 **Novidades:** O [YAMLResume GitHub
> Action](https://github.com/marketplace/actions/yamlresume) foi lançado!
> Automatize a geração de PDFs do seu currículo diretamente na sua pipeline CI/CD. Confira
> a [documentação](https://yamlresume.dev/docs/ecosystem/action) e a
> [postagem de anúncio no blog](https://yamlresume.dev/blog/yamlresume-action).

Escrever currículos pode não ser difícil, mas definitivamente não é divertido e é tedioso.

[YAMLResume](https://yamlresume.dev) permite que você gerencie e controle a versão dos seus
currículos usando [YAML](https://yaml.org/) e torna a geração de PDFs com aparência profissional
e tipografia agradável muito fácil.

![YAMLResume YAML and PDF](../docs/static/images/yamlresume-yaml-and-pdf.webp)

## O Princípio de Design

Este projeto começou como o motor principal de tipografia para
[PPResume](https://ppresume.com/?ref=yamlresume), um construtor de currículos baseado
em LaTeX. Após cuidadosa consideração, decidimos torná-lo de código aberto para que
as pessoas sempre tenham o direito de dizer [não ao vendor
lock-in](https://blog.ppresume.com/posts/no-vendor-lock-in).

O principal princípio de design por trás do YAMLResume é a [Separação de
Preocupações](https://pt.wikipedia.org/wiki/Separa%C3%A7%C3%A3o_de_conceitos). Um dos
melhores exemplos conhecidos desse princípio é HTML e CSS, que formam a base
da web moderna. O HTML define o conteúdo da página, e o CSS o estiliza.

Seguindo esse princípio, projetamos o YAMLResume com os seguintes requisitos em
mente:

- o conteúdo do currículo é elaborado em texto simples
- o texto simples é estruturado usando YAML — YAML é melhor que JSON porque é
  mais legível por humanos
- o texto simples YAML é então renderizado em um PDF com um motor conectável
- o layout pode ser ajustado com opções como tamanhos de fonte, margens da página, etc.

## Início Rápido

Se você tem o Docker instalado, pode começar com `yamlresume` em um
segundo, este pacote inclui `yamlresume` e todas as suas dependências:

[![YAMLResume Docker Demo](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

Como alternativa, você pode instalar localmente usando seu gerenciador favorito:

```
# NPM
$ npm install -g yamlresume

# Yarn
$ yarn global add yamlresume

# pnpm
$ pnpm add -g yamlresume

# Bun
$ bun add -g yamlresume

# Homebrew
$ brew install yamlresume
```

Verifique se a instalação foi bem-sucedida:

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

## Criar um novo currículo

Você pode criar seu próprio currículo clonando um de nossos exemplos
[aqui](../packages/cli/src/commands/fixtures/software-engineer.yml).

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

Você também pode usar o [comando `dev`](https://yamlresume.dev/docs/cli#dev) para
reconstruir a cada mudança de arquivo, o que fornece **uma experiência de
desenvolvimento web moderna**:

```
$ yamlresume dev my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
◐ Watching file changes: my-resume.yml...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume markdown file successfully: my-resume.md
```

Temos vários resumos disponíveis em nosso site para servir de inspiração e templates práticos.

## Validação de currículos

YAMLResume fornece um
[schema](https://yamlresume.dev/docs/compiler/schema) embutido que você pode usar
para validar e evitar erros de baixo nível.

## Tipografia

O projeto permite utilizar [HTML/CSS layout](https://yamlresume.dev/docs/layouts/html) juntamente
com o sistema original do LaTeX.

## Colaboradores e Ecossistema

- [@yamlresume/playground](https://www.npmjs.com/package/@yamlresume/playground)
  é um componente React para criar seu próprio editor. Potencializa o
  [Playground](https://yamlresume.dev/playground) oficial.
- [create-yamlresume](https://yamlresume.dev/docs/ecosystem/create-yamlresume)
  facilita a iniciar um novo projeto instantaneamente.

## Suporte

Se você considera o YAMLResume útil, considere apoiar o projeto:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
