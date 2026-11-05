import type { SectionRegistry } from '../content'

export const chapterOneOpening = {
  '1.00': {
    chapter: 1,
    source: 'inv',
    title: 'The huts in the hills',
    log: 'Autumn 1648: the family leaves the Harz huts and returns to Lochtum.',
    text: `The smoke from the earth-hut hearth is thin, and so are you. For years the Brandes family has lived like foxes: a roofed hole in the Harz foothills, a cow hidden in a ravine, one sack of rye that must outlast the war. Tonight a drover with a limp walked into the clearing with news he could hardly believe himself. The peace has been signed. The armies are going home.

Heinrich Brandes, the Hausvater, lets the silence sit. Then he says what everyone is thinking. “The plot at the Kalter Brunnen is ours. If we wait for spring, someone else will have decided that it is theirs.”

Ilse, his wife, mends a sack with shaking hands. Her three sons look at their father. Andreas thinks only of the sill-stones and the black soil behind them. Henning counts the cow’s ribs and wonders how an animal so thin will walk so far. Casper is already talking himself onto the road and into whatever waits at its end.`,
    choices: [
      {
        text: 'Lead the family down at first light.',
        go: '1.01',
      },
    ],
  },
  '1.01': {
    chapter: 1,
    source: 'mix',
    title: 'Lochtum',
    text: `By noon you stand where the village was. The church is still there, scorched but roofed. The houses are black stumps, and the gardens between them are a sea of nettles. Here and there a thread of smoke rises, but you count three, no more.

The Kalter Brunnen runs. The spring is the reason the family lived at the edge of the village in the first place: clean, cold water out of the rock, the one thing the armies could not burn. Your plot lies between the street and the little stream, the Schamlah: a rectangle of charred posts and sill-stones under briars as high as your shoulder, with a long meadow stretching north behind it.

Heinrich puts his hand on the stone sill of the old house the way you would touch a horse. “Here,” he says. Then he counts on his fingers.

“Seven days to the frost. A roof, or we die of it. A pen for the animals, because the wolves have eaten the dead of thirty years and they have not forgotten the taste: they will come, and soon. Stores for the winter. Then the field, the spring, the neighbours, in that order. Each of you works alone by day and comes home by night. Bring home whatever the day gives you. And keep your eyes open. A war does not end on the day somebody signs it.”`,
    choices: [
      {
        text: 'Begin the first day.',
        go: '@plan',
      },
    ],
  },
} satisfies SectionRegistry
