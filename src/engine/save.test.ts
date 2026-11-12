import { describe, expect, it } from 'vitest'
import {
  beginPlannedDay,
  chooseStoryChoice,
  continueEvening,
  continueResult,
  setPlan,
  startChapterOne,
  startNextChapter,
} from './flow'
import { actions, encounters, scenes } from './chapters'
import { isSavedGame } from './save'
import type { GameState } from './types'

const roll = () => 0.5
const roundTrip = (state: GameState): unknown => JSON.parse(JSON.stringify(state))

function planningState(): GameState {
  let game = startChapterOne(scenes)
  for (let step = 0; step < 10 && game.mode === 'scene'; step += 1) {
    game = chooseStoryChoice(game, game.sec as string, 0, scenes, actions, roll)
    if (game.res?.final) {
      game = continueResult(game, actions, scenes, encounters, roll)
    }
  }
  return game
}

describe('recognising a saved game', () => {
  it('accepts a new game', () => {
    expect(isSavedGame(roundTrip(startChapterOne(scenes)))).toBe(true)
  })

  it('accepts the game at each step of a day after a trip through JSON', () => {
    let game = planningState()
    expect(game.mode).toBe('plan')
    expect(isSavedGame(roundTrip(game))).toBe(true)

    game = setPlan(game, 'andreas', 'rest', actions)
    game = setPlan(game, 'henning', 'rest', actions)
    game = setPlan(game, 'casper', 'rest', actions)
    expect(isSavedGame(roundTrip(game))).toBe(true)

    game = beginPlannedDay(game, actions)
    while (game.mode === 'resolve') {
      expect(isSavedGame(roundTrip(game))).toBe(true)
      game = continueResult(game, actions, scenes, encounters, roll)
    }
    expect(game.mode).toBe('evening')
    expect(isSavedGame(roundTrip(game))).toBe(true)

    game = continueEvening(game, scenes, roll)
    expect(isSavedGame(roundTrip(game))).toBe(true)
  })

  it('accepts a finished chapter and the next chapter’s opening', () => {
    const done: GameState = { ...planningState(), mode: 'complete', sec: null, day: 8 }
    expect(isSavedGame(roundTrip(done))).toBe(true)
    expect(isSavedGame(roundTrip(startNextChapter(done, scenes)))).toBe(true)
  })

  it('rejects things that are not games', () => {
    for (const value of [null, undefined, 'save', 3, [], {}, { v: 3 }]) {
      expect(isSavedGame(value), String(JSON.stringify(value))).toBe(false)
    }
  })

  it('rejects a game from an older shape of state', () => {
    const game = roundTrip(startChapterOne(scenes)) as Record<string, unknown>
    expect(isSavedGame({ ...game, v: 2 })).toBe(false)
  })

  it('rejects a game that points at a chapter, scene or action that is gone', () => {
    const game = roundTrip(planningState()) as Record<string, unknown>
    expect(isSavedGame({ ...game, ch: 9 })).toBe(false)
    expect(isSavedGame({ ...game, sec: 'gone.01' })).toBe(false)
    expect(isSavedGame({ ...game, plans: { andreas: 'gone_action' } })).toBe(false)
    expect(isSavedGame({ ...game, mode: 'scene', sec: null })).toBe(false)
    expect(isSavedGame({ ...game, mode: 'resolve', res: null })).toBe(false)
    expect(isSavedGame({ ...game, mode: 'evening', evening: null })).toBe(false)
    expect(isSavedGame({ ...game, mode: 'elsewhere' })).toBe(false)
  })

  it('rejects a game with a missing brother or a broken number', () => {
    const game = roundTrip(planningState()) as {
      chars: Record<string, Record<string, unknown>>
      hof: Record<string, unknown>
    }
    const two = Object.fromEntries(
      Object.entries(game.chars).filter(([brother]) => brother !== 'casper'),
    )
    expect(isSavedGame({ ...game, chars: two })).toBe(false)
    expect(
      isSavedGame({ ...game, chars: { ...game.chars, henning: { ...game.chars.henning, stam: 'a lot' } } }),
    ).toBe(false)
    expect(isSavedGame({ ...game, hof: { ...game.hof, korn: null } })).toBe(false)
    expect(isSavedGame({ ...game, hof: { ...game.hof, vieh: undefined } })).toBe(false)
  })
})
