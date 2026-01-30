# D&D Dice Roller

A lightweight local D&D dice roller and character utility.

Features
- Dice roller (custom selectable dice and counts).
- Short Rest: heals 4d10 + 1d8 HP (uses `shortRest()` and updates health/UI).
- Long Rest: restores rings, spell slots and health to full.
- Character trackers: Initiative list, Currency (gp/sp/cp).
- Magic: Cantrips and Spells UI, spell slots persistence.
- Active Effects: Faerie Fire, Hunter's Mark, Zephyr Strike, Absorb Elements.
- Magic Rings & Weapons: equip up to 3; `Dupo Quiver` supports two-shot chooser and per-shot crit options.
- Crit support: `Crit Next Attack` toggle doubles damage on next non-Dupo attack. Dupo chooser offers per-shot or combined crit options.
- Persistent storage: health, initiative, currency, spell slots, and some toggles are stored in `localStorage`.

Files
- `index.html` — UI and layout.
- `dice.js` — application logic (rolling, spells, rings, weapons, health, UI updates).

Usage
1. Open `index.html` in a browser (double-click or serve the folder).
2. Use the Dice Roller at the top to select dice and roll.
3. In the Magic card:
   - Click `Short Rest (4d10+1d8)` to heal (rolls applied and recorded).
   - Click `Long Rest` to restore resources.
4. In the Weapons card:
   - Equip `Dupo Quiver` via `Magic Weapons` to enable two-shot behavior. After rolling, you'll be offered selection buttons for Shot A / Shot B / Combine — now with Crit options.
   - Toggle `Crit Next Attack` to apply a x2 multiplier to the next single non-Dupo attack.

Notes for developers
- `shortRest()` is implemented in `dice.js` and now rolls `4d10 + 1d8` and calls `changeHealth()` to apply healing.
- Critical handling:
  - Global `critNext` boolean and `toggleCritNext()` manage a one-use x2 multiplier for the next non-Dupo roll.
  - Dupo chooser buttons include `a-crit`, `b-crit`, `combine-crit-a`, `combine-crit-b`, and `combine-crit-both` to apply doubling as selected.
- Ring `Echo Band` consumes per-use counters stored in `magicRings[ringId].currentUses`.

Want changes?
- Tell me if you want the Short Rest healing formula, button labels, or crit behavior adjusted.

License
- This is a small personal utility; no license is specified.

Death & Revival (added behavior)
- When the player's HP reaches 0 the UI will fade to black and the app redirects to `saving-throws.html`.
- `saving-throws.html` is a minimal black-screen mini-game with six circles and a `revive` button:
   - The first three circles are "life" circles — clicking each turns it green; when all three are green you are returned to `index.html` and granted 1 HP.
   - The last three circles are "death" circles — clicking them turns them red but they do not restore HP.
   - The `revive` button immediately returns you to `index.html` and grants 1 HP.

Testing
- Open `index.html` in a browser and reduce health to 0 (use the UI's damage buttons or run a scripted changeHealth call). The screen should fade and redirect to `saving-throws.html`.
- Use the life circles or the revive button to return; after returning your HP will be set to 1.

Files to inspect
- `index.html` — main UI (health displays, dice, weapons)
- `dice.js` — game logic; look for `changeHealth`, `initHealth`, and the `revivedFromDeath` flag handling.

If you'd like the revive mechanic changed (different HP amount, animations, sounds, or different mini-game), tell me what you want and I will implement it.
