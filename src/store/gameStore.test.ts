import { describe, expect, it } from 'vitest'
import type { StateStorage } from 'zustand/middleware'
import { startChapterOne } from '../engine/chapterOneFlow'
import { scenes } from '../engine/chapters'
import { SAVE_VERSION } from '../engine/save'
import { createGameStore, SAVE_KEY } from './gameStore'

function memoryStorage(initial: Record<string, string> = {}): StateStorage & {
  data: Record<string, string>
} {
  const data = { ...initial }
  return {
    data,
    getItem: (name) => data[name] ?? null,
    setItem: (name, value) => {
      data[name] = value
    },
    removeItem: (name) => {
      delete data[name]
    },
  }
}

const saved = (storage: { data: Record<string, string> }) =>
  JSON.parse(storage.data[SAVE_KEY]) as { state: Record<string, unknown>; version: number }

describe('the saved game', () => {
  it('begins Chapter 1 when nothing is saved', () => {
    const store = createGameStore(memoryStorage())
    expect(store.getState().game).toMatchObject({ ch: 1, day: 1, sec: '1.00' })
  })

  it('saves the game after every change, and nothing else', () => {
    const storage = memoryStorage()
    const store = createGameStore(storage)

    store.getState().setGame((game) => ({ ...game, hof: { ...game.hof, korn: 7 } }))
    expect(saved(storage).version).toBe(SAVE_VERSION)
    expect(Object.keys(saved(storage).state)).toEqual(['game'])
    expect((saved(storage).state.game as { hof: { korn: number } }).hof.korn).toBe(7)

    store.getState().setGame({ ...store.getState().game, day: 3 })
    expect((saved(storage).state.game as { day: number }).day).toBe(3)
  })

  it('picks the game up again in a new session', () => {
    const storage = memoryStorage()
    const first = createGameStore(storage)
    first.getState().setGame((game) => ({
      ...game,
      day: 4,
      flags: { ...game.flags, pen: true },
      hof: { ...game.hof, land: 2 },
    }))

    const second = createGameStore(storage)
    expect(second.getState().game).toEqual(first.getState().game)
    expect(second.getState().game).toMatchObject({ day: 4, hof: { land: 2 } })
  })

  it('goes back to Chapter 1 and saves that when the player starts over', () => {
    const storage = memoryStorage()
    const store = createGameStore(storage)
    store.getState().setGame((game) => ({ ...game, ch: 2, day: 5 }))
    store.getState().restart()

    expect(store.getState().game).toMatchObject({ ch: 1, day: 1 })
    expect((saved(storage).state.game as { ch: number }).ch).toBe(1)
  })

  it('ignores a save from another version', () => {
    const game = { ...startChapterOne(scenes), day: 5 }
    const storage = memoryStorage({
      [SAVE_KEY]: JSON.stringify({ state: { game }, version: SAVE_VERSION + 1 }),
    })
    expect(createGameStore(storage).getState().game.day).toBe(1)
  })

  it('ignores a save that no longer fits the chapters', () => {
    const game = { ...startChapterOne(scenes), day: 5, sec: 'gone.01' }
    const storage = memoryStorage({
      [SAVE_KEY]: JSON.stringify({ state: { game }, version: SAVE_VERSION }),
    })
    expect(createGameStore(storage).getState().game).toMatchObject({ day: 1, sec: '1.00' })
  })

  it('ignores a save that cannot be read', () => {
    const storage = memoryStorage({ [SAVE_KEY]: '{not json' })
    expect(createGameStore(storage).getState().game).toMatchObject({ ch: 1, day: 1 })
  })
})
