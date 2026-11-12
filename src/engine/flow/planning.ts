import { isAvailableInChapter, resolveCost } from '../content'
import type { ActionContent, ActionRegistry } from '../content'
import { test } from '../rules'
import type { BrotherId, GameState } from '../types'
import { BROTHER_NAMES, ORDER, COST_KEYS } from './shared'
import type { CostKey } from './shared'

export function getAvailableActions(
  state: GameState,
  brotherId: BrotherId,
  actions: ActionRegistry,
): ActionContent[] {
  const characterState = { ...state, lead: brotherId }
  return actions.filter((action) => {
    const onceKey = `${state.ch}:${action.id}`
    const allowedBrothers =
      action.who === undefined || action.who === 'all'
        ? ORDER
        : typeof action.who === 'string'
          ? [action.who]
          : action.who
    return (
      isAvailableInChapter(action.chapter, state.ch) &&
      (action.location === 'home' || Boolean(state.unlocked[action.location])) &&
      allowedBrothers.includes(brotherId) &&
      (!action.once || !state.done[onceKey]) &&
      test(characterState, action.condition)
    )
  })
}

export function canPlanAction(
  state: GameState,
  brotherId: BrotherId,
  action: ActionContent,
  actions: ActionRegistry,
): boolean {
  const reserved: Partial<Record<CostKey, number>> = {}
  for (const otherBrother of ORDER) {
    if (otherBrother === brotherId) continue
    const planned = actions.find(
      (candidate) => candidate.id === state.plans[otherBrother],
    )
    if (!planned?.cost) continue
    const cost = resolveCost(planned.cost, { ...state, lead: otherBrother })
    for (const key of COST_KEYS) {
      reserved[key] = (reserved[key] ?? 0) + (cost[key] ?? 0)
    }
  }
  const cost = action.cost
    ? resolveCost(action.cost, { ...state, lead: brotherId })
    : {}
  return COST_KEYS.every(
    (key) => state.hof[key] >= (reserved[key] ?? 0) + (cost[key] ?? 0),
  )
}

export function setPlan(
  state: GameState,
  brotherId: BrotherId,
  actionId: string,
  actions: ActionRegistry,
): GameState {
  if (state.forced[brotherId]) {
    throw new Error(`${BROTHER_NAMES[brotherId]} must rest today`)
  }
  const action = getAvailableActions(state, brotherId, actions).find(
    (candidate) => candidate.id === actionId,
  )
  if (!action || !canPlanAction(state, brotherId, action, actions)) {
    throw new Error(`Action ${actionId} is not available for ${brotherId}`)
  }
  return {
    ...state,
    plans: { ...state.plans, [brotherId]: actionId },
  }
}
