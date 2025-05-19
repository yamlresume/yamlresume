# Contributing to YAMLResume

First off, thank you for considering contributing to YAMLResume! It's people
like you that make open source great. We welcome any type of contribution, not
only code. You can help with:

* **Reporting a bug**
* **Discussing the current state of the code**
* **Submitting a fix**
* **Proposing new features**
* **Improving documentation**

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version >= 20, check `.nvmrc` or
  `package.json` engines field)
- [pnpm](https://pnpm.io/) (version >= 10, check `package.json` packageManager
  field)
- Git

### Setup

1. **Fork the repository:** Click the "Fork" button on the [YAMLResume GitHub
   page](https://github.com/yamlresume/yamlresume). This creates your own copy
   of the project.

2. **Clone your fork:**
   ```bash
   git clone https://github.com/yamlresume/yamlresume.git
   cd yamlresume
   ```

3. **Install dependencies:**
   ```bash
   pnpm install
   ```
   This command installs all necessary dependencies for the entire workspace.

## Development Workflow

### Building Packages

- Build all packages once:
  ```bash
  pnpm build
  ```
- Build all packages and watch for changes:
  ```bash
  pnpm build:watch
  ```
- Build for production (including type definitions, minification):
  ```bash
  pnpm build:prod
  ```

### Running Tests

- Run tests for all packages:
  ```bash
  pnpm test
  ```
- Run tests in watch mode:
  ```bash
  pnpm test:watch
  ```
- Run tests with coverage report:
  ```bash
  pnpm test:cov
  ```

### Code Formatting and Linting

We use [Biome](https://biomejs.dev/) for formatting and linting. Ensure your
code adheres to the project's style guides before committing.

- Check and automatically fix issues:
  ```bash
  pnpm check
  ```
- Run checks without applying fixes (useful for CI):
  ```bash
  pnpm check:ci
  ```

We also use `addlicense` to ensure source files have the correct license
header. You need to install [addlicense](https://github.com/google/addlicense)
in order to run the following commands.

- Add missing license headers:
  ```bash
  pnpm license:add
  ```
- Check for missing license headers:
  ```bash
  pnpm license:check
  ```

## Submitting Contributions

### Reporting Issues

If you find a bug or have a feature request, please
[open an issue](https://github.com/yamlresume/yamlresume/issues) on GitHub.
Provide as much detail as possible, including:

- A clear and descriptive title.
- Steps to reproduce the bug (if applicable).
- Expected behavior and actual behavior.
- Screenshots or code snippets (if helpful).
- Your environment details (OS, Node version, pnpm version).

### Pull Requests (PRs)

We love pull requests! Here's a quick guide:

1. **Create a branch:** Start from the `main` branch and create a descriptive
   branch name (e.g., `fix/login-bug`, `feat/new-template-option`).
   ```bash
   git checkout main
   git pull origin main
   git checkout -b your-branch-name
   ```

2. **Make your changes:** Write your code or documentation improvements.

3. **Test your changes:** Ensure all tests pass:
   ```bash
   pnpm test
   ```

4. **Check code quality:** Ensure formatting and linting checks pass:
   ```bash
   pnpm check
   ```

5. **Commit your changes:** We use
   [Conventional Commits](https://www.conventionalcommits.org/) for commit
   messages, enforced by `commitlint`. This helps automate changelogs and
   versioning. A typical commit message looks like
   `feat: add new command` or `fix: resolve issue with parsing`. You can use
   `pnpm commitlint` to help format your message if needed, or use tools like
   [git cz](https://github.com/commitizen/cz-cli) if you have it installed.
   ```bash
   git add .
   git commit -m "feat: your descriptive commit message"
   ```

6. **Push your branch:**
   ```bash
   git push origin your-branch-name
   ```

7. **Open a Pull Request:** Go to the YAMLResume repository on GitHub and click
   the "New pull request" button. Compare your branch with the `main` branch.

8. **Describe your PR:** Provide a clear description of the changes you've made.
   Link any relevant issues (e.g., "Closes #123").

9. **Review:** A maintainer will review your PR. Address any feedback or
   requested changes.

10.**Merge:** Once approved, your PR will be merged. Thank you for your
   contribution!

## License

By contributing to YAMLResume, you agree that your contributions will be
licensed under its [MIT License](LICENSE).
