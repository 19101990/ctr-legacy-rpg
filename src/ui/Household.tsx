import { BROTHER_IDS } from '../engine/types'
import type { GameState } from '../engine/types'
import { BROTHER_NAMES, RESOURCE_LABELS } from './constants'
import { actionName } from './helpers'

export function HouseholdStatus({
  state,
  cells = false,
}: {
  state: GameState
  cells?: boolean
}) {
  return (
    <section className="sidebar-card">
      <p className="section-label">The Hof</p>
      <h2>Household</h2>
      <dl className={`resource-list${cells ? ' cells' : ''}`}>
        {RESOURCE_LABELS.map(([key, label]) => (
          <div key={key}>
            <dt><ResourceIcon name={key} />{label}</dt>
            <dd>{state.hof[key]}</dd>
          </div>
        ))}
        <div className="resource-wide">
          <dt><ResourceIcon name="animals" />Animals</dt>
          <dd>
            {state.hof.vieh.kuh} cow · {state.hof.vieh.ziege} goats ·{' '}
            {state.hof.vieh.huhn} hens
          </dd>
        </div>
      </dl>
    </section>
  )
}

// Single-colour line drawings, so they take the ink colour of the page.
const RESOURCE_ICONS: Record<string, string[]> = {
  korn: ['M8.5 6.5C7 9 5 11 5 15a7 7 0 0 0 14 0c0-4-2-6-3.5-8.5', 'M8.5 6.5h7', 'M9 6.5 7.5 4l4.5 1.2L16.5 4 15 6.5'],
  baustoff: ['M4 9.5a4 4 0 1 0 8 0 4 4 0 1 0-8 0', 'M12 9.5a4 4 0 1 0 8 0 4 4 0 1 0-8 0', 'M8 16.5a4 4 0 1 0 8 0 4 4 0 1 0-8 0'],
  kasse: ['M4 12a8 8 0 1 0 16 0 8 8 0 1 0-16 0', 'M9 12h6', 'M12 9v6'],
  heim: ['M3.5 11.5 12 5l8.5 6.5', 'M6 10.5V19h12v-8.5', 'M10 19v-5h4v5'],
  land: ['M3 7.5c3-2 6 2 9 0s6-2 9 0', 'M3 12.5c3-2 6 2 9 0s6-2 9 0', 'M3 17.5c3-2 6 2 9 0s6-2 9 0'],
  ansehen: ['M4 17.5 5 8l4 4 3-6 3 6 4-4 1 9.5z', 'M4 20.5h16'],
  gunst: ['M2.5 12a5.5 5.5 0 1 0 11 0 5.5 5.5 0 1 0-11 0', 'M10.5 12a5.5 5.5 0 1 0 11 0 5.5 5.5 0 1 0-11 0'],
  animals: ['M7 9c-2.5 0-4-1.5-4-3.5', 'M17 9c2.5 0 4-1.5 4-3.5', 'M7 9h10v5a5 5 0 0 1-10 0z', 'M10 14v1', 'M14 14v1'],
}

export function ResourceIcon({ name }: { name: string }) {
  return (
    <svg
      aria-hidden="true"
      className="resource-icon"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      {(RESOURCE_ICONS[name] ?? []).map((d) => <path d={d} key={d} />)}
    </svg>
  )
}

export function HouseholdList({ state }: { state: GameState }) {
  return (
    <section className="household-plans" aria-label="Today’s plans">
      <h3>Today’s plans</h3>
      <div>
        {BROTHER_IDS.map((brother) => (
          <span className="plan-summary" key={brother}>
            <strong>{BROTHER_NAMES[brother]}</strong>
            {state.plans[brother] ? actionName(state.plans[brother]!) : 'Choose a plan'}
          </span>
        ))}
      </div>
    </section>
  )
}
