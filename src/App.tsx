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
import { gmin, rivalBonus, tgt } from './engine/rules'
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

const INTRO_SECTION = '1.00'

const STRIP_RESOURCES = [
  ['korn', 'Stores'],
  ['baustoff', 'Materials'],
  ['kasse', 'Groschen'],
  ['heim', 'House'],
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
      <header className="mast">
        <h1>Coming Home</h1>
        <p className="tagline">
          Three brothers, one farm. Chapter 1 · Day {Math.min(game.day, CHAPTER_ONE_DAYS)} of {CHAPTER_ONE_DAYS} · Autumn 1648
        </p>
      </header>

      <BrotherStatusStrip state={game} onSelect={(brother) => setActiveTab(brother)} />
      <nav className="app-tabs" role="tablist" aria-label="Game sections">
        {([
          ['story', 'Story'],
          ['hof', 'The Hof'],
          ...BROTHER_IDS.map((brother) => [brother, BROTHER_NAMES[brother]] as const),
          ['rules', 'Rules'],
        ] as const).map(([tab, label]) => (
          <button
            aria-selected={activeTab === tab}
            className={`app-tab${activeTab === tab ? ' active' : ''}${tab === 'rules' ? ' app-tab-end' : ''}${tab in BROTHER_COLORS ? ` ${BROTHER_COLORS[tab as BrotherId]}` : ''}`}
            key={tab}
            onClick={() => setActiveTab(tab)}
            role="tab"
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="game-layout">
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
      <aside className="game-sidebar" aria-label="The Hof">
        <HofSidebar state={game} showBrothers={activeTab === 'hof'} />
      </aside>
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
      <div className="eyebrow">
        <span>Chapter {section.chapter} · 1648</span>
        <span className={`badge source-${section.source}`}>
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
        <div className="choices">
          {visibleChoices.map((choice, index) => {
            const choiceState = gameStateForChoice(state, choice)
            const cost = choice.cost ? resolveCost(choice.cost, choiceState) : null
            const canAfford = !cost || canPay(choiceState, cost)
            const costLabel = cost ? costText(cost) : ''
            return (
              <button
                className={`choice${choice.as ? ` ${BROTHER_COLORS[choice.as]}` : ''}`}
                key={`${choice.text}-${index}`}
                disabled={!canAfford}
                onClick={() => onChoose(index)}
              >
                <span className="choice-title">{choice.text}</span>
                <ChoiceTags choice={choice} costLabel={costLabel} chapter={state.ch} />
              </button>
            )
          })}
        </div>
      ) : null}
    </article>
  )
}

