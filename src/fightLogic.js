// src/fightLogic.js

// --- CORE CALCULATION LOGIC ---
// Note: These functions are "pure" - they take state as arguments
// instead of relying on a global state object.

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
