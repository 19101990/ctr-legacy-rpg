import { resolveContentText } from '../content'
import type { CheckContent, Cost } from '../content'
import { BROTHER_IDS } from '../types'
import type { BrotherId, Chip, FinalOutcome, GameResult, GameState } from '../types'

export const BROTHER_NAMES: Record<BrotherId, string> = {
  andreas: 'Andreas',
  henning: 'Henning',
  casper: 'Casper',
}

export const ORDER = BROTHER_IDS

export const COST_KEYS = ['korn', 'kasse', 'baustoff', 'gunst'] as const

export type CostKey = (typeof COST_KEYS)[number]

export function interpolateBrotherName(
  text: string,
  brotherId: BrotherId,
): string {
  return text.replaceAll('{n}', BROTHER_NAMES[brotherId])
}

export function canAfford(state: GameState, cost: Cost): boolean {
  return COST_KEYS.every((key) => state.hof[key] >= (cost[key] ?? 0))
}

export function costEffects(cost: Cost): string[] {
  return COST_KEYS.flatMap((key) => {
    const amount = cost[key] ?? 0
    return amount > 0 ? [`${key}-${amount}`] : []
  })
}

export function appendLog(state: GameState, text?: string | ((state: GameState) => string)): GameState {
  if (!text) return state
  const entry = resolveContentText(text, state)
  if (!entry) return state
  return {
    ...state,
    log: [...state.log, { ch: state.ch, t: entry }],
  }
}

export function addResolvedLog(
  state: GameState,
  definition: CheckContent,
  success: boolean,
): GameState['log'] {
  const text = definition[success ? 'success' : 'failure'].log
  if (!text) return state.log
  const entry = resolveContentText(text, state)
  return [...state.log, { ch: state.ch, t: entry }]
}

export function withGo(final: FinalOutcome, fallback?: string): FinalOutcome {
  return { ...final, go: final.go ?? fallback }
}

export function dieRoll(random: () => number): number {
  const value = random()
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new Error('Random source must return a number in [0, 1)')
  }
  return Math.floor(value * 6) + 1
}

export function withResultRecovery(
  state: GameState,
  result: GameResult,
  chips: Chip[],
): GameState {
  const recovered = recoverCollapsed(state, chips)
  const finalResult = {
    ...result,
    final: { ...result.final!, chips: recovered.chips },
  } as GameResult
  return {
    ...recovered.state,
    mode: 'resolve',
    res: finalResult,
    chips: recovered.chips,
  }
}

export function recoverCollapsed(
  state: GameState,
  chips: Chip[],
): { state: GameState; chips: Chip[] } {
  let next = state
  const allChips = [...chips]
  for (const brotherId of ORDER) {
    const character = next.chars[brotherId]
    if (character.stam <= 0 && !next.phase?.active) {
      next = {
        ...next,
        chars: {
          ...next.chars,
          [brotherId]: {
            ...character,
            stam: 2,
            kw: character.kw.includes('weary')
              ? character.kw
              : [...character.kw, 'weary'],
          },
        },
        forced: { ...next.forced, [brotherId]: 1 },
      }
      allChips.push({
        t: `${BROTHER_NAMES[brotherId]} collapses and must rest tomorrow`,
        k: 'bad',
      })
    }
  }
  return { state: next, chips: allChips }
}