function ChoiceTags({
  choice,
  costLabel,
  chapter,
}: {
  choice: NonNullable<SectionContent['choices']>[number]
  costLabel: string
  chapter: number
}) {
  const roll = choice.check ?? choice.contest
  const gateMinimum = choice.gate ? gmin(choice.gate, chapter) : 0
  const hasTags = Boolean(choice.as || roll || gateMinimum > 2 || costLabel)
  if (!hasTags) return null
  return (
    <span className="cm">
      {choice.as ? (
        <span className={`ctag who ${BROTHER_COLORS[choice.as]}`}>{BROTHER_NAMES[choice.as]}</span>
      ) : null}
      {roll ? <span className="ctag risk">Risky: {ATTRIBUTE_LABELS[roll.attr]}</span> : null}
      {choice.gate && gateMinimum > 2 ? (
        <span className="ctag gate">
          {ATTRIBUTE_LABELS[choice.gate.attr]} {gateMinimum}+ needed
        </span>
      ) : null}
      {costLabel ? <span className="ctag cost">costs {costLabel}</span> : null}
    </span>
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
      <p className="eyebrow">
        <span>
          {pendingCheck ? 'A risky moment' : result.kind === 'gate' ? 'Work at the gate' : 'The day’s outcome'}
        </span>
        <span>Day {state.day}</span>
      </p>
      <h2>
        <span className={`monogram small-mono ${BROTHER_COLORS[brother]}`} aria-hidden="true">
          {BROTHER_NAMES[brother][0]}
        </span>{' '}
        {description}
      </h2>
      <p className="result-byline">
        {BROTHER_NAMES[brother]}
        {result.kind === 'gate' && result.final.gate
          ? ` · ${ATTRIBUTE_LABELS[result.final.gate.attr]} ${result.final.gate.info.eff} / ${result.final.gate.min}`
          : ''}
      </p>

      {result.kind === 'check' && checkDefinition && pool ? (
        <div className="check">
          <div className="check-h">
            <span>{checkDefinition.label ?? description}</span>
            <span className="hurdle">
              {'rival' in checkDefinition ? 'Contest' : `Target ${tgt(checkDefinition, state.ch)}`}
            </span>
          </div>
          <p className="sumline">
            Roll <b>d6</b> and add <span className="num">{pool.eff}</span>
            {' '}({ATTRIBUTE_LABELS[checkDefinition.attr]} {pool.base}
            {pool.ib > 0 ? `, items +${pool.ib}` : ''}
            {pool.helps.length > 0 ? `, traits +${pool.helps.length}` : ''}
            {pool.pen > 0 ? `, penalty −${pool.pen}` : ''}).
          </p>
          {rolled ? (
            <div className="rolled">
              <div className="dice-row">
                <span className="die best" aria-label={`Rolled ${rolled.a}`}>{rolled.a}</span>
                <span className="rv">+ {rolled.eff} = <b>{rolled.total}</b></span>
              </div>
              <p className={`result ${rolled.ok ? 'ok' : 'bad'}`}>
                {rolled.total}
                {rolled.rival !== null
                  ? ` against the rival’s ${rolled.rival}`
                  : ` against ${rolled.target}`}
                : <strong>{rolled.ok ? 'success' : 'failure'}</strong>
                {rolled.shine ? ' · Shine! (natural 6, +1 XP)' : ''}
                {rolled.mishap ? ' · Mishap (natural 1, −1 Stamina)' : ''}
                {result.kind === 'check' && result.rerolled ? ' · rerolled' : ''}
              </p>
            </div>
          ) : (
            <div className="check-foot">
              <span className="small">
                d6 + {pool.eff} must {checkChallenge(checkDefinition, state)}
                {'rival' in checkDefinition
                  ? '. Ties go to the rival.'
                  : `. Chance about ${checkChance(pool.eff, tgt(checkDefinition, state.ch))}%.`}
              </span>
              <button className="btn primary" onClick={onRoll}>
                Roll the die
              </button>
            </div>
          )}
        </div>
      ) : null}

      {result.kind === 'check' && result.pre.length > 0 ? (
        <ChipList chips={result.pre} />
      ) : null}

      {final ? (
        <div className="outcome">
          {result.kind === 'gate' && result.final.gate ? (
            <p className={`gateline${result.final.gate.info.meets ? '' : ' hard'}`}>
              {result.final.gate.info.meets
                ? 'The work is within reach.'
                : 'The work succeeds, but takes the hard way.'}
            </p>
          ) : null}
          {final.text ? <StoryText text={interpolateBrotherName(final.text, brother)} /> : null}
          {final.chips.length > 0 ? <ChipList chips={final.chips} /> : null}
          <button className="btn primary" onClick={onContinue}>
            Continue
          </button>
        </div>
      ) : null}

      {result.kind === 'check' && rolled && !final ? (
        <div className="btn-row">
          <button className="btn" onClick={onAccept}>
            Accept result
          </button>
          {!rolled.ok && !result.rerolled ? (
            <button
              className="btn primary"
              disabled={state.chars[brother].grit < 1}
              onClick={onReroll}
            >
              Spend 1 Grit and reroll
            </button>
          ) : null}
        </div>
      ) : null}
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
      <p className="eyebrow"><span>At dusk</span></p>
      <h2>The household comes home</h2>
      <ul className="evening-lines">
        {lines.map((line) => <li key={line}>{line}</li>)}
      </ul>
      {chips.length > 0 ? <ChipList chips={chips} /> : null}
      <button className="btn primary" onClick={onContinue}>
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
      <p className="eyebrow"><span>Chapter 1 complete</span></p>
      <h2>The first frost has come</h2>
      <StoryText
        text={`The family has made it through the first seven days back in Lochtum. The next winter is beyond this chapter’s playable story.`}
      />
      <p>
        The household ends with {state.hof.korn} Stores, a House at step{' '}
        {state.hof.heim}, {state.hof.land} Morgen cleared, and Standing{' '}
        {state.hof.ansehen}.
      </p>
      <button className="btn" onClick={onRestart}>
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

function HofSidebar({
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

function BrotherStats({ state }: { state: GameState }) {
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

function HofTab({ state }: { state: GameState }) {
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

function HeinrichList({ state }: { state: GameState }) {
  // Heinrich only draws up his list once the family is down from the Harz.
  if (state.sec === INTRO_SECTION) return null
  return (
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
  )
}

const HOUSE_STEPS = [
  'Ruin among the briars',
  'Roofed shelter',
  'Wattle-and-daub house',
  'House with stall and threshing floor',
]

function getImprovements(state: GameState) {
  const { hof, flags } = state
  return [
    {
      title: 'The house',
      done: hof.heim >= 1,
      status: HOUSE_STEPS[hof.heim] ?? `Step ${hof.heim}`,
      unlocks: hof.heim >= 3
        ? 'The finest house this chapter allows: a warm night restores the most Stamina.'
        : 'Brothers sleep dry. A fence and a further house step can now be built (3 Materials each step).',
      hint: 'Raise a roof or dig an earth-hut on the plot. Without one the nights are cold.',
    },
    {
      title: 'The animal pen',
      done: Boolean(flags.pen),
      status: flags.pen ? 'Built' : 'Not built',
      unlocks: 'Protects the animals when the wolves come at dusk.',
      hint: 'Build a pen of stakes and withies (1 Material).',
    },
    {
      title: 'The stout fence',
      done: Boolean(flags.fence),
      status: flags.fence ? 'Built' : 'Not built',
      unlocks: 'Wolves and thieves will think twice.',
      hint: 'Needs a roof first, then 2 Materials.',
    },
    {
      title: 'Steinborn Spring',
      done: Boolean(flags.clean_spring),
      status: flags.clean_spring ? 'Running clean' : 'Fouled with silt',
      unlocks: 'The neighbours noticed: Standing rose by 1.',
      hint: 'Trace the channel and clear it.',
    },
    {
      title: 'The stone trough',
      done: Boolean(flags.trough),
      status: flags.trough ? 'Dug' : 'Not dug',
      unlocks: 'The animals drink well below the spring.',
      hint: 'Dig a trough below the spring.',
    },
    {
      title: 'Cleared land',
      done: hof.land >= 1,
      status: `${hof.land} Morgen`,
      unlocks: 'Ground ready for next year’s seed.',
      hint: 'Clear a strip of the overgrown fields.',
    },
  ]
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

function HouseholdStatus({
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

function ResourceIcon({ name }: { name: string }) {
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
    <div className="chips" aria-label="Changes">
      {chips.map((chip, index) => (
        <span className={`chip ${chip.k}`} key={`${chip.t}-${index}`}>
          {chip.t}
        </span>
      ))}
    </div>
  )
}

const COST_LABELS: Record<keyof Cost, string> = {
  korn: 'Stores',
  kasse: 'Groschen',
  baustoff: 'Materials',
  gunst: 'Favours',
}

function costText(cost: Cost): string {
  return (Object.entries(cost) as [keyof Cost, number][])
    .filter(([, amount]) => amount > 0)
    .map(([key, amount]) => `${amount} ${COST_LABELS[key]}`)
    .join(', ')
}

function canPay(state: GameState, cost: Cost): boolean {
  return Object.entries(cost).every(([key, amount]) => {
    const resource = key as 'korn' | 'kasse' | 'baustoff' | 'gunst'
    return state.hof[resource] >= (amount ?? 0)
  })
}

function checkChance(modifier: number, target: number): number {
  const wins = [1, 2, 3, 4, 5, 6].filter((die) => die + modifier >= target).length
  return Math.round((wins / 6) * 100)
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
