// Funny failure phrases
const failPhrases = [
"You failed so bad I'm impressed!",
"You do this a lot huh?",
"Epic fail! ",
"The dice hate you today.",
"Try again...  or not.",
"That was spectacularly bad! ",
"You rolled a 1.  Ouch! ",
"Is this your superpower?",
"You couldn't fail harder if you tried!",
"The universe is laughing at you."
];

const MAX_DICE_COUNT = 20; // Prevent freezing from too many dice

function showFailMessage() {
const failDiv = document.getElementById('fail-message');
failDiv.textContent = failPhrases[Math.floor(Math.random() * failPhrases.length)];
failDiv.style.display = 'block';
failDiv.style.animation = 'flashFail 1s steps(2, start) infinite';
setTimeout(() => {
failDiv.style.display = 'none';
failDiv.style.animation = '';
}, 2500);
}

// Add flashing animation to page
const style = document.createElement('style');
style.textContent = `@keyframes flashFail { 0%{opacity:1;} 50%{opacity:0;} 100%{opacity:1;} }`;
document.head.appendChild(style);

// Global lowest mode toggled by clicking the 'Choose' label
let globalLowest = false;
document.getElementById('choose-label').addEventListener('click', function() {
globalLowest = !globalLowest;
});

// Global loaded mode toggled by clicking the title
let globalLoaded = false;
let diceCountInput = document.getElementById('dice-count');

function attachDiceInputListeners(inputElem) {
inputElem.addEventListener('input', function() {
updateDiceSelectors();
});
inputElem.addEventListener('keydown', function(e) {
if (e.key === 'Enter') {
document.getElementById('roll-btn').click();
}
});
}

// Toggle loaded mode by clicking the title
document.getElementById('dice-title').addEventListener('click', function() {
globalLoaded = !globalLoaded;
});

attachDiceInputListeners(diceCountInput);

function switchToNumberInput() {
const parent = diceCountInput.parentNode;
const newInput = document.createElement('input');
newInput.type = 'number';
newInput.id = 'dice-count';
newInput.value = '1';
newInput.min = '1';
newInput.max = MAX_DICE_COUNT.toString();
newInput.style.width = '50px';
parent.replaceChild(newInput, diceCountInput);
diceCountInput = newInput;
attachDiceInputListeners(newInput);
updateDiceSelectors();
}

// D&D Dice Roller Logic
function rollDie(sides) {
// All faces have equal chance
return Math.floor(Math.random() * sides) + 1;
}

// Roll ID generator for tracking which effects applied to which roll
let _rollCounter = 0;
let lastRollId = null;
function generateRollId() {
    _rollCounter += 1;
    return `${Date.now()}-${_rollCounter}`;
}

// Roll history (most recent first)
const rollHistory = [];
const MAX_HISTORY = 5;

function recordRoll(entry) {
    // entry: { total, title, breakdownHtml, isCritSuccess, isCritFail, time }
    entry.time = new Date().toISOString();
    rollHistory.unshift(entry);
    if (rollHistory.length > MAX_HISTORY) rollHistory.pop();
    updateResultsUI();
}

function updateResultsUI() {
    const weaponOutput = document.getElementById('weapon-output');
    if (!weaponOutput) return;

    if (rollHistory.length === 0) {
        weaponOutput.innerHTML = '';
        return;
    }

    const recent = rollHistory[0];

    let recentClass = '';
    if (recent.isCritSuccess) recentClass = 'crit-success';
    else if (recent.isCritFail) recentClass = 'crit-fail';

    let html = '<div class="recent-roll">';
    html += `<div class="recent-meta ${recentClass}">${recent.title || 'Most recent roll'}</div>`;
    html += `<div class="recent-value ${recentClass}">${recent.total}</div>`;
    if (recent.breakdownHtml) html += `<div style="width:100%;max-width:720px;margin-top:8px;">${recent.breakdownHtml}</div>`;
    html += '</div>';

    // History
    html += '<div class="roll-history">';
    for (let i = 1; i < rollHistory.length; i++) {
        const it = rollHistory[i];
        html += `<div class="roll-history-item"><div style="font-weight:700;color:#fff">${it.title || 'Roll'}</div><div style="color:#ccc">${it.total}</div></div>`;
    }
    html += '</div>';

    weaponOutput.innerHTML = html;
}

function rollDamageDie(sides) {
    // Weighted roll for damage - higher chance of rolling 4 or higher
    // Uses sqrt transformation: sqrt(x) compresses low values and expands high values
    // This makes higher die faces more probable when multiplied by sides
    // Example: For d6, this gives ~75% chance of rolling 4+, vs ~50% for fair dice
    const random = Math.random();
    const weightedRandom = Math.sqrt(random);
    return Math.floor(weightedRandom * sides) + 1;
}

function animateRoll(sides, callback) {
    const diceFace = document.getElementById('dice-face');
    const diceNumber = document.getElementById('dice-number');
    // If the specific animation DOM nodes are not present, fall back to a simple roll
    if (!diceFace || !diceNumber) {
        const result = rollDie(sides);
        if (callback) callback(result);
        return;
    }
    diceFace.classList.add('rolling');
    let frames = 20;
    let interval = 30;
    let count = 0;
    const rollAnim = setInterval(() => {
        diceNumber.textContent = Math.floor(Math.random() * sides) + 1;
        count++;
        if (count >= frames) {
            clearInterval(rollAnim);
            diceFace.classList.remove('rolling');
            const result = rollDie(sides);
            diceNumber.textContent = result;
            if (callback) callback(result);
        }
    }, interval);
}

// Loaded mode toggle
let loaded = false;

function getDiceShape(sides) {
// SVG or Unicode for each die type
switch (sides) {
case 4: 
// Tetrahedron (d4)
return '<svg width="60" height="60" viewBox="0 0 60 60"><polygon points="30,5 55,55 5,55" fill="#444" stroke="#fff" stroke-width="2"/></svg>';
case 6:
// Cube (d6)
return '<svg width="60" height="60" viewBox="0 0 60 60"><rect x="10" y="10" width="40" height="40" fill="#444" stroke="#fff" stroke-width="2"/></svg>';
case 8:
// Octahedron (d8)
return '<svg width="60" height="60" viewBox="0 0 60 60"><polygon points="30,5 55,30 30,55 5,30" fill="#444" stroke="#fff" stroke-width="2"/></svg>';
case 10:
// d10
return '<svg width="60" height="60" viewBox="0 0 60 60"><polygon points="30,5 50,20 55,40 45,55 15,55 5,40 10,20" fill="#444" stroke="#fff" stroke-width="2"/></svg>';
case 12:
// Dodecahedron (d12)
return '<svg width="60" height="60" viewBox="0 0 60 60"><polygon points="30,5 50,15 55,35 45,55 15,55 5,35 10,15" fill="#444" stroke="#fff" stroke-width="2"/></svg>';
case 20:
// Icosahedron (d20)
return '<svg width="60" height="60" viewBox="0 0 60 60"><polygon points="30,5 55,20 55,40 30,55 5,40 5,20" fill="#444" stroke="#fff" stroke-width="2"/></svg>';
default:
return '';
}
}

function createDiceFace(index, sides) {
const diceFace = document.createElement('div');
diceFace.className = 'dice-face';
diceFace.style.position = 'relative';
diceFace.style.width = '70px';
diceFace.style.height = '70px';
diceFace.style.display = 'flex';
diceFace.style.alignItems = 'center';
diceFace.style.justifyContent = 'center';
diceFace.style.background = 'none';
diceFace.style.margin = '0 5px';
diceFace.innerHTML = `
       <div class="dice-shape" style="position: absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;">${getDiceShape(sides)}</div>
       <span class="dice-number" style="position:relative;font-size:2em;color:#fff;z-index:1;">? </span>
   `;

// Add click to roll highest if loaded mode is active
diceFace.addEventListener('click', function() {
const diceNumber = diceFace.querySelector('.dice-number');
if (globalLoaded) {
diceNumber.textContent = sides;
} else if (globalLowest) {
diceNumber.textContent = 1;
}
});

return diceFace;
}

function animateRollDice(sides, count, loadedMode) {
const diceFacesContainer = document.getElementById('dice-faces');
diceFacesContainer.innerHTML = '';
const diceFaces = [];

for (let i = 0; i < count; i++) {
const diceFace = createDiceFace(i, sides);
diceFacesContainer.appendChild(diceFace);
diceFaces.push(diceFace);
}

diceFaces.forEach((diceFace, i) => {
const diceNumber = diceFace.querySelector('.dice-number');
diceFace.classList.add('rolling');
let frames = 20;
let interval = 30;
let frameCount = 0;
const rollAnim = setInterval(() => {
diceNumber.textContent = Math.floor(Math.random() * sides) + 1;
frameCount++;
if (frameCount >= frames) {
clearInterval(rollAnim);
diceFace.classList.remove('rolling');
let result;
// Loaded mode applies to every other die if count > 2
if (loadedMode && (count <= 2 ?  true : i % 2 === 0)) {
result = sides;
} else {
result = rollDie(sides);
}
diceNumber.textContent = result;
}
}, interval);
});
}

const diceTypes = [4, 6, 8, 10, 12, 20];

