# YAMLResume

[English](./README.md) | [Français](./README-fr.md) | [简体中文](./README-zh-cn.md) | [繁體中文](./README-zh-tw.md)

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


履歴書の作成は難しくないかもしれませんが、確実に楽しくもなく退屈な作業です。

[YAMLResume](https://yamlresume.dev)を使用すると、[YAML](https://yaml.org/)で履歴書を管理・バージョン管理し、美しくプロフェッショナルなPDFを簡単に生成できます。

![YAMLResume YAML and PDF](./docs/static/images/yamlresume-yaml-and-pdf.webp)

## 設計原則

このプロジェクトは、LaTeXベースのピクセルパーフェクトな履歴書ビルダー[PPResume](https://ppresume.com/?ref=yamlresume)のコア組版エンジンとして始まりました。慎重に検討した結果、誰もが常に[ベンダーロックインにノーと言う権利](https://blog.ppresume.com/posts/no-vendor-lock-in)を持てるよう、オープンソース化することにしました。

YAMLResumeのコア設計原則は[関心の分離](https://ja.wikipedia.org/wiki/%E9%96%A2%E5%BF%83%E3%81%AE%E5%88%86%E9%9B%A2)です。この原則に従う最も有名な例の一つがHTML & CSSで、これらは現代のWebの基盤となっています。HTMLはWebページのコンテンツの構成に使用され、CSSはコンテンツの表示スタイルの定義に使用されます。

このコア原則に従い、YAMLResumeは以下の要件を満たすよう実装されています：

- 履歴書のコンテンツはプレーンテキストで作成
- プレーンテキストはYAMLで構造化（YAMLはJSONより人間が読みやすく書きやすい）
- YAMLプレーンテキストはプラグイン可能な組版エンジンでPDFにレンダリング
- レイアウトはフォントサイズ、ページマージなどのオプションで調整可能

## クイックスタート

Dockerがインストールされている場合、`yamlresume`を1秒で開始できます。これには`yamlresume`とすべての依存関係がパッケージ化されています：

[![YAMLResume Docker Demo](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

または、お好みのJavaScriptパッケージマネージャーで`yamlresume`をインストールできます：

```bash
# npmを使用
$ npm install -g yamlresume

# yarnを使用
$ yarn global add yamlresume

# pnpmを使用
$ pnpm add -g yamlresume

# bunを使用
$ bun add -g yamlresume
```

`yamlresume`が正常にインストールされたことを確認：

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

次に、PDFを生成するために組版エンジンの[XeTeX](http://yamlresume.dev/docs#install-typesetting-engine)または[Tectonic](http://yamlresume.dev/docs#install-typesetting-engine)をインストールする必要があります。

最後に、最高品質のPDFを得るために[Linux Libertine](http://yamlresume.dev/docs#linux-libertine-font)フォントのインストールをお勧めします。

詳細については、[インストールガイド](http://yamlresume.dev/docs/installation)をご確認ください。

## 新しい履歴書の作成

[こちら](./packages/cli/src/commands/fixtures/software-engineer.yml)のサンプル履歴書をクローンして、独自の履歴書を作成できます。サンプル履歴書をローカルに配置したら、以下でPDFを取得できます：

```
$ yamlresume new my-resume.yml
✔ Created my-resume.yml successfully.

$ yamlresume build my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume markdown file successfully: my-resume.md
```

また、[`dev`コマンド](https://yamlresume.dev/docs/cli#dev)を使用してファイル変更時に履歴書をビルドすることもでき、これにより**モダンなWeb開発のような体験**を提供します：

```
$ yamlresume dev my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
◐ Watching file changes: my-resume.yml...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume markdown file successfully: my-resume.md
```

生成されたPDFは[こちら](./docs/static/images/resume.pdf)で確認できます。

![Software Engineer Page 1](./docs/static/images/resume-1.webp)
![Software Engineer Page 2](./docs/static/images/resume-2.webp)

[PPResume Gallery](https://ppresume.com/gallery/?ref=yamlresume)では、言語とテンプレートで分類されたあらゆる種類の履歴書のショーケースを提供しています。

さらなるサンプルも近日公開予定です！

## 履歴書の検証

YAMLResumeは、履歴書の検証に使用でき、多くの低レベルなミスを回避するのに役立つ組み込み[スキーマ](https://yamlresume.dev/docs/compiler/schema)を提供しています。以下のデモをご覧ください：

[![YAMLResume Compiler Demo](https://asciinema.org/a/728098.svg)](https://asciinema.org/a/728098)

## 組版

YAMLResumeは、学術・技術出版業界における最先端の組版システムである[LaTeX](https://www.latex-project.org/)をデフォルトの組版エンジンとして採用しています。

一方、[履歴書組版のベストプラクティス](https://docs.ppresume.com/guide?ref=yamlresume)に従うことで、YAMLResumeは常に**ピクセルパーフェクト**な履歴書を保証します。

将来的には、[Typst](https://github.com/typst/typst)、HTML/CSSなどの他の組版エンジンもサポートする可能性があります。

## エコシステム

YAMLResumeは、履歴書をより効率的に作成、変換、管理するためのツールセットを提供しています。主要なユーティリティをいくつか紹介します：

- [create-yamlresume](https://yamlresume.dev/docs/ecosystem/create-yamlresume)は、ワンライナーコマンドで新しいYAMLResumeプロジェクトを簡単に開始できます。プロジェクトディレクトリを構築し、必要な依存関係をインストールし、サンプル履歴書ファイルを生成するので、すぐに開始できます。`npx create-yamlresume my-resume`や`npm`、`yarn`、`pnpm`、`bun`の類似コマンドで試してください。
- [json2yamlresume](https://yamlresume.dev/docs/ecosystem/json2yamlresume)は、[JSON Resume](https://jsonresume.org/)ファイルをYAMLResume形式に変換するCLIツールです。

## 貢献

このプロジェクトはまだ活発な開発中で、新機能とバグ修正に継続的に取り組んでいます。パブリックAPIはまだ安定していないため、しばらくお待ちください。

あらゆる種類のコントリビュートを深く歓迎します！プルリクエストを提出する前に、[コントリビュートガイドライン](./CONTRIBUTING.md)をお読みください。

### スター履歴

[![YAMLResume Star History Chart](https://api.star-history.com/svg?repos=yamlresume/yamlresume&type=Date)](https://www.star-history.com/#yamlresume/yamlresume&Date)

## ロードマップ

- [ ] より多くのフォントファミリーのサポート
- [ ] より多くの履歴書テンプレート
- [ ] より多くのロケール言語

## プロジェクトのサポート

YAMLResumeが役に立つと思われる場合は、プロジェクトのサポートをご検討ください：

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
