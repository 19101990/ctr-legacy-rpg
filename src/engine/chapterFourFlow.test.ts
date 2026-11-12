import { describe, expect, it } from 'vitest'
import {
  ROAD_MILESTONES,
  acceptPendingCheck,
  beginPlannedDay,
  chooseStoryChoice,
  continueEvening,
  continueResult,
  getAvailableActions,
  getVisibleChoices,
  rollPendingCheck,
  startChapterOne,
  startNextChapter,
} from './chapterOneFlow'
import {
  CHAPTERS,
  actions,
  encounters,
  getChapter,
  getNextChapter,
  scenes,
} from './chapters'
import { resolveContentText } from './content'
import type { GameState } from './types'

const roll = () => 0.5

function finishedChapterThree(): GameState {
  const first = startChapterOne(scenes)
  const winter = startNextChapter(
    { ...first, mode: 'complete', sec: null, day: 8 },
    scenes,
  )
  const knob = startNextChapter(
    { ...winter, mode: 'complete', sec: null, day: 7 },
    scenes,
  )
  return {
    ...knob,
    mode: 'complete',
    sec: null,
    day: 6,
    hof: { ...knob.hof, korn: 1, heim: 1, land: 2 },
    flags: { ...knob.flags, honest_count: 1, brothers_rift: 1, siemens_foothold: 1 },
  }
}

function resolveChoice(state: GameState, sectionId: string, index: number): GameState {
  let game = chooseStoryChoice(state, sectionId, index, scenes, actions, roll)
  if (game.res?.kind === 'check' && !game.res.final) {
    game = rollPendingCheck(game, scenes, actions, roll)
    game = acceptPendingCheck(game, scenes, actions)
  }
  if (game.res?.final) {
    game = continueResult(game, actions, scenes, encounters, roll)
  }
  return game
}

describe('starting chapter four', () => {
  it('opens February 1664 with the same household and the chapel open', () => {
    const game = startNextChapter(finishedChapterThree(), scenes)

    expect(game).toMatchObject({ ch: 4, day: 1, mode: 'scene', sec: '4.00' })
    expect(game.flags.honest_count).toBe(1)
    expect(game.unlocked).toMatchObject({
      village: 1,
      smith: 1,
      chapel: 1,
      tavern: 1,
      sheepfold: 1,
      amtland: 1,
      siemens: 1,
    })
    expect(game.log.at(-1)?.t).toContain('February 1664')
  })

  it('lifts a poor household to a house, four Morgen and three Stores', () => {
    const game = startNextChapter(finishedChapterThree(), scenes)
    expect(game.hof).toMatchObject({ land: 4, heim: 2, korn: 3 })

    const base = finishedChapterThree()
    const rich = startNextChapter(
      { ...base, hof: { ...base.hof, land: 9, heim: 3, korn: 9 } },
      scenes,
    )
    expect(rich.hof).toMatchObject({ land: 9, heim: 3, korn: 9 })
  })

  it('tells what became of 1654 in the opening scene', () => {
    const game = startNextChapter(finishedChapterThree(), scenes)
    const text = resolveContentText(scenes['4.00'].text, game)
    expect(text).toContain('Ten winters have gone by since the knob')
    expect(text).toContain('honestly in 1654')
    expect(text).toContain('speak at table and not otherwise')
    expect(text).toContain('Siemens place')
  })

  it('offers the count work only in chapter four and keeps the forge open', () => {
    const ledger = startNextChapter(finishedChapterThree(), scenes)
    const plan = { ...ledger, mode: 'plan' as const, sec: null }
    const ids = getAvailableActions(plan, 'andreas', actions).map((a) => a.id)
    expect(ids).toContain('declare')
    expect(ids).toContain('vouch')
    expect(ids).toContain('forge_help')
    expect(ids).not.toContain('scaffold')
    expect(ids).not.toContain('ice_fish')

    const henning = getAvailableActions(plan, 'henning', actions).map((a) => a.id)
    expect(henning).toContain('council_henning')
    expect(henning).not.toContain('council_speak')
    expect(ids).not.toContain('council_henning')

    const casperIds = getAvailableActions(
      { ...plan, hof: { ...plan.hof, gunst: 3, kasse: 9 } },
      'casper',
      actions,
    ).map((a) => a.id)
    expect(casperIds).toContain('siemens_buyin')
    expect(casperIds).not.toContain('siemens_foothold2')

    const knob = { ...plan, ch: 3 }
    const knobIds = getAvailableActions(knob, 'andreas', actions).map((a) => a.id)
    expect(knobIds).not.toContain('declare')
  })

  it('is the last chapter', () => {
    const game = startNextChapter(finishedChapterThree(), scenes)
    expect(getNextChapter(4)).toBeNull()
    expect(() => startNextChapter({ ...game, mode: 'complete' }, scenes)).toThrow()
    expect(Object.keys(CHAPTERS)).toEqual(['1', '2', '3', '4'])
  })
})

