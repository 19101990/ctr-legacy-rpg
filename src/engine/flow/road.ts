import type { BrotherId, GameState } from '../types'

export interface RoadMilestone {
  title: string
  reached(state: GameState): boolean
}

export const ROAD_MILESTONES: Record<
  BrotherId,
  readonly RoadMilestone[]
> = {
  andreas: [
    { title: 'A roof over the family', reached: (state) => state.hof.heim >= 1 },
    { title: 'A field cleared (2 Morgen)', reached: (state) => state.hof.land >= 2 },
    {
      title: 'Stores for a winter (5 or more)',
      reached: (state) => state.hof.korn >= 5,
    },
    {
      title: 'A working yard (House 2, or two improvements)',
      reached: (state) => state.hof.heim >= 2 || state.hof.builds.length >= 2,
    },
    {
      title: 'The plot on record in the ledger',
      reached: (state) =>
        Boolean(
          state.flags.plot_proof ||
            state.flags.pastor_vouches ||
            (state.ch >= 4 && state.hof.land >= 6),
        ),
    },
  ],
  henning: [
    {
      title: 'A pen so the animals are safe',
      reached: (state) => Boolean(state.flags.pen),
    },
    {
      title: 'Trust 2: a neighbour lets you mind his animals',
      reached: (state) => state.trust >= 2,
    },
    {
      title: 'Trust 4: the village knows your name',
      reached: (state) => state.trust >= 4,
    },
    {
      title: 'The council speaks of the herd',
      reached: (state) =>
        Boolean(state.flags.herder_promised || state.flags.herder_postponed),
    },
    {
      title: 'The horn is promised to you',
      reached: (state) => Boolean(state.flags.herder_promised),
    },
  ],
  casper: [
    {
      title: 'Know two neighbours by name (Relationship 1 with two)',
      reached: (state) =>
        ['kuhlmann', 'bode', 'pastor', 'carsten', 'grape', 'guldner', 'jost']
          .filter((neighbor) => (state.rel[neighbor] ?? 0) >= 1).length >= 2,
    },
    {
      title: 'Someone owes you a favour',
      reached: (state) =>
        state.hof.gunst >= 1 ||
        Boolean(
          state.flags.favour_kuhlmann ||
            state.flags.favour_bode ||
            state.flags.favour_pastor,
        ),
    },
    {
      title: 'You have heard of an estate that needs a man',
      reached: (state) => Boolean(state.flags.siemens_rumor),
    },
    {
      title: 'A foothold at the Siemens place',
      reached: (state) => Boolean(state.flags.siemens_foothold),
    },
    {
      title: 'A place of your own: buy in or marry into it',
      reached: (state) =>
        Boolean(
          state.flags.siemens_buyin ||
            state.flags.casper_betrothed ||
            state.flags.siemens_courtship,
        ),
    },
  ],
}
