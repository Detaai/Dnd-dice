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

// Visual life effect: dynamically place an image near the health header and animate it
function triggerLifeEffect(type) {
    try {
        // prefer the lower health display so particles originate lower on page
        const anchor = document.getElementById('health-display') || document.getElementById('health-header') || document.getElementById('health');
        const rect = anchor ? anchor.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
        const centerX = (rect.left || (window.innerWidth / 2)) + ((rect.width || 0) / 2);
        // start slightly below the anchor (use rect.bottom) so particles are lower on the screen
        const startY = (rect.top || 0) + (rect.height || 0) + 12;

        // spawn multiple particle copies of the PNG
        const count = type === 'gain' ? 10 : 12;
        // horizontal spread and size randomness to avoid clustering
        const spreadHoriz = type === 'gain' ? 220 : 260;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('img');
            p.className = 'life-particle ' + (type === 'gain' ? 'gain' : 'lose') + ' particle-anim';
            p.src = type === 'gain' ? 'gain-life.png' : 'lose-life.png';

            // random size (px) — increased range for larger particles
            const size = Math.round(64 + Math.random() * 120);
            p.style.width = size + 'px';

            // scale horizontal spread with particle size so larger particles disperse more
            const avgSize = 96;
            const spreadScale = size / avgSize; // >1 when larger
            const effectiveSpread = Math.round(spreadHoriz * spreadScale);
            // horizontal offset from center (so they spawn across a band)
            const offsetX = Math.round((Math.random() - 0.5) * effectiveSpread);
            const left = Math.max(6, Math.min(window.innerWidth - size - 6, Math.round(centerX + offsetX - (size / 2))));

            // slight vertical variation so they don't all start at same Y
            const topJitter = Math.round((Math.random() - 0.5) * 30);
            const top = Math.max(6, Math.min(window.innerHeight - size - 6, Math.round(startY + 8 + topJitter)));

            // horizontal-forward biased trajectory for wider spread and less vertical travel
            const horizRandom = Math.round((Math.random() - 0.5) * effectiveSpread * 0.9);
            const dx = offsetX + horizRandom + Math.round((Math.random() - 0.5) * 40);
            // small vertical drift only (positive or negative small amount)
            const dy = Math.round((Math.random() - 0.6) * 40); // slight upward bias when negative
            const rot = Math.round((Math.random() * 120) - 60);
            const scale = (type === 'gain' ? (0.6 + Math.random() * 0.9) : (0.5 + Math.random() * 1.1)).toFixed(2);

            p.style.setProperty('--dx', dx + 'px');
            p.style.setProperty('--dy', dy + 'px');
            p.style.setProperty('--rot', rot + 'deg');
            p.style.setProperty('--scale', scale);

            p.style.left = left + 'px';
            p.style.top = top + 'px';

            // randomized duration and slight delay
            const dur = Math.round((type === 'gain' ? (700 + Math.random() * 600) : (700 + Math.random() * 800)));
            const delay = Math.round(Math.random() * 220);
            p.style.animationDuration = dur + 'ms';
            p.style.animationDelay = delay + 'ms';

            document.body.appendChild(p);
            // cleanup
            p.addEventListener('animationend', () => { try { p.remove(); } catch (e) {} });
            setTimeout(() => { if (p.parentNode) p.remove(); }, dur + delay + 300);
        }
    } catch (e) { /* ignore errors */ }
}

// ===== RESISTANCE TRACKING SYSTEM =====
let activeResistances = []; // Array of resistance types - ALLOWS STACKING (duplicates permitted)

const RESISTANCE_TYPES = {
    // Physical
    'bludgeoning': 'Bludgeoning',
    'piercing': 'Piercing',
    'slashing': 'Slashing',
    // Elemental
    'fire': 'Fire',
    'cold': 'Cold',
    'lightning': 'Lightning',
    'thunder': 'Thunder',
    'acid': 'Acid',
    'poison': 'Poison',
    // Energy/Magical
    'force': 'Force',
    'radiant': 'Radiant',
    'necrotic': 'Necrotic',
    'psychic': 'Psychic'
};

function addResistance(type) {
    const normalizedType = type.toLowerCase();
    // Allow stacking - always add, even if already present
    activeResistances.push(normalizedType);
    updateResistancesUI();
}

function removeResistance(type) {
    const normalizedType = type.toLowerCase();
    // Remove only ONE instance to support stacking
    const idx = activeResistances.indexOf(normalizedType);
    if (idx !== -1) {
        activeResistances.splice(idx, 1);
    }
    updateResistancesUI();
}

function updateResistancesUI() {
    const display = document.getElementById('resistances-display');
    const list = document.getElementById('resistances-list');
    const displayStatus = document.getElementById('resistances-display-status');
    const listStatus = document.getElementById('resistances-list-status');
    const emptyStatus = document.getElementById('resistances-empty-status');
    if (!display || !list) return;

    if (activeResistances.length === 0) {
        display.style.display = 'none';
        if (displayStatus) displayStatus.style.display = 'none';
        if (listStatus) listStatus.innerHTML = '';
        if (emptyStatus) emptyStatus.style.display = 'block';
        return;
    }

    display.style.display = 'block';
    
    // Count occurrences of each resistance type
    const counts = {};
    activeResistances.forEach(r => {
        counts[r] = (counts[r] || 0) + 1;
    });
    
    // Create badges with stack counts
    const badgeHtml = Object.keys(counts).sort().map(r => {
        const label = RESISTANCE_TYPES[r] || r;
        const count = counts[r];
        const displayText = count > 1 ? `${label} ×${count}` : label;
        return `<span class="pill pill-blue">${displayText}</span>`;
    }).join('');
    list.innerHTML = badgeHtml;
    if (displayStatus) displayStatus.style.display = 'block';
    if (listStatus) listStatus.innerHTML = badgeHtml;
    if (emptyStatus) emptyStatus.style.display = 'none';
}

// ===== LINGERING WOUNDS TRACKING =====
const LINGERING_WOUNDS = {
    'bleeding': { name: 'Bleeding', damage: 'Slashing / Piercing' },
    'burning': { name: 'Burning', damage: 'Fire' },
    'poisoned': { name: 'Poisoned', damage: 'Poison' },
    'corrosion': { name: 'Corrosion', damage: 'Acid' },
    'freezing': { name: 'Freezing', damage: 'Cold' },
    'shocked': { name: 'Shocked', damage: 'Lightning' },
    'soul-drain': { name: 'Soul Drain', damage: 'Necrotic' },
    'mind-burn': { name: 'Mind Burn', damage: 'Psychic' }
};

let activeLingeringWounds = [];

function saveLingeringWounds() {
    try {
        localStorage.setItem('lingeringWounds', JSON.stringify(activeLingeringWounds));
    } catch (e) { /* ignore */ }
}

function loadLingeringWounds() {
    try {
        const stored = localStorage.getItem('lingeringWounds');
        if (stored) {
            activeLingeringWounds = JSON.parse(stored) || [];
        }
    } catch (e) { /* ignore */ }
    syncLingeringWoundsUI();
    updateLingeringWoundsSummary();
}

function toggleLingeringWound(input) {
    if (!input || !input.dataset) return;
    const id = input.dataset.wound;
    if (!id || !LINGERING_WOUNDS[id]) return;

    if (input.checked) {
        if (!activeLingeringWounds.includes(id)) activeLingeringWounds.push(id);
    } else {
        activeLingeringWounds = activeLingeringWounds.filter(w => w !== id);
    }
    saveLingeringWounds();
    updateLingeringWoundsSummary();
}

