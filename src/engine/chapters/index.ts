import type {
  ActionRegistry,
  EncounterRegistry,
  SectionRegistry,
} from '../content'
import { CHAPTER_ONE_UNLOCKS } from '../state'
import type { GameState } from '../types'
import { chapterOneActions } from './chapterOneActions'
import {
  chapterOneClimaxScene,
  chapterOneDuskScenes,
  chapterOneEncounters,
  chapterOneMorningEvents,
  chapterOneScenes,
} from './chapterOneScenes'
import { chapterTwoActions } from './chapterTwoActions'
import {
  chapterTwoClimaxScene,
  chapterTwoDuskScenes,
  chapterTwoMorningEvents,
  chapterTwoScenes,
} from './chapterTwoScenes'
import {
  CHAPTER_TWO_DAYS,
  chapterOneGoals,
  chapterTwoGoals,
  type Goal,
} from './goals'

export interface ChapterDefinition {
  chapter: number
  title: string
  year: string
  days: number
  /** Scene the chapter opens on (chapter one is started by startChapterOne). */
  intro: string
  /** Scene shown after the last day. It ends with go: '@complete'. */
  climax: string
  /** Locations open from the first day. */
  unlocked: readonly string[]
  /** One line of weather and mood per day. */
  headings: Readonly<Record<number, string>>
  /** Scenes played at dusk, by day number. */
  eveningBeats: Readonly<Record<number, string>>
  /** Morning event scenes; a d6 from day 2 picks one (1 is a quiet morning). */
  morningEvents: readonly string[]
  /** Heinrich's list for this chapter. */
  goals: (state: GameState) => Goal[]
  /** Label shown over the goals in the sidebar. */
  goalsLabel: string
  ending: { title: string; text: string }
}

export const CHAPTERS: Readonly<Record<number, ChapterDefinition>> = {
  1: {
    chapter: 1,
    title: 'Down from the Mountain',
    year: 'Autumn 1648',
    days: 7,
    intro: '1.00',
    climax: chapterOneClimaxScene,
    unlocked: CHAPTER_ONE_UNLOCKS,
    headings: {
      1: 'Nothing stands but the sill-stones.',
      2: 'The village is stirring. Smoke on the street.',
      3: 'Cold nights now. Strangers on the road.',
      4: 'The wolves are hungry.',
      5: 'First flurries.',
      6: 'Hard frost on the puddles. Every chimney smokes but the empty ones.',
      7: 'The frost comes tonight.',
    },
    eveningBeats: chapterOneDuskScenes,
    morningEvents: chapterOneMorningEvents,
    goals: chapterOneGoals,
    goalsLabel: 'Seven days to frost',
    ending: {
      title: 'The first frost has come',
      text: 'The family has made it through the first seven days back in Lochtum. Ahead lies the winter.',
    },
  },
  2: {
    chapter: 2,
    title: 'The Hungry Months',
    year: 'Midwinter 1648 to 1649',
    days: CHAPTER_TWO_DAYS,
    intro: 'w.00',
    climax: chapterTwoClimaxScene,
    unlocked: [...CHAPTER_ONE_UNLOCKS, 'village', 'kuhlmann', 'bode'],
    headings: {
      1: 'Snow to the knee. The cow gives less each day.',
      2: 'Ice on the Schamlah. Something moves at the edge of the forest.',
      3: 'Sunday. The bell tolls for the dead.',
      4: 'The hungriest week.',
      5: 'A false thaw. Everything is mud.',
      6: 'The ice breaks on the Schamlah.',
    },
    eveningBeats: chapterTwoDuskScenes,
    morningEvents: chapterTwoMorningEvents,
    goals: chapterTwoGoals,
    goalsLabel: 'Six days to the thaw',
    ending: {
      title: 'The ice has broken',
      text: 'The family has come through the hungry months. The years that follow are beyond what can be played so far.',
    },
  },
}

export function getChapter(chapter: number): ChapterDefinition {
  const definition = CHAPTERS[chapter]
  if (!definition) throw new Error(`Unknown chapter ${chapter}`)
  return definition
}

export function getNextChapter(chapter: number): ChapterDefinition | null {
  return CHAPTERS[chapter + 1] ?? null
}

export const scenes: SectionRegistry = {
  ...chapterOneScenes,
  ...chapterTwoScenes,
}

export const actions: ActionRegistry = [
  ...chapterOneActions,
  ...chapterTwoActions,
]

export const encounters: EncounterRegistry = chapterOneEncounters
