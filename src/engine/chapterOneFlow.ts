import {
  isAvailableInChapter,
  resolveCost,
  resolveContentText,
  type ActionContent,
  type ActionRegistry,
  type CheckContent,
  type ChoiceContent,
  type Cost,
  type EncounterRegistry,
  type SectionRegistry,
} from './content'
import {
  applyEffects,
  resolveCheck,
  resolveGate,
  resolveOutcome,
  rollCheck,
} from './resolution'
import { poolFor, test } from './rules'
import { createInitialState } from './state'
import { getChapter, getNextChapter } from './chapters'
import { BROTHER_IDS } from './types'
import type {
  BrotherId,
  Chip,
  FinalOutcome,
  GameResult,
  GameState,
} from './types'

const BROTHER_NAMES: Record<BrotherId, string> = {
  andreas: 'Andreas',
  henning: 'Henning',
  casper: 'Casper',
}

const ORDER = BROTHER_IDS
const COST_KEYS = ['korn', 'kasse', 'baustoff', 'gunst'] as const
type CostKey = (typeof COST_KEYS)[number]

interface RoadMilestone {
  title: string
  reached(state: GameState): boolean
}

export const CHAPTER_ONE_ROAD_MILESTONES: Record<
  BrotherId,
  readonly RoadMilestone[]
> = {
  andreas: [
    { title: 'A roof over the family', reached: (state) => state.hof.heim >= 1 },
    { title: 'A field cleared (2 Morgen)', reached: (state) => state.hof.land >= 2 },
    {
      title: 'Stores for a winter (5 or more)',
      reached: (state) => state.hof.korn >= 5,
    },
  ],
  henning: [
    {
      title: 'A pen so the animals are safe',
      reached: (state) => Boolean(state.flags.pen),
    },
    {
      title: 'Trust 2: a neighbour lets you mind his animals',
      reached: (state) => state.trust >= 2,
    },
    {
      title: 'Trust 4: the village knows your name',
      reached: (state) => state.trust >= 4,
    },
  ],
  casper: [
    {
      title: 'Know two neighbours by name (Relationship 1 with two)',
      reached: (state) =>
        ['kuhlmann', 'bode', 'pastor', 'carsten', 'grape', 'guldner', 'jost']
          .filter((neighbor) => (state.rel[neighbor] ?? 0) >= 1).length >= 2,
    },
    {
      title: 'Someone owes you a favour',
      reached: (state) =>
        Boolean(state.flags.favour_kuhlmann || state.flags.favour_bode),
    },
  ],
}

export function startChapterOne(
  sections: SectionRegistry,
): GameState {
  const initial = createInitialState()
  return enterSection({ ...initial, sec: null }, getChapter(1).intro, sections)
}

/**
 * Moves a finished chapter on to the next one: a new day count, full
 * Stamina and Grit, the new chapter's places open, and its opening scene.
 * What the household owns, its relationships and its flags carry over.
 */
export function startNextChapter(
  state: GameState,
  sections: SectionRegistry,
): GameState {
  const chapter = getNextChapter(state.ch)
  if (!chapter) throw new Error(`No chapter follows chapter ${state.ch}`)
  const flags = { ...state.flags }
  delete flags.scouted
  delete flags.wolf_warning
  const chars = { ...state.chars }
  for (const brotherId of ORDER) {
    const character = chars[brotherId]
    chars[brotherId] = {
      ...character,
      stam: character.stamMax,
      grit: 2,
      kw: character.kw.filter((word) => word !== 'weary' && word !== 'wounded'),
    }
  }
  return enterSection(
    {
      ...state,
      ch: chapter.chapter,
      day: 1,
      done: {},
      plans: {},
      forced: {},
      ri: 0,
      pick: null,
      pickLoc: null,
      phase: null,
      winter: null,
      res: null,
      chips: [],
      evening: null,
      flags,
      chars,
      lead: 'andreas',
      unlocked: {
        ...state.unlocked,
        ...Object.fromEntries(chapter.unlocked.map((place) => [place, 1 as const])),
      },
    },
    chapter.intro,
    sections,
  )
}

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

