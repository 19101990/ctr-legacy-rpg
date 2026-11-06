import { describe, expect, it } from 'vitest'
import type {
  ActionRegistry,
  EncounterRegistry,
  SectionRegistry,
} from './content'
import {
  beginPlannedDay,
  chooseStoryChoice,
  continueEvening,
  continueResult,
  startChapterOne,
} from './chapterOneFlow'
import { createInitialState } from './state'

const sections: SectionRegistry = {
  '1.00': {
    chapter: 1,
    source: 'inv',
    title: 'Opening',
    text: 'The road home.',
    choices: [{ text: 'Continue', go: '@plan' }],
  },
  '1.b1e': {
    chapter: 1,
    source: 'inv',
    title: 'Dusk',
    text: 'The day ends.',
    choices: [{ text: 'Sleep', go: '@day' }],
  },
  '1.20': {
    chapter: 1,
    source: 'mix',
    title: 'Frost',
    text: 'The first frost.',
    choices: [{ text: 'Finish', go: '@complete' }],
  },
}

const actions: ActionRegistry = [
  {
    id: 'rest',
    location: 'home',
    name: 'Rest',
    description: 'Rest at the hearth.',
    outcome: { text: '{n} rests.', effects: ['stam+3', 'kw-weary', 'kw-wounded'] },
  },
  {
    id: 'collapse',
    location: 'home',
    name: 'Overwork',
    description: 'Work without rest.',
    outcome: { text: '{n} collapses.', effects: ['stam-99'] },
  },
]

describe('Chapter 1 day flow', () => {
  it('starts on the opening scene and resolves all three plans into evening', () => {
    const opening = startChapterOne(sections)
    expect(opening).toMatchObject({ mode: 'scene', sec: '1.00', day: 1 })

    const planned = {
      ...createInitialState(),
      mode: 'plan' as const,
      plans: { andreas: 'rest', henning: 'rest', casper: 'rest' },
    }
    let game = beginPlannedDay(planned, actions)
    const encounters: EncounterRegistry = []
    while (game.res?.final) {
      game = continueResult(game, actions, sections, encounters, () => 0)
    }

    expect(game.mode).toBe('evening')
    expect(game.hof.korn).toBe(2)
    expect(game.chars.andreas.stam).toBe(8)
  })

  it('awards completed road milestones once at dusk', () => {
    const initial = createInitialState()
    const planned = {
      ...initial,
      mode: 'plan' as const,
      hof: { ...initial.hof, heim: 1, land: 2, korn: 4 },
      flags: { ...initial.flags, pen: true, favour_kuhlmann: true },
      rel: { ...initial.rel, kuhlmann: 1, pastor: 1 },
      trust: 2,
      plans: { andreas: 'rest', henning: 'rest', casper: 'rest' },
    }
    const encounters: EncounterRegistry = []
    let game = beginPlannedDay(planned, actions)
    while (game.res?.final) {
      game = continueResult(game, actions, sections, encounters, () => 0)
    }

    expect(game.arcDone).toEqual({
      'andreas:0': 1,
      'andreas:1': 1,
      'andreas:2': 1,
      'henning:0': 1,
      'henning:1': 1,
      'casper:0': 1,
      'casper:1': 1,
    })
    expect(game.chars.andreas.xp).toBe(6)
    expect(game.chars.henning.xp).toBe(4)
    expect(game.chars.casper.xp).toBe(4)
    expect(game.evening?.chips.filter((chip) => chip.k === 'key')).toHaveLength(7)

    const nextDay = {
      ...game,
      day: 2,
      mode: 'plan' as const,
      plans: { andreas: 'rest', henning: 'rest', casper: 'rest' },
    }
    game = beginPlannedDay(nextDay, actions)
    while (game.res?.final) {
      game = continueResult(game, actions, sections, encounters, () => 0)
    }

    expect(game.chars.andreas.xp).toBe(6)
    expect(game.chars.henning.xp).toBe(4)
    expect(game.chars.casper.xp).toBe(4)
    expect(game.evening?.chips.filter((chip) => chip.k === 'key')).toHaveLength(0)
  })

  it('forces a collapsed brother to rest on the following day', () => {
    const planned = {
      ...createInitialState(),
      mode: 'plan' as const,
      plans: { andreas: 'collapse', henning: 'rest', casper: 'rest' },
    }
    const encounters: EncounterRegistry = []
    let game = beginPlannedDay(planned, actions)
    while (game.res?.final) {
      game = continueResult(game, actions, sections, encounters, () => 0)
    }
    expect(game.forced.andreas).toBe(1)

    game = continueEvening(game, sections, () => 0)
    game = chooseStoryChoice(game, '1.b1e', 0, sections, actions, () => 0)
    expect(game.day).toBe(2)
    expect(game.plans.andreas).toBe('rest')
    expect(game.forced.andreas).toBeUndefined()
  })
})
