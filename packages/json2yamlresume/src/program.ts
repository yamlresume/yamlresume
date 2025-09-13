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
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

import fs from 'node:fs'
import path from 'node:path'

import chalk from 'chalk'
import { Command } from 'commander'
import { consola } from 'consola'
import yaml from 'yaml'

import { convertJSONResumeToYAMLResume } from './converter'
import type { JSONResume } from './types'

import packageJson from '../package.json' with { type: 'json' }

/**
 * Generate output filename by replacing .json extension with .yml
 * If no .json extension is found, append .yml to the filename
 *
 * @param inputPath - The input JSON file path
 * @returns The generated output YAML file path
 */
export function inferOutputPath(inputPath: string): string {
  const inputExt = path.extname(inputPath)
  if (inputExt.toLowerCase() === '.json') {
    return inputPath.replace(/\.json$/i, '.yml')
  }
  return `${inputPath}.yml`
}

/**
 * Convert JSON Resume to YAMLResume format action handler.
 *
 * @param inputPath - The input JSON file path
 * @param outputPath - The output YAML file path
 */
export async function convertResumeAction(
  inputPath: string,
  outputPath?: string
) {
  try {
    // Generate output path if not provided
    const finalOutputPath = outputPath || inferOutputPath(inputPath)

    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      consola.error(`Input file not found: ${inputPath}`)
      process.exit(1)
    }

    // Read and parse JSON Resume
    consola.info(`Reading JSON Resume from: ${inputPath}`)
    const jsonContent = fs.readFileSync(inputPath, 'utf-8')

    let jsonResume: JSONResume
    try {
      // YAML is a superset of JSON, so we use `yaml.parse` to parse the JSON
      // file with an added benefit of being able to parse both JSON and YAML
      // files at the same time.
      jsonResume = yaml.parse(jsonContent)
    } catch (error) {
      consola.error(`Failed to parse JSON file: ${error}`)
      process.exit(1)
    }

    // Convert to YAMLResume
    consola.info('Converting JSON Resume to YAMLResume format...')
    const yamlResume = convertJSONResumeToYAMLResume(jsonResume)

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(finalOutputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Write YAMLResume to file
    consola.info(`Writing YAMLResume to: ${finalOutputPath}`)
    const preamble = [
      '# yaml-language-server: $schema=https://yamlresume.dev/schema.json',
      '#',
      '# This is a resume converted from JSON Resume to YAMLResume,',
      '# see: https://yamlresume.dev/docs/ecosystem/json2yamlresume for details',
      '',
      '---',
    ].join('\n')

    const yamlContent = yaml.stringify(yamlResume, {
      indent: 2,
    })
    fs.writeFileSync(finalOutputPath, `${preamble}\n${yamlContent}`, 'utf-8')

    consola.success('Conversion completed successfully!')
    consola.info(`${chalk.green('✓')} JSON Resume: ${inputPath}`)
    consola.info(`${chalk.green('✓')} YAMLResume: ${finalOutputPath}`)
  } catch (error) {
    consola.error(
      'Conversion failed:',
      error?.message || error || 'Unknown error'
    )
    process.exit(1)
  }
}

export function createProgram(): Command {
  const program = new Command()

  program
    .name('json2yamlresume')
    .description('Convert JSON Resume to YAMLResume format')
    .version(packageJson.version)
    .argument('<input-file>', 'Input JSON Resume file path')
    .argument('[output-file]', 'Output YAMLResume file path')
    .action(convertResumeAction)

  return program
}
