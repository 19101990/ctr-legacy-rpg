export const BROTHER_IDS = ['andreas', 'henning', 'casper'] as const
export type BrotherId = (typeof BROTHER_IDS)[number]

export const ATTRIBUTES = ['kraft', 'geschick', 'verstand', 'herz'] as const
export type Attribute = (typeof ATTRIBUTES)[number]

export const ANIMAL_TYPES = ['kuh', 'ziege', 'huhn', 'schwein', 'schaf'] as const
export type AnimalType = (typeof ANIMAL_TYPES)[number]

export interface CharacterState {
  attrs: Record<Attribute, number>
  stam: number
  stamMax: number
  grit: number
  xp: number
  kw: string[]
  items: string[]
  notes: string
}

export interface HofState {
  korn: number
  kasse: number
  land: number
  heim: number
  ansehen: number
  baustoff: number
  gunst: number
  vieh: Record<AnimalType, number>
  store: string[]
  builds: string[]
}

export interface GameState {
  v: 3
  ch: number
  day: number
  mode: GameMode
  sec: string | null
  plans: Partial<Record<BrotherId, string>>
  forced: Partial<Record<BrotherId, 1>>
  ri: number
  res: GameResult | null
  chips: Chip[]
  evening: EveningState | null
  pick: string | null
  pickLoc: string | null
  unlocked: Record<string, 1>
  arcDone: Record<string, 1>
  done: Record<string, 1 | BrotherId>
  encDone: Record<string, 1>
  log: ChronicleEntry[]
  phase: PhaseState | null
  winter: WinterState | null
  lead: BrotherId
  chars: Record<BrotherId, CharacterState>
  hof: HofState
  rel: Record<string, number>
  trust: number
  flags: Record<string, boolean | number>
  hofNotes?: string
}

export type Condition =
  | string
  | readonly Condition[]
  | ((state: GameState) => boolean)
  | null
  | undefined

export type Effect =
  | string
  | ((state: GameState) => Effect | readonly Effect[] | null | undefined)
  | null
  | undefined

export type GameMode = 'setup' | 'scene' | 'plan' | 'resolve' | 'evening' | 'phase'

export interface RolledCheck {
  a: number
  total: number
  ok: boolean
  rival: number | null
  rbon: number
  eff: number
  base: number
  helps: string[]
  pen: number
  target: number | null
  shine: boolean
  mishap: boolean
}

export interface GateSummary {
  attr: Attribute
  min: number
  info: CheckPool & { meets: boolean }
}

export interface FinalOutcome {
  text: string
  go?: string
  chips: Chip[]
  gate?: GateSummary
}

interface GameResultContext {
  sec?: string
  ci?: number
  act?: string
  proj?: string
  brother?: BrotherId
}

export interface CheckResult extends GameResultContext {
  kind: 'check'
  rolled: RolledCheck | null
  rerolled: boolean
  final: FinalOutcome | null
  pre: Chip[]
}

export interface GateResult extends GameResultContext {
  kind: 'gate'
  final: FinalOutcome
}

export interface OutcomeResult extends GameResultContext {
  kind: 'out'
  final: FinalOutcome
}

export type GameResult = CheckResult | GateResult | OutcomeResult

export interface EveningState {
  lines: string[]
  chips: Chip[]
}

export interface PhaseState {
  active: boolean
  weeks: number
  done: Record<string, 1>
}

export interface WinterState {
  text: string
  chips: Chip[]
  need: number
}

export interface ChronicleEntry {
  ch: number
  t: string
}

export interface CheckDefinition {
  attr: Attribute
  t?: number
  h?: number
  min?: number
  tags?: string[]
}

export interface PoolItem {
  n: string
  b: number
}

export interface PoolHelp {
  n: string
  k: 'kw'
}

export interface CheckPool {
  base: number
  items: PoolItem[]
  ib: number
  helps: PoolHelp[]
  all: number
  pen: number
  eff: number
}

export type ChipKind = 'good' | 'bad' | 'key'

export interface Chip {
  t: string
  k: ChipKind
}
