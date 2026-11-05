import type { Attribute } from './types'

interface KeywordDefinition {
  n: string
  tags?: string[]
  pen?: boolean
  bad?: boolean
}

interface ItemDefinition {
  n: string
  b?: Partial<Record<Attribute, number>>
}

export const KEYWORDS: Record<string, KeywordDefinition> = {
  harz: { n: 'Harz-born', tags: ['forest', 'hide', 'track', 'weather'] },
  plow: { n: 'Born to the plow', tags: ['field', 'land', 'grain'] },
  herder: { n: "Herder's eye", tags: ['animal', 'herd', 'wolf'] },
  hands: { n: 'Clever hands', tags: ['craft', 'repair', 'build'] },
  reader: { n: 'Counts and reads', tags: ['count', 'ledger', 'law'] },
  smooth: { n: 'Smooth tongue', tags: ['talk', 'trade', 'gossip'] },
  stubborn: { n: 'Stubborn as a boundary stone', tags: ['endure', 'argue', 'field'] },
  soldiers: { n: "Soldier's debt", tags: ['soldier', 'hide'] },
  apprentice: { n: "Master's apprentice", tags: ['build', 'craft', 'tower', 'carpentry', 'repair'] },
  gossip: { n: 'Good listener', tags: ['gossip', 'talk', 'count'] },
  foxsecret: { n: "The Fox's secret", tags: ['land', 'boundary', 'law'] },
  clan: { n: 'Clan ties', tags: ['kin', 'talk'] },
  hungry: { n: 'Hungry', pen: true, bad: true },
  weary: { n: 'Weary', pen: true, bad: true },
  wounded: { n: 'Wounded', pen: true, bad: true },
  feud: { n: 'Feud with the Königs', bad: true },
}

export const ITEMS: Record<string, ItemDefinition> = {
  axe: { n: 'Axe (Axt)', b: { kraft: 1 } },
  spade: { n: 'Spade (Spaten)', b: { kraft: 1 } },
  sickle: { n: 'Sickle (Sichel)', b: { geschick: 1 } },
  hoe: { n: 'Hoe (Hacke)', b: { kraft: 1 } },
  rope: { n: 'Hemp rope (Seil)', b: { geschick: 1 } },
  kerbholz: { n: 'Tally stick (Kerbholz)', b: { verstand: 1 } },
  pot: { n: 'Iron pot (Kessel)', b: { geschick: 1 } },
  knife: { n: "Soldier's knife", b: { kraft: 1 } },
  snares: { n: 'Snares (Schlingen)', b: { verstand: 1 } },
  lantern: { n: 'Horn lantern (Laterne)', b: { verstand: 1 } },
  chalkline: { n: 'Chalk line (Schnurschlag)', b: { geschick: 1 } },
  herdhorn: { n: 'Herding horn (Hirtenhorn)', b: { herz: 1 } },
  adze: { n: 'Adze (Dechsel)', b: { geschick: 1 } },
  scythe: { n: 'Scythe (Sense)', b: { kraft: 1 } },
  awl: { n: 'Awl and needle (Ahle)', b: { geschick: 1 } },
  psalter: { n: 'Psalter (Psalmbuch)', b: { verstand: 1 } },
  crook: { n: "Herder's crook (Hirtenstab)", b: { herz: 1 } },
  coat: { n: 'Good coat (Rock)', b: { herz: 1 } },
  whetstone: { n: 'Whetstone (Wetzstein)', b: { kraft: 1 } },
}

export const NPC_NAMES: Record<string, string> = {
  dege: 'Hans Degen',
  hartman: 'Hanß Hartman',
  pastor: 'The pastor',
  carsten: 'Master Carsten',
  grape: 'Christoph Grape',
  guldner: 'Andreas Güldner',
  jost: 'Jost Meier',
  anneke: 'Anneke and her children',
  heijer: 'Hans Heijer',
}
