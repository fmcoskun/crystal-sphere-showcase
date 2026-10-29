import { expect, test } from 'vitest'
import { stageReducer, type Stage } from './stage'

const orb: Stage = { view: 'orb' }
const list: Stage = { view: 'list' }
const detail: Stage = { view: 'detail', module: 'automation' }

test('OPEN moves orb to list', () => {
  expect(stageReducer(orb, { type: 'OPEN' })).toEqual(list)
})

test('SELECT moves list to detail of that module', () => {
  expect(stageReducer(list, { type: 'SELECT', module: 'automation' })).toEqual(detail)
})

test('SELECT inside detail switches module', () => {
  expect(stageReducer(detail, { type: 'SELECT', module: 'performance' })).toEqual({
    view: 'detail',
    module: 'performance',
  })
})

test('BACK moves detail to list and list to orb', () => {
  expect(stageReducer(detail, { type: 'BACK' })).toEqual(list)
  expect(stageReducer(list, { type: 'BACK' })).toEqual(orb)
})

test('CLOSE returns to orb from anywhere', () => {
  expect(stageReducer(list, { type: 'CLOSE' })).toEqual(orb)
  expect(stageReducer(detail, { type: 'CLOSE' })).toEqual(orb)
})

test('invalid events return the same reference', () => {
  expect(stageReducer(orb, { type: 'SELECT', module: 'security' })).toBe(orb)
  expect(stageReducer(orb, { type: 'BACK' })).toBe(orb)
  expect(stageReducer(list, { type: 'OPEN' })).toBe(list)
  expect(stageReducer(detail, { type: 'OPEN' })).toBe(detail)
})