export function interpolateBrotherName(
  text: string,
  brotherId: BrotherId,
): string {
  return text.replaceAll('{n}', BROTHER_NAMES[brotherId])
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

function enterSection(
  state: GameState,
  sectionId: string,
  sections: SectionRegistry,
): GameState {
  const section = sections[sectionId]
  if (!section) throw new Error(`Missing section ${sectionId}`)
  let next: GameState = {
    ...state,
    mode: 'scene',
    sec: sectionId,
    res: null,
  }
  if (section.unlock?.length) {
    next = {
      ...next,
      unlocked: {
        ...next.unlocked,
        ...Object.fromEntries(section.unlock.map((location) => [location, 1 as const])),
      },
    }
  }
  const applied = applyEffects(next, section.effects)
  const recovered = recoverCollapsed(applied.state, applied.chips)
  next = { ...recovered.state, chips: recovered.chips }
  return appendLog(next, section.log)
}

function continueTo(
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

function nextDay(
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

function resolveNext(
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

function setActionResult(
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

function afterAction(
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

function startEvening(state: GameState): GameState {
  let next: GameState = { ...state, lead: 'andreas' }
  const lines: string[] = []
  const chips: Chip[] = []
  const freeMeal =
    state.day % 2 === 0 &&
    (state.hof.vieh.kuh >= 1 ||
      state.hof.vieh.ziege >= 2 ||
      state.hof.vieh.huhn >= 3)
  let fed = true
  if (freeMeal) {
    lines.push('Supper: milk, eggs and porridge from the animals. No Stores eaten.')
  } else if (next.hof.korn >= 1) {
    const meal = applyEffects(next, ['korn-1'])
    next = meal.state
    chips.push(...meal.chips)
    lines.push('Supper: one measure of Stores goes into the pot.')
  } else {
    fed = false
    lines.push('Supper: there is nothing in the pot. Everybody goes to bed hungry.')
  }

  const cold = next.hof.heim < 1 && next.day >= 4
  for (const brotherId of ORDER) {
    const character = next.chars[brotherId]
    const before = character.stam
    let change =
      next.hof.heim >= 2
        ? 2
        : next.hof.heim >= 1
          ? 1
          : cold
            ? -1
            : 0
    const keywords = [...character.kw]
    if (!fed) {
      change -= 1
      if (!keywords.includes('hungry')) keywords.push('hungry')
    } else {
      const index = keywords.indexOf('hungry')
      if (index >= 0) keywords.splice(index, 1)
    }
    if (next.hof.heim >= 1 && fed) {
      const index = keywords.indexOf('weary')
      if (index >= 0) keywords.splice(index, 1)
    }
    const stamina = Math.max(1, Math.min(character.stamMax, before + change))
    next = {
      ...next,
      chars: {
        ...next.chars,
        [brotherId]: { ...character, stam: stamina, kw: keywords },
      },
    }
    lines.push(
      `${BROTHER_NAMES[brotherId]}: ${next.hof.heim >= 1 ? 'sleeps dry' : cold ? 'shivers through a cold night' : 'sleeps rough'}, Stamina ${before} to ${stamina}${stamina <= 2 ? '. Running on empty: a day of Rest at the hearth would help' : ''}`,
    )
  }

  for (const brotherId of ORDER) {
    if (next.plans[brotherId] && next.plans[brotherId] !== 'rest') {
      const character = next.chars[brotherId]
      next = {
        ...next,
        chars: {
          ...next.chars,
          [brotherId]: { ...character, xp: character.xp + 1 },
        },
      }
    }
  }
  lines.push('Each brother who worked today gains 1 Experience.')
  for (const brotherId of ORDER) {
    CHAPTER_ONE_ROAD_MILESTONES[brotherId].forEach((milestone, index) => {
      const key = `${brotherId}:${index}`
      if (next.arcDone[key] || !milestone.reached(next)) return
      const character = next.chars[brotherId]
      next = {
        ...next,
        arcDone: { ...next.arcDone, [key]: 1 },
        chars: {
          ...next.chars,
          [brotherId]: { ...character, xp: character.xp + 2 },
        },
      }
      chips.push({
        t: `${BROTHER_NAMES[brotherId]}: ${milestone.title} (+2 Experience)`,
        k: 'key',
      })
      next = appendLog(next, `${BROTHER_NAMES[brotherId]}: ${milestone.title}.`)
    })
  }
  return {
    ...next,
    mode: 'evening',
    res: null,
    evening: { lines, chips },
    chips,
  }
}

function withResultRecovery(
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

function recoverCollapsed(
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

function getResultCheck(
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

function getChoice(
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

function rollCheckFor(
  state: GameState,
  result: Extract<GameResult, { kind: 'check' }>,
  definition: CheckContent,
  random: () => number,
) {
  const brotherId = result.brother ?? state.lead
  return rollCheck({ ...state, lead: brotherId }, definition, random)
}

function withGo(final: FinalOutcome, fallback?: string): FinalOutcome {
  return { ...final, go: final.go ?? fallback }
}

function canAfford(state: GameState, cost: Cost): boolean {
  return COST_KEYS.every((key) => state.hof[key] >= (cost[key] ?? 0))
}

function costEffects(cost: Cost): string[] {
  return COST_KEYS.flatMap((key) => {
    const amount = cost[key] ?? 0
    return amount > 0 ? [`${key}-${amount}`] : []
  })
}

function appendLog(state: GameState, text?: string | ((state: GameState) => string)): GameState {
  if (!text) return state
  const entry = resolveContentText(text, state)
  if (!entry) return state
  return {
    ...state,
    log: [...state.log, { ch: state.ch, t: entry }],
  }
}

function addResolvedLog(
  state: GameState,
  definition: CheckContent,
  success: boolean,
): GameState['log'] {
  const text = definition[success ? 'success' : 'failure'].log
  if (!text) return state.log
  const entry = resolveContentText(text, state)
  return [...state.log, { ch: state.ch, t: entry }]
}

function dieRoll(random: () => number): number {
  const value = random()
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new Error('Random source must return a number in [0, 1)')
  }
  return Math.floor(value * 6) + 1
}
