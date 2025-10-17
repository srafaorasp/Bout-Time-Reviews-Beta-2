// src/fightLogic.js

// --- CORE CALCULATION LOGIC ---
export function getWeightClass(rawScore) {
    if (rawScore === 0) return 'Unranked';
    if (rawScore < 4.0) return 'Featherweight';
    if (rawScore < 7.0) return 'Cruiserweight';
    if (rawScore >= 7.0) return 'Heavyweight';
    return 'Unranked';
}

export function getChampionshipBonus(fighterObject, roster) {
    if (!fighterObject || !fighterObject.name || !roster.major) return 0;
    
    const potentialBonuses = [0];
    const name = fighterObject.name;
    if (name === 'Vacant') return 0;

    if (name === roster.major.undisputed?.name) potentialBonuses.push(0.03);
    if (['heavyweight', 'interGenre', 'cruiserweight', 'featherweight'].some(key => roster.major[key]?.name === name)) potentialBonuses.push(0.02);
    if (roster.local && Object.keys(roster.local).some(key => roster.local[key]?.name === name)) potentialBonuses.push(0.01);
    
    const pastTitles = fighterObject.record.pastTitles || {};
    if (pastTitles.undisputed) potentialBonuses.push(0.02);
    if (Object.keys(pastTitles).some(title => ['heavyweight', 'interGenre', 'cruiserweight', 'featherweight'].includes(title))) {
        potentialBonuses.push(0.01);
    }
    return Math.max(...potentialBonuses);
}

export function calculateRawScore(fighterObject) {
    if (!fighterObject) return 0;
    const metacriticInput = fighterObject.scores.metacritic;
    const metacriticScore = (metacriticInput !== '404' && metacriticInput) ? parseFloat(metacriticInput) / 10.0 : 0;
    let totalScore = 0, weightCount = 0;

    if (fighterObject.steamData) {
        const steamReviewData = fighterObject.steamData;
        const communityScore = (steamReviewData.total_reviews > 0) ? (steamReviewData.total_positive / steamReviewData.total_reviews) * 10 : 0;
        
        if (communityScore > 0) {
            totalScore += communityScore * 0.70;
            weightCount += 0.70;
        }
        if (metacriticScore > 0) {
            totalScore += metacriticScore * 0.30;
            weightCount += 0.30;
        }
    } else if (metacriticScore > 0) {
        totalScore = metacriticScore;
        weightCount = 1;
    }
    return weightCount > 0 ? totalScore / weightCount : 0;
}

export function applyBonuses(rawScore, fighterObject, roster) {
    if (!fighterObject) return 0;
    return rawScore * (1 + getChampionshipBonus(fighterObject, roster));
}

// --- FIGHT SIMULATION LOGIC ---

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getStaminaModifiers(stamina) {
    if (stamina >= 75) return { state: 'ENERGIZED', damageMultiplier: 1.0, hitPenalty: 0 };
    if (stamina >= 30) return { state: 'WINDED', damageMultiplier: 0.8, hitPenalty: -1 };
    return { state: 'EXHAUSTED', damageMultiplier: 0.6, hitPenalty: -3 };
}

export async function runFightSimulation(fighter1, fighter2, finalScores, updateState) {
    let health1 = 100, health2 = 100;
    let stamina1 = 100, stamina2 = 100;
    let log = [];
    let winner = null;

    const maxRounds = 6;

    for (let round = 1; round <= maxRounds; round++) {
        log.push(`--- Round ${round} ---`);
        updateState({ health1, health2, stamina1, stamina2, log, round, turn: 0, winner });

        await delay(1000);

        for (let turn = 1; turn <= 20; turn++) {
            const isF1Turn = turn % 2 !== 0;
            
            const [attacker, defender] = isF1Turn ? [fighter1, fighter2] : [fighter2, fighter1];
            let [attackerHealth, defenderHealth] = isF1Turn ? [health1, health2] : [health2, health1];
            let [attackerStamina, defenderStamina] = isF1Turn ? [stamina1, stamina2] : [stamina2, stamina1];
            const attackerScore = isF1Turn ? finalScores.score1 : finalScores.score2;
            const defenderScore = isF1Turn ? finalScores.score2 : finalScores.score1;

            const attackerMods = getStaminaModifiers(attackerStamina);
            const toHitRoll = Math.ceil(Math.random() * 10) + attackerMods.hitPenalty;
            const didHit = toHitRoll >= defenderScore;

            attackerStamina = Math.max(0, attackerStamina - (didHit ? 2.0 : 3.0));

            if (didHit) {
                const isCritical = Math.random() <= 0.15;
                let damage = (attackerScore || 1) * (0.75 + (Math.random() * 0.5)) * attackerMods.damageMultiplier;
                if (isCritical) damage *= 2;
                
                defenderHealth -= damage;
                defenderStamina = Math.max(0, defenderStamina - (damage / 10));

                log.push(`${attacker.name} lands a hit for ${damage.toFixed(1)} damage!`);
            } else {
                log.push(`${attacker.name} misses!`);
            }

            if (isF1Turn) {
                health1 = attackerHealth;
                health2 = defenderHealth;
                stamina1 = attackerStamina;
                stamina2 = defenderStamina;
            } else {
                health1 = defenderHealth;
                health2 = attackerHealth;
                stamina1 = defenderStamina;
                stamina2 = attackerStamina;
            }
            
            updateState({ health1: Math.max(0, health1), health2: Math.max(0, health2), stamina1, stamina2, log, round, turn, winner });
            
            if (health1 <= 0 || health2 <= 0) {
                winner = health1 <= 0 ? fighter2.name : fighter1.name;
                log.push(`--- FIGHT OVER! ---`);
                log.push(`${winner} wins by knockout!`);
                updateState({ health1: Math.max(0, health1), health2: Math.max(0, health2), stamina1, stamina2, log, round, turn, winner });
                return;
            }
            
            await delay(300);
        }
    }
    
    winner = health1 > health2 ? fighter1.name : (health2 > health1 ? fighter2.name : "Draw");
    log.push(`--- FINAL BELL! ---`);
    log.push(`The winner is ${winner}!`);
    updateState({ health1, health2, stamina1, stamina2, log, round: maxRounds, turn: 20, winner });
}

