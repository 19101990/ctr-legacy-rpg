import type { ActionRegistry } from '../content'
import type { GameState } from '../types'

const henningTrust = (state: GameState) =>
  state.lead === 'henning' ? ['trust+1'] : []

// Work for 1654, the year of the copper knob. Several places (the forge, the
// sheepfold, the tavern, the Amt land, the Siemens place) stay open in Chapter 4.
export const chapterThreeActions: ActionRegistry = [
  // The tower
  {
    id: 'scaffold',
    location: 'tower',
    chapter: 3,
    name: 'Work beside Uncle Andreas on the scaffold',
    description: 'Learn the trade: a keyword',
    condition: '!kw:apprentice',
    gate: {
      attr: 'geschick',
      min: 4,
      tags: ['build', 'craft', 'tower', 'carpentry', 'repair'],
      success: {
        text: 'By the third day he stops correcting {n} and starts handing him the harder pieces. “You have the hands,” he says, and that is a speech.',
        effects: ['kw+apprentice', 'ansehen+1', 'xp+1'],
        log: 'Learned the first lessons of the building trade from Uncle Andreas.',
      },
      hard: {
        text: '{n} drops a wooden peg onto the sexton’s foot. Uncle Andreas says a word that the pastor pretends not to hear.',
        effects: ['stam-1'],
      },
    },
  },
  {
    id: 'measures',
    location: 'tower',
    chapter: 3,
    name: 'Learn how he sets out measures with cord and chalk',
    description: 'Get a chalk line. Once',
    once: true,
    gate: {
      attr: 'verstand',
      min: 3,
      tags: ['count', 'craft'],
      success: {
        text: 'He shows {n} how a straight line is made out of a cord, some chalk and a steady wrist. He lets him keep the chalk line.',
        effects: ['item+chalkline', 'xp+1'],
      },
      hard: {
        text: 'The numbers slide out of {n}’s head as quickly as they went in. Uncle sighs and says: tomorrow.',
        effects: [],
      },
    },
  },
  {
    id: 'ladder',
    location: 'tower',
    chapter: 3,
    name: 'Carry water and bread up the ladder for the crew',
    description: 'Uncle remembers. Costs 1 Stamina',
    outcome: {
      text: 'Nobody notices that {n} held the ladder. Uncle Andreas does.',
      effects: ['flag+uncle_favor', 'stam-1'],
    },
  },

  // The village: the list for the tower knob, and the Spinnstube
  {
    id: 'count_honest',
    location: 'village',
    chapter: 3,
    name: 'Prepare an honest count with the schoolmaster',
    description: 'Standing +1',
    once: true,
    condition: '!flag:embellished',
    gate: {
      attr: 'verstand',
      min: 3,
      tags: ['count', 'ledger', 'law'],
      success: {
        text: 'Every number is true and in the right order. The schoolmaster looks at {n} with something close to gratitude. Honest households are rare and easy to write.',
        effects: ['flag+honest_count', 'ansehen+1'],
      },
      hard: {
        text: 'The count is correct, but it comes out in the wrong order and needs three corrections. The schoolmaster writes the household down as muddled.',
        effects: [],
      },
    },
  },
  {
    id: 'count_round',
    location: 'village',
    chapter: 3,
    name: 'Round the numbers up. A good list is a hopeful list',
    description: 'Risky. Standing +2 or minus 2',
    once: true,
    condition: '!flag:honest_count',
    check: {
      attr: 'herz',
      h: 5,
      tags: ['talk', 'trade', 'argue'],
      success: {
        text: '{n} says it so warmly and with so much conviction that the schoolmaster nods. Heinrich’s farm is a little bigger on paper than in the field. It is not a lie if everyone believes it.',
        effects: ['flag+embellished', 'ansehen+2'],
      },
      failure: {
        text: 'A neighbour who has walked the field coughs. The schoolmaster’s pencil stops. It will be repeated in the Spinnstube tonight.',
        effects: ['flag+embellished', 'flag+caught_lie', 'ansehen-2'],
      },
    },
  },
  {
    id: 'spinn_sing',
    location: 'village',
    chapter: 3,
    name: 'Spend an evening in the Spinnstube: sing and court a little',
    description: 'Standing +1. Casper hears of the Siemens place',
    once: true,
    gate: {
      attr: 'herz',
      min: 3,
      tags: ['talk', 'song', 'gossip'],
      success: {
        text: '{n} is a hit. Somebody pushes a mug of small beer into his hand, and somebody else says a thing about the old Siemens place beyond the Brink: a good farm, nobody in the house, a roof that needs a man.',
        effects: ['ansehen+1', 'xp+1', 'flag+siemens_rumor'],
      },
      hard: {
        text: '{n} sings flat and everyone laughs, which is also a kind of friendship. On the way out he hears about the Siemens place beyond the Brink.',
        effects: ['flag+siemens_rumor'],
      },
    },
  },
  {
    id: 'spinn_listen',
    location: 'village',
    chapter: 3,
    name: 'Sit at the edge of the Spinnstube and listen',
    description: 'Henning hears of the herder',
    once: true,
    gate: {
      attr: 'verstand',
      min: 3,
      tags: ['gossip', 'talk', 'count'],
      success: {
        text: 'A farmer’s wife says the old herder’s hands have started to shake. Nobody has said so aloud. Everybody has noticed.',
        effects: ['flag+herder_rumor', 'xp+1', henningTrust],
      },
      hard: {
        text: '{n} catches half of three conversations. None of them is any use.',
        effects: [],
      },
    },
  },
  {
    id: 'apprentice_thanks',
    location: 'village',
    chapter: [3, 4],
    name: 'Uncle Andreas takes you to the tower and teaches you a trick of the trade',
    description: 'Keyword: Master’s apprentice. Needs You saved Jobst from the scaffold. Once',
    once: true,
    condition: ['flag:saved_apprentice', '!kw:apprentice'],
    outcome: {
      text: 'Uncle Andreas does not say thank you. He says: “Hold this.” A plumb line. By evening you know how a master sets out a beam, and he knows that you know, and neither of you has said a word.',
      effects: ['kw+apprentice', 'xp+1'],
    },
  },
  {
    id: 'ask_around',
    location: 'village',
    chapter: [3, 4],
    name: 'Ask around for a farm that needs a man',
    description: 'Hear of the Siemens place. Casper only. Once',
    who: ['casper'],
    once: true,
    condition: '!flag:siemens_rumor',
    gate: {
      attr: 'verstand',
      min: 3,
      tags: ['gossip', 'talk', 'trade'],
      label: 'Ask around',
      success: {
        text: 'It takes three conversations and a mug of small beer. A farm beyond the Brink, the Siemens place: good ground, no one in the house, a roof that needs a man.',
        effects: ['flag+siemens_rumor', 'xp+1'],
      },
      hard: { effects: [] },
    },
  },

  // The forge
  {
    id: 'forge_help',
    location: 'smith',
    chapter: [3, 4],
    name: 'Work the bellows for Master Carsten',
    description: 'Groschen +2, Relationship +1',
    gate: {
      attr: 'kraft',
      min: 3,
      tags: ['build', 'wood'],
      success: {
        text: '{n} pumps the bellows until his shoulders sing. Carsten says nothing, which is a compliment, and pays two Groschen.',
        effects: ['kasse+2', 'rel.carsten+1'],
      },
      hard: {
        text: '{n} works until he is dizzy. Carsten pays one Groschen and a lecture about iron.',
        effects: ['kasse+1'],
      },
    },
  },
  {
    id: 'forge_buy',
    location: 'smith',
    chapter: [3, 4],
    name: 'Buy a hoe from the forge (2 Groschen)',
    description: 'Item: Hoe. Once per chapter',
    once: true,
    cost: { kasse: 2 },
    outcome: {
      text: 'A broad iron hoe, still warm. Carsten spits on the blade for luck.',
      effects: ['item+hoe', 'rel.carsten+1'],
    },
  },
  {
    id: 'smith_awl',
    location: 'smith',
    chapter: [3, 4],
    name: 'Buy an awl and needle at the forge (1 Groschen)',
    description: 'Item: Awl and needle. Once per chapter',
    once: true,
    cost: { kasse: 1 },
    condition: '!item:awl',
    outcome: {
      text: 'A bent nail ground into an awl, a needle the length of a finger. Cheap, and every mended harness afterward is a small victory.',
      effects: ['item+awl'],
    },
  },
  {
    id: 'smith_whet',
    location: 'smith',
    chapter: [3, 4],
    name: 'Buy a whetstone at the forge (1 Groschen)',
    description: 'Item: Whetstone. Once per chapter',
    once: true,
    cost: { kasse: 1 },
    condition: '!item:whetstone',
    outcome: {
      text: 'Carsten weighs it in his palm, names a price and does not haggle. Every edge in the house is about to get better.',
      effects: ['item+whetstone'],
    },
  },
  {
    id: 'smith_goodturn',
    location: 'smith',
    chapter: [3, 4],
    name: 'Do Master Carsten a good turn',
    description: 'Favours +1. Needs Relationship 1. Once per chapter',
    who: ['casper'],
    once: true,
    condition: 'rel.carsten>=1',
    gate: {
      attr: 'herz',
      min: 3,
      tags: ['talk', 'trade'],
      label: 'A good turn',
      success: {
        text: '{n} finds Carsten a buyer for a pile of scrap he has been cursing for a year. The smith, who dislikes being grateful, is grateful.',
        effects: ['gunst+1', 'rel.carsten+1'],
      },
      hard: { effects: [] },
    },
  },
  {
    id: 'smith_tool',
    location: 'smith',
    chapter: [3, 4],
    name: 'Ask Carsten to rehaft and sharpen your tools',
    description: 'Item: Hoe. Costs 1 Favour. Needs Relationship 2',
    once: true,
    condition: ['rel.carsten>=2', '!item:hoe'],
    cost: { gunst: 1 },
    outcome: {
      text: 'Carsten works the handle with his thumbs, spits on the edge and hands it back. It feels as if it belonged to you all along.',
      effects: ['item+hoe', 'rel.carsten+1'],
    },
  },

  // The sheepfold
  {
    id: 'hold_sheep',
    location: 'sheepfold',
    chapter: [3, 4],
    name: 'Hold sheep for the shearers',
    description: 'Groschen +3',
    gate: {
      attr: 'kraft',
      min: 3,
      tags: ['animal', 'herd', 'field'],
      success: {
        text: 'Güldner pays in coin. “You hold them like a man who has held a cow,” he says, which from him is warmth.',
        effects: ['kasse+3', 'flag+guldner_trust', 'rel.guldner+1', henningTrust],
      },
      hard: {
        text: 'A ram takes {n} out at the knees. Güldner pays one Groschen for the entertainment.',
        effects: ['kasse+1', 'stam-1'],
      },
    },
  },
  {
    id: 'lamb_share',
    location: 'sheepfold',
    chapter: [3, 4],
    name: 'Offer to mind the lambs for a share',
    description: 'A lamb of your own. Once',
    once: true,
    check: {
      attr: 'herz',
      h: 4,
      tags: ['animal', 'herd', 'talk'],
      success: {
        text: 'At the end of the week there is a lamb in {n}’s arms and a nod from Güldner.',
        effects: ['vieh.schaf+1', 'xp+1', 'rel.guldner+1', henningTrust],
      },
      failure: {
        text: 'He counts his lambs twice, then counts {n} twice. No deal.',
        effects: [],
      },
    },
  },

  // The tavern
  {
    id: 'kegs',
    location: 'tavern',
    chapter: [3, 4],
    name: 'Carry kegs and listen at Grape’s tavern',
    description: 'Groschen +2. Learn the collector’s habits',
    gate: {
      attr: 'herz',
      min: 3,
      tags: ['talk', 'trade', 'gossip'],
      success: {
        text: '{n} learns that Weideman’s clerk takes his supper late and his first beer fast, and that the collector prefers a debtor who walks in and says so to one who is found hiding.',
        effects: ['kasse+2', 'flag+collector_habits', 'rel.grape+1'],
      },
      hard: {
        text: '{n} carries kegs. That is all he learns.',
        effects: ['kasse+1'],
      },
    },
  },
  {
    id: 'excise',
    location: 'tavern',
    chapter: [3, 4],
    name: 'Learn how the excise is reckoned',
    description: 'XP +2. Once',
    once: true,
    gate: {
      attr: 'verstand',
      min: 4,
      tags: ['count', 'ledger', 'trade'],
      success: {
        text: 'Grape sits {n} down with a tally stick and shows him every notch. He will never be cheated at a counter again.',
        effects: ['xp+2', 'rel.grape+1'],
      },
      hard: {
        text: 'The notches blur. Grape says it is a gift or a curse; he has not decided which.',
        effects: [],
      },
    },
  },

  // The Amt land
  {
    id: 'walk_ground',
    location: 'amtland',
    chapter: [3, 4],
    name: 'Walk the Amt land and see what it is good for',
    description: 'Pasture for the herd. Once',
    once: true,
    gate: {
      attr: 'verstand',
      min: 4,
      tags: ['land', 'field', 'animal', 'herd'],
      success: {
        text: 'It is stony and thin and wet in the hollows, and no plow would ever love it. But cattle would. Good summer grass grows where the stones are scarce, and a herd could cross it without trampling a single field.',
        effects: ['flag+amt_pasture', 'xp+1', henningTrust],
      },
      hard: {
        text: '{n} sees stones. Jost, watching, sees something else and does not tell him.',
        effects: ['stam-1'],
      },
    },
  },
  {
    id: 'mend_fence',
    location: 'amtland',
    chapter: [3, 4],
    name: 'Help Jost mend his fence',
    description: 'Jost is on your side. Costs 1 Stamina',
    once: true,
    outcome: {
      text: 'Mending a fence is a good way to be asked questions. By evening {n} knows his house, his cow and his grudges.',
      effects: ['stam-1', 'xp+1', 'flag+jost_friend', 'rel.jost+1'],
    },
  },
  {
    id: 'ask_strip',
    location: 'amtland',
    chapter: [3, 4],
    name: 'Ask whether a second household could take a strip of Amt land',
    description: 'Land +1, but rent is due. Once',
    once: true,
    check: {
      attr: 'herz',
      h: 4,
      tags: ['talk', 'law', 'land'],
      success: {
        text: 'Jost shrugs. “The Amt will want rent. A little.” He walks {n} along a boundary he has clearly walked many times.',
        effects: ['land+1', 'flag+amt_lease', 'rel.jost+1'],
      },
      failure: {
        text: 'Jost says nothing. His silence is long and complete.',
        effects: [],
      },
    },
  },

  // The Siemens place: Casper's road
  {
    id: 'siemens_work',
    location: 'siemens',
    chapter: [3, 4],
    name: 'Work at the Siemens place for your keep',
    description: 'Casper: a foothold. Once',
    who: ['casper'],
    once: true,
    gate: {
      attr: 'geschick',
      min: 3,
      tags: ['craft', 'repair', 'build', 'field'],
      success: {
        text: 'Casper mends a shutter, then a door, then a roof beam. By the end of the week someone has left a loaf on the step. It is a start.',
        effects: ['flag+siemens_foothold', 'xp+1'],
        log: 'Casper took a first foothold at the empty Siemens place.',
      },
      hard: {
        text: 'The beam wins. He will have to try again with a better plan.',
        effects: ['stam-1'],
      },
    },
  },
  {
    id: 'siemens_widow',
    location: 'siemens',
    chapter: [3, 4],
    name: 'Call on the widow in the next house',
    description: 'Casper: a name. Once',
    who: ['casper'],
    once: true,
    check: {
      attr: 'herz',
      h: 5,
      tags: ['talk', 'smooth', 'trade'],
      success: {
        text: 'Ilsabe (invented; no record names her) keeps the keys, a sharp eye and a sharper tongue. Casper makes her laugh once. It might be a beginning.',
        effects: ['flag+siemens_courtship', 'xp+1'],
        log: 'Casper made the widow next to the Siemens place laugh (invented).',
      },
      failure: {
        text: 'She tells him the land belongs to the dead and the dead do not take visitors.',
        effects: [],
      },
    },
  },
  {
    id: 'siemens_help',
    location: 'siemens',
    chapter: [3, 4],
    name: 'Help Casper with the roof beam',
    description: 'XP +1. Once',
    who: ['andreas', 'henning'],
    once: true,
    gate: {
      attr: 'kraft',
      min: 3,
      tags: ['build', 'field', 'wood'],
      success: {
        text: 'Together they lift what one man could not. Casper says nothing, and means a great deal.',
        effects: ['flag+casper_helped', 'xp+1'],
      },
      hard: {
        text: 'It slips. Casper catches both ends. They laugh later.',
        effects: ['stam-1'],
      },
    },
  },
]
