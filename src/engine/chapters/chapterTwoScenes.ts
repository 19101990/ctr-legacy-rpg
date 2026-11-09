import type { SectionRegistry } from '../content'
import { roadSummary } from './shared'

export const chapterTwoScenes: SectionRegistry = {
  'w.00': {
    chapter: 2,
    source: 'inv',
    title: 'Midwinter',
    log: 'Midwinter 1648: the family went into the hungry months.',
    text: (state) => `Eight weeks after the first frost the snow is knee-deep on the sill-stones and the spring is the only thing in Lochtum that has not frozen. ${
      state.hof.heim >= 2
        ? 'The house is small and tight; the wind finds the gaps but not many.'
        : state.hof.heim >= 1
          ? 'The roof holds, mostly. A line of white along the north wall says where it does not.'
          : 'You have the earth-hut and the ruin and a great deal of hope.'
    } The cow gives half what she gave in autumn. ${
      state.hof.korn >= 5
        ? 'There are sacks in the corner, not full, but not empty.'
        : state.hof.korn >= 2
          ? 'There are two sacks in the corner and Ilse knows to the grain what is in each.'
          : 'There is a sack in the corner and a great silence about it.'
    }

${
  state.flags.strangers_in
    ? state.flags.child_lost
      ? 'Meta does not speak of her youngest. She carries water, splits kindling, and sleeps with her face to the wall.'
      : 'Meta and her children have not asked for anything, and have been given less than they should have been.'
    : ''
} ${
      state.flags.matz_stays
        ? 'Matz, the thin boy, sleeps by the hearth and eats like a man remembering how.'
        : ''
    }

The winter is where the village sorts itself out. The bell has rung for the dead twice in a week. Hunger makes people careful and careful people make mistakes. Somewhere beyond the forest, other people are hungrier than you.

**For six hard days, everything that happens, happens to you.** Heinrich’s list shows what you have to carry through. The rest is whatever comes.`,
    choices: [{ text: 'Begin.', go: '@plan' }],
  },

  'w.ev_wolves': {
    chapter: 2,
    source: 'inv',
    title: 'Wolves at the byre',
    text: (state) => `They come on the third hour past midnight, when the cold is worst. Not the three that Henning has seen at the forest edge, but a pack: nine, ten shapes, grey on grey, coming over the frozen Schamlah in a line. They have had nothing but the dead for three weeks and the dead are gone. The cow sets up a long, low moaning. Every animal on the plot knows what is coming.

${
  state.flags.pen
    ? 'The pen is there. It is not much, but it is a wall.'
    : 'There is no pen. There is a byre of hurdles and the hope that wolves are lazy.'
}

**Whoever is awake, decides.**`,
    choices: [
      {
        text: 'Henning calls them off with the herder’s horn and a lantern.',
        as: 'henning',
        check: {
          attr: 'herz',
          h: 6,
          tags: ['wolf', 'animal', 'herd'],
          label: 'Face the pack',
          success: {
            text: 'The lead wolf stands in the lantern light for a long moment. Then it turns, and the pack turns with it, without a sound. Henning does not move until the last grey shape is gone into the dark, and then he is sick in the snow.',
            effects: ['xp+2', 'trust+2', 'flag+wolves_beaten'],
            go: '@plan',
          },
          failure: {
            text: 'It works on four of them. The other six do not seem to have heard. A goat and the hens go over the hurdles, and Henning is left standing in the lantern light holding the horn.',
            effects: ['vieh.ziege-1', 'vieh.huhn-2', 'stam-2'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Andreas holds the byre door with the axe and a burning brand.',
        as: 'andreas',
        contest: {
          attr: 'kraft',
          rival: (state) => (state.flags.fence ? 5 : 7),
          rivalNote: 'The pack rolls d6 + 3 (d6 + 2 if the yard is fenced).',
          tags: ['defend', 'wolf'],
          label: 'Hold the byre',
          success: {
            text: 'He does not remember much of it afterwards except the heat on his face and the noise, and then, quite suddenly, silence. In the morning there are tracks all round the byre and one dead wolf in the snow with an axe wound across its shoulder.',
            effects: ['xp+2', 'ansehen+1', 'flag+wolves_beaten'],
            go: '@plan',
          },
          failure: {
            text: 'He holds the door. But the hurdles on the other side do not hold, and when the dust is down the cow is lying in the snow with her throat open.',
            effects: ['vieh.kuh-1', 'kw+wounded', 'stam-2'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Casper sets the Schamlah’s stinking old hay on fire at the gap and keeps the fire alive.',
        as: 'casper',
        check: {
          attr: 'verstand',
          h: 5,
          tags: ['forest', 'weather'],
          label: 'Fire at the gap',
          success: {
            text: 'A thin line of burning hay, an old Harz trick: wolves do not cross fire. It holds until dawn and costs him half the winter’s kindling. Nobody has lost anything.',
            effects: ['xp+1', 'stam-1', 'flag+wolves_beaten'],
            go: '@plan',
          },
          failure: {
            text: 'The hay is damp. It smokes and does not burn, and the pack is through in the smoke. One goat is gone and one hen is torn open in the snow.',
            effects: ['vieh.ziege-1', 'vieh.huhn-1'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Everyone stays indoors and prays.',
        outcome: {
          text: 'It is a very long night. In the morning there are tracks all round the byre and not one animal left alive in it except the cow, who has gone silent from terror.',
          effects: ['vieh.ziege-1', 'vieh.huhn-2', 'all:stam-1'],
          go: '@plan',
        },
      },
    ],
  },

  'w.ev_riders': {
    chapter: 2,
    source: 'inv',
    title: 'Half-ear returns',
    text: (state) => {
      if (state.flags.fought_riders || state.flags.riders_know) {
        return `They come at dusk in the swirling snow, and this time there are twelve. You know the man at the front by his ear: what is left of it. ${
          state.flags.fought_riders
            ? 'They have not forgotten the axe in the gap, and they have come to settle the matter.'
            : 'They have not forgotten the house that was weak.'
        } The street has already gone indoors. Doors close in a row, one after another, down the lane.

“Contribution,” says Half-ear. This time he is not smiling either.`
      }
      if (state.flags.paid_riders) {
        return `Half-ear comes with only four men this time, and the same smile. “A generous house,” he says. “We remembered.” It is a very polite sort of threat. “The Emperor’s peace is costly in January.”`
      }
      return `A single rider comes down the street in the snow. He is not the man you remember; he is younger and thinner, and he sits his horse like a man who has stopped caring. He has no gun. He dismounts at the sill-stones and says, in a voice cracked with cold: “I am from the men on the hill. They are starving. They say, a house that hides well can afford to share.”`
    },
    choices: [
      {
        text: 'Pay them: three measures of Stores.',
        as: 'andreas',
        cost: { korn: 3 },
        condition: (state) =>
          Boolean(state.flags.fought_riders || state.flags.riders_know || state.flags.paid_riders),
        outcome: {
          text: 'It is more than last time and less than they wanted. The men ride away into the snow and the street’s doors open again, a little at a time.',
          effects: ['flag+paid_riders_twice'],
          go: '@plan',
        },
      },
      {
        text: 'The neighbours stand with you: Kuhlmann and Bode come to the gate.',
        as: 'casper',
        condition: (state) =>
          Boolean(state.flags.fought_riders || state.flags.riders_know) &&
          (state.rel.kuhlmann || 0) >= 2 &&
          (state.rel.bode || 0) >= 1,
        outcome: {
          text: 'Casper has spent two months being useful to people. Now they come, one by one, with their sons and their axes, and stand in the snow behind him. Half-ear counts: nine men, three farm-boys with pitchforks, a woman with a pot. “Another day,” he says, and turns his horse. The street has never been so proud of itself.',
          effects: ['ansehen+2', 'xp+2', 'gunst-1', 'flag+street_stood_together'],
          go: '@plan',
        },
      },
      {
        text: 'Stand at the gate and refuse: there is nothing here.',
        as: 'andreas',
        condition: (state) =>
          Boolean(state.flags.fought_riders || state.flags.riders_know || state.flags.paid_riders),
        contest: {
          attr: 'kraft',
          rival: 7,
          rivalNote: 'Half-ear’s men roll d6 + 3.',
          tags: ['defend'],
          label: 'Refuse at the gate',
          success: {
            text: 'He says nothing for a long time, in the snow, and then he laughs and rides away. The next day there is a dead rabbit on the sill-stone: either an insult or a joke. Neither of you will ever know.',
            effects: ['ansehen+1', 'xp+2', 'flag+riders_beaten'],
            go: '@plan',
          },
          failure: {
            text: 'They take the cow. They take the sack. They take the axe. The street watches from behind its shutters, and no one comes.',
            effects: ['vieh.kuh-1', 'korn-3', 'kw+wounded', 'flag+riders_beaten'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Feed the starving rider and hear him out.',
        as: 'henning',
        condition: (state) =>
          !(state.flags.fought_riders || state.flags.riders_know || state.flags.paid_riders),
        cost: { korn: 1 },
        outcome: {
          text: 'He eats like a man who has not seen bread in a fortnight. When he has finished he stands, bows slightly to Ilse, and takes a brass horn from his saddle. “They are not bad men,” he says. “They are just hungry and have forgotten how to ask.” He leaves the horn on the sill-stone. It is the only payment he has.',
          effects: ['item+horn', 'xp+1', 'ansehen+1', 'flag+fed_rider'],
          go: '@plan',
        },
      },
      {
        text: 'Send him away: there is nothing here for soldiers.',
        condition: (state) =>
          !(state.flags.fought_riders || state.flags.riders_know || state.flags.paid_riders),
        outcome: {
          text: 'He nods, as if he had expected it, and rides back into the snow. You never see him again, and that is the worst of it.',
          effects: [],
          go: '@plan',
        },
      },
    ],
  },

  'w.ev_hartman': {
    chapter: 2,
    source: 'inv',
    title: 'A knock in the snow',
    text: (state) => {
      if (state.flags.helped_fire) {
        return `Bode himself comes to the sill-stones, a thing he has never done. He is carrying a sack on his shoulder, and snow on his hat, and an expression of great discomfort. “I know you are short,” he says. “The barn was my winter. You saved the animals. A man can pay a debt, in a bad winter, with oats.”`
      }
      if (state.flags.fire_ignored || state.flags.fire_thief) {
        return `Bode’s boy, thin and pale, stands at the edge of the plot with a hat in his hands and snow in his hair. The barn burned and the hay went with it. There is nothing at the Bode farm now but a cow, a lot of pride and some very hungry children. The boy has been sent to ask for a measure of anything. He looks as though he would rather be shot.

The boy does not say anything about the night of the fire. He does not have to.`
      }
      return `Kuhlmann’s youngest daughter stands at the edge of the plot with a pot. She says her father sends greetings and a question: could the Feldmann house spare a handful of salt? The Kuhlmann stores are fine; the Kuhlmanns, like everyone, are testing the street. A neighbour who gives salt will be given a favour back, in the end. A neighbour who does not will be noticed.`
    },
    choices: [
      {
        text: 'Accept the oats gratefully: two Stores’ worth.',
        as: 'andreas',
        condition: 'flag:helped_fire',
        outcome: {
          text: 'It is not charity. It is two measures of good oats and a promise on both sides that the world is, after all, a place where people repay each other. Bode nods at the sill-stone and goes back down the street.',
          effects: ['korn+2', 'rel.bode+1', 'gunst+1', 'flag+helped_neighbour'],
          go: '@plan',
        },
      },
      {
        text: 'Refuse the oats: you did not help for payment. Say so.',
        as: 'casper',
        condition: 'flag:helped_fire',
        outcome: {
          text: 'Bode looks as if he has been slapped, then as if he has been blessed. He leaves the sack anyway, leaning against the sill-stone, and does not look back. In the end you take it.',
          effects: ['korn+2', 'ansehen+2', 'rel.bode+2', 'flag+helped_neighbour'],
          go: '@plan',
        },
      },
      {
        text: 'Give the boy a measure of Stores. It is not forgiveness. It is simply right.',
        as: 'andreas',
        condition: (state) => Boolean(state.flags.fire_ignored || state.flags.fire_thief),
        cost: { korn: 1 },
        outcome: {
          text: 'He takes it with both hands and says nothing, and runs. Perhaps that is all that will ever be said. But the next day there is smoke from the Bode chimney again, and a goat’s skin pegged out to dry by the gate.',
          effects: ['rel.bode+2', 'flag-fire_ignored', 'ansehen+1', 'flag+shared_food'],
          go: '@plan',
        },
      },
      {
        text: 'Send the boy home with nothing. He should have thought of that in the autumn.',
        as: 'casper',
        condition: (state) => Boolean(state.flags.fire_ignored || state.flags.fire_thief),
        outcome: {
          text: 'He goes without a word. The Bode gate stays shut for the rest of the winter. It is deserved, and it is also the kind of thing a street never quite forgets.',
          effects: ['rel.bode-1', 'ansehen-1'],
          go: '@plan',
        },
      },
      {
        text: 'Give her a handful of salt and ask for nothing.',
        as: 'henning',
        condition: (state) =>
          !(state.flags.helped_fire || state.flags.fire_ignored || state.flags.fire_thief),
        outcome: {
          text: 'Salt is worth its weight in something. Kuhlmann’s daughter takes it carefully and runs home. Two days later a smoked ham appears on the sill-stone, with no note.',
          effects: ['rel.kuhlmann+2', 'korn+2', 'flag+shared_food'],
          go: '@plan',
        },
      },
      {
        text: 'Say you have none to spare.',
        condition: (state) =>
          !(state.flags.helped_fire || state.flags.fire_ignored || state.flags.fire_thief),
        outcome: {
          text: 'She nods and goes. The Kuhlmanns know exactly how much salt you have, and exactly how much you have just said you do not.',
          effects: ['rel.kuhlmann-1'],
          go: '@plan',
        },
      },
    ],
  },

  'w.ev_fever': {
    chapter: 2,
    source: 'inv',
    title: 'The fever',
    text: (state) => {
      if (state.flags.cough_lingers) {
        return `The cough that never quite left the house comes back in the night, and with it the fever. ${
          state.flags.strangers_in && !state.flags.child_lost
            ? 'Meta’s youngest is burning. She is very quiet, which is worse than the crying was.'
            : 'Ilse is burning, and will not admit it, and will not lie down.'
        } The hearth is low. There is little honey left, and the pastor lives a long way off through the snow.

**This is the night it will be decided.**`
      }
      return `The fever does not come to the Feldmann house this time. It comes to the Kuhlmann house two doors up. The youngest Kuhlmann boy, five years old, is delirious by dawn. Hans Kuhlmann comes down the street in the grey light with his hat in his hand, a thing no one in the village has ever seen him do. “You are the Harz family,” he says. “You know the old herbs.”`
    },
    choices: [
      {
        text: 'Henning brews the herbs he knows from the huts: willow bark, yarrow, thyme.',
        as: 'henning',
        check: {
          attr: 'verstand',
          h: 5,
          tags: ['forest', 'animal', 'weather'],
          label: 'Brew the old remedy',
          success: {
            text: 'By the third night the fever breaks. The patient sleeps, sweating, and wakes demanding bread. Henning goes out into the snow and sits on the sill-stone, shaking, unsure whether he is more relieved or more tired.',
            effects: ['xp+2', 'stam-1', 'rel.kuhlmann+1', 'flag+fever_survived', 'flag-cough_lingers'],
            go: '@plan',
          },
          failure: {
            text: 'The fever does not break. It is three days of bad nights. In the end the patient lives, thin as a rail and still burning, and Henning does not forget the look on Ilse’s face.',
            effects: ['stam-2', 'flag+fever_survived'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Casper wades through the snow for the pastor and drags him back.',
        as: 'casper',
        gate: {
          attr: 'herz',
          min: 3,
          tags: ['talk'],
          label: 'Fetch the pastor',
          success: {
            text: 'It takes four hours each way through snow to the thigh. The pastor comes grey with cold, prays, bleeds the patient, and leaves a bitter tea. The patient lives. Casper’s knees are the colour of tallow for a week.',
            effects: ['stam-2', 'rel.pastor+2', 'gunst+1', 'flag+fever_survived', 'flag-cough_lingers'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Andreas keeps the fire alive all night with the last of the good wood.',
        as: 'andreas',
        gate: {
          attr: 'kraft',
          min: 3,
          tags: ['endure'],
          label: 'Keep the fire',
          success: {
            text: 'He feeds it plank by plank, until the roof beams ring with heat and the sweat runs. Toward morning the fever breaks. It could have been anything: the fire, the tea, plain luck. Andreas says nothing and goes to sleep on the floor.',
            effects: ['stam-2', 'xp+1', 'flag+fever_survived', 'flag-cough_lingers'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Do nothing, and keep the others out of the room.',
        outcome: {
          text: 'It is the longest night of the winter. By morning it is clear that this one will not wake. The house is very quiet. Meta sits with the body until the sun is high, and then she gets up, because there is water to carry. The village hears.',
          effects: ['all:stam-2', 'ansehen-1', 'flag+child_died'],
          go: '@plan',
        },
      },
    ],
  },

  'w.ev_frozen': {
    chapter: 2,
    source: 'inv',
    title: 'A man in the snow',
    text: `Henning finds him on the forest road at first light, curled against a stump with snow in his hair. At first Henning takes him for a dead man. Then the chest moves. He is a stranger in a good coat, a travelling man, a pedlar or a clerk, with a pack that has been dragged off his shoulders and lies a yard away. His lips are blue. He mutters a name that is not yours.

There is nobody on the road. There will not be before dark.`,
    choices: [
      {
        text: 'Carry him home and put him by the fire.',
        as: 'henning',
        cost: { korn: 1 },
        outcome: {
          text: 'It takes the three of you to get him to the plot. He wakes at noon, in Ilse’s blanket, with soup in him. He is a clerk of the Amt in Wöltingerode, lost on his way from Goslar, and he speaks Latin in his sleep. “I will not forget this,” he says, in the grave voice of a man who may one day be able to prove it.',
          effects: ['gunst+2', 'ansehen+1', 'xp+1', 'flag+saved_clerk'],
          go: '@plan',
        },
      },
      {
        text: 'Search the pack and take what is useful. He will not wake.',
        as: 'casper',
        outcome: {
          text: 'A fine coat, a purse, a book and a pair of leather gloves. The man breathes behind you as you take it, then stops. Perhaps he would have lived. Nobody will ever know.',
          effects: ['item+coat', 'kasse+4', 'all:stam-1', 'flag+robbed_stranger'],
          go: '@plan',
        },
      },
      {
        text: 'Leave him. It is not your business and there is not enough for another mouth.',
        outcome: {
          text: 'You go back the way you came. There is a place in the churchyard, in spring, where a man is buried who nobody claims, and the pastor sometimes looks at you.',
          effects: [],
          go: '@plan',
        },
      },
    ],
  },

  'w.b3e': {
    chapter: 2,
    source: 'inv',
    title: 'The bell for the dead',
    text: (state) => `On Sunday the church bell rings the long slow stroke, and it does not stop. Three people have died in the week: the old sexton’s wife, a Kuhlmann cousin who came in from the road, and a stranger no one knew. The village goes to the church in its worst clothes. Every second person is thin, and nobody mentions it.

Afterward there is a collection for the poor box, and the pastor looks at each family as it passes. ${state.flags.looted_dead ? 'He looks at you a little longer than at the others.' : ''}`,
    choices: [
      {
        text: 'Put a measure of Stores in the poor box.',
        cost: { korn: 1 },
        outcome: {
          text: 'The pastor’s eyes do not leave the sack until it has been set down. “God provides,” he says, “through his hands.” You have never felt so seen.',
          effects: ['ansehen+1', 'rel.pastor+1', 'flag+helped_neighbour'],
          go: '@day',
        },
      },
      {
        text: 'Offer to ring the bell for the next one.',
        outcome: {
          text: 'The sexton’s work is a heavy rope and a longer night. By dawn your arms have forgotten they are arms, and the village has forgotten they once had a name for you other than “the Feldmann boy.”',
          effects: ['stam-1', 'rel.pastor+1', 'xp+1', 'ansehen+1'],
          go: '@day',
        },
      },
      {
        text: 'Go home. You have your own dead to avoid.',
        outcome: {
          text: 'Nobody notices. Nobody says they do.',
          effects: [],
          go: '@day',
        },
      },
    ],
  },

  'w.20': {
    chapter: 2,
    source: 'inv',
    title: 'The ice breaks',
    log: 'Thaw 1649: the household came through the hungry months.',
    effects: [
      (state) => {
        const effects = ['all:xp+2']
        if (state.hof.korn < 2) effects.push('all:kw+hungry', 'ansehen-1')
        return effects
      },
    ],
    text: (state) => {
      let text = `On the sixth morning there is a sound from the Schamlah like a long, slow gunshot. The ice is breaking. For three days the street is a river of mud and meltwater, and then, one grey morning, there is a bird in the thorn bush, and nobody says anything because nobody trusts it.\n\n`
      text += `**The winter’s account.**\n\n`
      text += state.hof.vieh.kuh >= 1
        ? `The cow lives, thin as a rail. `
        : `The cow is gone, and the house is quieter without her. `
      text += state.hof.korn >= 3
        ? `There are still stores in the corner, not much, but enough to sow.\n\n`
        : state.hof.korn >= 1
          ? `The sack is nearly empty. There is seed for one Morgen and not an ounce of margin.\n\n`
          : `There is not a grain left, and the spring work is going to be done by hungry men.\n\n`
      if (state.flags.strangers_in) {
        text += state.flags.child_lost || state.flags.child_died
          ? `Meta’s youngest is in the churchyard. She does not speak of it, and works, and the other child clings to her skirt. `
          : `Meta and both her children are alive, and she has begun to speak, a few words at a time. `
      }
      if (
        state.flags.helped_fire ||
        state.flags.shared_food ||
        state.flags.helped_neighbour ||
        state.flags.saved_clerk
      ) {
        text += `\n\nThe street remembers who came when it knocked. ${state.flags.saved_clerk ? 'In Wöltingerode there is a clerk who owes his life to the Feldmann house and knows it. ' : ''}${state.flags.helped_fire ? 'Bode has begun to nod when you pass. ' : ''}`
      }
      if (
        state.flags.fire_ignored ||
        state.flags.fire_thief ||
        state.flags.robbed_stranger ||
        state.flags.looted_dead
      ) {
        text += `\n\nAnd the street remembers the other things too. ${state.flags.fire_ignored || state.flags.fire_thief ? 'The Bode gate is not open. ' : ''}${state.flags.robbed_stranger ? 'A pedlar’s coat hangs on a nail in your house. ' : ''}${state.flags.looted_dead ? 'The ring stays in its cloth. ' : ''}`
      }
      text += `\n\nThe thaw is a small and ordinary mercy. It is also the first day of the rest of your life in Lochtum.\n\n**Where the roads stand.**\n\n${roadSummary(state)}`
      return text
    },
    choices: [{ text: 'The years go by.', go: '@complete' }],
  },
}

export const chapterTwoDuskScenes = {
  3: 'w.b3e',
} as const satisfies Readonly<Record<number, keyof typeof chapterTwoScenes>>

export const chapterTwoClimaxScene = 'w.20' as const

export const chapterTwoMorningEvents = [
  'w.ev_wolves',
  'w.ev_riders',
  'w.ev_hartman',
  'w.ev_fever',
  'w.ev_frozen',
] as const satisfies readonly (keyof typeof chapterTwoScenes)[]
