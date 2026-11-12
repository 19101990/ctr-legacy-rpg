import { describe, expect, it } from 'vitest'
import {
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
} from './flow'
import {
  actions,
  encounters,
  getChapter,
  getNextChapter,
  scenes,
} from './chapters'
import { resolveContentText } from './content'
import type { GameState } from './types'

const roll = () => 0.5

function finishedChapterTwo(): GameState {
  const first = startChapterOne(scenes)
  const winter = startNextChapter(
    { ...first, mode: 'complete', sec: null, day: 8 },
    scenes,
  )
  return {
    ...winter,
    mode: 'complete',
    sec: null,
    day: 7,
    hof: { ...winter.hof, korn: 1, heim: 1, land: 1 },
    flags: { ...winter.flags, strangers_in: 1, helped_fire: 1 },
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

describe('starting chapter three', () => {
  it('opens 1654 with the same household and the places of the village', () => {
    const game = startNextChapter(finishedChapterTwo(), scenes)

    expect(game).toMatchObject({ ch: 3, day: 1, mode: 'scene', sec: '2.00' })
    expect(game.flags.helped_fire).toBe(1)
    expect(game.unlocked).toMatchObject({
      village: 1,
      tower: 1,
      smith: 1,
      tavern: 1,
      sheepfold: 1,
      amtland: 1,
      siemens: 1,
    })
    expect(game.log.at(-1)?.t).toContain('1654')
  })

  it('lifts a poor household to a roof, two Morgen and three Stores', () => {
    const game = startNextChapter(finishedChapterTwo(), scenes)
    expect(game.hof).toMatchObject({ land: 2, heim: 1, korn: 3 })

    const base = finishedChapterTwo()
    const rich = startNextChapter(
      { ...base, hof: { ...base.hof, land: 5, heim: 2, korn: 9 } },
      scenes,
    )
    expect(rich.hof).toMatchObject({ land: 5, heim: 2, korn: 9 })
  })

  it('tells what became of the winter in the opening scene', () => {
    const game = startNextChapter(finishedChapterTwo(), scenes)
    const text = resolveContentText(scenes['2.00'].text, game)
    expect(text).toContain('Six winters have gone by')
    expect(text).toContain('Bode’s boy married')
    expect(text).toContain('Meta married a widower')

    const grieving = resolveContentText(scenes['2.00'].text, {
      ...game,
      flags: { ...game.flags, child_lost: 1 },
    })
    expect(grieving).toContain('Meta’s youngest lies in the churchyard')
  })

  it('offers the copper-knob work only in chapter three', () => {
    const knob = startNextChapter(finishedChapterTwo(), scenes)
    const plan = { ...knob, mode: 'plan' as const, sec: null }
    const ids = getAvailableActions(plan, 'andreas', actions).map((a) => a.id)
    expect(ids).toContain('scaffold')
    expect(ids).toContain('count_honest')
    expect(ids).not.toContain('ice_fish')
    expect(ids).not.toContain('sit_vigil')

    const casper = getAvailableActions(plan, 'casper', actions).map((a) => a.id)
    expect(casper).toContain('siemens_work')
    expect(casper).toContain('ask_around')
    expect(ids).not.toContain('siemens_work')

    const winter = { ...finishedChapterTwo(), mode: 'plan' as const, sec: null, ch: 2 }
    const winterIds = getAvailableActions(winter, 'andreas', actions).map((a) => a.id)
    expect(winterIds).not.toContain('scaffold')
  })

  it('leads on to chapter four', () => {
    expect(getNextChapter(3)?.chapter).toBe(4)
  })
})

/** Plays the five days at rest and stops on the list scene. */
function playToTheList(setup: (game: GameState) => GameState): GameState {
  let game = startNextChapter(finishedChapterTwo(), scenes)
  game = chooseStoryChoice(game, '2.00', 0, scenes, actions, roll)
  game = setup(game)
  const beats: Record<number, { id: string; choice: number }> = {
    2: { id: '2.e2', choice: 2 },
    3: { id: '2.13', choice: 2 },
    4: { id: '2.e1', choice: 1 },
  }
  for (let day = 1; day <= getChapter(3).days; day += 1) {
    game = { ...game, plans: { andreas: 'rest', henning: 'rest', casper: 'rest' } }
    game = beginPlannedDay(game, actions)
    while (game.res?.final) {
      game = continueResult(game, actions, scenes, encounters, () => 0)
    }
    game = continueEvening(game, scenes, () => 0)
    const beat = beats[day]
    if (beat) {
      game = chooseStoryChoice(game, beat.id, beat.choice, scenes, actions, () => 0)
      game = continueResult(game, actions, scenes, encounters, () => 0)
    }
  }
  return game
}

describe('chapter three day flow', () => {
  it('runs five days with the tinker, the council and the hail, then the list', () => {
    let game = startNextChapter(finishedChapterTwo(), scenes)
    game = { ...game, hof: { ...game.hof, kasse: 9 } }
    game = chooseStoryChoice(game, '2.00', 0, scenes, actions, roll)
    expect(game.mode).toBe('plan')
    expect(game.flags.trade_carpenter).toBe(1)

    const beats: Record<number, { id: string; choice: number }> = {
      2: { id: '2.e2', choice: 0 },
      3: { id: '2.13', choice: 2 },
      4: { id: '2.e1', choice: 1 },
    }
    const visited: number[] = []
    for (let day = 1; day <= getChapter(3).days; day += 1) {
      expect(game.day).toBe(day)
      visited.push(game.day)
      game = {
        ...game,
        plans: { andreas: 'rest', henning: 'rest', casper: 'rest' },
      }
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

    expect(visited).toEqual([1, 2, 3, 4, 5])
    expect(game).toMatchObject({ mode: 'scene', sec: '2.20' })
    game = chooseStoryChoice(game, '2.20', 0, scenes, actions, () => 0)
    expect(game.mode).toBe('complete')
  })

  it('writes Heinrich among the farmers only with three Morgen and a roof', () => {
    const farmer = playToTheList((game) => ({
      ...game,
      flags: { ...game.flags, trade_carpenter: 0, trade_smith: 1, honest_count: 1 },
      hof: { ...game.hof, land: 3, heim: 1, korn: 20 },
    }))
    expect(farmer.sec).toBe('2.20')
    expect(farmer.flags.church_debt).toBeUndefined()
    const farmerText = resolveContentText(scenes['2.20'].text, farmer)
    expect(farmerText).toContain('Among the other farmers.” Ilse takes his arm')
    expect(farmerText).toContain('his count was true')
    expect(farmerText).toContain('the smith’s iron straps')

    const farmerEnd = chooseStoryChoice(farmer, '2.20', 0, scenes, actions, roll)
    expect(farmerEnd.mode).toBe('complete')

    const cottager = playToTheList((game) => ({
      ...game,
      hof: { ...game.hof, land: 2, heim: 1, korn: 20 },
    }))
    // Standing +1 for the farmer, minus 1 for the cottager, from the same start.
    expect(farmer.hof.ansehen - cottager.hof.ansehen).toBe(2)
    const cottagerText = resolveContentText(scenes['2.20'].text, cottager)
    expect(cottagerText).toContain('on the church’s word')

    expect(cottager.flags.church_debt).toBe(1)
  })

  it('shows the chapter three goals against the state of the household', () => {
    const base = startNextChapter(finishedChapterTwo(), scenes)
    const goals = getChapter(3).goals(base)
    expect(goals.find((goal) => goal.kind === 'must')?.done).toBe(false)

    const settled = getChapter(3).goals({
      ...base,
      hof: { ...base.hof, land: 3, heim: 1 },
      flags: { ...base.flags, honest_count: 1, brothers_peace: 1, siemens_rumor: 1 },
    })
    expect(settled.filter((goal) => goal.done).map((goal) => goal.title)).toEqual([
      'Heinrich counted among the farmers (3 Morgen and a roof)',
      'An honest count for the pastor’s list',
      'Peace at the family table (the Sunday council)',
      'Casper hears of an estate that needs a man',
    ])
  })
})

describe('chapter three scene choices', () => {
  const presets: Record<string, GameState['flags']> = {
    none: {},
    robbed: { robbed_stranger: 1 },
    honest: { honest_count: 1 },
    rounded: { embellished: 1 },
    saved: { saved_apprentice: 1 },
  }

  const chapterThreeSceneIds = Object.keys(scenes).filter((id) => id.startsWith('2.'))

  it('plays every visible choice of every chapter three scene without error', () => {
    let played = 0
    for (const [name, flags] of Object.entries(presets)) {
      const base = startNextChapter(finishedChapterTwo(), scenes)
      const rich: GameState = {
        ...base,
        hof: { ...base.hof, korn: 12, kasse: 12 },
        flags: { ...base.flags, ...flags },
        mode: 'scene',
      }
      for (const id of chapterThreeSceneIds) {
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

  it('only offers the dead man’s brother after the stranger was robbed', () => {
    const base = startNextChapter(finishedChapterTwo(), scenes)
    expect(scenes['2.ev_kin'].condition).toBe('flag:robbed_stranger')
    expect(base.flags.robbed_stranger).toBeUndefined()
    const returned = resolveChoice(
      {
        ...base,
        sec: '2.ev_kin',
        mode: 'scene',
        hof: { ...base.hof, kasse: 5 },
        flags: { ...base.flags, robbed_stranger: 1 },
      },
      '2.ev_kin',
      0,
    )
    expect(returned.flags.robbed_stranger).toBeUndefined()
    expect(returned.hof.kasse).toBe(2)
  })

  it('keeps the chapter two names in chapter three text', () => {
    const base = startNextChapter(finishedChapterTwo(), scenes)
    const everything: GameState['flags'] = {
      matz_stays: 1,
      helped_fire: 1,
      fire_ignored: 1,
      street_stood_together: 1,
      fought_riders: 1,
      saved_clerk: 1,
      robbed_stranger: 1,
      child_lost: 1,
      strangers_in: 1,
      looted_dead: 1,
      buried_dead: 1,
      honest_count: 1,
      trade_wheelwright: 1,
    }
    for (const id of chapterThreeSceneIds()) {
      const text = resolveContentText(scenes[id].text, {
        ...base,
        flags: { ...base.flags, ...everything },
      })
      expect(text, id).not.toMatch(/Anneke|Hartman|Degen|Brandes|Brandis|Kalter/)
    }

    function chapterThreeSceneIds() {
      return Object.keys(scenes).filter((id) => id.startsWith('2.'))
    }
  })
})
