import type { EncounterRegistry, SectionRegistry } from '../content'
import type { BrotherId, GameState } from '../types'

const brotherNames: Record<BrotherId, string> = {
  andreas: 'Andreas',
  henning: 'Henning',
  casper: 'Casper',
}

const chapterOneList = (state: GameState): string => {
  const items = [
    {
      title: 'A roof over the family',
      done: state.hof.heim >= 1,
      status: `House ${state.hof.heim} of 1`,
    },
    {
      title: 'A pen for the animals before the wolves',
      done: !!state.flags.pen,
      status: state.flags.pen ? 'built' : 'not built',
    },
    {
      title: 'Stores in the sacks on the last night (5 or more)',
      done: state.hof.korn >= 5,
      status: `${state.hof.korn} of 5`,
    },
    ...(state.flags.strangers_in
      ? [
          {
            title: 'Keep Meta and her children alive (a roof, and 2 Stores left on the last night)',
            done: state.hof.heim >= 1 && state.hof.korn >= 2,
            status: `House ${state.hof.heim}, Stores ${state.hof.korn}`,
          },
        ]
      : []),
    {
      title: 'The first Morgen cleared for next year’s seed',
      done: state.hof.land >= 1,
      status: `${state.hof.land} Morgen`,
    },
    {
      title: 'The spring cleared',
      done: !!state.flags.clean_spring,
      status: state.flags.clean_spring ? 'clear' : 'fouled',
    },
    {
      title: 'A favour from a neighbour (Relationship 2)',
      done:
        (state.rel.kuhlmann || 0) >= 2 || (state.rel.bode || 0) >= 2,
      status: `Kuhlmann ${state.rel.kuhlmann || 0}, Bode ${state.rel.bode || 0}`,
    },
    {
      title: 'Standing 2 or more in the village',
      done: state.hof.ansehen >= 2,
      status: `Standing ${state.hof.ansehen}`,
    },
  ]
  return items
    .map(({ title, done, status }) => `${done ? 'Done' : 'Open'}: ${title} (${status})`)
    .join('\n')
}

const roadSummary = (state: GameState): string =>
  (['andreas', 'henning', 'casper'] as const)
    .map((brother) => {
      const completed = Object.keys(state.arcDone).filter((key) =>
        key.startsWith(`${brother}:`),
      ).length
      return `**${brotherNames[brother]}**: ${completed} recorded steps.`
    })
    .join('\n\n')