function updateDiceSelectors() {
let count = parseInt(document.getElementById('dice-count').value);

// Validate dice count
if (isNaN(count) || count < 1) {
count = 1;
document.getElementById('dice-count').value = '1';
}

// Prevent freezing from too many dice
if (count > MAX_DICE_COUNT) {
count = MAX_DICE_COUNT;
document.getElementById('dice-count').value = MAX_DICE_COUNT.toString();
alert(`Maximum ${MAX_DICE_COUNT} dice allowed to prevent performance issues.`);
}

const diceSelectors = document.getElementById('dice-selectors');
diceSelectors.innerHTML = '';

for (let i = 0; i < count; i++) {
const select = document.createElement('select');
select.className = 'dice-select';
diceTypes.forEach(type => {
const option = document.createElement('option');
option.value = type;
option.textContent = `d${type}`;
select.appendChild(option);
});
diceSelectors.appendChild(select);
}
}

// Initialize dice selectors
updateDiceSelectors();

function animateRollDiceMulti(sidesArr, loadedMode) {
const diceFacesContainer = document.getElementById('dice-faces');
diceFacesContainer.innerHTML = '';
const diceTotal = document.getElementById('dice-total');
diceTotal.textContent = '';

const diceFaces = [];
let results = Array(sidesArr.length).fill(0);

sidesArr.forEach((sides, i) => {
const diceFace = createDiceFace(i, sides);
diceFace.dataset.index = i;
diceFacesContainer.appendChild(diceFace);
diceFaces.push(diceFace);
});

let failTriggered = false;

diceFaces.forEach((diceFace, i) => {
const diceNumber = diceFace.querySelector('.dice-number');
diceFace.classList.add('rolling');
let frames = 20;
let interval = 30;
let frameCount = 0;
const rollAnim = setInterval(() => {
diceNumber.textContent = Math.floor(Math.random() * sidesArr[i]) + 1;
frameCount++;
if (frameCount >= frames) {
clearInterval(rollAnim);
diceFace.classList.remove('rolling');
let result = globalLoaded ? sidesArr[i] : (globalLowest ? 1 : rollDie(sidesArr[i]));
diceNumber.textContent = result;
results[i] = result;

if (result === 1 && !failTriggered) {
failTriggered = true;
showFailMessage();
}

// Show total after all dice finish
if (results.every(r => r > 0)) {
                const total = results.reduce((a, b) => a + b, 0);
                diceTotal.textContent = `Total: ${total}`;
                // detect crits on any d20
                let isCritSuccess = false;
                let isCritFail = false;
                sidesArr.forEach((sides, idx) => {
                    if (sides === 20) {
                        if (results[idx] === 20) isCritSuccess = true;
                        if (results[idx] === 1) isCritFail = true;
                    }
                });
                const breakdown = sidesArr.map((s, idx) => `${s}:[${results[idx]}]`).join(', ');
                recordRoll({ total, title: 'Custom Roll', breakdownHtml: `<div style="color:#fff">${breakdown}</div>`, isCritSuccess, isCritFail });
}
}
}, interval);
});
}

document.getElementById('roll-btn').addEventListener('click', () => {
const selects = document.querySelectorAll('.dice-select');
if (selects.length === 0) {
return; // No dice to roll
}
const sidesArr = Array.from(selects).map(sel => parseInt(sel.value));
animateRollDiceMulti(sidesArr, loaded);
});

// Character Weapon System

/*
Math & Outcome Notes (for developer view only):

- rollWeaponDice(dice, modifier, description):
    - `dice` is an array of dice notation strings (e.g., ['2d6','1d8']).
    - `modifier` is a flat numeric bonus added to the total (e.g., attack bonuses or static modifiers).
    - The function computes an initial `total` starting from `modifier` plus any `ringBonusTotal`.
        * ringBonusTotal: if a magic ring is available, we roll its damage dice and apply its damageModifier (e.g., ÷2 for Echo Band), then add that final value to the running total.

- Dice rolling:
    - For each dice notation `XdY`, we roll `X` times using `rollDamageDie(Y)` (a weighted damage roll that biases higher outcomes).
    - Each die roll is added to `total` and recorded in `rolls` for display.

- Active effects (bonus dice like Hunter's Mark or Zephyr Strike):
    - We collect `activeEffects` that include `bonusDice` and filter only those that are `state === 'active'` and not already applied to this roll (tracked via `appliedRolls` array and `rollId`).
    - For each chosen bonus effect we roll its `bonusDice` (fair `rollDie`) and add the sub-total to `total`.
    - If an effect is `oneTime`, we mark it `state = 'consumed'` after applying.

- Dupo Quiver special case:
    - If the `dupo-quiver` is equipped, we perform two independent damage calculations (Shot A and Shot B):
        * Shot A includes the current `ringBonusTotal` and its own application of active bonus dice (and marks those effect applications with the original `rollId`).
        * Shot B is an independent roll (separate `rollId`) and has bonus effects applied separately (so effects that can apply to both will be rolled and marked twice if appropriate).
    - Both shots are presented to the user with full breakdowns (individual dice arrays, applied bonus dice, and totals). The user then chooses which shot to accept. Choosing records that chosen shot to `recordRoll()` and updates the Results output.

- Recording & UI:
    - After a completed non-Dupo roll we show a breakdown of individual dice, any ring details, any applied bonus effect breakdowns, and the final `total`.
    - We call `recordRoll()` with `{ total, title, breakdownHtml, isCritSuccess, isCritFail }` so the roll history UI can display the result.

Notes:
    - `rollDamageDie()` intentionally biases damage rolls upward using `Math.sqrt(Math.random())` to make high faces more likely for damage (design choice).
    - `rollDie()` is a fair die used for effect bonus dice and crit detection (e.g., d20 checks).
    - Effect application is guarded with marking (`appliedRolls`) to avoid double-applying the same effect to a single roll.

Keep this comment here for quick reference when adjusting damage math or adding new special weapon behavior.
*/

