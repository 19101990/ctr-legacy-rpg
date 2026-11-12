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

function finishedChapterOne(): GameState {
  const state = startChapterOne(scenes)
  return {
    ...state,
    mode: 'complete',
    sec: null,
    day: 8,
    hof: { ...state.hof, korn: 9, heim: 1, land: 2 },
    flags: { ...state.flags, pen: true, scouted: true },
    rel: { ...state.rel, kuhlmann: 2 },
    chars: {
      ...state.chars,
      andreas: { ...state.chars.andreas, stam: 1, grit: 0, kw: ['weary', 'wounded', 'plow'] },
    },
    done: { 'ev:1.ev_fire': 1 },
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

describe('chapter registry', () => {
  it('defines every scene a chapter points at', () => {
    for (const chapter of Object.values(CHAPTERS)) {
      expect(scenes[chapter.intro], `${chapter.chapter} intro`).toBeDefined()
      expect(scenes[chapter.climax], `${chapter.chapter} climax`).toBeDefined()
      chapter.morningEvents.forEach((id) => expect(scenes[id], id).toBeDefined())
      Object.values(chapter.eveningBeats).forEach((id) =>
        expect(scenes[id], id).toBeDefined(),
      )
      for (let day = 1; day <= chapter.days; day += 1) {
        expect(chapter.headings[day], `${chapter.chapter} day ${day}`).toBeTruthy()
      }
    }
  })

  it('only leads on to chapters that exist', () => {
    expect(getNextChapter(1)?.chapter).toBe(2)
    expect(getNextChapter(2)?.chapter).toBe(3)
    expect(getNextChapter(3)?.chapter).toBe(4)
    expect(getNextChapter(4)).toBeNull()
  })

  it('sends every scene choice somewhere that exists', () => {
    const special = new Set(['@plan', '@day', '@next', '@complete', 'phase'])
    const missing: string[] = []
    const collect = (where: string, value: unknown) => {
      if (Array.isArray(value)) value.forEach((item) => collect(where, item))
      else if (value && typeof value === 'object') {
        for (const [key, inner] of Object.entries(value)) {
          if (key === 'go' && typeof inner === 'string') {
            if (!special.has(inner) && !scenes[inner]) missing.push(`${where} -> ${inner}`)
          } else collect(where, inner)
        }
      }
    }
    Object.entries(scenes).forEach(([id, scene]) => collect(id, scene.choices))
    expect(missing).toEqual([])
  })
})

describe('starting chapter two', () => {
  it('opens the winter with a fresh chapter but the same household', () => {
    const game = startNextChapter(finishedChapterOne(), scenes)

    expect(game).toMatchObject({ ch: 2, day: 1, mode: 'scene', sec: 'w.00' })
    expect(game.done).toEqual({})
    expect(game.flags.scouted).toBeUndefined()
    expect(game.flags.pen).toBe(true)
    expect(game.hof).toMatchObject({ korn: 9, heim: 1, land: 2 })
    expect(game.rel.kuhlmann).toBe(2)
    expect(game.chars.andreas.stam).toBe(game.chars.andreas.stamMax)
    expect(game.chars.andreas.grit).toBe(2)
    expect(game.chars.andreas.kw).toEqual(['plow'])
    expect(game.unlocked).toMatchObject({ village: 1, kuhlmann: 1, bode: 1 })
    expect(game.log.at(-1)?.t).toContain('Midwinter 1648')
  })

  it('offers the winter work only in chapter two', () => {
    const winter = startNextChapter(finishedChapterOne(), scenes)
    const plan = { ...winter, mode: 'plan' as const, sec: null }
    const ids = getAvailableActions(plan, 'andreas', actions).map((a) => a.id)
    expect(ids).toContain('ice_fish')
    expect(ids).toContain('sit_vigil')

    const autumn = { ...startChapterOne(scenes), mode: 'plan' as const, sec: null }
    const autumnIds = getAvailableActions(autumn, 'andreas', actions).map((a) => a.id)
    expect(autumnIds).not.toContain('ice_fish')
  })

})

describe('chapter two day flow', () => {
  it('runs six days, the Sunday scene, and ends on the thaw', () => {
    let game = startNextChapter(finishedChapterOne(), scenes)
    game = chooseStoryChoice(game, 'w.00', 0, scenes, actions, roll)
    expect(game.mode).toBe('plan')

    const visited: number[] = []
    for (let day = 1; day <= getChapter(2).days; day += 1) {
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
      if (day === 3) {
        // The Sunday scene sits between the third evening and the fourth morning.
        expect(game.sec).toBe('w.b3e')
        game = chooseStoryChoice(game, 'w.b3e', 2, scenes, actions, () => 0)
        game = continueResult(game, actions, scenes, encounters, () => 0)
      }
    }

    expect(visited).toEqual([1, 2, 3, 4, 5, 6])
    expect(game).toMatchObject({ mode: 'scene', sec: 'w.20' })
    game = chooseStoryChoice(game, 'w.20', 0, scenes, actions, () => 0)
    expect(game.mode).toBe('complete')
  })

  it('makes the thaw scene read the winter that was lived', () => {
    const base = startNextChapter(finishedChapterOne(), scenes)
    const hungry = {
      ...base,
      hof: { ...base.hof, korn: 0, vieh: { ...base.hof.vieh, kuh: 0 } },
    }
    const text = resolveContentText(scenes['w.20'].text, hungry)
    expect(text).toContain('The cow is gone')
    expect(text).toContain('not a grain left')

    const ended = chooseStoryChoice({ ...hungry, sec: 'w.20' }, 'w.20', 0, scenes, actions, roll)
    expect(ended.mode).toBe('complete')
  })
})

describe('chapter two scene choices', () => {
  const presets: Record<string, GameState['flags']> = {
    none: {},
    helpedFire: { helped_fire: 1 },
    ignoredFire: { fire_ignored: 1 },
    fireThief: { fire_thief: 1 },
    fought: { fought_riders: 1 },
    knowRiders: { riders_know: 1 },
    paid: { paid_riders: 1 },
    cough: { cough_lingers: 1, strangers_in: 1 },
    coughNoStrangers: { cough_lingers: 1 },
    looted: { looted_dead: 1 },
  }

  const chapterTwoSceneIds = Object.keys(scenes).filter((id) => id.startsWith('w.'))

  it('plays every visible choice of every chapter two scene without error', () => {
    let played = 0
    for (const [name, flags] of Object.entries(presets)) {
      const base = startNextChapter(finishedChapterOne(), scenes)
      const rich: GameState = {
        ...base,
        hof: { ...base.hof, korn: 12, kasse: 12 },
        flags: { ...base.flags, ...flags },
        rel: { ...base.rel, kuhlmann: 2, bode: 1, pastor: 1 },
        mode: 'scene',
      }
      for (const id of chapterTwoSceneIds) {
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

  it('reads Meta, Bode and Kuhlmann the way chapter one left them', () => {
    const base = startNextChapter(finishedChapterOne(), scenes)
    const text = (id: string, flags: GameState['flags']) =>
      resolveContentText(scenes[id].text, {
        ...base,
        flags: { ...base.flags, ...flags },
      })

    expect(text('w.ev_hartman', { helped_fire: 1 })).toContain('Bode himself')
    expect(text('w.ev_hartman', { fire_ignored: 1 })).toContain('Bode’s boy')
    expect(text('w.ev_hartman', {})).toContain('Kuhlmann’s youngest daughter')
    expect(text('w.ev_fever', { cough_lingers: 1, strangers_in: 1 })).toContain('Meta’s youngest')
    for (const id of chapterTwoSceneIds) {
      expect(text(id, { strangers_in: 1 })).not.toMatch(/Anneke|Hartman|Degen|Brandes/)
    }
  })
})
