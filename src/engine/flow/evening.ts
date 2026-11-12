import { applyEffects } from '../resolution'
import type { Chip, GameState } from '../types'
import { BROTHER_NAMES, ORDER, appendLog } from './shared'
import { ROAD_MILESTONES } from './road'

export function startEvening(state: GameState): GameState {
  let next: GameState = { ...state, lead: 'andreas' }
  const lines: string[] = []
  const chips: Chip[] = []
  const freeMeal =
    state.day % 2 === 0 &&
    (state.hof.vieh.kuh >= 1 ||
      state.hof.vieh.ziege >= 2 ||
      state.hof.vieh.huhn >= 3)
  let fed = true
  if (freeMeal) {
    lines.push('Supper: milk, eggs and porridge from the animals. No Stores eaten.')
  } else if (next.hof.korn >= 1) {
    const meal = applyEffects(next, ['korn-1'])
    next = meal.state
    chips.push(...meal.chips)
    lines.push('Supper: one measure of Stores goes into the pot.')
  } else {
    fed = false
    lines.push('Supper: there is nothing in the pot. Everybody goes to bed hungry.')
  }

  const cold = next.hof.heim < 1 && next.day >= 4
  for (const brotherId of ORDER) {
    const character = next.chars[brotherId]
    const before = character.stam
    let change =
      next.hof.heim >= 2
        ? 2
        : next.hof.heim >= 1
          ? 1
          : cold
            ? -1
            : 0
    const keywords = [...character.kw]
    if (!fed) {
      change -= 1
      if (!keywords.includes('hungry')) keywords.push('hungry')
    } else {
      const index = keywords.indexOf('hungry')
      if (index >= 0) keywords.splice(index, 1)
    }
    if (next.hof.heim >= 1 && fed) {
      const index = keywords.indexOf('weary')
      if (index >= 0) keywords.splice(index, 1)
    }
    const stamina = Math.max(1, Math.min(character.stamMax, before + change))
    next = {
      ...next,
      chars: {
        ...next.chars,
        [brotherId]: { ...character, stam: stamina, kw: keywords },
      },
    }
    lines.push(
      `${BROTHER_NAMES[brotherId]}: ${next.hof.heim >= 1 ? 'sleeps dry' : cold ? 'shivers through a cold night' : 'sleeps rough'}, Stamina ${before} to ${stamina}${stamina <= 2 ? '. Running on empty: a day of Rest at the hearth would help' : ''}`,
    )
  }

  for (const brotherId of ORDER) {
    if (next.plans[brotherId] && next.plans[brotherId] !== 'rest') {
      const character = next.chars[brotherId]
      next = {
        ...next,
        chars: {
          ...next.chars,
          [brotherId]: { ...character, xp: character.xp + 1 },
        },
      }
    }
  }
  lines.push('Each brother who worked today gains 1 Experience.')
  for (const brotherId of ORDER) {
    ROAD_MILESTONES[brotherId].forEach((milestone, index) => {
      const key = `${brotherId}:${index}`
      if (next.arcDone[key] || !milestone.reached(next)) return
      const character = next.chars[brotherId]
      next = {
        ...next,
        arcDone: { ...next.arcDone, [key]: 1 },
        chars: {
          ...next.chars,
          [brotherId]: { ...character, xp: character.xp + 2 },
        },
      }
      chips.push({
        t: `${BROTHER_NAMES[brotherId]}: ${milestone.title} (+2 Experience)`,
        k: 'key',
      })
      next = appendLog(next, `${BROTHER_NAMES[brotherId]}: ${milestone.title}.`)
    })
  }
  return {
    ...next,
    mode: 'evening',
    res: null,
    evening: { lines, chips },
    chips,
  }
}
