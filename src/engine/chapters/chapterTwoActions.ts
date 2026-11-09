import type { ActionRegistry } from '../content'

// Winter work, available only in The Hungry Months. The general actions from
// chapterOneActions stay available in later chapters unless they name chapter 1.
export const chapterTwoActions: ActionRegistry = [
  {
    id: 'ice_fish',
    location: 'meadow',
    chapter: 2,
    name: 'Cut a hole in the Schamlah ice and fish',
    description: 'Stores +2',
    gate: {
      attr: 'geschick',
      min: 3,
      tags: ['water', 'craft', 'hunt'],
      label: 'Ice fishing',
      success: {
        text: '{n} chops a hole, lowers a line and a horsehair loop, and waits in the cold for the sort of fish that has not been in a hurry all winter. Two come, thin and silver.',
        effects: ['korn+2'],
      },
      hard: { effects: ['stam-2'] },
    },
  },
  {
    id: 'church_alms',
    location: 'village',
    chapter: 2,
    name: 'Ask the church for a measure from the alms',
    description: 'Stores +2. Needs Relationship 1 with the pastor. Once',
    once: true,
    condition: 'rel.pastor>=1',
    outcome: {
      text: 'The pastor opens the chest himself, counts out two measures into a sack, and writes your name in a very small hand in the book. “It will be remembered,” he says, “one way or the other.”',
      effects: ['korn+2', 'rel.pastor+1'],
    },
  },
  {
    id: 'sit_vigil',
    location: 'village',
    chapter: 2,
    name: 'Sit the night vigil at the church',
    description: 'Experience +1, standing. Once',
    once: true,
    outcome: {
      text: 'Six men and the pastor sit in the cold, in a ring of lanterns, passing a skin of weak beer. They speak of the war, in short sentences, and then not at all. By dawn {n} knows who his neighbours are, and who they were.',
      effects: ['xp+1', 'ansehen+1', 'rel.pastor+1', 'flag+sat_vigil'],
    },
  },
]
