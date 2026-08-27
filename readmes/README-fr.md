# YAMLResume

[English](../README.md) | [日本語](./README-ja.md) | [简体中文](./README-zh-cn.md) | [繁體中文](./README-zh-tw.md)

<!-- Build, Quality & Docs -->

[![GitHub CI](https://github.com/yamlresume/yamlresume/workflows/test/badge.svg)](https://github.com/yamlresume/yamlresume/actions/workflows/test.yml)
[![Documentation](https://img.shields.io/badge/docs-yamlresume.dev-blue?style=flat-square&logo=gitbook)](https://yamlresume.dev/fr)
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

> **Actualités :**
> [YAMLResume v0.15](https://github.com/yamlresume/yamlresume/releases) est disponible
> avec des exemples de CV adaptés pour 12 locales et une génération de CV
> assistée par IA.
> Découvrez également la
> [GitHub Action YAMLResume](https://github.com/marketplace/actions/yamlresume)
> pour automatiser la génération de PDF dans vos pipelines CI/CD.

Rédiger un CV n’est peut-être pas difficile, mais ce n’est clairement pas amusant et c’est fastidieux.

[YAMLResume](https://yamlresume.dev/fr) vous permet de gérer et de versionner vos
CV en [YAML](https://yaml.org/) texte brut et de les transformer en documents
professionnels, parfaitement composés, d’une seule commande.

![YAMLResume Playground](../docs/static/images/yamlresume-playground.webp)

## Principe de conception

Ce projet a commencé comme le moteur de composition typographique de base de
[PPResume](https://ppresume.com/?ref=yamlresume), un générateur de CV « pixel
perfect » basé sur LaTeX. Après mûre réflexion, nous avons décidé de l’ouvrir
pour que chacun puisse toujours dire
[non au verrouillage fournisseur](https://blog.ppresume.com/posts/no-vendor-lock-in).

YAMLResume suit le principe de
[séparation des responsabilités](https://fr.wikipedia.org/wiki/S%C3%A9paration_des_pr%C3%A9occupations) :

- **Le contenu** vit dans du YAML texte brut.
- **La structure et la validation** sont assurées par le compilateur et un schéma strict.
- **La présentation** est gérée par des moteurs de mise en page interchangeables
  (LaTeX, HTML, Markdown, DOCX).

Vous éditez le quoi ; YAMLResume s’occupe du comment.

## Fonctionnalités en bref

- **Une seule source, plusieurs sorties.** À partir d’un seul `resume.yml`,
  générez des PDF pixel-perfect (via LaTeX), du Markdown propre, du HTML
  responsive et des fichiers Microsoft Word DOCX.
- **Un vrai compilateur de CV.** Analyse, validation, transformation et rendu.
  Détectez les erreurs tôt grâce à la validation Zod à l’exécution et à
  l’intégration du schéma JSON Schema dans votre éditeur.
- **Une excellente expérience de développement.** Mode watch avec `yamlresume
  dev`, diagnostics de l’environnement avec `yamlresume doctor` et validation
  instantanée du schéma.
- **Génération assistée par IA.** Créez un CV complet à partir d’un intitulé de
  poste et d’une locale avec `yamlresume ai generate`.
- **Mises en page flexibles.** Renommez et réorganisez les sections, changez de
  modèle, ajustez la typographie, le format du papier, l’interligne et activez
  ou désactivez les icônes.
- **Internationalisation complète.** Prise en charge native de 10 langues pour
  12 codes de locale.
- **Écosystème riche.** Image Docker, formule Homebrew, GitHub Action,
  Playground intégrable, exemples choisis et convertisseur JSON Resume.

## Démarrage rapide

Le moyen le plus rapide d’essayer YAMLResume est avec Docker. L’image contient
la CLI, XeTeX et les polices recommandées :

```sh
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume new my-resume.yml
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume build my-resume.yml
```

[![Démo Docker YAMLResume](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

Vous pouvez également installer `yamlresume` avec votre gestionnaire de paquets
préféré (Node.js >= 22 est requis) :

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

Vérifiez l’installation et l’état de votre environnement :

```sh
yamlresume help
yamlresume doctor
```

Pour les étapes d’installation détaillées, y compris la configuration d’un
moteur de composition typographique, consultez le
[guide d’installation](https://yamlresume.dev/fr/docs/installation).

## Créer un nouveau CV

Vous pouvez créer votre propre CV en clonant l’un de nos exemples
[ici](../packages/cli/src/commands/fixtures/software-engineer.yml). Une fois
l’exemple sur votre ordinateur, vous pouvez générer un PDF avec :

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

Vous pouvez également utiliser la
[commande `dev`](https://yamlresume.dev/fr/docs/cli#dev) pour reconstruire le
CV à chaque modification du fichier, ce qui offre **une expérience moderne de
type développement web** :

```sh
$ yamlresume dev my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
◐ Watching file changes: my-resume.yml...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume docx file successfully: my-resume.docx
✔ Generated resume markdown file successfully: my-resume.md
```

Consultez le PDF généré [ici](../docs/static/images/resume.pdf).

![Software Engineer Page 1](../docs/static/images/resume-1.webp)
![Software Engineer Page 2](../docs/static/images/resume-2.webp)

[PPResume Gallery](https://ppresume.com/gallery/?ref=yamlresume) propose une
galerie de tous les types de CV possibles, classés par langues et modèles.

## Sorties multi-mises en page

Les mises en page découplent votre contenu de sa présentation. Ajoutez autant de
formats de sortie que nécessaire dans `resume.yml` :

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

En savoir plus sur chaque moteur :

- [LaTeX / PDF](https://yamlresume.dev/fr/docs/layouts/latex)
- [HTML](https://yamlresume.dev/fr/docs/layouts/html)
- [Markdown](https://yamlresume.dev/fr/docs/layouts/markdown)
- [DOCX](https://yamlresume.dev/fr/docs/layouts/docx)

## Mode watch

Utilisez `yamlresume dev` pour reconstruire votre CV automatiquement à chaque
modification du fichier YAML :

```sh
yamlresume dev my-resume.yml
```

Cela vous donne une boucle de rétroaction rapide, similaire au développement web
moderne : enregistrez le fichier et le PDF se met à jour quelques instants plus
tard. Vous pouvez passer `--no-pdf` ou `--no-validate` pour accélérer les
itérations pendant la rédaction.

## Valider les CV

YAMLResume fournit un
[schéma](https://yamlresume.dev/fr/docs/compiler/schema) intégré qui valide
votre CV avant le rendu. Ajoutez l’en-tête de schéma à votre fichier YAML pour
bénéficier de l’autocomplétion IDE, de la documentation au survol et des
vérifications de format en temps réel :

```yml
# yaml-language-server: $schema=https://yamlresume.dev/schema.json
```

Exécutez `yamlresume validate my-resume.yml` pour obtenir des diagnostics de
type clang :

![YAMLResume validate output](../docs/static/images/yamlresume-validate.webp)

## Génération de CV assistée par IA

Nouveauté de la v0.14, `yamlresume ai generate` crée un CV complet et valide
par rapport au schéma à partir d’un poste et d’une langue :

```sh
export OPENAI_API_KEY=sk-...
yamlresume ai generate --position "Software Engineer" --language en resume.yml
```

Les fournisseurs pris en charge incluent OpenAI, DeepSeek, Kimi et Ollama.
Consultez la [documentation IA](https://yamlresume.dev/fr/docs/ai) pour les
détails de configuration.

## Modèles

YAMLResume propose un ensemble croissant de modèles selon les moteurs :

| Moteur | Modèles                                                          |
| ------ | ---------------------------------------------------------------- |
| LaTeX  | `moderncv-banking`, `moderncv-casual`, `moderncv-classic`, `jake` |
| HTML   | `calm`, `vscode`                                                 |
| DOCX   | `calm`                                                           |

Exécutez `yamlresume templates list` pour voir tous les modèles installés.

![HTML Calm template](../docs/static/images/html-calm-template.webp)
![HTML VS Code template](../docs/static/images/html-vscode-template.webp)
![DOCX Calm template](../docs/static/images/docx-calm-template.webp)

## Langues

YAMLResume prend en charge la localisation nativement. Définissez votre locale
dans `resume.yml` :

```yml
locale:
  language: en
```

Les langues prises en charge incluent l’anglais, le chinois (simplifié,
traditionnel TW/HK), l’espagnol, le français, le norvégien, le néerlandais, le
japonais, l’allemand, l’indonésien et le portugais brésilien. Consultez la
[documentation des locales](https://yamlresume.dev/fr/docs/locale) pour la
liste complète.

## Écosystème

YAMLResume fournit un ensemble d’outils pour créer, convertir et gérer vos CV
plus efficacement :

- [`@yamlresume/ai`](https://www.npmjs.com/package/@yamlresume/ai) —
  Génération de CV assistée par IA, utilisable par programmation.
- [`@yamlresume/playground`](https://www.npmjs.com/package/@yamlresume/playground)
  — Composant React intégrable pour créer votre propre éditeur de CV. Il
  alimente le [Playground](https://yamlresume.dev/playground) officiel.
- [`@yamlresume/samples`](https://www.npmjs.com/package/@yamlresume/samples) —
  Exemples de CV choisis pour des postes courants dans 12 locales.
- [`yamlresume/action`](https://github.com/marketplace/actions/yamlresume) —
  GitHub Action pour automatiser la génération de CV en CI/CD.
- [`create-yamlresume`](https://yamlresume.dev/fr/docs/ecosystem/create-yamlresume)
  — Générez un nouveau projet YAMLResume en une commande.
- [`json2yamlresume`](https://yamlresume.dev/fr/docs/ecosystem/json2yamlresume) —
  Convertissez des fichiers [JSON Resume](https://jsonresume.org/) au format
  YAMLResume.
- [Image Docker](https://hub.docker.com/r/yamlresume/yamlresume) et
  [formule Homebrew](https://formulae.brew.sh/formula/yamlresume) pour une
  installation facile.

## Contribuer

YAMLResume est en développement actif et de nouvelles fonctionnalités arrivent
régulièrement. Les contributions sont grandement appréciées. Veuillez lire les
[guidelines](../CONTRIBUTING.md) avant de soumettre une pull request.

### Historique des étoiles

[![Courbe d’étoiles YAMLResume](https://star-history.dera.page/svg?repos=yamlresume/yamlresume&type=Date)](https://star-history.dera.page/#yamlresume/yamlresume&Date)

## Feuille de route

- [ ] davantage de modèles de CV
- [ ] davantage de moteurs de mise en page (typst, et autres)
- [ ] davantage de langues et de locales
- [ ] fonctionnalités d’optimisation pour les ATS

## Soutenir le projet

Si YAMLResume vous est utile, envisagez de soutenir le projet :

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
