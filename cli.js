#!/usr/bin/env node
import path from 'node:path'
import fs from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { program } from 'commander'
import { globby } from 'globby'
import { run } from './dist/index.esm.js'

// Default configuration
const defaultConfig = {
  include: ['**/*.test.js', '**/*.spec.js'],
  timeout: 5000,
  dir: 'test',
  verbose: false
}

async function loadConfig() {
  const configFiles = ['saintest.config.js', 'saintest.config.mjs']
  let config = { ...defaultConfig }

  for (const configFile of configFiles) {
    try {
      const configPath = path.resolve(process.cwd(), configFile)
      const configExists = await fs
        .access(configPath)
        .then(() => true)
        .catch(() => false)

      if (configExists) {
        const userConfig = await import(pathToFileURL(configPath))
        config = { ...config, ...userConfig.default }
        break
      }
    } catch (error) {
      console.warn(`Warning: Error loading config from ${configFile}:`, error.message)
    }
  }

  return config
}

async function findTestFiles(patterns, config) {
  try {
    const normalizedPatterns = patterns.map((pattern) => {
      // If pattern starts with ! (negation), preserve it
      const isNegated = pattern.startsWith('!')
      const cleanPattern = isNegated ? pattern.slice(1) : pattern

      // If pattern is absolute or starts with ./, keep as is
      if (
        path.isAbsolute(cleanPattern) ||
        cleanPattern.startsWith('./') ||
        cleanPattern.startsWith('../')
      ) {
        return isNegated ? `!${cleanPattern}` : cleanPattern
      }

      // Otherwise, combine with dir
      const combinedPattern = path.join(process.cwd(), config.dir, cleanPattern)
      return isNegated ? `!${combinedPattern}` : combinedPattern
    })

    if (config.verbose) {
      console.log('Searching with patterns:', normalizedPatterns)
    }

    const files = await globby(normalizedPatterns, {
      absolute: true,
      ignore: ['**/node_modules/**']
    })

    return files
  } catch (error) {
    console.error('Error finding test files:', error.message)
    return []
  }
}

async function runTests(testFiles, config) {
  global.__SAINTEST_CONFIG__ = config

  try {
    for (const file of testFiles) {
      await import(pathToFileURL(file))
    }

    await run()
    process.exit(global.__SAINTEST_FAILED__ ? 1 : 0)
  } catch (error) {
    console.error('Error running tests:', error.message)
    process.exit(1)
  }
}

program
  .name('saintest')
  .description('A simple and flexible JavaScript testing framework')
  .version('0.0.0-alpha.0')
  .option('-c, --config <path>', 'path to config file')
  .option('-t, --timeout <ms>', 'default timeout for tests in milliseconds')
  .option('-d, --dir <dir>', 'directory containing test files')
  .option('-p, --pattern <pattern>', 'test file pattern')
  .option('-v, --verbose', 'enable verbose output')
  .action(async (options) => {
    try {
      const fileConfig = await loadConfig()
      const config = {
        ...fileConfig,
        ...(options.timeout && { timeout: parseInt(options.timeout) }),
        ...(options.dir && { dir: options.dir }),
        ...(options.pattern && { include: [options.pattern] }),
        ...(options.verbose && { verbose: true })
      }

      if (config.verbose) {
        console.log('Running with config:', config)
      }

      const testFiles = await findTestFiles(config.include, config)

      if (testFiles.length === 0) {
        console.warn('No test files found')
        process.exit(0)
      }

      if (config.verbose) {
        console.log('Found test files:', testFiles)
      }

      await runTests(testFiles, config)
    } catch (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  })

program.parse()
