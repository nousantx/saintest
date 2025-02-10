import { style, colors } from './lib/ui.js'
import { expect } from './lib/expect.js'
export const testSuites = []
export const defaultSuite = {
  name: 'Standalone Tests',
  tests: [],
  beforeEach: null,
  afterEach: null,
  beforeAll: null,
  afterAll: null
}
export let currentSuite = null
let totalTests = 0
let passedTests = 0
let failedTests = 0
let skippedTests = 0
let startTime = 0

const getExecutionTime = () => {
  const endTime = performance.now()
  return ((endTime - startTime) / 1000).toFixed(3)
}

export function describe(name, fn) {
  const suite = {
    name,
    tests: [],
    beforeEach: null,
    afterEach: null,
    beforeAll: null,
    afterAll: null
  }

  testSuites.push(suite)
  const previousSuite = currentSuite
  currentSuite = suite
  fn()
  currentSuite = previousSuite
}

export function beforeEach(fn) {
  if (currentSuite) {
    currentSuite.beforeEach = fn
  } else {
    defaultSuite.beforeEach = fn
  }
}

export function afterEach(fn) {
  if (currentSuite) {
    currentSuite.afterEach = fn
  } else {
    defaultSuite.afterEach = fn
  }
}

export function beforeAll(fn) {
  if (currentSuite) {
    currentSuite.beforeAll = fn
  } else {
    defaultSuite.beforeAll = fn
  }
}

export function afterAll(fn) {
  if (currentSuite) {
    currentSuite.afterAll = fn
  } else {
    defaultSuite.afterAll = fn
  }
}

export function it(name, fn) {
  const test = {
    name,
    fn,
    skip: false,
    only: false,
    timeout: 100
  }

  if (currentSuite) {
    currentSuite.tests.push(test)
  } else {
    defaultSuite.tests.push(test)
  }
  totalTests++
  return {
    skip: () => {
      test.skip = true
      totalTests--
      skippedTests++
    },
    only: () => {
      test.only = true
    },
    timeout: (ms) => {
      test.timeout = ms
    }
  }
}

export function test(name, fn) {
  return it(name, fn)
}

async function runTest(test, suite) {
  if (test.skip) {
    console.log(
      `  ${style.fg(colors.warning)}○${style.reset} ` +
        `${style.fg(colors.text)}${test.name} ${style.italic}(skipped)${style.reset}`
    )
    return { status: 'skipped' }
  }

  try {
    if (suite.beforeEach) await suite.beforeEach()

    const testPromise = Promise.race([
      Promise.resolve(test.fn()),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Test timed out after ${test.timeout}ms`)), test.timeout)
      )
    ])

    await testPromise
    if (suite.afterEach) await suite.afterEach()

    console.log(
      `  ${style.fg(colors.success)}✓${style.reset} ` +
        `${style.fg(colors.highlight)}${test.name}${style.reset}`
    )
    return { status: 'passed' }
  } catch (error) {
    console.log(
      `  ${style.fg(colors.error)}✗${style.reset} ` +
        `${style.fg(colors.text)}${test.name}${style.reset}`
    )
    console.log(`${style.fg(colors.text)}    ${error.message}${style.reset}`)
    return { status: 'failed' }
  }
}

async function runSuite(suite) {
  if (suite.tests.length === 0) return

  let suitePassed = 0
  let suiteFailed = 0
  let suiteSkipped = 0

  console.log(
    `\n${style.fg(colors.success)}${suite.name}${style.fg(colors.text)} ` +
      `[${suite.tests.length} tests]${style.reset}\n`
  )

  try {
    if (suite.beforeAll) await suite.beforeAll()

    const onlyTests = suite.tests.filter((t) => t.only)
    const testsToRun = onlyTests.length > 0 ? onlyTests : suite.tests

    for (const test of testsToRun) {
      const result = await runTest(test, suite)
      switch (result.status) {
        case 'passed':
          suitePassed++
          passedTests++
          break
        case 'failed':
          suiteFailed++
          failedTests++
          break
        case 'skipped':
          suiteSkipped++
          break
      }
    }

    if (suite.afterAll) await suite.afterAll()

    const suiteTotal = suitePassed + suiteFailed + suiteSkipped
    const suitePassedPercentage = ((suitePassed / (suiteTotal - suiteSkipped)) * 100).toFixed(2)

    console.log(`\n  Suite Summary:`)
    console.log(
      `  ${style.fg(colors.success)}${suitePassedPercentage}%${style.reset} ` +
        `${style.fg(colors.text)}passing${style.reset}`
    )
    console.log(
      `  ${style.fg(colors.success)}${suitePassed} passed${style.reset}` +
        ` · ` +
        `${style.fg(colors.error)}${suiteFailed} failed${style.reset}` +
        ` · ` +
        `${style.fg(colors.warning)}${suiteSkipped} skipped${style.reset}` +
        ` · ` +
        `${style.fg(colors.text)}${suiteTotal} total${style.reset}`
    )
  } catch (error) {
    console.error(`${style.fg(colors.error)}Suite Error: ${error.message}${style.reset}`)
  }
}

export async function run() {
  startTime = performance.now()

  if (defaultSuite.tests.length > 0) {
    await runSuite(defaultSuite)
  }

  for (const suite of testSuites) {
    await runSuite(suite)
  }

  const executionTime = getExecutionTime()
  const totalTestCount = passedTests + failedTests + skippedTests
  const passedPercentage = ((passedTests / (totalTestCount - skippedTests)) * 100).toFixed(2)

  if (testSuites.length > 0 || defaultSuite.tests.length > 0) {
    console.log('\nFinal Test Results:')
    console.log(
      `${style.fg(colors.success)}${passedPercentage}%${style.reset} ` +
        `${style.fg(colors.text)}of all tests passing${style.reset}`
    )

    console.log(
      `${style.fg(colors.success)}${passedTests} passed${style.reset}` +
        ` · ` +
        `${style.fg(colors.error)}${failedTests} failed${style.reset}` +
        ` · ` +
        `${style.fg(colors.warning)}${skippedTests} skipped${style.reset}` +
        ` · ` +
        `${style.fg(colors.text)}${totalTestCount} total${style.reset}`
    )

    console.log(`${style.fg(colors.text)}Total Time: ${executionTime}s${style.reset}\n`)
  }
}

export { expect } from './lib/expect.js'
export default {
  expect,
  it,
  test,
  describe,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  run,
  testSuites,
  defaultSuite,
  currentSuite
}
