import type { Chip } from '../engine/types'
import { ChipList } from './common'

export function EveningCard({
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
