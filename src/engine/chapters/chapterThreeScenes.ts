import type { SectionRegistry } from '../content'
import type { GameState } from '../types'
import { roadSummary } from './shared'

const trade = (
  state: GameState,
  words: { carpenter: string; wheelwright: string; smith: string },
): string =>
  state.flags.trade_carpenter
    ? words.carpenter
    : state.flags.trade_wheelwright
      ? words.wheelwright
      : words.smith

/** What became of the household in the six winters since the thaw. */
function yearsLater(state: GameState): string {
  const lines = [
    'Six winters have gone by since the thaw. You did not live through them one by one; you lived through them the way people do, in bad harvests, funerals and the odd good week.',
  ]
  const { flags } = state
  if (flags.matz_stays) {
    lines.push('Matz, the thin boy from the pen, is eighteen now and taller than Andreas. He drives the oxen and eats like a lord and has never once mentioned the night you caught him.')
  }
  if (flags.helped_fire) {
    lines.push('Bode’s boy married last Michaelmas and Bode gave a speech about the night of the fire. It was the longest sentence anyone had ever heard him say.')
  }
  if (flags.fire_ignored || flags.fire_thief) {
    lines.push('The Bode gate never quite opened. Bode nods in the street, the way a man nods at weather.')
  }
  if (flags.street_stood_together) {
    lines.push('The night the street stood at your gate is still told at weddings. The riders never came back.')
  }
  if (flags.fought_riders || flags.riders_know) {
    lines.push('In the spring of 1650 the man called Half-ear was hanged in Goslar for something he had probably done. Nobody in Lochtum wept.')
  }
  if (flags.saved_clerk) {
    lines.push('The clerk you pulled from the snow has risen in the Amt at Wöltingerode. He has not forgotten you, and has been careful about the way he shows it.')
  }
  if (flags.robbed_stranger) {
    lines.push('The pedlar’s coat is still on its nail. Nobody wears it.')
  }
  if (flags.child_lost || flags.child_died) {
    lines.push('Meta’s youngest lies in the churchyard. She has stayed, and she has not remarried.')
  } else if (flags.strangers_in) {
    lines.push('Meta married a widower in Vienenburg and writes a stiff letter every Easter.')
  }
  if (flags.looted_dead) {
    lines.push('Ilse never wore the blue beads. Neither did she ever ask where they came from.')
  }
  if (flags.buried_dead) {
    lines.push('The pastor still says a prayer for the family under the Schmidt barn on All Souls’, and he never fails to look at your pew.')
  }
  return lines.join('\n\n')
}