function syncLingeringWoundsUI() {
    const inputs = document.querySelectorAll('#lingering-wounds-list input[data-wound]');
    if (!inputs || inputs.length === 0) return;
    inputs.forEach(inp => {
        const id = inp.dataset.wound;
        inp.checked = activeLingeringWounds.includes(id);
    });
}

function updateLingeringWoundsSummary() {
    const summary = document.getElementById('lingering-wounds-active');
    if (!activeLingeringWounds || activeLingeringWounds.length === 0) {
        if (summary) summary.textContent = 'Active: None';
        updateOngoingDamageDisplay();
        return;
    }
    const lines = activeLingeringWounds.map(id => {
        const w = LINGERING_WOUNDS[id];
        return w ? `${w.name} (${w.damage})` : id;
    });
    if (summary) summary.textContent = `Active: ${lines.join(' • ')}`;
    updateOngoingDamageDisplay();
}

function updateOngoingDamageDisplay() {
    const display = document.getElementById('ongoing-damage-display');
    const list = document.getElementById('ongoing-damage-list');
    if (!display || !list) return;

    if (!activeLingeringWounds || activeLingeringWounds.length === 0) {
        display.style.display = 'none';
        list.innerHTML = '';
        return;
    }

    const typeSet = new Set();
    activeLingeringWounds.forEach(id => {
        const w = LINGERING_WOUNDS[id];
        if (!w || !w.damage) return;
        w.damage.split('/').forEach(part => {
            const t = part.trim();
            if (t) typeSet.add(t);
        });
    });

    const types = Array.from(typeSet);
    if (types.length === 0) {
        display.style.display = 'none';
        list.innerHTML = '';
        return;
    }

    display.style.display = 'block';
    list.innerHTML = types.map(t => {
        return `<span class="pill pill-red">${t}</span>`;
    }).join('');
}

// ===== EQUIPMENT INVENTORY SYSTEM =====
const EQUIPMENT_DATA = {
    'arrows': { name: 'Arrows', desc: 'Alot of arrows' },
    'basic-clothing': { name: 'Basic Clothing', desc: 'Basic travel clothing' },
    'cloak-of-heavenly-warmth': { name: 'Cloak of Heavenly Warmth', desc: "User can't freeze from magical sources, user gains resistance to ice magic", grantsResistance: 'cold' },
    'coin-pouch': { name: 'Coin Pouch', desc: 'Your purse of riches or fleas' },
    'dagger': { name: 'Dagger', desc: 'Simple dagger, can be attached to Wrist launcher for disguised weapon.' },
    'dupo-quiver': { name: 'Dupo Quiver', desc: 'Knock on wood two times and your shot is doubled! You are able to hit up to 2 targets!' },
    'echo-band': { name: 'Echo Band', desc: 'Create an echo of any object that fully passes through, this echo follows the exact path of the original and cannot be separated, the echo only lasts for one minute and does half damage' },
    'giggle-shot': { name: 'Giggle Shot', desc: "A short bow infused with the world's worst dad jokes, creature hit with this must make a 12 DC Wisdom saving throw or lose their action and fall to the floor laughing" },
    'longbow': { name: 'Long bow', desc: 'A reliable longbow for ranged attacks' },
    'quiver': { name: 'Quiver', desc: 'A normal Quiver, to hold arrows' },
    'short-sword': { name: 'Short sword', desc: 'Simple short sword' },
    'smiths-tools': { name: "Smiths tools", desc: 'Tools for blacksmithing and metalwork' },
    'studded-leather-armor': { name: 'Studded leather armor', desc: 'Armor, 12ac +Dexterity modifier' },
    'tinkers-tools': { name: "Tinkers tools", desc: 'Tools for tinkering and crafting' },
    'wrist-launcher': { name: 'Wrist launcher', desc: 'A simple wrist launcher with 5 smoke pellets and 12 poison darts' }
};

const DEFAULT_EQUIPPED = ['wrist-launcher', 'dagger', 'dupo-quiver', 'echo-band', 'longbow', 'giggle-shot', 'basic-clothing', 'arrows'];

let equippedItems = [];
let currentEquipmentTab = 'equipped';

function loadEquipment() {
    try {
        const stored = localStorage.getItem('equippedItems');
        if (stored) {
            equippedItems = JSON.parse(stored);
        } else {
            equippedItems = [...DEFAULT_EQUIPPED];
            saveEquipment();
        }
    } catch (e) {
        equippedItems = [...DEFAULT_EQUIPPED];
    }
    
    // Initialize resistances from currently equipped items
    activeResistances = [];
    equippedItems.forEach(itemId => {
        const item = EQUIPMENT_DATA[itemId];
        if (item && item.grantsResistance) {
            addResistance(item.grantsResistance);
        }
    });

    // Ensure UI updates after DOM is ready (GitHub Pages can race this)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => updateResistancesUI(), { once: true });
    } else {
        updateResistancesUI();
    }
}

function saveEquipment() {
    try {
        localStorage.setItem('equippedItems', JSON.stringify(equippedItems));
    } catch (e) { /* ignore */ }
}

function toggleEquipItem(itemId) {
    const idx = equippedItems.indexOf(itemId);
    const item = EQUIPMENT_DATA[itemId];
    
    if (idx >= 0) {
        // Unequipping
        equippedItems.splice(idx, 1);
        // Remove resistance if this item grants one
        if (item && item.grantsResistance) {
            removeResistance(item.grantsResistance);
        }
    } else {
        // Equipping
        equippedItems.push(itemId);
        // Add resistance if this item grants one
        if (item && item.grantsResistance) {
            addResistance(item.grantsResistance);
        }
    }
    saveEquipment();
    renderEquipmentList();
}

function renderEquipmentList() {
    const container = document.getElementById('equipment-list');
    if (!container) return;

    const allIds = Object.keys(EQUIPMENT_DATA).sort((a, b) => EQUIPMENT_DATA[a].name.localeCompare(EQUIPMENT_DATA[b].name));
    let filteredIds = allIds;

    if (currentEquipmentTab === 'equipped') {
        filteredIds = allIds.filter(id => equippedItems.includes(id));
    } else if (currentEquipmentTab === 'unequipped') {
        filteredIds = allIds.filter(id => !equippedItems.includes(id));
    }

    let html = '';
    filteredIds.forEach(id => {
        const item = EQUIPMENT_DATA[id];
        const isEquipped = equippedItems.includes(id);
        const statusClass = isEquipped ? 'equipped' : 'unequipped';
        const btnText = isEquipped ? 'Unequip' : 'Equip';
        html += `
            <div class="equipment-item ${statusClass}">
                <div class="equipment-name">${item.name}</div>
                <div class="equipment-desc">${item.desc}</div>
                <button class="equipment-toggle-btn" onclick="toggleEquipItem('${id}')">${btnText}</button>
            </div>
        `;
    });

    if (filteredIds.length === 0) {
        html = '<div style="color:var(--muted);text-align:center;padding:20px;">No items in this category.</div>';
    }

    container.innerHTML = html;
}

function switchEquipmentTab(tab) {
    currentEquipmentTab = tab;
    document.querySelectorAll('.equipment-tab').forEach(el => {
        el.classList.toggle('active', el.dataset.tab === tab);
    });
    renderEquipmentList();
}