describe('chapter four day flow', () => {
  function playToTheClerk(setup: (game: GameState) => GameState): GameState {
    let game = startNextChapter(finishedChapterThree(), scenes)
    game = chooseStoryChoice(game, '4.00', 0, scenes, actions, roll)
    game = setup(game)
    const beats: Record<number, { id: string; choice: number }> = {
      2: { id: '4.e1', choice: 1 },
      4: { id: '4.16', choice: 3 },
      5: { id: '4.15', choice: 1 },
    }
    for (let day = 1; day <= getChapter(4).days; day += 1) {
      expect(game.day).toBe(day)
      game = { ...game, plans: { andreas: 'rest', henning: 'rest', casper: 'rest' } }
      game = beginPlannedDay(game, actions)
      while (game.res?.final) {
        game = continueResult(game, actions, scenes, encounters, () => 0)
      }
      expect(game.mode).toBe('evening')
      game = continueEvening(game, scenes, () => 0)
      const beat = beats[day]
      if (beat) {
        expect(game.sec).toBe(beat.id)
        game = chooseStoryChoice(game, beat.id, beat.choice, scenes, actions, () => 0)
        game = continueResult(game, actions, scenes, encounters, () => 0)
      }
    }
    return game
  }

  it('runs five days, the wolves, the birth and the table, then the clerk', () => {
    const game = playToTheClerk((state) => ({
      ...state,
      hof: { ...state.hof, korn: 30 },
    }))
    expect(game).toMatchObject({ mode: 'scene', sec: '4.20' })
    expect(game.flags.child_set).toBe(1)
    expect(game.flags.michael_unrecorded).toBe(1)
  })

  it('walks from the clerk’s pen to the closing scene and completes the book', () => {
    let game = playToTheClerk((state) => ({
      ...state,
      hof: { ...state.hof, korn: 30 },
    }))
    expect(getVisibleChoices(game, scenes['4.20']).map((choice) => choice.text)).toEqual([
      'Let them count.',
    ])
    for (const id of ['4.20', '4.21', '4.22']) {
      expect(game.sec).toBe(id)
      game = resolveChoice(game, id, 0)
    }
    expect(game).toMatchObject({ mode: 'scene', sec: '4.30' })
    expect(resolveContentText(scenes['4.30'].text, game)).toContain('End of Module 1')
    game = resolveChoice(game, '4.30', 0)
    expect(game.mode).toBe('complete')
  })

  it('offers the hidden-herd choice only to a household that hid the beasts', () => {
    const base = startNextChapter(finishedChapterThree(), scenes)
    const hidden = { ...base, sec: '4.20', flags: { ...base.flags, hid_animals: 1 } }
    expect(getVisibleChoices(hidden, scenes['4.20']).map((choice) => choice.text)).toEqual([
      'Henning meets the clerk’s eye while a cow is somewhere in the forest.',
    ])
  })

  it('writes the ledger entry from the land the household holds', () => {
    const base = startNextChapter(finishedChapterThree(), scenes)
    const entry = (land: number, flags: GameState['flags'] = {}) =>
      resolveContentText(scenes['4.21'].text, {
        ...base,
        hof: { ...base.hof, land },
        flags: { ...base.flags, ...flags },
      })

    expect(entry(4)).toContain('**Feldmann. Köthner.')
    expect(entry(7)).toContain('**Feldmann. Einlieger.')
    expect(entry(13)).toContain('Einlieger, with plenty of land')
    expect(entry(4, { plot_proof: 1, pastor_vouches: 1 })).toContain('on record')
    expect(entry(4, { plot_proof: 1, pastor_vouches: 1 })).toContain('the pastor vouches')
    expect(entry(4, { child_set: 1 })).toContain('6 mouths')
    expect(entry(4)).toContain('5 mouths')
  })

  it('shows the chapter four goals against the state of the household', () => {
    const base = startNextChapter(finishedChapterThree(), scenes)
    const goals = getChapter(4).goals(base)
    expect(goals.filter((goal) => goal.done)).toEqual([])

    const settled = getChapter(4).goals({
      ...base,
      flags: { ...base.flags, hid_animals: 1, plot_proof: 1, herder_postponed: 1 },
    })
    expect(settled.filter((goal) => goal.done).map((goal) => goal.title)).toEqual([
      'Decide what the clerk will see (an honest count, or a hidden herd)',
      'The word beside your name: get the pastor to vouch, or prove the plot',
      'Henning before the council: the herd’s future',
    ])
  })
})

