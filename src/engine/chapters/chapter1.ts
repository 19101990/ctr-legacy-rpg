import type { SectionRegistry } from '../content'

export const chapterOneOpening = {
  '1.00': {
    chapter: 1,
    source: 'inv',
    title: 'The Road Back',
    log: 'Autumn 1648: after years in the hills, the family sets out for home.',
    text: `Smoke hangs low beneath the roof of the earth-hut, trapped there with the smell of damp wool and the last of the rye. For years the family has made a life in the Harz foothills, hidden from soldiers and hunger in a hollow where the wind cannot easily find them. A cow grazes in a ravine by day and is brought close at night. Their stores are counted by the handful. They have learned to speak softly, to mend everything twice, and to treat every unexpected footstep as a warning.

Tonight a drover limps into the clearing. Mud cakes his boots; his coat is torn at the shoulder. He asks for water before he gives them the news. The peace has been signed. The armies are turning for home. No one cheers. The silence that follows is too full: years of fear, the names of those who did not return, and the question of what peace can possibly mean to people with no roof and almost nothing to eat.

Heinrich watches the fire until the sparks settle. The old house still stands in his memory as a line of stones and a patch of dark earth. Other people may have taken it while the family was gone; the fields may be ruined, the neighbours scattered. But waiting in the hills will not make any of that better. “We leave at first light,” he says. “If there is anything left for us, we have to go and see it.”

Ilse ties their few belongings into a patched sack. Her hands shake from cold, though she says it is only the needle. Andreas turns the plan over in his mind: walls first, then a roof strong enough to bear snow. Henning checks the cow’s ribs and wonders whether it can manage the road. Casper keeps talking, filling the hut with guesses about who might still be there and what they might find. Outside, the dark presses against the doorway. Before dawn, they will walk into it.`,
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
    title: 'A Village of Ash',
    text: `By noon the family reaches the place they have been calling home for years. The road narrows between low fields and broken fences, then opens onto a village that seems to have been emptied in a single terrible breath. The church is blackened, but its roof has held. Most of the houses are burned down to their stone footings. Nettles fill the gardens. A door hangs crooked from one surviving wall, tapping softly in the wind.

There are signs that life has not vanished completely. A faint thread of smoke rises beyond the lane; another curls from behind a stand of trees. Heinrich counts three. No one comes out to greet them. The family stands together with their bundles at their feet, listening for a dog, a cart, a human voice. Somewhere water runs over stone, clear and steady, as if it has no knowledge of the war.

The old plot is still marked by its low sill-stones. Briars have swallowed the boundary, and the remains of the house are scattered across the earth, but the soil behind it is dark and deep. A little stream threads past the meadow beyond. Andreas crouches to lift a piece of charred timber, then lets it fall. There is too much work here to begin by mourning every board that is gone.

Heinrich puts his hand on the stone sill of the old house, the way you would touch a horse you have not seen in years. For a moment he says nothing. Then he looks at each of his sons and counts the days on his fingers. “Seven days until frost. We need a roof before then, and a pen for the animals. We need food enough to last the winter. After that, we can think about the fields and the neighbours.”

He glances toward the tree line. Wolves have followed armies before, drawn by the dead and driven close to people. The village is quiet, but quiet is not the same as safe. “Each of you works where he can. Come back before dark. Bring home what the day gives you, and tell us what you see. We have little time, and we do not yet know who else means to return.”`,
    choices: [
      {
        text: 'Begin the first day.',
        go: '@plan',
      },
    ],
  },
} satisfies SectionRegistry
