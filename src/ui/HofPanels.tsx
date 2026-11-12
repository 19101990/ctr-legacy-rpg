import { ITEMS, KEYWORDS } from '../engine/definitions'
import { getChapter } from '../engine/chapters'
import { BROTHER_IDS } from '../engine/types'
import type { GameState } from '../engine/types'
import {
  BROTHER_NAMES,
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ORDER,
  BROTHER_COLORS,
  LOCATIONS,
  LOCATION_ORDER,
  INTRO_SECTION,
} from './constants'
import { StaminaDots } from './common'
import { getImprovements } from './improvements'
import { HouseholdStatus } from './Household'

export function HofSidebar({
  state,
  showBrothers,
}: {
  state: GameState
  showBrothers: boolean
}) {
  // The Hof tab already shows the household and the list in full.
  if (showBrothers) return <BrotherStats state={state} />
  return (
    <>
      <HouseholdStatus state={state} />
      <HeinrichList state={state} />
    </>
  )
}

export function BrotherStats({ state }: { state: GameState }) {
  return (
    <section className="sidebar-card">
      <p className="section-label">The brothers</p>
      <h2>At a glance</h2>
      <div className="character-status">
        {BROTHER_IDS.map((brother) => {
          const character = state.chars[brother]
          return (
            <div className={`character-row ${BROTHER_COLORS[brother]}`} key={brother}>
              <div className="character-heading">
                <strong>{BROTHER_NAMES[brother]}</strong>
                <span>
                  <StaminaDots
                    current={character.stam}
                    max={character.stamMax}
                    label={`${BROTHER_NAMES[brother]} stamina`}
                  />
                  {character.stam}/{character.stamMax}
                </span>
              </div>
              <dl className="character-attributes">
                {ATTRIBUTE_ORDER.map((attribute) => (
                  <div key={attribute}>
                    <dt>{ATTRIBUTE_LABELS[attribute]}</dt>
                    <dd>{character.attrs[attribute]}</dd>
                  </div>
                ))}
              </dl>
              <div className="character-detail">
                Grit {character.grit} · XP {character.xp}
              </div>
              <div className="character-keywords">
                {character.kw.length > 0
                  ? character.kw.map((id) => KEYWORDS[id]?.n ?? id).join(', ')
                  : 'No traits or conditions'}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function HofTab({ state }: { state: GameState }) {
  const storedItems = state.hof.store
  const places = LOCATION_ORDER.filter(
    (location) => location !== 'home' && state.unlocked[location],
  )
  return (
    <>
      <HouseholdStatus cells state={state} />

      <section className="sidebar-card">
        <p className="section-label">What the family has built</p>
        <h2>Improvements</h2>
        <ul className="improvement-list cell-list">
          {getImprovements(state).map((improvement) => (
            <li className={improvement.done ? 'complete' : ''} key={improvement.title}>
              <span aria-hidden="true">{improvement.done ? '✓' : '○'}</span>
              <span>
                <strong>{improvement.title}</strong>
                <small>{improvement.status}</small>
                <small>{improvement.done ? improvement.unlocks : improvement.hint}</small>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="sidebar-card">
        <p className="section-label">Where the work can go</p>
        <h2>Places opened</h2>
        {places.length ? (
          <ul className="inventory-list cell-list">
            {places.map((location) => (
              <li key={location}>
                <strong>{LOCATIONS[location]?.name ?? location}</strong>
                <span>{LOCATIONS[location]?.description}</span>
              </li>
            ))}
          </ul>
        ) : <p className="empty-note">Only the hearth and the plot so far.</p>}
      </section>

      <HeinrichList state={state} />

      <section className="sidebar-card">
        <p className="section-label">The household chest</p>
        <h2>Stored items</h2>
        {storedItems.length ? (
          <ul className="inventory-list">
            {storedItems.map((itemId, index) => {
              const item = ITEMS[itemId]
              return (
                <li key={`${itemId}-${index}`}>
                  <strong>{item?.n ?? itemId}</strong>
                  <span>{item?.d ?? 'A useful household possession.'}</span>
                </li>
              )
            })}
          </ul>
        ) : <p className="empty-note">Nothing is stored in the chest.</p>}
      </section>
    </>
  )
}

export function HeinrichList({ state }: { state: GameState }) {
  // Heinrich only draws up his list once the family is down from the Harz.
  if (state.sec === INTRO_SECTION) return null
  const chapter = getChapter(state.ch)
  return (
    <section className="sidebar-card list-card">
      <p className="section-label">{chapter.goalsLabel}</p>
      <h2>Heinrich’s list</h2>
      <ul className="goal-list">
        {chapter.goals(state).map((goal) => (
          <li className={goal.done ? 'complete' : ''} key={goal.title}>
            <span aria-hidden="true">{goal.done ? '✓' : '○'}</span>
            <span>
              {goal.title}
              {goal.status ? <small>{goal.status}</small> : null}
              {goal.stake && !goal.done ? <small>{goal.stake}</small> : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