export const chapterThreeScenes: SectionRegistry = {
  '2.00': {
    chapter: 3,
    source: 'mix',
    title: 'The copper knob',
    log: '1654: the village raised a new copper knob on the church tower.',
    // The household arrives in 1654 with at least a roof, two Morgen and a little grain.
    effects: [
      (state) => {
        const effects: string[] = []
        if (state.hof.land < 2) effects.push('land=2')
        if (state.hof.heim < 1) effects.push('heim=1')
        if (state.hof.korn < 3) effects.push('korn=3')
        return effects
      },
    ],
    text: (state) => `${yearsLater(state)}

The spring still runs. The plot has a roof and a field, and Lochtum has a pastor and a sexton, an anvil that rings, a few barns that are full. The village is raising something to be remembered by.

The tower of the church was hit in the war and patched ever since. This autumn it gets a new cap and a new copper knob, round and bright as a second sun. In the old way a document will be sealed inside: a list of the people of Lochtum who are still alive, by name and by standing, so that whoever opens the knob in a hundred years will know that we were here.

Heinrich, who bends a little more each winter, means to be written among the farmers. “Not the cottagers, not the lodgers,” he says. “The farmers.” He does not mention that the harvests are thinner than he would like.

His brother Andreas Feldmann, whom you call Uncle, is a master of his craft, and the village has given him the raising of the tower cap. The records do not say which craft. You decide:`,
    choices: [
      {
        text: 'Uncle Andreas is a carpenter (Zimmermann), who raises the roofs of the village.',
        effects: ['flag+trade_carpenter'],
        log: 'Uncle Andreas, a master carpenter (invented), raised the tower cap.',
        go: '@plan',
      },
      {
        text: 'Uncle Andreas is a wheelwright (Radmacher), who makes wheels and hoists.',
        effects: ['flag+trade_wheelwright'],
        log: 'Uncle Andreas, a master wheelwright (invented), raised the tower cap.',
        go: '@plan',
      },
      {
        text: 'Uncle Andreas is a smith (Schmied), who forges the iron that holds it together.',
        effects: ['flag+trade_smith'],
        log: 'Uncle Andreas, a master smith (invented), raised the tower cap.',
        go: '@plan',
      },
    ],
  },

  '2.13': {
    chapter: 3,
    source: 'inv',
    title: 'The family council',
    text: `On Sunday night, after the pastor’s list has been discussed to death, Heinrich calls the household to the hearth. Ilse sits with her hands in her lap.

“I will say it once,” Heinrich says, “so that nobody can say they did not hear it. The farm goes to one of you. That is the law of the land, the Anerbenrecht, and it is also common sense: a field cut in three is three graves. The one who stays gives the others what the Hof can spare: a cow, a chest of linen, tools, a corner of the land for a hut. That is the Abfindung. It is never enough, and it is always more than the Hof can afford.”

“It will be Andreas,” he says, and looks at no one. He says it calmly, as if it had been decided long ago, which it had.

Andreas feels the weight land on him like a sack of wet grain. Henning expected it and it still hits him in the chest; his thoughts go to the cow, the hill pasture, and a horn he does not yet own. Casper laughs once, shortly, because the alternative is something else.`,
    choices: [
      {
        text: 'Andreas promises his brothers that the Hof will always stand behind them.',
        as: 'andreas',
        check: {
          attr: 'herz',
          h: 3,
          tags: ['talk', 'kin'],
          label: 'Make the promise',
          success: {
            text: 'Andreas says it awkwardly and means it. Henning looks at the fire. Casper, for once, does not make a joke.',
            effects: ['flag+brothers_peace', 'flag+clan_promise', 'xp+1'],
            log: 'Andreas was named to keep the Hof and promised his brothers its help.',
            go: '@day',
          },
          failure: {
            text: 'Andreas says it badly. It sounds like pity, and nobody likes to be pitied.',
            effects: ['flag+brothers_rift'],
            log: 'Andreas was named to keep the Hof; the brothers parted in silence.',
            go: '@day',
          },
        },
      },
      {
        text: 'Casper speaks for himself and Henning: they accept, and ask for a fair Abfindung.',
        as: 'casper',
        check: {
          attr: 'herz',
          h: 4,
          tags: ['talk', 'argue', 'kin'],
          label: 'Ask for a fair share',
          success: {
            text: 'Heinrich thinks about it for a long time. Then he nods once. “A cow’s worth of grain and a goat to start with. More when we can.” It is more than they hoped.',
            effects: ['kasse+3', 'flag+brothers_peace', 'xp+1'],
            log: 'The brothers accepted that Andreas would keep the Hof and negotiated their shares.',
            go: '@day',
          },
          failure: {
            text: 'Casper makes his case and his voice goes thin. Heinrich says it will be considered. Everyone knows what that means.',
            effects: ['flag+brothers_rift'],
            log: 'Andreas was named to keep the Hof; the brothers parted in silence.',
            go: '@day',
          },
        },
      },
      {
        text: 'Say nothing and go out into the cold.',
        outcome: {
          text: 'Outside the cold is honest. Somebody follows, eventually.',
          effects: ['flag+brothers_rift'],
          log: 'Andreas was named to keep the Hof; the brothers parted in silence.',
          go: '@day',
        },
      },
    ],
  },

  '2.e1': {
    chapter: 3,
    source: 'inv',
    title: 'Hail',
    text: 'The sky turns the colour of a bruise in ten minutes. Hail the size of walnuts hammers the cleared strip, the cow lows, and the hens run in circles.',
    choices: [
      {
        text: 'Andreas throws sacking over the seedlings.',
        as: 'andreas',
        check: {
          attr: 'kraft',
          h: 4,
          tags: ['field', 'endure'],
          label: 'Save the crop',
          success: {
            text: 'He and his brothers lie over the seed-bed like hens over eggs. When the storm is over, most of it is still green.',
            effects: ['xp+1'],
            go: '@day',
          },
          failure: {
            text: 'The hail takes a third of the crop and a piece of everyone’s temper.',
            effects: ['korn-1', 'stam-1'],
            go: '@day',
          },
        },
      },
      {
        text: 'Drive the animals into the lee of the house.',
        outcome: {
          text: 'The animals are safe. The strip is not. Ilse says it is a fair trade.',
          effects: ['korn-1'],
          go: '@day',
        },
      },
    ],
  },

  '2.e2': {
    chapter: 3,
    source: 'inv',
    title: 'The tinker',
    text: 'A tinker with a pack the size of a pig walks into the yard. He sells nails, needles, ribbons and rumours, in roughly that order of reliability.',
    choices: [
      {
        text: 'Henning buys a horn lantern (2 Groschen).',
        as: 'henning',
        cost: { kasse: 2 },
        outcome: {
          text: 'A candle behind a sheet of horn. The dark has just become a smaller problem.',
          effects: ['item+lantern'],
          go: '@day',
        },
      },
      {
        text: 'Henning buys braided snares (1 Groschen).',
        as: 'henning',
        cost: { kasse: 1 },
        outcome: {
          text: 'Horsehair snares, neatly looped. You will see if they are as good as he says.',
          effects: ['item+snares'],
          go: '@day',
        },
      },
      {
        text: 'Casper listens to the rumours.',
        as: 'casper',
        gate: {
          attr: 'verstand',
          min: 3,
          tags: ['gossip', 'talk', 'trade'],
          label: 'Sort the rumours',
          success: {
            text: 'Between the nonsense, a useful thing: the Amt is planning a full tax count in the next years. Everyone will be written down.',
            effects: ['xp+1'],
            go: '@day',
          },
          hard: {
            text: 'He says the pastor is a werewolf. Casper thanks him and he leaves.',
            effects: [],
            go: '@day',
          },
        },
      },
    ],
  },

  '2.20': {
    chapter: 3,
    source: 'mix',
    title: 'The list',
    log: '1654: Heinrich Feldmann was written among the farmers on the list sealed in the tower knob.',
    effects: [
      (state) =>
        state.hof.land >= 3 && state.hof.heim >= 1
          ? ['all:xp+2', 'ansehen+1']
          : ['all:xp+2', 'flag+church_debt', 'ansehen-1'],
    ],
    text: (state) => {
      const listed = state.hof.land >= 3 && state.hof.heim >= 1
      let text = `On the day of the raising the whole village stands below the tower, hats in hand, breath smoking. The cap goes up on ropes and a wheel, inch by inch, with ${trade(state, {
        carpenter: 'Uncle Andreas calling every move in a voice the size of the hill',
        wheelwright: 'the wheelwright’s drum creaking like a ship and Uncle Andreas calling every move',
        smith: 'the smith’s iron straps ringing like small bells and Uncle Andreas calling every move',
      })}. The copper knob follows, flashing in the October light. Inside it, rolled in oilcloth, is the list.\n\n`
      text += `The pastor reads it aloud before it goes up: the full farmers first, then the half-farmers, the cottagers, the lodgers, the tradesmen. Then the headings that matter to you: the “other farmers”, the Andere Bauernleute. And the masters: Die sind Meister.\n\n`
      text += listed
        ? `“Heinrich Feldmann.” He stands very straight. The field is cleared, the roof is dry, and nobody in the porch coughs. “Among the other farmers.” Ilse takes his arm. ${state.flags.honest_count ? 'The schoolmaster looks at the brothers and nods; his count was true.' : ''}\n\n`
        : `“Heinrich Feldmann.” The schoolmaster’s pencil stops. There is a murmur. The field is small and the roof is young. “Among the other farmers,” says the pastor firmly, “on the church’s word, until the field proves it.” It will cost something to be vouched for, and it will be remembered who vouched.\n\n`
      text += `And then: “Andreas Feldmann, among the masters.” Uncle Andreas does not look down from the scaffold. He has his hands on the rope.\n\nThe knob is bolted into place and the list goes into the sky, to wait.`
      text += `\n\n**Where the roads stand.**\n\n${roadSummary(state)}`
      return text
    },
    choices: [{ text: 'Go home and wait for the next winter.', go: '@complete' }],
  },

  '2.ev_peddler': {
    chapter: 3,
    source: 'inv',
    title: 'The peddler with the donkey',
    text: 'A peddler comes up the Steinborn Road leading a donkey that carries three baskets and an air of weary contempt. He is a Jew from Hildesheim, or a Walloon, or a Bohemian: his accent has been through all three. He sets out his wares on the sill-stones without being asked and does not smile.\n\n“I have what you need,” he says, “and I do not have what you want. That is the whole of trade.”',
    choices: [
      {
        text: 'Buy a chalk line for 2 Groschen.',
        cost: { kasse: 2 },
        condition: '!item:chalkline',
        outcome: {
          text: 'A cord, a lump of chalk, and a way of making a beam straight.',
          effects: ['item+chalkline'],
          go: '@plan',
        },
      },
      {
        text: 'Buy braided snares for 1 Groschen.',
        cost: { kasse: 1 },
        condition: '!item:snares',
        outcome: {
          text: 'Horsehair loops, expertly twisted. The peddler says they came from a man who no longer needs them.',
          effects: ['item+snares'],
          go: '@plan',
        },
      },
      {
        text: 'Haggle for the donkey’s best basket: the lantern.',
        as: 'casper',
        condition: '!item:lantern',
        check: {
          attr: 'herz',
          h: 5,
          tags: ['trade', 'talk'],
          label: 'Haggle',
          success: {
            text: 'Two Groschen would be robbery. For nothing it is generosity. For a story about the Landrat it is exactly right. The peddler laughs, once.',
            effects: ['item+lantern', 'xp+1'],
            go: '@plan',
          },
          failure: {
            text: 'The peddler’s smile is the thinnest smile Casper has ever seen. The lantern stays in the basket.',
            effects: [],
            go: '@plan',
          },
        },
      },
      {
        text: 'Ask him what he has heard on the road.',
        outcome: {
          text: 'The peddler talks for an hour. In Goslar the bishop is dying. In Brunswick they are hanging people for witchcraft. Nobody knows who will rule in ten years. He leaves with the donkey and an unreadable expression.',
          effects: ['xp+1'],
          go: '@plan',
        },
      },
    ],
  },

  '2.ev_scaffold': {
    chapter: 3,
    source: 'inv',
    title: 'A fall from the scaffold',
    text: 'The shout is from the tower. A figure is slipping on the scaffold, sixty feet up, with a hand on the rope that is not enough. It is one of Uncle Andreas’s journeymen, a boy called Jobst with a laugh like a trumpet. The scaffold sways. Below, a crowd stands in the road with its mouth open.\n\n**Someone has to move.**',
    choices: [
      {
        text: 'Andreas braces the rope below and takes the weight.',
        as: 'andreas',
        contest: {
          attr: 'kraft',
          rival: 6,
          rivalNote: 'The falling weight rolls d6 + 2.',
          tags: ['endure'],
          label: 'Take the rope',
          success: {
            text: 'The rope burns through his palms to the bone. The boy swings in, sobbing, and grabs the scaffold. Uncle Andreas climbs down his own ladder very slowly, looks at his nephew’s hands, and says nothing for the first time in his life.',
            effects: ['stam-1', 'xp+2', 'ansehen+2', 'flag+saved_apprentice'],
            go: '@plan',
          },
          failure: {
            text: 'The rope tears. Jobst falls, but the sacks of lime in the road break the fall and he lives. Andreas’s hands will take a month to heal.',
            effects: ['kw+wounded', 'xp+1', 'flag+saved_apprentice'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Casper runs up the ladder and talks the boy down.',
        as: 'casper',
        check: {
          attr: 'herz',
          h: 5,
          tags: ['talk'],
          label: 'Talk him down',
          success: {
            text: 'He talks all the way up the ladder, about nothing, a story about a goat. The boy’s knuckles go from white to pink and he lets go of the rope with one hand, then the other. They come down together.',
            effects: ['xp+2', 'ansehen+1', 'gunst+1', 'flag+saved_apprentice'],
            go: '@plan',
          },
          failure: {
            text: 'He reaches the boy. The boy lets go of the rope to grab Casper, and they both fall onto a sack of lime. Nothing is broken that cannot be mended.',
            effects: ['stam-2', 'ansehen+1', 'flag+saved_apprentice'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Watch. Nothing can be done from the ground.',
        outcome: {
          text: 'Somebody else catches him. It is nobody you know. Uncle Andreas does not look at you for the rest of the week.',
          effects: ['ansehen-1'],
          go: '@plan',
        },
      },
    ],
  },

  '2.ev_kin': {
    chapter: 3,
    source: 'inv',
    title: 'Whose coat is that?',
    condition: 'flag:robbed_stranger',
    text: 'A man in a good clerk’s coat stands at the sill-stones. He is not from the village. He has tired eyes, a very straight back and a letter in his hand. He is looking, with great politeness, at the coat that hangs on the nail by your door.\n\n“I am looking for my brother,” he says. “He left Goslar in the winter of ’48 and did not arrive. A pedlar said he was last seen on the forest road above Lochtum.” He lifts one eyebrow. “It is a good coat. I know the cloth.”',
    choices: [
      {
        text: 'Confess, give back the coat and the purse, and pay him for his trouble.',
        cost: { kasse: 3 },
        outcome: {
          text: 'He listens to the whole story in silence, looks at the coat for a long time, and takes it. “He was always careless,” he says at last. “You were hungry. I will not say it was right.” He leaves, and the nail is empty, and so is something else.',
          effects: ['flag-robbed_stranger', 'xp+2'],
          go: '@plan',
        },
      },
      {
        text: 'Deny everything: you bought the coat from a pedlar.',
        as: 'casper',
        check: {
          attr: 'herz',
          h: 6,
          tags: ['talk', 'law'],
          label: 'Brazen it out',
          success: {
            text: 'He looks at Casper for a long time. There is nothing in his face. Then he nods, folds the letter, and goes. Casper is never sure afterward whether he believed him.',
            effects: ['xp+1'],
            go: '@plan',
          },
          failure: {
            text: 'The man does not argue. He turns, walks to the pastor’s house, and knocks. The next Sunday the pastor preaches on Cain, and does not look at you, which is worse.',
            effects: ['ansehen-3', 'rel.pastor-2', 'flag+caught_thief'],
            go: '@plan',
          },
        },
      },
    ],
  },
}

export const chapterThreeDuskScenes = {
  2: '2.e2',
  3: '2.13',
  4: '2.e1',
} as const satisfies Readonly<Record<number, keyof typeof chapterThreeScenes>>

export const chapterThreeClimaxScene = '2.20' as const

export const chapterThreeMorningEvents = [
  '2.ev_peddler',
  '2.ev_scaffold',
  '2.ev_kin',
] as const satisfies readonly (keyof typeof chapterThreeScenes)[]
