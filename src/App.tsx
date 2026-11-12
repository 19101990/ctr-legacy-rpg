import { useState } from 'react'
import './App.css'
import { resolveContentText } from './engine/content'
import {
  acceptPendingCheck,
  beginPlannedDay,
  chooseStoryChoice,
  continueEvening,
  continueResult,
  currentCheckDefinition,
  getAvailableActions,
  getVisibleChoices,
  rerollPendingCheck,
  rollPendingCheck,
  setPlan,
  startNextChapter,
  checkPool,
} from './engine/chapterOneFlow'
import { BROTHER_IDS } from './engine/types'
import type { BrotherId } from './engine/types'
import {
  actions as allActions,
  encounters as allEncounters,
  getChapter,
  scenes as allScenes,
} from './engine/chapters'
import { spendExperience, type Purchase } from './engine/growth'
import { useGameStore } from './store/gameStore'
import { BROTHER_NAMES, BROTHER_COLORS } from './ui/constants'
import type { AppTab } from './ui/constants'
import { StoryCard } from './ui/StoryCard'
import { PlanningCard } from './ui/PlanningCard'
import { ResolutionCard } from './ui/ResolutionCard'
import { EveningCard } from './ui/EveningCard'
import { CompletionCard } from './ui/CompletionCard'
import { BrotherStatusStrip } from './ui/BrotherStatusStrip'
import { HofSidebar, HofTab } from './ui/HofPanels'
import { BrotherSheet } from './ui/BrotherSheet'
import { RulesTab } from './ui/RulesTab'
import { HouseholdList } from './ui/Household'
import { UpdatePrompt } from './ui/UpdatePrompt'

function App() {
  const game = useGameStore((store) => store.game)
  const setGame = useGameStore((store) => store.setGame)
  const restart = useGameStore((store) => store.restart)
  const [selectedBrother, setSelectedBrother] =
    useState<BrotherId>('andreas')
  const [activeTab, setActiveTab] = useState<AppTab>('story')

  const chapter = getChapter(game.ch)
  const section = game.sec ? allScenes[game.sec] : undefined
  const sectionText = section ? resolveContentText(section.text, game) : ''
  const choices =
    section && game.mode === 'scene'
      ? getVisibleChoices(game, section)
      : []
  const plannedCount = BROTHER_IDS.filter((brother) => game.plans[brother]).length
  const availableActions = getAvailableActions(
    game,
    selectedBrother,
    allActions,
  )
  const checkDefinition = currentCheckDefinition(
    game,
    allScenes,
    allActions,
  )
  const pool = checkDefinition ? checkPool(game, checkDefinition) : null
  const result = game.res

  function chooseAction(actionId: string) {
    setGame(setPlan(game, selectedBrother, actionId, allActions))
  }

  function chooseStory(index: number) {
    if (!game.sec) return
    setGame(
      chooseStoryChoice(
        game,
        game.sec,
        index,
        allScenes,
        allActions,
      ),
    )
  }

  function startDay() {
    setGame(beginPlannedDay(game, allActions))
  }

  function continueStoryResult() {
    setGame(
      continueResult(
        game,
        allActions,
        allScenes,
        allEncounters,
      ),
    )
  }

  function continueNight() {
    setGame(continueEvening(game, allScenes))
  }

  function newGame() {
    if (window.confirm('Start a new game? Your saved progress will be lost.')) {
      restart()
    }
  }

  function spendExperienceFor(brother: BrotherId, purchase: Purchase) {
    setGame((current) => spendExperience(current, brother, purchase))
  }

  return (
    <main className="game-shell">
      <header className="mast">
        <h1>Coming Home</h1>
        <p className="tagline">
          Three brothers, one farm. Chapter {game.ch} · Day {Math.min(game.day, chapter.days)} of {chapter.days} · {chapter.year}
        </p>
        <div className="save-note">
          <span>Saved in this browser as you play.</span>
          <button className="btn small" onClick={newGame} type="button">
            New game
          </button>
        </div>
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
                    allScenes,
                    allActions,
                  ),
                )
              }
              onAccept={() =>
                setGame(
                  acceptPendingCheck(
                    game,
                    allScenes,
                    allActions,
                  ),
                )
              }
              onReroll={() =>
                setGame(
                  rerollPendingCheck(
                    game,
                    allScenes,
                    allActions,
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
            <CompletionCard
              state={game}
              onNextChapter={() => setGame(startNextChapter(game, allScenes))}
              onRestart={restart}
            />
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
            onSpend={spendExperienceFor}
          />
        ) : null}
      </div>
      <aside className="game-sidebar" aria-label="The Hof">
        <HofSidebar state={game} showBrothers={activeTab === 'hof'} />
      </aside>
      </div>
      <UpdatePrompt />
    </main>
  )
}

export default App
