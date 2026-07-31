/**
 * MIT License
 *
 * Copyright (c) 2023–Present PPResume (https://ppresume.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModel } from '@yamlresume/ai'
import { YAMLResumeError } from '@yamlresume/core'

/**
 * Supported AI providers.
 */
export type AIProvider = 'deepseek' | 'kimi' | 'ollama' | 'openai'

/**
 * Default model per provider.
 */
const DEFAULT_MODELS: Record<AIProvider, string> = {
  deepseek: 'deepseek-v4-flash',
  kimi: 'kimi-k2.6',
  ollama: 'llama3.2',
  openai: 'gpt-5',
}

/**
 * Environment variable names per provider.
 *
 * Ollama runs locally and does not require an API key, so its entry is
 * `undefined`.
 */
const API_KEY_ENV_VARS: Record<AIProvider, string | undefined> = {
  deepseek: 'DEEPSEEK_API_KEY',
  kimi: 'MOONSHOT_API_KEY',
  ollama: undefined,
  openai: 'OPENAI_API_KEY',
}

/**
 * Resolve the AI provider from the environment.
 *
 * The provider is inferred from provider-specific environment variables rather
 * than a single `YAMLRESUME_AI_PROVIDER` flag:
 *
 * - `DEEPSEEK_API_KEY` -> deepseek
 * - `OPENAI_API_KEY` -> openai
 * - `MOONSHOT_API_KEY` -> kimi
 * - `OLLAMA_HOST` -> ollama
 *
 * Defaults to Kimi when no provider can be inferred so that a missing API key
 * produces a clear configuration error.
 *
 * @returns The provider identifier.
 */
export function getAIProvider(): AIProvider {
  if (process.env.DEEPSEEK_API_KEY) {
    return 'deepseek'
  }

  if (process.env.OPENAI_API_KEY) {
    return 'openai'
  }

  if (process.env.MOONSHOT_API_KEY) {
    return 'kimi'
  }

  if (process.env.OLLAMA_HOST) {
    return 'ollama'
  }

  return 'kimi'
}

/**
 * Build the OpenAI-compatible base URL for an Ollama host.
 *
 * Normalizes `OLLAMA_HOST` (e.g. `localhost:11434`) to a full URL ending in
 * `/v1`.
 *
 * @returns The base URL.
 */
export function getOllamaBaseURL(): string {
  const host = process.env.OLLAMA_HOST?.trim() ?? 'localhost:11434'
  const url = host.startsWith('http') ? host : `http://${host}`
  return url.endsWith('/v1') ? url : `${url}/v1`
}

/**
 * Build a Vercel AI SDK language model from environment variables.
 *
 * Supports Kimi (Moonshot AI), OpenAI, DeepSeek, and local Ollama servers. All
 * providers expose an OpenAI-compatible endpoint, so they are created through
 * `@ai-sdk/openai`.
 *
 * @param overrides - Optional CLI overrides for model and base URL.
 * @returns A configured language model.
 * @throws {YAMLResumeError} When a cloud provider's required API key is missing.
 */
export function getModelFromEnv(
  overrides: { model?: string; baseURL?: string } = {}
): LanguageModel {
  const provider = getAIProvider()
  const apiKeyEnvVar = API_KEY_ENV_VARS[provider]
  const apiKey = apiKeyEnvVar ? process.env[apiKeyEnvVar] : undefined

  if (apiKeyEnvVar && !apiKey) {
    throw new YAMLResumeError('AI_PROVIDER_NOT_CONFIGURED', {
      provider,
      envVar: apiKeyEnvVar,
    })
  }

  const modelId =
    overrides.model ??
    process.env.YAMLRESUME_AI_MODEL ??
    DEFAULT_MODELS[provider]

  let baseURL: string | undefined
  switch (provider) {
    case 'deepseek':
      baseURL =
        overrides.baseURL ??
        process.env.YAMLRESUME_AI_BASE_URL ??
        'https://api.deepseek.com'
      break
    case 'kimi':
      baseURL =
        overrides.baseURL ??
        process.env.YAMLRESUME_AI_BASE_URL ??
        'https://api.moonshot.cn/v1'
      break
    case 'ollama':
      baseURL =
        overrides.baseURL ??
        process.env.YAMLRESUME_AI_BASE_URL ??
        getOllamaBaseURL()
      break
    case 'openai':
      baseURL = overrides.baseURL ?? process.env.YAMLRESUME_AI_BASE_URL
      break
  }

  const config: { apiKey: string; baseURL?: string } = {
    apiKey: apiKey ?? 'dummy',
  }

  if (baseURL) {
    config.baseURL = baseURL
  }

  return createOpenAI(config)(modelId)
}
