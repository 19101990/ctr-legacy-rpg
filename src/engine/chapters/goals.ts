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

export const CHAPTER_THREE_DAYS = 5

export function chapterThreeGoals(state: GameState): Goal[] {
  const kin = state.chars
  const learnedTrade = (['andreas', 'henning', 'casper'] as const).some((brother) =>
    kin[brother].kw.includes('apprentice'),
  )
  return [
    {
      kind: 'must',
      title: 'Heinrich counted among the farmers (3 Morgen and a roof)',
      done: state.hof.land >= 3 && state.hof.heim >= 1,
      status: `${state.hof.land} Morgen, House ${state.hof.heim}`,
      stake:
        'Otherwise the church vouches for him on credit: Standing minus 1 and a debt to the church.',
    },
    {
      kind: 'should',
      title: 'An honest count for the pastor’s list',
      done: Boolean(state.flags.honest_count),
      status: state.flags.honest_count
        ? 'done'
        : state.flags.embellished
          ? 'rounded up'
          : 'open',
      stake: 'Honest households are easy to write. Rounded numbers get noticed.',
    },
    {
      kind: 'should',
      title: 'Peace at the family table (the Sunday council)',
      done: Boolean(state.flags.brothers_peace),
      status: state.flags.brothers_peace
        ? 'peace'
        : state.flags.brothers_rift
          ? 'rift'
          : 'Day 3',
      stake: 'A silence between brothers carries into later chapters.',
    },
    {
      kind: 'nice',
      title: 'Learn the building trade from Uncle Andreas',
      done: learnedTrade,
      status: '',
      stake: 'A keyword that helps every building task.',
    },
    {
      kind: 'nice',
      title: 'Casper hears of an estate that needs a man',
      done: Boolean(state.flags.siemens_rumor),
      status: '',
      stake: 'The first step of Casper’s road.',
    },
    {
      kind: 'nice',
      title: 'Henning hears that the old herder’s hands are failing',
      done: Boolean(state.flags.herder_rumor),
      status: '',
      stake: 'The first step of Henning’s road.',
    },
  ]
}

export const CHAPTER_FOUR_DAYS = 5

export function chapterFourGoals(state: GameState): Goal[] {
  const knowsTheFox = (['andreas', 'henning', 'casper'] as const).some((brother) =>
    state.chars[brother].kw.includes('foxsecret'),
  )
  return [
    {
      kind: 'must',
      title: 'Decide what the clerk will see (an honest count, or a hidden herd)',
      done: Boolean(state.flags.honest_ledger || state.flags.hid_animals),
      status: '',
      stake:
        'The count is the count. A hidden cow can be found; an honest number cannot be called a lie.',
    },
    {
      kind: 'must',
      title: 'The word beside your name: get the pastor to vouch, or prove the plot',
      done: Boolean(state.flags.pastor_vouches || state.flags.plot_proof),
      status: state.flags.plot_proof
        ? 'plot on record'
        : state.flags.pastor_vouches
          ? 'pastor vouches'
          : 'open',
      stake:
        'Otherwise the clerk writes Einlieger (lodger) instead of Köthner (cottager), and the boundary is forgotten.',
    },
    {
      kind: 'should',
      title: 'Henning before the council: the herd’s future',
      done: Boolean(state.flags.herder_promised || state.flags.herder_postponed),
      status: `Trust ${state.trust}`,
      stake:
        'The council decides whose hand takes the horn. Henning’s road depends on it.',
    },
    {
      kind: 'should',
      title: 'The brothers at one table',
      done: Boolean(state.flags.clan_whole),
      status: state.flags.brothers_rift ? 'a rift still' : '',
      stake: 'The family stands together, or it stands in three places.',
    },
    {
      kind: 'nice',
      title: 'Learn the Fox’s secret',
      done: knowsTheFox,
      status: '',
      stake: 'The old boundary stone, and a friend.',
    },
  ]
}
