# @yamlresume/playground

A powerful, feature-rich React component for editing and previewing YAML
resumes. This package powers the [YAMLResume](https://yamlresume.dev) playground
and can be integrated into other applications.

The official playground is at https://yamlresume.dev/playground.

## Features

- 📝 **Live YAML Editor**: Monaco-based editor with syntax highlighting for AML.
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

## License

MIT © [PPResume](https://ppresume.com)
