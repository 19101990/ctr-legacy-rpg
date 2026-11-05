import type { GameState } from './types'

export const CHAPTER_ONE_UNLOCKS = [
  'plot',
  'spring',
  'meadow',
  'fields',
  'forest',
] as const

export function createInitialState(): GameState {
  const character = (
    attrs: GameState['chars']['andreas']['attrs'],
    kw: string[],
    items: string[],
  ): GameState['chars']['andreas'] => ({
    attrs,
    stam: 8,
    stamMax: 8,
    grit: 2,
    xp: 0,
    kw,
    items,
    notes: '',
  })

  const unlocked: Record<string, 1> = {}
  CHAPTER_ONE_UNLOCKS.forEach((location) => {
    unlocked[location] = 1
  })

  return {
    v: 3,
    ch: 1,
    day: 1,
    mode: 'setup',
    sec: null,
    plans: {},
    forced: {},
    ri: 0,
    res: null,
    chips: [],
    evening: null,
    pick: null,
    pickLoc: null,
    unlocked,
    arcDone: {},
    done: {},
    encDone: {},
    log: [],
    phase: null,
    winter: null,
    lead: 'andreas',
    chars: {
      andreas: character(
        { kraft: 4, geschick: 3, verstand: 2, herz: 3 },
        ['plow', 'stubborn'],
        ['spade', 'axe'],
      ),
      henning: character(
        { kraft: 3, geschick: 2, verstand: 3, herz: 4 },
        ['herder', 'harz'],
        ['rope'],
      ),
      casper: character(
        { kraft: 2, geschick: 4, verstand: 3, herz: 3 },
        ['smooth', 'reader'],
        ['kerbholz'],
      ),
    },
    hof: {
      korn: 3,
      kasse: 3,
      baustoff: 0,
      gunst: 0,
      land: 0,
      heim: 0,
      ansehen: 1,
      vieh: { kuh: 1, ziege: 2, huhn: 3, schwein: 0, schaf: 0 },
      store: ['pot', 'sickle'],
      builds: [],
    },
    rel: {},
    trust: 0,
    flags: {},
  }
}
