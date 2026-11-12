import type { SectionRegistry } from '../content'
import { createInitialState } from '../state'
import { getChapter, getNextChapter } from '../chapters'
import type { GameState } from '../types'
import { ORDER } from './shared'
import { enterSection } from './scene'

export function startChapterOne(
  sections: SectionRegistry,
): GameState {
  const initial = createInitialState()
  return enterSection({ ...initial, sec: null }, getChapter(1).intro, sections)
}

/**
 * Moves a finished chapter on to the next one: a new day count, full
 * Stamina and Grit, the new chapter's places open, and its opening scene.
 * What the household owns, its relationships and its flags carry over.
 */
export function startNextChapter(
  state: GameState,
  sections: SectionRegistry,
): GameState {
  const chapter = getNextChapter(state.ch)
  if (!chapter) throw new Error(`No chapter follows chapter ${state.ch}`)
  const flags = { ...state.flags }
  delete flags.scouted
  delete flags.wolf_warning
  const chars = { ...state.chars }
  for (const brotherId of ORDER) {
    const character = chars[brotherId]
    chars[brotherId] = {
      ...character,
      stam: character.stamMax,
      grit: 2,
      kw: character.kw.filter((word) => word !== 'weary' && word !== 'wounded'),
    }
  }
  return enterSection(
    {
      ...state,
      ch: chapter.chapter,
      day: 1,
      done: {},
      plans: {},
      forced: {},
      ri: 0,
      pick: null,
      pickLoc: null,
      phase: null,
      winter: null,
      res: null,
      chips: [],
      evening: null,
      flags,
      chars,
      lead: 'andreas',
      unlocked: {
        ...state.unlocked,
        ...Object.fromEntries(chapter.unlocked.map((place) => [place, 1 as const])),
      },
    },
    chapter.intro,
    sections,
  )
}