function rollWeaponDice(dice, modifier, description) {
const weaponOutput = document.getElementById('weapon-output');
weaponOutput.innerHTML = '<div style="color: #fff;">Rolling...</div>';

    // generate a unique roll id for this calculation and record it
    const rollId = generateRollId();
    lastRollId = rollId;

// Auto-apply a magic ring bonus (if any equipped and has uses remaining)
let ringBonusTotal = 0;
let ringUsedId = null;
const nextRingId = getNextAvailableRing();
let ringRollDetails = null;
if (nextRingId) {
    const ring = magicRings[nextRingId];
    const diceMatch = ring.damage.match(/^(\d+)d(\d+)$/);
    if (diceMatch) {
        const count = parseInt(diceMatch[1]);
        const sides = parseInt(diceMatch[2]);
        let ringTotal = 0;
        let ringRolls = [];
        for (let i = 0; i < count; i++) {
            const r = rollDamageDie(sides);
            ringRolls.push(r);
            ringTotal += r;
        }
        const finalDamage = Math.max(1, Math.floor(ringTotal * ring.damageModifier));
        // consume a use
        ring.currentUses = Math.max(0, ring.currentUses - 1);
        ringBonusTotal = finalDamage;
        ringUsedId = nextRingId;
        ringRollDetails = { id: nextRingId, name: ring.name, rolls: ringRolls, total: ringTotal, final: finalDamage };
    }
}

// Special handling: Dupo Quiver (double shot) if equipped
if (Array.isArray(equippedWeapons) && equippedWeapons.indexOf('dupo-quiver') !== -1) {
    // First shot (includes ring bonus if any)
    const rollAId = rollId;
    let totalA = modifier + ringBonusTotal;
    const rollsA = [];
    dice.forEach(diceStr => {
        const [count, sides] = diceStr.split('d').map(n => parseInt(n));
        const arr = [];
        for (let i = 0; i < count; i++) {
            const r = rollDamageDie(sides);
            arr.push(r);
            totalA += r;
        }
        rollsA.push({ dice: diceStr, rolls: arr });
    });

    // Apply bonus effects to shot A (mark by rollAId)
    let hunterAHtml = '';
    try {
        const potential = activeEffects.filter(e => e && e.bonusDice);
        const toApplyA = potential.filter(e => e.state === 'active' && (!Array.isArray(e.appliedRolls) || e.appliedRolls.indexOf(rollAId) === -1));
        toApplyA.forEach(b => {
            if (!Array.isArray(b.appliedRolls)) b.appliedRolls = [];
            if (b.appliedRolls.indexOf(rollAId) === -1) b.appliedRolls.push(rollAId);
            const match = b.bonusDice.match(/^(\d+)d(\d+)$/);
            if (match) {
                const c = parseInt(match[1], 10);
                const s = parseInt(match[2], 10);
                const rarr = [];
                let st = 0;
                for (let i = 0; i < c; i++) { const rv = rollDie(s); rarr.push(rv); st += rv; }
                totalA += st;
                hunterAHtml += `<div style="color:#fff; margin:5px 0">${b.name} Bonus (${b.bonusDice}): [${rarr.join(', ')}] = ${st}</div>`;
                if (b.oneTime) b.state = 'consumed';
            }
        });
    } catch (e) {
        console.error('Dupo A apply error', e);
    }

    // Second shot (no ring bonus) as independent roll
    const rollBId = generateRollId();
    let totalB = modifier;
    const rollsB = [];
    dice.forEach(diceStr => {
        const [count, sides] = diceStr.split('d').map(n => parseInt(n));
        const arr = [];
        for (let i = 0; i < count; i++) {
            const r = rollDamageDie(sides);
            arr.push(r);
            totalB += r;
        }
        rollsB.push({ dice: diceStr, rolls: arr });
    });

    // Apply bonus effects to shot B (mark by rollBId)
    let hunterBHtml = '';
    try {
        const potential = activeEffects.filter(e => e && e.bonusDice);
        const toApplyB = potential.filter(e => e.state === 'active' && (!Array.isArray(e.appliedRolls) || e.appliedRolls.indexOf(rollBId) === -1));
        toApplyB.forEach(b => {
            if (!Array.isArray(b.appliedRolls)) b.appliedRolls = [];
            if (b.appliedRolls.indexOf(rollBId) === -1) b.appliedRolls.push(rollBId);
            const match = b.bonusDice.match(/^(\d+)d(\d+)$/);
            if (match) {
                const c = parseInt(match[1], 10);
                const s = parseInt(match[2], 10);
                const rarr = [];
                let st = 0;
                for (let i = 0; i < c; i++) { const rv = rollDie(s); rarr.push(rv); st += rv; }
                totalB += st;
                hunterBHtml += `<div style="color:#fff; margin:5px 0">${b.name} Bonus (${b.bonusDice}): [${rarr.join(', ')}] = ${st}</div>`;
                if (b.oneTime) b.state = 'consumed';
            }
        });
    } catch (e) {
        console.error('Dupo B apply error', e);
    }

    // Build display HTML for both shots and provide selection buttons
    let aHtml = `<div style="color:#fff; margin:5px 0; font-weight:700">Shot A</div>`;
    rollsA.forEach(r => { aHtml += `<div style="color:#fff;margin:4px 0;">${r.dice}: [${r.rolls.join(', ')}]</div>`; });
    aHtml += hunterAHtml;
    aHtml += `<div style="margin-top:8px;color:#ff0;font-weight:700;">Total A: ${totalA}</div>`;

    let bHtml = `<div style="color:#fff; margin:5px 0; font-weight:700">Shot B</div>`;
    rollsB.forEach(r => { bHtml += `<div style="color:#fff;margin:4px 0;">${r.dice}: [${r.rolls.join(', ')}]</div>`; });
    bHtml += hunterBHtml;
    bHtml += `<div style="margin-top:8px;color:#ff0;font-weight:700;">Total B: ${totalB}</div>`;

    // store for chooser
    _lastDupoA = { total: totalA, html: aHtml };
    _lastDupoB = { total: totalB, html: bHtml };
    _lastDupoDesc = description;

    let combined = `<div style="margin-bottom:15px;color:#0f0;font-weight:bold;">${description} — Dupo Quiver (two shots)</div>`;
    combined += `<div style="display:flex;gap:20px;flex-wrap:wrap;">`;
    combined += `<div style="flex:1;min-width:220px;background:#222;padding:10px;border-radius:6px;">${aHtml}<div style="text-align:center;margin-top:10px;"><button class=\"weapon-btn\" onclick=\"chooseDupoResult('a')\">Choose Shot A</button></div></div>`;
    combined += `<div style="flex:1;min-width:220px;background:#222;padding:10px;border-radius:6px;">${bHtml}<div style="text-align:center;margin-top:10px;"><button class=\"weapon-btn\" onclick=\"chooseDupoResult('b')\">Choose Shot B</button></div></div>`;
    combined += `</div>`;

    // show ring details if used
    if (ringUsedId && ringRollDetails) {
        combined += `<div style="color:#fff;margin-top:10px;">Ring Bonus - ${ringRollDetails.name}: [${ringRollDetails.rolls.join(', ')}] = ${ringRollDetails.total} → ${ringRollDetails.final}</div>`;
        updateRingStatus();
    }

    const wo = document.getElementById('weapon-output');
    if (wo) wo.innerHTML = combined;
    return;
}

// Parse dice notation (e.g., "3d6", "1d8") and include ring bonus in the total
let total = modifier + ringBonusTotal;
let rolls = [];

dice.forEach(diceStr => {
    const [count, sides] = diceStr.split('d').map(n => parseInt(n));
    let diceRolls = [];
    for (let i = 0; i < count; i++) {
        const roll = rollDamageDie(sides);
        diceRolls.push(roll);
        total += roll;
    }
    rolls.push({ dice: diceStr, rolls: diceRolls });
});

// Display results
let resultHTML = `<div style="margin-bottom: 15px; color: #0f0; font-weight: bold;">${description}</div>`;

rolls.forEach(r => {
resultHTML += `<div style="color: #fff; margin: 5px 0;">${r.dice}:  [${r.rolls.join(', ')}]</div>`;
});

// Apply active-effect bonus dice (e.g., Hunter's Mark, Zephyr Strike)
let hunterDetailsHTML = '';
let skippedEffectsHTML = '';
// all effects that provide bonus dice (could be active or consumed)
const potentialBonusEffects = activeEffects.filter(e => e && e.bonusDice);
// effects to apply: active and not already applied to this roll
const toApply = potentialBonusEffects.filter(e => e.state === 'active' && (!Array.isArray(e.appliedRolls) || e.appliedRolls.indexOf(rollId) === -1));
const toSkip = potentialBonusEffects.filter(e => !(e.state === 'active' && (!Array.isArray(e.appliedRolls) || e.appliedRolls.indexOf(rollId) === -1)));

// Defensive marking: mark chosen effects as pending for this roll before any dice rolling
const markedEffects = [];
let removedAny = false;
try {
    toApply.forEach(b => {
        if (!Array.isArray(b.appliedRolls)) b.appliedRolls = [];
        // double-check and mark immediately to prevent concurrent application
        if (b.appliedRolls.indexOf(rollId) === -1) {
            b.appliedRolls.push(rollId);
            markedEffects.push(b);
        }
    });

    // Now perform the rolls for markedEffects
    markedEffects.forEach(b => {
        const match = b.bonusDice.match(/^(\d+)d(\d+)$/);
        if (match) {
            const c = parseInt(match[1], 10);
            const s = parseInt(match[2], 10);
            const rollsArr = [];
            let subTotal = 0;
            for (let i = 0; i < c; i++) {
                const r = rollDie(s);
                rollsArr.push(r);
                subTotal += r;
            }
            total += subTotal;
            hunterDetailsHTML += `<div style="color:#fff; margin: 5px 0;">${b.name} Bonus (${b.bonusDice}): [${rollsArr.join(', ')}] = ${subTotal}</div>`;

            // mark consumed if one-time (deactivate)
            if (b.oneTime) {
                b.state = 'consumed';
                removedAny = true;
            }
        }
    });
} catch (err) {
    // Roll failed unexpectedly; revert any appliedRolls marks to allow future attempts
    console.error('Error applying bonus effects:', err);
    markedEffects.forEach(b => {
        if (Array.isArray(b.appliedRolls)) {
            const idx = b.appliedRolls.indexOf(rollId);
            if (idx !== -1) b.appliedRolls.splice(idx, 1);
        }
        if (b.oneTime && b.state === 'consumed') {
            // revert consumed state if we set it
            b.state = 'active';
        }
    });
    // show a safe message but continue with whatever has been computed
    skippedEffectsHTML += `<div style="color:#f99; margin:4px 0;">Error applying some effects; they were not applied.</div>`;
}

// Build skipped messages (already applied this roll or consumed)
toSkip.forEach(b => {
    const appliedHere = Array.isArray(b.appliedRolls) && b.appliedRolls.indexOf(rollId) !== -1;
    const reason = b.state === 'consumed' ? 'already consumed' : (appliedHere ? 'already applied to this roll' : null);
    if (reason) {
        skippedEffectsHTML += `<div style="color:#f99; margin:4px 0;">${b.name}: ${reason} — not applied.</div>`;
    }
});

if (removedAny) {
    // refresh UI and highlights silently
    updateActiveEffectsUI();
    updateAttackHighlights();
}

resultHTML += hunterDetailsHTML;
if (skippedEffectsHTML) resultHTML += `<div style="margin-top:8px;color:#f88;font-size:0.95em;">Effects skipped:<div style="margin-top:6px;">${skippedEffectsHTML}</div></div>`;

resultHTML += `<div style="margin-top: 15px; color:  #ff0; font-size: 1.3em; font-weight: bold;">Total Damage: ${total}</div>`;

// If a ring bonus was applied, show its details and update ring UI
if (ringUsedId && ringRollDetails) {
    resultHTML = `<div style="margin-bottom: 15px; color: #0f0; font-weight: bold;">${description}</div>`;
    rolls.forEach(r => {
        resultHTML += `<div style="color: #fff; margin: 5px 0;">${r.dice}:  [${r.rolls.join(', ')}]</div>`;
    });
    resultHTML += `<div style="color: #fff; margin: 10px 0;">Ring Bonus - ${ringRollDetails.name}: [${ringRollDetails.rolls.join(', ')}] = ${ringRollDetails.total} → ${ringRollDetails.final}</div>`;
    resultHTML += hunterDetailsHTML;
    resultHTML += `<div style="margin-top: 15px; color:  #ff0; font-size: 1.3em; font-weight: bold;">Total Damage: ${total}</div>`;
    weaponOutput.innerHTML = resultHTML;
    updateRingStatus();
    // Record the roll with its unique id for tracking
    recordRoll({ total, title: description, breakdownHtml: resultHTML, isCritSuccess: false, isCritFail: false, rollId });
} else {
    weaponOutput.innerHTML = resultHTML;
    recordRoll({ total, title: description, breakdownHtml: resultHTML, isCritSuccess: false, isCritFail: false, rollId });
}
}

