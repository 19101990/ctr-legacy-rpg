import { useState } from 'react'
import './App.css'
import { ITEMS, KEYWORDS } from './engine/definitions'
import {
  resolveCost,
  resolveContentText,
  type ActionContent,
  type Cost,
  type SectionContent,
} from './engine/content'
import {
  acceptPendingCheck,
  beginPlannedDay,
  canPlanAction,
  CHAPTER_ONE_DAYS,
  CHAPTER_ONE_HEADINGS,
  CHAPTER_ONE_ROAD_MILESTONES,
  chooseStoryChoice,
  continueEvening,
  continueResult,
  currentCheckDefinition,
  getAvailableActions,
  getVisibleChoices,
  interpolateBrotherName,
  rerollPendingCheck,
  rollPendingCheck,
  setPlan,
  startChapterOne,
  checkPool,
} from './engine/chapterOneFlow'
import { chapterOneActions } from './engine/chapters/chapterOneActions'
import {
  chapterOneEncounters,
  chapterOneScenes,
} from './engine/chapters/chapterOneScenes'
import { rivalBonus, tgt } from './engine/rules'
import { ATTRIBUTES, BROTHER_IDS } from './engine/types'
import type {
  Attribute,
  BrotherId,
  Chip,
  GameState,
} from './engine/types'

const BROTHER_NAMES: Record<BrotherId, string> = {
  andreas: 'Andreas',
  henning: 'Henning',
  casper: 'Casper',
}

const BROTHER_ARCS: Record<BrotherId, { arc: string; role: string; goal: string; blurb: string }> = {
  andreas: {
    arc: 'The Hof',
    role: 'The one who stays',
    goal: 'Rebuild the farm, then make it feed the family.',
    blurb: 'Broad in the shoulder, slow to speak, quick to dig. He thinks in seasons and boundary stones.',
  },
  henning: {
    arc: 'The Herd',
    role: 'The herder',
    goal: 'Earn the village’s trust and bring food home.',
    blurb: 'Quiet with people, easy with animals. He knows every cow by her temper and every Harz path by its smell.',
  },
  casper: {
    arc: 'The Name',
    role: 'The one who leaves',
    goal: 'Build connections and find a place of his own.',
    blurb: 'Quick, restless, funny when it counts. He can count a pile of grain and a room full of faces at the same glance.',
  },
}

const ATTRIBUTE_LABELS: Record<Attribute, string> = {
  kraft: 'Might',
  geschick: 'Hands',
  verstand: 'Wits',
  herz: 'Heart',
}

const ATTRIBUTE_DETAILS: Record<Attribute, string> = {
  kraft: 'Might and endurance',
  geschick: 'Hands and craft',
  verstand: 'Wits and lore',
  herz: 'People and animals',
}

const ATTRIBUTE_ORDER: readonly Attribute[] = ATTRIBUTES
const ATTRIBUTE_MAX = 6
const STAMINA_MAX = 11
const BROTHER_COLORS: Record<BrotherId, string> = {
  andreas: 'brother-andreas',
  henning: 'brother-henning',
  casper: 'brother-casper',
}

type AppTab = 'story' | 'hof' | 'rules' | BrotherId

const LOCATIONS: Record<string, { name: string; description: string }> = {
  home: { name: 'Home', description: 'The hearth and the family’s shelter.' },
  plot: { name: 'The old plot', description: 'The burned house and its sill-stones.' },
  spring: { name: 'The spring', description: 'Steinborn Spring and its channel.' },
  meadow: { name: 'The meadow', description: 'Reeds, willow and the Schamlah.' },
  fields: { name: 'The fields', description: 'The overgrown strip beyond the plot.' },
  forest: { name: 'The forest edge', description: 'Old paths, game trails and timber.' },
  village: { name: 'The village', description: 'The church porch and the village street.' },
  kuhlmann: { name: 'The Kuhlmann yard', description: 'A neighbour with a barn, a horse and work.' },
  bode: { name: 'The Bode yard', description: 'Grain farmers who have returned home.' },
}

const LOCATION_ORDER = Object.keys(LOCATIONS)
const RESOURCE_LABELS = [
  ['korn', 'Stores'],
  ['baustoff', 'Materials'],
  ['kasse', 'Groschen'],
  ['heim', 'House'],
  ['land', 'Morgen'],
  ['ansehen', 'Standing'],
  ['gunst', 'Favours'],
] as const

