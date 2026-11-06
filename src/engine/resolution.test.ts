import { describe, expect, it } from 'vitest'
import { createInitialState } from './state'
import type { CheckContent, ContestContent, GateContent } from './content'
import { rollCheck, resolveCheck, resolveGate } from './resolution'

describe('content resolution', () => {
  it('resolves checks with targets, shine, and failure mishaps', () => {
    const state = createInitialState()
    state.lead = 'casper'
    state.chars.casper.attrs.verstand = 1
    state.chars.casper.kw = []
    state.chars.casper.items = []

    const check = {
      attr: 'verstand',
      h: 3,
      success: { text: 'Success.' },
      failure: { text: 'Failure.' },
      great: ['korn+1'],
    } satisfies CheckContent

    const shineRoll = rollCheck(state, check, () => 5 / 6)
    expect(shineRoll).toMatchObject({
      a: 6,
      total: 7,
      target: 6,
      ok: true,
      shine: true,
      mishap: false,
    })
    const success = resolveCheck(state, check, shineRoll)
    expect(success.state.hof.korn).toBe(4)
    expect(success.state.chars.casper.xp).toBe(1)
    expect(success.final.text).toBe('Success.')

    const mishapRoll = rollCheck(state, check, () => 0)
    expect(mishapRoll).toMatchObject({
      a: 1,
      total: 2,
      ok: false,
      shine: false,
      mishap: true,
    })
    const failure = resolveCheck(state, check, mishapRoll)
    expect(failure.state.chars.casper.stam).toBe(7)
    expect(failure.final.text).toBe('Failure.')
  })

  it('resolves contests with a rival die and requires a strict win', () => {
    const state = createInitialState()
    state.lead = 'casper'
    state.chars.casper.attrs.herz = 1
    state.chars.casper.kw = []
    state.chars.casper.items = []

    const contest = {
      attr: 'herz',
      rival: 4,
      success: { text: 'Won.' },
      failure: { text: 'Lost.' },
    } satisfies ContestContent

    const tiedRoll = rollCheck(state, contest, () => 0.5)
    expect(tiedRoll).toMatchObject({
      a: 4,
      total: 5,
      rival: 5,
      rbon: 1,
      ok: false,
    })
  })

  it('applies gate work even when the brother must do it the hard way', () => {
    const state = createInitialState()
    state.chars.andreas.attrs.geschick = 2
    state.chars.andreas.kw = []
    state.chars.andreas.items = []

    const gate = {
      attr: 'geschick',
      min: 3,
      success: { text: 'The shelter stands.', effects: ['heim+1'] },
      hard: { effects: ['stam-1'] },
    } satisfies GateContent

    const result = resolveGate(state, gate)
    expect(result.final.gate?.info.meets).toBe(false)
    expect(result.state.hof.heim).toBe(1)
    expect(result.state.chars.andreas.stam).toBe(7)
    expect(result.final.text).toContain('does it the hard way')
    expect(state.hof.heim).toBe(0)
  })
})
