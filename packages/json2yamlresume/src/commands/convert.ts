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

import fs from 'node:fs'
import path from 'node:path'
import { Command } from 'commander'
import { consola } from 'consola'
import YAML from 'yaml'

import { convertJSONResumeToYAMLResume } from '../converter'
import type { JSONResume } from '../types'

export function createConvertCommand(): Command {
  return new Command('convert')
    .description('Convert JSON Resume to YAMLResume format')
    .argument('<input>', 'Input JSON Resume file path')
    .argument('<output>', 'Output YAMLResume file path')
    .action(async (inputPath: string, outputPath: string) => {
      try {
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
          jsonResume = JSON.parse(jsonContent)
        } catch (error) {
          consola.error(`Failed to parse JSON file: ${error}`)
          process.exit(1)
        }

        // Convert to YAMLResume
        consola.info('Converting JSON Resume to YAMLResume format...')
        const yamlResume = convertJSONResumeToYAMLResume(jsonResume)

        // Create output directory if it doesn't exist
        const outputDir = path.dirname(outputPath)
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true })
        }

        // Write YAMLResume to file
        consola.info(`Writing YAMLResume to: ${outputPath}`)
        const yamlContent = YAML.stringify(yamlResume, {
          indent: 2,
          lineWidth: 80,
          minContentWidth: 20,
        })
        fs.writeFileSync(outputPath, yamlContent, 'utf-8')

        consola.success('Conversion completed successfully!')
        consola.info(`✓ JSON Resume: ${inputPath}`)
        consola.info(`✓ YAMLResume: ${outputPath}`)
      } catch (error) {
        consola.error(`Conversion failed: ${error}`)
        process.exit(1)
      }
    })
}
