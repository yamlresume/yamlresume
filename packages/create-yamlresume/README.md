# create-yamlresume

Create a new YAMLResume project with a single command.

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
2. Ask you to choose a package manager (npm, yarn, or pnpm)
3. Create a basic Node.js project structure with:
   - `package.json` with YAMLResume dependency and useful scripts
   - `.gitignore` file with appropriate excludes
   - `README.md` with basic usage instructions
4. Install dependencies using your chosen package manager
5. Ask for your resume filename and create a new resume file using `yamlresume new`
6. Show available commands and next steps

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

## Learn More

- [YAMLResume Documentation](https://yamlresume.dev/docs/)
- [CLI Reference](https://yamlresume.dev/docs/cli/)
- [Schema Reference](https://yamlresume.dev/docs/compiler/schema)
- [Templates](https://yamlresume.dev/docs/layout/templates)