# @yamlresume/playground

A powerful, feature-rich React component for editing and previewing YAML
resumes. This package powers the [YAMLResume](https://yamlresume.dev) playground
and can be integrated into other applications.

The official playground is at https://yamlresume.dev/playground.

## Features

- 📝 **Live YAML Editor**: Monaco-based editor with syntax highlighting for AML.
- ✨ **YAML Language Support**: Schema-driven completion, validation, and hover
  documentation powered by
  [`monaco-yaml`](https://github.com/remcohaszing/monaco-yaml) running the YAML
  language server in a Web Worker against the
  [YAMLResume JSON schema](https://yamlresume.dev/docs/compiler/schema/json).
- 👁️ **Real-time Preview**: Instant preview of your resume in HTML, Markdown, or
  LaTeX.
- 📱 **Responsive Design**: Split-pane layout on desktop, tabbed interface on
  mobile.
- 🌗 **Dark Mode Support**: Built-in dark mode compatibility.
- ⚠️ **Error Handling**: Graceful error boundaries and validation feedback.
- 📥 **Export**: Download your resume in multiple formats.

## Installation

```bash
npm install @yamlresume/playground @yamlresume/core
# or
pnpm add @yamlresume/playground @yamlresume/core
# or
yarn add @yamlresume/playground @yamlresume/core
```

### Peer Dependencies

Ensure you have the following peer dependencies installed:

```bash
npm install react react-dom tailwindcss
```

## Usage

### Basic Usage

The `Playground` component is the main entry point. It manages the state between
the editor and the previewer.

```tsx
import { Playground } from "@yamlresume/playground";

function App() {
  return (
    <div style={{ height: "100vh" }}>
      <Playground />
    </div>
  );
}
```

### Controlled Component

You can control the YAML content from a parent component:

```tsx
import { useState } from "react";
import { Playground } from "@yamlresume/playground";

function App() {
  const [yaml, setYaml] = useState("layouts: []")

  return (
    <div style={{ height: "100vh" }}>
      <Playground yaml={yaml} onChange={(newYaml) => setYaml(newYaml)} />
    </div>
  );
}
```

## API Reference

### Components

#### `<Playground />`

The main split-view component.

| Prop       | Type                      | Default     | Description                                                    |
| ---------- | ------------------------- | ----------- | -------------------------------------------------------------- |
| `yaml`     | `string`                  | `undefined` | The YAML content to display/edit. Defaults to a sample resume. |
| `onChange` | `(value: string) => void` | `undefined` | Callback fired when editor content changes.                    |
| `filename` | `string`                  | `undefined` | The filename to display in the editor.                         |
| `messages` | `PlaygroundMessageOverrides` | `undefined` | Optional localized tooltip messages for toolbar actions.       |

#### `<ResumeEditor />`

A standalone Monaco editor wrapper configured for YAML resumes.

| Prop       | Type                      | Default     | Description      |
| ---------- | ------------------------- | ----------- | ---------------- |
| `value`    | `string`                  | `''`        | Editor content.  |
| `onChange` | `(value: string) => void` | `undefined` | Change callback. |

#### `<ResumeViewer />`

Renders the resume based on the parsed object and selected layout.

| Prop          | Type             | Description                               |
| ------------- | ---------------- | ----------------------------------------- |
| `resume`      | `Resume \| null` | The parsed resume object.                 |
| `layoutIndex` | `number`         | Index of the layout configuration to use. |

### Hooks

#### `useResumeState`

Manages the parsing and validation state of the resume.

```tsx
const {
  yaml,
  handleYamlChange,
  activeLayoutIndex,
  setActiveLayoutIndex,
  resume,
} = useResumeState({ yaml: initialYaml });
```

#### `useResumeRenderer`

Handles the actual rendering logic based on the engine (HTML, Markdown, LaTeX).

```tsx
const { renderedContent, engine, error } = useResumeRenderer({
  resume,
  layoutIndex,
});
```

## Types

The package exports several useful TypeScript types:

- `PlaygroundProps`
- `ResumeViewerProps`

## Utilities

The package exports several utility functions:

### `downloadResume(resume: Resume | null, layoutIndex: number)`

Downloads the resume for the specified layout index (HTML, Markdown, or LaTeX).

### `copyResumeToClipboard(resume: Resume | null, layoutIndex: number): Promise<void>`

Copies the rendered resume content to the clipboard.

### `printResume(resume: Resume | null, layoutIndex: number)`

Opens the print dialog for the resume (HTML layouts only).

### `openResumeInNewTab(resume: Resume | null, layoutIndex: number)`

Opens the resume in a new browser tab (HTML layouts only).

### `getBasename(filepath: string, removeExtension?: boolean): string`

Gets the basename from a filepath.

### `getExtension(engine: LayoutEngine): string`

Gets the file extension for a given rendering engine.

## Local Development

A Vite-based web harness lives in [`web/`](./web). It mounts the
`<Playground />` component directly from the TypeScript sources (no build step
required) with Tailwind CSS configured.

```bash
pnpm playground web:dev
# or
pnpm -C packages/playground/web dev
```

Then open http://localhost:5173.

### YAML language support

The resume editor provides completion, validation, and hover documentation via
`monaco-yaml`, which runs the YAML language server in a Web Worker bundled from
`src/monaco/workers/`. The worker wiring uses the standard
`new Worker(new URL(...), import.meta.url)` pattern, which Vite and webpack
understand natively when building from source.

If you consume the pre-built `dist` bundle in an app whose bundler cannot emit
workers from it, install your own `globalThis.MonacoEnvironment.getWorker`
**before** importing this package (a host-provided `getWorker` takes
precedence), pointing the `yaml` label at `monaco-yaml/yaml.worker` and
`editorWorkerService` at Monaco's editor worker:

```js
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import YamlWorker from 'monaco-yaml/yaml.worker?worker'

globalThis.MonacoEnvironment = {
  getWorker(moduleId, label) {
    if (label === 'yaml') return new YamlWorker()
    return new EditorWorker()
  },
}
```

Note that `monaco-yaml` currently requires `monaco-editor` <= 0.54.x (support
for the 0.55 worker API is pending upstream, see
[remcohaszing/monaco-yaml#282](https://github.com/remcohaszing/monaco-yaml/pull/282)).

## License

MIT © [PPResume](https://ppresume.com)