export const chapterOneScenes: SectionRegistry = {
  '1.00': {
    chapter: 1,
    source: 'inv',
    title: 'The huts in the hills',
    log: 'Autumn 1648: the family leaves the Harz huts and returns to Lochtum.',
    text: `The smoke from the earth-hut hearth is thin, and so are you. For years the Feldmann family has lived like foxes: a roofed hole in the Harz foothills, a cow hidden in a ravine, one sack of rye that must outlast the war. Tonight a drover with a limp walked into the clearing with news he could hardly believe himself. The peace has been signed. The armies are going home.

Heinrich Feldmann, the Hausvater, lets the silence sit. Then he says what everyone is thinking. “The plot by Steinborn Spring is ours. If we wait for spring, someone else will have decided that it is theirs.”

Ilse, his wife, mends a sack with shaking hands. Her three sons look at their father. Andreas thinks only of the sill-stones and the black soil behind them. Henning counts the cow’s ribs and wonders how an animal so thin will walk so far. Casper is already talking himself onto the road and into whatever waits at its end.`,
    choices: [{ text: 'Lead the family down at first light.', go: '1.01' }],
  },
  '1.01': {
    chapter: 1,
    source: 'mix',
    title: 'Lochtum',
    text: `By noon you stand where the village was. The church is still there, scorched but roofed. The houses are black stumps, and the gardens between them are a sea of nettles. Here and there a thread of smoke rises, but you count three, no more.

At Steinborn Spring, the water runs clean and cold out of the rock, the one thing the armies could not burn. The spring is the reason the family lived at the edge of the village in the first place. Your plot lies between the street and the little stream, the Schamlah: a rectangle of charred posts and sill-stones under briars as high as your shoulder, with a long meadow stretching north behind it.

Heinrich puts his hand on the stone sill of the old house the way you would touch a horse. “Here,” he says. Then he counts on his fingers.

“Seven days to the frost. A roof, or we die of it. A pen for the animals, because the wolves have eaten the dead of thirty years and they have not forgotten the taste: they will come, and soon. Stores for the winter. Then the field, the spring, the neighbours, in that order. Each of you works alone by day and comes home by night. Bring home whatever the day gives you. And keep your eyes open. A war does not end on the day somebody signs it.”`,
    choices: [{ text: 'Begin the first day.', go: '@plan' }],
  },
  '1.b1e': {
    chapter: 1,
    source: 'inv',
    title: 'Smoke on the street',
    unlock: ['village', 'kuhlmann'],
    text: `At dusk the three of you sit on the sill-stones and count what the day gave. Heinrich is looking along the street. Up the road from Steinborn Spring, where it bends, a thread of smoke rises from a roof that has no business having a hearth under it. Then another, further off, beyond the Brink.

“Somebody came home,” says Ilse.

“The Kuhlmann yard,” says Heinrich. “They were here before us. They were always here before us.”

Tomorrow the village is open to you.`,
    choices: [{ text: 'Sleep on it.', go: '@day' }],
  },
  '1.b2e': {
    chapter: 1,
    source: 'inv',
    title: 'Another roof',
    unlock: ['bode'],
    text: `A second smoke, down the street toward the stream: the Bode yard, the grain farmers. They treated the war as a long and expensive inconvenience and they have come back to it as to an unpaid bill. Ilse says it is good to have neighbours. Heinrich says it is good to have neighbours who owe you something, and then he looks away, because nobody owes the Feldmann anything yet.

The nights are getting colder.`,
    choices: [{ text: 'Sleep on it.', go: '@day' }],
  },
  '1.b3e': {
    chapter: 1,
    source: 'inv',
    title: 'Strangers at the fire',
    text: `At dusk a woman and two small children stand at the edge of your half-built shelter. They have walked from the north and they do not ask for anything, which is how you know what they want. Her name is Meta. She does not say where her husband is, and nobody asks. The youngest child has a dry small cough.

Ilse looks at Heinrich. Heinrich looks at the stores, and then at the sky.`,
    choices: [
      {
        text: 'Take them in. They share the fire and the stores.',
        cost: { korn: 1 },
        outcome: {
          text: 'The children sleep like stones. Meta is up before light, carrying water and splitting kindling, as though work were a way of paying off a debt. The cough does not go away.',
          effects: ['flag+strangers_in', 'ansehen+1', 'all:xp+1', 'rel.meta+1'],
          log: 'Took in Meta and her two children (invented).',
          go: '@day',
        },
      },
      {
        text: 'Send them to the pastor’s cellar.',
        outcome: {
          text: 'It is a kind of answer. You do not feel kind. By morning they are gone.',
          effects: ['flag+strangers_pastor'],
          log: 'Sent Meta and her children to the pastor’s cellar.',
          go: '@day',
        },
      },
    ],
  },
  '1.b4e': {
    chapter: 1,
    source: 'inv',
    title: 'Wolves at dusk',
    text: (state) =>
      `The wolves come at the hour when the light is grey and the cow lows in the dark. Two shapes at the edge of the firelight, then three. They have been hungry as long as you have, and a cow has never smelled so good.

${state.flags.pen ? 'The pen of stakes and withies stands between the animals and the dark. It is not a good pen. It is a pen.' : 'There is no pen. The animals stand in the open, and every one of them knows it.'}${state.flags.scouted ? ' The tracks you found at the forest edge this week told you to expect this.' : ''}`,
    choices: [
      {
        text: 'The pen holds. Keep watch from the doorway.',
        condition: 'flag:pen',
        outcome: {
          text: 'The wolves circle twice, test the stakes once, and decide that a fed pack is better than a wounded one. They are gone before the moon is up.',
          effects: ['all:xp+1'],
          go: '@day',
        },
      },
      {
        text: 'Henning stands between the animals and the dark.',
        condition: '!flag:pen',
        as: 'henning',
        check: {
          attr: 'herz',
          h: 4,
          tags: ['wolf', 'animal', 'herd'],
          label: 'Face the wolves',
          success: {
            text: 'Henning speaks to them quietly, as he speaks to the cow. The nearest wolf looks at him a very long moment and then simply leaves. Nothing is lost.',
            effects: ['xp+1', 'trust+1'],
            go: '@day',
          },
          failure: {
            text: 'One of them takes a goat before the others decide to flee.',
            effects: ['vieh.ziege-1', 'stam-1'],
            go: '@day',
          },
        },
      },
      {
        text: 'Andreas lights a torch and bangs the iron pot.',
        condition: '!flag:pen',
        as: 'andreas',
        check: {
          attr: 'kraft',
          h: 3,
          tags: ['defend', 'wolf'],
          label: 'Drive them off with fire and noise',
          success: {
            text: 'The din is magnificent. The wolves go.',
            effects: ['xp+1'],
            go: '@day',
          },
          failure: {
            text: 'They scatter, and a hen is gone in the dark.',
            effects: ['vieh.huhn-1', 'stam-1'],
            go: '@day',
          },
        },
      },
    ],
  },
  '1.b5e': {
    chapter: 1,
    source: 'inv',
    title: 'The sky turns white',
    text: (state) =>
      `The first flurries come at nightfall, small and dry. Heinrich stands in the doorway and reads the list aloud as if it were a prayer, and for once nobody interrupts.

${chapterOneList(state).split('\n').map((line) => `**${line.split(':')[0]}**:${line.slice(line.indexOf(':') + 1)}`).join('\n\n')}

“One more day,” says Heinrich. “Tomorrow night, the frost.”`,
    choices: [{ text: 'Sleep, if you can.', go: '@day' }],
  },
  '1.e_deserter': {
    chapter: 1,
    source: 'inv',
    title: 'The man at the stream',
    text: (state) =>
      `At the stream where the track leaves the trees, a man sits on a rock with his boots off. He wears what was once a coat. His face is bright with fever. He might be Imperial, he might be Swedish; the coat has lost its colours and he has lost the language of everyone. “Bread,” he says, in German anyway. Then, because ${brotherNames[state.lead]} does not answer at once: “There is grain at Lochtum. We buried it under the chapel wall when the captain still thought he would be back. The captain is dead. I will tell you where, for bread.”`,
    choices: [
      {
        text: 'Give him a crust and a swallow of goat’s milk.',
        cost: { korn: 1 },
        outcome: {
          text: 'He eats like a man remembering how. “Third stone from the corner, facing the spring,” he says, and walks north without a goodbye.',
          effects: ['kw+soldiers', 'flag+soldier_tip'],
          log: 'A starving deserter told us where soldiers had buried grain.',
          go: '@next',
        },
      },
      {
        text: 'Talk him into the secret for free.',
        check: {
          attr: 'herz',
          h: 4,
          tags: ['talk', 'soldier'],
          label: 'Coax the secret',
          success: {
            text: '“You have an honest face,” he says, “which is a pity for you.” He tells, and asks for nothing, and when he looks away you leave a crust on the rock anyway.',
            effects: ['flag+soldier_tip', 'xp+1'],
            go: '@next',
          },
          failure: {
            text: 'He laughs, a dry hard sound, and holds out his hand. You give him the crust. He tells you the secret afterwards, as if it were a receipt.',
            effects: ['korn-1', 'flag+soldier_tip'],
            go: '@next',
          },
        },
      },
      {
        text: 'Take his knife and send him on his way.',
        check: {
          attr: 'kraft',
          h: 4,
          tags: ['defend'],
          label: 'Disarm him',
          success: {
            text: 'He is weaker than he looks. The knife comes away in your hand with a Swedish mark on the blade, and he is gone into the trees.',
            effects: ['item+knife'],
            go: '@next',
          },
          failure: {
            text: 'He is weaker than he looks in only one way: he is fast. He knocks you into the stream and is gone with a piece of your dignity.',
            effects: ['stam-1'],
            go: '@next',
          },
        },
      },
    ],
  },
  '1.e_pastor': {
    chapter: 1,
    source: 'mix',
    title: 'The porch',
    text: (state) =>
      `The church porch is where the survivors meet each evening to count who is alive. The pastor, a thin man in a coat that was once black, writes names on a slate: a name is a living, and a living is a name. “Feldmann,” he says, looking up at ${brotherNames[state.lead]}. “Heinrich’s boys. We had stopped counting you. Come and sit.”`,
    choices: [
      {
        text: 'Offer to carry rubble for the church.',
        gate: {
          attr: 'herz',
          min: 2,
          tags: ['talk', 'kin'],
          label: 'Offer help',
          success: {
            text: 'By evening the pastor knows your name and the sexton knows your father’s.',
            effects: ['ansehen+1', 'flag+church_friend', 'rel.pastor+1'],
            go: '@next',
          },
          hard: { effects: [] },
        },
      },
      {
        text: 'Ask who is alive, and where.',
        outcome: {
          text: 'The pastor gives you the whole list, slowly, with a few words about each. When he is done you know who has a roof, who has a horse, and who has a grudge.',
          effects: ['rel.pastor+1', 'xp+1'],
          go: '@next',
        },
      },
    ],
  },
  '1.e_kuhlmann': {
    chapter: 1,
    source: 'mix',
    title: 'The Kuhlmann yard',
    text: `Up the street, behind a half-fallen gate, a man is mending a harness by a fire that burns in the middle of a roofless room. The Kuhlmann yard has a barn wall and a stable that still has a roof, which makes it the richest place in the village. Hans Kuhlmann looks up, wary. He has three sons and a plow horse and he is counting the cost of every word.`,
    choices: [
      {
        text: 'Greet him plainly, as a neighbour.',
        outcome: {
          text: '“Feldmann,” he says. “Heinrich’s sons.” He nods once. In this village that is a handshake.',
          effects: ['rel.kuhlmann+1'],
          go: '@next',
        },
      },
      {
        text: 'Ask what he needs most.',
        gate: {
          attr: 'verstand',
          min: 3,
          tags: ['talk', 'count'],
          label: 'Read what he needs',
          success: {
            text: 'Hands, he says, before he can stop himself. Hands for the barn roof and the first plowing. “In return a man might get a measure of seed.” He looks annoyed at himself for having said so much.',
            effects: ['rel.kuhlmann+1', 'xp+1'],
            go: '@next',
          },
          hard: { effects: [] },
        },
      },
    ],
  },
  '1.e_bode': {
    chapter: 1,
    source: 'mix',
    title: 'The Bode yard',
    text: `The Bode yard is bigger than the Kuhlmann yard and quieter. A woman is sorting seed-corn on a sheet, grain by grain, as though each kernel were a coin. The grain farmers have always had the largest share of the village’s rye; they have clearly brought some of it through the war. Hanß Bode does not come out to greet you, but he watches from the barn door.`,
    choices: [
      {
        text: 'Greet him plainly, as a neighbour.',
        outcome: {
          text: 'He nods, slowly, and says nothing, and then, a little later, says: “The Kuhlmanns have three sons and not enough hands. Ask there.” It is a gift of sorts.',
          effects: ['rel.bode+1'],
          go: '@next',
        },
      },
      {
        text: 'Offer to talk trade.',
        check: {
          attr: 'herz',
          h: 4,
          tags: ['talk', 'trade'],
          label: 'Talk trade',
          success: {
            text: 'He listens like a man who has been talked at before. At the end he says: “Come and work for me, and we will see.” It is the longest sentence anyone has said to you today.',
            effects: ['rel.bode+1', 'xp+1'],
            go: '@next',
          },
          failure: {
            text: 'He says he will think about it, in the voice of a man who has already thought.',
            effects: [],
            go: '@next',
          },
        },
      },
    ],
  },
  '1.20': {
    chapter: 1,
    source: 'mix',
    title: 'The first frost',
    effects: [(state: GameState) => {
      const effects = ['all:xp+2']
      const roof = state.hof.heim >= 1
      if (!roof) effects.push('all:stam-2', 'all:kw+weary', 'vieh.ziege-1')
      if (state.flags.strangers_in) {
        if (roof && state.hof.korn >= 2) effects.push('ansehen+1')
        else effects.push('flag+child_lost', 'ansehen-1')
      }
      if (state.hof.korn < 3) effects.push('all:kw+hungry')
      return effects
    }],
    log: 'Winter 1648: the first frost found the household in Lochtum.',
    text: (state) => {
      const roof = state.hof.heim >= 1
      let text = 'The frost comes on the seventh night: white, silent, total.\n\n'
      text += roof
        ? 'You wake under a roof, and the roof holds. The animals stamp and steam in the dark, and the household counts its breath.\n\n'
        : 'You have no roof worth the name. The household spends the night shivering around a fire that is too small, and the cold takes a goat before dawn. Everyone is Weary and everyone remembers it.\n\n'
      if (state.flags.strangers_in) {
        text +=
          roof && state.hof.korn >= 2
            ? 'Meta’s children sleep through the night between Ilse and the warm wall. The cough is no better, but it is no worse. She says “thank you” once, in a voice meant for no one else.\n\n'
            : 'Meta’s youngest does not wake on the second morning. Nobody says what everyone knows: a warmer house or a fuller sack would have been enough. Meta sits with the child until the sun is high, and then she gets up, because there is water to carry. The village hears of it.\n\n'
      }
      text +=
        state.hof.land >= 1
          ? 'Outside, a black strip of cleared earth waits for next year’s seed. '
          : 'Outside, the briars still hold the field. '
      text +=
        state.hof.korn >= 3
          ? 'The sacks are not full, but they are not empty either.'
          : 'The stores are thin, and the brothers go into the working weeks with hollow bellies.'
      text +=
        '\n\nThis is how Lochtum began again: not with a bell, but with a roof, a pen and a spring that never stopped running.'
      text += `\n\n**Where the roads stand.**\n\n${roadSummary(state)}`
      return text
    },
    choices: [{ text: 'Close the chapter.', go: '@complete' }],
  },
  '1.ev_fire': {
    chapter: 1,
    source: 'inv',
    title: 'Fire at the Bode yard',
    text: `You wake to the smell before the sound. Beyond the Brink a wedge of sky is the wrong colour: orange, pulsing, with sparks climbing among the stars. Somebody’s hearth fire has crept into the hay. By the time the brothers reach the Bode yard the barn roof is a cage of burning ribs, Hanß Bode is tearing at the stable door with his bare hands, and a woman is screaming for water. The Schamlah is forty paces off. There is one bucket in sight.

This is the moment your household shows what it is. **Choose how it reacts.**`,
    choices: [
      {
        text: 'Andreas runs the bucket line from the Schamlah, hour after hour.',
        as: 'andreas',
        gate: {
          attr: 'kraft',
          min: 3,
          tags: ['endure', 'field'],
          label: 'Haul water',
          success: {
            text: 'By dawn the hay is gone and the stable stands, black and steaming. Bode sits in the ash with his hands wrapped in wet sacking. He looks up at Andreas and says one word: “Feldmann.” In this village that is a debt acknowledged.',
            effects: ['stam-1', 'rel.bode+2', 'gunst+1', 'xp+1', 'flag+helped_fire'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Henning goes into the smoke for the animals.',
        as: 'henning',
        check: {
          attr: 'herz',
          h: 4,
          tags: ['animal', 'herd', 'endure'],
          label: 'Bring out the animals',
          success: {
            text: 'The cow will not move for a stranger, but she moves for Henning, speaking low, blind with a wet sack. Two goats, the old mare and the cow come out of the dark coughing. Bode holds the cow’s head and cannot speak.',
            effects: ['rel.bode+2', 'gunst+1', 'trust+1', 'xp+1', 'flag+helped_fire'],
            go: '@plan',
          },
          failure: {
            text: 'The mare kicks him in the ribs in the dark. He gets two goats out and the mare after, but he comes out on his hands and knees with his hair singed. Bode helps him to the well.',
            effects: ['stam-2', 'rel.bode+1', 'trust+1', 'flag+helped_fire'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Casper takes charge of the chain: he shouts until strangers fall into line.',
        as: 'casper',
        gate: {
          attr: 'herz',
          min: 3,
          tags: ['talk', 'kin'],
          label: 'Command the line',
          success: {
            text: 'He is not the strongest and he is not the fastest, but he is the one who stands on a cart and points. Within a minute there are thirty people passing buckets, and the line moves like a machine. The village will remember who gave the orders.',
            effects: ['rel.bode+1', 'rel.kuhlmann+1', 'gunst+1', 'ansehen+1', 'xp+1', 'flag+helped_fire'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Stay on the plot and guard your own thatch against the sparks.',
        outcome: {
          text: 'Your roof is safe. Bode’s barn is not. In the morning the street knows who came with a bucket and who stood at his own gate with his arms folded.',
          effects: ['rel.bode-1', 'ansehen-1', 'flag+fire_ignored'],
          go: '@plan',
        },
      },
      {
        text: 'Casper slips through the smoke to see what the flames have left lying about.',
        as: 'casper',
        check: {
          attr: 'geschick',
          h: 5,
          tags: ['hide', 'craft'],
          label: 'Pick through the yard',
          success: {
            text: 'A purse that fell from a beam, and a whetstone in a scorched pouch. No one sees. Casper’s hands are black to the wrist and so, perhaps, is something else.',
            effects: ['kasse+3', 'item+whetstone', 'flag+fire_thief'],
            go: '@plan',
          },
          failure: {
            text: 'A boy of the house sees him with his hand in the ash. Nothing is said that night. By morning everyone knows.',
            effects: ['ansehen-2', 'rel.bode-2', 'flag+fire_thief', 'flag+fire_ignored'],
            go: '@plan',
          },
        },
      },
    ],
  },
  '1.ev_riders': {
    chapter: 1,
    source: 'inv',
    title: 'Riders on the Steinborn Road',
    text: `Six horsemen come down the street at a walk, in coats from three armies: Swedish blue gone grey, Imperial buff, one in a priest’s cassock that stops above his wrists. The peace was signed a month ago. No one told their stomachs. The leader, a man with half an ear, stops in front of the sill-stones and looks at the cow and at the smoke from your fire.

“Contribution,” he says, using the old word for a tax collected with a pistol. “For the Emperor’s peace-keeping.” His men fan out a little. Nobody is smiling.

**Choose how the household answers.** Whatever you choose, they will remember it.`,
    choices: [
      {
        text: 'Henning drives the animals into the ravine before the riders reach the plot.',
        as: 'henning',
        check: {
          attr: 'verstand',
          h: 4,
          tags: ['forest', 'hide', 'track'],
          label: 'Hide the beasts',
          success: {
            text: 'By the time Half-ear’s men have kicked through the ruin there is nothing on the plot but a thin fire and three poor brothers. “Nothing here,” says the man in the cassock, and for once he is right. They ride on.',
            effects: ['xp+1', 'flag+hid_from_riders'],
            go: '@plan',
          },
          failure: {
            text: 'A rider follows the hoof-prints. Henning arrives at the ravine a minute before he does. The goat is taken, and the sack Henning had buried is dug up with a sword.',
            effects: ['korn-2', 'vieh.ziege-1', 'flag+riders_know'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Andreas pays the contribution: two measures of Stores.',
        as: 'andreas',
        cost: { korn: 2 },
        outcome: {
          text: 'Half-ear weighs the sack in his hand and nods. “A generous house,” he says. “We will remember where it stands.” It is not a threat. That is what makes it one.',
          effects: ['flag+paid_riders'],
          go: '@plan',
        },
      },
      {
        text: 'Casper talks: they are Heinrich Feldmann’s sons, on the pastor’s list, and the Landrat has forbidden contributions.',
        as: 'casper',
        check: {
          attr: 'herz',
          h: 5,
          tags: ['talk', 'kin', 'law'],
          label: 'Talk the riders down',
          success: {
            text: 'He lies fluently, about the Landrat, the pastor and a regiment on its way from Goslar. Half-ear laughs, not unkindly, and tells his men to ride on. “A clever one,” he says. “Remember me when you are clever for the Amt.”',
            effects: ['xp+1', 'flag+parleyed_riders'],
            go: '@plan',
          },
          failure: {
            text: 'The lie is a good one. Half-ear has simply heard it before. Two measures go into a saddlebag and Casper gets the flat of a hand across the face for the effort.',
            effects: ['korn-2', 'stam-1', 'flag+riders_know'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Andreas stands in the gap with the axe.',
        as: 'andreas',
        contest: {
          attr: 'kraft',
          rival: 6,
          rivalNote: 'The leader rolls d6 + 2. Two riders stand behind him.',
          tags: ['defend'],
          label: 'Face the riders',
          success: {
            text: 'Half-ear looks at the axe, at the brother who holds it, and at the stubborn black ground behind him. He spits. “Not worth the powder,” he says, and the six ride on, but not before one of them has dropped something in the mud, deliberately or not.',
            effects: ['ansehen+1', 'item+pistol', 'xp+1', 'flag+fought_riders'],
            go: '@plan',
          },
          failure: {
            text: 'Two of them take the axe from him and the third lays him in the mud with a pistol butt. They take three measures and go on, laughing, up the street.',
            effects: ['kw+wounded', 'korn-3', 'flag+fought_riders'],
            go: '@plan',
          },
        },
      },
    ],
  },
  '1.ev_cough': {
    chapter: 1,
    source: 'inv',
    title: 'The cough',
    text: (state) =>
      `In the small hours there is a sound from the corner that is not the wind. ${state.flags.strangers_in ? 'Meta’s youngest' : 'Ilse'} is coughing, a tight dry cough that catches at the end of every breath. The brow, when Ilse lays a hand on it, is hot as a stone from the fire. Everyone is awake. Nobody says the word that every house in the Harz knows from the war: the fever that came behind the armies, that took more than the swords did.

**What does the household do?**`,
    choices: [
      {
        text: 'Boil lime-blossom and honey on the hearth all night, and sit up.',
        as: 'henning',
        check: {
          attr: 'verstand',
          h: 4,
          tags: ['forest', 'animal'],
          label: 'Nurse through the night',
          success: {
            text: 'Toward dawn the breathing eases. By morning there is sweat instead of fever. Ilse takes Henning’s hand and holds it for a moment, which she has not done since he was small.',
            effects: ['stam-1', 'xp+1', 'flag+healed_cough'],
            go: '@plan',
          },
          failure: {
            text: 'The fever does not break. Henning sits until dawn, grey-faced, and the cough does not leave the house.',
            effects: ['stam-1', 'flag+cough_lingers'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Casper runs for the pastor, who has herbs and a blessing.',
        condition: 'rel.pastor>=1',
        as: 'casper',
        outcome: {
          text: 'The pastor comes in his night-shirt with a satchel and says nothing about the hour. He leaves a bitter tea that smells of moss, and a blessing, and a half-promise to pray. By morning the sick one is asleep.',
          effects: ['rel.pastor+1', 'flag+healed_cough'],
          go: '@plan',
        },
      },
      {
        text: 'Casper runs for the pastor, though he hardly knows him.',
        condition: 'rel.pastor<1',
        as: 'casper',
        gate: {
          attr: 'herz',
          min: 3,
          tags: ['talk'],
          label: 'Beg the pastor’s help',
          success: {
            text: 'The pastor listens at the door in the dark, then goes back for the satchel. He is a stranger who did not turn a stranger away, and Casper will remember it.',
            effects: ['rel.pastor+1', 'flag+healed_cough'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Give the sick one the goat’s milk and the warmest corner.',
        cost: { korn: 1 },
        outcome: {
          text: 'It is a poor medicine, and it is the only one in the house. Warmth, milk and attention work as well as most things the pastor has. By the second day the cough is looser.',
          effects: ['flag+healed_cough'],
          go: '@plan',
        },
      },
      {
        text: 'Keep the others away and sleep in the cold.',
        outcome: {
          text: 'Nobody sleeps. The cough goes on and on, and by morning four people are exhausted and the fifth is no better.',
          effects: ['all:stam-1', 'flag+cough_lingers'],
          go: '@plan',
        },
      },
    ],
  },
  '1.ev_thieves': {
    chapter: 1,
    source: 'inv',
    title: 'Torchlight at the pen',
    text: (state) =>
      `The goat bleats once, sharply, and stops. Henning is on his feet before he is awake. Beyond the hurdles two figures are working in the dark with a rope and a knife, quickly and badly, the way hungry people steal. ${state.flags.pen ? 'The stakes of the pen are holding, and one of them is swearing about it.' : 'There is no pen. There is a ring of loose withies and a lot of night.'}

**What do you do?**`,
    choices: [
      {
        text: 'Andreas rushes them with the axe and a roar.',
        as: 'andreas',
        contest: {
          attr: 'kraft',
          rival: 5,
          rivalNote: 'The thieves roll d6 + 2.',
          tags: ['defend'],
          label: 'Rush the thieves',
          success: {
            text: 'The roar does most of it. They scatter into the dark, and one drops a sack of turnips he had meant to carry the goat home in. At least someone had a plan.',
            effects: ['korn+1', 'xp+1'],
            go: '@plan',
          },
          failure: {
            text: 'One of them has a cudgel and a better idea of what he is doing. The goat goes into the night with a thin figure on a rope, and Andreas sits in the dirt holding his head.',
            effects: ['vieh.ziege-1', 'stam-1'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Henning slips round behind and takes the smaller one by the collar.',
        as: 'henning',
        check: {
          attr: 'geschick',
          h: 4,
          tags: ['hide', 'animal'],
          label: 'Catch a thief',
          success: {
            text: 'The smaller one turns out to be a boy of twelve, all elbows, with eyes like a cornered cat. “Matz,” he says, and nothing else. The older one is gone.',
            effects: ['xp+1', 'flag+boy_matz'],
            go: '1.ev_matz',
          },
          failure: {
            text: 'He is quicker than he looks and he knows the ground better. Henning gets a handful of sleeve and a mouthful of mud, and the goat is gone.',
            effects: ['vieh.ziege-1'],
            go: '@plan',
          },
        },
      },
      {
        text: 'Casper lets them take a hen, and follows them in the dark.',
        as: 'casper',
        check: {
          attr: 'verstand',
          h: 4,
          tags: ['track', 'hide', 'forest'],
          label: 'Follow the thieves',
          success: {
            text: 'They go east, to a hollow behind the old charcoal burners’ camp. Six fires, no more than a dozen shapes, and a wagon with no wheels. A hungry camp, not a murderous one, but a camp. Casper counts the fires and goes home to bed.',
            effects: ['vieh.huhn-1', 'xp+1', 'flag+know_camp'],
            go: '@plan',
          },
          failure: {
            text: 'They lose him in the first stand of trees. The hen is gone, and so is half the night.',
            effects: ['vieh.huhn-1', 'stam-1'],
            go: '@plan',
          },
        },
      },
    ],
  },
  '1.ev_matz': {
    chapter: 1,
    source: 'inv',
    title: 'The boy by the hearth',
    text: `Matz sits on the sill-stone with a blanket round his shoulders, eating a crust as though somebody might take it back. He is perhaps twelve. He does not say where he came from. He does not need to; the whole road from the Elbe came this way in the end.

“Mother’s dead,” he says, to the crust. “Father went with the soldiers.” He glances at the axe, at Andreas, and back at the crust. “You going to hang me?”`,
    choices: [
      {
        text: 'Feed him and let him stay: he can carry water and mind the hens.',
        cost: { korn: 1 },
        outcome: {
          text: 'He is asleep before the bread is gone. In the morning he is already carrying water, silently, as if work were a way of paying for the roof. Ilse says nothing, and finds him a blanket.',
          effects: ['ansehen+1', 'flag+matz_stays'],
          go: '@plan',
        },
      },
      {
        text: 'Give him a crust and send him on his way.',
        outcome: {
          text: 'He nods, without surprise, and is gone before the light is up. The world is full of boys like him. That is no comfort.',
          effects: [],
          go: '@plan',
        },
      },
    ],
  },
  '1.ev_bones': {
    chapter: 1,
    source: 'inv',
    title: 'What lay under the beams',
    text: `The Schmidt barn burned in the first year of the war and has stood open to the weather ever since. Rain, snow and nettles have taken the rest. While you clear a corner for beams you lift a charred rafter and find that something is under it: a small heap of bones in the black earth, and another, and another. Four skulls. A family, in a corner, where they had thought the flames would not reach.

Among them there is an iron ring on a leather thong, a child’s wooden shoe, and a string of blue glass beads. The wind moves the nettles and, for a moment, it sounds like speech.

**What do you do?**`,
    choices: [
      {
        text: 'Bury them in the churchyard, with the pastor’s help.',
        outcome: {
          text: 'It takes the whole afternoon and the pastor says the words over a trench hardly deep enough for a dog. But the dead have a grave, and the ring and the shoe go in with them. The pastor looks at you for a long time afterward, as at a man whom he has misjudged for the better.',
          effects: ['stam-1', 'rel.pastor+2', 'ansehen+1', 'xp+1', 'flag+buried_dead'],
          go: '@plan',
        },
      },
      {
        text: 'Take the ring and the beads. The dead do not need them.',
        outcome: {
          text: 'The ring will fetch three Groschen from any pedlar. You wrap it in a cloth and put it in your shirt, where it lies cold against your ribs. That night nobody sleeps well and nobody knows why.',
          effects: ['kasse+3', 'all:stam-1', 'flag+looted_dead'],
          go: '@plan',
        },
      },
      {
        text: 'Lay the beam back and walk away. It is not your grave.',
        outcome: {
          text: 'You put the rafter back as it was. You do not mention what is under it. It seems quite possible that you are not the first to do so.',
          effects: [],
          go: '@plan',
        },
      },
    ],
  },
  '1.ev_hart_cold': {
    chapter: 1,
    source: 'inv',
    title: 'A shut door',
    text: (state) =>
      `The Bode gate is shut. It has never been shut in daylight. From inside comes the sound of an axe on a burnt beam, steady and unhurried. When ${brotherNames[state.lead]} knocks, the axe stops. It does not start again until he has gone.

Beyond the barn wall a woman stands with her arms folded and does not look at him. Everyone in the street knows what happened on the night of the fire, and everyone knows who came and who did not. ${state.flags.fire_thief ? 'Some of them know something more.' : ''}`,
    choices: [
      {
        text: 'Walk away. It is deserved.',
        outcome: {
          text: 'The door stays shut. There will be time to mend it, but not today.',
          effects: ['xp+1'],
          go: '@next',
        },
      },
    ],
  },
  '1.ev_hart_thanks': {
    chapter: 1,
    source: 'inv',
    title: 'A sack at the gate',
    text: (state) =>
      `Bode does not thank people. He is not that kind of man. But when ${brotherNames[state.lead]} comes to the gate, there is a sack leaning against the post with a knot tied in the old way, and a woman who busies herself with the hens and does not look round.

“For the night of the fire,” says Bode from the barn door, without turning his head. “It is not payment. There is no payment.”`,
    choices: [
      {
        text: 'Take the sack and thank him with a nod.',
        outcome: {
          text: 'It is heavier than it looks. Two measures of good rye, and the knowledge that you may knock at that gate again.',
          effects: ['korn+2', 'rel.bode+1'],
          go: '@next',
        },
      },
    ],
  },
}

export const chapterOneDuskScenes = {
  1: '1.b1e',
  2: '1.b2e',
  3: '1.b3e',
  4: '1.b4e',
  5: '1.b5e',
} as const satisfies Readonly<Record<number, keyof typeof chapterOneScenes>>

export const chapterOneClimaxScene = '1.20' as const

export const chapterOneMorningEvents = [
  '1.ev_fire',
  '1.ev_riders',
  '1.ev_cough',
  '1.ev_thieves',
  '1.ev_bones',
] as const satisfies readonly (keyof typeof chapterOneScenes)[]

export const chapterOneEncounters: EncounterRegistry = [
  { id: 'deserter', chapter: 1, location: 'forest', scene: '1.e_deserter' },
  { id: 'pastor', chapter: 1, location: 'village', scene: '1.e_pastor' },
  { id: 'kuhlmann', chapter: 1, location: 'kuhlmann', scene: '1.e_kuhlmann' },
  { id: 'bode', chapter: 1, location: 'bode', scene: '1.e_bode' },
  {
    id: 'hart_thanks',
    chapter: 1,
    location: 'bode',
    scene: '1.ev_hart_thanks',
    condition: 'flag:helped_fire',
  },
  {
    id: 'hart_cold',
    chapter: 1,
    location: 'bode',
    scene: '1.ev_hart_cold',
    condition: 'flag:fire_ignored',
  },
]
