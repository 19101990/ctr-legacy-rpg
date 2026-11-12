import { actions, CHAPTERS, scenes } from './chapters'
import { BROTHER_IDS, type GameMode, type GameState } from './types'

/**
 * Bump when the shape of GameState changes in a way old saves cannot survive.
 * A save with a different version is ignored and a new game begins.
 */
export const SAVE_VERSION = 1

const MODES: readonly GameMode[] = [
  'setup',
  'scene',
  'plan',
  'resolve',
  'evening',
  'phase',
  'complete',
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

/**
 * Checks that something read back from storage is a game this build can
 * carry on with: the right shape, and every scene, chapter and planned
 * action it points at still exists. Anything else is treated as no save.
 */
export function isSavedGame(value: unknown): value is GameState {
  if (!isRecord(value)) return false
  if (value.v !== 3) return false
  if (!isNumber(value.ch) || !(value.ch in CHAPTERS)) return false
  if (!isNumber(value.day) || value.day < 1) return false
  if (!MODES.includes(value.mode as GameMode)) return false
  if (value.sec !== null && (typeof value.sec !== 'string' || !(value.sec in scenes))) {
    return false
  }
  if (value.mode === 'scene' && value.sec === null) return false
  if (value.mode === 'resolve' && !isRecord(value.res)) return false
  if (value.mode === 'evening' && !isRecord(value.evening)) return false

  for (const key of ['plans', 'forced', 'unlocked', 'arcDone', 'done', 'encDone', 'rel', 'flags']) {
    if (!isRecord(value[key])) return false
  }
  if (!Array.isArray(value.log) || !Array.isArray(value.chips)) return false
  if (!isNumber(value.trust) || !isNumber(value.ri)) return false
  if (!BROTHER_IDS.includes(value.lead as GameState['lead'])) return false

  const plans = value.plans as Record<string, unknown>
  const known = new Set(actions.map((action) => action.id))
  if (!Object.values(plans).every((id) => typeof id === 'string' && known.has(id))) {
    return false
  }

  if (!isRecord(value.chars)) return false
  for (const brother of BROTHER_IDS) {
    const character = (value.chars as Record<string, unknown>)[brother]
    if (!isRecord(character)) return false
    if (!isRecord(character.attrs)) return false
    if (!Array.isArray(character.kw) || !Array.isArray(character.items)) return false
    for (const key of ['stam', 'stamMax', 'grit', 'xp']) {
      if (!isNumber(character[key])) return false
    }
  }

  const hof = value.hof
  if (!isRecord(hof) || !isRecord(hof.vieh)) return false
  if (!Array.isArray(hof.store) || !Array.isArray(hof.builds)) return false
  for (const key of ['korn', 'kasse', 'land', 'heim', 'ansehen', 'baustoff', 'gunst']) {
    if (!isNumber(hof[key])) return false
  }
  return true
}
