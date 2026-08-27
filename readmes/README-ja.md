# YAMLResume

[English](../README.md) | [Français](./README-fr.md) | [Deutsch](./README-de.md) | [Español](./README-es.md) | [Português](./README-pt.md) | [Bahasa Indonesia](./README-id.md) | [日本語](./README-ja.md) | [简体中文](./README-zh-cn.md) | [繁體中文](./README-zh-tw.md)

<!-- Build, Quality & Docs -->

[![GitHub CI](https://github.com/yamlresume/yamlresume/workflows/test/badge.svg)](https://github.com/yamlresume/yamlresume/actions/workflows/test.yml)
[![Documentation](https://img.shields.io/badge/docs-yamlresume.dev-blue?style=flat-square&logo=gitbook)](https://yamlresume.dev/ja)
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

> **お知らせ:**
> [YAMLResume v0.15](https://github.com/yamlresume/yamlresume/releases) がリリースされました。
> 12 のロケール向けにキュレーションされたサンプル履歴書と、AI による履歴書生成を含みます。
> また、CI/CD で PDF ビルドを自動化する
> [YAMLResume GitHub Action](https://github.com/marketplace/actions/yamlresume) もご覧ください。

履歴書を書くのは難しくないかもしれませんが、明らかに楽しいものではなく、面倒です。

[YAMLResume](https://yamlresume.dev/ja) を使うと、履歴書をプレーンテキストの
[YAML](https://yaml.org/) として管理・バージョン管理し、たった 1 つのコマンドで
美しく組版されたプロフェッショナルな文書へ変換できます。

![YAMLResume Playground](../docs/static/images/yamlresume-playground.webp)

## 設計原則

このプロジェクトは、ピクセル単位で正確な LaTeX ベースの履歴書ビルダーである
[PPResume](https://ppresume.com/?ref=yamlresume) のコア組版エンジンとして始まりました。
熟考の末、私たちはこれをオープンソース化し、誰もが常に
[ベンダーロックインに NO と言える](https://blog.ppresume.com/posts/no-vendor-lock-in)
ようにすることを決めました。

YAMLResume は
[関心の分離](https://ja.wikipedia.org/wiki/%E9%96%A2%E5%BF%83%E3%81%AE%E5%88%86%E9%9B%A2)の
原則に従います：

- **コンテンツ** はプレーンテキストの YAML に保存されます。
- **構造と検証** はコンパイラーと厳格なスキーマによって強制されます。
- **表示** は交換可能なレイアウトエンジン (LaTeX、HTML、Markdown、DOCX) が担います。

あなたは「何」を編集し、YAMLResume が「どう」を処理します。

## 機能の概要

- **1 つのソース、複数の出力。** 単一の `resume.yml` から、ピクセル単位で正確な PDF
  (LaTeX 経由)、クリーンな Markdown、レスポンシブな HTML、Microsoft Word DOCX
  ファイルを生成できます。
- **本物の履歴書コンパイラー。** 解析・検証・変換・レンダリングを行います。
  Zod ランタイム検証とエディターの JSON Schema 統合により、エラーを早期に発見できます。
- **優れた開発者体験。** `yamlresume dev` によるウォッチモード、`yamlresume doctor`
  による環境診断、即時のスキーマ検証を備えます。
- **AI による生成。** `yamlresume ai generate` で、職種とロケールから完全な履歴書を作成します。
- **柔軟なレイアウト。** セクションの名前変更と並べ替え、テンプレートの切り替え、
  タイポグラフィ・用紙サイズ・行間の調整、アイコンの表示/非表示が可能です。
- **充実した i18n。** 12 のロケールで 10 言語をネイティブにサポート。
- **豊かなエコシステム。** Docker イメージ、Homebrew フォーミュラ、GitHub Action、
  埋め込み可能な Playground、キュレーションされたサンプル、JSON Resume 変換器を提供。

## クイックスタート

YAMLResume を試す最も速い方法は Docker です。イメージには CLI、XeTeX、推奨フォントが
同梱されています：

```sh
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume new my-resume.yml
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume build my-resume.yml
```

[![YAMLResume Docker デモ](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

お好みのパッケージマネージャーで `yamlresume` をインストールすることもできます
(Node.js >= 22 が必要)：

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

インストールと環境を確認します：

```sh
yamlresume help
yamlresume doctor
```

詳細なインストール手順 (組版エンジンのセットアップ含む) は
[インストールガイド](https://yamlresume.dev/ja/docs/installation) を参照してください。

## 新しい履歴書を作成する

[こちら](../packages/cli/src/commands/fixtures/software-engineer.yml) のサンプルのいずれかを
クローンして、自分の履歴書を作成できます。サンプルを手元に用意したら、次のコマンドで PDF を
生成できます：

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

ファイルの変更時に履歴書を再ビルドする
[`dev` コマンド](https://yamlresume.dev/ja/docs/cli#dev) を使うと、
**モダンな Web 開発のような体験** が得られます：

```sh
$ yamlresume dev my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
◐ Watching file changes: my-resume.yml...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume docx file successfully: my-resume.docx
✔ Generated resume markdown file successfully: my-resume.md
```

生成された PDF は [こちら](../docs/static/images/resume.pdf) で確認できます。

![Software Engineer Page 1](../docs/static/images/resume-1.webp)
![Software Engineer Page 2](../docs/static/images/resume-2.webp)

[PPResume Gallery](https://ppresume.com/gallery/?ref=yamlresume) は、言語とテンプレートごとに
分類された、考えられるすべての履歴書の種類を紹介しています。

## 複数レイアウト出力

レイアウトはコンテンツと表示を分離します。`resume.yml` に必要な数だけ出力フォーマットを
追加できます：

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

各エンジンの詳細：

- [LaTeX / PDF](https://yamlresume.dev/ja/docs/layouts/latex)
- [HTML](https://yamlresume.dev/ja/docs/layouts/html)
- [Markdown](https://yamlresume.dev/ja/docs/layouts/markdown)
- [DOCX](https://yamlresume.dev/ja/docs/layouts/docx)

## ウォッチモード

`yamlresume dev` を使うと、YAML ファイルを編集するたびに履歴書を自動的に再ビルドできます：

```sh
yamlresume dev my-resume.yml
```

これにより、モダンな Web 開発のような高速なフィードバックループが得られます。ファイルを保存すると、
瞬く間に PDF が更新されます。ドラフト中は `--no-pdf` や `--no-validate` を渡して時間を節約できます。

## 履歴書を検証する

YAMLResume は、レンダリング前に履歴書を検証する組み込みの
[スキーマ](https://yamlresume.dev/ja/docs/compiler/schema) を提供します。スキーマヘッダーを
YAML ファイルに追加すると、IDE の自動補完、ホバーでのドキュメント、リアルタイムの書式チェックが
得られます：

```yml
# yaml-language-server: $schema=https://yamlresume.dev/schema.json
```

`yamlresume validate my-resume.yml` を実行すると、clang 風の診断が出力されます：

![YAMLResume validate output](../docs/static/images/yamlresume-validate.webp)

## AI による履歴書生成

v0.14 で新登場の `yamlresume ai generate` は、職種と言語からスキーマ準拠の完全な履歴書を作成します：

```sh
export OPENAI_API_KEY=sk-...
yamlresume ai generate --position "Software Engineer" --language en resume.yml
```

サポートされるプロバイダーは OpenAI、DeepSeek、Kimi、Ollama です。設定の詳細は
[AI ドキュメント](https://yamlresume.dev/ja/docs/ai) を参照してください。

## テンプレート

YAMLResume は各エンジン向けに拡充中のテンプレートを同梱しています：

| エンジン | テンプレート                                                    |
| -------- | --------------------------------------------------------------- |
| LaTeX    | `moderncv-banking`、`moderncv-casual`、`moderncv-classic`、`jake` |
| HTML     | `calm`、`vscode`                                                |
| DOCX     | `calm`                                                          |

インストール済みのすべてのテンプレートを確認するには `yamlresume templates list` を実行します。

![HTML Calm template](../docs/static/images/html-calm-template.webp)
![HTML VS Code template](../docs/static/images/html-vscode-template.webp)
![DOCX Calm template](../docs/static/images/docx-calm-template.webp)

## 言語

YAMLResume はローカライゼーションをネイティブにサポートしています。`resume.yml` でロケールを
設定してください：

```yml
locale:
  language: en
```

サポートされる言語は、英語、中国語 (簡体字、繁体字 TW/HK)、スペイン語、フランス語、ノルウェー語、
オランダ語、日本語、ドイツ語、インドネシア語、ブラジル・ポルトガル語です。完全な一覧は
[Locale ドキュメント](https://yamlresume.dev/ja/docs/locale) を参照してください。

## エコシステム

YAMLResume は、履歴書をより効率的に作成・変換・管理するための一連のツールを提供します：

- [`@yamlresume/ai`](https://www.npmjs.com/package/@yamlresume/ai) — プログラムによる
  AI 駆動の履歴書生成。
- [`@yamlresume/playground`](https://www.npmjs.com/package/@yamlresume/playground) —
  自分の履歴書エディターを作るための埋め込み可能な React コンポーネント。公式
  [Playground](https://yamlresume.dev/playground) を支えています。
- [`@yamlresume/samples`](https://www.npmjs.com/package/@yamlresume/samples) — 12 の
  ロケール向けの一般的な職種のキュレーションされたサンプル履歴書。
- [`yamlresume/action`](https://github.com/marketplace/actions/yamlresume) — CI/CD で
  履歴書ビルドを自動化する GitHub Action。
- [`create-yamlresume`](https://yamlresume.dev/ja/docs/ecosystem/create-yamlresume) —
  1 コマンドで新しい YAMLResume プロジェクトを作成。
- [`json2yamlresume`](https://yamlresume.dev/ja/docs/ecosystem/json2yamlresume) —
  [JSON Resume](https://jsonresume.org/) ファイルを YAMLResume 形式に変換。
- 簡単なインストールのための
  [Docker イメージ](https://hub.docker.com/r/yamlresume/yamlresume) と
  [Homebrew フォーミュラ](https://formulae.brew.sh/formula/yamlresume)。

## 貢献する

YAMLResume は活発に開発されており、新機能が定期的に追加されています。貢献を歓迎します。
プルリクエストを送る前に、[ガイドライン](../CONTRIBUTING.md) をお読みください。

### スター履歴

[![YAMLResume スター履歴チャート](https://star-history.dera.page/svg?repos=yamlresume/yamlresume&type=Date)](https://star-history.dera.page/#yamlresume/yamlresume&Date)

## ロードマップ

- [ ] さらに多くの履歴書テンプレート
- [ ] さらに多くのレイアウトエンジン (typst など)
- [ ] さらに多くの言語とロケール
- [ ] ATS 最適化機能

## プロジェクトを支援する

YAMLResume が役立った場合は、プロジェクトを支援することをご検討ください：

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
