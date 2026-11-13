import { ATTRIBUTES } from '../engine/types'
import type { Attribute, BrotherId } from '../engine/types'

export const BROTHER_NAMES: Record<BrotherId, string> = {
  andreas: 'Andreas',
  henning: 'Henning',
  casper: 'Casper',
}

export const BROTHER_ARCS: Record<BrotherId, { arc: string; role: string; goal: string; blurb: string }> = {
  andreas: {
    arc: 'The Hof',
    role: 'The one who stays',
    goal: 'Rebuild the farm, then make it feed the family.',
    blurb: 'Broad in the shoulder, slow to speak, quick to dig. He thinks in seasons and boundary stones.',
  },
  henning: {
    arc: 'The Herd',
    role: 'The herder',
    goal: 'Earn the village’s trust and bring food home.',
    blurb: 'Quiet with people, easy with animals. He knows every cow by her temper and every Harz path by its smell.',
  },
  casper: {
    arc: 'The Name',
    role: 'The one who leaves',
    goal: 'Build connections and find a place of his own.',
    blurb: 'Quick, restless, funny when it counts. He can count a pile of grain and a room full of faces at the same glance.',
  },
}

export const ATTRIBUTE_LABELS: Record<Attribute, string> = {
  kraft: 'Might',
  geschick: 'Hands',
  verstand: 'Wits',
  herz: 'Heart',
}

export const ATTRIBUTE_DETAILS: Record<Attribute, string> = {
  kraft: 'Might and endurance',
  geschick: 'Hands and craft',
  verstand: 'Wits and lore',
  herz: 'People and animals',
}

export const ATTRIBUTE_ORDER: readonly Attribute[] = ATTRIBUTES



export const BROTHER_COLORS: Record<BrotherId, string> = {
  andreas: 'brother-andreas',
  henning: 'brother-henning',
  casper: 'brother-casper',
}

export type AppTab = 'story' | 'hof' | 'rules' | BrotherId

/** Ids that tie each tab to the panel it controls. */
export const tabId = (tab: AppTab) => `tab-${tab}`
export const PANEL_ID = 'main-content'

export const LOCATIONS: Record<string, { name: string; description: string }> = {
  home: { name: 'Home', description: 'The hearth and the family’s shelter.' },
  plot: { name: 'The old plot', description: 'The burned house and its sill-stones.' },
  spring: { name: 'The spring', description: 'Steinborn Spring and its channel.' },
  meadow: { name: 'The meadow', description: 'Reeds, willow and the Schamlah.' },
  fields: { name: 'The fields', description: 'The overgrown strip beyond the plot.' },
  forest: { name: 'The forest edge', description: 'Old paths, game trails and timber.' },
  village: { name: 'The village', description: 'The church porch and the village street.' },
  kuhlmann: { name: 'The Kuhlmann yard', description: 'A neighbour with a barn, a horse and work.' },
  bode: { name: 'The Bode yard', description: 'Grain farmers who have returned home.' },
  tower: { name: 'The church tower', description: 'The tower with its new cap and scaffold.' },
  smith: { name: 'The forge', description: 'Master Carsten’s forge.' },
  tavern: { name: 'Grape’s tavern', description: 'The only place with excise.' },
  sheepfold: { name: 'Güldner’s fold', description: 'The great flock.' },
  amtland: { name: 'The Amt land', description: 'Grey land where the plow is not used.' },
  siemens: { name: 'The Siemens place', description: 'Beyond the Brink: an empty farm.' },
  chapel: { name: 'The chapel', description: 'Where the poorest shelter.' },
}

export const LOCATION_ORDER = Object.keys(LOCATIONS)

export const RESOURCE_LABELS = [
  ['korn', 'Stores'],
  ['baustoff', 'Materials'],
  ['kasse', 'Groschen'],
  ['heim', 'House'],
  ['land', 'Morgen'],
  ['ansehen', 'Standing'],
  ['gunst', 'Favours'],
] as const

export const INTRO_SECTION = '1.00'

export const STRIP_RESOURCES = [
  ['korn', 'Stores'],
  ['baustoff', 'Materials'],
  ['kasse', 'Groschen'],
  ['heim', 'House'],
  ['ansehen', 'Standing'],
  ['gunst', 'Favours'],
] as const
