import { currentCheckDefinition, interpolateBrotherName, checkPool } from '../engine/flow'
import { actions as allActions, scenes as allScenes } from '../engine/chapters'
import { tgt } from '../engine/rules'
import type { GameState } from '../engine/types'
import { BROTHER_NAMES, ATTRIBUTE_LABELS, BROTHER_COLORS } from './constants'
import { checkChance, checkChallenge } from './helpers'
import { StoryText, ChipList } from './common'

export function ResolutionCard({
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
      ? allActions.find((action) => action.id === result.act)?.name
      : result.sec
        ? allScenes[result.sec]?.title
        : undefined
  const heading = description ?? 'The day'

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
        {heading}
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
            <span>{checkDefinition.label ?? heading}</span>
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
                <span className="die best" role="img" aria-label={`Rolled ${rolled.a}`}>{rolled.a}</span>
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
