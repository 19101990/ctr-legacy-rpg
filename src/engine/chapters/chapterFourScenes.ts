import type { SectionRegistry } from '../content'
import type { BrotherId, GameState } from '../types'
import { roadSummary } from './shared'

const roadSteps = (state: GameState, brother: BrotherId): number =>
  Object.keys(state.arcDone).filter((key) => key.startsWith(`${brother}:`)).length

/** What became of the household in the ten winters since the copper knob. */
function yearsLater(state: GameState): string {
  const lines = [
    'Ten winters have gone by since the knob. The brothers are men with callused hands and opinions.',
  ]
  const { flags } = state
  if (flags.honest_count) {
    lines.push('The schoolmaster who wrote you honestly in 1654 is dead. His list is in the tower, and so, in a way, are you.')
  }
  if (flags.embellished) {
    lines.push('The rounded numbers of 1654 were never quite forgotten. They have been used against you at three councils.')
  }
  if (flags.brothers_rift) {
    lines.push('The brothers speak at table and not otherwise.')
  }
  if (flags.brothers_peace) {
    lines.push('The brothers still eat at one table on Sundays.')
  }
  if (flags.siemens_foothold || flags.siemens_courtship) {
    lines.push('Casper is more often at the Siemens place than at his father’s table, and the village has stopped finding it strange.')
  }
  return lines.join('\n\n')
}

