import { describe, test, expect } from '../dist/index.esm.js'

describe('Saintest', () => {
  test('My test', () => {
    expect(1).toBe(1)
  })
  test('My test', () => {
    expect(1).toBe(3)
  })
})
describe('Saintest 2', () => {
  test('My test', () => {
    expect(1).toBe(1)
  })
  test('My test', () => {
    expect(1).toBe(1)
  })
})
