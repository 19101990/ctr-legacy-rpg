import { describe, expect, it } from 'vitest'
import {
  isAvailableInChapter,
  resolveContentText,
  resolveCost,
} from './content'
import { chapterOneOpening } from './chapters/chapter1'
import { chapterOneDayOneActions } from './chapters/chapterOneDayOne'
import { createInitialState } from './state'
import type {
  ActionContent,
  EncounterContent,
  SectionContent,
} from './content'

const openingSection = {
  chapter: 1,
  source: 'inv',
  title: 'The huts in the hills',
  text: (state) => `The family follows ${state.chars.andreas.notes || 'the road'}.`,
  choices: [
    {
      text: 'Lead the family down at first light.',
      go: '1.01',
    },
  ],
} satisfies SectionContent

const roofAction = {
  id: 'roof',
  location: 'plot',
  name: 'Raise a roof over the hearth',
  description: 'House 0 to 1. Costs 2 Materials',
  condition: 'heim<1',
  cost: { baustoff: 2 },
  gate: {
    attr: 'geschick',
    min: 3,
    tags: ['build', 'craft', 'repair', 'carpentry'],
    success: {
      text: (state) => `${state.lead} raises a roof.`,
      effects: ['heim+1', 'xp+1'],
    },
  },
} satisfies ActionContent

const deserterEncounter = {
  id: 'deserter',
  chapter: 1,
  location: 'forest',
  scene: '1.e_deserter',
} satisfies EncounterContent

describe('content schema helpers', () => {
  it('supports fixed and state-dependent text and costs', () => {
    const state = createInitialState()
    expect(resolveContentText(openingSection.text, state)).toContain('the road')
    expect(resolveContentText('A fixed line.', state)).toBe('A fixed line.')
    expect(resolveCost(roofAction.cost!, state)).toEqual({ baustoff: 2 })
    expect(resolveCost(() => ({ kasse: 3 }), state)).toEqual({ kasse: 3 })
  })

  it('supports single-chapter and multi-chapter availability', () => {
    expect(isAvailableInChapter(deserterEncounter.chapter, 1)).toBe(true)
    expect(isAvailableInChapter([1, 3], 3)).toBe(true)
    expect(isAvailableInChapter([1, 3], 2)).toBe(false)
    expect(isAvailableInChapter(undefined, 4)).toBe(true)
  })

  it('allows choices and checks to express the legacy flow in typed content', () => {
    expect(openingSection.choices?.[0].go).toBe('1.01')
    expect(roofAction.gate?.success.effects).toEqual(['heim+1', 'xp+1'])
  })
})

describe('Chapter 1 opening content', () => {
  it('ports the opening sections and their navigation destinations', () => {
    expect(Object.keys(chapterOneOpening)).toEqual(['1.00', '1.01'])
    expect(chapterOneOpening['1.00'].choices?.[0].go).toBe('1.01')
    expect(chapterOneOpening['1.01'].choices?.[0].go).toBe('@plan')
    expect(chapterOneOpening['1.00'].chapter).toBe(1)
    expect(chapterOneOpening['1.01'].chapter).toBe(1)
  })

  it('resolves state-dependent content text against the provided game state', () => {
    const state = createInitialState()
    const dynamicText = (current: typeof state) =>
      `${current.chars[current.lead].notes || 'The brothers'} reach the village.`

    state.chars.andreas.notes = 'Andreas and his brothers'
    expect(resolveContentText(dynamicText, state)).toBe(
      'Andreas and his brothers reach the village.',
    )
  })

  it('offers distinct first-day work at locations unlocked in the opening', () => {
    const actionIds = chapterOneDayOneActions.map((action) => action.id)
    const locations = new Set(
      chapterOneDayOneActions.map((action) => action.location),
    )

    expect(new Set(actionIds).size).toBe(actionIds.length)
    expect(chapterOneDayOneActions.length).toBeGreaterThanOrEqual(3)
    expect(locations.size).toBeGreaterThan(1)
  })
})