// Initiative
function rollInitiative() {
const weaponOutput = document.getElementById('weapon-output');
const roll = rollDie(20);
const total = roll + 6;
weaponOutput.innerHTML = `
       <div style="margin-bottom: 15px; color: #0f0; font-weight: bold;">Initiative Roll</div>
       <div style="color: #fff; margin: 5px 0;">1d20: [${roll}]</div>
       <div style="color: #fff; margin:  5px 0;">Modifier: +2</div>
       <div style="margin-top: 15px; color: #ff0; font-size: 1.3em; font-weight: bold;">Initiative: ${total}</div>
   `;
    // record initiative in history and flag crits
    const isCritSuccess = (roll === 20);
    const isCritFail = (roll === 1);
    recordRoll({ total, title: 'Initiative', breakdownHtml: `<div style="color:#fff">1d20: [${roll}] + 6</div>`, isCritSuccess, isCritFail });
}

// --- Initiative tracker persistence & UI ---
const INIT_KEY = 'initiativeList';
let initiativeList = [];
let lastInitiativeValue = null;

function loadInitiative() {
    try {
        const raw = localStorage.getItem(INIT_KEY);
        initiativeList = raw ? JSON.parse(raw) : [];
    } catch (e) {
        initiativeList = [];
    }
    updateInitiativeUI();
}

function saveInitiative() {
    localStorage.setItem(INIT_KEY, JSON.stringify(initiativeList || []));
}

function updateInitiativeUI() {
    const listEl = document.getElementById('initiative-list');
    if (!listEl) return;
    if (!Array.isArray(initiativeList) || initiativeList.length === 0) {
        listEl.innerHTML = '<div style="color:var(--muted);">No entries.</div>';
        return;
    }
    const html = initiativeList.map((e, i) => {
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 4px;border-bottom:1px solid rgba(255,255,255,0.02);">` +
            `<div><strong style="color:#ffd">${e.name || 'Unnamed'}</strong> — ${e.value}</div>` +
            `<div><button class=\"weapon-btn\" onclick=\"removeInitiativeEntry(${i})\">Remove</button></div>` +
            `</div>`;
    }).join('');
    listEl.innerHTML = html;
}

function addInitiativeEntry(name, value) {
    const entry = { name: name || '', value: Number(value) || 0, time: new Date().toISOString() };
    initiativeList.push(entry);
    saveInitiative();
    updateInitiativeUI();
}

function removeInitiativeEntry(index) {
    initiativeList.splice(index, 1);
    saveInitiative();
    updateInitiativeUI();
}

function clearInitiative() {
    if (!confirm('Clear all initiative entries?')) return;
    initiativeList = [];
    saveInitiative();
    updateInitiativeUI();
}

function sortInitiativeDesc() {
    initiativeList.sort((a,b) => b.value - a.value);
    saveInitiative();
    updateInitiativeUI();
}

function addLastInitiative() {
    const nameInput = document.getElementById('initiative-name');
    const name = nameInput ? nameInput.value.trim() : '';
    if (lastInitiativeValue === null) {
        alert('No initiative roll available. Click "Roll Initiative" first.');
        return;
    }
    addInitiativeEntry(name || document.querySelector('.char-name')?.textContent?.trim(), lastInitiativeValue);
    if (nameInput) nameInput.value = '';
}

// modify rollInitiative to expose lastInitiativeValue for tracker use
const _oldRollInitiative = rollInitiative;
function rollInitiative() {
    const weaponOutput = document.getElementById('weapon-output');
    const roll = rollDie(20);
    const total = roll + 2;
    lastInitiativeValue = total;
    if (weaponOutput) {
        weaponOutput.innerHTML = `\n       <div style="margin-bottom: 15px; color: #0f0; font-weight: bold;">Initiative Roll</div>\n       <div style="color: #fff; margin: 5px 0;">1d20: [${roll}]</div>\n       <div style="color: #fff; margin:  5px 0;">Modifier: +6</div>\n       <div style="margin-top: 15px; color: #ff0; font-size: 1.3em; font-weight: bold;">Initiative: ${total}</div>\n    `;
    }
    const isCritSuccess = (roll === 20);
    const isCritFail = (roll === 1);
    recordRoll({ total, title: 'Initiative', breakdownHtml: `<div style="color:#fff">1d20: [${roll}] + 6</div>`, isCritSuccess, isCritFail });
}

// --- Currency tracker ---
const CURRENCY_KEY = 'characterCurrency';
let currency = { gp: 0, sp: 0, cp: 0 };

function loadCurrency() {
    try {
        const raw = localStorage.getItem(CURRENCY_KEY);
        currency = raw ? JSON.parse(raw) : { gp: 0, sp: 0, cp: 0 };
    } catch (e) {
        currency = { gp: 0, sp: 0, cp: 0 };
    }
    updateCurrencyUI();
}

function saveCurrency() {
    localStorage.setItem(CURRENCY_KEY, JSON.stringify(currency));
}

function updateCurrencyUI() {
    const gp = document.getElementById('currency-gp');
    const sp = document.getElementById('currency-sp');
    const cp = document.getElementById('currency-cp');
    if (gp) gp.textContent = String(currency.gp || 0);
    if (sp) sp.textContent = String(currency.sp || 0);
    if (cp) cp.textContent = String(currency.cp || 0);
}

function changeCurrency(type, delta) {
    if (!['gp','sp','cp'].includes(type)) return;
    currency[type] = (currency[type] || 0) + Number(delta || 0);
    // clamp to integer and non-negative for now
    currency[type] = Math.max(0, Math.floor(currency[type]));
    saveCurrency();
    updateCurrencyUI();
}

// initialization for new features
function initTrackers() {
    loadInitiative();
    loadCurrency();
}

// call initTrackers at bottom of file after other init code runs

// Toggle the bottom bumber/footer
function toggleBumber() {
    const b = document.getElementById('bumber');
    if (!b) return;
    if (b.style.display === 'none') {
        b.style.display = 'flex';
    } else {
        b.style.display = 'none';
    }
}

// Short Range Attacks
function rollShortRangeFirstTurn() {
const description = 'Short Range - First Turn<br>Faerie Fire (advantage) + Hunters Mark (1d6) + Shortbow + Dread Ambusher + 1d6 Magic + Sharpshooter';
// Shortbow first turn: weapon 1d6 + Dread Ambusher 1d8 + Magic 1d6 + Hunter's Mark 1d6. Modifiers: DEX +4 + Sharpshooter +10 => +14
// We include an explicit '1d6' for Hunter's Mark in the dice array for first-turn calculations.
rollWeaponDice(['1d6', '1d8', '1d6', '1d6'], 14, description);
}

function rollShortRangeOtherTurns() {
const description = 'Short Range - Other Turns<br>Shortbow + 1d6 Magic + 1d6 HM + DEX +4 + Sharpshooter +10';
// Shortbow: weapon 1d6 + Magic 1d6 + Hunter's Mark 1d6. Modifiers: +4 Dex +10 Sharpshooter => +14
rollWeaponDice(['1d6', '1d6', '1d6'], 14, description);
}

// Long Range Attacks
function rollLongRangeFirstTurn() {
const description = 'Long Range - First Turn<br>Faerie Fire (advantage) + Hunters Mark (1d6) + Longbow + Dread Ambusher + Sharpshooter';
// Longbow first turn: weapon 1d8 + Dread Ambusher 1d8 + Hunter's Mark 1d6. Modifiers: DEX +4 + Sharpshooter +10 => +14
rollWeaponDice(['1d8', '1d8', '1d6'], 14, description);
}

function rollLongRangeOtherTurns() {
const description = 'Long Range - Other Turns<br>Longbow + 1d6 HM + DEX +4 + Sharpshooter +10';
// Longbow: weapon 1d8 + Hunter's Mark 1d6. Modifiers: +4 Dex +10 Sharpshooter => +14
rollWeaponDice(['1d8', '1d6'], 14, description);
}

// Magic Ring System
const MAX_EQUIPPED_RINGS = 3;

const magicRings = {
'echo-band': {
name: 'Echo Band',
description: 'Create an echo of any object that fully passes through, this echo follows the exact path of the original and cannot be separated, the echo only lasts for one minute and does half damage',
damage: '1d8',
damageModifier: 0.5, // Divide by 2
maxUses: 5,
currentUses: 5
}
};

let equippedRings = [];