function openEquipmentModal() {
    const modal = document.getElementById('equipment-modal');
    if (!modal) return;
    loadEquipment();
    renderEquipmentList();
    modal.classList.add('open');
    modal.style.display = 'flex';
}

function closeEquipmentModal() {
    const modal = document.getElementById('equipment-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.style.display = 'none';
    // Reset floating button state
    const el = document.getElementById('floating-inventory');
    if (el) {
        el.dataset.state = 'closed';
        el.src = 'close-inventory.png';
    }
}

// Floating inventory toggle: close-inventory opens modal, open-inventory closes it
function initFloatingInventoryToggle() {
    try {
        const el = document.getElementById('floating-inventory');
        if (!el) return;
        el.dataset.state = el.dataset.state || 'closed';
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            try {
                const isClosed = el.dataset.state === 'closed';
                if (isClosed) {
                    // Open equipment modal
                    el.dataset.state = 'open';
                    el.src = 'open-inventory.png';
                    openEquipmentModal();
                } else {
                    // Close equipment modal
                    el.dataset.state = 'closed';
                    el.src = 'close-inventory.png';
                    closeEquipmentModal();
                }
                // small pulse to indicate toggle
                el.style.transition = 'transform .12s ease';
                el.style.transform = 'translateY(-50%) scale(1.08)';
                setTimeout(() => { el.style.transform = 'translateY(-50%) scale(1)'; }, 140);
            } catch (e) { /* ignore */ }
        });
    } catch (e) { /* ignore */ }
}

function initEquipmentModal() {
    // Add click handler to close modal when clicking backdrop
    const modal = document.getElementById('equipment-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeEquipmentModal();
            }
        });
    }
}

// Expose functions globally for onclick handlers
window.closeEquipmentModal = closeEquipmentModal;
window.switchEquipmentTab = switchEquipmentTab;
window.toggleEquipItem = toggleEquipItem;
window.toggleLingeringWound = toggleLingeringWound;

// initialize UI toggles after script loads
try { 
    window.addEventListener('DOMContentLoaded', () => {
        initFloatingInventoryToggle();
        initEquipmentModal();
        loadEquipment();
        loadLingeringWounds();
    }); 
} catch (e) { 
    setTimeout(() => {
        initFloatingInventoryToggle();
        initEquipmentModal();
        loadEquipment();
        loadLingeringWounds();
    }, 500); 
}

// Add flashing animation to page
const style = document.createElement('style');
style.textContent = `@keyframes flashFail { 0%{opacity:1;} 50%{opacity:0;} 100%{opacity:1;} }`;
document.head.appendChild(style);

// Global lowest mode toggled by clicking the 'Choose' label
let globalLowest = false;
const _chooseLabel = document.getElementById('choose-label');
if (_chooseLabel) {
    _chooseLabel.addEventListener('click', function() { globalLowest = !globalLowest; });
}

// Global loaded mode toggled by clicking the title
let globalLoaded = false;
let diceCountInput = document.getElementById('dice-count');

function attachDiceInputListeners(inputElem) {
    if (!inputElem) return;
    inputElem.addEventListener('input', function() {
        updateDiceSelectors();
    });
    inputElem.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const rb = document.getElementById('roll-btn '); if (rb) rb.click();
        }
    });
}

// Toggle loaded mode by clicking the title
const _diceTitle = document.getElementById('dice-title');
if (_diceTitle) { _diceTitle.addEventListener('click', function() { globalLoaded = !globalLoaded; }); }

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
    let interval = 40;
    let count = 0;
    const rollAnim = setInterval(() => {
        // smooth change: fade number out, then change, then fade in
        const tmp = Math.floor(Math.random() * sides) + 1;
        smoothUpdateNumber(diceNumber, tmp);
        count++;
        if (count >= frames) {
            clearInterval(rollAnim);
            diceFace.classList.remove('rolling');
            const result = rollDie(sides);
            smoothUpdateNumber(diceNumber, result);
            if (callback) callback(result);
        }
    }, interval);
}

