import { ITEMS, KEYWORDS } from '../engine/definitions'
import { ROAD_MILESTONES } from '../engine/flow'
import type { Attribute, BrotherId, GameState } from '../engine/types'
import {
  BROTHER_NAMES,
  BROTHER_ARCS,
  ATTRIBUTE_LABELS,
  ATTRIBUTE_DETAILS,
  ATTRIBUTE_ORDER,
  BROTHER_COLORS,
} from './constants'
import {
  ATTRIBUTE_MAX,
  GRIT_COST,
  GRIT_MAX,
  STAMINA_COST,
  STAMINA_MAX,
  attributeCost,
} from '../engine/growth'
import { StaminaDots } from './common'

export function BrotherSheet({
  brother,
  state,
  onSpend,
}: {
  brother: BrotherId
  state: GameState
  onSpend: (
    brother: BrotherId,
    purchase: { kind: 'attribute'; attribute: Attribute } | { kind: 'stamina' | 'grit' },
  ) => void
}) {
  const character = state.chars[brother]
  const detail = BROTHER_ARCS[brother]
  const milestones = ROAD_MILESTONES[brother]
  return (
    <section className={`sheet-card ${BROTHER_COLORS[brother]}`}>
      <p className="section-label">{detail.arc} · character sheet</p>
      <div className="sheet-heading">
        <div className="sheet-title">
          <span className="monogram" aria-hidden="true">{BROTHER_NAMES[brother][0]}</span>
          <div>
            <h2>{BROTHER_NAMES[brother]}</h2>
            <p className="sheet-role">{detail.role}</p>
          </div>
        </div>
        <div className="sheet-vitals">
          <StaminaDots current={character.stam} max={character.stamMax} label={`${character.stam} of ${character.stamMax} stamina`} />
          <span>{character.stam} / {character.stamMax} Stamina</span>
          <span>{character.grit} Grit · {character.xp} XP</span>
        </div>
      </div>
      <p className="sheet-blurb">{detail.blurb} {detail.goal}</p>

      <h3 className="subheading">Attributes</h3>
      <div className="attribute-sheet">
        {ATTRIBUTE_ORDER.map((attribute) => {
          const itemBonus = Math.min(
            2,
            character.items.reduce(
              (sum, itemId) => sum + (ITEMS[itemId]?.b?.[attribute] ?? 0),
              0,
            ),
          )
          const value = character.attrs[attribute]
          const cost = attributeCost(value)
          return (
            <div className="attribute-row" key={attribute}>
              <div className="attribute-name">
                <strong>{ATTRIBUTE_LABELS[attribute]}</strong>
                <small>{ATTRIBUTE_DETAILS[attribute]}</small>
              </div>
              <span className="attribute-value">{value}</span>
              <span className="attribute-bonus">
                {itemBonus ? `+${itemBonus} gear` : 'No gear bonus'}
              </span>
              <button
                className="upgrade-button"
                disabled={value >= ATTRIBUTE_MAX || character.xp < cost}
                onClick={() => onSpend(brother, { kind: 'attribute', attribute })}
                type="button"
              >
                {value >= ATTRIBUTE_MAX ? 'At maximum' : `Raise (${cost} XP)`}
              </button>
            </div>
          )
        })}
      </div>
      <p className="small">
        Gear bonuses apply only to checks using that attribute. Each matching
        trait can help on relevant checks; at most two traits and +2 from items
        count. Conditions can penalize checks.
      </p>

      <h3 className="subheading">Traits and conditions</h3>
      {character.kw.length ? (
        <ul className="trait-list">
          {character.kw.map((keywordId) => {
            const keyword = KEYWORDS[keywordId]
            return (
              <li className={keyword?.bad ? 'condition' : ''} key={keywordId}>
                <strong>{keyword?.n ?? keywordId}</strong>
                <span>{keyword?.d ?? 'This trait may affect relevant checks.'}</span>
                {keyword?.tags?.length ? (
                  <small>Helps with: {keyword.tags.join(', ')}</small>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : <p className="empty-note">No traits or conditions.</p>}

      <h3 className="subheading">Items carried ({character.items.length} of 4)</h3>
      {character.items.length ? (
        <ul className="inventory-list">
          {character.items.map((itemId) => {
            const item = ITEMS[itemId]
            const bonuses = Object.entries(item?.b ?? {}).map(
              ([attribute, bonus]) =>
                `+${bonus} ${ATTRIBUTE_LABELS[attribute as Attribute]}`,
            )
            return (
              <li key={itemId}>
                <strong>{item?.n ?? itemId}</strong>
                <span>{item?.d ?? 'A useful possession.'}</span>
                {bonuses.length ? <small>{bonuses.join(' · ')}</small> : null}
              </li>
            )
          })}
        </ul>
      ) : <p className="empty-note">Nothing carried.</p>}

      <h3 className="subheading">Road checkpoints</h3>
      <ol className="checkpoint-list">
        {milestones.map((milestone, index) => (
          <li
            className={state.arcDone[`${brother}:${index}`] ? 'complete' : ''}
            key={milestone.title}
          >
            <span aria-hidden="true">
              {state.arcDone[`${brother}:${index}`] ? '✓' : '○'}
            </span>
            {milestone.title}
          </li>
        ))}
      </ol>

      <h3 className="subheading">Spend Experience</h3>
      <div className="growth-options">
        <p>Experience: <strong>{character.xp} XP</strong></p>
        <button
          className="upgrade-button"
          disabled={character.stamMax >= STAMINA_MAX || character.xp < STAMINA_COST}
          onClick={() => onSpend(brother, { kind: 'stamina' })}
          type="button"
        >
          Stamina maximum +1 ({STAMINA_COST} XP)
        </button>
        <button
          className="upgrade-button"
          disabled={character.grit >= GRIT_MAX || character.xp < GRIT_COST}
          onClick={() => onSpend(brother, { kind: 'grit' })}
          type="button"
        >
          Grit +1 ({GRIT_COST} XP)
        </button>
      </div>
    </section>
  )
}
