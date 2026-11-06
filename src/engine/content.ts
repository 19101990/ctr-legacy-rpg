import type {
  BrotherId,
  CheckDefinition,
  Condition,
  Effect,
  GameState,
} from './types'

export type ContentText = string | ((state: GameState) => string)
export type ContentSource = 'doc' | 'mix' | 'inv'
export type ChapterAvailability = number | readonly number[]
export type Cost = Partial<Record<'korn' | 'kasse' | 'baustoff' | 'gunst', number>>
export type DynamicCost = Cost | ((state: GameState) => Cost)

export interface OutcomeContent {
  text?: ContentText
  go?: string
  effects?: readonly Effect[]
  log?: ContentText
}

export interface CheckContent extends CheckDefinition {
  label?: string
  success: OutcomeContent
  failure: OutcomeContent
  great?: readonly Effect[]
}

export interface ContestContent extends CheckContent {
  rival: number | ((state: GameState) => number)
  rivalNote?: string
}

export interface GateContent extends CheckDefinition {
  min: number
  label?: string
  success: OutcomeContent
  great?: readonly Effect[]
  hard?: OutcomeContent
}

export interface ChoiceContent {
  text: string
  condition?: Condition
  as?: BrotherId
  once?: string
  cost?: DynamicCost
  effects?: readonly Effect[]
  log?: ContentText
  go?: string
  outcome?: OutcomeContent
  check?: CheckContent
  contest?: ContestContent
  gate?: GateContent
}

export interface SectionContent {
  chapter: number
  source: ContentSource
  title: string
  text: ContentText
  choices?: readonly ChoiceContent[]
  condition?: Condition
  unlock?: readonly string[]
  effects?: readonly Effect[]
  log?: ContentText
}

export interface ActionContent {
  id: string
  location: string
  name: string
  description: string
  chapter?: ChapterAvailability
  condition?: Condition
  once?: boolean
  repeat?: boolean
  permanent?: boolean
  who?: 'all' | BrotherId | readonly BrotherId[]
  cost?: DynamicCost
  stamina?: number
  outcome?: OutcomeContent
  check?: CheckContent
  contest?: ContestContent
  gate?: GateContent
  noCheck?: OutcomeContent
}

export interface EncounterContent {
  id: string
  location: string
  scene: string
  chapter?: ChapterAvailability
  condition?: Condition
}

export type SectionRegistry = Readonly<Record<string, SectionContent>>
export type ActionRegistry = readonly ActionContent[]
export type EncounterRegistry = readonly EncounterContent[]

export function isAvailableInChapter(
  availability: ChapterAvailability | undefined,
  chapter: number,
): boolean {
  if (availability === undefined) return true
  return Array.isArray(availability)
    ? availability.includes(chapter)
    : availability === chapter
}

export function resolveContentText(text: ContentText, state: GameState): string {
  return typeof text === 'function' ? text(state) : text
}

export function resolveCost(cost: DynamicCost, state: GameState): Cost {
  return typeof cost === 'function' ? cost(state) : cost
}
