import type { GameState } from '../engine/types'

const HOUSE_STEPS = [
  'Ruin among the briars',
  'Roofed shelter',
  'Wattle-and-daub house',
  'House with stall and threshing floor',
]

export function getImprovements(state: GameState) {
  const { hof, flags } = state
  return [
    {
      title: 'The house',
      done: hof.heim >= 1,
      status: HOUSE_STEPS[hof.heim] ?? `Step ${hof.heim}`,
      unlocks: hof.heim >= 3
        ? 'The finest house this chapter allows: a warm night restores the most Stamina.'
        : 'Brothers sleep dry. A fence and a further house step can now be built (3 Materials each step).',
      hint: 'Raise a roof or dig an earth-hut on the plot. Without one the nights are cold.',
    },
    {
      title: 'The animal pen',
      done: Boolean(flags.pen),
      status: flags.pen ? 'Built' : 'Not built',
      unlocks: 'Protects the animals when the wolves come at dusk.',
      hint: 'Build a pen of stakes and withies (1 Material).',
    },
    {
      title: 'The stout fence',
      done: Boolean(flags.fence),
      status: flags.fence ? 'Built' : 'Not built',
      unlocks: 'Wolves and thieves will think twice.',
      hint: 'Needs a roof first, then 2 Materials.',
    },
    {
      title: 'Steinborn Spring',
      done: Boolean(flags.clean_spring),
      status: flags.clean_spring ? 'Running clean' : 'Fouled with silt',
      unlocks: 'The neighbours noticed: Standing rose by 1.',
      hint: 'Trace the channel and clear it.',
    },
    {
      title: 'The stone trough',
      done: Boolean(flags.trough),
      status: flags.trough ? 'Dug' : 'Not dug',
      unlocks: 'The animals drink well below the spring.',
      hint: 'Dig a trough below the spring.',
    },
    {
      title: 'Cleared land',
      done: hof.land >= 1,
      status: `${hof.land} Morgen`,
      unlocks: 'Ground ready for next year’s seed.',
      hint: 'Clear a strip of the overgrown fields.',
    },
  ]
}
