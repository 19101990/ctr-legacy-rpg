import type { SectionRegistry } from '../content'
import { applyEffects } from '../resolution'
import type { GameState } from '../types'
import { appendLog, recoverCollapsed } from './shared'

export function enterSection(
  state: GameState,
  sectionId: string,
  sections: SectionRegistry,
): GameState {
  const section = sections[sectionId]
  if (!section) throw new Error(`Missing section ${sectionId}`)
  let next: GameState = {
    ...state,
    mode: 'scene',
    sec: sectionId,
    res: null,
  }
  if (section.unlock?.length) {
    next = {
      ...next,
      unlocked: {
        ...next.unlocked,
        ...Object.fromEntries(section.unlock.map((location) => [location, 1 as const])),
      },
    }
  }
  const applied = applyEffects(next, section.effects)
  const recovered = recoverCollapsed(applied.state, applied.chips)
  next = { ...recovered.state, chips: recovered.chips }
  return appendLog(next, section.log)
}
