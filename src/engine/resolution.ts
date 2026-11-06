import {
  resolveContentText,
  type CheckContent,
  type ContentText,
  type GateContent,
  type OutcomeContent,
} from './content'
import { applyOne, gmin, poolFor, rivalBonus, tgt } from './rules'
import type {
  BrotherId,
  Chip,
  Effect,
  FinalOutcome,
  GameState,
  RolledCheck,
} from './types'

export interface StateChanges {
  state: GameState
  chips: Chip[]
}

export interface GateResolution extends StateChanges {
  final: FinalOutcome
}

export interface CheckResolution extends StateChanges {
  final: FinalOutcome
  rolled: RolledCheck
}

export function applyEffects(
  state: GameState,
  effects: readonly Effect[] = [],
): StateChanges {
  let next = state
  const chips: Chip[] = []
  for (const effect of effects) {
    const result = applyOne(next, effect)
    next = result.state
    chips.push(...result.chips)
  }
  return { state: next, chips }
}

export function resolveOutcome(
  state: GameState,
  outcome: OutcomeContent,
): StateChanges & { final: FinalOutcome } {
  const applied = applyEffects(state, outcome.effects)
  return {
    ...applied,
    final: {
      text: outcome.text
        ? formatText(resolveContentText(outcome.text, applied.state), state.lead)
        : '',
      go: outcome.go,
      chips: applied.chips,
    },
  }
}

export function resolveGate(
  state: GameState,
  definition: GateContent,
): GateResolution {
  const pool = poolFor(state, definition)
  const min = gmin(definition, state.ch)
  const meets = definition.min <= 2 || pool.eff >= min
  const isGreat = meets && pool.eff >= min + 2
  const effects = [
    ...(definition.success.effects ?? []),
    ...(isGreat ? (definition.great ?? []) : []),
    ...(!meets ? (definition.hard?.effects ?? []) : []),
  ]
  const applied = applyEffects(state, effects)
  const baseText = definition.success.text
    ? formatText(resolveContentText(definition.success.text, applied.state), state.lead)
    : ''
  const addedText = !meets
    ? definition.hard?.text
      ? ` ${formatText(resolveContentText(definition.hard.text, applied.state), state.lead)}`
      : ` It is beyond what ${BROTHER_NAMES[state.lead]} can do easily, and he does it the hard way.`
    : ''
  return {
    ...applied,
    final: {
      text: `${baseText}${addedText}`,
      go: definition.success.go,
      chips: applied.chips,
      gate: {
        attr: definition.attr,
        min,
        info: { ...pool, meets },
      },
    },
  }
}

export function rollCheck(
  state: GameState,
  definition: CheckContent,
  random: () => number = Math.random,
): RolledCheck {
  const pool = poolFor(state, definition)
  const a = dieRoll(random)
  const rivalBase = 'rival' in definition
    ? typeof definition.rival === 'function'
      ? definition.rival(state)
      : definition.rival
    : null
  const rbon = rivalBase === null ? 0 : rivalBonus(rivalBase)
  const rival = rivalBase === null ? null : dieRoll(random) + rbon
  const target = rival === null ? tgt(definition, state.ch) : null
  const total = a + pool.eff
  const ok = rival === null ? total >= target! : total > rival

  return {
    a,
    total,
    ok,
    rival,
    rbon,
    eff: pool.eff,
    base: pool.base,
    helps: pool.helps.map((help) => help.n),
    pen: pool.pen,
    target,
    shine: a === 6 && ok,
    mishap: a === 1 && !ok,
  }
}

export function resolveCheck(
  state: GameState,
  definition: CheckContent,
  rolled: RolledCheck,
): CheckResolution {
  const outcome = rolled.ok ? definition.success : definition.failure
  let applied = resolveOutcome(state, outcome)
  let next = applied.state
  const chips = [...applied.chips]
  if (rolled.shine) {
    const bonus = applyEffects(next, [
      ...(definition.great ?? []),
      'xp+1',
    ])
    next = bonus.state
    chips.push(...bonus.chips, { t: 'Shine!', k: 'key' })
  }
  if (rolled.mishap) {
    const mishap = applyOne(next, 'stam-1')
    next = mishap.state
    chips.push(...mishap.chips)
  }
  applied = {
    state: next,
    chips,
    final: {
      ...applied.final,
      chips,
    },
  }
  return { ...applied, rolled }
}

export function resolveContentTextForBrother(
  text: ContentText,
  state: GameState,
  brotherId: BrotherId,
): string {
  const withBrother = { ...state, lead: brotherId }
  return resolveContentText(text, withBrother)
}

function formatText(text: string, brotherId: BrotherId): string {
  return text.replaceAll('{n}', BROTHER_NAMES[brotherId])
}

function dieRoll(random: () => number): number {
  const value = random()
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new Error('Random source must return a number in [0, 1)')
  }
  return Math.floor(value * 6) + 1
}

const BROTHER_NAMES: Record<BrotherId, string> = {
  andreas: 'Andreas',
  henning: 'Henning',
  casper: 'Casper',
}
