import { style, colors } from './ui.js'

function formatDiff(actual, expected) {
  return `\n    ${style.fg(colors.success)}+ Expected: ${JSON.stringify(expected)}${style.reset}
    ${style.fg(colors.error)}- Received: ${JSON.stringify(actual)}${style.reset}`
}

export function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}${formatDiff(
            actual,
            expected
          )}`
        )
      }
    },

    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected deep equality${formatDiff(actual, expected)}`)
      }
    },

    toThrow(expectedError) {
      let threw = false
      let thrownError = null

      try {
        actual()
      } catch (error) {
        threw = true
        thrownError = error
      }

      if (!threw) {
        throw new Error('Expected function to throw an error')
      }

      if (expectedError && thrownError.message !== expectedError) {
        throw new Error(
          `Expected error message "${expectedError}" but got "${thrownError.message}"`
        )
      }
    },

    toBeGreaterThan(expected) {
      if (!(actual > expected)) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`)
      }
    },

    toBeLessThan(expected) {
      if (!(actual < expected)) {
        throw new Error(`Expected ${actual} to be less than ${expected}`)
      }
    },

    toContain(item) {
      if (!actual.includes(item)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`)
      }
    },

    toHaveLength(length) {
      if (actual.length !== length) {
        throw new Error(`Expected length of ${actual.length} to be ${length}`)
      }
    },

    toBeInstanceOf(constructor) {
      if (!(actual instanceof constructor)) {
        throw new Error(`Expected ${actual} to be instance of ${constructor.name}`)
      }
    },

    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected ${actual} to be truthy`)
      }
    },

    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected ${actual} to be falsy`)
      }
    }
  }
}
