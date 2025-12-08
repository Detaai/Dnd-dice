// Funny failure phrases
const failPhrases = [
    "You failed so bad I'm impressed!",
    "You do this a lot huh?",
    "Epic fail!",
    "The dice hate you today.",
    "Try again... or not.",
    "That was spectacularly bad!",
    "You rolled a 1. Ouch!",
    "Is this your superpower?",
    "You couldn't fail harder if you tried!",
    "The universe is laughing at you."
];

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
    newInput.style.width = '50px';
    parent.replaceChild(newInput, diceCountInput);
    diceCountInput = newInput;
    attachDiceInputListeners(newInput);
    updateDiceSelectors();
}
// Toggle lowest mode with Ctrl+Shift+X

// D&D Dice Roller Logic
function rollDie(sides) {
    // All faces have equal chance
    return Math.floor(Math.random() * sides) + 1;
}

function animateRoll(sides, callback) {
    const diceFace = document.getElementById('dice-face');
    const diceNumber = document.getElementById('dice-number');
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

document.getElementById('roll-btn').addEventListener('click', () => {
    const select = document.getElementById('dice-select');
    const sides = parseInt(select.value);
    animateRoll(sides);
});

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
        case 20:
            // Icosahedron (d20)
            return '<svg width="60" height="60" viewBox="0 0 60 60"><polygon points="30,5 55,20 55,40 30,55 5,40 5,20" fill="#444" stroke="#fff" stroke-width="2"/></svg>';
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
        <div class="dice-shape" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;">${getDiceShape(sides)}</div>
        <span class="dice-number" style="position:relative;font-size:2em;color:#fff;z-index:1;">?</span>
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
                if (loadedMode && (count <= 2 ? true : i % 2 === 0)) {
                    result = sides;
                } else {
                    result = rollDie(sides);
                }
                diceNumber.textContent = result;
            }
        }, interval);
    });
    // Add load button event listeners
    diceFaces.forEach((diceFace) => {
        const loadBtn = diceFace.querySelector('.load-btn');
        loadBtn.addEventListener('click', (e) => {
            loaded = !loaded;
            // Visual feedback
            diceFace.style.boxShadow = loaded ? '0 0 20px 5px gold' : '0 0 10px #000';
        });
    });
}


const diceTypes = [4, 6, 8, 10, 12, 20];

function updateDiceSelectors() {
    const count = parseInt(document.getElementById('dice-count').value);
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

document.getElementById('dice-count').addEventListener('input', updateDiceSelectors);
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
                    diceTotal.textContent = `Total: ${results.reduce((a, b) => a + b, 0)}`;
                }
            }
        }, interval);
    });
}

document.getElementById('roll-btn').addEventListener('click', () => {
    const selects = document.querySelectorAll('.dice-select');
    const sidesArr = Array.from(selects).map(sel => parseInt(sel.value));
    animateRollDiceMulti(sidesArr, loaded);
});

// Character Weapon System
let poisonArrows = 5;

function updatePoisonCounter() {
    document.getElementById('poison-counter').textContent = `Poison Arrows: ${poisonArrows}/5 remain`;
}

function replenishPoisonArrows() {
    poisonArrows = 5;
    updatePoisonCounter();
    const weaponOutput = document.getElementById('weapon-output');
    weaponOutput.innerHTML = '<div style="color: #0f0; font-weight: bold;">Poison arrows replenished to 5/5!</div>';
}

function rollWeaponDice(dice, modifier, description, usePoisonArrow = false) {
    const weaponOutput = document.getElementById('weapon-output');
    weaponOutput.innerHTML = '<div style="color: #fff;">Rolling...</div>';
    
    // Check poison arrow availability
    if (usePoisonArrow && poisonArrows < 1) {
        weaponOutput.innerHTML = '<div style="color: #f00;">No poison arrows remaining!</div>';
        return;
    }
    
    // Parse dice notation (e.g., "3d6", "1d8")
    let total = modifier;
    let rolls = [];
    
    dice.forEach(diceStr => {
        const [count, sides] = diceStr.split('d').map(n => parseInt(n));
        let diceRolls = [];
        for (let i = 0; i < count; i++) {
            const roll = rollDie(sides);
            diceRolls.push(roll);
            total += roll;
        }
        rolls.push({ dice: diceStr, rolls: diceRolls });
    });
    
    // Display results
    let resultHTML = `<div style="margin-bottom: 15px; color: #0f0; font-weight: bold;">${description}</div>`;
    
    rolls.forEach(r => {
        resultHTML += `<div style="color: #fff; margin: 5px 0;">${r.dice}: [${r.rolls.join(', ')}]</div>`;
    });
    
    resultHTML += `<div style="margin-top: 15px; color: #ff0; font-size: 1.3em; font-weight: bold;">Total Damage: ${total}</div>`;
    
    weaponOutput.innerHTML = resultHTML;
    
    // Update poison arrow counter if used
    if (usePoisonArrow) {
        poisonArrows--;
        updatePoisonCounter();
    }
}

// Initiative
function rollInitiative() {
    const weaponOutput = document.getElementById('weapon-output');
    const roll = rollDie(20);
    const total = roll + 2;
    weaponOutput.innerHTML = `
        <div style="margin-bottom: 15px; color: #0f0; font-weight: bold;">Initiative Roll</div>
        <div style="color: #fff; margin: 5px 0;">1d20: [${roll}]</div>
        <div style="color: #fff; margin: 5px 0;">Modifier: +2</div>
        <div style="margin-top: 15px; color: #ff0; font-size: 1.3em; font-weight: bold;">Initiative: ${total}</div>
    `;
}

// Short Range Attacks
function rollShortRangeFirstTurn() {
    const description = 'Short Range - First Turn<br>Faerie Fire (advantage) + Hunters Mark + Short Bow + Poison Arrow + Sharp Shoot';
    rollWeaponDice(['3d6', '1d8'], 12, description, true);
}

function rollShortRangeOtherTurns() {
    const description = 'Short Range - Other Turns<br>Short Bow + Normal Arrow + Hunters Mark';
    rollWeaponDice(['2d6'], 2, description);
}

function rollShortRangePoisonArrow() {
    const description = 'Short Range - Poison Arrow<br>Hunters Mark + Short Bow + Poison Arrow + Sharp Shoot';
    rollWeaponDice(['3d6'], 12, description, true);
}

// Long Range Attacks
function rollLongRangeFirstTurn() {
    const description = 'Long Range - First Turn<br>Faerie Fire (advantage) + Hunters Mark + Long Bow + Poison Arrow + Sharp Shoot';
    rollWeaponDice(['2d6', '2d8'], 13, description, true);
}

function rollLongRangeOtherTurns() {
    const description = 'Long Range - Other Turns<br>Long Bow + Normal Arrow + Hunters Mark + Sharp Shooter';
    rollWeaponDice(['2d6', '1d8'], 13, description);
}

function rollLongRangePoisonArrow() {
    const description = 'Long Range - Poison Arrow<br>Hunters Mark + Long Bow + Poison Arrow + Sharp Shoot';
    rollWeaponDice(['2d6', '1d8'], 12, description, true);
}
