import type { ActionRegistry } from '../content'

// Work for February 1664, the week of the Amtsvogt's count. The forge, the
// sheepfold, the tavern, the Amt land and the Siemens place carry over from
// chapterThreeActions (they are available in chapters 3 and 4).
export const chapterFourActions: ActionRegistry = [
  // The count: hide or declare
  {
    id: 'hide_herd',
    location: 'forest',
    chapter: 4,
    name: 'Drive some beasts into the forest glades until the count is done',
    description: 'Hide animals from the count. Once',
    once: true,
    condition: '!flag:honest_ledger',
    check: {
      attr: 'geschick',
      h: 4,
      tags: ['forest', 'hide', 'animal'],
      success: {
        text: 'Three nights in the cold, a lantern in the trees, and the cow comes back thinner but uncounted.',
        effects: ['flag+hid_animals', 'xp+1'],
        log: 'Hid animals in the forest glades before the count, in the old way.',
      },
      failure: {
        text: 'Wolves find the glade before {n} does. He loses a goat and a night’s sleep.',
        effects: ['vieh.ziege-1', 'stam-1'],
      },
    },
  },
  {
    id: 'declare',
    location: 'village',
    chapter: 4,
    name: 'Declare everything honestly',
    description: 'Standing +1. Once',
    once: true,
    condition: '!flag:hid_animals',
    outcome: {
      text: 'It feels like standing in the snow without a coat. But the numbers will be the numbers, and nobody will be able to call them a lie.',
      effects: ['flag+honest_ledger', 'ansehen+1', 'xp+1'],
      log: 'Declared everything honestly to the Amt.',
    },
  },
  {
    id: 'ask_sexton',
    location: 'village',
    chapter: 4,
    name: 'Ask the sexton what the Amt really needs to see',
    description: 'XP +1, Standing +1. Once',
    once: true,
    gate: {
      attr: 'verstand',
      min: 3,
      tags: ['ledger', 'law', 'count'],
      success: {
        text: 'The Amt wants one thing from every house: that the number of mouths, hands, hooves and Morgen add up. A household that adds up can be trusted to pay. Tell the truth, and tell it in order.',
        effects: ['xp+1', 'ansehen+1'],
      },
      hard: {
        text: 'The sexton is busy, and {n} hears about someone else’s trouble instead.',
        effects: [],
      },
    },
  },

  // The council and the herd
  {
    id: 'council_henning',
    location: 'village',
    chapter: 4,
    name: 'Stand up before the council and make the case for the herd',
    description: 'Henning: the horn. Once',
    who: ['henning'],
    once: true,
    contest: {
      attr: 'herz',
      rival: (state) => (state.trust >= 6 ? 4 : state.trust >= 3 ? 6 : 8),
      rivalNote:
        'The herder’s son rolls d6 + 3. Henning’s Trust lowers it: +2 at Trust 3, +1 at Trust 6.',
      tags: ['herd', 'animal', 'talk', 'argue'],
      success: {
        text: 'The room is quiet. The hardest farmer says: “He knows the animals.” That is enough. When Matthias puts down the horn, it will not be his son’s to pick up.',
        effects: ['flag+herder_promised', 'xp+2', 'item+herdhorn', 'trust+2'],
        log: 'The council promised Henning the herd when Matthias Michael steps down.',
      },
      failure: {
        text: 'The son’s friends speak louder. The council promises nothing but does not refuse. “Wait until Matthias is done,” says the pastor, “and see.”',
        effects: ['flag+herder_postponed', 'xp+1', 'trust+1'],
        log: 'The council told Henning to wait for the herd.',
      },
    },
  },
  {
    id: 'council_speak',
    location: 'village',
    chapter: 4,
    name: 'Speak for Henning before the council',
    description: 'Help Henning. Once',
    who: ['andreas', 'casper'],
    once: true,
    condition: (state) => !state.flags.herder_promised && !state.flags.herder_postponed,
    check: {
      attr: 'herz',
      h: 4,
      tags: ['talk', 'kin', 'argue'],
      success: {
        text: '{n} says it plainly. Henning, at the back, is very still. Afterwards a farmer pats {n}’s shoulder and says that the herd could do worse.',
        effects: ['flag+herder_promised', 'ansehen+1', 'xp+1', 'trust+1'],
        log: 'The council promised Henning the herd when Matthias Michael steps down.',
      },
      failure: {
        text: '{n} says too much. The council hears a family arguing for its own.',
        effects: ['flag+herder_postponed'],
        log: 'The council told Henning to wait for the herd.',
      },
    },
  },
  {
    id: 'council_back',
    location: 'village',
    chapter: 4,
    name: 'Back the farmers against the Königs before the council',
    description: 'Standing +1, a feud. Once',
    once: true,
    condition: '!kw:feud',
    outcome: {
      text: 'The room approves. Somewhere a very proud family writes the name on a very long list.',
      effects: ['kw+feud', 'ansehen+1'],
      log: 'Stood with the village against the Königs over the herd.',
    },
  },

  // The word beside the name
  {
    id: 'vouch',
    location: 'village',
    chapter: 4,
    name: 'Ask Pastor Georg Moß to vouch for the household',
    description: 'The pastor’s word. Once',
    once: true,
    condition: '!flag:looted_dead',
    check: {
      attr: 'herz',
      h: 4,
      tags: ['talk', 'law', 'kin'],
      success: {
        text: 'He says the Feldmanns have been in Lochtum longer than the pastor’s own books, and he will write it. A good word is a coin of its own.',
        effects: ['flag+pastor_vouches', 'ansehen+1'],
        log: 'Pastor Georg Moß vouched for the household.',
      },
      failure: {
        text: 'He blesses {n}, kindly, and promises nothing.',
        effects: [],
      },
    },
  },
  {
    id: 'proof',
    location: 'village',
    chapter: 4,
    name: 'Present the elders’ testimony and the old boundary stone',
    description: 'Köthner, not Einlieger. Needs the elders or the Fox',
    once: true,
    condition: (state) =>
      Boolean(
        state.flags.plot_confirmed || state.chars[state.lead].kw.includes('foxsecret'),
      ),
    gate: {
      attr: 'verstand',
      min: 3,
      tags: ['law', 'boundary', 'land', 'ledger'],
      success: {
        text: 'The pastor writes it in the margin. Köthner rather than Einlieger: the difference of one word and a generation.',
        effects: ['flag+plot_proof', 'ansehen+2', 'xp+1'],
        log: 'The old boundary was put on record.',
      },
      hard: {
        text: 'The testimony is sincere and a little muddled. It is noted.',
        effects: ['ansehen+1'],
      },
    },
  },
  {
    id: 'clerk_letter',
    location: 'village',
    chapter: 4,
    name: 'A letter from the clerk you saved reaches Peter Lahman',
    description: 'Counts as proof of your standing. Needs You saved the frozen clerk. Once',
    once: true,
    condition: ['flag:saved_clerk', '!flag:plot_proof'],
    outcome: {
      text: 'It arrives by a boy on a mule, folded very small, in a hand that Lahman recognises. He reads it twice and looks at you over his spectacles. “It seems you are known,” he says, “in places where I would like to be.” He writes a different word beside your name.',
      effects: ['flag+plot_proof', 'ansehen+2', 'xp+1'],
    },
  },

  // Money against the count
  {
    id: 'pledge_weitzel',
    location: 'village',
    chapter: 4,
    name: 'Pledge half a Morgen to Andreas Weitzel for five Thaler',
    description: 'Groschen +6, land minus 1. Once',
    once: true,
    condition: 'land>=1',
    outcome: {
      text: 'It is exactly the kind of arrangement the ledger records: half a Morgen pledged for five Thaler. It feeds the family and shortens the field. (Game coins are simplified.)',
      effects: ['land-1', 'kasse+6', 'flag+debt_weitzel'],
      log: 'Pledged half a Morgen to Andreas Weitzel.',
    },
  },
  {
    id: 'heijer_loan',
    location: 'village',
    chapter: 4,
    name: 'Borrow from Hans Heijer',
    description: 'Groschen +8, a debt. Once',
    once: true,
    check: {
      attr: 'herz',
      h: 5,
      tags: ['talk', 'trade', 'argue'],
      success: {
        text: 'Heijer looks {n} up and down and names a figure. It is more than he wanted and less than he feared. It will be in Heijer’s books by nightfall.',
        effects: ['kasse+8', 'flag+debt_heijer', 'rel.heijer+1'],
        log: 'Borrowed from Hans Heijer.',
      },
      failure: {
        text: '“You are asking me for money?” says Heijer, and laughs, and tells three men.',
        effects: ['ansehen-1'],
      },
    },
  },

  // The chapel and the Fox
  {
    id: 'fox_ask',
    location: 'chapel',
    chapter: 4,
    name: 'Ask, with hands and patience, why a landowner begs',
    description: 'Land +2 for half the crop. Once',
    once: true,
    check: {
      attr: 'herz',
      h: 5,
      tags: ['talk', 'kin', 'animal'],
      success: {
        text: 'It takes the whole afternoon. The answer is that nobody will plow for a deaf man, and the Amt does not accept alms in payment of tax. “Plow it,” says the wife with her hands, “and half is yours.”',
        effects: ['land+2', 'flag+fox_lease', 'xp+1'],
        log: 'Farmed part of the Fox’s land for half the crop.',
      },
      failure: {
        text: '{n} and the Fox make each other laugh a lot and understand each other very little.',
        effects: [],
      },
    },
  },
  {
    id: 'chapel_help',
    location: 'chapel',
    chapter: 4,
    name: 'Bring firewood and a pot of something hot to the chapel dwellers',
    description: 'Standing +1. Costs 1 Store',
    once: true,
    cost: { korn: 1 },
    outcome: {
      text: 'Three people live in the chapel: two men and a widow, with nothing but straw and a bucket. The widow takes the pot in both hands and does not speak. Her eyes are enough.',
      effects: ['ansehen+1', 'xp+1', 'rel.pastor+1'],
    },
  },
  {
    id: 'fox_share',
    location: 'chapel',
    chapter: 4,
    name: 'Share a loaf with the Deaf and White Fox',
    description:
      'He walks you along the old boundary, from the chapel stone to your plot. Costs 1 Store. Once',
    once: true,
    cost: { korn: 1 },
    outcome: {
      text: 'The Fox eats half the loaf, wipes his hands and stands. He leads {n} out of the chapel door to a mossy stone beside the wall, the height of a child, with a cross and a line cut into it. He lays his palm on it. Then he points down the street, away from the chapel, and starts walking.\n\nThis is the first stone of the old boundary walk, the Grenzgang, that the village made every spring before the war. The Fox walked it as a boy behind his father. He does not stop at the church: he follows the line stone by stone, past the Brink, past Kuhlmann’s hedge, down the street and over the Schamlah, until he kneels by a half-buried stone in the briars at Steinborn Spring. It is the corner of the Feldmann plot. Without him nobody alive could have found it.\n\nOn the way back the Fox pats {n}’s chest, then his own. The chapel stone and the plot stone are one line, and now {n} knows it.',
      effects: ['kw+foxsecret', 'xp+1'],
      log: 'The Deaf and White Fox walked the old boundary with us, from the chapel stone to our plot (invented in detail).',
    },
  },

  // Casper's road: a place of his own
  {
    id: 'siemens_foothold2',
    location: 'siemens',
    chapter: 4,
    name: 'Return to the Siemens place and mend what winter broke',
    description:
      'Casper only. Costs 1 Favour. Needs 2 Favours in hand if you have no foothold from Chapter 3',
    who: ['casper'],
    once: true,
    condition: [
      '!flag:siemens_buyin',
      (state) => !state.flags.siemens_foothold && state.hof.gunst >= 2,
    ],
    cost: { gunst: 1 },
    outcome: {
      text: 'Casper spends a day with a ladder and a bucket of clay. When the widow next door looks over the fence she sees a man who is planning to stay.',
      effects: ['flag+siemens_foothold'],
    },
  },
  {
    id: 'siemens_buyin',
    location: 'siemens',
    chapter: 4,
    name: 'Offer the Siemens heirs a buy-in (Einkauf)',
    description:
      'Casper takes the place as tenant. Costs 3 Favours and 4 Groschen. Needs a foothold',
    who: ['casper'],
    once: true,
    condition: ['flag:siemens_foothold', '!flag:siemens_buyin'],
    cost: { gunst: 3, kasse: 4 },
    outcome: {
      text: 'The heirs, scattered in three villages, want the arrears paid and a man in the house. Casper has neighbours who say he is honest and a purse that says he is serious. Papers are drawn up by Peter Lahman’s clerk. For the first time, a Feldmann son has a door of his own.',
      effects: ['flag+siemens_buyin', 'ansehen+1', 'xp+2'],
      log: 'Casper bought into the Siemens place (invented).',
    },
  },
  {
    id: 'siemens_betroth',
    location: 'siemens',
    chapter: 4,
    name: 'Ask the widow’s family for her hand',
    description: 'Casper marries into the place. Costs 2 Favours. Needs the courtship',
    who: ['casper'],
    once: true,
    condition: [
      'flag:siemens_courtship',
      '!flag:siemens_buyin',
      '!flag:casper_betrothed',
    ],
    cost: { gunst: 2 },
    outcome: {
      text: 'Ilsabe’s uncle asks three questions. Casper has people who can answer all of them. By the end of the evening there is a handshake, a jug, and a date after Easter.',
      effects: ['flag+casper_betrothed', 'ansehen+1', 'xp+2'],
      log: 'Casper was promised to the widow near the Siemens place (invented).',
    },
  },
]