describe('chapter four road checkpoints', () => {
  it('counts the council, the plot and Casper’s place as steps on the road', () => {
    const base = startNextChapter(finishedChapterThree(), scenes)
    const reached = (brother: keyof typeof ROAD_MILESTONES, flags: GameState['flags']) =>
      ROAD_MILESTONES[brother]
        .filter((step) => step.reached({ ...base, flags: { ...base.flags, ...flags } }))
        .map((step) => step.title)

    expect(reached('henning', { herder_promised: 1 })).toEqual([
      'The council speaks of the herd',
      'The horn is promised to you',
    ])
    expect(reached('andreas', { pastor_vouches: 1 })).toContain(
      'The plot on record in the ledger',
    )
    expect(reached('casper', { siemens_buyin: 1 })).toContain(
      'A place of your own: buy in or marry into it',
    )
  })
})

describe('chapter four scene choices', () => {
  const presets: Record<string, GameState['flags']> = {
    none: {},
    hid: { hid_animals: 1 },
    caught: { hid_animals: 1, caught_hiding: 1 },
    proof: { plot_proof: 1, pastor_vouches: 1 },
    debts: { debt_weitzel: 1, debt_heijer: 1 },
    rift: { brothers_rift: 1 },
    promise: { clan_promise: 1 },
    herd: { herder_promised: 1, siemens_buyin: 1, michael_theory2: 1, child_set: 1 },
    betrothed: { herder_postponed: 1, casper_betrothed: 1, michael_theory3: 1 },
  }

  const chapterFourSceneIds = Object.keys(scenes).filter((id) => id.startsWith('4.'))

  it('plays every visible choice of every chapter four scene without error', () => {
    let played = 0
    for (const [name, flags] of Object.entries(presets)) {
      const base = startNextChapter(finishedChapterThree(), scenes)
      const rich: GameState = {
        ...base,
        hof: { ...base.hof, korn: 12, kasse: 12 },
        flags: { ...base.flags, ...flags },
        rel: { ...base.rel, kuhlmann: 2, bode: 1, pastor: 1 },
        mode: 'scene',
      }
      for (const id of chapterFourSceneIds) {
        const section = scenes[id]
        const state = { ...rich, sec: id }
        getVisibleChoices(state, section).forEach((_, index) => {
          expect(() => resolveChoice(state, id, index), `${name} ${id} #${index}`).not.toThrow()
          played += 1
        })
      }
    }
    expect(played).toBeGreaterThan(40)
  })

  it('reads every chapter four scene without the legacy names', () => {
    const base = startNextChapter(finishedChapterThree(), scenes)
    for (const [name, flags] of Object.entries(presets)) {
      for (const id of chapterFourSceneIds) {
        const text = resolveContentText(scenes[id].text, {
          ...base,
          rel: { ...base.rel, kuhlmann: 2, bode: 2 },
          flags: { ...base.flags, ...flags },
        })
        expect(text, `${name} ${id}`).not.toMatch(
          /Anneke|Hartman|Degen|Brandes|Brandis|Kalter/,
        )
      }
    }
  })

  it('keeps the chapter four action text free of the legacy names', () => {
    const chapterFour = actions.filter((action) => {
      const chapter = action.chapter
      return chapter === 4 || (Array.isArray(chapter) && chapter.includes(4))
    })
    expect(chapterFour.length).toBeGreaterThan(20)
    expect(JSON.stringify(chapterFour)).not.toMatch(
      /Anneke|Hartman|Degen|Brandes|Brandis|Kalter/,
    )
  })
})
