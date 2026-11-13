import { describe, expect, it } from 'vitest'
import { nextTab } from './helpers'

const order = ['story', 'hof', 'rules'] as const

describe('nextTab', () => {
  it('moves right and left, wrapping at the ends', () => {
    expect(nextTab(order, 'story', 'ArrowRight')).toBe('hof')
    expect(nextTab(order, 'rules', 'ArrowRight')).toBe('story')
    expect(nextTab(order, 'story', 'ArrowLeft')).toBe('rules')
    expect(nextTab(order, 'hof', 'ArrowLeft')).toBe('story')
  })

  it('jumps to the first and last tab', () => {
    expect(nextTab(order, 'hof', 'Home')).toBe('story')
    expect(nextTab(order, 'hof', 'End')).toBe('rules')
  })

  it('ignores other keys and unknown tabs', () => {
    expect(nextTab(order, 'hof', 'Enter')).toBeNull()
    expect(nextTab(order, 'nope' as never, 'ArrowRight')).toBeNull()
  })
})
