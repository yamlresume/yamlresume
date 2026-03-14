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

> 📢 **Berita:** [YAMLResume GitHub
> Action](https://github.com/marketplace/actions/yamlresume) telah dirilis!
> Otomatiskan pembuatan PDF resume Anda langsung di pipeline CI/CD. Cek
> [dokumentasi](https://yamlresume.dev/docs/ecosystem/action) dan
> [artikel blog pengumuman](https://yamlresume.dev/blog/yamlresume-action).

Menulis CV/resume mungkin tidak sulit, tetapi pasti tidak menyenangkan dan melelahkan.

[YAMLResume](https://yamlresume.dev) memungkinkan Anda mengelola dan mengontrol versi resume
Anda menggunakan [YAML](https://yaml.org/) dan membuat dokumen PDF yang sangat profesional
menjadi sangat mudah.

![YAMLResume YAML and PDF](../docs/static/images/yamlresume-yaml-and-pdf.webp)

## Prinsip Desain

Proyek ini dimulai sebagai inti engine typesetting untuk
[PPResume](https://ppresume.com/?ref=yamlresume), pembuat resume berbasis LaTeX yang *pixel perfect*. Setelah pertimbangan, kami memutuskan untuk menjadikannya *open source* sehingga orang selalu memiliki hak untuk mengatakan [tidak pada *vendor lock-in*](https://blog.ppresume.com/posts/no-vendor-lock-in).

Prinsip desain YAMLResume adalah [*Separation of Concerns*](https://id.wikipedia.org/wiki/Pemisahan_keprihatinan). Contoh paling terkenal adalah HTML dan CSS yang mengubah wajah web. HTML mengatur tata letak dan konten dasar, sedangkan CSS menentukan gayanya.

Mengikuti prinsip ini, kami merancang YAMLResume dengan tujuan:

- konten resume dirancang/ditulis sebagai plain text
- teks tersebut distruktur dengan format YAML
- file teks YAML kemudian dirender ke PDF dengan engine typesetting opsional
- gaya tata letak (layout) dapat diubah, misalnya ukuran font dan margin garis halaman

## Mulai Cepat

Jika Anda memiliki Docker, Anda dapat memulai dengan `yamlresume` dalam
sekejap, paket Docker ini termasuk `yamlresume` dan seluruh dependensi:

[![YAMLResume Docker Demo](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

Alternatifnya, Anda dapat menginstal menggunakan *package manager* favorit:

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

Verifikasi instalasi `yamlresume`:

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

Lalu, instalkan engine typesetting `XeTeX` atau `Tectonic` agar bisa merender file PDF.

## Dukungan Proyek

Jika Anda merasa Proyek ini membantu, dukung kami di:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
