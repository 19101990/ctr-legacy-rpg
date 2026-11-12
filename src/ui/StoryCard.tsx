import { resolveCost } from '../engine/content'
import type { SectionContent } from '../engine/content'
import { getChapter } from '../engine/chapters'
import type { GameState } from '../engine/types'
import { BROTHER_COLORS } from './constants'
import { costText, canPay, gameStateForChoice } from './helpers'
import { StoryText, ChipList, ChoiceTags } from './common'

export function StoryCard({
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
        <p className="day-heading">{getChapter(state.ch).headings[state.day]}</p>
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
