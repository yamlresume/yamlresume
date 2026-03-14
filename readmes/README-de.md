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

> 📢 **Neuigkeiten:** [YAMLResume GitHub
> Action](https://github.com/marketplace/actions/yamlresume) wurde veröffentlicht!
> Automatisieren Sie die PDF-Generierung Ihres Lebenslaufs direkt in Ihrer CI/CD-Pipeline. Schauen Sie sich die
> [Dokumentation](https://yamlresume.dev/docs/ecosystem/action) und den
> [Ankündigungs-Blogpost](https://yamlresume.dev/blog/yamlresume-action) an.

Lebensläufe zu schreiben ist vielleicht nicht schwer, aber es macht definitiv keinen Spaß und ist mühsam.

[YAMLResume](https://yamlresume.dev) ermöglicht es Ihnen, Ihre Lebensläufe mit [YAML](https://yaml.org/) zu verwalten
und versionszukontrollieren und macht die Generierung von professionell aussehenden PDFs
zu einem Kinderspiel.

![YAMLResume YAML and PDF](../docs/static/images/yamlresume-yaml-and-pdf.webp)

## Das Konstruktionsprinzip

Dieses Projekt begann als Kernstück für
[PPResume](https://ppresume.com/?ref=yamlresume), einen pixelgenauen Lebenslauf-Baukasten auf Basis
von LaTeX. Nach reiflicher Überlegung haben wir uns entschieden, es quelloffen zu machen, damit
Menschen immer das Recht haben, nein zum [Vendor Lock-in](https://blog.ppresume.com/posts/no-vendor-lock-in) zu sagen.

Das zentrale Konstruktionsprinzip von YAMLResume ist die [Trennung von Anliegen](https://de.wikipedia.org/wiki/Trennung_der_Belange). HTML und CSS sind das beste
Beispiel für dieses Prinzip, die das Fundament für das moderne Web bilden. HTML definiert den
Inhalt, und CSS formatiert ihn.

Indem wir dieses Prinzip befolgen, entwarfen wir YAMLResume mit den folgenden Anforderungen im
Kopf:

- der Inhalt des Lebenslaufs wird in einfachem Text verfasst
- der Text wird mit YAML strukturiert — YAML ist besser als JSON, weil es
  lesbarer und leichter zu schreiben ist
- der YAML-Klartext wird dann in ein PDF mit einer Plug-in-Typesetting-Engine umgewandelt
- das Layout kann mit Optionen wie Schriftgrößen, Seitenrändern usw. angepasst werden

## Schnellstart

Wenn Sie Docker installiert haben, können Sie in einer Sekunde mit `yamlresume` loslegen.
Dieses Paket enthält `yamlresume` und alle seine Abhängigkeiten:

[![YAMLResume Docker Demo](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

Alternativ können Sie `yamlresume` über Ihren bevorzugten Paket-Manager installieren:

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

Überprüfen Sie, ob `yamlresume` erfolgreich installiert wurde:

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

Sie müssen dann eine Typesetting-Engine installieren, entweder
[XeTeX](http://yamlresume.dev/docs#install-typesetting-engine) oder
[Tectonic](http://yamlresume.dev/docs#install-typesetting-engine), um
PDFs zu generieren.

Zu guter Letzt empfehlen wir, die [Linux Libertine](http://yamlresume.dev/docs#linux-libertine-font) Schriftart zu installieren, um die am besten
aussehenden PDFs zu erhalten.

Weitere Details finden Sie in unserer [Installationsanleitung](http://yamlresume.dev/docs/installation).

## Einen neuen Lebenslauf erstellen

Sie können Ihren eigenen Lebenslauf erstellen, indem Sie einen unserer Beispiel-Lebensläufe
[hier](../packages/cli/src/commands/fixtures/software-engineer.yml) klonen. Sobald Sie
den Beispiel-Lebenslauf auf Ihrem Computer haben, können Sie ein PDF generieren mit:

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

Sie können auch den [`dev` Befehl](https://yamlresume.dev/docs/cli#dev) verwenden, um
den Lebenslauf bei jeder Dateiänderung neu zu erstellen, was ein **modernes Web-Entwicklungs-Erlebnis**
bietet:

```
$ yamlresume dev my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
◐ Watching file changes: my-resume.yml...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume markdown file successfully: my-resume.md
```

## Lebensläufe validieren

YAMLResume bietet ein eingebautes
[Schema](https://yamlresume.dev/docs/compiler/schema), mit dem Sie Ihre
Lebensläufe validieren können.

## Satz und Layout

YAMLResume nutzt [LaTeX](https://www.latex-project.org/) als seine Standard-Infrastruktur.
Es unterstützt auch [HTML/CSS-basierte Layout-Engines](https://yamlresume.dev/docs/layouts/html).

## Ökosystem

- [@yamlresume/playground](https://www.npmjs.com/package/@yamlresume/playground)
  ist eine React-Komponente zum Erstellen Ihres eigenen Editors. Sie treibt das
  offizielle [Playground](https://yamlresume.dev/playground) an.
- [create-yamlresume](https://yamlresume.dev/docs/ecosystem/create-yamlresume)
  macht es einfach, ein neues Projekt zu starten.
- [json2yamlresume](https://yamlresume.dev/docs/ecosystem/json2yamlresume) ist ein
  CLI-Tool zur Konvertierung.

## Einen Beitrag leisten

Dieses Projekt befindet sich noch in der aktiven Entwicklung. Beiträge sind ausdrücklich erwünscht! Bitte lesen Sie die [Richtlinien](../CONTRIBUTING.md) vor der Einreichung eines Pull Requests durch.

### Star Historie

[![YAMLResume Star History Chart](https://api.star-history.com/svg?repos=yamlresume/yamlresume&type=Date)](https://www.star-history.com/#yamlresume/yamlresume&Date)

## Das Projekt unterstützen

Wenn Sie YAMLResume nützlich finden, ziehen Sie bitte in Betracht, das Projekt zu unterstützen:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
