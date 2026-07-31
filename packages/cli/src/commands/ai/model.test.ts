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
import { ErrorType, YAMLResumeError } from '@yamlresume/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getAIProvider, getModelFromEnv, getOllamaBaseURL } from './model'

vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn(() => vi.fn((modelId: string) => ({ id: modelId }))),
}))

describe(getAIProvider, () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.DEEPSEEK_API_KEY
    delete process.env.MOONSHOT_API_KEY
    delete process.env.OPENAI_API_KEY
    delete process.env.OLLAMA_HOST
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should default to kimi when no provider variables are set', () => {
    expect(getAIProvider()).toBe('kimi')
  })

  it('should detect deepseek from DEEPSEEK_API_KEY', () => {
    process.env.DEEPSEEK_API_KEY = 'test-deepseek-key'
    expect(getAIProvider()).toBe('deepseek')
  })

  it('should detect openai from OPENAI_API_KEY', () => {
    process.env.OPENAI_API_KEY = 'test-openai-key'
    expect(getAIProvider()).toBe('openai')
  })

  it('should detect kimi from MOONSHOT_API_KEY', () => {
    process.env.MOONSHOT_API_KEY = 'test-moonshot-key'
    expect(getAIProvider()).toBe('kimi')
  })

  it('should detect ollama from OLLAMA_HOST', () => {
    process.env.OLLAMA_HOST = 'localhost:11434'
    expect(getAIProvider()).toBe('ollama')
  })

  it('should prefer deepseek over other providers', () => {
    process.env.DEEPSEEK_API_KEY = 'test-deepseek-key'
    process.env.OPENAI_API_KEY = 'test-openai-key'
    process.env.MOONSHOT_API_KEY = 'test-moonshot-key'
    expect(getAIProvider()).toBe('deepseek')
  })
})

describe(getOllamaBaseURL, () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.OLLAMA_HOST
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should default to localhost when OLLAMA_HOST is not set', () => {
    expect(getOllamaBaseURL()).toBe('http://localhost:11434/v1')
  })

  it('should normalize a host without protocol or path', () => {
    process.env.OLLAMA_HOST = '192.168.1.100:11434'

    expect(getOllamaBaseURL()).toBe('http://192.168.1.100:11434/v1')
  })

  it('should preserve a host that already includes a protocol', () => {
    process.env.OLLAMA_HOST = 'http://192.168.1.100:11434'

    expect(getOllamaBaseURL()).toBe('http://192.168.1.100:11434/v1')
  })

  it('should preserve a host that already ends with /v1', () => {
    process.env.OLLAMA_HOST = 'http://192.168.1.100:11434/v1'

    expect(getOllamaBaseURL()).toBe('http://192.168.1.100:11434/v1')
  })

  it('should trim whitespace from OLLAMA_HOST', () => {
    process.env.OLLAMA_HOST = '  192.168.1.100:11434  '

    expect(getOllamaBaseURL()).toBe('http://192.168.1.100:11434/v1')
  })
})

