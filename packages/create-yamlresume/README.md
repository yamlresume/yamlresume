# create-yamlresume

[![npm version](https://img.shields.io/npm/v/create-yamlresume.svg?style=flat-square&logo=npm)](https://www.npmjs.com/package/create-yamlresume)
[![npm downloads](https://img.shields.io/npm/dm/create-yamlresume.svg?style=flat-square&logo=npm&color=CB3837)](https://www.npmjs.com/package/create-yamlresume)
[![Node.js Version](https://img.shields.io/node/v/create-yamlresume.svg?style=flat-square&logo=node.js&color=339933)](https://nodejs.org/)
[![Discord](https://img.shields.io/discord/1371488902023479336?style=flat-square&logo=discord&color=5865F2)](https://discord.gg/9SyT7mVV4K)

[create-yamlresume](https://yamlresume.dev/docs/ecosystem/create-yamlresume)
helps you create a new [YAMLResume](https://yamlresume.dev) project with a
one-liner command.

## Usage

With npx:
```bash
npx create-yamlresume my-resume
```

With npm:
```bash
npm init yamlresume my-resume
```

With yarn:
```bash
yarn create yamlresume my-resume
```

With pnpm:
```bash
pnpm create yamlresume my-resume
```

## What it does

This tool will:

1. Create a new directory with your project name
2. Create a basic Node.js project structure with:
   - `package.json` with YAMLResume dependency and useful scripts
   - `.gitignore` file with appropriate excludes
   - `README.md` with basic usage instructions
3. Install all necessary dependencies
4. Create a new sample resume file using `yamlresume new`
5. Show available commands and next steps

## Project Structure

The generated project will have:

```
my-resume/
├── package.json          # Project configuration with yamlresume dependency
├── .gitignore            # Git ignore rules
├── README.md             # Project documentation
└── resume.yml            # Your YAML resume (filename you choose)
```

## Available Scripts

In the generated project, you can run:

- `npm run build` - Build your resume to PDF
- `npm run dev` - Watch for changes and rebuild automatically
- `npm run validate` - Validate your resume against the schema
- `npm run yamlresume` - Run the YAMLResume CLI

## Learn More

- [YAMLResume Documentation](https://yamlresume.dev/docs/)
- [CLI Reference](https://yamlresume.dev/docs/cli/)
- [Multi Languages](https://yamlresume.dev/docs/locale)
- [Schema Reference](https://yamlresume.dev/docs/compiler/schema)
- [Section Customization](https://yamlresume.dev/docs/layouts/sections)
- [Templates](https://yamlresume.dev/docs/layouts/latex/templates)
