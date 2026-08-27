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

> **Kabar:** [YAMLResume v0.15](https://github.com/yamlresume/yamlresume/releases)
> telah dirilis dengan contoh resume yang dikurasi untuk 12 locale serta
> pembuatan resume bertenaga AI. Lihat juga
> [YAMLResume GitHub Action](https://github.com/marketplace/actions/yamlresume)
> untuk mengotomatiskan pembuatan PDF di CI/CD.

Menulis resume mungkin tidak sulit, tetapi jelas tidak menyenangkan dan
membosankan.

[YAMLResume](https://yamlresume.dev) memungkinkan Anda mengelola dan melakukan
versioning resume sebagai teks biasa [YAML](https://yaml.org/) serta
mengubahnya menjadi dokumen profesional yang tersusun indah hanya dengan satu
perintah.

![YAMLResume Playground](../docs/static/images/yamlresume-playground.webp)

## Prinsip Desain

Proyek ini bermula sebagai mesin tata letak inti untuk
[PPResume](https://ppresume.com/?ref=yamlresume), pembangkit resume berbasis
LaTeX yang sangat presisi. Setelah pertimbangan matang, kami memutuskan untuk
membukanya agar semua orang selalu bisa
[menolak kunci vendor](https://blog.ppresume.com/posts/no-vendor-lock-in).

YAMLResume mengikuti prinsip
[pemisahan kepentingan](https://id.wikipedia.org/wiki/Pemisahan_kepentingan):

- **Konten** disimpan dalam YAML teks biasa.
- **Struktur dan validasi** ditegakkan oleh kompiler dan skema yang ketat.
- **Tampilan** ditangani oleh mesin tata letak yang dapat dipertukarkan (LaTeX,
  HTML, Markdown, DOCX).

Anda mengedit isinya; YAMLResume yang mengurus cara penyajiannya.

## Fitur Sekilas

- **Satu sumber, banyak keluaran.** Dari satu `resume.yml`, hasilkan PDF yang
  presisi piksel (via LaTeX), Markdown yang rapi, HTML responsif, dan file
  Microsoft Word DOCX.
- **Kompiler resume sesungguhnya.** Parsing, validasi, transformasi, dan render.
  Deteksi kesalahan sejak dini berkat validasi runtime Zod dan integrasi skema
  JSON Schema di editor.
- **Pengalaman pengembang yang sangat baik.** Mode watch dengan `yamlresume
  dev`, diagnosis lingkungan dengan `yamlresume doctor`, dan validasi skema
  instan.
- **Pembuatan bertenaga AI.** Buat resume lengkap dari jabatan dan locale
  dengan `yamlresume ai generate`.
- **Tata letak fleksibel.** Ganti nama dan susun ulang bagian, ganti templat,
  atur tipografi, format kertas, jarak baris, serta tampilkan/sembunyikan ikon.
- **i18n lengkap.** Dukungan bawaan untuk 10 bahasa dalam 12 locale.
- **Ekosistem kaya.** Image Docker, formula Homebrew, GitHub Action, Playground
  yang dapat disematkan, contoh yang dikurasi, dan konverter JSON Resume.

## Mulai Cepat

Cara tercepat mencoba YAMLResume adalah dengan Docker. Image sudah menyertakan
CLI, XeTeX, dan font yang direkomendasikan:

```sh
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume new my-resume.yml
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume build my-resume.yml
```

[![Demo Docker YAMLResume](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

Anda juga dapat memasang `yamlresume` dengan pengelola paket favorit Anda
(Node.js >= 22 diperlukan):

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

Verifikasi instalasi dan lingkungan Anda:

```sh
yamlresume help
yamlresume doctor
```

Untuk langkah pemasangan detail, termasuk menyiapkan mesin tata letak, lihat
[panduan pemasangan](https://yamlresume.dev/docs/installation).

## Membuat Resume Baru

Anda dapat membuat resume sendiri dengan mengkloning salah satu contoh kami
[di sini](../packages/cli/src/commands/fixtures/software-engineer.yml). Setelah
contoh berada di komputer Anda, hasilkan PDF dengan:

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

Anda juga dapat menggunakan
[perintah `dev`](https://yamlresume.dev/docs/cli#dev) untuk membangun ulang
resume setiap kali berkas berubah, yang memberikan **pengalaman seperti
pengembangan web modern**:

```sh
$ yamlresume dev my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
◐ Watching file changes: my-resume.yml...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume docx file successfully: my-resume.docx
✔ Generated resume markdown file successfully: my-resume.md
```

Lihat PDF yang dihasilkan [di sini](../docs/static/images/resume.pdf).

![Software Engineer Page 1](../docs/static/images/resume-1.webp)
![Software Engineer Page 2](../docs/static/images/resume-2.webp)

[PPResume Gallery](https://ppresume.com/gallery/?ref=yamlresume) menampilkan
ringkasan semua jenis resume yang mungkin, diurutkan berdasarkan bahasa dan
templat.

## Keluaran Tata Letak Ganda

Tata letak memisahkan konten dari penyajiannya. Tambahkan sebanyak apa pun
format keluaran yang Anda butuhkan di `resume.yml`:

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

Pelajari lebih lanjut tiap mesin:

- [LaTeX / PDF](https://yamlresume.dev/docs/layouts/latex)
- [HTML](https://yamlresume.dev/docs/layouts/html)
- [Markdown](https://yamlresume.dev/docs/layouts/markdown)
- [DOCX](https://yamlresume.dev/docs/layouts/docx)

## Mode Watch

Gunakan `yamlresume dev` untuk membangun ulang resume secara otomatis setiap
kali berkas YAML diedit:

```sh
yamlresume dev my-resume.yml
```

Ini memberi Anda putaran umpan balik cepat mirip pengembangan web modern: simpan
berkas, dan PDF diperbarui beberapa saat kemudian. Anda dapat meneruskan
`--no-pdf` atau `--no-validate` untuk menghemat waktu saat membuat draf.

## Memvalidasi Resume

YAMLResume menyediakan
[skema](https://yamlresume.dev/docs/compiler/schema) bawaan yang memvalidasi
resume Anda sebelum dirender. Tambahkan header skema ke berkas YAML untuk
mendapatkan pelengkapan otomatis IDE, dokumentasi saat melayang, dan pemeriksaan
format waktu nyata:

```yml
# yaml-language-server: $schema=https://yamlresume.dev/schema.json
```

Jalankan `yamlresume validate my-resume.yml` untuk diagnosis bergaya clang:

![YAMLResume validate output](../docs/static/images/yamlresume-validate.webp)

## Pembuatan Resume Bertenaga AI

Baru di v0.14, `yamlresume ai generate` membuat resume lengkap yang patuh skema
dari jabatan dan bahasa:

```sh
export OPENAI_API_KEY=sk-...
yamlresume ai generate --position "Software Engineer" --language en resume.yml
```

Penyedia yang didukung mencakup OpenAI, DeepSeek, Kimi, dan Ollama. Lihat
[dokumentasi AI](https://yamlresume.dev/docs/ai) untuk detail penyiapan.

## Templat

YAMLResume hadir dengan kumpulan templat yang terus bertambah untuk berbagai
mesin:

| Mesin  | Templat                                                          |
| ------ | ---------------------------------------------------------------- |
| LaTeX  | `moderncv-banking`, `moderncv-casual`, `moderncv-classic`, `jake` |
| HTML   | `calm`, `vscode`                                                 |
| DOCX   | `calm`                                                           |

Jalankan `yamlresume templates list` untuk melihat semua templat terpasang.

![HTML Calm template](../docs/static/images/html-calm-template.webp)
![HTML VS Code template](../docs/static/images/html-vscode-template.webp)
![DOCX Calm template](../docs/static/images/docx-calm-template.webp)

## Bahasa

YAMLResume mendukung pelokalan secara bawaan. Tetapkan locale Anda di
`resume.yml`:

```yml
locale:
  language: en
```

Bahasa yang didukung meliputi Inggris, Tionghoa (sederhana, tradisional TW/HK),
Spanyol, Prancis, Norwegia, Belanda, Jepang, Jerman, Indonesia, dan Portugis
Brasil. Lihat [dokumentasi Locale](https://yamlresume.dev/docs/locale) untuk
daftar lengkap.

## Ekosistem

YAMLResume menyediakan serangkaian alat untuk membantu Anda membuat, mengonversi,
dan mengelola resume secara lebih efisien:

- [`@yamlresume/ai`](https://www.npmjs.com/package/@yamlresume/ai) — Pembuatan
  resume bertenaga AI secara terprogram.
- [`@yamlresume/playground`](https://www.npmjs.com/package/@yamlresume/playground)
  — Komponen React yang dapat disematkan untuk membuat editor resume Anda
  sendiri. Ini menopang [Playground](https://yamlresume.dev/playground) resmi.
- [`@yamlresume/samples`](https://www.npmjs.com/package/@yamlresume/samples) —
  Contoh resume yang dikurasi untuk posisi umum dalam 12 locale.
- [`yamlresume/action`](https://github.com/marketplace/actions/yamlresume) —
  GitHub Action untuk mengotomatiskan pembuatan resume di CI/CD.
- [`create-yamlresume`](https://yamlresume.dev/docs/ecosystem/create-yamlresume)
  — Buat proyek YAMLResume baru dalam satu perintah.
- [`json2yamlresume`](https://yamlresume.dev/docs/ecosystem/json2yamlresume) —
  Konversi berkas [JSON Resume](https://jsonresume.org/) ke format YAMLResume.
- [Image Docker](https://hub.docker.com/r/yamlresume/yamlresume) dan
  [formula Homebrew](https://formulae.brew.sh/formula/yamlresume) untuk
  pemasangan mudah.

## Berkontribusi

YAMLResume sedang dalam pengembangan aktif dan fitur baru ditambahkan secara
berkala. Kontribusi sangat dihargai. Silakan baca
[panduan](../CONTRIBUTING.md) sebelum mengirimkan pull request.

### Riwayat Bintang

[![Bagan Riwayat Bintang YAMLResume](https://star-history.dera.page/svg?repos=yamlresume/yamlresume&type=Date)](https://star-history.dera.page/#yamlresume/yamlresume&Date)

## Peta Jalan

- [ ] lebih banyak templat resume
- [ ] lebih banyak mesin tata letak (typst, dan lainnya)
- [ ] lebih banyak bahasa dan locale
- [ ] fitur optimasi ATS

## Dukung Proyek Ini

Jika YAMLResume bermanfaat bagi Anda, pertimbangkan untuk mendukung proyek ini:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
