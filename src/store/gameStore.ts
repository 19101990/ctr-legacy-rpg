import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { startChapterOne } from '../engine/flow'
import { scenes } from '../engine/chapters'
import { isSavedGame, SAVE_VERSION } from '../engine/save'
import type { GameState } from '../engine/types'

export const SAVE_KEY = 'coming-home-save'

export interface GameStore {
  game: GameState
  /** Same shape as a React state setter: a new state or an updater. */
  setGame: (next: GameState | ((current: GameState) => GameState)) => void
  /** Throws the current game away and begins Chapter 1 again. */
  restart: () => void
}

/**
 * The game, saved to storage after every change and picked up again on the
 * next visit. Pass a storage for tests; the browser uses localStorage.
 * A save from another version, or one that no longer fits the chapters, is
 * ignored and a new game begins.
 */
export function createGameStore(storage?: StateStorage) {
  return create<GameStore>()(
    persist(
      (set) => ({
        game: startChapterOne(scenes),
        setGame: (next) =>
          set((store) => ({
            game: typeof next === 'function' ? next(store.game) : next,
          })),
        restart: () => set({ game: startChapterOne(scenes) }),
      }),
      {
        name: SAVE_KEY,
        version: SAVE_VERSION,
        storage: createJSONStorage(() => storage ?? localStorage),
        partialize: (store) => ({ game: store.game }),
        merge: (persisted, current) => {
          const saved = (persisted as { game?: unknown } | undefined)?.game
          return isSavedGame(saved) ? { ...current, game: saved } : current
        },
      },
    ),
  )
}

export const useGameStore = createGameStore()
