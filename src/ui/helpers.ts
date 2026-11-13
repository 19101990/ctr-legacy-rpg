import type { Cost, SectionContent } from '../engine/content'
import { currentCheckDefinition } from '../engine/flow'
import { actions as allActions } from '../engine/chapters'
import { rivalBonus, tgt } from '../engine/rules'
import type { GameState } from '../engine/types'

export const COST_LABELS: Record<keyof Cost, string> = {
  korn: 'Stores',
  kasse: 'Groschen',
  baustoff: 'Materials',
  gunst: 'Favours',
}

export function costText(cost: Cost): string {
  return (Object.entries(cost) as [keyof Cost, number][])
    .filter(([, amount]) => amount > 0)
    .map(([key, amount]) => `${amount} ${COST_LABELS[key]}`)
    .join(', ')
}

export function canPay(state: GameState, cost: Cost): boolean {
  return Object.entries(cost).every(([key, amount]) => {
    const resource = key as 'korn' | 'kasse' | 'baustoff' | 'gunst'
    return state.hof[resource] >= (amount ?? 0)
  })
}

export function checkChance(modifier: number, target: number): number {
  const wins = [1, 2, 3, 4, 5, 6].filter((die) => die + modifier >= target).length
  return Math.round((wins / 6) * 100)
}

export function checkChallenge(
  definition: NonNullable<ReturnType<typeof currentCheckDefinition>>,
  state: GameState,
): string {
  if ('rival' in definition) {
    const rival = typeof definition.rival === 'function'
      ? definition.rival(state)
      : definition.rival
    return `beat the rival’s d6 + ${rivalBonus(rival)}`
  }
  return `reach ${tgt(definition, state.ch)}`
}

export function gameStateForChoice(
  state: GameState,
  choice: NonNullable<SectionContent['choices']>[number],
): GameState {
  return choice.as ? { ...state, lead: choice.as } : state
}

export function actionName(actionId: string): string {
  return allActions.find((action) => action.id === actionId)?.name ?? actionId
}

/**
 * Which tab an arrow/Home/End key moves to, wrapping at the ends; null for
 * any other key. Left/Right are the ARIA tab-list keys; Up/Down are accepted
 * too because the tabs wrap onto several rows on a narrow screen.
 */
export function nextTab<T>(order: readonly T[], current: T, key: string): T | null {
  const index = order.indexOf(current)
  if (index === -1 || order.length === 0) return null
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return order[(index + 1) % order.length]
    case 'ArrowLeft':
    case 'ArrowUp':
      return order[(index - 1 + order.length) % order.length]
    case 'Home':
      return order[0]
    case 'End':
      return order[order.length - 1]
    default:
      return null
  }
}
