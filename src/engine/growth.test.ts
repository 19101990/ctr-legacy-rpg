import { describe, expect, it } from 'vitest'
import {
  ATTRIBUTE_MAX,
  GRIT_MAX,
  STAMINA_MAX,
  attributeCost,
  purchaseCost,
  spendExperience,
} from './growth'
import { createInitialState } from './state'
import type { BrotherId, GameState } from './types'

function withXp(xp: number, brother: BrotherId = 'andreas'): GameState {
  const state = createInitialState()
  return {
    ...state,
    chars: { ...state.chars, [brother]: { ...state.chars[brother], xp } },
  }
}

describe('spending experience', () => {
  it('prices an attribute at its current value plus two', () => {
    const state = withXp(0)
    expect(attributeCost(4)).toBe(6)
    expect(purchaseCost(state, 'andreas', { kind: 'attribute', attribute: 'kraft' })).toBe(6)
    expect(purchaseCost(state, 'andreas', { kind: 'stamina' })).toBe(5)
    expect(purchaseCost(state, 'andreas', { kind: 'grit' })).toBe(4)
  })

  it('raises an attribute and takes the Experience', () => {
    const next = spendExperience(withXp(8), 'andreas', { kind: 'attribute', attribute: 'kraft' })
    expect(next.chars.andreas.attrs.kraft).toBe(5)
    expect(next.chars.andreas.xp).toBe(2)
    expect(next.chars.henning).toEqual(createInitialState().chars.henning)
  })

  it('adds a point of maximum Stamina and heals one point', () => {
    const base = withXp(5)
    const hurt = {
      ...base,
      chars: { ...base.chars, andreas: { ...base.chars.andreas, stam: 3 } },
    }
    const next = spendExperience(hurt, 'andreas', { kind: 'stamina' })
    expect(next.chars.andreas).toMatchObject({ stamMax: 9, stam: 4, xp: 0 })
  })

  it('adds a point of Grit', () => {
    const next = spendExperience(withXp(4, 'casper'), 'casper', { kind: 'grit' })
    expect(next.chars.casper).toMatchObject({ grit: 3, xp: 0 })
  })

  it('changes nothing when the brother cannot afford it', () => {
    const state = withXp(3)
    expect(spendExperience(state, 'andreas', { kind: 'grit' })).toBe(state)
    expect(spendExperience(state, 'andreas', { kind: 'stamina' })).toBe(state)
    expect(spendExperience(state, 'andreas', { kind: 'attribute', attribute: 'kraft' })).toBe(state)
  })

  it('changes nothing at the maximum', () => {
    const base = withXp(99)
    const capped: GameState = {
      ...base,
      chars: {
        ...base.chars,
        andreas: {
          ...base.chars.andreas,
          attrs: { ...base.chars.andreas.attrs, kraft: ATTRIBUTE_MAX },
          stamMax: STAMINA_MAX,
          grit: GRIT_MAX,
        },
      },
    }
    expect(spendExperience(capped, 'andreas', { kind: 'attribute', attribute: 'kraft' })).toBe(capped)
    expect(spendExperience(capped, 'andreas', { kind: 'stamina' })).toBe(capped)
    expect(spendExperience(capped, 'andreas', { kind: 'grit' })).toBe(capped)
  })
})
