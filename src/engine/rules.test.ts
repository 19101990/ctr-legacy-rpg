import { describe, expect, it } from 'vitest'
import { applyOne, gmin, poolFor, rivalBonus, stat, test, tgt } from './rules'
import { CHAPTER_ONE_UNLOCKS, createInitialState } from './state'
import type { GameState } from './types'

function makeState(): GameState {
  const state = createInitialState()
  state.chars.andreas.kw.push('hungry')
  state.chars.henning.kw = ['herder']
  state.chars.casper.kw = ['smooth']
  state.chars.casper.items = ['kerbholz']
  return state
}

describe('initial game state', () => {
  it('matches the legacy Chapter 1 starting defaults', () => {
    const state = createInitialState()

    expect(state).toMatchObject({
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
      arcDone: {},
      done: {},
      encDone: {},
      log: [],
      phase: null,
      winter: null,
      lead: 'andreas',
      rel: {},
      trust: 0,
      flags: {},
    })
    expect(state.unlocked).toEqual(
      Object.fromEntries(CHAPTER_ONE_UNLOCKS.map((location) => [location, 1])),
    )
    expect(state.chars).toEqual({
      andreas: {
        attrs: { kraft: 4, geschick: 3, verstand: 2, herz: 3 },
        stam: 8,
        stamMax: 8,
        grit: 2,
        xp: 0,
        kw: ['plow', 'stubborn'],
        items: ['spade', 'axe'],
        notes: '',
      },
      henning: {
        attrs: { kraft: 3, geschick: 2, verstand: 3, herz: 4 },
        stam: 8,
        stamMax: 8,
        grit: 2,
        xp: 0,
        kw: ['herder', 'harz'],
        items: ['rope'],
        notes: '',
      },
      casper: {
        attrs: { kraft: 2, geschick: 4, verstand: 3, herz: 3 },
        stam: 8,
        stamMax: 8,
        grit: 2,
        xp: 0,
        kw: ['smooth', 'reader'],
        items: ['kerbholz'],
        notes: '',
      },
    })
    expect(state.hof).toEqual({
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
    })
  })

  it('creates independent mutable state for each new game', () => {
    const first = createInitialState()
    const second = createInitialState()

    first.chars.andreas.kw.push('hungry')
    first.hof.store.push('knife')
    first.unlocked.village = 1

    expect(second.chars.andreas.kw).not.toContain('hungry')
    expect(second.hof.store).not.toContain('knife')
    expect(second.unlocked).not.toHaveProperty('village')
  })
})

describe('difficulty and rival rules', () => {
  it('uses the legacy target defaults and chapter modifiers', () => {
    expect(tgt({ h: 4 }, 1)).toBe(7)
    expect(tgt({ h: 4 }, 2)).toBe(8)
    expect(tgt({ t: 11 }, 4)).toBe(12)
    expect(tgt({}, 1)).toBe(8)
  })

  it('applies gate difficulty except for minimums of two or less', () => {
    expect(gmin({ min: 4 }, 1)).toBe(4)
    expect(gmin({ min: 4 }, 2)).toBe(5)
    expect(gmin({ min: 4 }, 3)).toBe(7)
    expect(gmin({ min: 2 }, 4)).toBe(2)
  })

  it('calculates the rival bonus', () => {
    expect([1, 2, 3, 4, 6, 8].map(rivalBonus)).toEqual([1, 1, 1, 1, 2, 3])
  })
})

describe('state conditions and stats', () => {
  it('reads supported stats with legacy fallback behavior', () => {
    const state = makeState()
    expect(stat(state, 'vieh.kuh')).toBe(1)
    expect(stat(state, 'rel.unknown')).toBe(0)
    expect(stat(state, 'trust')).toBe(0)
    expect(stat(state, 'days')).toBe(1)
    expect(stat(state, 'stam')).toBe(8)
    expect(stat(state, 'xp')).toBe(0)
    expect(stat(state, 'not-a-stat')).toBe(0)
  })

  it('evaluates tokens, comparisons, arrays, and callback conditions', () => {
    const state = makeState()
    state.flags.ready = true
    expect(test(state, 'kw:plow')).toBe(true)
    expect(test(state, '!kw:herder')).toBe(true)
    expect(test(state, 'item:spade')).toBe(true)
    expect(test(state, 'lead:andreas')).toBe(true)
    expect(test(state, 'flag:ready')).toBe(true)
    expect(test(state, ['korn>=3', 'stam>7'])).toBe(true)
    expect(test(state, (current) => current.day === 1)).toBe(true)
    expect(() => test(state, 'unknown condition')).toThrow('bad cond')
  })
})

describe('effects', () => {
  it('applies bounded resource, animal, relation, trust, and flag changes immutably', () => {
    const original = makeState()
    const result = applyOne(original, () => [
      'korn+99',
      'vieh.kuh-9',
      'rel.dege+99',
      'trust+2',
      'flag+met',
    ])

    expect(result.state.hof.korn).toBe(40)
    expect(result.state.hof.vieh.kuh).toBe(0)
    expect(result.state.rel.dege).toBe(5)
    expect(result.state.trust).toBe(2)
    expect(result.state.flags.met).toBe(1)
    expect(original.hof.korn).toBe(3)
    expect(result.chips).toHaveLength(4)
  })

  it('applies character effects, all-character effects, inventory rules, and returned effects', () => {
    const state = makeState()
    const result = applyOne(state, () => [
      'stam-99',
      'all:xp+1',
      'kw+weary',
      'item+knife',
      (updated) => `kasse+${updated.chars.andreas.xp}`,
    ])

    expect(result.state.chars.andreas.stam).toBe(0)
    expect(result.state.chars.andreas.xp).toBe(1)
    expect(result.state.chars.henning.xp).toBe(1)
    expect(result.state.chars.andreas.kw).toContain('weary')
    expect(result.state.chars.andreas.items).toContain('knife')
    expect(result.state.hof.kasse).toBe(4)
    expect(result.state.chars.andreas.stam).not.toBe(state.chars.andreas.stam)
  })

  it('preserves active-phase stamina floors and rejects invalid effects', () => {
    const state = makeState()
    state.phase = { active: true, weeks: 2, done: {} }
    expect(applyOne(state, 'stam-8').state.chars.andreas.stam).toBe(1)
    expect(() => applyOne(state, 'unknown+1')).toThrow('bad key')
    expect(() => applyOne(state, 'vieh.dragon+1')).toThrow('bad animal')
  })
})

describe('check pools', () => {
  it('combines matching tags, item bonuses, penalties, and caps', () => {
    const state = makeState()
    const pool = poolFor(state, { attr: 'kraft', tags: ['field'] })
    expect(pool).toEqual({
      base: 4,
      items: [
        { n: 'Spade', b: 1 },
        { n: 'Axe', b: 1 },
      ],
      ib: 2,
      helps: [{ n: 'Born to the plow', k: 'kw' }, { n: 'Stubborn as a boundary stone', k: 'kw' }],
      all: 2,
      pen: 1,
      eff: 7,
    })
  })

  it('allows selecting a different brother', () => {
    expect(poolFor(makeState(), { attr: 'geschick' }, 'henning').base).toBe(2)
  })
})
