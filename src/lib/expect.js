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
    },

    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected ${actual} to be null`)
      }
    },

    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error(`Expected ${actual} to be undefined`)
      }
    },

    toBeDefined() {
      if (actual === undefined) {
        throw new Error('Expected value to be defined')
      }
    },

    toBeNaN() {
      if (!Number.isNaN(actual)) {
        throw new Error(`Expected ${actual} to be NaN`)
      }
    },

    toMatch(regex) {
      if (!regex.test(actual)) {
        throw new Error(`Expected ${actual} to match ${regex}`)
      }
    },

    not: {
      toBe(expected) {
        if (actual === expected) {
          throw new Error(
            `Expected ${JSON.stringify(actual)} not to be ${JSON.stringify(expected)}`
          )
        }
      },

      toEqual(expected) {
        if (JSON.stringify(actual) === JSON.stringify(expected)) {
          throw new Error(`Expected values not to be deeply equal${formatDiff(actual, expected)}`)
        }
      },

      toBeInstanceOf(constructor) {
        if (actual instanceof constructor) {
          throw new Error(`Expected ${actual} not to be instance of ${constructor.name}`)
        }
      },

      toMatch(regex) {
        if (regex.test(actual)) {
          throw new Error(`Expected ${actual} not to match ${regex}`)
        }
      },

      toContain(item) {
        if (actual.includes(item)) {
          throw new Error(
            `Expected ${JSON.stringify(actual)} not to contain ${JSON.stringify(item)}`
          )
        }
      },

      toBeTruthy() {
        if (actual) {
          throw new Error(`Expected ${actual} not to be truthy`)
        }
      },

      toBeFalsy() {
        if (!actual) {
          throw new Error(`Expected ${actual} not to be falsy`)
        }
      },

      toBeNull() {
        if (actual === null) {
          throw new Error('Expected value not to be null')
        }
      },

      toBeUndefined() {
        if (actual === undefined) {
          throw new Error('Expected value not to be undefined')
        }
      },

      toBeDefined() {
        if (actual !== undefined) {
          throw new Error('Expected value to be undefined')
        }
      },

      toBeNaN() {
        if (Number.isNaN(actual)) {
          throw new Error('Expected value not to be NaN')
        }
      },

      toHaveLength(length) {
        if (actual.length === length) {
          throw new Error(`Expected length not to be ${length}`)
        }
      },

      toBeGreaterThan(expected) {
        if (actual > expected) {
          throw new Error(`Expected ${actual} not to be greater than ${expected}`)
        }
      },

      toBeLessThan(expected) {
        if (actual < expected) {
          throw new Error(`Expected ${actual} not to be less than ${expected}`)
        }
      },

      toHaveProperty(propertyPath, value) {
        const properties = propertyPath.split('.')
        let currentObject = actual

        try {
          for (const property of properties) {
            currentObject = currentObject[property]
          }

          if (value === undefined) {
            throw new Error(`Expected object not to have property "${propertyPath}"`)
          }

          if (currentObject === value) {
            throw new Error(
              `Expected property "${propertyPath}" not to have value ${JSON.stringify(value)}`
            )
          }
        } catch (e) {
          // Property path doesn't exist, which is what we want for negative case
          return
        }
      },

      toThrow(expectedError) {
        try {
          actual()
          // If we get here, the function didn't throw, which is what we want
        } catch (error) {
          if (!expectedError) {
            throw new Error('Expected function not to throw an error')
          }
          if (error.message === expectedError) {
            throw new Error(`Expected function not to throw error "${expectedError}"`)
          }
        }
      },

      toBeCloseTo(expected, precision = 2) {
        const multiplier = Math.pow(10, precision)
        const roundedActual = Math.round(actual * multiplier)
        const roundedExpected = Math.round(expected * multiplier)

        if (roundedActual === roundedExpected) {
          throw new Error(
            `Expected ${actual} not to be close to ${expected} with precision of ${precision} decimal points`
          )
        }
      }
    },

    toHaveProperty(propertyPath, value) {
      const properties = propertyPath.split('.')
      let currentObject = actual

      for (const property of properties) {
        if (!(property in currentObject)) {
          throw new Error(`Expected object to have property "${propertyPath}"`)
        }
        currentObject = currentObject[property]
      }

      if (value !== undefined && currentObject !== value) {
        throw new Error(
          `Expected property "${propertyPath}" to have value ${JSON.stringify(
            value
          )}, got ${JSON.stringify(currentObject)}`
        )
      }
    },

    toBeCloseTo(expected, precision = 2) {
      const multiplier = Math.pow(10, precision)
      const roundedActual = Math.round(actual * multiplier)
      const roundedExpected = Math.round(expected * multiplier)

      if (roundedActual !== roundedExpected) {
        throw new Error(
          `Expected ${actual} to be close to ${expected} with precision of ${precision} decimal points`
        )
      }
    }
  }
}
