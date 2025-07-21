# @yamlresume/core

[![npm version](https://img.shields.io/npm/v/@yamlresume/core.svg?style=flat-square&logo=npm)](https://www.npmjs.com/package/@yamlresume/core)
[![npm downloads](https://img.shields.io/npm/dm/@yamlresume/core.svg?style=flat-square&logo=npm&color=CB3837)](https://www.npmjs.com/package/@yamlresume/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Discord](https://img.shields.io/discord/1371488902023479336?style=flat-square&logo=discord&color=5865F2)](https://discord.gg/9SyT7mVV4K)

This package contains the core engine for
[YAMLResume](https://yamlresume.dev). It handles parsing, validating, and
rendering resumes based on the official schema. It is intended for developers
who want to build custom tools or integrations on top of YAMLResume.

**Note:** If you just want to create a resume, you should use the main
command-line tool. See the
[`yamlresume` package](https://www.npmjs.com/package/yamlresume) for more info.

## The Design Principle

The core design principle of YAMLResume is
[Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns).
The resume content (YAML) is decoupled from its presentation (LaTeX), allowing
the core engine to focus on one thing: compiling a structured document into a
beautifully typeset PDF.

## Documentation

For more detailed information on the architecture and API, please visit our
official documentation:

- **[Compiler Architecture](https://yamlresume.dev/docs/compiler)**: An overview of the compilation process.
- **[Schema Reference](https://yamlresume.dev/docs/compiler/schema)**: The complete resume schema reference.

## Support the Project

If you find YAMLResume helpful, consider supporting the project:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/xiaohanyu)
