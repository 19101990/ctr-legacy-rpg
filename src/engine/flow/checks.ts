import type { ActionRegistry, CheckContent, ChoiceContent, SectionRegistry } from '../content'
import { applyEffects, resolveCheck, rollCheck } from '../resolution'
import { poolFor } from '../rules'
import type { GameResult, GameState } from '../types'
import { addResolvedLog, withGo, withResultRecovery } from './shared'

export function rollPendingCheck(
  state: GameState,
  sections: SectionRegistry,
  actions: ActionRegistry,
  random: () => number = Math.random,
): GameState {
  if (state.res?.kind !== 'check' || state.res.rolled) {
    throw new Error('There is no unrolled check')
  }
  const definition = getResultCheck(state, sections, actions)
  const rolled = rollCheckFor(state, state.res, definition, random)
  return {
    ...state,
    res: { ...state.res, rolled },
  }
}

export function acceptPendingCheck(
  state: GameState,
  sections: SectionRegistry,
  actions: ActionRegistry,
): GameState {
  const result = state.res
  if (result?.kind !== 'check' || result.rolled === null) {
    throw new Error('There is no rolled check to accept')
  }
  const definition = getResultCheck(state, sections, actions)
  const rolled = result.rolled
  const resolved = resolveCheck(state, definition, rolled)
  const go =
    definition[rolled.ok ? 'success' : 'failure'].go ??
    (result.act
      ? '@next'
      : result.sec
        ? getChoice(sections, result)?.go
        : undefined)
  const final = withGo(resolved.final, go)
  const next = {
    ...resolved.state,
    log: addResolvedLog(resolved.state, definition, rolled.ok),
  }
  return withResultRecovery(
    next,
    { ...result, final },
    [...result.pre, ...resolved.chips],
  )
}

export function rerollPendingCheck(
  state: GameState,
  sections: SectionRegistry,
  actions: ActionRegistry,
  random: () => number = Math.random,
): GameState {
  if (
    state.res?.kind !== 'check' ||
    !state.res.rolled ||
    state.res.rolled.ok ||
    state.res.rerolled
  ) {
    throw new Error('This check cannot be rerolled')
  }
  const character = state.chars[state.lead]
  if (character.grit < 1) throw new Error('Not enough Grit to reroll')
  const spent = applyEffects(state, ['grit-1'])
  const withoutRoll = {
    ...spent.state,
    res: { ...state.res, rolled: null, rerolled: true },
  }
  return rollPendingCheck(withoutRoll, sections, actions, random)
}

export function currentCheckDefinition(
  state: GameState,
  sections: SectionRegistry,
  actions: ActionRegistry,
): CheckContent | null {
  return state.res?.kind === 'check'
    ? getResultCheck(state, sections, actions)
    : null
}

export function checkPool(state: GameState, definition: CheckContent) {
  return poolFor(state, definition)
}

export function getResultCheck(
  state: GameState,
  sections: SectionRegistry,
  actions: ActionRegistry,
): CheckContent {
  const result = state.res
  if (result?.kind !== 'check') throw new Error('There is no pending check')
  if (result.act) {
    const action = actions.find((candidate) => candidate.id === result.act)
    const check = action?.check ?? action?.contest
    if (!check) throw new Error(`Action ${result.act} has no check`)
    return check
  }
  if (result.sec === undefined || result.ci === undefined) {
    throw new Error('Check is missing its scene choice')
  }
  const choice = getChoice(sections, result)
  const check = choice.check ?? choice.contest
  if (!check) throw new Error('Scene choice has no check')
  return check
}

export function getChoice(
  sections: SectionRegistry,
  result: Extract<GameResult, { kind: 'check' }>,
): ChoiceContent {
  if (result.sec === undefined || result.ci === undefined) {
    throw new Error('Check is missing its scene choice')
  }
  const choice = sections[result.sec].choices?.[result.ci]
  if (!choice) throw new Error('The scene choice is no longer available')
  return choice
}

export function rollCheckFor(
  state: GameState,
  result: Extract<GameResult, { kind: 'check' }>,
  definition: CheckContent,
  random: () => number,
) {
  const brotherId = result.brother ?? state.lead
  return rollCheck({ ...state, lead: brotherId }, definition, random)
}
