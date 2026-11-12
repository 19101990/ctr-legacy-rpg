import { isAvailableInChapter, resolveCost } from '../content'
import type { ActionContent, ActionRegistry, EncounterRegistry, SectionRegistry } from '../content'
import { applyEffects, resolveGate, resolveOutcome } from '../resolution'
import { test } from '../rules'
import { getChapter } from '../chapters'
import type { BrotherId, Chip, FinalOutcome, GameState } from '../types'
import { BROTHER_NAMES, ORDER, canAfford, costEffects, withGo, dieRoll, withResultRecovery } from './shared'
import { enterSection } from './scene'
import { startEvening } from './evening'

export function nextDay(
  state: GameState,
  sections: SectionRegistry,
  random: () => number,
): GameState {
  const day = state.day + 1
  const flags = { ...state.flags }
  delete flags.scouted
  const chapter = getChapter(state.ch)
  if (day > chapter.days) {
    return enterSection(
      { ...state, day, flags, lead: 'andreas' },
      chapter.climax,
      sections,
    )
  }
  let next: GameState = {
    ...state,
    day,
    flags,
    plans: {},
    pick: null,
    pickLoc: null,
    mode: 'plan',
    sec: null,
    ri: 0,
    res: null,
  }
  for (const brotherId of ORDER) {
    if (next.forced[brotherId]) {
      next = {
        ...next,
        plans: { ...next.plans, [brotherId]: 'rest' },
      }
    }
  }
  next = { ...next, forced: {} }
  const roll = dieRoll(random)
  if (roll > 1) {
    const eventId = chapter.morningEvents[roll - 2]
    if (eventId && !next.done[`ev:${eventId}`]) {
      const event = sections[eventId]
      if (event && test(next, event.condition)) {
        next = {
          ...next,
          done: { ...next.done, [`ev:${eventId}`]: 1 },
          lead: 'andreas',
        }
        return enterSection(next, eventId, sections)
      }
    }
  }
  return next
}

export function resolveNext(
  state: GameState,
  actions: ActionRegistry,
): GameState {
  if (state.ri >= ORDER.length) {
    return startEvening(state)
  }
  const brotherId = ORDER[state.ri]
  const actionId = state.plans[brotherId]
  const action = actions.find((candidate) => candidate.id === actionId)
  if (!action) throw new Error(`Missing planned action ${actionId ?? ''}`)

  let next: GameState = {
    ...state,
    mode: 'resolve',
    lead: brotherId,
    chips: [],
  }
  const onceKey = `${state.ch}:${action.id}`
  const usedBy = state.done[onceKey]
  if (
    (action.once && usedBy && usedBy !== brotherId) ||
    !test(next, action.condition)
  ) {
    return setActionResult(
      next,
      action,
      brotherId,
      {
        text: `${BROTHER_NAMES[brotherId]} arrives to find the work already done. He spends the day mending harness and resting.`,
        go: '@next',
        chips: [],
      },
    )
  }

  if (action.cost) {
    const cost = resolveCost(action.cost, next)
    if (!canAfford(next, cost)) {
      return setActionResult(
        next,
        action,
        brotherId,
        {
          text: `The materials are gone by the time ${BROTHER_NAMES[brotherId]} gets there. He spends the day helping around the house instead.`,
          go: '@next',
          chips: [],
        },
      )
    }
    const paid = applyEffects(next, costEffects(cost))
    next = { ...paid.state, chips: paid.chips }
  }

  const stamina = action.stamina ??
    ((action.gate?.attr === 'kraft' ||
      action.gate?.attr === 'geschick' ||
      action.check?.attr === 'kraft' ||
      action.check?.attr === 'geschick' ||
      action.contest?.attr === 'kraft' ||
      action.contest?.attr === 'geschick')
      ? 1
      : 0)
  if (stamina > 0) {
    const spent = applyEffects(next, [`stam-${stamina}`])
    next = { ...spent.state, chips: [...next.chips, ...spent.chips] }
  }
  if (action.once) {
    next = {
      ...next,
      done: { ...next.done, [onceKey]: brotherId },
    }
  }

  const pre = [...next.chips]
  const outcome = action.outcome ?? action.noCheck
  if (outcome) {
    const resolved = resolveOutcome(next, outcome)
    const final = withGo(resolved.final, '@next')
    return setActionResult(
      resolved.state,
      action,
      brotherId,
      final,
      [...pre, ...resolved.chips],
    )
  }
  if (action.gate) {
    const resolved = resolveGate(next, action.gate)
    const final = withGo(resolved.final, '@next')
    return withResultRecovery(
      { ...resolved.state, mode: 'resolve' },
      {
        kind: 'gate',
        act: action.id,
        brother: brotherId,
        final,
      },
      [...pre, ...resolved.chips],
    )
  }
  const check = action.check ?? action.contest
  if (check) {
    return {
      ...next,
      mode: 'resolve',
      res: {
        kind: 'check',
        act: action.id,
        brother: brotherId,
        rolled: null,
        rerolled: false,
        final: null,
        pre,
      },
    }
  }
  throw new Error(`Action ${action.id} has no outcome or resolution`)
}

export function setActionResult(
  state: GameState,
  action: ActionContent,
  brotherId: BrotherId,
  final: FinalOutcome,
  chips: Chip[] = final.chips,
): GameState {
  return withResultRecovery(
    { ...state, mode: 'resolve' },
    {
      kind: 'out',
      act: action.id,
      brother: brotherId,
      final: { ...final, chips },
    },
    chips,
  )
}

export function afterAction(
  state: GameState,
  actionId: string,
  actions: ActionRegistry,
  sections: SectionRegistry,
  encounters: EncounterRegistry,
): GameState {
  const action = actions.find((candidate) => candidate.id === actionId)
  if (!action) throw new Error(`Missing action ${actionId}`)
  const encounter = encounters.find((candidate) => {
    const onceKey = candidate.id
    return (
      candidate.location === action.location &&
      isAvailableInChapter(candidate.chapter, state.ch) &&
      !state.encDone[onceKey] &&
      test(state, candidate.condition)
    )
  })
  if (encounter) {
    return enterSection(
      {
        ...state,
        flags: { ...state.flags, after_action: 1 },
        encDone: { ...state.encDone, [encounter.id]: 1 },
      },
      encounter.scene,
      sections,
    )
  }
  return resolveNext(
    { ...state, ri: state.ri + 1, mode: 'resolve' },
    actions,
  )
}

export function beginPlannedDay(
  state: GameState,
  actions: ActionRegistry,
): GameState {
  if (!ORDER.every((brotherId) => state.plans[brotherId])) {
    throw new Error('Each brother needs a plan before the day can begin')
  }
  return resolveNext(
    { ...state, mode: 'resolve', ri: 0, res: null, chips: [] },
    actions,
  )
}

export function continueEvening(
  state: GameState,
  sections: SectionRegistry,
  random: () => number = Math.random,
): GameState {
  if (state.mode !== 'evening') throw new Error('The day is not at evening')
  const beat = getChapter(state.ch).eveningBeats[state.day]
  if (beat) return enterSection({ ...state, lead: 'andreas' }, beat, sections)
  return nextDay(state, sections, random)
}
