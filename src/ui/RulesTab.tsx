export function RulesTab() {
  return (
    <section className="rules-card">
      <p className="section-label">The household’s rules</p>
      <h2>How to play</h2>
      <p>Each chapter lasts a set number of days (seven in Chapter 1, six in Chapter 2, five each in Chapters 3 and 4). Each day, choose one task for each brother; plans resolve in Andreas, Henning, Casper order.</p>
      <h3>Work and checks</h3>
      <ul>
        <li><strong>Ordinary work:</strong> the action’s description shows its costs and likely results. Physical effort may cost Stamina.</li>
        <li><strong>Checks:</strong> roll a d6 and add the brother’s relevant attribute, up to +2 from matching items, and up to two matching trait helps. Conditions can subtract up to 2.</li>
        <li><strong>Target checks:</strong> meet or exceed the target. A contest succeeds only by beating the rival; ties go to the rival.</li>
        <li><strong>Gates:</strong> these do not roll. Meet the displayed minimum for the easier result; otherwise the work may still succeed the hard way with different effects.</li>
        <li><strong>Natural rolls:</strong> a natural 6 grants Shine (+1 XP); a natural 1 causes a Stamina mishap. After a failed check, spend 1 Grit to reroll once.</li>
      </ul>
      <h3>Stamina, dusk, and growth</h3>
      <ul>
        <li>Stamina is shared across the chapter. Rest at the hearth restores 3 and removes Weary and Wounded.</li>
        <li>At dusk, meals consume Stores unless the animals provide supper. Shelter and food determine overnight recovery; hunger and cold can reduce Stamina.</li>
        <li>Brothers who work (rather than rest) gain 1 XP at dusk. Reaching a road checkpoint grants 2 XP once.</li>
        <li>Spend XP on a brother’s sheet: an attribute increase costs its current score +2; maximum Stamina costs 5 XP; Grit costs 4 XP.</li>
      </ul>
      <h3>Chapter goals</h3>
      <p>Heinrich’s list names what the household has to carry through the chapter. In Chapter 1 that is the roof, the pen, Stores, land, the spring, a neighbour’s favour and Standing. In Chapter 2 it is Stores to the thaw, the cow, and how you answer the people who knock. In Chapter 3 it is the roof and land that make Heinrich a farmer on the tower list, an honest count, and peace between the brothers. In Chapter 4 it is what the clerk will write beside the name, the herd before the council, and the brothers at one table. The last day of a chapter closes the list and lets you move on.</p>
    </section>
  )
}
