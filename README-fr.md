# YAMLResume

[English](./README.md) | [日本語](./README-ja.md) | [简体中文](./README-zh-cn.md) | [繁體中文](./README-zh-tw.md)

<!-- Build, Quality & Docs -->
[![GitHub CI](https://github.com/yamlresume/yamlresume/workflows/test/badge.svg)](https://github.com/yamlresume/yamlresume/actions/workflows/test.yml)
[![Codecov](https://img.shields.io/codecov/c/github/yamlresume/yamlresume?style=flat-square&logo=codecov)](https://codecov.io/gh/yamlresume/yamlresume)
[![Security Rating](https://img.shields.io/badge/Security-A+-brightgreen?style=flat-square&logo=shield)](https://github.com/yamlresume/yamlresume/security)
[![Documentation](https://img.shields.io/badge/docs-yamlresume.dev-blue?style=flat-square&logo=gitbook)](https://yamlresume.dev/fr)
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


Rédiger un CV n’est peut‑être pas difficile, mais ce n’est clairement pas amusant et c’est fastidieux.

[YAMLResume](https://yamlresume.dev/fr) vous permet de gérer et de versionner vos CV avec [YAML](https://yaml.org/) et de générer en un clin d’œil des PDF professionnels avec une belle composition typographique.

![YAMLResume YAML and PDF](./docs/static/images/yamlresume-yaml-and-pdf.webp)

## Principe de conception

Ce projet a commencé comme le moteur de composition typographique de base de
[PPResume](https://ppresume.com/?ref=yamlresume), un générateur de CV « pixel perfect » basé sur LaTeX. Après mûre réflexion, nous avons décidé de l’ouvrir pour que chacun puisse toujours avoir le droit de dire [non au verrouillage fournisseur](https://blog.ppresume.com/posts/no-vendor-lock-in).

Le principe de conception au cœur de YAMLResume est la [séparation des responsabilités](https://fr.wikipedia.org/wiki/S%C3%A9paration_des préocupations). L’un des exemples les plus célèbres qui suit ce principe est HTML & CSS, fondations du web moderne — HTML organise le contenu d’une page, CSS définit son style de présentation.

En suivant ce principe, YAMLResume satisfait aux exigences suivantes :

- le contenu du CV est rédigé en texte brut
- le texte est structuré avec YAML — YAML est plus lisible et plus facile à écrire que JSON
- le YAML est ensuite rendu en PDF via un moteur de composition interchangeable
- la mise en page est ajustable via des options comme les tailles de police, les marges, etc.

## Démarrage rapide

Si vous avez Docker installé, vous pouvez démarrer `yamlresume` en une seconde ; l’image contient `yamlresume` et toutes ses dépendances :

[![Démo Docker YAMLResume](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

Sinon, vous pouvez installer `yamlresume` avec votre gestionnaire de paquets préféré :

```
# avec npm
$ npm install -g yamlresume

# avec yarn
$ yarn global add yamlresume

# avec pnpm
$ pnpm add -g yamlresume

# avec bun
$ bun add -g yamlresume
```

Vérifiez que `yamlresume` est bien installé :

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

Vous devez ensuite installer un moteur de composition typographique,
[XeTeX](http://yamlresume.dev/docs#install-typesetting-engine) ou
[Tectonic](http://yamlresume.dev/docs#install-typesetting-engine), afin de générer des PDF.

Enfin, nous vous recommandons d’installer la police [Linux
Libertine](http://yamlresume.dev/docs#linux-libertine-font) pour obtenir les meilleurs rendus.

Consultez notre [guide d’installation](http://yamlresume.dev/docs/installation) pour plus de détails.

## Créer un nouveau CV

Vous pouvez créer votre propre CV en clonant l’un de nos exemples
[ici](./packages/cli/src/commands/fixtures/software-engineer.yml). Une fois l’exemple en local, vous pouvez générer un PDF :

```
$ yamlresume new my-resume.yml
✔ Created my-resume.yml successfully.

$ yamlresume build my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume markdown file successfully: my-resume.md
```

Vous pouvez également utiliser la [commande `dev`](https://yamlresume.dev/fr/docs/cli#dev) pour
reconstruire le CV à chaque modification de fichier, offrant **une expérience moderne de type développement web** :

```
$ yamlresume dev my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
◐ Watching file changes: my-resume.yml...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume markdown file successfully: my-resume.md
```

Consultez le PDF généré [ici](./docs/static/images/resume.pdf).

![Software Engineer Page 1](./docs/static/images/resume-1.webp)
![Software Engineer Page 2](./docs/static/images/resume-2.webp)

[PPResume Gallery](https://ppresume.com/gallery/?ref=yamlresume) propose une
galerie de tous types de CV, classés par langues et modèles.

Plus d’exemples arrivent bientôt !

## Valider les CV

YAMLResume fournit un
[schéma](https://yamlresume.dev/fr/docs/compiler/schema) intégré permettant de
valider les CV et d’éviter de nombreuses erreurs de base. Démonstration :

[![Démo du compilateur YAMLResume](https://asciinema.org/a/728098.svg)](https://asciinema.org/a/728098)

## Composition typographique

YAMLResume adopte [LaTeX](https://www.latex-project.org/) comme moteur de
composition par défaut, référence dans l’édition académique et technique.

En suivant les [bonnes pratiques de composition d’un CV](https://docs.ppresume.com/guide?ref=yamlresume), YAMLResume garantit des CV **Pixel Perfect**.

À l’avenir, nous pourrions prendre en charge d’autres moteurs comme
[Typst](https://github.com/typst/typst), HTML/CSS, etc.

## Écosystème

YAMLResume fournit un ensemble d’outils pour créer, convertir et gérer vos CV plus efficacement. Voici quelques utilitaires clés :

- [create-yamlresume](https://yamlresume.dev/fr/docs/ecosystem/create-yamlresume)
  facilite le démarrage d’un projet YAMLResume avec une simple commande. Il
  prépare l’arborescence, installe les dépendances nécessaires et génère un
  exemple de CV pour commencer immédiatement. Essayez avec
  `npx create-yamlresume my-resume` ou des commandes similaires pour `npm`,
  `yarn`, `pnpm` ou `bun`.
- [json2yamlresume](https://yamlresume.dev/fr/docs/ecosystem/json2yamlresume) est un
  outil CLI pour convertir des fichiers [JSON Resume](https://jsonresume.org/) au
  format YAMLResume.

## Contribuer

Ce projet est encore en développement actif ; nous travaillons en continu sur de
nouvelles fonctionnalités et corrections de bugs. L’API publique n’est pas encore
totalement stable, merci de votre patience.

Toute forme de contribution est grandement appréciée ! Merci de lire le
[guide de contribution](./CONTRIBUTING.md) avant d’ouvrir une pull request.

### Historique des étoiles

[![Courbe d’étoiles YAMLResume](https://api.star-history.com/svg?repos=yamlresume/yamlresume&type=Date)](https://www.star-history.com/#yamlresume/yamlresume&Date)

## Feuille de route

- [ ] prise en charge de plus de familles de polices
- [ ] davantage de modèles de CV
- [ ] davantage de langues locales

## Soutenir le projet

Si YAMLResume vous est utile, envisagez de soutenir le projet :

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)

