import { getChapter, getNextChapter } from '../engine/chapters'
import type { GameState } from '../engine/types'
import { StoryText } from './common'

export function CompletionCard({
  state,
  onNextChapter,
  onRestart,
}: {
  state: GameState
  onNextChapter: () => void
  onRestart: () => void
}) {
  const chapter = getChapter(state.ch)
  const next = getNextChapter(state.ch)
  return (
    <section className="story-card completion-card">
      <p className="eyebrow"><span>Chapter {state.ch} complete</span></p>
      <h2>{chapter.ending.title}</h2>
      <StoryText text={chapter.ending.text} />
      <p>
        The household ends with {state.hof.korn} Stores, a House at step{' '}
        {state.hof.heim}, {state.hof.land} Morgen cleared, and Standing{' '}
        {state.hof.ansehen}.
      </p>
      {next ? (
        <button className="btn primary" onClick={onNextChapter}>
          On to Chapter {next.chapter}: {next.title}
        </button>
      ) : null}
      <button className="btn" onClick={onRestart}>
        Begin again
      </button>
    </section>
  )
}
