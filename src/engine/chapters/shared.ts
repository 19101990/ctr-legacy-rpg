import type { BrotherId, GameState } from '../types'

export const brotherNames: Record<BrotherId, string> = {
  andreas: 'Andreas',
  henning: 'Henning',
  casper: 'Casper',
}

export const roadSummary = (state: GameState): string =>
  (['andreas', 'henning', 'casper'] as const)
    .map((brother) => {
      const completed = Object.keys(state.arcDone).filter((key) =>
        key.startsWith(`${brother}:`),
      ).length
      return `**${brotherNames[brother]}**: ${completed} recorded steps.`
    })
    .join('\n\n')
