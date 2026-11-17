# YAMLResume

[English](../README.md) | [Français](./README-fr.md) | [Deutsch](./README-de.md) | [Español](./README-es.md) | [Português](./README-pt.md) | [Bahasa Indonesia](./README-id.md) | [日本語](./README-ja.md) | [简体中文](./README-zh-cn.md) | [繁體中文](./README-zh-tw.md)

**Lebensläufe als Code.** Schreiben Sie Ihren Lebenslauf in Klartext-YAML,
versionieren Sie ihn mit Git und kompilieren Sie ihn mit einem einzigen Befehl
zu pixelgenauen PDFs, HTML, Markdown und DOCX.

[![GitHub CI](https://github.com/yamlresume/yamlresume/workflows/test/badge.svg)](https://github.com/yamlresume/yamlresume/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/yamlresume.svg?style=flat-square&logo=npm)](https://www.npmjs.com/package/yamlresume)
[![npm downloads](https://img.shields.io/npm/dm/yamlresume.svg?style=flat-square&logo=npm&color=CB3837)](https://www.npmjs.com/package/yamlresume)
[![GitHub stars](https://img.shields.io/github/stars/yamlresume/yamlresume?style=flat-square&logo=github&color=gold)](https://github.com/yamlresume/yamlresume)
[![Documentation](https://img.shields.io/badge/docs-yamlresume.dev-blue?style=flat-square&logo=gitbook)](https://yamlresume.dev)
[![License](https://img.shields.io/github/license/yamlresume/yamlresume?style=flat-square)](../LICENSE)

> **Neuigkeiten:**
> [YAMLResume v0.18](https://github.com/yamlresume/yamlresume/releases) bringt
> die Typst-Engine, dazu kuratierte Beispiel-Lebensläufe in 13 Gebietsschemata
> sowie KI-gestützte Generierung und Übersetzung. Werfen Sie außerdem einen
> Blick auf die
> [YAMLResume GitHub Action](https://github.com/marketplace/actions/yamlresume),
> um PDF-Builds in CI/CD zu automatisieren.

![YAMLResume verwandelt eine YAML-Datei in ein gesetztes PDF](../docs/static/images/yamlresume-yaml-and-pdf.webp)

## Warum YAMLResume

- **Formatierung ist nicht Ihre Aufgabe.** Ihr Inhalt bleibt von der Darstellung
  getrennt; der Compiler kümmert sich um Schriften, Abstände, Ränder und
  Seitenumbrüche.
- **Ihr Lebenslauf wird überprüfbar.** Diff, Blame, Branch und Revert für einen
  Lebenslauf wie für Code. Jede Version ist ein Commit.
- **Eine Datei, jedes Format.** Recruiter wollen PDF, manche Portale DOCX, Ihre
  Website HTML. Ändern Sie einen Abschnitt, und alle aktualisieren sich
  gemeinsam.
- **Fehler schlagen früh und laut fehl.** Ein strenges Schema erkennt ein
  falsches Datum oder einen falsch geschriebenen Abschnitt, bevor Sie ihn
  versenden — nicht erst nach dem Vorstellungsgespräch.

## Schnellstart

Probieren Sie es ohne Installation im
[Playground](https://yamlresume.dev/playground) — kein Setup, kein LaTeX,
Live-Vorschau.

Über die Kommandozeile erhalten Sie mit `npx` in zwei Befehlen einen
funktionierenden Lebenslauf:

```sh
npx yamlresume new resume.yml   # erstellt einen vollständigen, gültigen Lebenslauf
npx yamlresume build resume.yml # kompiliert jedes konfigurierte Layout
```

Die LaTeX-PDF-Ausgabe benötigt eine TeX-Engine auf Ihrem Rechner. Ohne eine
solche fügen Sie `--no-pdf` hinzu und erhalten trotzdem HTML, Markdown und DOCX,
oder Sie verwenden das unten stehende Docker-Image, das alles mitbringt.

<details>
<summary>Dauerhaft installieren (npm, pnpm, yarn, bun, Homebrew, Docker)</summary>

Für die Installation über Paket-Manager ist Node.js >= 22 erforderlich:

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

Das Docker-Image enthält die CLI, XeTeX, Typst und die empfohlenen Schriften,
sodass nichts weiter installiert werden muss:

```sh
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume new my-resume.yml
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume build my-resume.yml
```

[![YAMLResume Docker Demo](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

</details>

Die PDF-Ausgabe benötigt eine Satz-Engine (XeTeX oder Typst). Prüfen Sie, was
Ihrem Rechner fehlt:

```sh
yamlresume doctor
```

Die vollständige Einrichtung, einschließlich Engine- und Schriftinstallation,
finden Sie in der [Installationsanleitung](https://yamlresume.dev/docs/installation).

## Ihr Lebenslauf ist nur YAML

Kein proprietäres Format, keine Datenbank, kein Konto:

```yml
# yaml-language-server: $schema=https://yamlresume.dev/schema.json
content:
  basics:
    name: Andy Dufresne
    headline: Backend Engineer
    email: andy@example.com
    summary: Backend engineer with 6 years building distributed systems.
  work:
    - name: PPResume
      position: Senior Engineer
      startDate: Jan 2022
      summary: Rewrote the typesetting engine; cut p99 latency by 40%.
  education:
    - institution: University of Southern California
      area: Computer Science
      degree: Bachelor
```

Diese `yaml-language-server`-Zeile ist die ganze Editor-Geschichte: Sie
aktiviert Autovervollständigung, Hover-Dokumentation und Inline-Validierung in
VS Code, Neovim, JetBrains oder jedem anderen Editor, der auf dem
[YAML Language Server](https://github.com/redhat-developer/yaml-language-server)
basiert.

Kompilieren:

```sh
$ yamlresume build resume.yml
✔ Generated resume html file successfully: resume.html
✔ Generated resume tex file successfully: resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error resume.tex...
✔ Generated resume pdf file successfully: resume.tex.pdf
✔ Generated resume docx file successfully: resume.docx
✔ Generated resume markdown file successfully: resume.md
✔ Generated resume typ file successfully: resume.typ
◐ Generating resume pdf file with command: typst compile resume.typ resume.typ.pdf...
✔ Generated resume pdf file successfully: resume.typ.pdf
```

Zwei PDFs, weil die Standard-Layouts beide PDF-Engines aktivieren; deaktivieren
Sie eine in `layouts:`, behält die andere den einfachen Namen `resume.pdf`.

Oder ein Neubau bei jedem Speichern, wie bei einem Web-Dev-Server:

```sh
yamlresume dev resume.yml
```

Sehen Sie sich das Ergebnis an: [PDF](../docs/static/images/resume.pdf) ·
[Seite 1](../docs/static/images/resume-1.webp) ·
[Seite 2](../docs/static/images/resume-2.webp)

![Software Engineer Page 1](../docs/static/images/resume-1.webp)
![Software Engineer Page 2](../docs/static/images/resume-2.webp)

Lieber mit etwas Echtem beginnen? `yamlresume new --sample <id>` erstellt einen
von 20 kuratierten Lebensläufen, und `yamlresume samples list` zeigt, was
verfügbar ist.

## Funktionen auf einen Blick

- **Eine Quelle, fünf Engines.** LaTeX, Typst, HTML, Markdown und DOCX aus einer
  einzigen `resume.yml`.
- **Ein echter Lebenslauf-Compiler.** Parsen, validieren, transformieren,
  rendern — mit Zod-Laufzeitvalidierung und JSON-Schema-Integration im Editor.
- **Hervorragende Entwicklererfahrung.** `yamlresume dev` für den Watch-Modus,
  `yamlresume doctor` für Umgebungsdiagnose, `yamlresume validate` für Fehler im
  Clang-Stil.
- **KI-gestützte Generierung und Übersetzung.** Erstellen Sie einen Lebenslauf
  aus einer Berufsbezeichnung oder übersetzen Sie einen bestehenden, ohne YAML
  von Hand zu bearbeiten.
- **Standardmäßig global.** 11 Sprachen über 13 Locale-Codes, dazu Typografie,
  Papierformat und Abschnittsreihenfolge pro Vorlage.

## Vorlagen

Neun Vorlagen über fünf Engines. Jede Vorschau unten ist derselbe Lebenslauf und
dasselbe YAML, gerendert von einer anderen Engine — klicken Sie, um sie in der
[Galerie](https://yamlresume.dev/gallery/templates) zu öffnen.

<table>
<tr>
<td align="center" width="33%">
<a href="https://yamlresume.dev/gallery/templates/latex/jake"><img src="../docs/static/images/templates/latex-jake.webp" alt="LaTeX-Vorlage Jake"></a>
<br><b>Jake</b> · LaTeX
<br><sub>Schlicht, einspaltig, geradlinig</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/gallery/templates/latex/moderncv-banking"><img src="../docs/static/images/templates/latex-moderncv-banking.webp" alt="LaTeX-Vorlage ModernCV Banking"></a>
<br><b>ModernCV Banking</b> · LaTeX
<br><sub>ModernCVs konservativer Banking-Stil</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/gallery/templates/latex/moderncv-casual"><img src="../docs/static/images/templates/latex-moderncv-casual.webp" alt="LaTeX-Vorlage ModernCV Casual"></a>
<br><b>ModernCV Casual</b> · LaTeX
<br><sub>ModernCVs lockerer, weniger formeller Stil</sub>
</td>
</tr>
<tr>
<td align="center" width="33%">
<a href="https://yamlresume.dev/gallery/templates/latex/moderncv-classic"><img src="../docs/static/images/templates/latex-moderncv-classic.webp" alt="LaTeX-Vorlage ModernCV Classic"></a>
<br><b>ModernCV Classic</b> · LaTeX
<br><sub>ModernCVs klassisches Layout</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/gallery/templates/typst/jake"><img src="../docs/static/images/templates/typst-jake.webp" alt="Typst-Vorlage Jake"></a>
<br><b>Jake</b> · Typst
<br><sub>Jakes Layout, gerendert mit Typst</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/gallery/templates/html/calm"><img src="../docs/static/images/templates/html-calm.webp" alt="HTML-Vorlage Calm"></a>
<br><b>Calm</b> · HTML
<br><sub>Schlicht und minimalistisch, für alle Berufe</sub>
</td>
</tr>
<tr>
<td align="center" width="33%">
<a href="https://yamlresume.dev/gallery/templates/html/kami"><img src="../docs/static/images/templates/html-kami.webp" alt="HTML-Vorlage Kami"></a>
<br><b>Kami</b> · HTML
<br><sub>Warmes Pergament, eine einzige Serif-Stimme</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/gallery/templates/html/vscode"><img src="../docs/static/images/templates/html-vscode.webp" alt="HTML-Vorlage VS Code"></a>
<br><b>VS Code</b> · HTML
<br><sub>Dunkles Theme für Entwickler-Lebensläufe</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/gallery/templates/docx/calm"><img src="../docs/static/images/templates/docx-calm.webp" alt="DOCX-Vorlage Calm"></a>
<br><b>Calm</b> · DOCX
<br><sub>Bearbeitbare Word-Datei, gleiches klares Layout</sub>
</td>
</tr>
</table>

Führen Sie `yamlresume templates list` aus, um zu sehen, was Ihre Installation
mitbringt, und `yamlresume build`, um jedes konfigurierte Layout zu rendern.

Vorlagen sind nur der Anfang — Typografie, Ränder, Papierformat, Symbole und
Abschnittsreihenfolge sind pro Layout konfigurierbar.

## Ein Lebenslauf, viele Layouts

Layouts entkoppeln Ihren Inhalt von der Darstellung. Deklarieren Sie so viele
Ausgabeformate, wie Sie benötigen:

```yml
layouts:
  - engine: latex
    template: moderncv-banking
    typography:
      fontSize: 11pt
  - engine: typst
    template: jake
  - engine: markdown
  - engine: html
    template: calm
  - engine: docx
    template: calm
```

Erfahren Sie mehr über jede Engine:
[LaTeX / PDF](https://yamlresume.dev/docs/layouts/latex) ·
[Typst / PDF](https://yamlresume.dev/docs/layouts/typst) ·
[HTML](https://yamlresume.dev/docs/layouts/html) ·
[Markdown](https://yamlresume.dev/docs/layouts/markdown) ·
[DOCX](https://yamlresume.dev/docs/layouts/docx)

## Lebensläufe validieren

Führen Sie `yamlresume validate resume.yml` für Diagnosen im Compiler-Stil aus,
im Terminal und in CI:

![Ausgabe von yamlresume validate](../docs/static/images/yamlresume-validate.webp)

Das Schema selbst wird unter
[yamlresume.dev/schema.json](https://yamlresume.dev/schema.json) veröffentlicht.
Details finden Sie in der
[Schema-Dokumentation](https://yamlresume.dev/docs/compiler/schema).

## KI-gestützte Generierung

Erzeugen Sie einen vollständigen, schema-konformen Ausgangspunkt aus einer
Position und Sprache:

```sh
export OPENAI_API_KEY=sk-...
yamlresume ai generate --position "Software Engineer" --language en resume.yml
```

Oder übersetzen Sie einen bestehenden Lebenslauf in eine andere Locale, ohne das
YAML anzufassen:

```sh
yamlresume ai translate resume.yml resume-ja.yml --to ja
```

Unterstützte Anbieter sind OpenAI, DeepSeek, Kimi und Ollama. Details zur
Einrichtung finden Sie in der [AI-Dokumentation](https://yamlresume.dev/docs/ai).

## Sprachen

Lokalisierung ist eingebaut. Setzen Sie Ihre Locale in `resume.yml`, oder führen
Sie `yamlresume languages list` aus:

```yml
locale:
  language: en
```

Unterstützt: Englisch, vereinfachtes Chinesisch, traditionelles Chinesisch
(Hongkong und Taiwan), Spanisch, Französisch, Italienisch, Norwegisch,
Niederländisch, Japanisch, Deutsch, Indonesisch und brasilianisches Portugiesisch
— 11 Sprachen über 13 Locale-Codes. Die vollständige Liste finden Sie in der
[Locale-Dokumentation](https://yamlresume.dev/docs/locale).

## Ökosystem

| Paket | Was es tut |
| ------- | ------------ |
| [`yamlresume`](https://www.npmjs.com/package/yamlresume) | Die CLI: build, dev, validate, generate, translate. |
| [`@yamlresume/ai`](https://www.npmjs.com/package/@yamlresume/ai) | Programmatische, KI-gestützte Lebenslauf-Generierung. |
| [`@yamlresume/playground`](https://www.npmjs.com/package/@yamlresume/playground) | Einbettbare React-Komponente für Editor und Vorschau. |
| [`@yamlresume/samples`](https://www.npmjs.com/package/@yamlresume/samples) | Kuratierte Beispiel-Lebensläufe in 13 Locales. |
| [`create-yamlresume`](https://yamlresume.dev/docs/ecosystem/create-yamlresume) | Ein neues Projekt mit einem Befehl erstellen. |
| [`json2yamlresume`](https://yamlresume.dev/docs/ecosystem/json2yamlresume) | [JSON Resume](https://jsonresume.org/)-Dateien in YAML umwandeln. |
| [`yamlresume/action`](https://github.com/marketplace/actions/yamlresume) | Lebensläufe in GitHub Actions bauen. |
| [Docker](https://hub.docker.com/r/yamlresume/yamlresume) / [Homebrew](https://formulae.brew.sh/formula/yamlresume) | Ohne lokale Toolchain installieren. |

## FAQ

<details>
<summary>Brauche ich LaTeX?</summary>

Nur für die LaTeX-PDF-Ausgabe. HTML, Markdown und DOCX benötigen nichts außer
Node.js, und der [Playground](https://yamlresume.dev/playground) rendert sie im
Browser. Für PDF ohne lokale Toolchain verwenden Sie das Docker-Image, das
XeTeX, Typst und Schriften mitbringt.
</details>

<details>
<summary>Warum schlägt <code>build</code> mit <code>xelatex: command not found</code> fehl?</summary>

Keine TeX-Distribution in Ihrem `PATH`. Führen Sie `yamlresume doctor` für einen
Bericht pro Abhängigkeit aus, folgen Sie dann der
[Installationsanleitung](https://yamlresume.dev/docs/installation), oder
entfernen Sie das LaTeX-Layout und bauen Sie stattdessen mit Typst.
</details>

<details>
<summary>Kann ich meinen vorhandenen JSON Resume verwenden?</summary>

Ja — `npx json2yamlresume` konvertiert eine
[JSON Resume](https://jsonresume.org/)-Datei in das YAMLResume-Format.
</details>

<details>
<summary>Wie baue ich meinen Lebenslauf automatisch neu?</summary>

Fügen Sie die
[GitHub Action](https://github.com/marketplace/actions/yamlresume) einem Workflow
hinzu, oder verwenden Sie lokal `yamlresume dev resume.yml` für Neubau beim
Speichern. In beiden Fällen ist das PDF ein Build-Artefakt, nie eine von Hand
bearbeitete Datei.
</details>

## Einen Beitrag leisten

YAMLResume befindet sich in aktiver Entwicklung und neue Funktionen werden
regelmäßig hinzugefügt. Beiträge sind ausdrücklich erwünscht — bitte lesen Sie
die [Richtlinien](../CONTRIBUTING.md) vor der Einreichung eines Pull Requests.

```sh
pnpm install
pnpm build   # Pakete importieren aus dem gebauten dist
pnpm test
pnpm check   # Biome + tsc
```

Werkzeuge: TypeScript, [Biome](https://biomejs.dev/) für Lint und Format,
[Vitest](https://vitest.dev/) für Tests mit 100-%-Coverage-Gate, PNPM
Workspaces und [Conventional Commits](https://conventionalcommits.org).
Docker- und Homebrew-Formeln werden aus diesem Repository gebaut, daher gehören
Packaging-Änderungen ebenfalls hierhin.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PNPM](https://img.shields.io/badge/PNPM-Workspace-orange?style=flat-square&logo=pnpm)](https://pnpm.io/)
[![Biome](https://img.shields.io/badge/Biome-Linted-60a5fa?style=flat-square&logo=biome)](https://biomejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-Tested-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-FE5196?style=flat-square&logo=conventionalcommits)](https://conventionalcommits.org)
[![Discord](https://img.shields.io/discord/1371488902023479336?style=flat-square&logo=discord&color=5865F2)](https://discord.gg/9SyT7mVV4K)

### Star-Historie

[![YAMLResume Star History Chart](https://api.star-history.com/chart?repos=yamlresume/yamlresume&type=date&legend=top-left)](https://www.star-history.com/?repos=yamlresume%2Fyamlresume&type=date&legend=top-left)

## Roadmap

- [ ] mehr Lebenslauf-Vorlagen
- [ ] mehr Sprachen und Gebietsschemata
- [ ] ATS-Optimierungsfunktionen

## Das Konstruktionsprinzip

Dieses Projekt begann als Kern-Satzengine für
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
- **Darstellung** wird durch austauschbare Layout-Engines (LaTeX, Typst, HTML,
  Markdown, DOCX) übernommen.

Sie bearbeiten das Was; YAMLResume kümmert sich um das Wie.

## Das Projekt unterstützen

Wenn Sie YAMLResume nützlich finden, ziehen Sie bitte in Betracht, das Projekt
zu unterstützen:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
