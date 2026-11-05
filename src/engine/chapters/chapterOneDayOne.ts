import type { Attribute } from '../types'

export interface DayOneAction {
  id: string
  name: string
  location: string
  description: string
  attribute: Attribute
}

export const chapterOneDayOneActions: readonly DayOneAction[] = [
  {
    id: 'salvage-timber',
    name: 'Recover sound timber',
    location: 'The old plot',
    description: 'Sort usable beams and clay from the burned remains.',
    attribute: 'kraft',
  },
  {
    id: 'raise-shelter',
    name: 'Shape a weatherproof shelter',
    location: 'The old plot',
    description: 'Set a frame against the surviving stone sill.',
    attribute: 'geschick',
  },
  {
    id: 'weave-pen',
    name: 'Weave a stockade',
    location: 'The old plot',
    description: 'Gather stakes and weave a barrier for the animals.',
    attribute: 'geschick',
  },
  {
    id: 'clear-watercourse',
    name: 'Clear the watercourse',
    location: 'The spring',
    description: 'Trace the channel and remove what is blocking the flow.',
    attribute: 'verstand',
  },
  {
    id: 'cut-reeds',
    name: 'Cut reeds and willow',
    location: 'The meadow',
    description: 'Bring back thatching material and flexible withies.',
    attribute: 'geschick',
  },
  {
    id: 'gather-fallen-wood',
    name: 'Gather fallen wood',
    location: 'The forest edge',
    description: 'Search the sheltered ground for dry branches and kindling.',
    attribute: 'kraft',
  },
  {
    id: 'inspect-fields',
    name: 'Inspect the old fields',
    location: 'The fields',
    description: 'Look for a strip that can be cleared before the frost.',
    attribute: 'verstand',
  },
]
