import { resolveCost } from '../content'
import type { ActionRegistry, ChoiceContent, EncounterRegistry, SectionRegistry } from '../content'
import { applyEffects, resolveGate, resolveOutcome } from '../resolution'
import { test } from '../rules'
import type { Chip, GameState } from '../types'
import { canAfford, costEffects, appendLog, withGo, withResultRecovery } from './shared'
import { enterSection } from './scene'
import { nextDay, resolveNext, afterAction } from './day'

export function getVisibleChoices(
  state: GameState,
  section: SectionRegistry[string],
): ChoiceContent[] {
  return (section.choices ?? []).filter((choice) => {
    const forBrother = choice.as
      ? { ...state, lead: choice.as }
      : state
    const onceKey = choice.once ? `${state.ch}:${choice.once}` : null
    return (
      (!onceKey || !state.done[onceKey]) &&
      test(forBrother, choice.condition)
    )
  })
}

export function chooseStoryChoice(
  state: GameState,
  sectionId: string,
  visibleIndex: number,
  sections: SectionRegistry,
  actions: ActionRegistry,
  random: () => number = Math.random,
): GameState {
  const section = sections[sectionId]
  if (!section) throw new Error(`Missing section ${sectionId}`)
  const choices = getVisibleChoices(state, section)
  const choice = choices[visibleIndex]
  if (!choice) throw new Error(`Choice ${visibleIndex} is not available`)
  const choiceIndex = (section.choices ?? []).indexOf(choice)

  const lead = choice.as ?? state.lead
  let next: GameState = { ...state, lead }
  const pre: Chip[] = []
  if (choice.once) {
    next = {
      ...next,
      done: { ...next.done, [`${next.ch}:${choice.once}`]: 1 },
    }
  }
  if (choice.cost) {
    const cost = resolveCost(choice.cost, next)
    if (!canAfford(next, cost)) throw new Error('Not enough resources')
    const paid = applyEffects(next, costEffects(cost))
    next = paid.state
    pre.push(...paid.chips)
  }
  if (choice.effects?.length) {
    const applied = applyEffects(next, choice.effects)
    next = applied.state
    pre.push(...applied.chips)
  }
  next = appendLog(next, choice.log)

  const check = choice.check ?? choice.contest
  if (check) {
    return {
      ...next,
      mode: 'resolve',
      res: {
        kind: 'check',
        sec: sectionId,
        ci: choiceIndex,
        rolled: null,
        rerolled: false,
        final: null,
        pre,
      },
    }
  }
  if (choice.gate) {
    const gate = resolveGate(next, choice.gate)
    const final = withGo(gate.final, choice.go)
    return withResultRecovery(
      appendLog({ ...gate.state, mode: 'resolve' }, choice.gate.success.log),
      {
        kind: 'gate',
        sec: sectionId,
        ci: choiceIndex,
        final,
      },
      [...pre, ...gate.chips],
    )
  }
  if (choice.outcome) {
    const outcome = resolveOutcome(next, choice.outcome)
    const final = withGo(outcome.final, choice.go)
    return withResultRecovery(
      appendLog({ ...outcome.state, mode: 'resolve' }, choice.outcome.log),
      {
        kind: 'out',
        sec: sectionId,
        ci: choiceIndex,
        final,
      },
      [...pre, ...outcome.chips],
    )
  }
  next = { ...next, chips: pre }
  return continueTo(
    next,
    choice.go ?? '@plan',
    actions,
    sections,
    random,
  )
}

export function continueTo(
  state: GameState,
  destination: string,
  actions: ActionRegistry,
  sections: SectionRegistry,
  random: () => number,
): GameState {
  if (destination === '@plan') {
    return { ...state, mode: 'plan', sec: null, res: null }
  }
  if (destination === '@day') {
    return nextDay(state, sections, random)
  }
  if (destination === '@next') {
    if (state.flags.after_action) {
      const flags = { ...state.flags }
      delete flags.after_action
      return resolveNext(
        {
          ...state,
          flags,
          ri: state.ri + 1,
          mode: 'resolve',
          sec: null,
        },
        actions,
      )
    }
    return resolveNext(
      { ...state, ri: state.ri + 1, mode: 'resolve', sec: null },
      actions,
    )
  }
  if (destination === '@complete' || destination === 'phase') {
    return { ...state, mode: 'complete', sec: null, res: null }
  }
  return enterSection(state, destination, sections)
}

export function continueResult(
  state: GameState,
  actions: ActionRegistry,
  sections: SectionRegistry,
  encounters: EncounterRegistry,
  random: () => number = Math.random,
): GameState {
  const result = state.res
  if (!result?.final) throw new Error('There is no result to continue')
  const next = { ...state, res: null }
  if (result.act) {
    return afterAction(next, result.act, actions, sections, encounters)
  }
  return continueTo(
    next,
    result.final.go ?? '@plan',
    actions,
    sections,
    random,
  )
}
