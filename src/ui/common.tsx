import type { SectionContent } from '../engine/content'
import { gmin } from '../engine/rules'
import type { Chip } from '../engine/types'
import { BROTHER_NAMES, ATTRIBUTE_LABELS, BROTHER_COLORS } from './constants'

export function StoryText({ text }: { text: string }) {
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

export function ChipList({ chips }: { chips: Chip[] }) {
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

export function ChoiceTags({
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

export function StaminaDots({
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
