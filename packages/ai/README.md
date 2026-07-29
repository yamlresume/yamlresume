# @yamlresume/ai

AI-powered generation and translation for [YAMLResume](https://yamlresume.dev).

## Installation

```bash
npm install @yamlresume/ai
```

You also need a Vercel AI SDK provider and its API key. For example:

```bash
npm install @ai-sdk/openai
```

## Supported providers

All providers expose an OpenAI-compatible endpoint and are configured through
environment variables.

| Provider                                       | Required env variable | Default model       | Optional overrides                              |
| ---------------------------------------------- | --------------------- | ------------------- | ----------------------------------------------- |
| [DeepSeek](https://www.deepseek.com/)          | `DEEPSEEK_API_KEY`    | `deepseek-v4-flash` | `YAMLRESUME_AI_MODEL`, `YAMLRESUME_AI_BASE_URL` |
| [Kimi](https://www.moonshot.cn/) (Moonshot AI) | `MOONSHOT_API_KEY`    | `kimi-k2.6`         | `YAMLRESUME_AI_MODEL`, `YAMLRESUME_AI_BASE_URL` |
| [Ollama](https://ollama.com/) (local)          | `OLLAMA_HOST`         | `llama3.2`          | `YAMLRESUME_AI_MODEL`, `YAMLRESUME_AI_BASE_URL` |
| [OpenAI](https://openai.com/)                  | `OPENAI_API_KEY`      | `gpt-5`             | `YAMLRESUME_AI_MODEL`, `YAMLRESUME_AI_BASE_URL` |

The provider is inferred from the env variables in the order shown above. When
no provider is detected, Kimi is used as the default so that a missing API key
produces a clear configuration error.

## CLI usage

The `yamlresume` CLI uses `@yamlresume/ai` under the hood. Set a provider API
key and run:

```bash
# Generate a new resume
export OPENAI_API_KEY=sk-...
yamlresume ai generate --position "Software Engineer" --language en resume.yml
```

Override the model or endpoint when needed:

```bash
export YAMLRESUME_AI_MODEL=gpt-5
export YAMLRESUME_AI_BASE_URL=https://custom.openai.endpoint/v1
yamlresume ai generate --position "Registered Nurse" --language en resume.yml
```

## Generate a resume

```ts
import { generateResume } from "@yamlresume/ai";
import { openai } from "@ai-sdk/openai";

const model = openai("gpt-5");

const yaml = await generateResume({
  position: "Registered Nurse",
  language: "en",
  model,
});
```

## Use Kimi (Moonshot AI)

Kimi exposes an OpenAI-compatible endpoint:

```ts
import { openai } from "@ai-sdk/openai";

const kimi = openai({
  apiKey: process.env.MOONSHOT_API_KEY,
  baseURL: "https://api.moonshot.cn/v1",
});

const yaml = await generateResume({
  position: "Registered Nurse",
  language: "zh-hans",
  model: kimi("moonshot-v1-8k"),
});
```

## Validation and retries

Both functions parse the LLM output and validate it against `ResumeSchema` from
`@yamlresume/core`. If validation fails, the request is retried up to
`maxRetries` times (default: 2).

```ts
const yaml = await generateResume({
  position: "Software Engineer",
  language: "en",
  model,
  maxRetries: 3,
});
```
