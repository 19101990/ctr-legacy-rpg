import { ITEMS, KEYWORDS, NPC_NAMES } from './definitions'
import type {
  AnimalType,
  BrotherId,
  CheckDefinition,
  CheckPool,
  Chip,
  Condition,
  Effect,
  GameState,
} from './types'

const TARGETS: Partial<Record<number, number>> = {
  3: 6,
  4: 7,
  5: 8,
  6: 9,
  8: 10,
}

const ROLL_DIFFICULTY = [0, 0, 1, 2, 3]
const GATE_DIFFICULTY = [0, 0, 1, 3, 3]
const RESOURCE_LIMITS = {
  korn: [0, 40],
  kasse: [0, 99],
  land: [0, 14],
  heim: [0, 3],
  ansehen: [0, 10],
  baustoff: [0, 12],
  gunst: [0, 10],
} as const
const RESOURCE_LABELS: Record<keyof typeof RESOURCE_LIMITS, string> = {
  korn: 'Stores',
  kasse: 'Groschen',
  land: 'Morgen cleared',
  heim: 'House',
  ansehen: 'Standing',
  baustoff: 'Materials',
  gunst: 'Favours',
}
const ANIMAL_LABELS: Record<AnimalType, string> = {
  kuh: 'cow',
  ziege: 'goat',
  huhn: 'hen',
  schwein: 'pig',
  schaf: 'sheep',
}
const ANIMAL_LIMITS: Record<AnimalType, number> = {
  kuh: 4,
  ziege: 6,
  huhn: 10,
  schwein: 4,
  schaf: 8,
}
const HOUSE_NAMES = [
  'Ruin among the briars',
  'Roofed shelter (Notdach)',
  'Wattle-and-daub house',
  'House with stall and threshing floor',
]
const HOUSEHOLD_IDS = ['andreas', 'henning', 'casper'] as const

function chapterModifier(chapter: number, values: number[]): number {
  const index = chapter || 1
  return values[index] || 0
}

export function tgt(definition: Pick<CheckDefinition, 't' | 'h'>, chapter: number): number {
  return Math.min(
    12,
    (definition.t || TARGETS[definition.h ?? 0] || 8) +
      chapterModifier(chapter, ROLL_DIFFICULTY),
  )
}

export function gmin(definition: Pick<CheckDefinition, 'min'>, chapter: number): number {
  const minimum = definition.min
  if (minimum === undefined) {
    throw new Error('Gate definition is missing its minimum')
  }
  return minimum <= 2
    ? minimum
    : Math.min(8, minimum + chapterModifier(chapter, GATE_DIFFICULTY))
}

export function rivalBonus(n: number): number {
  return Math.max(1, Math.round(n / 2) - 1)
}

export function stat(state: GameState, key: string): number {
  if (key.startsWith('vieh.')) {
    return state.hof.vieh[key.slice(5) as AnimalType] || 0
  }
  if (key.startsWith('rel.')) {
    return state.rel[key.slice(4)] || 0
  }
  if (key === 'trust') return state.trust
  if (key in state.hof) {
    const value = state.hof[key as keyof GameState['hof']]
    if (typeof value === 'number') return value
  }
  if (key === 'days') return state.day
  if (key === 'stam') return state.chars[state.lead].stam
  if (key === 'xp') return state.chars[state.lead].xp
  return 0
}

export function test(state: GameState, condition: Condition): boolean {
  if (condition === undefined || condition === null) return true
  if (typeof condition === 'function') return Boolean(condition(state))
  if (Array.isArray(condition)) {
    return condition.every((part) => test(state, part))
  }

  const conditionText = condition as string
  const tokenMatch = /^(!)?(kw|item|lead|flag):(\w+)$/.exec(conditionText)
  if (tokenMatch) {
    const [, negate, kind, value] = tokenMatch
    const brother = state.chars[state.lead]
    let result: boolean
    if (kind === 'kw') result = brother.kw.includes(value)
    else if (kind === 'item') result = brother.items.includes(value)
    else if (kind === 'lead') result = state.lead === value
    else result = Boolean(state.flags[value])
    return negate ? !result : result
  }

  const comparison = /^([\w.]+)(>=|<=|>|<|==)(-?\d+)$/.exec(conditionText)
  if (comparison) {
    const [, key, operator, rawNumber] = comparison
    const value = stat(state, key)
    const number = Number(rawNumber)
    switch (operator) {
      case '>=': return value >= number
      case '<=': return value <= number
      case '>': return value > number
      case '<': return value < number
      case '==': return value === number
    }
  }
  throw new Error(`bad cond ${conditionText}`)
}

