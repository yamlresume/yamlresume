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

> **Novedades:**
> [YAMLResume v0.15](https://github.com/yamlresume/yamlresume/releases) ha sido
> lanzado con currículos de ejemplo seleccionados para 12 localizaciones y
> generación de currículos asistida por IA. Consulte también la
> [GitHub Action YAMLResume](https://github.com/marketplace/actions/yamlresume)
> para automatizar la generación de PDF en CI/CD.

Escribir un currículo puede no ser difícil, pero definitivamente no es divertido
y es tedioso.

[YAMLResume](https://yamlresume.dev) le permite gestionar y controlar versiones
de sus currículos como [YAML](https://yaml.org/) de texto plano y transformarlos
en documentos profesionales, bellamente compuestos, con un solo comando.

![YAMLResume Playground](../docs/static/images/yamlresume-playground.webp)

## Principio de Diseño

Este proyecto comenzó como el motor de composición tipográfica central para
[PPResume](https://ppresume.com/?ref=yamlresume), un generador de currículos
basado en LaTeX con precisión de píxel. Tras una cuidadosa consideración,
decidimos hacerlo de código abierto para que todos siempre puedan
[decir no al bloqueo de proveedor](https://blog.ppresume.com/posts/no-vendor-lock-in).

YAMLResume sigue el principio de
[separación de responsabilidades](https://es.wikipedia.org/wiki/Separaci%C3%B3n_de_responsabilidades):

- **Contenido** se almacena en YAML de texto plano.
- **Estructura y validación** son impuestas por el compilador y un esquema estricto.
- **Presentación** es manejada por motores de diseño intercambiables (LaTeX, HTML,
  Markdown, DOCX).

Usted edita el qué; YAMLResume se encarga del cómo.

## Características en Resumen

- **Una fuente, múltiples salidas.** A partir de un único `resume.yml`, genere PDFs
  con precisión de píxel (vía LaTeX), Markdown limpio, HTML responsivo y archivos
  Microsoft Word DOCX.
- **Un compilador de currículos real.** Análisis, validación, transformación y
  renderizado. Detecte errores temprano gracias a la validación en tiempo de
  ejecución de Zod y la integración de esquema JSON Schema en el editor.
- **Excelente experiencia de desarrollo.** Modo watch con `yamlresume dev`,
  diagnóstico de ambiente con `yamlresume doctor` y validación instantánea de
  esquema.
- **Generación asistida por IA.** Cree un currículo completo a partir de un cargo
  y una localización con `yamlresume ai generate`.
- **Diseños flexibles.** Renombre y reorganice secciones, cambie de plantilla,
  ajuste tipografía, formato de papel, espaciado de líneas y active/desactive
  iconos.
- **i18n completo.** Soporte nativo para 10 idiomas en 12 localizaciones.
- **Ecosistema rico.** Imagen Docker, fórmula Homebrew, GitHub Action,
  Playground incrustable, ejemplos seleccionados y convertidor JSON Resume.

## Inicio Rápido

La forma más rápida de probar YAMLResume es con Docker. La imagen incluye la
CLI, XeTeX y las fuentes recomendadas:

```sh
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume new my-resume.yml
docker run --rm -v $(pwd):/home/yamlresume yamlresume/yamlresume build my-resume.yml
```

[![Demo Docker YAMLResume](https://asciinema.org/a/722057.svg)](https://asciinema.org/a/722057)

También puede instalar `yamlresume` con su gestor de paquetes favorito
(Node.js >= 22 es requerido):

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

Verifique la instalación y su entorno:

```sh
yamlresume help
yamlresume doctor
```

Para pasos de instalación detallados, incluyendo la configuración de un motor de
composición tipográfica, consulte la
[guía de instalación](https://yamlresume.dev/docs/installation).

## Creando un Nuevo Currículo

Puede crear su propio currículo clonando uno de nuestros ejemplos
[aquí](../packages/cli/src/commands/fixtures/software-engineer.yml). Una vez que
el ejemplo está en su computadora, puede generar un PDF con:

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

También puede usar el
[comando `dev`](https://yamlresume.dev/docs/cli#dev) para reconstruir su
currículo cada vez que el archivo cambia, lo que proporciona **una experiencia
como el desarrollo web moderno**:

```sh
$ yamlresume dev my-resume.yml
✔ Generated resume tex file successfully: my-resume.tex
◐ Generating resume pdf file with command: xelatex -halt-on-error my-resume.tex...
◐ Watching file changes: my-resume.yml...
✔ Generated resume pdf file successfully: my-resume.pdf
✔ Generated resume docx file successfully: my-resume.docx
✔ Generated resume markdown file successfully: my-resume.md
```

Consulte el PDF generado [aquí](../docs/static/images/resume.pdf).

![Software Engineer Page 1](../docs/static/images/resume-1.webp)
![Software Engineer Page 2](../docs/static/images/resume-2.webp)

La [PPResume Gallery](https://ppresume.com/gallery/?ref=yamlresume) presenta una
vista general de todos los tipos de currículos posibles, clasificados por idiomas
y plantillas.

## Salidas Multi-Diseño

Los diseños separan su contenido de la presentación. Agregue tantos formatos de
salida como necesite en `resume.yml`:

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

Obtenga más información sobre cada motor:

- [LaTeX / PDF](https://yamlresume.dev/docs/layouts/latex)
- [HTML](https://yamlresume.dev/docs/layouts/html)
- [Markdown](https://yamlresume.dev/docs/layouts/markdown)
- [DOCX](https://yamlresume.dev/docs/layouts/docx)

## Modo Watch

Use `yamlresume dev` para reconstruir automáticamente su currículo cada vez que
se edite el archivo YAML:

```sh
yamlresume dev my-resume.yml
```

Esto le proporciona un bucle de retroalimentación rápido similar al desarrollo
web moderno: guarde el archivo y el PDF se actualizará momentos después. Puede
pasar `--no-pdf` o `--no-validate` para ahorrar tiempo durante el borrador.

## Validando Currículos

YAMLResume proporciona un
[esquema](https://yamlresume.dev/docs/compiler/schema) integrado que valida su
currículo antes del renderizado. Agregue el encabezado del esquema a su archivo
YAML para obtener autocompletado en el IDE, documentación al pasar el mouse y
verificaciones de formato en tiempo real:

```yml
# yaml-language-server: $schema=https://yamlresume.dev/schema.json
```

Ejecute `yamlresume validate my-resume.yml` para diagnósticos al estilo clang:

![YAMLResume validate output](../docs/static/images/yamlresume-validate.webp)

## Generación de Currículos Asistida por IA

Nuevo en v0.14, `yamlresume ai generate` crea un currículo completo y compatible
con el esquema a partir de un cargo e idioma:

```sh
export OPENAI_API_KEY=sk-...
yamlresume ai generate --position "Software Engineer" --language en resume.yml
```

Los proveedores soportados incluyen OpenAI, DeepSeek, Kimi y Ollama. Consulte la
[documentación de IA](https://yamlresume.dev/docs/ai) para detalles de
configuración.

## Plantillas

YAMLResume viene con una colección creciente de plantillas para varios motores:

| Motor  | Plantillas                                                       |
| ------ | ---------------------------------------------------------------- |
| LaTeX  | `moderncv-banking`, `moderncv-casual`, `moderncv-classic`, `jake` |
| HTML   | `calm`, `vscode`                                                 |
| DOCX   | `calm`                                                           |

Ejecute `yamlresume templates list` para ver todas las plantillas instaladas.

![HTML Calm template](../docs/static/images/html-calm-template.webp)
![HTML VS Code template](https://yamlresume.dev/images/templates/html-vscode-template.webp)
![DOCX Calm template](../docs/static/images/docx-calm-template.webp)

## Idiomas

YAMLResume soporta localización de forma nativa. Defina su localización en
`resume.yml`:

```yml
locale:
  language: en
```

Los idiomas soportados incluyen inglés, chino (simplificado, tradicional TW/HK),
español, francés, noruego, neerlandés, japonés, alemán, indonesio y portugués
brasileño. Consulte la
[documentación de Locale](https://yamlresume.dev/docs/locale) para la lista
completa.

## Ecosistema

YAMLResume proporciona un conjunto de herramientas para ayudarle a crear, convertir
y gestionar currículos de manera más eficiente:

- [`@yamlresume/ai`](https://www.npmjs.com/package/@yamlresume/ai) — Generación
  de currículos asistida por IA, programática.
- [`@yamlresume/playground`](https://www.npmjs.com/package/@yamlresume/playground)
  — Componente React incrustable para crear su propio editor de currículos.
  Alimenta el [Playground](https://yamlresume.dev/playground) oficial.
- [`@yamlresume/samples`](https://www.npmjs.com/package/@yamlresume/samples) —
  Currículos de ejemplo seleccionados para cargos comunes en 12 localizaciones.
- [`yamlresume/action`](https://github.com/marketplace/actions/yamlresume) —
  GitHub Action para automatizar la generación de currículos en CI/CD.
- [`create-yamlresume`](https://yamlresume.dev/docs/ecosystem/create-yamlresume)
  — Cree un nuevo proyecto YAMLResume con un solo comando.
- [`json2yamlresume`](https://yamlresume.dev/docs/ecosystem/json2yamlresume) —
  Convierta archivos [JSON Resume](https://jsonresume.org/) al formato
  YAMLResume.
- [Imagen Docker](https://hub.docker.com/r/yamlresume/yamlresume) y
  [fórmula Homebrew](https://formulae.brew.sh/formula/yamlresume) para una
  instalación fácil.

## Contribuyendo

YAMLResume está en desarrollo activo y nuevas características se agregan
regularmente. ¡Las contribuciones son muy bienvenidas! Por favor, lea las
[pautas](../CONTRIBUTING.md) antes de enviar un pull request.

### Historial de Estrellas

[![Gráfico de Historial de Estrellas de YAMLResume](https://star-history.dera.page/svg?repos=yamlresume/yamlresume&type=Date)](https://star-history.dera.page/#yamlresume/yamlresume&Date)

## Hoja de Ruta

- [ ] más plantillas de currículos
- [ ] más motores de diseño (typst, y otros)
- [ ] más idiomas y localizaciones
- [ ] características de optimización para ATS

## Apoye el Proyecto

Si YAMLResume le resulta útil, considere apoyar el proyecto:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
