# create-yamlresume

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
- [Multi Languages](https://yamlresume.dev/docs/content/multi-languages)
- [Schema Reference](https://yamlresume.dev/docs/compiler/schema)
- [Section Customization](https://yamlresume.dev/docs/layout/sections)
- [Templates](https://yamlresume.dev/docs/layout/templates)