describe(getModelFromEnv, () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.DEEPSEEK_API_KEY
    delete process.env.MOONSHOT_API_KEY
    delete process.env.OPENAI_API_KEY
    delete process.env.OLLAMA_HOST
    delete process.env.YAMLRESUME_AI_MODEL
    delete process.env.YAMLRESUME_AI_BASE_URL
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should throw when the Kimi API key is missing', () => {
    expect(() => getModelFromEnv()).toThrow(YAMLResumeError)

    try {
      getModelFromEnv()
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('AI_PROVIDER_NOT_CONFIGURED')
      expect(error.errno).toBe(ErrorType.AI_PROVIDER_NOT_CONFIGURED.errno)
      expect(error.message).toContain('MOONSHOT_API_KEY')
    }
  })

  it('should throw when the OpenAI API key is missing', () => {
    process.env.OPENAI_API_KEY = ''

    expect(() => getModelFromEnv()).toThrow(YAMLResumeError)

    try {
      getModelFromEnv()
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('AI_PROVIDER_NOT_CONFIGURED')
      expect(error.message).toContain('MOONSHOT_API_KEY')
    }
  })

  it('should throw when the DeepSeek API key is missing', () => {
    process.env.DEEPSEEK_API_KEY = ''

    expect(() => getModelFromEnv()).toThrow(YAMLResumeError)

    try {
      getModelFromEnv()
    } catch (error) {
      expect(error).toBeInstanceOf(YAMLResumeError)
      expect(error.code).toBe('AI_PROVIDER_NOT_CONFIGURED')
      expect(error.message).toContain('MOONSHOT_API_KEY')
    }
  })

  it('should create a Kimi model with the default model id', () => {
    process.env.MOONSHOT_API_KEY = 'test-moonshot-key'

    const model = getModelFromEnv()

    expect(createOpenAI).toBeCalledWith({
      apiKey: 'test-moonshot-key',
      baseURL: 'https://api.moonshot.cn/v1',
    })
    expect(model).toEqual({ id: 'kimi-k2.6' })
  })

  it('should create a Kimi model with a custom model id', () => {
    process.env.MOONSHOT_API_KEY = 'test-moonshot-key'
    process.env.YAMLRESUME_AI_MODEL = 'moonshot-v1-32k'

    const model = getModelFromEnv()

    expect(model).toEqual({ id: 'moonshot-v1-32k' })
  })

  it('should create an OpenAI model with the default model id', () => {
    process.env.OPENAI_API_KEY = 'test-openai-key'

    const model = getModelFromEnv()

    expect(createOpenAI).toBeCalledWith({ apiKey: 'test-openai-key' })
    expect(model).toEqual({ id: 'gpt-5' })
  })

  it('should create an OpenAI model with a custom model id', () => {
    process.env.OPENAI_API_KEY = 'test-openai-key'
    process.env.YAMLRESUME_AI_MODEL = 'gpt-4o-mini'

    const model = getModelFromEnv()

    expect(model).toEqual({ id: 'gpt-4o-mini' })
  })

  it('should create a DeepSeek model with the default model id', () => {
    process.env.DEEPSEEK_API_KEY = 'test-deepseek-key'

    const model = getModelFromEnv()

    expect(createOpenAI).toBeCalledWith({
      apiKey: 'test-deepseek-key',
      baseURL: 'https://api.deepseek.com',
    })
    expect(model).toEqual({ id: 'deepseek-v4-flash' })
  })

  it('should create a DeepSeek model with a custom model id', () => {
    process.env.DEEPSEEK_API_KEY = 'test-deepseek-key'
    process.env.YAMLRESUME_AI_MODEL = 'deepseek-reasoner'

    const model = getModelFromEnv()

    expect(model).toEqual({ id: 'deepseek-reasoner' })
  })

  it('should create an Ollama model with the default model id', () => {
    process.env.OLLAMA_HOST = 'localhost:11434'

    const model = getModelFromEnv()

    expect(createOpenAI).toBeCalledWith({
      apiKey: 'dummy',
      baseURL: 'http://localhost:11434/v1',
    })
    expect(model).toEqual({ id: 'llama3.2' })
  })

  it('should create an Ollama model with a custom model id', () => {
    process.env.OLLAMA_HOST = 'localhost:11434'
    process.env.YAMLRESUME_AI_MODEL = 'qwen2.5'

    const model = getModelFromEnv()

    expect(model).toEqual({ id: 'qwen2.5' })
  })

  it('should create an Ollama model with a custom base URL', () => {
    process.env.OLLAMA_HOST = 'localhost:11434'
    process.env.YAMLRESUME_AI_BASE_URL = 'http://192.168.1.100:11434/v1'

    const model = getModelFromEnv()

    expect(createOpenAI).toBeCalledWith({
      apiKey: 'dummy',
      baseURL: 'http://192.168.1.100:11434/v1',
    })
    expect(model).toEqual({ id: 'llama3.2' })
  })

  it('should override the model from env with the model option', () => {
    process.env.OPENAI_API_KEY = 'test-openai-key'
    process.env.YAMLRESUME_AI_MODEL = 'gpt-4o-mini'

    const model = getModelFromEnv({ model: 'gpt-5' })

    expect(model).toEqual({ id: 'gpt-5' })
  })

  it('should override the base URL from env with the baseURL option', () => {
    process.env.OPENAI_API_KEY = 'test-openai-key'
    process.env.YAMLRESUME_AI_BASE_URL = 'https://env.openai.example.com/v1'

    getModelFromEnv({ baseURL: 'https://cli.openai.example.com/v1' })

    expect(createOpenAI).toBeCalledWith({
      apiKey: 'test-openai-key',
      baseURL: 'https://cli.openai.example.com/v1',
    })
  })

  it('should override both model and base URL from env with CLI options', () => {
    process.env.DEEPSEEK_API_KEY = 'test-deepseek-key'
    process.env.YAMLRESUME_AI_MODEL = 'deepseek-v4-flash'
    process.env.YAMLRESUME_AI_BASE_URL = 'https://env.deepseek.com'

    const model = getModelFromEnv({
      model: 'deepseek-reasoner',
      baseURL: 'https://cli.deepseek.com',
    })

    expect(createOpenAI).toBeCalledWith({
      apiKey: 'test-deepseek-key',
      baseURL: 'https://cli.deepseek.com',
    })
    expect(model).toEqual({ id: 'deepseek-reasoner' })
  })
})