// Return the first equipped ring id that has uses remaining (or null)
function getNextAvailableRing() {
    for (let i = 0; i < equippedRings.length; i++) {
        const ringId = equippedRings[i];
        const ring = magicRings[ringId];
        if (ring && ring.currentUses > 0) return ringId;
    }
    return null;
}

function openMagicRingSelector() {
const modal = document.getElementById('ring-selector-modal');
modal.style.display = 'flex';
}

function closeRingSelector() {
const modal = document.getElementById('ring-selector-modal');
modal.style.display = 'none';
// Reset checkboxes
const checkboxes = document.querySelectorAll('#ring-list input[type="checkbox"]');
checkboxes.forEach(cb => cb.checked = false);
}

function confirmRingSelection() {
const checkboxes = document.querySelectorAll('#ring-list input[type="checkbox"]:checked');

if (checkboxes.length > MAX_EQUIPPED_RINGS) {
const weaponOutput = document.getElementById('weapon-output');
weaponOutput.innerHTML = `<div style="color: #f00;">You can only equip up to ${MAX_EQUIPPED_RINGS} magic rings! </div>`;
return;
}

equippedRings = Array.from(checkboxes).map(cb => cb.value);

// Reset uses for newly equipped rings
equippedRings.forEach(ringId => {
if (magicRings[ringId]) {
magicRings[ringId].currentUses = magicRings[ringId].maxUses;
}
});

closeRingSelector();
updateRingStatus();
}

// --- Magic Weapons System (select up to 3, similar to Magic Rings) ---
const MAX_EQUIPPED_WEAPONS = 3;

const magicWeapons = {
    'dupo-quiver': {
        name: 'Dupo Quiver',
        description: "Knock on wood two times and your shot is doubled! You are able to hit up to 2 targets!",
        special: 'dupo'
    }
};

let equippedWeapons = [];

function openMagicWeaponSelector() {
    const modal = document.getElementById('weapon-selector-modal');
    if (modal) modal.style.display = 'flex';
}

