import type { Attribute, BrotherId, GameState } from './types'

export const ATTRIBUTE_MAX = 6
export const STAMINA_MAX = 11
export const GRIT_MAX = 4
export const STAMINA_COST = 5
export const GRIT_COST = 4

export type Purchase =
  | { kind: 'attribute'; attribute: Attribute }
  | { kind: 'stamina' | 'grit' }

/** Raising an attribute from its current value costs that value plus two. */
export const attributeCost = (value: number): number => value + 2

export function purchaseCost(
  state: GameState,
  brother: BrotherId,
  purchase: Purchase,
): number {
  if (purchase.kind === 'attribute') {
    return attributeCost(state.chars[brother].attrs[purchase.attribute])
  }
  return purchase.kind === 'stamina' ? STAMINA_COST : GRIT_COST
}

/**
 * Spends a brother's Experience on a better attribute, more Stamina or more
 * Grit. Returns the same state when the brother cannot afford it or is
 * already at the maximum.
 */
export function spendExperience(
  state: GameState,
  brother: BrotherId,
  purchase: Purchase,
): GameState {
  const character = state.chars[brother]
  const cost = purchaseCost(state, brother, purchase)
  if (character.xp < cost) return state
  if (purchase.kind === 'attribute' && character.attrs[purchase.attribute] >= ATTRIBUTE_MAX) return state
  if (purchase.kind === 'stamina' && character.stamMax >= STAMINA_MAX) return state
  if (purchase.kind === 'grit' && character.grit >= GRIT_MAX) return state

  const upgraded = { ...character, xp: character.xp - cost }
  if (purchase.kind === 'attribute') {
    upgraded.attrs = {
      ...character.attrs,
      [purchase.attribute]: character.attrs[purchase.attribute] + 1,
    }
  } else if (purchase.kind === 'stamina') {
    upgraded.stamMax = character.stamMax + 1
    upgraded.stam = Math.min(upgraded.stam + 1, upgraded.stamMax)
  } else {
    upgraded.grit = character.grit + 1
  }
  return { ...state, chars: { ...state.chars, [brother]: upgraded } }
}