// Loaded mode toggle
let loaded = false;
// Critical next-attack toggle
let critNext = false;

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
// Smooth number updater: fades out, changes text, fades in.
// Smooth number updater: fades out, changes text, fades in.
function smoothUpdateNumber(el, value) {
    if (!el) return;
    try {
        // If already fading, just replace the value after current cycle
        if (el._fadeTimeout) {
            clearTimeout(el._fadeTimeout);
            el._fadeTimeout = null;
        }
        el.classList.add('fading');
        el._fadeTimeout = setTimeout(() => {
            el.textContent = String(value);
            el.classList.remove('fading');
            el._fadeTimeout = null;
        }, 120);
    } catch (e) { el.textContent = String(value); }
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
    smoothUpdateNumber(diceNumber, sides);
} else if (globalLowest) {
    smoothUpdateNumber(diceNumber, 1);
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
        let interval = 40;
        let frameCount = 0;
        const rollAnim = setInterval(() => {
            const tmp = Math.floor(Math.random() * sides) + 1;
            smoothUpdateNumber(diceNumber, tmp);
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
                smoothUpdateNumber(diceNumber, result);
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
    if (!diceFacesContainer) return;
    diceFacesContainer.innerHTML = '';
    const diceTotal = document.getElementById('dice-total');
    if (diceTotal) diceTotal.textContent = '';

    const diceFaces = [];
    let results = Array(sidesArr.length).fill(0);
    let failTriggered = false;
    let finished = 0;

    // create faces
    sidesArr.forEach((sides, i) => {
        const face = createDiceFace(i, sides);
        diceFacesContainer.appendChild(face);
        diceFaces.push(face);
    });

    // animate each face
    diceFaces.forEach((diceFace, i) => {
        const diceNumber = diceFace.querySelector('.dice-number');
        diceFace.classList.add('rolling');
        let frames = 20;
        let interval = 40;
        let frameCount = 0;
        const rollAnim = setInterval(() => {
            const tmp = Math.floor(Math.random() * sidesArr[i]) + 1;
            smoothUpdateNumber(diceNumber, tmp);
            frameCount++;
            if (frameCount >= frames) {
                clearInterval(rollAnim);
                diceFace.classList.remove('rolling');
                const result = (loadedMode && (sidesArr.length <= 2 ? true : i % 2 === 0)) ? sidesArr[i] : (globalLowest ? 1 : rollDie(sidesArr[i]));
                smoothUpdateNumber(diceNumber, result);
                results[i] = result;

                if (result === 1 && !failTriggered) {
                    failTriggered = true;
                    showFailMessage();
                }

                finished++;
                if (finished === sidesArr.length) {
                    const total = results.reduce((a, b) => a + b, 0);
                    if (diceTotal) diceTotal.textContent = `Total: ${total}`;
                    // detect crits on any d20
                    let isCritSuccess = false;
                    let isCritFail = false;
                    sidesArr.forEach((s, idx) => {
                        if (s === 20) {
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
const _rollBtn = document.getElementById('roll-btn');
if (_rollBtn) {
    _rollBtn.addEventListener('click', () => {
        const selects = document.querySelectorAll('.dice-select');
        if (selects.length === 0) {
            return; // No dice to roll
        }
        const sidesArr = Array.from(selects).map(sel => parseInt(sel.value));
        animateRollDiceMulti(sidesArr, loaded);
    });
}

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

// Check for an available magic ring to apply later (Echo Band will use attack totals to compute its echo)
let ringUsedId = null;
const nextRingId = getNextAvailableRing();
if (nextRingId) {
    ringUsedId = nextRingId;
}

// Special handling: Dupo Quiver (double shot) if equipped
if (Array.isArray(equippedWeapons) && equippedWeapons.indexOf('dupo-quiver') !== -1) {
    // If user had a global crit toggle set, clear it and let the Dupo chooser handle per-shot crit selection
    if (critNext) {
        critNext = false;
        try { updateCritButtonUI(); } catch (e) { /* noop */ }
    }
    // First shot
    const rollAId = rollId;
    let totalA = modifier;
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

    // Second shot (independent roll)
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

    // If Echo Band is equipped, compute echoes for both shots first
    // then decrement the ring's uses by the number of echoes actually applied.
    if (ringUsedId) {
        const ring = magicRings[ringUsedId];
        try {
            let echoesApplied = 0;

            // Determine availability up-front to avoid sequential mutation issues
            const availBefore = ring.currentUses || 0;

            // Apply to Shot A if at least 1 use available
            if (availBefore >= 1) {
                const echoA = Math.max(1, Math.floor(totalA * (ring.damageModifier || 0.5)));
                totalA += echoA;
                hunterAHtml += `<div style="color:#fff; margin:6px 0;">${ring.name} Echo: +${echoA} (half of shot)</div>`;
                echoesApplied++;
            } else {
                hunterAHtml += `<div style="color:#777; margin:6px 0;">${ring.name} Echo: (no uses remaining)</div>`;
            }

            // Apply to Shot B if at least 2 uses were available before (i.e., one remaining after A)
            if (availBefore >= 2) {
                const echoB = Math.max(1, Math.floor(totalB * (ring.damageModifier || 0.5)));
                totalB += echoB;
                hunterBHtml += `<div style="color:#fff; margin:6px 0;">${ring.name} Echo: +${echoB} (half of shot)</div>`;
                echoesApplied++;
            } else {
                // If B didn't get an echo, show 'no uses' only if there were no uses at all
                if (availBefore < 2) hunterBHtml += `<div style="color:#777; margin:6px 0;">${ring.name} Echo: (no uses remaining)</div>`;
            }

            if (echoesApplied > 0) {
                // When using Dupo Quiver, consume only one ring use for the full two-shot action
                ring.currentUses = Math.max(0, (ring.currentUses || 0) - 1);
                updateRingStatus();
            }
        } catch (e) {
            console.error('Error applying echo band to Dupo shots', e);
        }
    }

    // Build display HTML for both shots and provide selection buttons
    let aHtml = `<div style="color:#fff; margin:5px 0; font-weight:700">Shot A</div>`;
    rollsA.forEach(r => { aHtml += `<div style="color:#fff;margin:4px 0;">${r.dice}: [${r.rolls.join(', ')}]</div>`; });
    aHtml += hunterAHtml;
    aHtml += `<div style="color:#fff;margin-top:8px;">Modifiers: <span style="color:#ffd">Dex +4</span>, <span style="color:#ffd">Sharpshooter +10</span></div>`;
    aHtml += `<div style="margin-top:8px;color:#ff0;font-weight:700;">Total A: ${totalA}</div>`;

    let bHtml = `<div style="color:#fff; margin:5px 0; font-weight:700">Shot B</div>`;
    rollsB.forEach(r => { bHtml += `<div style="color:#fff;margin:4px 0;">${r.dice}: [${r.rolls.join(', ')}]</div>`; });
    bHtml += hunterBHtml;
    bHtml += `<div style="color:#fff;margin-top:8px;">Modifiers: <span style="color:#ffd">Dex +4</span>, <span style="color:#ffd">Sharpshooter +10</span></div>`;
    bHtml += `<div style="margin-top:8px;color:#ff0;font-weight:700;">Total B: ${totalB}</div>`;

    // store for chooser
    _lastDupoA = { total: totalA, html: aHtml };
    _lastDupoB = { total: totalB, html: bHtml };
    _lastDupoDesc = description;

    let combined = `<div style="margin-bottom:15px;color:#0f0;font-weight:bold;">${description} — Dupo Quiver (two shots)</div>`;
    combined += `<div style="display:flex;gap:20px;flex-wrap:wrap;">`;
    combined += `<div style="flex:1;min-width:220px;background:#222;padding:10px;border-radius:6px;">${aHtml}<div style="text-align:center;margin-top:10px;">` +
                `<button class=\"weapon-btn\" onclick=\"chooseDupoResult('a')\">Choose Shot A</button>` +
                `<button class=\"weapon-btn\" style=\"margin-left:8px;\" onclick=\"chooseDupoResult('a-crit')\">Choose Shot A (Crit)</button>` +
                `</div></div>`;
    combined += `<div style="flex:1;min-width:220px;background:#222;padding:10px;border-radius:6px;">${bHtml}<div style="text-align:center;margin-top:10px;">` +
                `<button class=\"weapon-btn\" onclick=\"chooseDupoResult('b')\">Choose Shot B</button>` +
                `<button class=\"weapon-btn\" style=\"margin-left:8px;\" onclick=\"chooseDupoResult('b-crit')\">Choose Shot B (Crit)</button>` +
                `</div></div>`;
    combined += `</div>`;
    combined += `<div style="text-align:center;margin-top:12px;">` +
                `<button class=\"weapon-btn\" onclick=\"chooseDupoResult('combine')\">Combine Shots (A + B)</button>` +
                `<button class=\"weapon-btn\" style=\"margin-left:8px;\" onclick=\"chooseDupoResult('combine-crit-a')\">Combine (Crit A)</button>` +
                `<button class=\"weapon-btn\" style=\"margin-left:8px;\" onclick=\"chooseDupoResult('combine-crit-b')\">Combine (Crit B)</button>` +
                `<button class=\"weapon-btn\" style=\"margin-left:8px;\" onclick=\"chooseDupoResult('combine-crit-both')\">Combine (Crit Both)</button>` +
                `</div>`;

    // ring echo details are included per-shot above and ring uses updated there

    const wo = document.getElementById('weapon-output');
    if (wo) wo.innerHTML = combined;
    return;
}

// Parse dice notation (e.g., "3d6", "1d8")
let total = modifier;
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
    // Show modifiers in visual breakdown (Dex +4, Sharpshooter +10)
    resultHTML += `<div style="color:#fff;margin-top:8px;">Modifiers: <span style="color:#ffd">Dex +4</span>, <span style="color:#ffd">Sharpshooter +10</span></div>`;

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

// (Total Damage display moved below to account for echoes & criticals)

// If Echo Band is equipped we compute its echo from the final total and include it
if (ringUsedId) {
    const ring = magicRings[ringUsedId];
    try {
        const echo = Math.max(1, Math.floor(total * (ring.damageModifier || 0.5)));
        // show echo detail
        resultHTML += `<div style="color:#fff; margin-top:8px;">${ring.name} Echo: +${echo} (half of attack)</div>`;
        total += echo;
        // consume one use
        ring.currentUses = Math.max(0, (ring.currentUses || 0) - 1);
        updateRingStatus();
    } catch (e) {
        console.error('Error applying echo band', e);
    }
}
    // Apply critical for non-Dupo single attacks
    try {
        if (critNext) {
            total = total * 2;
            resultHTML += `<div style="margin-top:8px;color:#f88;font-weight:800;">Critical Hit! Damage doubled.</div>`;
            critNext = false;
            // update UI toggle
            try { updateCritButtonUI(); } catch (e) { /* ignore */ }
        }
    } catch (e) {
        console.error('Error applying critical modifier:', e);
    }

    // Final total display (after echoes & crits)
    resultHTML += `<div style="margin-top: 15px; color:  #ff0; font-size: 1.3em; font-weight: bold;">Total Damage: ${total}</div>`;

    weaponOutput.innerHTML = resultHTML;
recordRoll({ total, title: description, breakdownHtml: resultHTML, isCritSuccess: false, isCritFail: false, rollId });
// Refresh active effects UI and spell buttons so applied effects are visible
updateActiveEffectsUI();
updateSpellButtons();
updateAttackHighlights();
}

// Initiative
function rollInitiative() {
const weaponOutput = document.getElementById('weapon-output');
const roll = rollDie(20);
const total = roll + 6;
weaponOutput.innerHTML = `
       <div style="margin-bottom: 15px; color: #0f0; font-weight: bold;">Initiative Roll</div>
       <div style="color: #fff; margin: 5px 0;">1d20: [${roll}]</div>
    <div style="color: #fff; margin:  5px 0;">Modifier: +6</div>
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
    const total = roll + 6;
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
        // reschedule auto-hide when user shows it
        scheduleBumberAutoHide(5000);
    } else {
        b.style.display = 'none';
        // clear any pending auto-hide
        if (window._bumberHideTimeout) { clearTimeout(window._bumberHideTimeout); window._bumberHideTimeout = null; }
    }
}

// Auto-hide the bumber after a delay (ms). Stores timeout on window to allow clearing.
function scheduleBumberAutoHide(ms) {
    const b = document.getElementById('bumber');
    if (!b) return;
    // clear existing
    if (window._bumberHideTimeout) { clearTimeout(window._bumberHideTimeout); window._bumberHideTimeout = null; }
    window._bumberHideTimeout = setTimeout(() => {
        try { b.style.display = 'none'; } catch (e) { /* ignore */ }
        window._bumberHideTimeout = null;
    }, ms || 5000);
}

// Player movement speed tracking
const PLAYER_BASE_SPEED = 20; // feet

function computeCurrentSpeed() {
    // Base speed
    let speed = PLAYER_BASE_SPEED;
    // Add movement bonuses from active effects (e.g., Zephyr Strike, First Turn Speed)
    activeEffects.forEach(e => {
        if (!e || typeof e.movementBonus === 'undefined') return;
        if (e.state === 'active') speed += parseInt(e.movementBonus || 0, 10);
    });
    return speed;
}

function updateSpeedDisplay() {
    const el = document.getElementById('speed-display');
    if (!el) return;
    const speed = computeCurrentSpeed();
    el.innerText = `${speed} ft`;
}

// Short Range Attacks
function rollShortRangeFirstTurn() {
const description = 'Short Range - First Turn<br>Faerie Fire (advantage) + Hunters Mark (1d6) + Shortbow + Dread Ambusher + 1d6 Magic + Sharpshooter';
// Shortbow first turn: weapon 1d6 + Dread Ambusher 1d8 + Magic 1d6 + Hunter's Mark 1d6. Modifiers: DEX +4 + Sharpshooter +10 => +14
// We include an explicit '1d6' for Hunter's Mark in the dice array for first-turn calculations.
// Ensure Faerie Fire + Hunter's Mark are applied and spell slots consumed for first turn
applyFirstTurnBuffs();
// Remove the explicit Hunter's Mark die here; the effect will add its bonus via activeEffects
rollWeaponDice(['1d6', '1d8', '1d6'], 14, description);
}

function rollShortRangeOtherTurns() {
const description = 'Short Range - Other Turns<br>Shortbow + 1d6 Magic + 1d6 HM + DEX +4 + Sharpshooter +10';
// Shortbow: weapon 1d6 + Magic 1d6 + Hunter's Mark 1d6. Modifiers: +4 Dex +10 Sharpshooter => +14
// Remove explicit Hunter's Mark die here; Hunter's Mark will be applied via activeEffects when active
rollWeaponDice(['1d6', '1d6'], 14, description);
}

// Long Range Attacks
function rollLongRangeFirstTurn() {
const description = 'Long Range - First Turn<br>Faerie Fire (advantage) + Hunters Mark (1d6) + Longbow + Dread Ambusher + Sharpshooter';
// Longbow first turn: weapon 1d8 + Dread Ambusher 1d8 + Hunter's Mark 1d6. Modifiers: DEX +4 + Sharpshooter +10 => +14
// Ensure Faerie Fire + Hunter's Mark are applied and spell slots consumed for first turn
applyFirstTurnBuffs();
// Remove the explicit Hunter's Mark die here; the effect will add its bonus via activeEffects
rollWeaponDice(['1d8', '1d8'], 14, description);
}

function rollLongRangeOtherTurns() {
const description = 'Long Range - Other Turns<br>Longbow + 1d6 HM + DEX +4 + Sharpshooter +10';
// Longbow: weapon 1d8 + Hunter's Mark 1d6. Modifiers: +4 Dex +10 Sharpshooter => +14
// Remove explicit Hunter's Mark die here; Hunter's Mark will be applied via activeEffects when active
rollWeaponDice(['1d8'], 14, description);
}

// Apply Faerie Fire and Hunter's Mark for first turn automatically (consumes slots if not already active)
function applyFirstTurnBuffs() {
    const out = document.getElementById('magic-output') || document.getElementById('weapon-output');
    let messages = [];

    // Faerie Fire
    const hasFaerie = activeEffects.some(e => e.name && e.name.toLowerCase() === 'faerie fire' && e.state === 'active');
    if (!hasFaerie) {
        // attempt to consume a slot
        if (consumeSpellSlot('Faerie Fire')) {
            const effect = {
                name: 'Faerie Fire',
                dc: 13,
                desc: 'Affected creatures are outlined in light: attacks against them have advantage.',
                clearOnLongRest: true,
                allowStack: false,
                state: 'active',
                appliedRolls: []
            };
            addActiveEffect(effect);
            messages.push(`Faerie Fire applied (DC ${effect.dc}).`);
        } else {
            messages.push('Faerie Fire could not be applied (no spell slots).');
        }
    } else {
        messages.push('Faerie Fire already active.');
    }

    // Hunter's Mark
    const hasHunter = activeEffects.some(e => e.name && e.name.toLowerCase() === "hunter's mark" && e.state === 'active');
    if (!hasHunter) {
        if (consumeSpellSlot("Hunter's Mark")) {
            const effect = {
                name: "Hunter's Mark",
                bonusDice: '1d6',
                desc: "Marked target takes +1d6 damage from your attacks.",
                clearOnLongRest: false,
                state: 'active',
                appliedRolls: []
            };
            addActiveEffect(effect);
            messages.push("Hunter's Mark applied (1d6)." );
        } else {
            messages.push("Hunter's Mark could not be applied (no spell slots).");
        }
    } else {
        messages.push("Hunter's Mark already active.");
    }

    // First Turn Speed bonus: grant a one-time +10 ft movement bonus until next attack
    const hasFirstTurnSpeed = activeEffects.some(e => e.name && e.name.toLowerCase() === 'first turn speed' && e.state === 'active');
    if (!hasFirstTurnSpeed) {
        const ftEffect = {
            name: 'First Turn Speed',
            movementBonus: 10,
            desc: 'First-turn speed bonus: +10 ft movement until your next weapon attack. Consumes on next attack.',
            oneTime: true,
            highlightAttack: true,
            clearOnLongRest: false,
            state: 'active',
            appliedRolls: []
        };
        addActiveEffect(ftEffect);
        messages.push('First Turn Speed applied (+10 ft).');
    } else {
        messages.push('First Turn Speed already applied.');
    }

    // Update UI and show remaining slots
    updateSpellSlotsUI();
    updateActiveEffectsUI();
    if (out) {
        out.innerHTML = `<div style="font-weight:700;color:#ffd">First-turn buffs</div><div style="color:#e8e8e8;margin-top:6px;">${messages.join(' ')}</div><div style="margin-top:8px;color:#ff6;">Spell slots remaining: ${spellSlotsRemaining}/${SPELL_SLOTS_TOTAL}</div>`;
    }
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
    // Helper to render chosen result and record
    function finalizeAndRecord(titleSuffix, htmlContent, totalValue) {
        weaponOutput.innerHTML = `<div style="margin-bottom:15px;color:#0f0;font-weight:bold;">${_lastDupoDesc} — ${titleSuffix}</div>` + htmlContent;
        recordRoll({ total: totalValue, title: `${_lastDupoDesc} (${titleSuffix})`, breakdownHtml: htmlContent, isCritSuccess: false, isCritFail: false });
        updateActiveEffectsUI();
        updateSpellButtons();
        updateAttackHighlights();
        _lastDupoA = null; _lastDupoB = null; _lastDupoDesc = null;
    }

    if ((which === 'a' || which === 'a-crit') && _lastDupoA) {
        const isCrit = which === 'a-crit';
        const total = isCrit ? (_lastDupoA.total * 2) : _lastDupoA.total;
        let html = _lastDupoA.html;
        if (isCrit) html += `<div style="margin-top:8px;color:#f88;font-weight:800;">Critical Hit applied to Shot A — damage x2: ${total}</div>`;
        finalizeAndRecord(`Selected: Shot A${isCrit ? ' (Crit)' : ''}`, html, total);
        return;
    }

    if ((which === 'b' || which === 'b-crit') && _lastDupoB) {
        const isCrit = which === 'b-crit';
        const total = isCrit ? (_lastDupoB.total * 2) : _lastDupoB.total;
        let html = _lastDupoB.html;
        if (isCrit) html += `<div style="margin-top:8px;color:#f88;font-weight:800;">Critical Hit applied to Shot B — damage x2: ${total}</div>`;
        finalizeAndRecord(`Selected: Shot B${isCrit ? ' (Crit)' : ''}`, html, total);
        return;
    }

    if (which === 'combine' && _lastDupoA && _lastDupoB) {
        const combinedTotal = (_lastDupoA.total || 0) + (_lastDupoB.total || 0);
        const combinedHtml = `<div style="display:flex;gap:20px;flex-wrap:wrap;">` +
            `<div style="flex:1;min-width:220px;background:#222;padding:10px;border-radius:6px;">${_lastDupoA.html}</div>` +
            `<div style="flex:1;min-width:220px;background:#222;padding:10px;border-radius:6px;">${_lastDupoB.html}</div>` +
            `</div>` + `<div style="margin-top:12px;color:#ff0;font-weight:800;font-size:1.1em;">Combined Total: ${combinedTotal}</div>`;
        finalizeAndRecord('Combined Shots (A + B)', combinedHtml, combinedTotal);
        return;
    }

    if (which === 'combine-crit-a' && _lastDupoA && _lastDupoB) {
        const combinedTotal = ((_lastDupoA.total || 0) * 2) + (_lastDupoB.total || 0);
        const combinedHtml = `<div style="display:flex;gap:20px;flex-wrap:wrap;">` +
            `<div style="flex:1;min-width:220px;background:#222;padding:10px;border-radius:6px;">${_lastDupoA.html}<div style=\"margin-top:8px;color:#f88;font-weight:800;\">Critical Hit applied to Shot A (x2)</div></div>` +
            `<div style="flex:1;min-width:220px;background:#222;padding:10px;border-radius:6px;">${_lastDupoB.html}</div>` +
            `</div>` + `<div style="margin-top:12px;color:#ff0;font-weight:800;font-size:1.1em;">Combined Total (Crit A): ${combinedTotal}</div>`;
        finalizeAndRecord('Combined Shots (Crit A)', combinedHtml, combinedTotal);
        return;
    }

    if (which === 'combine-crit-b' && _lastDupoA && _lastDupoB) {
        const combinedTotal = (_lastDupoA.total || 0) + ((_lastDupoB.total || 0) * 2);
        const combinedHtml = `<div style="display:flex;gap:20px;flex-wrap:wrap;">` +
            `<div style="flex:1;min-width:220px;background:#222;padding:10px;border-radius:6px;">${_lastDupoA.html}</div>` +
            `<div style="flex:1;min-width:220px;background:#222;padding:10px;border-radius:6px;">${_lastDupoB.html}<div style=\"margin-top:8px;color:#f88;font-weight:800;\">Critical Hit applied to Shot B (x2)</div></div>` +
            `</div>` + `<div style="margin-top:12px;color:#ff0;font-weight:800;font-size:1.1em;">Combined Total (Crit B): ${combinedTotal}</div>`;
        finalizeAndRecord('Combined Shots (Crit B)', combinedHtml, combinedTotal);
        return;
    }

    if (which === 'combine-crit-both' && _lastDupoA && _lastDupoB) {
        const combinedTotal = ((_lastDupoA.total || 0) * 2) + ((_lastDupoB.total || 0) * 2);
        const combinedHtml = `<div style="display:flex;gap:20px;flex-wrap:wrap;">` +
            `<div style="flex:1;min-width:220px;background:#222;padding:10px;border-radius:6px;">${_lastDupoA.html}<div style=\"margin-top:8px;color:#f88;font-weight:800;\">Critical Hit applied to Shot A (x2)</div></div>` +
            `<div style="flex:1;min-width:220px;background:#222;padding:10px;border-radius:6px;">${_lastDupoB.html}<div style=\"margin-top:8px;color:#f88;font-weight:800;\">Critical Hit applied to Shot B (x2)</div></div>` +
            `</div>` + `<div style="margin-top:12px;color:#ff0;font-weight:800;font-size:1.1em;">Combined Total (Crit Both): ${combinedTotal}</div>`;
        finalizeAndRecord('Combined Shots (Crit Both)', combinedHtml, combinedTotal);
        return;
    }

    // Fallback: clear stored values
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
                           ${ringId === 'echo-band' ? 'Use Echo (attack total ÷ 2)' : `Use Ring Bonus (${ring.damage} ÷ 2)`}
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

// Short Rest: heal 4d10 points of health (fair dice)
function shortRest() {
    const weaponOutput = document.getElementById('weapon-output');
    const rolls = [];
    let totalHeal = 0;
    // 4d10 + 1d8
    for (let i = 0; i < 4; i++) {
        const r = rollDie(10);
        rolls.push(r);
        totalHeal += r;
    }
    const r8 = rollDie(8);
    rolls.push(r8);
    totalHeal += r8;
    // Apply healing
    changeHealth(totalHeal);

    const html = `<div style="font-weight:700;color:#0f0;">Short Rest: Healed ${totalHeal} HP</div>` +
        `<div style="color:#fff;margin-top:8px;">4d10 + 1d8: [${rolls.slice(0,4).join(', ')}] + [${rolls[4]}]</div>`;
    if (weaponOutput) weaponOutput.innerHTML = html;
    recordRoll({ total: totalHeal, title: 'Short Rest (4d10+1d8)', breakdownHtml: html, isCritSuccess: false, isCritFail: false });
}

// Toggle critical for next single attack (non-Dupo)
function toggleCritNext() {
    critNext = !critNext;
    updateCritButtonUI();
}

function updateCritButtonUI() {
    const btn = document.getElementById('crit-toggle');
    if (!btn) return;
    if (critNext) {
        btn.textContent = 'Crit Next Attack: On';
        btn.classList.add('effect-active');
    } else {
        btn.textContent = 'Crit Next Attack: Off';
        btn.classList.remove('effect-active');
    }
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
    // Update both the main health display and the header health
    const mainEl = document.getElementById('health-display');
    const headerEl = document.getElementById('health-header');
    const halfThreshold = Math.floor(maxHealth / 2);
    [mainEl, headerEl].forEach(el => {
        if (!el) return;
        el.textContent = `${currentHealth} / ${maxHealth}`;
        // colorize: dead => red, <= half => orange, otherwise normal
        if (currentHealth <= 0) el.style.color = '#f55';
        else if (currentHealth <= halfThreshold) el.style.color = '#ffb86b';
        else el.style.color = '#ffd';
    });

    // Toggle heartbeat/theme pulse when at or below half health
    try {
        if (currentHealth > 0 && currentHealth <= halfThreshold) {
            document.body.classList.add('low-health');
            // ensure overlay exists (with theme layers)
            let overlay = document.getElementById('health-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'health-overlay';
                const thPurple = document.createElement('div'); thPurple.className = 'theme-purple';
                const thRed = document.createElement('div'); thRed.className = 'theme-red';
                const thCrit = document.createElement('div'); thCrit.className = 'theme-critical';
                const pulse = document.createElement('div'); pulse.className = 'pulse';
                overlay.appendChild(thPurple);
                overlay.appendChild(thRed);
                overlay.appendChild(thCrit);
                overlay.appendChild(pulse);
                document.body.appendChild(overlay);
            }
        } else {
            document.body.classList.remove('low-health');
        }
    } catch (e) { /* ignore DOM errors */ }

    // critical health: heavy red + black pulse when at or below 10 HP
    try {
        const CRITICAL_THRESHOLD = 10;
        let overlay = document.getElementById('health-overlay');
        if (currentHealth > 0 && currentHealth <= CRITICAL_THRESHOLD) {
            document.body.classList.add('critical-health');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'health-overlay';
                const thPurple = document.createElement('div'); thPurple.className = 'theme-purple';
                const thRed = document.createElement('div'); thRed.className = 'theme-red';
                const thCrit = document.createElement('div'); thCrit.className = 'theme-critical';
                const pulse = document.createElement('div'); pulse.className = 'pulse';
                overlay.appendChild(thPurple);
                overlay.appendChild(thRed);
                overlay.appendChild(thCrit);
                overlay.appendChild(pulse);
                document.body.appendChild(overlay);
            } else {
                // ensure critical layer exists
                if (!overlay.querySelector('.theme-critical')) {
                    const thCrit = document.createElement('div'); thCrit.className = 'theme-critical';
                    overlay.insertBefore(thCrit, overlay.querySelector('.pulse') || null);
                }
            }
        } else {
            document.body.classList.remove('critical-health');
        }
    } catch (e) { /* ignore DOM errors */ }
}

function changeHealth(delta) {
    loadHealth();
    const rawDelta = delta || 0;
    currentHealth = Math.max(0, Math.min(maxHealth, currentHealth + rawDelta));
    saveHealth();
    updateHealthUI();
    const out = document.getElementById('weapon-output') || document.getElementById('magic-output');
    if (out) out.innerHTML = `<div style="color:#fff;">Health: ${currentHealth}/${maxHealth}</div>`;
    // show a small visual when HP changes
    try {
        if (rawDelta > 0) triggerLifeEffect('gain');
        else if (rawDelta < 0) triggerLifeEffect('lose');
    } catch (e) { /* ignore visual errors */ }
    // If HP reached 0, fade out and redirect to saving-throws
    try {
        if (currentHealth <= 0 && !_deathTransitioning) {
            _deathTransitioning = true;
            // create full-screen black overlay
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.background = '#000';
            overlay.style.opacity = '0';
            overlay.style.zIndex = '999999';
            overlay.style.transition = 'opacity 800ms ease-in';
            document.body.appendChild(overlay);
            // trigger fade
            requestAnimationFrame(()=>{ overlay.style.opacity = '1'; });
            // After fade, redirect to saving throws
            setTimeout(()=>{
                try { localStorage.setItem('diedAt','1'); } catch(e){}
                window.location.href = 'saving-throws.html';
            }, 1000);
        }
    } catch (e) { /* ignore */ }
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

// If player was revived from death via saving-throws, grant 1 HP and clear flag
try {
    const revived = localStorage.getItem('revivedFromDeath');
    if (revived === '1') {
        currentHealth = 1;
        saveHealth();
        updateHealthUI();
        localStorage.removeItem('revivedFromDeath');
        const out = document.getElementById('weapon-output') || document.getElementById('magic-output');
        if (out) out.innerHTML = `<div style="color:#0f0;">You revived with 1 HP.</div>`;
    }
} catch (e) { /* ignore storage errors */ }

let _deathTransitioning = false;

// --- Armor Class (AC) tracker ---
const AC_KEY = 'characterAC';
const DEFAULT_AC = 15;
let currentAC = DEFAULT_AC;

function loadAC() {
    const v = parseInt(localStorage.getItem(AC_KEY), 10);
    currentAC = isNaN(v) ? DEFAULT_AC : v;
}

function saveAC() {
    localStorage.setItem(AC_KEY, String(currentAC));
}

function updateACUI() {
    const small = document.getElementById('ac-display');
    const large = document.getElementById('ac-large');
    if (small) small.textContent = String(currentAC);
    if (large) large.textContent = `AC: ${String(currentAC)}`;
    // update calc explanation if present
    const acCalc = document.getElementById('ac-calc');
    if (acCalc) acCalc.textContent = String(currentAC);
}

// Helper: read ability score by label from the stat cards
function getAbilityScore(label) {
    try {
        const cards = document.querySelectorAll('.stat-card');
        for (let i = 0; i < cards.length; i++) {
            const lab = cards[i].querySelector('.stat-label');
            const val = cards[i].querySelector('.stat-score');
            if (lab && val && lab.textContent.trim().toUpperCase() === label.toUpperCase()) {
                const n = parseInt(val.textContent.trim(), 10);
                return isNaN(n) ? null : n;
            }
        }
    } catch (e) {
        return null;
    }
    return null;
}

// Compute AC from armor (studded leather = 12 + Dex mod). Update currentAC and explanation.
function updateArmorAC() {
    // default to stored currentAC if we can't compute
    const armorEl = document.getElementById('armor-type');
    const armor = armorEl ? armorEl.textContent.trim().toLowerCase() : '';
    // find DEX score
    const dex = getAbilityScore('DEX');
    const dexMod = (typeof dex === 'number') ? Math.floor((dex - 10) / 2) : 0;
    let computed = currentAC;
    if (armor && armor.includes('studded')) {
        const base = 12;
        computed = base + dexMod;
        // update explanation text if element exists
        const explain = document.getElementById('ac-explain');
        if (explain) {
            explain.textContent = `${base} (studded leather) + Dex mod (${dexMod >= 0 ? '+'+dexMod : dexMod}) = `;
            const acCalc = document.getElementById('ac-calc');
            if (acCalc) acCalc.textContent = String(computed);
        }
    }
    currentAC = computed;
    saveAC();
}

function initAC() {
    loadAC();
    // compute AC from equipped armor if possible (studded leather = 12 + Dex mod)
    updateArmorAC();
    updateACUI();
    const small = document.getElementById('ac-display');
    const large = document.getElementById('ac-large');

    function parseACFromText(text) {
        if (!text) return NaN;
        const m = text.match(/(\d+)/);
        return m ? parseInt(m[1], 10) : NaN;
    }

    function attachCommitHandlers(el, isLarge) {
        if (!el) return;
        el.addEventListener('blur', () => {
            const raw = el.textContent || '';
            const n = parseACFromText(raw);
            if (isNaN(n)) {
                updateACUI();
                return;
            }
            currentAC = Math.max(0, Math.min(30, n));
            saveAC();
            updateACUI();
        });
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
        });
    }

    attachCommitHandlers(small, false);
    attachCommitHandlers(large, true);
}
// initialize AC UI
initAC();

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
        if (typeof eff.movementBonus !== 'undefined') header += ` (+${eff.movementBonus} ft)`;
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
    // Update movement speed display
    try { updateSpeedDisplay(); } catch (e) { /* ignore */ }
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
        // Remove the resistance granted by this spell
        if (removed.resistanceType) {
            removeResistance(removed.resistanceType);
        }
        updateActiveEffectsUI();
        updateAbsorbButton(false);
        if (out) out.innerHTML = `<div style="color:#ff6;font-weight:700;">Deactivated: ${removed.name}</div>`;
        return;
    }

    // Prompt user to choose element type
    const elementChoice = prompt('Choose element type for Absorb Elements:\n\nFire, Cold, Lightning, Thunder, or Acid', 'Fire');
    if (!elementChoice) return; // Cancelled
    
    const normalizedElement = elementChoice.toLowerCase().trim();
    const validElements = ['fire', 'cold', 'lightning', 'thunder', 'acid'];
    
    if (!validElements.includes(normalizedElement)) {
        alert('Invalid element type. Choose: Fire, Cold, Lightning, Thunder, or Acid');
        return;
    }

    // Activate Absorb Elements (defensive + next attack bonus damage)
    const elementName = normalizedElement.charAt(0).toUpperCase() + normalizedElement.slice(1);
    const effect = {
        name: `Absorb Elements (${elementName})`,
        bonusDice: '1d8',
        desc: `Reactive protection: you gain resistance to ${elementName} damage until the start of your next turn, and your next weapon attack deals +1d8 ${elementName} damage.`,
        defensive: true,
        oneTime: true,
        highlightAttack: true,
        clearOnLongRest: false,
        resistanceType: normalizedElement
    };
    effect.state = 'active';
    effect.appliedRolls = [];
    
    // Add the resistance
    addResistance(normalizedElement);
    
    addActiveEffect(effect);
    updateAbsorbButton(true);
    recordRoll({ total: 0, title: `Absorb Elements (${elementName})`, breakdownHtml: `<div style="color:#fff">Absorb Elements activated — ${elementName} resistance granted and +1d8 ${elementName} damage on next attack.</div>`, isCritSuccess: false, isCritFail: false });
    if (out) out.innerHTML = `<div style="font-weight:700;color:#ffd">Absorb Elements (${elementName}) activated</div><div style="color:#e8e8e8;margin-top:6px;">You have resistance to ${elementName} damage until the start of your next turn, and your next weapon attack deals +1d8 ${elementName} damage. Toggle to deactivate.</div>`;
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
    if (out) out.innerHTML = `<div style="font-weight:700;color:#ffd">Faerie Fire cast (DC ${dc})</div><div style="color:#e8e8e8;margin-top:6px;">Added Active Effect: advantage on attacks vs illuminated targets. Remove when effect ends or via the Active Effects list.</div><div style="margin-top:8px;color:#ff6;">Spell slots remaining: ${spellSlotsRemaining}/${SPELL_SLOTS_TOTAL}</div>`;
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
    if (out) out.innerHTML = `<div style="font-weight:700;color:#ffd">Hunter's Mark activated</div><div style="color:#e8e8e8;margin-top:6px;">Bonus damage ${effect.bonusDice} will be applied automatically to weapon attacks until removed.</div><div style="margin-top:8px;color:#ff6;">Spell slots remaining: ${spellSlotsRemaining}/${SPELL_SLOTS_TOTAL}</div>`;
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
        movementBonus: 30, // feet added to movement until next attack
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

// Sanity checks: run a lightweight set of function calls on DOM ready and report results to console
function runSanityChecks() {
    const results = [];
    try {
        const d = rollDie(6);
        results.push(`rollDie(6) -> ${d}`);
    } catch (e) { results.push(`rollDie error: ${e.message}`); }
    try {
        const dd = rollDamageDie(6);
        results.push(`rollDamageDie(6) -> ${dd}`);
    } catch (e) { results.push(`rollDamageDie error: ${e.message}`); }
    try {
        const svg = getDiceShape(6);
        results.push(`getDiceShape(6) -> length ${svg.length}`);
    } catch (e) { results.push(`getDiceShape error: ${e.message}`); }
    try {
        const id = generateRollId();
        results.push(`generateRollId -> ${id}`);
    } catch (e) { results.push(`generateRollId error: ${e.message}`); }
    try {
        updateDiceSelectors();
        results.push('updateDiceSelectors -> ok');
    } catch (e) { results.push(`updateDiceSelectors error: ${e.message}`); }
    try {
        updateArmorAC(); updateACUI();
        results.push(`updateArmorAC/updateACUI -> AC ${typeof currentAC !== 'undefined' ? currentAC : 'unknown'}`);
    } catch (e) { results.push(`updateArmorAC error: ${e.message}`); }

    console.group('Sanity Checks');
    results.forEach(r => console.log(r));
    console.groupEnd();

    const out = document.getElementById('weapon-output') || document.getElementById('magic-output');
    if (out) {
        out.innerHTML = `<div style="color:#cfe;font-weight:700;padding:6px;border-radius:6px;">Sanity checks run — open console for details.</div>`;
    }
}

document.addEventListener('DOMContentLoaded', runSanityChecks);

// Global error handlers to surface runtime errors in the UI for easier debugging
window.addEventListener('error', function (ev) {
    console.error('Unhandled error', ev.error || ev.message, ev);
    const out = document.getElementById('weapon-output') || document.getElementById('magic-output');
    if (out) out.innerHTML = `<div style="color:#f88;font-weight:700;">Runtime error: ${String(ev.error || ev.message)}</div>`;
});
window.addEventListener('unhandledrejection', function (ev) {
    console.error('Unhandled promise rejection', ev.reason);
    const out = document.getElementById('weapon-output') || document.getElementById('magic-output');
    if (out) out.innerHTML = `<div style="color:#f88;font-weight:700;">Promise rejection: ${String(ev.reason)}</div>`;
});