export interface ApplyOneResult {
  state: GameState
  chips: Chip[]
}

function copyState(state: GameState): GameState {
  return {
    ...state,
    chars: {
      andreas: { ...state.chars.andreas, attrs: { ...state.chars.andreas.attrs }, kw: [...state.chars.andreas.kw], items: [...state.chars.andreas.items] },
      henning: { ...state.chars.henning, attrs: { ...state.chars.henning.attrs }, kw: [...state.chars.henning.kw], items: [...state.chars.henning.items] },
      casper: { ...state.chars.casper, attrs: { ...state.chars.casper.attrs }, kw: [...state.chars.casper.kw], items: [...state.chars.casper.items] },
    },
    hof: {
      ...state.hof,
      vieh: { ...state.hof.vieh },
      store: [...state.hof.store],
      builds: [...state.hof.builds],
    },
    rel: { ...state.rel },
    flags: { ...state.flags },
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value))
}

export function applyOne(state: GameState, effect: Effect): ApplyOneResult {
  const next = copyState(state)
  const chips: Chip[] = []

  function apply(currentEffect: Effect): void {
    if (currentEffect === null || currentEffect === undefined) return
    if (typeof currentEffect === 'function') {
      const result = currentEffect(next)
      if (Array.isArray(result)) result.forEach(apply)
      else if (result !== null && result !== undefined) apply(result as Effect)
      return
    }

    const match = /^(?:(all|c:(\w+)):)?([\w.]+)([+\-=])(.*)$/.exec(currentEffect)
    if (!match) throw new Error(`bad fx ${currentEffect}`)
    const [, who, characterId, key, operator, rawValue] = match
    const number = Number(rawValue)
    if (!Number.isFinite(number) && key !== 'flag' && key !== 'kw' && key !== 'item') {
      throw new Error(`bad numeric effect ${currentEffect}`)
    }

    if (key in RESOURCE_LIMITS) {
      const resource = key as keyof typeof RESOURCE_LIMITS
      const oldValue = next.hof[resource]
      const [minimum, maximum] = RESOURCE_LIMITS[resource]
      const updated = clamp(
        operator === '+' ? oldValue + number : operator === '-' ? oldValue - number : number,
        minimum,
        maximum,
      )
      next.hof[resource] = updated
      const change = updated - oldValue
      if (change !== 0) {
        chips.push({
          t: resource === 'heim' ? `House: ${HOUSE_NAMES[updated]}` : `${change > 0 ? '+' : '−'}${Math.abs(change)} ${RESOURCE_LABELS[resource]}`,
          k: change > 0 ? 'good' : 'bad',
        })
      }
      return
    }

    if (key.startsWith('vieh.')) {
      const animal = key.slice(5) as AnimalType
      if (!(animal in ANIMAL_LIMITS)) throw new Error(`bad animal ${animal}`)
      const oldValue = next.hof.vieh[animal]
      const updated = clamp(
        operator === '+' ? oldValue + number : operator === '-' ? oldValue - number : number,
        0,
        ANIMAL_LIMITS[animal],
      )
      next.hof.vieh[animal] = updated
      const change = updated - oldValue
      if (change !== 0) {
        const label = ANIMAL_LABELS[animal]
        chips.push({
          t: `${change > 0 ? '+' : '−'}${Math.abs(change)} ${label}${Math.abs(change) > 1 ? 's' : ''}`,
          k: change > 0 ? 'good' : 'bad',
        })
      }
      return
    }

    if (key.startsWith('rel.')) {
      const npc = key.slice(4)
      const oldValue = next.rel[npc] || 0
      const updated = clamp(
        operator === '+' ? oldValue + number : operator === '-' ? oldValue - number : number,
        -2,
        5,
      )
      next.rel[npc] = updated
      if (updated !== oldValue) {
        chips.push({
          t: `${NPC_NAMES[npc] || npc}: ${updated > oldValue ? 'warmer' : 'colder'} (${updated})`,
          k: updated > oldValue ? 'good' : 'bad',
        })
      }
      return
    }

    if (key === 'trust') {
      const oldValue = next.trust
      const updated = clamp(
        operator === '+' ? oldValue + number : operator === '-' ? oldValue - number : number,
        0,
        10,
      )
      next.trust = updated
      if (updated !== oldValue) {
        const change = updated - oldValue
        chips.push({
          t: `Herder’s trust ${change > 0 ? '+' : '−'}${Math.abs(change)} (${updated})`,
          k: change > 0 ? 'good' : 'bad',
        })
      }
      return
    }

    if (key === 'flag') {
      if (operator === '+') next.flags[rawValue] = 1
      else delete next.flags[rawValue]
      return
    }

    const targets: BrotherId[] =
      who === 'all'
        ? [...HOUSEHOLD_IDS]
        : characterId
          ? [characterId as BrotherId]
          : [next.lead]
    for (const id of targets) {
      const character = next.chars[id]
      if (!character) throw new Error(`bad character ${id}`)
      if (key === 'stam') {
        const oldValue = character.stam
        let updated = clamp(
          operator === '+' ? oldValue + number : operator === '-' ? oldValue - number : number,
          0,
          character.stamMax,
        )
        if (next.phase?.active && updated < 1) updated = 1
        character.stam = updated
        const change = updated - oldValue
        if (change !== 0 && (id === next.lead || who === 'all')) {
          chips.push({
            t: `${who === 'all' ? 'All: ' : ''}Stamina ${change > 0 ? '+' : '−'}${Math.abs(change)}`,
            k: change > 0 ? 'good' : 'bad',
          })
        }
      } else if (key === 'xp') {
        if (number !== 0) {
          character.xp += number
          if (id === next.lead && who !== 'all') {
            chips.push({ t: `+${number} Experience`, k: 'good' })
          }
        }
      } else if (key === 'grit') {
        character.grit = clamp(
          operator === '+' ? character.grit + number : operator === '-' ? character.grit - number : number,
          0,
          5,
        )
      } else if (key === 'kw') {
        if (operator === '+' && !character.kw.includes(rawValue)) {
          const keyword = KEYWORDS[rawValue]
          if (!keyword) throw new Error(`bad keyword ${rawValue}`)
          character.kw.push(rawValue)
          if (id === next.lead || who === 'all') {
            chips.push({
              t: `${keyword.bad ? 'Condition' : 'Keyword'}: ${keyword.n}`,
              k: keyword.bad ? 'bad' : 'key',
            })
          }
        } else if (operator === '-' && character.kw.includes(rawValue)) {
          character.kw = character.kw.filter((keyword) => keyword !== rawValue)
        }
      } else if (key === 'item') {
        const item = ITEMS[rawValue]
        if (!item) throw new Error(`bad item ${rawValue}`)
        if (operator === '+') {
          if (character.items.length >= 4 || character.items.includes(rawValue)) {
            next.hof.store.push(rawValue)
          } else {
            character.items.push(rawValue)
          }
          if (id === next.lead) chips.push({ t: `Item: ${item.n}`, k: 'key' })
        } else {
          const index = character.items.indexOf(rawValue)
          if (index >= 0) character.items.splice(index, 1)
          else {
            const storeIndex = next.hof.store.indexOf(rawValue)
            if (storeIndex >= 0) next.hof.store.splice(storeIndex, 1)
          }
        }
      } else {
        throw new Error(`bad key ${key}`)
      }
    }
  }

  apply(effect)
  return { state: next, chips }
}

