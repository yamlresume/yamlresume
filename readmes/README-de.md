# YAMLResume

[English](../README.md) | [Français](./README-fr.md) | [Deutsch](./README-de.md) | [Español](./README-es.md) | [Português](./README-pt.md) | [Bahasa Indonesia](./README-id.md) | [日本語](./README-ja.md) | [简体中文](./README-zh-cn.md) | [繁體中文](./README-zh-tw.md)

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

> **Neuigkeiten:**
> [YAMLResume v0.15](https://github.com/yamlresume/yamlresume/releases) ist mit
> kuratierten Beispiel-Lebensläufen in 12 Gebietsschemata und KI-gestützter
> Lebenslauf-Generierung erschienen. Werfen Sie außerdem einen Blick auf die
> [YAMLResume GitHub Action](https://github.com/marketplace/actions/yamlresume),
> um PDF-Builds in CI/CD zu automatisieren.

Lebensläufe zu schreiben ist vielleicht nicht schwer, aber es macht definitiv keinen Spaß und ist mühsam.

[YAMLResume](https://yamlresume.dev) ermöglicht es Ihnen, Ihre Lebensläufe als Klartext-[YAML](https://yaml.org/) zu verwalten und zu versionieren und sie mit einem einzigen Befehl in wunderschön gesetzte, professionelle Dokumente zu verwandeln.

![YAMLResume Playground](../docs/static/images/yamlresume-playground.webp)

## Das Konstruktionsprinzip

Dieses Projekt begann als Kernsatzenigne für
[PPResume](https://ppresume.com/?ref=yamlresume), einen LaTeX-basierten,
pixelgenauen Lebenslauf-Baukasten. Nach reiflicher Überlegung haben wir uns
entschieden, es quelloffen zu machen, damit Menschen immer
[nein zum Vendor Lock-in](https://blog.ppresume.com/posts/no-vendor-lock-in)
sagen können.

YAMLResume folgt dem Prinzip der
[Trennung von Anliegen](https://de.wikipedia.org/wiki/Trennung_der_Belange):

- **Inhalt** wird in Klartext-YAML gespeichert.
- **Struktur und Validierung** werden vom Compiler und einem strengen Schema
  erzwungen.
- **Darstellung** wird durch austauschbare Layout-Engines (LaTeX, HTML,
  Markdown, DOCX) übernommen.

Sie bearbeiten das Was; YAMLResume kümmert sich um das Wie.

## Funktionen auf einen Blick

- **Eine Quelle, mehrere Ausgaben.** Aus einer einzigen `resume.yml` lassen sich
  pixelgenaue PDFs (über LaTeX), sauberes Markdown, responsives HTML und
  Microsoft Word DOCX-Dateien generieren.
- **Ein echter Lebenslauf-Compiler.** Parsen, validieren, transformieren und
  rendern. Fehler frühzeitig erkennen dank Zod-Laufzeitvalidierung und
  JSON-Schema-Editor-Integration.
- **Hervorragende Entwicklererfahrung.** Watch-Modus mit `yamlresume dev`,
  Umgebungsdiagnose mit `yamlresume doctor` und sofortige Schema-Validierung.
- **KI-gestützte Generierung.** Bootstrappen Sie einen vollständigen Lebenslauf
  aus einer Berufsbezeichnung und einem Gebietsschema mit
  `yamlresume ai generate`.
- **Flexible Layouts.** Abschnitte umbenennen und neu anordnen, Vorlagen
  wechseln, Typografie, Papierformat, Zeilenabstand anpassen und Symbole
  ein-/ausblenden.
- **Globale i18n.** Eingebaute Unterstützung für 10 Sprachen in 12
  Gebietsschemata.
- **Reichhaltiges Ökosystem.** Docker-Image, Homebrew-Formel, GitHub Action,
  einbettenbarer Playground, kuratierte Beispiele und ein JSON-Resume-Konverter.

## Schnellstart

Der schnellste Weg, YAMLResume auszuprobieren, ist mit Docker. Das Image bringt
die CLI, XeTeX und empfohlene Schriftarten mit:

```sh
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume new my-resume.yml
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume build my-resume.yml
```

[![YAMLResume Docker Demo](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

Sie können `yamlresume` auch über Ihren bevorzugten Paket-Manager installieren
(Node.js >= 22 ist erforderlich):

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

Überprüfen Sie die Installation und Ihre Umgebung:

```sh
yamlresume help
yamlresume doctor
```

Detaillierte Installationshinweise, einschließlich der Einrichtung einer
Satz-Engine, finden Sie in der
[Installationsanleitung](https://yamlresume.dev/docs/installation).

## Einen neuen Lebenslauf erstellen

Sie können Ihren eigenen Lebenslauf erstellen, indem Sie einen unserer
Beispiel-Lebensläufe
[hier](../packages/cli/src/commands/fixtures/software-engineer.yml) klonen.
Sobald Sie den Beispiel-Lebenslauf auf Ihrem Computer haben, können Sie mit
folgendem Befehl ein PDF generieren:

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

Sie können auch den [`dev`-Befehl](https://yamlresume.dev/docs/cli#dev)
verwenden, um den Lebenslauf bei jeder Dateiänderung neu zu erstellen, was ein
**Erlebnis wie bei moderner Webentwicklung** bietet:

```sh
$ yamlresume dev my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
◐ Watching file changes: my-resume.yml...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume docx file successfully: my-resume.docx
✔ Generated resume markdown file successfully: my-resume.md
```

Sehen Sie sich das generierte PDF
[hier](../docs/static/images/resume.pdf) an.

![Software Engineer Page 1](../docs/static/images/resume-1.webp)
![Software Engineer Page 2](../docs/static/images/resume-2.webp)

Die [PPResume Gallery](https://ppresume.com/gallery/?ref=yamlresume) zeigt eine
Übersicht aller möglichen Lebenslauf-Typen, sortiert nach Sprachen und
Vorlagen.

## Mehrere Layout-Ausgaben

Layouts entkoppeln Ihren Inhalt von der Darstellung. Fügen Sie in `resume.yml`
so viele Ausgabeformate hinzu, wie Sie benötigen:

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

Erfahren Sie mehr über jede Engine:

- [LaTeX / PDF](https://yamlresume.dev/docs/layouts/latex)
- [HTML](https://yamlresume.dev/docs/layouts/html)
- [Markdown](https://yamlresume.dev/docs/layouts/markdown)
- [DOCX](https://yamlresume.dev/docs/layouts/docx)

## Watch-Modus

Verwenden Sie `yamlresume dev`, um Ihren Lebenslauf beim Bearbeiten der
YAML-Datei automatisch neu zu erstellen:

```sh
yamlresume dev my-resume.yml
```

Das gibt Ihnen eine schnelle Feedback-Schleife ähnlich der modernen
Webentwicklung: Speichern Sie die Datei, und das PDF wird Momente später
aktualisiert. Sie können `--no-pdf` oder `--no-validate` übergeben, um beim
Entwurf Zeit zu sparen.

## Lebensläufe validieren

YAMLResume bietet ein eingebautes
[Schema](https://yamlresume.dev/docs/compiler/schema), das Ihren Lebenslauf
vor dem Rendern validiert. Fügen Sie den Schema-Header zu Ihrer YAML-Datei
hinzu, um IDE-Autovervollständigung, Hover-Dokumentation und
Echtzeit-Formatprüfungen zu erhalten:

```yml
# yaml-language-server: $schema=https://yamlresume.dev/schema.json
```

Führen Sie `yamlresume validate my-resume.yml` für Diagnosen im Clang-Stil
aus:

![YAMLResume validate output](../docs/static/images/yamlresume-validate.webp)

## KI-gestützte Lebenslauf-Generierung

Neu in v0.14: `yamlresume ai generate` erstellt einen vollständigen,
schema-konformen Lebenslauf aus einer Position und Sprache:

```sh
export OPENAI_API_KEY=sk-...
yamlresume ai generate --position "Software Engineer" --language en resume.yml
```

Unterstützte Anbieter sind OpenAI, DeepSeek, Kimi und Ollama. Details zur
Einrichtung finden Sie in der
[AI-Dokumentation](https://yamlresume.dev/docs/ai).

## Vorlagen

YAMLResume wird mit einer wachsenden Sammlung von Vorlagen für verschiedene
Engines ausgeliefert:

| Engine | Vorlagen                                                          |
| ------ | ----------------------------------------------------------------- |
| LaTeX  | `moderncv-banking`, `moderncv-casual`, `moderncv-classic`, `jake` |
| HTML   | `calm`, `vscode`                                                  |
| DOCX   | `calm`                                                            |

Führen Sie `yamlresume templates list` aus, um alle installierten Vorlagen zu
sehen.

![HTML Calm template](../docs/static/images/html-calm-template.webp)
![HTML VS Code template](../docs/static/images/html-vscode-template.webp)
![DOCX Calm template](../docs/static/images/docx-calm-template.webp)

## Sprachen

YAMLResume unterstützt Lokalisierung von Haus aus. Setzen Sie Ihr
Gebietsschema in `resume.yml`:

```yml
locale:
  language: en
```

Unterstützte Sprachen sind Englisch, Chinesisch (vereinfacht, traditionell
TW/HK), Spanisch, Französisch, Norwegisch, Niederländisch, Japanisch, Deutsch,
Indonesisch und Brasilianisches Portugiesisch. Die vollständige Liste finden
Sie in der [Locale-Dokumentation](https://yamlresume.dev/docs/locale).

## Ökosystem

YAMLResume bietet eine Reihe von Tools, die Ihnen helfen, Lebensläufe
effizienter zu erstellen, zu konvertieren und zu verwalten:

- [`@yamlresume/ai`](https://www.npmjs.com/package/@yamlresume/ai) —
  Programmatische, KI-gestützte Lebenslauf-Generierung.
- [`@yamlresume/playground`](https://www.npmjs.com/package/@yamlresume/playground)
  — Einbettbare React-Komponente zum Erstellen eines eigenen
  Lebenslauf-Editors. Sie treibt den offiziellen
  [Playground](https://yamlresume.dev/playground) an.
- [`@yamlresume/samples`](https://www.npmjs.com/package/@yamlresume/samples) —
  Kuratierte Beispiel-Lebensläufe für gängige Positionen in 12
  Gebietsschemata.
- [`yamlresume/action`](https://github.com/marketplace/actions/yamlresume) —
  GitHub Action zur Automatisierung von Lebenslauf-Builds in CI/CD.
- [`create-yamlresume`](https://yamlresume.dev/docs/ecosystem/create-yamlresume)
  — Ein neues YAMLResume-Projekt mit einem Befehl erstellen.
- [`json2yamlresume`](https://yamlresume.dev/docs/ecosystem/json2yamlresume) —
  [JSON Resume](https://jsonresume.org/)-Dateien in das YAMLResume-Format
  konvertieren.
- [Docker-Image](https://hub.docker.com/r/yamlresume/yamlresume) und
  [Homebrew-Formel](https://formulae.brew.sh/formula/yamlresume) für eine
  einfache Installation.

## Einen Beitrag leisten

YAMLResume befindet sich in aktiver Entwicklung und neue Funktionen werden
regelmäßig hinzugefügt. Beiträge sind ausdrücklich erwünscht! Bitte lesen Sie
die [Richtlinien](../CONTRIBUTING.md) vor der Einreichung eines Pull Requests
durch.

### Star-Historie

[![YAMLResume Star History Chart](https://star-history.dera.page/svg?repos=yamlresume/yamlresume&type=Date)](https://star-history.dera.page/#yamlresume/yamlresume&Date)

## Roadmap

- [ ] mehr Lebenslauf-Vorlagen
- [ ] mehr Layout-Engines (Typst und andere)
- [ ] mehr Sprachen und Gebietsschemata
- [ ] ATS-Optimierungsfunktionen

## Das Projekt unterstützen

Wenn Sie YAMLResume nützlich finden, ziehen Sie bitte in Betracht, das Projekt
zu unterstützen:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