function App() {
  const [game, setGame] = useState<GameState>(() =>
    startChapterOne(chapterOneScenes),
  )
  const [selectedBrother, setSelectedBrother] =
    useState<BrotherId>('andreas')
  const [activeTab, setActiveTab] = useState<AppTab>('story')

  const section = game.sec ? chapterOneScenes[game.sec] : undefined
  const sectionText = section ? resolveContentText(section.text, game) : ''
  const choices =
    section && game.mode === 'scene'
      ? getVisibleChoices(game, section)
      : []
  const plannedCount = BROTHER_IDS.filter((brother) => game.plans[brother]).length
  const availableActions = getAvailableActions(
    game,
    selectedBrother,
    chapterOneActions,
  )
  const checkDefinition = currentCheckDefinition(
    game,
    chapterOneScenes,
    chapterOneActions,
  )
  const pool = checkDefinition ? checkPool(game, checkDefinition) : null
  const result = game.res

  function chooseAction(actionId: string) {
    setGame(setPlan(game, selectedBrother, actionId, chapterOneActions))
  }

  function chooseStory(index: number) {
    if (!game.sec) return
    setGame(
      chooseStoryChoice(
        game,
        game.sec,
        index,
        chapterOneScenes,
        chapterOneActions,
      ),
    )
  }

  function startDay() {
    setGame(beginPlannedDay(game, chapterOneActions))
  }

  function continueStoryResult() {
    setGame(
      continueResult(
        game,
        chapterOneActions,
        chapterOneScenes,
        chapterOneEncounters,
      ),
    )
  }

  function continueNight() {
    setGame(continueEvening(game, chapterOneScenes))
  }

  function spendExperience(
    brother: BrotherId,
    purchase: { kind: 'attribute'; attribute: Attribute } | { kind: 'stamina' | 'grit' },
  ) {
    setGame((current) => {
      const character = current.chars[brother]
      const attributeCost =
        purchase.kind === 'attribute'
          ? character.attrs[purchase.attribute] + 2
          : 0
      const cost =
        purchase.kind === 'attribute'
          ? attributeCost
          : purchase.kind === 'stamina'
            ? 5
            : 4
      if (character.xp < cost) return current
      if (purchase.kind === 'attribute' && character.attrs[purchase.attribute] >= ATTRIBUTE_MAX) return current
      if (purchase.kind === 'stamina' && character.stamMax >= STAMINA_MAX) return current
      if (purchase.kind === 'grit' && character.grit >= 4) return current

      const upgraded = { ...character, xp: character.xp - cost }
      if (purchase.kind === 'attribute') {
        upgraded.attrs = {
          ...character.attrs,
          [purchase.attribute]: character.attrs[purchase.attribute] + 1,
        }
      } else if (purchase.kind === 'stamina') {
        upgraded.stamMax = character.stamMax + 1
        upgraded.stam = Math.min(upgraded.stam + 1, upgraded.stamMax)
      } else {
        upgraded.grit = character.grit + 1
      }
      return {
        ...current,
        chars: { ...current.chars, [brother]: upgraded },
      }
    })
  }

  return (
    <main className="game-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">A family chronicle · Autumn 1648</p>
          <h1>Coming Home</h1>
        </div>
        <p className="day-marker">
          Chapter 1 · Day {Math.min(game.day, CHAPTER_ONE_DAYS)} of {CHAPTER_ONE_DAYS} · Autumn 1648
        </p>
      </header>

      <BrotherStatusStrip state={game} onSelect={(brother) => setActiveTab(brother)} />
      <nav className="app-tabs" role="tablist" aria-label="Game sections">
        {([
          ['story', 'Story'],
          ['hof', 'The Hof'],
          ['rules', 'Rules'],
          ...BROTHER_IDS.map((brother) => [brother, BROTHER_NAMES[brother]] as const),
        ] as const).map(([tab, label]) => (
          <button
            aria-selected={activeTab === tab}
            className={`app-tab${activeTab === tab ? ' active' : ''}${tab in BROTHER_COLORS ? ` ${BROTHER_COLORS[tab as BrotherId]}` : ''}`}
            key={tab}
            onClick={() => setActiveTab(tab)}
            role="tab"
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="game-main">
        {activeTab === 'story' ? (
          <>
          {game.mode === 'scene' && section ? (
            <StoryCard
              section={section}
              text={sectionText}
              choices={choices}
              state={game}
              onChoose={chooseStory}
            />
          ) : null}

          {game.mode === 'plan' ? (
            <PlanningCard
              state={game}
              selectedBrother={selectedBrother}
              availableActions={availableActions}
              assignedCount={plannedCount}
              onSelectBrother={setSelectedBrother}
              onChooseAction={chooseAction}
              onBegin={startDay}
            />
          ) : null}

          {game.mode === 'resolve' && result ? (
            <ResolutionCard
              state={game}
              result={result}
              checkDefinition={checkDefinition}
              pool={pool}
              onRoll={() =>
                setGame(
                  rollPendingCheck(
                    game,
                    chapterOneScenes,
                    chapterOneActions,
                  ),
                )
              }
              onAccept={() =>
                setGame(
                  acceptPendingCheck(
                    game,
                    chapterOneScenes,
                    chapterOneActions,
                  ),
                )
              }
              onReroll={() =>
                setGame(
                  rerollPendingCheck(
                    game,
                    chapterOneScenes,
                    chapterOneActions,
                  ),
                )
              }
              onContinue={continueStoryResult}
            />
          ) : null}

          {game.mode === 'evening' && game.evening ? (
            <EveningCard
              lines={game.evening.lines}
              chips={game.evening.chips}
              onContinue={continueNight}
            />
          ) : null}

          {game.mode === 'complete' ? (
            <CompletionCard state={game} onRestart={() => setGame(startChapterOne(chapterOneScenes))} />
          ) : null}

          {game.mode === 'plan' ? (
            <HouseholdList state={game} />
          ) : null}
          </>
        ) : null}
        {activeTab === 'hof' ? <HofTab state={game} /> : null}
        {activeTab === 'rules' ? <RulesTab /> : null}
        {BROTHER_IDS.includes(activeTab as BrotherId) ? (
          <BrotherSheet
            brother={activeTab as BrotherId}
            state={game}
            onSpend={spendExperience}
          />
        ) : null}
      </div>
    </main>
  )
}

function StoryCard({
  section,
  text,
  choices,
  state,
  onChoose,
}: {
  section: SectionContent
  text: string
  choices: SectionContent['choices']
  state: GameState
  onChoose: (index: number) => void
}) {
  const visibleChoices = choices ?? []
  return (
    <article className="story-card">
      <div className="story-meta">
        <p className="section-label">Chapter {section.chapter}</p>
        <span className={`source-tag source-${section.source}`}>
          {section.source === 'inv'
            ? 'Invented'
            : section.source === 'mix'
              ? 'Based on the records'
              : 'From the records'}
        </span>
      </div>
      <h2>{section.title}</h2>
      {section.title === 'Day 1' && state.day === 1 ? (
        <p className="day-heading">{CHAPTER_ONE_HEADINGS[state.day]}</p>
      ) : null}
      <StoryText text={text} />
      {state.chips.length > 0 ? <ChipList chips={state.chips} /> : null}
      {visibleChoices.length > 0 ? (
        <div className="story-choices">
          {visibleChoices.map((choice, index) => {
            const canAfford =
              !choice.cost ||
              canPay(
                gameStateForChoice(state, choice),
                resolveCost(choice.cost, gameStateForChoice(state, choice)),
              )
            return (
              <button
                className="primary-button"
                key={`${choice.text}-${index}`}
                disabled={!canAfford}
                onClick={() => onChoose(index)}
              >
                {choice.text}
              </button>
            )
          })}
        </div>
      ) : null}
    </article>
  )
}

function PlanningCard({
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
          <p className="section-label">Day {state.day} of {CHAPTER_ONE_DAYS}</p>
          <h2 id="planning-title">Set the household to work</h2>
        </div>
        <p className="plan-count" aria-live="polite">
          {assignedCount} of 3 plans chosen
        </p>
      </div>
      <p className="day-heading">{CHAPTER_ONE_HEADINGS[state.day]}</p>
      <p className="planning-intro">
        Choose one task for each brother. Work happens in brother order; costs,
        stamina and results carry through the whole chapter.
      </p>

      <div className="brother-tabs" aria-label="Choose a brother">
        {BROTHER_IDS.map((brother) => (
          <button
            aria-pressed={selectedBrother === brother}
            className={`brother-tab ${BROTHER_COLORS[brother]}${selectedBrother === brother ? ' selected' : ''}`}
            key={brother}
            onClick={() => onSelectBrother(brother)}
          >
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
                      chapterOneActions,
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
                        {action.check || action.contest || action.gate ? (
                          <span className="action-stat">
                            {ATTRIBUTE_LABELS[
                              (action.check ?? action.contest ?? action.gate)!.attr
                            ]}
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
          className="primary-button"
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

function ResolutionCard({
  state,
  result,
  checkDefinition,
  pool,
  onRoll,
  onAccept,
  onReroll,
  onContinue,
}: {
  state: GameState
  result: NonNullable<GameState['res']>
  checkDefinition: ReturnType<typeof currentCheckDefinition>
  pool: ReturnType<typeof checkPool> | null
  onRoll: () => void
  onAccept: () => void
  onReroll: () => void
  onContinue: () => void
}) {
  const final = result.final
  const brother = result.brother ?? state.lead
  const rolled = result.kind === 'check' ? result.rolled : null
  const pendingCheck = result.kind === 'check' && !final
  const description =
    result.act
      ? chapterOneActions.find((action) => action.id === result.act)?.name
      : result.sec
        ? result.sec
        : 'The day'

  return (
    <section className="result-card" aria-live="polite">
      <p className="section-label">
        {pendingCheck ? 'A risky moment' : result.kind === 'gate' ? 'Work at the gate' : 'The day’s outcome'}
      </p>
      <h2>{description}</h2>
      <p className="result-byline">
        {BROTHER_NAMES[brother]}
        {result.kind === 'gate' && result.final.gate
          ? ` · ${ATTRIBUTE_LABELS[result.final.gate.attr]} ${result.final.gate.info.eff} / ${result.final.gate.min}`
          : ''}
      </p>

      {result.kind === 'check' && checkDefinition && pool ? (
        <div className="check-panel">
          <div className="check-summary">
            <div>
              <span className="check-label">Attribute</span>
              <strong>{ATTRIBUTE_LABELS[checkDefinition.attr]} {pool.base}</strong>
            </div>
            <div>
              <span className="check-label">Items</span>
              <strong>{pool.ib > 0 ? `+${pool.ib}` : '—'}</strong>
            </div>
            <div>
              <span className="check-label">Keywords</span>
              <strong>{pool.helps.length > 0 ? `+${pool.helps.length}` : '—'}</strong>
            </div>
            <div>
              <span className="check-label">Penalty</span>
              <strong>{pool.pen > 0 ? `−${pool.pen}` : '—'}</strong>
            </div>
          </div>
          <p className="check-equation">
            Roll a d6 and add <strong>{pool.eff}</strong>
            {' · '}
            {checkChallenge(checkDefinition, state)}
          </p>
          {rolled ? (
            <p className={`roll-result${rolled.ok ? ' success' : ' failure'}`}>
              d6: {rolled.a} + {rolled.eff} = {rolled.total}
              {rolled.rival !== null
                ? ` · Rival: ${rolled.rival}`
                : ` · Target: ${rolled.target}`}
              {' · '}
              {rolled.ok ? 'Success' : 'Failure'}
              {rolled.shine ? ' · Shine! +1 XP' : ''}
              {rolled.mishap ? ' · Mishap: −1 Stamina' : ''}
              {result.kind === 'check' && result.rerolled ? ' · Rerolled' : ''}
            </p>
          ) : null}
        </div>
      ) : null}

      {result.kind === 'check' && result.pre.length > 0 ? (
        <ChipList chips={result.pre} />
      ) : null}

      {final ? (
        <>
          {result.kind === 'gate' && result.final.gate ? (
            <p className={`gate-status${result.final.gate.info.meets ? ' success' : ' hard'}`}>
              {result.final.gate.info.meets
                ? 'The work is within reach.'
                : 'The work succeeds, but takes the hard way.'}
            </p>
          ) : null}
          {final.text ? <StoryText text={interpolateBrotherName(final.text, brother)} /> : null}
          {final.chips.length > 0 ? <ChipList chips={final.chips} /> : null}
        </>
      ) : null}

      <div className="result-actions">
        {pendingCheck && !rolled ? (
          <button className="primary-button" onClick={onRoll}>
            Roll the die
          </button>
        ) : null}
        {result.kind === 'check' && rolled && !final ? (
          <>
            <button className="secondary-button" onClick={onAccept}>
              Accept result
            </button>
            {!rolled.ok && !result.rerolled ? (
              <button
                className="primary-button"
                disabled={state.chars[brother].grit < 1}
                onClick={onReroll}
              >
                Spend 1 Grit and reroll
              </button>
            ) : null}
          </>
        ) : null}
        {final ? (
          <button className="primary-button" onClick={onContinue}>
            Continue
          </button>
        ) : null}
      </div>
    </section>
  )
}

function EveningCard({
  lines,
  chips,
  onContinue,
}: {
  lines: string[]
  chips: Chip[]
  onContinue: () => void
}) {
  return (
    <section className="story-card evening-card">
      <p className="section-label">At dusk</p>
      <h2>The household comes home</h2>
      <div className="evening-lines">
        {lines.map((line) => <p key={line}>{line}</p>)}
      </div>
      {chips.length > 0 ? <ChipList chips={chips} /> : null}
      <button className="primary-button" onClick={onContinue}>
        Continue
      </button>
    </section>
  )
}

function CompletionCard({
  state,
  onRestart,
}: {
  state: GameState
  onRestart: () => void
}) {
  return (
    <section className="story-card completion-card">
      <p className="section-label">Chapter 1 complete</p>
      <h2>The first frost has come</h2>
      <StoryText
        text={`The family has made it through the first seven days back in Lochtum. The next winter is beyond this chapter’s playable story.`}
      />
      <p>
        The household ends with {state.hof.korn} Stores, a House at step{' '}
        {state.hof.heim}, {state.hof.land} Morgen cleared, and Standing{' '}
        {state.hof.ansehen}.
      </p>
      <button className="secondary-button" onClick={onRestart}>
        Begin again
      </button>
    </section>
  )
}

function BrotherStatusStrip({
  state,
  onSelect,
}: {
  state: GameState
  onSelect: (brother: BrotherId) => void
}) {
  return (
    <section className="status-strip" aria-label="Household at a glance">
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
    </section>
  )
}

function StaminaDots({
  current,
  max,
  label,
}: {
  current: number
  max: number
  label: string
}) {
  return (
    <span className="stamina-dots" role="img" aria-label={label}>
      {Array.from({ length: max }, (_, index) => (
        <span
          aria-hidden="true"
          className={`stamina-dot${index < current ? ' filled' : ''}`}
          key={index}
        />
      ))}
    </span>
  )
}

function HofTab({ state }: { state: GameState }) {
  const storedItems = state.hof.store
  return (
    <>
      <HouseholdStatus state={state} />
      <section className="sidebar-card list-card">
        <p className="section-label">Seven days to frost</p>
        <h2>Heinrich’s list</h2>
        <ul className="goal-list">
          {getHofGoals(state).map((goal) => (
            <li className={goal.done ? 'complete' : ''} key={goal.title}>
              <span aria-hidden="true">{goal.done ? '✓' : '○'}</span>
              <span>{goal.title}<small>{goal.status}</small></span>
            </li>
          ))}
        </ul>
      </section>
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

function BrotherSheet({
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
  const milestones = CHAPTER_ONE_ROAD_MILESTONES[brother]
  return (
    <section className={`sheet-card ${BROTHER_COLORS[brother]}`}>
      <p className="section-label">{detail.arc} · character sheet</p>
      <div className="sheet-heading">
        <div>
          <h2>{BROTHER_NAMES[brother]}</h2>
          <p className="sheet-role">{detail.role}</p>
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
          const cost = value + 2
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
          disabled={character.stamMax >= STAMINA_MAX || character.xp < 5}
          onClick={() => onSpend(brother, { kind: 'stamina' })}
          type="button"
        >
          Stamina maximum +1 (5 XP)
        </button>
        <button
          className="upgrade-button"
          disabled={character.grit >= 4 || character.xp < 4}
          onClick={() => onSpend(brother, { kind: 'grit' })}
          type="button"
        >
          Grit +1 (4 XP)
        </button>
      </div>
    </section>
  )
}

function RulesTab() {
  return (
    <section className="rules-card">
      <p className="section-label">The household’s rules</p>
      <h2>How to play</h2>
      <p>Chapter 1 lasts seven days. Each day, choose one task for each brother; plans resolve in Andreas, Henning, Casper order.</p>
      <h3>Work and checks</h3>
      <ul>
        <li><strong>Ordinary work:</strong> the action’s description shows its costs and likely results. Physical effort may cost Stamina.</li>
        <li><strong>Checks:</strong> roll a d6 and add the brother’s relevant attribute, up to +2 from matching items, and up to two matching trait helps. Conditions can subtract up to 2.</li>
        <li><strong>Target checks:</strong> meet or exceed the target. A contest succeeds only by beating the rival; ties go to the rival.</li>
        <li><strong>Gates:</strong> these do not roll. Meet the displayed minimum for the easier result; otherwise the work may still succeed the hard way with different effects.</li>
        <li><strong>Natural rolls:</strong> a natural 6 grants Shine (+1 XP); a natural 1 causes a Stamina mishap. After a failed check, spend 1 Grit to reroll once.</li>
      </ul>
      <h3>Stamina, dusk, and growth</h3>
      <ul>
        <li>Stamina is shared across the chapter. Rest at the hearth restores 3 and removes Weary and Wounded.</li>
        <li>At dusk, meals consume Stores unless the animals provide supper. Shelter and food determine overnight recovery; hunger and cold can reduce Stamina.</li>
        <li>Brothers who work (rather than rest) gain 1 XP at dusk. Reaching a road checkpoint grants 2 XP once.</li>
        <li>Spend XP on a brother’s sheet: an attribute increase costs its current score +2; maximum Stamina costs 5 XP; Grit costs 4 XP.</li>
      </ul>
      <h3>Chapter goals</h3>
      <p>Heinrich’s list tracks the roof, animal pen, winter Stores, cleared land and spring, a neighbor’s favour, and the household’s Standing. The first frost closes Chapter 1; later years are outside this playable chapter.</p>
    </section>
  )
}

function HouseholdStatus({ state }: { state: GameState }) {
  return (
    <section className="sidebar-card">
      <p className="section-label">The Hof</p>
      <h2>Household</h2>
      <dl className="resource-list">
        {RESOURCE_LABELS.map(([key, label]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>{state.hof[key]}</dd>
          </div>
        ))}
        <div>
          <dt>Animals</dt>
          <dd>
            {state.hof.vieh.kuh} cow · {state.hof.vieh.ziege} goats ·{' '}
            {state.hof.vieh.huhn} hens
          </dd>
        </div>
      </dl>
      <div className="character-status">
        {BROTHER_IDS.map((brother) => (
          <div className={`character-row ${BROTHER_COLORS[brother]}`} key={brother}>
            <div className="character-heading">
              <strong>{BROTHER_NAMES[brother]}</strong>
              <span>
                <StaminaDots
                  current={state.chars[brother].stam}
                  max={state.chars[brother].stamMax}
                  label={`${BROTHER_NAMES[brother]} stamina`}
                />
                {state.chars[brother].stam}/{state.chars[brother].stamMax}
              </span>
            </div>
            <div className="character-detail">
              Grit {state.chars[brother].grit} · XP {state.chars[brother].xp}
            </div>
            <div className="character-keywords">
              {state.chars[brother].kw.length > 0
                ? state.chars[brother].kw.join(', ')
                : 'No conditions'}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function getHofGoals(state: GameState) {
  const list = [
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
      title: 'At least 3 Stores on the last night',
      done: state.hof.korn >= 3,
      status: `${state.hof.korn} of 3 Stores`,
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
  return list
}

function HouseholdList({ state }: { state: GameState }) {
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

function StoryText({ text }: { text: string }) {
  return (
    <div className="story-copy">
      {text
        .replaceAll('**', '')
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
    </div>
  )
}

function ChipList({ chips }: { chips: Chip[] }) {
  return (
    <div className="chip-list" aria-label="Changes">
      {chips.map((chip, index) => (
        <span className={`chip chip-${chip.k}`} key={`${chip.t}-${index}`}>
          {chip.t}
        </span>
      ))}
    </div>
  )
}

function canPay(state: GameState, cost: Cost): boolean {
  return Object.entries(cost).every(([key, amount]) => {
    const resource = key as 'korn' | 'kasse' | 'baustoff' | 'gunst'
    return state.hof[resource] >= (amount ?? 0)
  })
}

function checkChallenge(
  definition: NonNullable<ReturnType<typeof currentCheckDefinition>>,
  state: GameState,
): string {
  if ('rival' in definition) {
    const rival = typeof definition.rival === 'function'
      ? definition.rival(state)
      : definition.rival
    return `beat the rival’s d6 + ${rivalBonus(rival)}`
  }
  return `reach ${tgt(definition, state.ch)}`
}

function gameStateForChoice(
  state: GameState,
  choice: NonNullable<SectionContent['choices']>[number],
): GameState {
  return choice.as ? { ...state, lead: choice.as } : state
}

function actionName(actionId: string): string {
  return chapterOneActions.find((action) => action.id === actionId)?.name ?? actionId
}

export default App
