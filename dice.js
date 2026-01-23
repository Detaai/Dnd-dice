const magicRings = {
'echo-band': {
name: 'Echo Band',
description: 'Create an echo of any object that fully passes through, this echo follows the exact path of the original and cannot be separated, the echo only lasts for one minute and does half damage.',
damage: '1d8',
damageModifier: 0.5, // Divide by 2
maxUses: 5,
currentUses: 5
}
};

function updateMagicWeaponsUI() {
    html += `
    <label style="display: block; margin: 10px 0; padding: 10px; background: ${isEquipped ? '#4a4' : '#444'}; border-radius: 5px; cursor: pointer; border: 2px solid ${isEquipped ? '#0f0' : 'transparent'};">
`;
}

function performSingleDamageRoll() {
    if (ringUsedId && ringRollDetails) {
        detailsHTML += `<div style="color: #fff; margin: 10px 0;">Ring Bonus - ${ringRollDetails.name}: [${ringRollDetails.rolls.join(', ')}] = ${ringRollDetails.total} → ${ringRollDetails.final}</div>`;
        updateRingStatus();
    }
}