export function poolFor(
  state: GameState,
  definition: CheckDefinition,
  brotherId: BrotherId = state.lead,
): CheckPool {
  const character = state.chars[brotherId]
  if (!character) throw new Error(`bad character ${brotherId}`)
  const tags = definition.tags || []
  const availableHelps = character.kw.flatMap((keywordId) => {
    const keyword = KEYWORDS[keywordId]
    return keyword && !keyword.pen && keyword.tags?.some((tag) => tags.includes(tag))
      ? [{ n: keyword.n, k: 'kw' as const }]
      : []
  })
  const items = character.items.flatMap((itemId) => {
    const item = ITEMS[itemId]
    const bonus = item?.b?.[definition.attr]
    return item && bonus
      ? [{ n: item.n.replace(/ \(.*\)/, ''), b: bonus }]
      : []
  })
  const itemBonus = Math.min(2, items.reduce((sum, item) => sum + item.b, 0))
  const penalty = Math.min(
    2,
    character.kw.filter((keywordId) => KEYWORDS[keywordId]?.pen).length,
  )
  const helps = availableHelps.slice(0, 2)
  const base = character.attrs[definition.attr]

  return {
    base,
    items,
    ib: itemBonus,
    helps,
    all: availableHelps.length,
    pen: penalty,
    eff: Math.max(0, base + itemBonus + helps.length - penalty),
  }
}
