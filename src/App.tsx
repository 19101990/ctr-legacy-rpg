import { useState } from 'react'
import './App.css'
import { resolveContentText } from './engine/content'
import { chapterOneOpening } from './engine/chapters/chapter1'
import { chapterOneDayOneActions } from './engine/chapters/chapterOneDayOne'
import { createInitialState } from './engine/state'
import { BROTHER_IDS } from './engine/types'
import type { Attribute, BrotherId, GameState } from './engine/types'

const BROTHER_NAMES: Record<BrotherId, string> = {
  andreas: 'Andreas',
  henning: 'Henning',
  casper: 'Casper',
}

const ATTRIBUTE_LABELS: Record<Attribute, string> = {
  kraft: 'Might',
  geschick: 'Hands',
  verstand: 'Wits',
  herz: 'Heart',
}

function App() {
  const [game, setGame] = useState<GameState>(() => {
    const initial = createInitialState()
    return { ...initial, mode: 'scene', sec: '1.00' }
  })
  const [selectedBrother, setSelectedBrother] =
    useState<BrotherId>('andreas')
  const section = game.sec ? chapterOneOpening[game.sec] : undefined
  const sectionText = section ? resolveContentText(section.text, game) : ''
  const assignedCount = BROTHER_IDS.filter((brother) => game.plans[brother]).length

  function followChoice(destination: string) {
    if (destination === '@plan') {
      setGame((current) => ({ ...current, mode: 'plan', sec: null }))
      return
    }

    setGame((current) => ({ ...current, mode: 'scene', sec: destination }))
  }

  function chooseAction(actionId: string) {
    setGame((current) => ({
      ...current,
      plans: { ...current.plans, [selectedBrother]: actionId },
    }))
  }

  return (
    <main className="game-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">A family chronicle · Autumn 1648</p>
          <h1>Coming Home</h1>
        </div>
        <p className="day-marker">Chapter 1 · Day 1 of 7</p>
      </header>
      {section && game.mode === 'scene' ? (
        <article className="story-card">
          <p className="section-label">Chapter 1</p>
          <h2>{section.title}</h2>
          <div className="story-copy">
            {sectionText
              .split('\n\n')
              .map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          {section.choices?.map((choice) => (
            <button
              className="primary-button"
              key={choice.text}
              onClick={() => choice.go && followChoice(choice.go)}
            >
              {choice.text}
            </button>
          ))}
        </article>
      ) : (
        <section className="planning-card" aria-labelledby="planning-title">
          <div className="planning-heading">
            <div>
              <p className="section-label">The first day</p>
              <h2 id="planning-title">Set the household to work</h2>
            </div>
            <p className="plan-count" aria-live="polite">
              {assignedCount} of 3 plans chosen
            </p>
          </div>
          <p className="planning-intro">
            Choose one task for each brother. These are plans for the day; their
            outcomes will be added in a later step.
          </p>

          <div className="brother-tabs" aria-label="Choose a brother">
            {BROTHER_IDS.map((brother) => (
              <button
                aria-pressed={selectedBrother === brother}
                className={`brother-tab${selectedBrother === brother ? ' selected' : ''}`}
                key={brother}
                onClick={() => setSelectedBrother(brother)}
              >
                <span>{BROTHER_NAMES[brother]}</span>
                <small>
                  {game.plans[brother]
                    ? chapterOneDayOneActions.find(
                        (action) => action.id === game.plans[brother],
                      )?.name
                    : 'No plan chosen'}
                </small>
              </button>
            ))}
          </div>

          <h3>Available work for {BROTHER_NAMES[selectedBrother]}</h3>
          <div className="action-list">
            {chapterOneDayOneActions.map((action) => {
              const isSelected = game.plans[selectedBrother] === action.id
              const attributeValue =
                game.chars[selectedBrother].attrs[action.attribute]
              return (
                <button
                  aria-pressed={isSelected}
                  className={`action-card${isSelected ? ' selected' : ''}`}
                  key={action.id}
                  onClick={() => chooseAction(action.id)}
                >
                  <span className="action-topline">
                    <span className="action-name">{action.name}</span>
                    <span className="action-stat">
                      {ATTRIBUTE_LABELS[action.attribute]} {attributeValue}
                    </span>
                  </span>
                  <span className="action-location">{action.location}</span>
                  <span className="action-description">{action.description}</span>
                  <span className="action-selection">
                    {isSelected ? 'Plan selected' : 'Choose this plan'}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}

export default App
