import type { GameState } from '../types'

export interface Goal {
  title: string
  done: boolean
  status: string
  kind?: 'must' | 'should' | 'nice'
  stake?: string
}

export function chapterOneGoals(state: GameState): Goal[] {
  return [
    {
      title: 'A roof over the family',
      done: state.hof.heim >= 1,
      status: `House ${state.hof.heim} of 1`,
    },
    {
      title: 'A pen before the wolves',
      done: Boolean(state.flags.pen),
      status: state.flags.pen ? 'Built' : 'Not built',
    },
    {
      title: 'At least 5 Stores on the last night',
      done: state.hof.korn >= 5,
      status: `${state.hof.korn} of 5 Stores`,
    },
    ...(state.flags.strangers_in
      ? [
          {
            title: 'Keep Meta’s family safe (a roof, 2 Stores)',
            done: state.hof.heim >= 1 && state.hof.korn >= 2,
            status: `House ${state.hof.heim}; ${state.hof.korn} Stores`,
          },
        ]
      : []),
    {
      title: 'Clear a Morgen for seed',
      done: state.hof.land >= 1,
      status: `${state.hof.land} Morgen`,
    },
    {
      title: 'Clear the spring',
      done: Boolean(state.flags.clean_spring),
      status: state.flags.clean_spring ? 'Clear' : 'Fouled',
    },
    {
      title: 'Earn a neighbour’s favour',
      done: (state.rel.kuhlmann ?? 0) >= 2 || (state.rel.bode ?? 0) >= 2,
      status: `Kuhlmann ${state.rel.kuhlmann ?? 0}; Bode ${state.rel.bode ?? 0}`,
    },
    {
      title: 'Reach Standing 2',
      done: state.hof.ansehen >= 2,
      status: `Standing ${state.hof.ansehen}`,
    },
  ]
}

export const CHAPTER_TWO_DAYS = 6

export function chapterTwoGoals(state: GameState): Goal[] {
  const daysLeft = Math.max(0, CHAPTER_TWO_DAYS - state.day + 1)
  const cows = state.hof.vieh.kuh
  const householdAtRisk = Boolean(state.flags.strangers_in) && !state.flags.child_lost
  return [
    {
      kind: 'must',
      title: 'Stores to the thaw (1 a day until Day 6)',
      done: state.hof.korn >= daysLeft,
      status: `${state.hof.korn} Stores, ${daysLeft} days left`,
      stake:
        'Supper costs 1 Store each evening (the cow and goats cover every second one). With an empty pot everyone is Hungry and loses 1 Stamina every night.',
    },
    {
      kind: 'must',
      title: 'Keep the cow alive',
      done: cows >= 1,
      status: `${cows} cow${cows === 1 ? '' : 's'}`,
      stake:
        'The cow’s milk covers every second supper. Lose her and the winter is a great deal shorter on food.',
    },
    ...(householdAtRisk
      ? [
          {
            kind: 'must' as const,
            title: 'Nobody in the house dies',
            done:
              !(state.flags.cough_lingers && !state.flags.fever_survived) &&
              !state.flags.child_died,
            status: '',
            stake:
              'Meta’s children, and the cough that has not quite gone. Warmth, food and the right choices on the night of the fever.',
          },
        ]
      : []),
    {
      kind: 'should',
      title: 'Answer a neighbour in need',
      done: Boolean(state.flags.shared_food || state.flags.helped_neighbour),
      status: '',
      stake:
        'Hunger makes the street watch what everyone else eats. What you do when someone knocks is remembered long after the snow.',
    },
    {
      kind: 'should',
      title: 'Be ready for what comes out of the forest',
      done: Boolean(state.flags.pen || state.flags.wolves_beaten),
      status: '',
      stake:
        'The wolves and the riders do not keep to the calendar. A pen, a watch, or a neighbour at your back is the difference.',
    },
    {
      kind: 'nice',
      title: 'Sit the vigil at the church once',
      done: Boolean(state.flags.sat_vigil),
      status: '',
      stake: 'Standing, and the pastor’s good opinion, and company in the cold.',
    },
  ]
}
