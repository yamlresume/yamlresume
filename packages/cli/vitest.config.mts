import { defineConfig, mergeConfig } from 'vitest/config'
import { baseConfig } from '../../vitest.config.base.mts'

export default defineConfig(mergeConfig(baseConfig, {}))