function closeWeaponSelector() {
    const modal = document.getElementById('weapon-selector-modal');
    if (modal) modal.style.display = 'none';
    const checkboxes = document.querySelectorAll('#weapon-list input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
}

function confirmWeaponSelection() {
    const checkboxes = document.querySelectorAll('#weapon-list input[type="checkbox"]:checked');
    if (checkboxes.length > MAX_EQUIPPED_WEAPONS) {
        const weaponOutput = document.getElementById('weapon-output');
        if (weaponOutput) weaponOutput.innerHTML = `<div style="color: #f00;">You can only equip up to ${MAX_EQUIPPED_WEAPONS} magic weapons! </div>`;
        return;
    }

    equippedWeapons = Array.from(checkboxes).map(cb => cb.value);
    closeWeaponSelector();
    updateWeaponStatus();
}

function updateWeaponStatus() {
    const status = document.getElementById('weapon-status');
    const equippedDiv = document.getElementById('equipped-weapons');
    if (!status || !equippedDiv) return;
    if (equippedWeapons.length === 0) {
        status.style.display = 'none';
        return;
    }
    status.style.display = 'block';
    let html = '';
    equippedWeapons.forEach(wid => {
        const w = magicWeapons[wid];
        if (!w) return;
        html += `
            <div style="margin: 10px 0; padding: 10px; background: #444; border-radius:6px; border-left:4px solid #0f0;">
                <div style="font-weight:700;color:#0f0">${w.name}</div>
                <div style="color:#ccc;margin-top:6px">${w.description}</div>
                <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="weapon-btn" onclick="unequipWeapon('${wid}')" style="font-size:0.9em;padding:6px 10px;">Unequip</button>
                </div>
            </div>`;
    });
    equippedDiv.innerHTML = html;
}

function unequipWeapon(weaponId) {
    equippedWeapons = equippedWeapons.filter(id => id !== weaponId);
    updateWeaponStatus();
    const weaponOutput = document.getElementById('weapon-output');
    const w = magicWeapons[weaponId];
    if (weaponOutput) weaponOutput.innerHTML = `<div style="color:#0f0;font-weight:700;">${w ? w.name : 'Weapon'} unequipped.</div>`;
}

// Dupo chooser state
let _lastDupoA = null;
let _lastDupoB = null;
let _lastDupoDesc = null;

function chooseDupoResult(which) {
    const weaponOutput = document.getElementById('weapon-output');
    if (!weaponOutput) return;
    if (which === 'a' && _lastDupoA) {
        weaponOutput.innerHTML = `<div style="margin-bottom:15px;color:#0f0;font-weight:bold;">${_lastDupoDesc} — Selected: Shot A</div>${_lastDupoA.html}`;
        recordRoll({ total: _lastDupoA.total, title: `${_lastDupoDesc} (Shot A)`, breakdownHtml: _lastDupoA.html, isCritSuccess: false, isCritFail: false });
    } else if (which === 'b' && _lastDupoB) {
        weaponOutput.innerHTML = `<div style="margin-bottom:15px;color:#0f0;font-weight:bold;">${_lastDupoDesc} — Selected: Shot B</div>${_lastDupoB.html}`;
        recordRoll({ total: _lastDupoB.total, title: `${_lastDupoDesc} (Shot B)`, breakdownHtml: _lastDupoB.html, isCritSuccess: false, isCritFail: false });
    }
    _lastDupoA = null; _lastDupoB = null; _lastDupoDesc = null;
}

function updateRingStatus() {
const ringStatus = document.getElementById('ring-status');
const equippedRingsDiv = document.getElementById('equipped-rings');

if (equippedRings.length === 0) {
ringStatus.style.display = 'none';
return;
}

ringStatus.style.display = 'block';

let html = '';
equippedRings.forEach(ringId => {
const ring = magicRings[ringId];
if (ring) {
            html += `
               <div style="margin:  15px 0; padding: 15px; background: #444; border-radius: 5px; border-left: 4px solid #0f0;">
                   <div style="font-weight: bold; color: #0f0; margin-bottom: 5px;">${ring.name}</div>
                   <div style="color:  #aaa; font-size: 0.9em; margin-bottom: 10px;">${ring.description}</div>
                   <div style="color:  #ff6; font-weight: bold;">Uses Remaining: ${ring.currentUses}/${ring.maxUses}</div>
                   <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
                       <button class="weapon-btn" onclick="useRing('${ringId}')" style="font-size: 0.9em; padding: 8px 15px;" ${ring.currentUses <= 0 ? 'disabled' : ''}>
                           Use Ring Bonus (${ring.damage} ÷ 2)
                       </button>
                       <button class="weapon-btn" onclick="unequipRing('${ringId}')" style="font-size: 0.9em; padding: 8px 15px; background: linear-gradient(145deg, #663, #885); border-color: #aa6;">
                           Unequip
                       </button>
                   </div>
               </div>
           `;
}
});

equippedRingsDiv.innerHTML = html;
}

function unequipRing(ringId) {
    equippedRings = equippedRings.filter(id => id !== ringId);
    updateRingStatus();
    // Show brief confirmation
    const weaponOutput = document.getElementById('weapon-output');
    const ring = magicRings[ringId];
    weaponOutput.innerHTML = `<div style="color: #0f0; font-weight: bold;">${ring ? ring.name : 'Ring'} unequipped.</div>`;
}

function useRing(ringId) {
const ring = magicRings[ringId];

if (!ring) {
return;
}




if (ring.currentUses <= 0) {
const weaponOutput = document.getElementById('weapon-output');
weaponOutput.innerHTML = '<div style="color: #f00;">This ring has no uses remaining!  Take a long rest to restore uses.</div>';
return;
}

// Roll ring damage - validate dice notation format
const diceMatch = ring.damage.match(/^(\d+)d(\d+)$/);
if (!diceMatch) {
const weaponOutput = document.getElementById('weapon-output');
weaponOutput.innerHTML = `<div style="color: #f00;">Error: Invalid ring configuration.  Dice format should be XdY (e.g., 1d8).</div>`;
console.error('Invalid dice format:', ring.damage);
return;
}

const count = parseInt(diceMatch[1]);
const sides = parseInt(diceMatch[2]);
let ringTotal = 0;
let ringRolls = [];

for (let i = 0; i < count; i++) {
const roll = rollDamageDie(sides);
ringRolls.push(roll);
ringTotal += roll;
}

// Apply damage modifier and ensure minimum damage of 1
const finalDamage = Math.max(1, Math.floor(ringTotal * ring.damageModifier));

// Decrement uses
ring.currentUses--;

// Display result
const weaponOutput = document.getElementById('weapon-output');
let resultHTML = `<div style="margin-bottom: 15px; color: #0f0; font-weight: bold;">Magic Ring Bonus: ${ring.name}</div>`;
resultHTML += `<div style="color: #fff; margin: 5px 0;">${ring.damage}:  [${ringRolls.join(', ')}] = ${ringTotal}</div>`;
resultHTML += `<div style="color: #fff; margin: 5px 0;">Effect: ÷ 2</div>`;
resultHTML += `<div style="margin-top: 15px; color: #ff0; font-size: 1.3em; font-weight: bold;">Ring Bonus Damage: ${finalDamage}</div>`;

if (ring.currentUses <= 0) {
resultHTML += `<div style="color: #f00; margin-top: 10px; font-weight: bold;">⚠️ ${ring.name} has no uses remaining!  Take a long rest to restore. </div>`;
} else {
resultHTML += `<div style="color: #ff6; margin-top: 10px;">Uses remaining: ${ring.currentUses}/${ring.maxUses}</div>`;
}

weaponOutput.innerHTML = resultHTML;

// Update ring status display
updateRingStatus();
}

function longRest() {
    // Reset all equipped ring uses
    equippedRings.forEach(ringId => {
        if (magicRings[ringId]) {
            magicRings[ringId].currentUses = magicRings[ringId].maxUses;
        }
    });

    // (poison arrow mechanics removed)

    const weaponOutput = document.getElementById('weapon-output');
    weaponOutput.innerHTML = '<div style="color: #0f0; font-size: 1.5em; font-weight: bold;">✨ Long Rest Complete!  All resources restored.  ✨</div>';

    // Reset daily magic toggles
    setDisguiseUsed(false);
    // Stop all active spells: mark as consumed and clear applied roll history
    if (Array.isArray(activeEffects) && activeEffects.length > 0) {
        activeEffects.forEach(e => {
            if (e) {
                e.state = 'consumed';
                e.appliedRolls = [];
            }
        });
    }
    updateActiveEffectsUI();
    updateSpellButtons();
    updateAttackHighlights();

    updateRingStatus();
    // Restore spell slots on long rest
    spellSlotsRemaining = SPELL_SLOTS_TOTAL;
    saveSpellSlots();
    updateSpellSlotsUI();
    // Restore health to full
    currentHealth = maxHealth;
    saveHealth();
    updateHealthUI();
}

// --- Magic UI: Cantrips and Disguise Self persistence ---
function showCantrip(name) {
    const out = document.getElementById('magic-output') || document.getElementById('weapon-output');
    let html = '';
    if (name === 'mending') {
        html = '<div style="font-weight:700;color:#ffd">Mending</div><div style="color:#e8e8e8">Repairs a single break or tear in an object you touch. No rolls required.</div>';
    } else if (name === 'mage-hand') {
        html = '<div style="font-weight:700;color:#ffd">Mage Hand</div><div style="color:#e8e8e8">Create a spectral, floating hand to manipulate objects at range. No rolls required.</div>';
    } else {
        html = '<div>Unknown cantrip.</div>';
    }
    out.innerHTML = html;
}

const DISGUISE_KEY = 'disguiseSelfUsed';

function setDisguiseUsed(used) {
    localStorage.setItem(DISGUISE_KEY, used ? '1' : '0');
    const btn = document.getElementById('disguise-btn');
    if (btn) {
        if (used) {
            btn.classList.add('used');
            btn.textContent = 'Disguise Self: Used (once/day)';
            btn.disabled = true;
        } else {
            btn.classList.remove('used');
            btn.textContent = 'Disguise Self (Toggle)';
            btn.disabled = false;
        }
    }
}

function toggleDisguiseSelf() {
    const used = localStorage.getItem(DISGUISE_KEY) === '1';
    if (used) {
        // already used — do nothing (button should be disabled)
        return;
    }
    // Mark as used
    setDisguiseUsed(true);
    const out = document.getElementById('magic-output') || document.getElementById('weapon-output');
    out.innerHTML = '<div style="font-weight:700;color:#ffd">Disguise Self activated</div><div style="color:#e8e8e8">This effect is marked used for today. It will reset on Long Rest.</div>';
}

function initMagicState() {
    const used = localStorage.getItem(DISGUISE_KEY) === '1';
    setDisguiseUsed(used);
}

// Initialize magic UI state on load
initMagicState();

// --- Spell slots management ---
const SPELL_SLOTS_KEY = 'spellSlotsRemaining';
const SPELL_SLOTS_TOTAL = 5;
let spellSlotsRemaining = SPELL_SLOTS_TOTAL;

function loadSpellSlots() {
    const v = localStorage.getItem(SPELL_SLOTS_KEY);
    if (v === null) {
        spellSlotsRemaining = SPELL_SLOTS_TOTAL;
        saveSpellSlots();
        return;
    }
    const n = parseInt(v, 10);
    spellSlotsRemaining = isNaN(n) ? SPELL_SLOTS_TOTAL : Math.max(0, Math.min(SPELL_SLOTS_TOTAL, n));
}

function saveSpellSlots() {
    localStorage.setItem(SPELL_SLOTS_KEY, String(spellSlotsRemaining));
}

function updateSpellSlotsUI() {
    const el = document.getElementById('spell-slots');
    if (el) el.textContent = `Spell Slots: ${spellSlotsRemaining}/${SPELL_SLOTS_TOTAL}`;
    // Disable spell buttons that consume slots when none remain
    const spellButtonIds = ['faerie-btn','hunter-btn','zephyr-btn','cure-btn'];
    spellButtonIds.forEach(id => {
        const b = document.getElementById(id);
        if (!b) return;
        if (spellSlotsRemaining <= 0) {
            b.disabled = true;
            b.classList.add('effect-consumed');
        } else {
            b.disabled = false;
            b.classList.remove('effect-consumed');
        }
    });
}

function consumeSpellSlot(spellName) {
    if (spellSlotsRemaining <= 0) {
        const out = document.getElementById('magic-output') || document.getElementById('weapon-output');
        if (out) out.innerHTML = `<div style="color:#f66;font-weight:700;">No spell slots remaining — cannot cast ${spellName}.</div>`;
        return false;
    }
    spellSlotsRemaining = Math.max(0, spellSlotsRemaining - 1);
    saveSpellSlots();
    updateSpellSlotsUI();
    return true;
}

function restoreSpellSlot() {
    spellSlotsRemaining = Math.min(SPELL_SLOTS_TOTAL, spellSlotsRemaining + 1);
    saveSpellSlots();
    updateSpellSlotsUI();
}

function initSpellSlots() {
    loadSpellSlots();
    updateSpellSlotsUI();
}

// initialize spell slots UI
initSpellSlots();

// --- Health tracker ---
const HEALTH_KEY = 'characterHealth';
const HEALTH_MAX_KEY = 'characterMaxHealth';
const DEFAULT_HEALTH = 45;
let currentHealth = DEFAULT_HEALTH;
let maxHealth = DEFAULT_HEALTH;

function loadHealth() {
    const h = parseInt(localStorage.getItem(HEALTH_KEY), 10);
    const m = parseInt(localStorage.getItem(HEALTH_MAX_KEY), 10);
    maxHealth = (isNaN(m) || m <= 0) ? DEFAULT_HEALTH : m;
    currentHealth = (isNaN(h) ? maxHealth : Math.max(0, Math.min(maxHealth, h)));
}

function saveHealth() {
    localStorage.setItem(HEALTH_KEY, String(currentHealth));
    localStorage.setItem(HEALTH_MAX_KEY, String(maxHealth));
}

function updateHealthUI() {
    const el = document.getElementById('health-display');
    if (!el) return;
    el.textContent = `${currentHealth} / ${maxHealth}`;
    // colorize based on thresholds
    if (currentHealth <= 0) el.style.color = '#f55';
    else if (currentHealth <= Math.floor(maxHealth * 0.3)) el.style.color = '#ffb86b';
    else el.style.color = '#ffd';
}

function changeHealth(delta) {
    loadHealth();
    currentHealth = Math.max(0, Math.min(maxHealth, currentHealth + delta));
    saveHealth();
    updateHealthUI();
    const out = document.getElementById('weapon-output') || document.getElementById('magic-output');
    if (out) out.innerHTML = `<div style="color:#fff;">Health: ${currentHealth}/${maxHealth}</div>`;
}

function resetHealth() {
    loadHealth();
    currentHealth = maxHealth;
    saveHealth();
    updateHealthUI();
    const out = document.getElementById('weapon-output') || document.getElementById('magic-output');
    if (out) out.innerHTML = `<div style="color:#0f0;">Health reset to ${currentHealth}/${maxHealth}</div>`;
}

function initHealth() {
    loadHealth();
    updateHealthUI();
}

// initialize health UI
initHealth();

// initialize trackers (initiative & currency)
initTrackers();

// Apply custom health using numeric input
function applyCustomHealthAdd() {
    const el = document.getElementById('health-custom');
    if (!el) return;
    let v = parseInt(el.value, 10);
    if (isNaN(v) || v === 0) return;
    changeHealth(Math.abs(v));
    el.value = '';
}

function applyCustomHealthSub() {
    const el = document.getElementById('health-custom');
    if (!el) return;
    let v = parseInt(el.value, 10);
    if (isNaN(v) || v === 0) return;
    changeHealth(-Math.abs(v));
    el.value = '';
}

// --- Magic UI panel toggles ---
function showCantripPanel() {
    const canBtn = document.getElementById('cantrip-toggle');
    const spBtn = document.getElementById('spells-toggle');
    if (canBtn) { canBtn.classList.add('active'); }
    if (spBtn) { spBtn.classList.remove('active'); }
    const can = document.getElementById('cantrip-panel');
    const spells = document.getElementById('spells-panel');
    if (can) can.classList.add('visible');
    if (spells) spells.classList.remove('visible');
}

function showSpellsPanel() {
    const canBtn = document.getElementById('cantrip-toggle');
    const spBtn = document.getElementById('spells-toggle');
    if (canBtn) { canBtn.classList.remove('active'); }
    if (spBtn) { spBtn.classList.add('active'); }
    const can = document.getElementById('cantrip-panel');
    const spells = document.getElementById('spells-panel');
    if (can) can.classList.remove('visible');
    if (spells) spells.classList.add('visible');
    // show default group
    showSpellGroup('action');
}

function showSpellGroup(group) {
    const tabs = { action: 'tab-action', reaction: 'tab-reaction', bonus: 'tab-bonus' };
    Object.values(tabs).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
    const targetTab = document.getElementById(tabs[group]);
    if (targetTab) targetTab.classList.add('active');

    // Panels
    const groups = ['action','reaction','bonus'];
    groups.forEach(g => {
        const el = document.getElementById('spells-' + g);
        if (!el) return;
        if (g === group) el.classList.add('visible'); else el.classList.remove('visible');
    });
}

// initialize magic UI default to Cantrips
showCantripPanel();

// Cure Wounds: roll healing dice and display in Results (does not affect attacks)
function castCureWounds() {
    // Prompt for slot level and modifier (spellcasting ability)
    let lvlStr = prompt('Cure Wounds - spell slot level (1-9):', '1');
    if (lvlStr === null) return; // cancelled
    let level = parseInt(lvlStr, 10);
    if (isNaN(level) || level < 1) level = 1;
    if (level > 9) level = 9;

    let modStr = prompt('Spellcasting modifier (e.g. +3):', '0');
    if (modStr === null) return;
    let modifier = parseInt(modStr, 10);
    if (isNaN(modifier)) modifier = 0;

    // Consume a spell slot for Cure Wounds (after confirming level)
    if (!consumeSpellSlot('Cure Wounds')) return;

    const diceCount = level; // Cure Wounds: 1d8 at 1st, +1d8 per slot level
    const rolls = [];
    let total = 0;
    for (let i = 0; i < diceCount; i++) {
        const r = rollDie(8);
        rolls.push(r);
        total += r;
    }
    total += modifier;

    const breakdown = `<div style="color:#fff">${diceCount}d8: [${rolls.join(', ')}] ${modifier >= 0 ? '+' : '-'} ${Math.abs(modifier)} = ${total}</div>`;

    // Show in Results and record history
    recordRoll({ total, title: `Cure Wounds (Lv ${level})`, breakdownHtml: breakdown, isCritSuccess: false, isCritFail: false });
}

// Active Effects management (e.g., Faerie Fire)
let activeEffects = [];

function updateActiveEffectsUI() {
    const list = document.getElementById('active-effects-list');
    if (!list) return;
    if (activeEffects.length === 0) {
        list.innerHTML = 'No active effects.';
        return;
    }
    let html = '';
    activeEffects.forEach((eff, idx) => {
        let header = eff.name || '(Unnamed)';
        if (eff.dc) header += ` (DC ${eff.dc})`;
        if (eff.bonusDice) header += ` (${eff.bonusDice})`;
        const stateLabel = eff.state ? eff.state.charAt(0).toUpperCase() + eff.state.slice(1) : 'Active';
        // Determine if this effect was applied to the last roll
        const appliedLabel = (eff.appliedRolls && lastRollId && eff.appliedRolls.indexOf(lastRollId) !== -1) ? ' — applied' : '';
        html += `<div style="margin-bottom:8px;padding:8px;background:#2b1636;border-radius:6px;border:1px solid #442244;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="font-weight:700;color:#ffd9f7">${header}</div>
                <div style="font-size:0.9em;color:#cfe;">${stateLabel}${appliedLabel}</div>
            </div>
            <div style="color:#e8e8e8;margin-top:6px;">${eff.desc || ''}</div>
            <div style="margin-top:8px;display:flex;gap:8px;">
                <button class="weapon-btn" onclick="removeActiveEffect(${idx})" style="font-size:0.9em;padding:6px 10px;">Remove</button>
                ${eff.state === 'consumed' ? `<button class="weapon-btn" onclick="reactivateActiveEffect(${idx})" style="font-size:0.9em;padding:6px 10px; background: linear-gradient(145deg,#367,#589);">Reactivate</button>` : ''}
            </div>
        </div>`;
    });
    list.innerHTML = html;
    // Update attack button highlighting based on active effects
    updateAttackHighlights();
    // Update spell buttons (active/applied/consumed visuals)
    updateSpellButtons();
}

function updateSpellButtons() {
    // Map effect names to button ids
    const mapping = {
        'faerie fire': 'faerie-btn',
        "hunter's mark": 'hunter-btn',
        'zephyr strike': 'zephyr-btn',
        'absorb elements': 'absorb-btn'
    };

    // Clear classes first
    Object.values(mapping).forEach(id => {
        const b = document.getElementById(id);
        if (b) {
            b.classList.remove('effect-active', 'effect-applied', 'effect-consumed');
            b.disabled = false;
        }
    });

    // Apply current states
    activeEffects.forEach(e => {
        if (!e || !e.name) return;
        const id = mapping[e.name.toLowerCase()];
        if (!id) return;
        const btn = document.getElementById(id);
        if (!btn) return;
        if (e.state === 'active') {
            btn.classList.add('effect-active');
            // mark as applied if applied to lastRollId
            if (Array.isArray(e.appliedRolls) && lastRollId && e.appliedRolls.indexOf(lastRollId) !== -1) {
                btn.classList.add('effect-applied');
            }
        } else if (e.state === 'consumed') {
            btn.classList.add('effect-consumed');
            btn.disabled = true;
        }
    });
}

function addActiveEffect(effect) {
    // effect: { name, dc, desc, allowStack }
    if (!effect) return false;
    // normalize defaults
    if (typeof effect.allowStack === 'undefined') effect.allowStack = false;
    if (typeof effect.state === 'undefined') effect.state = 'active'; // inactive | active | consumed
    if (!Array.isArray(effect.appliedRolls)) effect.appliedRolls = []; // track rollIds this effect applied to
    const name = (effect.name || '').toLowerCase();
    if (name && !effect.allowStack) {
        // if an active effect exists, do not add duplicate
        const existsActive = activeEffects.some(e => e.name && e.name.toLowerCase() === name && e.state === 'active');
        if (existsActive) {
            const out = document.getElementById('magic-output') || document.getElementById('weapon-output');
            if (out) out.innerHTML = `<div style="color:#ff6;font-weight:700;">${effect.name} is already active.</div>`;
            return false;
        }
        // if a consumed effect exists, reactivate it instead of adding a second entry
        const consumedIdx = activeEffects.findIndex(e => e.name && e.name.toLowerCase() === name && e.state === 'consumed');
        if (consumedIdx !== -1) {
            const ex = activeEffects[consumedIdx];
            ex.state = 'active';
            ex.appliedRolls = [];
            updateActiveEffectsUI();
            const out = document.getElementById('magic-output') || document.getElementById('weapon-output');
            if (out) out.innerHTML = `<div style="color:#0f0;font-weight:700;">${ex.name} reactivated.</div>`;
            return true;
        }
    }
    activeEffects.push(effect);
    updateActiveEffectsUI();
    return true;
}

function removeActiveEffect(index) {
    if (index < 0 || index >= activeEffects.length) return;
    const removed = activeEffects.splice(index, 1)[0];
    updateActiveEffectsUI();
    const out = document.getElementById('magic-output') || document.getElementById('weapon-output');
    if (out) out.innerHTML = `<div style="color:#0f0;font-weight:700;">Removed effect: ${removed.name}</div>`;
    // If Absorb Elements was removed, update the button state
    if (removed.name && removed.name.toLowerCase().includes('absorb')) {
        updateAbsorbButton(false);
    }
    // Update attack highlights in case a highlight effect was removed
    updateAttackHighlights();
}

function reactivateActiveEffect(index) {
    if (index < 0 || index >= activeEffects.length) return;
    const eff = activeEffects[index];
    eff.state = 'active';
    eff.appliedRolls = [];
    updateActiveEffectsUI();
    const out = document.getElementById('magic-output') || document.getElementById('weapon-output');
    if (out) out.innerHTML = `<div style="color:#0f0;font-weight:700;">Reactivated: ${eff.name}</div>`;
    updateAttackHighlights();
}

function updateAbsorbButton(active) {
    const btn = document.getElementById('absorb-btn');
    if (!btn) return;
    if (active) {
        btn.classList.add('used');
        btn.textContent = 'Absorb Elements: Active';
    } else {
        btn.classList.remove('used');
        btn.textContent = 'Absorb Elements (Toggle)';
    }
}

function isAbsorbActive() {
    return activeEffects.some(e => e.name && e.name.toLowerCase().includes('absorb'));
}

function toggleAbsorbElements() {
    const out = document.getElementById('magic-output') || document.getElementById('weapon-output');
    const idx = activeEffects.findIndex(e => e.name && e.name.toLowerCase().includes('absorb'));
    if (idx !== -1) {
        // deactivate
        const removed = activeEffects.splice(idx, 1)[0];
        updateActiveEffectsUI();
        updateAbsorbButton(false);
        if (out) out.innerHTML = `<div style="color:#ff6;font-weight:700;">Deactivated: ${removed.name}</div>`;
        return;
    }

    // Activate Absorb Elements (defensive, no damage effect)
    const effect = {
        name: 'Absorb Elements',
        desc: 'Reactive protection: you gain resistance to the triggering elemental damage type until the start of your next turn. (Reminder only; does not modify weapon damage in this tracker).',
        defensive: true,
        clearOnLongRest: false
    };
    effect.state = 'active';
    effect.appliedRolls = [];
    addActiveEffect(effect);
    updateAbsorbButton(true);
    recordRoll({ total: 0, title: 'Absorb Elements (active)', breakdownHtml: `<div style="color:#fff">Absorb Elements activated — defensive effect (no damage rolls).</div>`, isCritSuccess: false, isCritFail: false });
    if (out) out.innerHTML = `<div style="font-weight:700;color:#ffd">Absorb Elements activated</div><div style="color:#e8e8e8;margin-top:6px;">This is a defensive reaction reminder and does not affect weapon damage in this panel. Toggle to deactivate.</div>`;
}

function castFaerieFire() {
    // Prompt for save DC (display only) — no damage rolled
    let dcStr = prompt('Faerie Fire - Save DC (e.g. 13):', '13');
    if (dcStr === null) return; // cancelled
    let dc = parseInt(dcStr, 10);
    if (isNaN(dc) || dc < 1) dc = 10;

    // Add an active effect reminder: advantage on attacks against illuminated targets
    const exists = activeEffects.some(e => e.name && e.name.toLowerCase() === 'faerie fire');
    if (exists) {
        const out = document.getElementById('magic-output') || document.getElementById('weapon-output');
        if (out) out.innerHTML = `<div style="color:#ff6;font-weight:700;">Faerie Fire is already active.</div>`;
        return;
    }

    // Consume a spell slot (only after confirming DC)
    if (!consumeSpellSlot('Faerie Fire')) return;

    const effect = {
        name: 'Faerie Fire',
        dc: dc,
        desc: 'Affected creatures are outlined in light: attacks against them have advantage. Remove when the effect ends.',
        clearOnLongRest: true,
        allowStack: false,
        state: 'active',
        appliedRolls: []
    };
    addActiveEffect(effect);

    // Record a non-damage entry in history/Results showing the DC
    recordRoll({ total: 0, title: `Faerie Fire (DC ${dc})`, breakdownHtml: `<div style="color:#fff">Faerie Fire cast — Save DC ${dc}. No damage. Targets illuminated: advantage on attacks.</div>`, isCritSuccess: false, isCritFail: false });

    const out = document.getElementById('magic-output') || document.getElementById('weapon-output');
    if (out) out.innerHTML = `<div style="font-weight:700;color:#ffd">Faerie Fire cast (DC ${dc})</div><div style="color:#e8e8e8;margin-top:6px;">Added Active Effect: advantage on attacks vs illuminated targets. Remove when effect ends or via the Active Effects list.</div>`;
}

function castHuntersMark() {
    // Add Hunter's Mark as a persistent active effect that adds 1d6 bonus damage to weapon attacks
    const exists = activeEffects.some(e => e.name && e.name.toLowerCase() === "hunter's mark");
    if (exists) {
        const out = document.getElementById('magic-output') || document.getElementById('weapon-output');
        if (out) out.innerHTML = `<div style="color:#ff6;font-weight:700;">Hunter's Mark is already active.</div>`;
        return;
    }

    // Consume a spell slot before applying Hunter's Mark
    if (!consumeSpellSlot("Hunter's Mark")) return;

    const effect = {
        name: "Hunter's Mark",
        bonusDice: '1d6',
        desc: "Marked target takes +1d6 damage from your attacks. Persists until removed.",
        clearOnLongRest: false,
        state: 'active',
        appliedRolls: []
    };
    const added = addActiveEffect(effect);
    if (!added) {
        // revert slot if we failed to add (should be rare)
        restoreSpellSlot();
        return;
    }

    recordRoll({ total: 0, title: "Hunter's Mark (active)", breakdownHtml: `<div style="color:#fff">Hunter's Mark activated — bonus: ${effect.bonusDice}</div>`, isCritSuccess: false, isCritFail: false });

    const out = document.getElementById('magic-output') || document.getElementById('weapon-output');
    if (out) out.innerHTML = `<div style="font-weight:700;color:#ffd">Hunter's Mark activated</div><div style="color:#e8e8e8;margin-top:6px;">Bonus damage ${effect.bonusDice} will be applied automatically to weapon attacks until removed.</div>`;
}

function updateAttackHighlights() {
    const attackButtons = document.querySelectorAll('[data-attack="true"]');
    if (!attackButtons) return;
    const shouldHighlight = activeEffects.some(e => e && e.highlightAttack && e.state === 'active');
    attackButtons.forEach(btn => {
        if (shouldHighlight) btn.classList.add('next-attack-highlight');
        else btn.classList.remove('next-attack-highlight');
    });
}

function castZephyrStrike() {
    // Activate Zephyr Strike: adds 1d8 bonus to next weapon attack only
    const effect = {
        name: 'Zephyr Strike',
        bonusDice: '1d8',
        desc: 'Prime for enhanced mobility and extra 1d8 force damage on your next weapon attack. Consumes on next attack.',
        oneTime: true,
        highlightAttack: true,
        clearOnLongRest: false,
        state: 'active',
        appliedRolls: []
    };
    // Consume a spell slot for Zephyr Strike
    if (!consumeSpellSlot('Zephyr Strike')) return;
    const added = addActiveEffect(effect);
    if (!added) {
        restoreSpellSlot();
        return; // addActiveEffect will show a message if it failed or reactivated
    }
    updateAttackHighlights();
    recordRoll({ total: 0, title: 'Zephyr Strike (primed)', breakdownHtml: `<div style="color:#fff">Zephyr Strike primed — next weapon attack gains +1d8 force damage.</div>`, isCritSuccess: false, isCritFail: false });
    const out = document.getElementById('magic-output') || document.getElementById('weapon-output');
    if (out) out.innerHTML = `<div style="font-weight:700;color:#ffd">Zephyr Strike primed</div><div style="color:#e8e8e8;margin-top:6px;">Next weapon attack will include +1d8 damage. The effect clears automatically after that attack.</div>`;
}

// PDF Viewer functions
const _pdfBlobUrls = [];

function openPdfSelector() {
    const input = document.getElementById('pdf-input');
    if (!input) {
        const weaponOutput = document.getElementById('weapon-output');
        if (weaponOutput) weaponOutput.innerHTML = `<div style="color:#f88;">No PDF input available.</div>`;
        return;
    }
    input.click();
}

function handlePdfFiles(event) {
    const files = (event && event.target && event.target.files) ? event.target.files : event;
    const list = document.getElementById('pdf-list');
    if (!list) {
        console.warn('PDF list element not present');
        return;
    }
    list.innerHTML = '';
    if (!files || files.length === 0) {
        list.textContent = 'No PDFs selected.';
        return;
    }

    Array.from(files).forEach((file, idx) => {
        if (file.type !== 'application/pdf') return;
        const blobUrl = URL.createObjectURL(file);
        _pdfBlobUrls.push(blobUrl);

        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.padding = '8px 10px';
        item.style.background = '#222';
        item.style.marginBottom = '8px';
        item.style.borderRadius = '6px';

        const name = document.createElement('div');
        name.style.color = '#fff';
        name.textContent = file.name;

        const controls = document.createElement('div');
        controls.style.display = 'flex';
        controls.style.gap = '8px';

        const viewBtn = document.createElement('button');
        viewBtn.className = 'weapon-btn';
        viewBtn.textContent = 'View';
        viewBtn.onclick = () => showPdf(blobUrl, file.name);

        const downloadBtn = document.createElement('a');
        downloadBtn.className = 'weapon-btn';
        downloadBtn.textContent = 'Download';
        downloadBtn.href = blobUrl;
        downloadBtn.download = file.name;

        controls.appendChild(viewBtn);
        controls.appendChild(downloadBtn);

        item.appendChild(name);
        item.appendChild(controls);
        list.appendChild(item);
    });
}

function showPdf(url, name) {
    const modal = document.getElementById('pdf-viewer-modal');
    const frame = document.getElementById('pdf-frame');
    const weaponOutput = document.getElementById('weapon-output');

    // Try fetching the PDF first to validate availability.
    fetch(url, { method: 'GET' }).then(response => {
        if (!response.ok) throw new Error('PDF not found');
        return response.blob();
    }).then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        if (frame) frame.src = blobUrl;
        if (modal) modal.style.display = 'flex';
    }).catch(err => {
        // Fallback: try to set the iframe src directly, otherwise report error.
        try {
            if (frame) frame.src = url;
            if (modal) modal.style.display = 'flex';
        } catch (e) {
            if (weaponOutput) weaponOutput.innerHTML = `<div style="color:#f00;">Unable to open PDF: ${name}. (${e.message})</div>`;
        }
    });
}

function closePdfViewer() {
    const modal = document.getElementById('pdf-viewer-modal');
    const frame = document.getElementById('pdf-frame');
    if (frame) frame.src = '';
    if (modal) modal.style.display = 'none';
}
