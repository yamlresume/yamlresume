# YAMLResume

[English](../README.md) | [Français](./README-fr.md) | [Deutsch](./README-de.md) | [Español](./README-es.md) | [Português](./README-pt.md) | [Bahasa Indonesia](./README-id.md) | [日本語](./README-ja.md) | [简体中文](./README-zh-cn.md) | [繁體中文](./README-zh-tw.md)

**履歴書をコードとして。** 履歴書をプレーンテキストの YAML で書き、Git で
バージョン管理し、1 つのコマンドでピクセル単位に正確な PDF、HTML、Markdown、
DOCX へコンパイルします。

[![GitHub CI](https://github.com/yamlresume/yamlresume/workflows/test/badge.svg)](https://github.com/yamlresume/yamlresume/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/yamlresume.svg?style=flat-square&logo=npm)](https://www.npmjs.com/package/yamlresume)
[![npm downloads](https://img.shields.io/npm/dm/yamlresume.svg?style=flat-square&logo=npm&color=CB3837)](https://www.npmjs.com/package/yamlresume)
[![GitHub stars](https://img.shields.io/github/stars/yamlresume/yamlresume?style=flat-square&logo=github&color=gold)](https://github.com/yamlresume/yamlresume)
[![Documentation](https://img.shields.io/badge/docs-yamlresume.dev-blue?style=flat-square&logo=gitbook)](https://yamlresume.dev/ja)
[![License](https://img.shields.io/github/license/yamlresume/yamlresume?style=flat-square)](../LICENSE)

> **お知らせ:**
> [YAMLResume v0.18](https://github.com/yamlresume/yamlresume/releases) がリリース
> されました。Typst エンジンに加え、13 のロケール向けにキュレーションされた
> サンプル履歴書、AI による履歴書生成と翻訳を含みます。また、CI/CD で PDF ビルドを
> 自動化する
> [YAMLResume GitHub Action](https://github.com/marketplace/actions/yamlresume)
> もご覧ください。

![YAMLResume が YAML ファイルを組版済み PDF に変換します](../docs/static/images/yamlresume-yaml-and-pdf.webp)

## YAMLResume を選ぶ理由

- **書式設定はあなたの仕事ではありません。** コンテンツは表示から分離され、
  フォント、余白、マージン、改ページはコンパイラーが担当します。
- **履歴書がレビュー可能になります。** コードと同じように diff、blame、branch、
  revert ができます。すべてのバージョンがコミットです。
- **1 つのファイルで、すべての形式。** 採用担当者は PDF、一部のポータルは DOCX、
  あなたのサイトは HTML を求めます。1 つのセクションを変更すれば、すべてが
  まとめて更新されます。
- **間違いは早く、はっきりと失敗します。** 厳格なスキーマが誤った日付や綴り間違いの
  セクションを、送信前に — 面接の後ではなく — 検出します。

## クイックスタート

[Playground](https://yamlresume.dev/playground) なら、何もインストールせずに試せます
— セットアップ不要、LaTeX 不要、ライブプレビュー付きです。

コマンドラインでは、`npx` で 2 つのコマンドから動く履歴書が得られます：

```sh
npx yamlresume new resume.yml   # 完全で有効な履歴書を生成
npx yamlresume build resume.yml # 設定済みのすべてのレイアウトをコンパイル
```

LaTeX の PDF 出力には、お使いのマシンに TeX エンジンが必要です。ない場合は
`--no-pdf` を付ければ HTML、Markdown、DOCX は得られます。あるいは、すべてを同梱した
下記の Docker イメージをご利用ください。

<details>
<summary>恒久的にインストールする (npm、pnpm、yarn、bun、Homebrew、Docker)</summary>

パッケージマネージャーでのインストールには Node.js >= 22 が必要です：

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

Docker イメージには CLI、XeTeX、Typst、推奨フォントが同梱されているため、他に何も
インストールする必要はありません：

```sh
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume new my-resume.yml
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume build my-resume.yml
```

[![YAMLResume Docker デモ](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

</details>

PDF 出力には組版エンジン (XeTeX または Typst) が必要です。お使いのマシンに何が
足りないかを確認します：

```sh
yamlresume doctor
```

エンジンとフォントのインストールを含む完全なセットアップは
[インストールガイド](https://yamlresume.dev/ja/docs/installation) を参照してください。

## 履歴書はただの YAML

独自形式も、データベースも、アカウントも不要です：

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

この `yaml-language-server` の行がエディター対応のすべてです。VS Code、Neovim、
JetBrains、その他
[YAML ランゲージサーバー](https://github.com/redhat-developer/yaml-language-server)
を利用するあらゆるエディターで、自動補完、ホバーでのドキュメント、インライン検証が
有効になります。

コンパイルします：

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

デフォルトのレイアウトが両方の PDF エンジンを有効にするため PDF が 2 つできます。
`layouts:` で一方を無効にすると、もう一方が `resume.pdf` というシンプルな名前を
保ちます。

または、Web の開発サーバーのように、保存のたびに再ビルドします：

```sh
yamlresume dev resume.yml
```

結果を確認：[PDF](../docs/static/images/resume.pdf) ·
[1 ページ目](../docs/static/images/resume-1.webp) ·
[2 ページ目](../docs/static/images/resume-2.webp)

![Software Engineer Page 1](../docs/static/images/resume-1.webp)
![Software Engineer Page 2](../docs/static/images/resume-2.webp)

実際の例から始めたい場合は、`yamlresume new --sample <id>` で 20 のキュレーション
された履歴書の 1 つを生成でき、`yamlresume samples list` で利用可能な一覧を表示
できます。

## 機能の概要

- **1 つのソース、5 つのエンジン。** 単一の `resume.yml` から LaTeX、Typst、HTML、
  Markdown、DOCX を生成します。
- **本物の履歴書コンパイラー。** 解析・検証・変換・レンダリングを、Zod の
  ランタイム検証とエディターの JSON Schema 統合とともに行います。
- **優れた開発者体験。** ウォッチモードの `yamlresume dev`、環境診断の
  `yamlresume doctor`、clang 風のエラーの `yamlresume validate`。
- **AI による生成と翻訳。** 職種から履歴書を立ち上げたり、既存の履歴書を翻訳
  したりできます。YAML を手で編集する必要はありません。
- **標準でグローバル。** 13 のロケールコードにわたる 11 言語に加え、テンプレート
  ごとのタイポグラフィ、用紙サイズ、セクション順序に対応します。

## テンプレート

5 つのエンジンにわたる 9 つのテンプレート。以下のプレビューはすべて同じ履歴書と
同じ YAML を異なるエンジンでレンダリングしたものです。クリックすると
[ギャラリー](https://yamlresume.dev/ja/gallery/templates) で開きます。

<table>
<tr>
<td align="center" width="33%">
<a href="https://yamlresume.dev/ja/gallery/templates/latex/jake"><img src="../docs/static/images/templates/latex-jake.webp" alt="LaTeX テンプレート Jake"></a>
<br><b>Jake</b> · LaTeX
<br><sub>シンプルで率直な 1 カラム</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/ja/gallery/templates/latex/moderncv-banking"><img src="../docs/static/images/templates/latex-moderncv-banking.webp" alt="LaTeX テンプレート ModernCV Banking"></a>
<br><b>ModernCV Banking</b> · LaTeX
<br><sub>ModernCV の保守的な銀行スタイル</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/ja/gallery/templates/latex/moderncv-casual"><img src="../docs/static/images/templates/latex-moderncv-casual.webp" alt="LaTeX テンプレート ModernCV Casual"></a>
<br><b>ModernCV Casual</b> · LaTeX
<br><sub>ModernCV のカジュアルで形式ばらないスタイル</sub>
</td>
</tr>
<tr>
<td align="center" width="33%">
<a href="https://yamlresume.dev/ja/gallery/templates/latex/moderncv-classic"><img src="../docs/static/images/templates/latex-moderncv-classic.webp" alt="LaTeX テンプレート ModernCV Classic"></a>
<br><b>ModernCV Classic</b> · LaTeX
<br><sub>ModernCV のクラシックなレイアウト</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/ja/gallery/templates/typst/jake"><img src="../docs/static/images/templates/typst-jake.webp" alt="Typst テンプレート Jake"></a>
<br><b>Jake</b> · Typst
<br><sub>Jake のレイアウトを Typst でレンダリング</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/ja/gallery/templates/html/calm"><img src="../docs/static/images/templates/html-calm.webp" alt="HTML テンプレート Calm"></a>
<br><b>Calm</b> · HTML
<br><sub>どんな職種にも合う、端正でミニマルなデザイン</sub>
</td>
</tr>
<tr>
<td align="center" width="33%">
<a href="https://yamlresume.dev/ja/gallery/templates/html/kami"><img src="../docs/static/images/templates/html-kami.webp" alt="HTML テンプレート Kami"></a>
<br><b>Kami</b> · HTML
<br><sub>温かい羊皮紙色、単一のセリフ書体</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/ja/gallery/templates/html/vscode"><img src="../docs/static/images/templates/html-vscode.webp" alt="HTML テンプレート VS Code"></a>
<br><b>VS Code</b> · HTML
<br><sub>開発者向けのダークテーマ履歴書</sub>
</td>
<td align="center" width="33%">
<a href="https://yamlresume.dev/ja/gallery/templates/docx/calm"><img src="../docs/static/images/templates/docx-calm.webp" alt="DOCX テンプレート Calm"></a>
<br><b>Calm</b> · DOCX
<br><sub>編集可能な Word ファイル、同じ端正なレイアウト</sub>
</td>
</tr>
</table>

`yamlresume templates list` でインストールに含まれるテンプレートを確認し、
`yamlresume build` で設定したすべてのレイアウトをレンダリングします。

テンプレートはあくまで出発点です — タイポグラフィ、マージン、用紙サイズ、アイコン、
セクション順序はレイアウトごとに設定できます。

## 1 つの履歴書、複数のレイアウト

レイアウトはコンテンツと表示を分離します。必要なだけ出力フォーマットを宣言します：

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

各エンジンの詳細：
[LaTeX / PDF](https://yamlresume.dev/ja/docs/layouts/latex) ·
[Typst / PDF](https://yamlresume.dev/ja/docs/layouts/typst) ·
[HTML](https://yamlresume.dev/ja/docs/layouts/html) ·
[Markdown](https://yamlresume.dev/ja/docs/layouts/markdown) ·
[DOCX](https://yamlresume.dev/ja/docs/layouts/docx)

## 履歴書を検証する

ターミナルでも CI でも、コンパイラー風の診断を得るには
`yamlresume validate resume.yml` を実行します：

![yamlresume validate の出力](../docs/static/images/yamlresume-validate.webp)

スキーマ自体は
[yamlresume.dev/schema.json](https://yamlresume.dev/schema.json) で公開されています。
詳細は
[スキーマのドキュメント](https://yamlresume.dev/ja/docs/compiler/schema) を参照して
ください。

## AI による生成

職種と言語から、完全でスキーマに準拠した出発点を生成します：

```sh
export OPENAI_API_KEY=sk-...
yamlresume ai generate --position "Software Engineer" --language en resume.yml
```

または、YAML に触れずに既存の履歴書を別のロケールへ翻訳します：

```sh
yamlresume ai translate resume.yml resume-ja.yml --to ja
```

サポートされるプロバイダーは OpenAI、DeepSeek、Kimi、Ollama です。設定の詳細は
[AI ドキュメント](https://yamlresume.dev/ja/docs/ai) を参照してください。

## 言語

ローカライゼーションは組み込みです。`resume.yml` でロケールを設定するか、
`yamlresume languages list` を実行してください：

```yml
locale:
  language: en
```

サポート対象：英語、簡体字中国語、繁体字中国語 (香港および台湾)、スペイン語、
フランス語、イタリア語、ノルウェー語、オランダ語、日本語、ドイツ語、インドネシア語、
ブラジル・ポルトガル語 — 13 のロケールコードにわたる 11 言語です。完全な一覧は
[Locale ドキュメント](https://yamlresume.dev/ja/docs/locale) を参照してください。

## エコシステム

| パッケージ | 役割 |
| ---------- | ---- |
| [`yamlresume`](https://www.npmjs.com/package/yamlresume) | CLI：build、dev、validate、generate、translate。 |
| [`@yamlresume/ai`](https://www.npmjs.com/package/@yamlresume/ai) | プログラムによる AI 駆動の履歴書生成。 |
| [`@yamlresume/playground`](https://www.npmjs.com/package/@yamlresume/playground) | 埋め込み可能な React エディターとプレビューコンポーネント。 |
| [`@yamlresume/samples`](https://www.npmjs.com/package/@yamlresume/samples) | 13 のロケール向けにキュレーションされたサンプル履歴書。 |
| [`create-yamlresume`](https://yamlresume.dev/ja/docs/ecosystem/create-yamlresume) | 1 コマンドで新規プロジェクトを作成。 |
| [`json2yamlresume`](https://yamlresume.dev/ja/docs/ecosystem/json2yamlresume) | [JSON Resume](https://jsonresume.org/) ファイルを YAML に変換。 |
| [`yamlresume/action`](https://github.com/marketplace/actions/yamlresume) | GitHub Actions で履歴書をビルド。 |
| [Docker](https://hub.docker.com/r/yamlresume/yamlresume) / [Homebrew](https://formulae.brew.sh/formula/yamlresume) | ローカルツールチェーンなしでインストール。 |

## FAQ

<details>
<summary>LaTeX は必要ですか？</summary>

LaTeX の PDF 出力にのみ必要です。HTML、Markdown、DOCX は Node.js 以外に何も
要りません。また [Playground](https://yamlresume.dev/playground) はブラウザー内で
それらをレンダリングします。ローカルツールチェーンなしで PDF を得るには、
XeTeX、Typst、フォントを同梱した Docker イメージをお使いください。
</details>

<details>
<summary><code>build</code> が <code>xelatex: command not found</code> で失敗するのはなぜですか？</summary>

`PATH` に TeX ディストリビューションがないためです。`yamlresume doctor` で依存
関係ごとのレポートを確認し、
[インストールガイド](https://yamlresume.dev/ja/docs/installation) に従うか、
LaTeX レイアウトを外して Typst でビルドしてください。
</details>

<details>
<summary>既存の JSON Resume を使えますか？</summary>

はい — `npx json2yamlresume` が
[JSON Resume](https://jsonresume.org/) ファイルを YAMLResume 形式に変換します。
</details>

<details>
<summary>履歴書を自動で再ビルドするには？</summary>

ワークフローに
[GitHub Action](https://github.com/marketplace/actions/yamlresume) を追加するか、
ローカルで `yamlresume dev resume.yml` を使って保存時に再ビルドします。どちらの
場合も PDF はビルド成果物であり、手で編集するファイルではありません。
</details>

## 貢献する

YAMLResume は活発に開発されており、新機能が定期的に追加されています。貢献を
歓迎します — プルリクエストを送る前に
[ガイドライン](../CONTRIBUTING.md) をお読みください。

```sh
pnpm install
pnpm build   # パッケージはビルド済みの dist からインポートします
pnpm test
pnpm check   # Biome + tsc
```

ツール：TypeScript、lint とフォーマットに [Biome](https://biomejs.dev/)、
100 % カバレッジのゲート付きテストに [Vitest](https://vitest.dev/)、PNPM
ワークスペース、[Conventional Commits](https://conventionalcommits.org)。
Docker と Homebrew のフォーミュラはこのリポジトリからビルドされるため、
パッケージングの変更もここに含まれます。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PNPM](https://img.shields.io/badge/PNPM-Workspace-orange?style=flat-square&logo=pnpm)](https://pnpm.io/)
[![Biome](https://img.shields.io/badge/Biome-Linted-60a5fa?style=flat-square&logo=biome)](https://biomejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-Tested-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-FE5196?style=flat-square&logo=conventionalcommits)](https://conventionalcommits.org)
[![Discord](https://img.shields.io/discord/1371488902023479336?style=flat-square&logo=discord&color=5865F2)](https://discord.gg/9SyT7mVV4K)

### スター履歴

[![YAMLResume スター履歴チャート](https://api.star-history.com/chart?repos=yamlresume/yamlresume&type=date&legend=top-left)](https://www.star-history.com/?repos=yamlresume%2Fyamlresume&type=date&legend=top-left)

## ロードマップ

- [ ] さらに多くの履歴書テンプレート
- [ ] さらに多くの言語とロケール
- [ ] ATS 最適化機能

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
- **表示** は交換可能なレイアウトエンジン (LaTeX、Typst、HTML、Markdown、DOCX) が担います。

あなたは「何」を編集し、YAMLResume が「どう」を処理します。

## プロジェクトを支援する

YAMLResume が役立った場合は、プロジェクトを支援することをご検討ください：

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
