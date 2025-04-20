## YAMLResume Core

The YAMLResume Core is the core of [YAMLResume](https://yamlresume.dev).  It is
in charge of the typesetting and layout of the resume.

### Installation

- npm

```bash
npm install @yamlresume/core
```

- pnpm

```bash
pnpm add @yamlresume/core
```

- yarn

```bash
yarn add @yamlresume/core
```

### Architecture

YAML resume
-> parsed to a resume data model
-> instantiated a resume renderer
-> render the resume to LaTeX code
-> compile the LaTeX code to PDF