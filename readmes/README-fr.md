# YAMLResume

[English](../README.md) | [Français](./README-fr.md) | [Deutsch](./README-de.md) | [Español](./README-es.md) | [Português](./README-pt.md) | [Bahasa Indonesia](./README-id.md) | [日本語](./README-ja.md) | [简体中文](./README-zh-cn.md) | [繁體中文](./README-zh-tw.md)

**Des CV comme du code.** Rédigez votre CV en YAML texte brut, versionnez-le
avec Git et compilez-le en PDF, HTML, Markdown et DOCX au pixel près — en une
seule commande.

[![GitHub CI](https://github.com/yamlresume/yamlresume/workflows/test/badge.svg)](https://github.com/yamlresume/yamlresume/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/yamlresume.svg?style=flat-square&logo=npm)](https://www.npmjs.com/package/yamlresume)
[![npm downloads](https://img.shields.io/npm/dm/yamlresume.svg?style=flat-square&logo=npm&color=CB3837)](https://www.npmjs.com/package/yamlresume)
[![GitHub stars](https://img.shields.io/github/stars/yamlresume/yamlresume?style=flat-square&logo=github&color=gold)](https://github.com/yamlresume/yamlresume)
[![Documentation](https://img.shields.io/badge/docs-yamlresume.dev-blue?style=flat-square&logo=gitbook)](https://yamlresume.dev/fr)
[![License](https://img.shields.io/github/license/yamlresume/yamlresume?style=flat-square)](../LICENSE)

> **Actualités :**
> [YAMLResume v0.18](https://github.com/yamlresume/yamlresume/releases) apporte
> le moteur Typst, ainsi que des CV d'exemple sélectionnés dans 13 locales et la
> génération et la traduction assistées par IA. Découvrez aussi la
> [GitHub Action YAMLResume](https://github.com/marketplace/actions/yamlresume)
> pour automatiser la génération de PDF en CI/CD.

![YAMLResume transforme un fichier YAML en PDF composé](../docs/static/images/yamlresume-yaml-and-pdf.webp)

## Pourquoi YAMLResume

- **La mise en forme n'est pas votre travail.** Votre contenu reste séparé de la
  présentation ; le compilateur gère les polices, l'espacement, les marges et
  les sauts de page.
- **Votre CV devient révisable.** Diff, blame, branche et revert d'un CV comme
  du code. Chaque version est un commit.
- **Un fichier, tous les formats.** Les recruteurs veulent un PDF, certains
  portails un DOCX, votre site du HTML. Modifiez une section et tout se met à
  jour ensemble.
- **Les erreurs échouent tôt et fort.** Un schéma strict repère une date
  invalide ou une section mal orthographiée avant l'envoi, pas après
  l'entretien.

## Démarrage rapide

Essayez sans rien installer dans le
[Playground](https://yamlresume.dev/playground) — pas d'installation, pas de
LaTeX, aperçu en direct.

En ligne de commande, `npx` vous donne un CV fonctionnel en deux commandes :

```sh
npx yamlresume new resume.yml   # génère un CV complet et valide
npx yamlresume build resume.yml # compile toutes les mises en page configurées
```

La sortie PDF LaTeX nécessite un moteur TeX sur votre machine. Sans lui, ajoutez
`--no-pdf` pour obtenir quand même HTML, Markdown et DOCX, ou utilisez l'image
Docker ci-dessous, qui contient tout.

<details>
<summary>Installer durablement (npm, pnpm, yarn, bun, Homebrew, Docker)</summary>

Node.js >= 22 est requis pour les installations via gestionnaire de paquets :

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

L'image Docker contient la CLI, XeTeX, Typst et les polices recommandées : rien
d'autre à installer :

```sh
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume new my-resume.yml
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume build my-resume.yml
```

[![Démo Docker YAMLResume](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

</details>

La sortie PDF nécessite un moteur de composition (XeTeX ou Typst). Vérifiez ce
qui manque sur votre machine :

```sh
yamlresume doctor
```

Pour l'installation complète, y compris les moteurs et les polices, consultez le
[guide d'installation](https://yamlresume.dev/fr/docs/installation).

## Votre CV n'est que du YAML

Aucun format propriétaire, aucune base de données, aucun compte :

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

Cette ligne `yaml-language-server` résume tout l'aspect éditeur : elle active
l'autocomplétion, la documentation au survol et la validation en ligne dans VS
Code, Neovim, JetBrains ou tout autre éditeur basé sur le
[serveur de langage YAML](https://github.com/redhat-developer/yaml-language-server).

Compilez-le :

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

Deux PDF parce que les mises en page par défaut activent les deux moteurs PDF ;
désactivez-en un dans `layouts:` et l'autre conserve le nom simple `resume.pdf`.

Ou une recompilation à chaque enregistrement, comme un serveur de développement
web :

```sh
yamlresume dev resume.yml
```

Voir le résultat : [PDF](../docs/static/images/resume.pdf) ·
[page 1](../docs/static/images/resume-1.webp) ·
[page 2](../docs/static/images/resume-2.webp)

![Software Engineer Page 1](../docs/static/images/resume-1.webp)
![Software Engineer Page 2](../docs/static/images/resume-2.webp)

Vous voulez partir de quelque chose de réel ? `yamlresume new --sample <id>`
génère l'un des 20 CV sélectionnés, et `yamlresume samples list` affiche ce qui
est disponible.

## Fonctionnalités en bref

- **Une source, cinq moteurs.** LaTeX, Typst, HTML, Markdown et DOCX depuis un
  seul `resume.yml`.
- **Un vrai compilateur de CV.** Analyser, valider, transformer, rendre — avec
  validation Zod à l'exécution et intégration JSON Schema dans l'éditeur.
- **Excellente expérience développeur.** `yamlresume dev` pour le mode watch,
  `yamlresume doctor` pour le diagnostic d'environnement,
  `yamlresume validate` pour des erreurs à la clang.
- **Génération et traduction assistées par IA.** Amorcez un CV à partir d'un
  intitulé de poste, ou traduisez un CV existant, sans éditer le YAML à la main.
- **Global par défaut.** 11 langues sur 13 codes de locale, plus typographie,
  format de papier et ordre des sections par modèle.

## Modèles

Neuf modèles sur cinq moteurs. Chaque aperçu ci-dessous est le même CV et le
même YAML, rendus par un moteur différent — cliquez pour l'ouvrir dans la
[galerie](https://yamlresume.dev/fr/gallery/templates).

<table>
<tr>
<td align="center" width="33%">
<a href="https://yamlresume.dev/fr/gallery/templates/latex/jake"><img src="../docs/static/images/templates/latex-jake.webp" alt="Modèle LaTeX Jake"></a>
<br><b>Jake</b> · LaTeX
<br><sub>Simple, une seule colonne</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/fr/gallery/templates/latex/moderncv-banking"><img src="../docs/static/images/templates/latex-moderncv-banking.webp" alt="Modèle LaTeX ModernCV Banking"></a>
<br><b>ModernCV Banking</b> · LaTeX
<br><sub>Le style bancaire conservateur de ModernCV</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/fr/gallery/templates/latex/moderncv-casual"><img src="../docs/static/images/templates/latex-moderncv-casual.webp" alt="Modèle LaTeX ModernCV Casual"></a>
<br><b>ModernCV Casual</b> · LaTeX
<br><sub>Le style décontracté et moins formel de ModernCV</sub>
</td>
</tr>
<tr>
<td align="center" width="33%">
<a href="https://yamlresume.dev/fr/gallery/templates/latex/moderncv-classic"><img src="../docs/static/images/templates/latex-moderncv-classic.webp" alt="Modèle LaTeX ModernCV Classic"></a>
<br><b>ModernCV Classic</b> · LaTeX
<br><sub>La mise en page classique de ModernCV</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/fr/gallery/templates/typst/jake"><img src="../docs/static/images/templates/typst-jake.webp" alt="Modèle Typst Jake"></a>
<br><b>Jake</b> · Typst
<br><sub>La mise en page de Jake, rendue avec Typst</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/fr/gallery/templates/html/calm"><img src="../docs/static/images/templates/html-calm.webp" alt="Modèle HTML Calm"></a>
<br><b>Calm</b> · HTML
<br><sub>Épuré et minimaliste, pour tous les profils</sub>
</td>
</tr>
<tr>
<td align="center" width="33%">
<a href="https://yamlresume.dev/fr/gallery/templates/html/kami"><img src="../docs/static/images/templates/html-kami.webp" alt="Modèle HTML Kami"></a>
<br><b>Kami</b> · HTML
<br><sub>Parchemin chaleureux, une seule voix serif</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/fr/gallery/templates/html/vscode"><img src="../docs/static/images/templates/html-vscode.webp" alt="Modèle HTML VS Code"></a>
<br><b>VS Code</b> · HTML
<br><sub>Thème sombre pour les CV de développeurs</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/fr/gallery/templates/docx/calm"><img src="../docs/static/images/templates/docx-calm.webp" alt="Modèle DOCX Calm"></a>
<br><b>Calm</b> · DOCX
<br><sub>Fichier Word modifiable, même mise en page épurée</sub>
</td>
</tr>
</table>

Lancez `yamlresume templates list` pour voir ce que votre installation fournit,
et `yamlresume build` pour rendre chaque mise en page configurée.

Les modèles ne sont qu'un point de départ — typographie, marges, format de
papier, icônes et ordre des sections sont configurables par mise en page.

## Un CV, plusieurs mises en page

Les mises en page découplent votre contenu de sa présentation. Déclarez autant de
formats de sortie que nécessaire :

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

En savoir plus sur chaque moteur :
[LaTeX / PDF](https://yamlresume.dev/fr/docs/layouts/latex) ·
[Typst / PDF](https://yamlresume.dev/fr/docs/layouts/typst) ·
[HTML](https://yamlresume.dev/fr/docs/layouts/html) ·
[Markdown](https://yamlresume.dev/fr/docs/layouts/markdown) ·
[DOCX](https://yamlresume.dev/fr/docs/layouts/docx)

## Valider les CV

Lancez `yamlresume validate resume.yml` pour des diagnostics à la compilateur,
dans votre terminal et en CI :

![Sortie de yamlresume validate](../docs/static/images/yamlresume-validate.webp)

Le schéma lui-même est publié sur
[yamlresume.dev/schema.json](https://yamlresume.dev/schema.json). Voir la
[documentation du schéma](https://yamlresume.dev/fr/docs/compiler/schema) pour
les détails.

## Génération assistée par IA

Générez un point de départ complet et conforme au schéma à partir d'un poste et
d'une langue :

```sh
export OPENAI_API_KEY=sk-...
yamlresume ai generate --position "Software Engineer" --language en resume.yml
```

Ou traduisez un CV existant vers une autre locale sans toucher au YAML :

```sh
yamlresume ai translate resume.yml resume-ja.yml --to ja
```

Les fournisseurs pris en charge incluent OpenAI, DeepSeek, Kimi et Ollama.
Consultez la [documentation IA](https://yamlresume.dev/fr/docs/ai) pour les
détails de configuration.

## Langues

La localisation est intégrée. Définissez votre locale dans `resume.yml`, ou
lancez `yamlresume languages list` :

```yml
locale:
  language: en
```

Pris en charge : anglais, chinois simplifié, chinois traditionnel (Hong Kong et
Taïwan), espagnol, français, italien, norvégien, néerlandais, japonais,
allemand, indonésien et portugais brésilien — 11 langues sur 13 codes de locale.
Voir la [documentation des locales](https://yamlresume.dev/fr/docs/locale) pour
la liste complète.

## Écosystème

| Paquet | Ce qu'il fait |
| ------- | ------------- |
| [`yamlresume`](https://www.npmjs.com/package/yamlresume) | La CLI : build, dev, validate, generate, translate. |
| [`@yamlresume/ai`](https://www.npmjs.com/package/@yamlresume/ai) | Génération de CV assistée par IA, par programme. |
| [`@yamlresume/playground`](https://www.npmjs.com/package/@yamlresume/playground) | Composant React intégrable d'éditeur et d'aperçu. |
| [`@yamlresume/samples`](https://www.npmjs.com/package/@yamlresume/samples) | CV d'exemple sélectionnés dans 13 locales. |
| [`create-yamlresume`](https://yamlresume.dev/fr/docs/ecosystem/create-yamlresume) | Créer un nouveau projet en une commande. |
| [`json2yamlresume`](https://yamlresume.dev/fr/docs/ecosystem/json2yamlresume) | Convertir des fichiers [JSON Resume](https://jsonresume.org/) en YAML. |
| [`yamlresume/action`](https://github.com/marketplace/actions/yamlresume) | Générer des CV dans GitHub Actions. |
| [Docker](https://hub.docker.com/r/yamlresume/yamlresume) / [Homebrew](https://formulae.brew.sh/formula/yamlresume) | Installer sans chaîne d'outils locale. |

## FAQ

<details>
<summary>Dois-je installer LaTeX ?</summary>

Uniquement pour la sortie PDF LaTeX. HTML, Markdown et DOCX ne demandent que
Node.js, et le [Playground](https://yamlresume.dev/playground) les rend dans le
navigateur. Pour un PDF sans chaîne d'outils locale, utilisez l'image Docker, qui
contient XeTeX, Typst et les polices.
</details>

<details>
<summary>Pourquoi <code>build</code> échoue-t-il avec <code>xelatex: command not found</code> ?</summary>

Aucune distribution TeX dans votre `PATH`. Lancez `yamlresume doctor` pour un
rapport par dépendance, puis suivez le
[guide d'installation](https://yamlresume.dev/fr/docs/installation), ou retirez
la mise en page LaTeX et compilez avec Typst.
</details>

<details>
<summary>Puis-je utiliser mon JSON Resume existant ?</summary>

Oui — `npx json2yamlresume` convertit un fichier
[JSON Resume](https://jsonresume.org/) au format YAMLResume.
</details>

<details>
<summary>Comment reconstruire mon CV automatiquement ?</summary>

Ajoutez la
[GitHub Action](https://github.com/marketplace/actions/yamlresume) à un workflow,
ou utilisez `yamlresume dev resume.yml` en local pour recompiler à
l'enregistrement. Dans les deux cas le PDF est un artefact de build, jamais un
fichier édité à la main.
</details>

## Contribuer

YAMLResume est en développement actif et de nouvelles fonctionnalités arrivent
régulièrement. Les contributions sont grandement appréciées — veuillez lire les
[guidelines](../CONTRIBUTING.md) avant de soumettre une pull request.

```sh
pnpm install
pnpm build   # les paquets importent depuis le dist compilé
pnpm test
pnpm check   # Biome + tsc
```

Outillage : TypeScript, [Biome](https://biomejs.dev/) pour le lint et le format,
[Vitest](https://vitest.dev/) pour les tests avec un seuil de couverture à 100 %,
les workspaces PNPM et [Conventional Commits](https://conventionalcommits.org).
Les formules Docker et Homebrew sont construites depuis ce dépôt, donc les
changements de packaging ont leur place ici aussi.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PNPM](https://img.shields.io/badge/PNPM-Workspace-orange?style=flat-square&logo=pnpm)](https://pnpm.io/)
[![Biome](https://img.shields.io/badge/Biome-Linted-60a5fa?style=flat-square&logo=biome)](https://biomejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-Tested-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-FE5196?style=flat-square&logo=conventionalcommits)](https://conventionalcommits.org)
[![Discord](https://img.shields.io/discord/1371488902023479336?style=flat-square&logo=discord&color=5865F2)](https://discord.gg/9SyT7mVV4K)

### Historique des étoiles

[![Courbe d’étoiles YAMLResume](https://api.star-history.com/chart?repos=yamlresume/yamlresume&type=date&legend=top-left)](https://www.star-history.com/?repos=yamlresume%2Fyamlresume&type=date&legend=top-left)

## Feuille de route

- [ ] davantage de modèles de CV
- [ ] davantage de langues et de locales
- [ ] fonctionnalités d’optimisation pour les ATS

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
  (LaTeX, Typst, HTML, Markdown, DOCX).

Vous éditez le quoi ; YAMLResume s’occupe du comment.

## Soutenir le projet

Si YAMLResume vous est utile, envisagez de soutenir le projet :

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
