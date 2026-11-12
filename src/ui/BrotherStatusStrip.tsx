import { BROTHER_IDS } from '../engine/types'
import type { BrotherId, GameState } from '../engine/types'
import { BROTHER_NAMES, BROTHER_COLORS, STRIP_RESOURCES } from './constants'
import { StaminaDots } from './common'

export function BrotherStatusStrip({
  state,
  onSelect,
}: {
  state: GameState
  onSelect: (brother: BrotherId) => void
}) {
  return (
    <section className="status-strip" aria-label="Household at a glance">
      <div className="status-brothers">
        {BROTHER_IDS.map((brother) => {
          const character = state.chars[brother]
          return (
            <button
              className={`status-brother ${BROTHER_COLORS[brother]}`}
              key={brother}
              onClick={() => onSelect(brother)}
              type="button"
            >
              <span className="status-name">{BROTHER_NAMES[brother]}</span>
              <StaminaDots
                current={character.stam}
                max={character.stamMax}
                label={`${BROTHER_NAMES[brother]}: ${character.stam} of ${character.stamMax} stamina`}
              />
              <span className="status-numbers">
                {character.stam}/{character.stamMax} · {character.xp} XP
              </span>
            </button>
          )
        })}
      </div>
      {/* On wide screens the sidebar carries these figures. */}
      <div className="status-resources">
        {STRIP_RESOURCES.map(([key, label]) => (
          <div className="status-resource" key={key}>
            <span className="lab">{label}</span>
            <span className="val">{state.hof[key]}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
