import { resolveCost } from '../engine/content'
import type { ActionContent } from '../engine/content'
import { canPlanAction } from '../engine/flow'
import { actions as allActions, getChapter } from '../engine/chapters'
import { gmin } from '../engine/rules'
import { BROTHER_IDS } from '../engine/types'
import type { BrotherId, GameState } from '../engine/types'
import {
  BROTHER_NAMES,
  ATTRIBUTE_LABELS,
  BROTHER_COLORS,
  LOCATIONS,
  LOCATION_ORDER,
} from './constants'
import { canPay, actionName } from './helpers'
import { StaminaDots } from './common'

export function PlanningCard({
  state,
  selectedBrother,
  availableActions,
  assignedCount,
  onSelectBrother,
  onChooseAction,
  onBegin,
}: {
  state: GameState
  selectedBrother: BrotherId
  availableActions: ActionContent[]
  assignedCount: number
  onSelectBrother: (brother: BrotherId) => void
  onChooseAction: (actionId: string) => void
  onBegin: () => void
}) {
  const groupedActions = LOCATION_ORDER.flatMap((location) => {
    const actions = availableActions.filter(
      (action) => action.location === location,
    )
    return actions.length > 0 ? [{ location, actions }] : []
  })

  return (
    <section className="planning-card" aria-labelledby="planning-title">
      <div className="planning-heading">
        <div>
          <p className="section-label">Day {state.day} of {getChapter(state.ch).days}</p>
          <h2 id="planning-title">Set the household to work</h2>
        </div>
        <p className="plan-count" aria-live="polite">
          {assignedCount} of 3 plans chosen
        </p>
      </div>
      <p className="day-heading">{getChapter(state.ch).headings[state.day]}</p>
      <p className="planning-intro">
        Choose one task for each brother. Work happens in brother order; costs,
        stamina and results carry through the whole chapter.
      </p>

      <h3 className="sub">Today’s plans</h3>
      <div className="brother-tabs" aria-label="Choose a brother">
        {BROTHER_IDS.map((brother) => (
          <button
            aria-pressed={selectedBrother === brother}
            className={`brother-tab ${BROTHER_COLORS[brother]}${selectedBrother === brother ? ' selected' : ''}`}
            key={brother}
            onClick={() => onSelectBrother(brother)}
          >
            <span className="monogram" aria-hidden="true">
              {BROTHER_NAMES[brother][0]}
            </span>
            <span className="brother-tab-body">
              <span className="brother-tab-heading">
                <strong>{BROTHER_NAMES[brother]}</strong>
                <StaminaDots
                  current={state.chars[brother].stam}
                  max={state.chars[brother].stamMax}
                  label={`${BROTHER_NAMES[brother]} stamina`}
                />
              </span>
              <small>
                {state.plans[brother]
                  ? actionName(state.plans[brother]!)
                  : 'No plan chosen'}
                {state.forced[brother] ? ' · must rest' : ''}
              </small>
            </span>
          </button>
        ))}
      </div>

      <h3>Available work for {BROTHER_NAMES[selectedBrother]}</h3>
      {groupedActions.length > 0 ? (
        <div className="location-list">
          {groupedActions.map(({ location, actions }) => (
            <section className="location-group" key={location}>
              <div className="location-heading">
                <h4>{LOCATIONS[location]?.name ?? location}</h4>
                <p>{LOCATIONS[location]?.description}</p>
              </div>
              <div className="action-list">
                {actions.map((action) => {
                  const chosen = state.plans[selectedBrother] === action.id
                  const canAfford =
                    !action.cost ||
                    canPay(
                      { ...state, lead: selectedBrother },
                      resolveCost(action.cost, {
                        ...state,
                        lead: selectedBrother,
                      }),
                    )
                  const canPlan =
                    !state.forced[selectedBrother] &&
                    canAfford &&
                    canPlanAction(
                      state,
                      selectedBrother,
                      action,
                      allActions,
                    )
                  return (
                    <button
                      aria-pressed={chosen}
                      className={`action-card${chosen ? ' selected' : ''}`}
                      disabled={!canPlan}
                      key={action.id}
                      onClick={() => onChooseAction(action.id)}
                    >
                      <span className="action-topline">
                        <span className="action-name">{action.name}</span>
                        {action.check || action.contest ? (
                          <span className="ctag risk">
                            Risky: {ATTRIBUTE_LABELS[(action.check ?? action.contest)!.attr]}
                          </span>
                        ) : action.gate ? (
                          <span className="ctag gate">
                            {ATTRIBUTE_LABELS[action.gate.attr]}
                            {gmin(action.gate, state.ch) > 2 ? ` ${gmin(action.gate, state.ch)}+` : ''}
                          </span>
                        ) : null}
                      </span>
                      <span className="action-description">
                        {action.description}
                      </span>
                      <span className="action-selection">
                        {chosen
                          ? 'Plan selected'
                          : canAfford
                            ? 'Choose this plan'
                            : 'Not enough resources'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="empty-note">
          No work is available for this brother today. Choose another brother
          or location.
        </p>
      )}

      <div className="plan-footer">
        <button
          className="btn primary"
          disabled={assignedCount !== BROTHER_IDS.length}
          onClick={onBegin}
        >
          Begin the day
        </button>
        <p className="small">
          {assignedCount} of 3 brothers have a plan
        </p>
      </div>
    </section>
  )
}
