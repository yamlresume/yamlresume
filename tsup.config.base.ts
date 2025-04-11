import { Options } from 'tsup'

export const baseConfig: Options = {
  clean: true,
  format: 'esm',
  target: 'esnext',
  treeshake: true,
}