export const chapterFourScenes: SectionRegistry = {
  '4.00': {
    chapter: 4,
    source: 'mix',
    title: 'February, 1664',
    log: 'February 1664: the Amtsvogt came to count Lochtum.',
    // The household arrives in 1664 with at least a stall-and-yard, four Morgen and a little grain.
    effects: [
      (state) => {
        const effects: string[] = []
        if (state.hof.land < 4) effects.push('land=4')
        if (state.hof.heim < 2) effects.push('heim=2')
        if (state.hof.korn < 3) effects.push('korn=3')
        return effects
      },
    ],
    text: (state) => `Sixteen winters have passed since the first frost. Heinrich is old now, a tall man folded in half.

${yearsLater(state)}

The plot at Steinborn Spring has a roof, a stall and a yard. It is not yet a Hof in anyone’s mouth.

It has snowed since Candlemas. On the day it stops, the Amtsvogt Johann Baltzer will walk from Vienenburg toward Lochtum with his clerk, Herr Peter Lahman, and a ledger. The Amt has ordered a full description of the district: every household, every soul, every beast, every Morgen, every pledge, every lodger and every beggar. The pastor, Herr Georg Moß, who serves Vienenburg and Lochtum together, has told the village to be ready.

What word the clerk writes beside the name will be the word people use for the family for a generation. In the ledger the name Feldmann will be written three times, and nobody now knows which entry is whose. Maybe all three are kin. Maybe none of them is yours.

There are quarrels in the air as well. The Königs, a noble family with a manor and a bishop’s farm, have withdrawn their land from the village herd and from service to the Amt. The herder, Matthias Michael, is paid a little less every year. The council meets about it this week.`,
    choices: [{ text: 'Begin.', go: '@plan' }],
  },

  '4.e1': {
    chapter: 4,
    source: 'inv',
    title: 'Wolves in the deep snow',
    text: 'The herd is on the commons when the snow comes down again. The wolves come out of the trees behind it, grey on white, and for a long moment the whole village hears the cattle scream.',
    choices: [
      {
        text: 'Henning runs to the commons and drives the herd to cover.',
        as: 'henning',
        check: {
          attr: 'herz',
          h: 4,
          tags: ['wolf', 'animal', 'herd'],
          label: 'Save the herd',
          success: {
            text: 'Henning and a dozen others, with torches and sticks and noise. The herd is saved, thin and shaking. Matthias Michael takes his hand in both of his.',
            effects: ['ansehen+1', 'xp+1', 'stam-1', 'trust+2'],
            go: '@day',
          },
          failure: {
            text: 'A calf is lost, and the village sees it from the road.',
            effects: ['stam-1'],
            go: '@day',
          },
        },
      },
      {
        text: 'Stay home and guard your own animals.',
        outcome: {
          text: 'Your goats and hens are safe. The village herd is not, and everyone knows that the Feldmanns chose the nearer fire.',
          effects: ['ansehen-1'],
          go: '@day',
        },
      },
    ],
  },

  '4.16': {
    chapter: 4,
    source: 'inv',
    title: 'A birth in the house',
    text: `At midnight, in the snow, the old Bademutter, too lame to walk now and carried through the drifts on a chair by two neighbours, delivers a child in the Feldmann house. The parish books do not yet exist, so nobody will write it down.

Somewhere in these years, Michael Feldmann was born. His baptism is not recorded. In 1691 he will appear for the first time, as a father. Nobody knows whose son he was. Three theories are told in the family notes; here you may choose one, or none. This is the one place in the whole game where you are writing the family tree, not following it.`,
    choices: [
      {
        text: 'Name him Michael, the late son of Heinrich and Ilse (the brothers’ youngest brother).',
        outcome: {
          text: 'Heinrich, old as he is, holds the child in two enormous hands and says nothing. It is the first time anyone has seen him cry. (Invented. One of three theories.)',
          effects: ['flag+child_set', 'flag+michael_theory1'],
          log: 'A child named Michael was born in the house, the late son of Heinrich (theory 1; invented).',
          go: '@day',
        },
      },
      {
        text: 'Name him Michael, the son of Andreas.',
        outcome: {
          text: 'Andreas stands in the doorway with his hat in his hands. When he finally goes in, he does not come out for an hour. (Invented. One of three theories.)',
          effects: ['flag+child_set', 'flag+michael_theory2'],
          log: 'A child named Michael was born in the house, the son of Andreas (theory 2; invented).',
          go: '@day',
        },
      },
      {
        text: 'Name him Michael, the son of Henning.',
        outcome: {
          text: 'Henning cradles him as if he were a calf, which is the highest compliment he knows. (Invented. One of three theories.)',
          effects: ['flag+child_set', 'flag+michael_theory3'],
          log: 'A child named Michael was born in the house, the son of Henning (theory 3; invented).',
          go: '@day',
        },
      },
      {
        text: 'Leave the child unnamed in the story.',
        outcome: {
          text: 'A child cries in the dark; that is all the story knows. The books do not say, and for now neither will you.',
          effects: ['flag+child_set', 'flag+michael_unrecorded'],
          log: 'A child was born in the house; the story leaves his name and parents open.',
          go: '@day',
        },
      },
    ],
  },

  '4.15': {
    chapter: 4,
    source: 'inv',
    title: 'The brothers at the table',
    text: (state) => `Late in the week Casper walks in from the Siemens place with snow on his shoulders and a sack on his back. Henning has left the herd for the night. Ilse has made something that was once soup. For the first time in a long while the whole table is full: Heinrich at the head, Ilse beside him, three grown sons, the fire. Nobody says much for a while. The bread is passed. Somebody mentions the ledger.

${
  state.flags.brothers_rift
    ? 'The silence of the council night is still in the room. It sits between you like a fourth stool.'
    : state.flags.clan_promise
      ? 'The promise made so awkwardly years ago stands in the room like an old, loyal dog.'
      : 'The matter of the Hof, spoken once at this table, is not spoken of now.'
}`,
    choices: [
      {
        text: 'Andreas says the thing that needs saying.',
        as: 'andreas',
        check: {
          attr: 'herz',
          h: 4,
          tags: ['talk', 'kin'],
          label: 'Say it',
          success: {
            text: 'It is not eloquent. Heinrich puts a hand on the table; Ilse looks at the fire. By the end of the meal there is a plan: Andreas’s fields will feed Henning’s winter if the herd is lean; Henning’s herd will feed Andreas’s table if the field fails; Casper’s coin will go where it must.',
            effects: ['flag+clan_whole', 'flag-brothers_rift', 'all:xp+2', 'all:kw+clan'],
            log: 'The three brothers made peace around the table.',
            go: '@day',
          },
          failure: {
            text: 'He says half of it. It is enough to be remembered.',
            effects: ['all:xp+1'],
            go: '@day',
          },
        },
      },
      {
        text: 'Raise a cup of small beer to Heinrich and Ilse and leave the rest unsaid.',
        outcome: {
          text: 'The cups touch. Heinrich drinks first, then looks at his sons one by one as if counting them.',
          effects: ['all:xp+1', 'all:stam+1'],
          go: '@day',
        },
      },
    ],
  },

  '4.20': {
    chapter: 4,
    source: 'mix',
    title: 'The clerk’s pen',
    log: 'February 1664: the Amtsvogt’s clerk wrote down the household.',
    text: (state) => `Johann Baltzer is a heavy man in a short coat, stamping the snow off his boots at the edge of the yard. Peter Lahman, the clerk, has a satchel, a pencil, and an expression that has seen many yards. They have walked all morning. They would like to be somewhere warm.

“Name,” says Lahman. “Household. Beasts. Land. Lodgers. Debts.” He does not look up. Behind him Baltzer is looking at the roof, the wall and the cow-stall, adding something up in his head that is not on any list.

${state.flags.hid_animals ? 'Somewhere in the forest above the village, a cow is standing very still.' : ''}`,
    choices: [
      {
        text: 'Henning meets the clerk’s eye while a cow is somewhere in the forest.',
        condition: 'flag:hid_animals',
        as: 'henning',
        contest: {
          attr: 'herz',
          rival: 8,
          tags: ['talk', 'argue', 'hide'],
          label: 'Face the clerk',
          success: {
            text: 'He writes what he sees, and Henning lets him. The cow is in the glade, and the glade is quiet.',
            effects: [],
            go: '4.21',
          },
          failure: {
            text: 'Lahman looks at the snow, at the hoof-prints, at Henning. “How many cows,” he asks, “leave tracks that go up the hill and do not come back?” He writes the right number anyway. The village hears.',
            effects: ['ansehen-2', 'flag+caught_hiding'],
            go: '4.21',
          },
        },
      },
      {
        text: 'Let them count.',
        condition: '!flag:hid_animals',
        go: '4.21',
      },
    ],
  },

  '4.21': {
    chapter: 4,
    source: 'mix',
    title: 'The entry',
    effects: ['all:xp+3'],
    text: (state) => {
      const animals = state.hof.vieh
      const cows =
        state.flags.hid_animals && !state.flags.caught_hiding
          ? Math.max(0, animals.kuh - 1)
          : animals.kuh
      const mouths = 5 + (state.flags.child_set ? 1 : 0)
      const beasts: string[] = []
      if (cows) beasts.push(`${cows} ${cows === 1 ? 'cow' : 'cows'}`)
      if (animals.ziege) beasts.push(`${animals.ziege} ${animals.ziege === 1 ? 'goat' : 'goats'}`)
      if (animals.schwein) beasts.push(`${animals.schwein} ${animals.schwein === 1 ? 'pig' : 'pigs'}`)
      if (animals.schaf) beasts.push(`${animals.schaf} sheep`)
      if (animals.huhn) beasts.push(`${animals.huhn} ${animals.huhn === 1 ? 'hen' : 'hens'}`)
      const land = state.hof.land
      const label =
        land >= 12 ? 'Einlieger, with plenty of land' : land >= 6 ? 'Einlieger' : 'Köthner'
      const like =
        land >= 12
          ? 'Henri Feldmann, lodger, with wife, a son and a daughter, 14 Morgen, 2 horses and a cow'
          : land >= 6
            ? 'Andreas Feldmann, lodger, with 9 Morgen, owing half a Morgen to Andreas Weitzel for five Thaler'
            : 'Heinrich Feldmann, cottager, with wife and a maid, 3 Morgen, 3 cows, 2 pigs and a donkey'
      let text = `Lahman writes. You can read it upside down, which is the only way anyone in the village ever reads anything:\n\n**Feldmann. ${label}. ${mouths} mouths. ${land} Morgen. ${beasts.join(', ') || 'no beasts'}.**\n\nOf the three Feldmanns in the ledger, this one most resembles *${like}*. Maybe it is that one. Maybe it is somebody’s cousin. The ledger does not say, and neither do you.\n\n`
      if (state.flags.plot_proof) {
        text += 'Lahman adds a mark in the margin: the plot at Steinborn Spring is old, and on record. '
      }
      if (state.flags.pastor_vouches) text += 'He adds: *the pastor vouches.* '
      if (state.flags.debt_weitzel) text += 'Half a Morgen is noted as pledged. '
      if (state.flags.debt_heijer) text += 'Heijer’s name appears, small, at the foot. '
      text += '\n\nHeinrich watches the pencil. Whatever he thinks of the word he keeps behind his teeth.'
      return text
    },
    choices: [{ text: 'Walk the Amtsvogt to the gate.', go: '4.22' }],
  },

  '4.22': {
    chapter: 4,
    source: 'mix',
    title: 'Where the records pick up',
    text: (state) => {
      const { flags } = state
      let text = 'The Amtsvogt goes on to the next yard. The snow starts again. The three of you stand a while at the gate.\n\n'
      text += `**Henning.** ${
        flags.herder_promised
          ? 'The herder’s horn will be yours when Matthias puts it down, and the council has said so.'
          : 'The herder’s horn is not yet yours. But Matthias is old, the council has long memories, and by 1669 the records will have found you with the horn in your hand.'
      } (By 1669 to 1672 the parish books call a Henning Feldmann the village Kuhhirte.)\n\n`
      text += `**Casper.** ${
        flags.siemens_courtship
          ? 'The widow near the Siemens place has not stopped laughing at your jokes, and you have not stopped telling them.'
          : flags.siemens_foothold
            ? 'The Siemens roof is sound now, and you have stopped pretending it is for the barley.'
            : 'You will find the Siemens place in your own time, by your own road.'
      } By 1674 a Casper Feldmann will be written down as *sonst Siemens*: otherwise known as. A man who took the name of a farm.\n\n`
      text += '**Andreas.** The courtyard at Steinborn Spring is yours to keep, with its roof, its yard and its spring, and the weight of everything else. Somebody has to stay.\n\n'
      text += flags.michael_theory1
        ? 'The newest child, Michael, is Heinrich and Ilse’s last. '
        : flags.michael_theory2
          ? 'The newest child, Michael, is Andreas’s son and the Hof’s next heir. '
          : flags.michael_theory3
            ? 'The newest child, Michael, is Henning’s son, born at the edge of the herd. '
            : flags.michael_unrecorded
              ? 'A child was born that winter whose name the story does not tell. '
              : ''
      text += `\n\n**Where the roads ended.**\n\n${roadSummary(state)}\n\nA road that ends early still ends where the records say. What the road changes is the price, and how many of you arrive.`
      text += '\n\nIn four years the pastor will open a new leather-bound book and begin to write down every baptism in Lochtum. The Feldmann family will step out of silence into ink.'
      return text
    },
    choices: [{ text: 'The module is complete.', go: '4.30' }],
  },

  '4.30': {
    chapter: 4,
    source: 'mix',
    title: 'Evening in the courtyard',
    log: 'The end of Module 1: the family stands in the courtyard at Steinborn Spring.',
    text: (state) => {
      const { hof, flags } = state
      let text = 'February has not finished with Lochtum, but the light has turned. On the last evening the whole household stands in the courtyard at Steinborn Spring, and nobody can say who gathered them there.\n\n'
      text += `Sixteen winters ago this was a ring of black sill-stones in the nettles. ${
        hof.heim >= 3
          ? 'Now there is a house with a stall and a threshing floor, and smoke goes up from a chimney that was built, not wished for.'
          : hof.heim >= 2
            ? 'Now there is a house of beams and clay, with a thatch that Heinrich checks with his eyes every morning as other men check the weather.'
            : 'Now there is a roof, low and patched and entirely theirs.'
      } ${
        hof.land >= 8
          ? 'The strips in the open fields are cleared to the stones, and the neighbours have stopped calling them the Feldmann briars.'
          : hof.land >= 3
            ? 'The cleared strips are small, but they are in the ledger and they are growing.'
            : 'The fields are still mostly hope, but hope with a plow on it.'
      }\n\n`
      text += `Heinrich counts his sons without moving his lips, as he has done since they walked down out of the Harz. Ilse has her hands in her apron. ${
        flags.child_set
          ? 'In the doorway a young woman holds a child that was not here at harvest. The child has a name, and the name has already been argued over.'
          : 'The yard is quieter than it should be, and everyone knows it, and nobody says it.'
      }\n\n`
      const andreas = roadSteps(state, 'andreas')
      text += `**Andreas** stands nearest the house, as he always does. ${
        andreas >= 5
          ? 'The roof, the field, the stores, the yard and the line in the ledger are all his work, and he knows it, and he will not say so.'
          : andreas >= 3
            ? 'Most of what he promised in the first autumn has been done. What is left he can see from where he stands.'
            : 'There is more to do than he would like, and he has already started on it in his head.'
      }\n\n`
      text += `**Henning** is at the gate, with one hand on a post and one on the horn. ${
        flags.herder_promised
          ? 'The council has promised him the herd. The cows know the sound of his voice before the village does.'
          : flags.herder_postponed
            ? 'The council put him off until spring. The cows do not care what the council says, and neither, in the end, does he.'
            : 'The council has not decided, and he has stopped waiting for it to.'
      }\n\n`
      text += `**Casper** is the one who is half turned away, looking down the street toward the Brink. ${
        flags.siemens_buyin
          ? 'There is a farm beyond it with his name on a paper in Peter Lahman’s clerk’s hand. For the first time a Feldmann son has a door of his own.'
          : flags.casper_betrothed
            ? 'Beyond the Brink a widow is waiting for Easter and a handshake that has already been given.'
            : flags.siemens_foothold
              ? 'He has a ladder, a roof beam and a neighbour’s good opinion at the Siemens place. It is not a farm yet. It is not nothing.'
              : 'He does not yet know where he will end up. He knows, now, who would speak for him.'
      }\n\n`
      text += `${
        (state.rel.kuhlmann ?? 0) >= 2 || (state.rel.bode ?? 0) >= 2
          ? 'Over the hedge Kuhlmann and Bode have both found something to do within sight of the yard, which is how neighbours say they are glad.'
          : 'Over the hedge, nobody is watching, and nobody is far away.'
      } The pastor will write this winter into the register in his small tidy hand. Whatever he writes, the family will have lived it.\n\n`
      text += 'The records are quiet about what comes next. They say Henning will be Kuhhirte for a few years from 1669. They say a man called Casper, “sonst Siemens”, will be named in 1674. They say a house will be raised on this plot in 1766, and that its courtyard will stay where it is. Everything between those lines is still yours to decide.\n\n**End of Module 1.**'
      return text
    },
    choices: [{ text: 'Close the book.', go: '@complete' }],
  },
}

export const chapterFourDuskScenes = {
  2: '4.e1',
  4: '4.16',
  5: '4.15',
} as const satisfies Readonly<Record<number, keyof typeof chapterFourScenes>>

export const chapterFourClimaxScene = '4.20' as const

// Chapter 4 has no morning events: the days belong to the Amtsvogt's count.
export const chapterFourMorningEvents = [] as const satisfies readonly (keyof typeof chapterFourScenes)[]
