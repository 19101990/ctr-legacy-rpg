import type { Attribute } from './types'

interface KeywordDefinition {
  n: string
  d?: string
  tags?: string[]
  pen?: boolean
  bad?: boolean
}

interface ItemDefinition {
  n: string
  d?: string
  b?: Partial<Record<Attribute, number>>
}

export const KEYWORDS: Record<string, KeywordDefinition> = {
  harz: { n: 'Harz-born', d: 'You know the hidden paths, ravines and glades of the Harz.', tags: ['forest', 'hide', 'track', 'weather'] },
  plow: { n: 'Born to the plow', d: 'Soil, seed and the rhythm of the field are in your bones.', tags: ['field', 'land', 'grain'] },
  herder: { n: "Herder's eye", d: 'You read cattle, goats and wolves.', tags: ['animal', 'herd', 'wolf'] },
  hands: { n: 'Clever hands', d: 'You can fix, carve and fit almost anything.', tags: ['craft', 'repair', 'build'] },
  reader: { n: 'Counts and reads', d: 'Tallies, letters and legal phrases do not frighten you.', tags: ['count', 'ledger', 'law'] },
  smooth: { n: 'Smooth tongue', d: 'You can talk, trade and charm.', tags: ['talk', 'trade', 'gossip'] },
  stubborn: { n: 'Stubborn as a boundary stone', d: 'You endure, and you argue until the other side is tired.', tags: ['endure', 'argue', 'field'] },
  soldiers: { n: "Soldier's debt", d: 'A starving deserter owed you a secret, and paid it.', tags: ['soldier', 'hide'] },
  apprentice: { n: "Master's apprentice", d: 'Uncle Andreas taught you to set out a beam and trust a plumb line.', tags: ['build', 'craft', 'tower', 'carpentry', 'repair'] },
  gossip: { n: 'Good listener', d: 'People tell you things they did not mean to say.', tags: ['gossip', 'talk', 'count'] },
  foxsecret: { n: "The Fox's secret", d: 'You know where the old boundary of the plot really lies.', tags: ['land', 'boundary', 'law'] },
  clan: { n: 'Clan ties', d: 'Your kin stand behind you.', tags: ['kin', 'talk'] },
  hungry: { n: 'Hungry', d: 'Minus 1 to every result until the household eats well again.', pen: true, bad: true },
  weary: { n: 'Weary', d: 'Minus 1 to every result until you rest.', pen: true, bad: true },
  wounded: { n: 'Wounded', d: 'Minus 1 to every result until you rest.', pen: true, bad: true },
  feud: { n: 'Feud with the Königs', d: 'A proud noble family remembers who stood against it. Matters in later modules.', bad: true },
}

export const ITEMS: Record<string, ItemDefinition> = {
  axe: { n: 'Axe (Axt)', d: 'Heinrich’s axe, handle replaced twice.', b: { kraft: 1 } },
  spade: { n: 'Spade (Spaten)', d: 'Iron-shod; the iron is older than you are.', b: { kraft: 1 } },
  sickle: { n: 'Sickle (Sichel)', d: 'For grain and for hay.', b: { geschick: 1 } },
  hoe: { n: 'Hoe (Hacke)', d: 'A broad iron hoe from the forge.', b: { kraft: 1 } },
  rope: { n: 'Hemp rope (Seil)', d: 'Twenty arm-lengths of good rope.', b: { geschick: 1 } },
  kerbholz: { n: 'Tally stick (Kerbholz)', d: 'Notched hazel split in two: one half for the debtor, one for the creditor.', b: { verstand: 1 } },
  pot: { n: 'Iron pot (Kessel)', d: 'The one thing the soldiers did not take. It was too heavy.', b: { geschick: 1 } },
  knife: { n: "Soldier's knife", d: 'A long knife with a Swedish mark on the blade.', b: { kraft: 1 } },
  snares: { n: 'Snares (Schlingen)', d: 'Braided horsehair loops for hares.', b: { verstand: 1 } },
  lantern: { n: 'Horn lantern (Laterne)', d: 'A candle behind a thin sheet of horn.', b: { verstand: 1 } },
  chalkline: { n: 'Chalk line (Schnurschlag)', d: 'A cord and a lump of chalk: how a master sets out a beam.', b: { geschick: 1 } },
  herdhorn: { n: 'Herding horn (Hirtenhorn)', d: 'A cow-horn with a brass mouth, handed on by a herder.', b: { herz: 1 } },
  adze: { n: 'Adze (Dechsel)', d: 'A carpenter’s adze with a cracked haft, found in the ruin.', b: { geschick: 1 } },
  scythe: { n: 'Scythe (Sense)', d: 'Kuhlmann’s old scythe: the blade is good, the snath is new.', b: { kraft: 1 } },
  awl: { n: 'Awl and needle (Ahle)', d: 'For leather, harness and sacking.', b: { geschick: 1 } },
  psalter: { n: 'Psalter (Psalmbuch)', d: 'A thumbed psalter the pastor lent you to read from.', b: { verstand: 1 } },
  crook: { n: "Herder's crook (Hirtenstab)", d: 'A hazel crook you cut and bent yourself.', b: { herz: 1 } },
  coat: { n: 'Good coat (Rock)', d: 'A coat that makes people listen before you have said anything.', b: { herz: 1 } },
  whetstone: { n: 'Whetstone (Wetzstein)', d: 'A fine stone from the forge. Every blade is better for it.', b: { kraft: 1 } },
  pistol: { n: 'Wheel-lock pistol (Radschlosspistole)', d: 'A rider’s pistol, rusty, with half a spring. It still frightens people.', b: { kraft: 1 } },
  horn: { n: 'Rider’s brass horn (Messinghorn)', d: 'A battered cavalry horn, left on the sill-stone by a starving rider. It carries.', b: { herz: 1 } },
}

export const NPC_NAMES: Record<string, string> = {
  merten: 'Claus Merten',
  ehlers: 'Grete Ehlers',
  pastor: 'The pastor',
  carsten: 'Master Carsten',
  grape: 'Christoph Grape',
  guldner: 'Andreas Güldner',
  jost: 'Jost Meier',
  kuhlmann: 'Hans Kuhlmann',
  bode: 'Hanß Bode',
  meta: 'Meta and her children',
  koehler: 'Hans Köhler',
}
