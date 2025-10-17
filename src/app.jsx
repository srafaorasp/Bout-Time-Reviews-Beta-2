import React, { useState, useEffect } from 'react';
import { fetchSteamData } from './api.js';
import { calculateRawScore, applyBonuses, runFightSimulation } from './fightLogic.js';
import { UniverseSetupModal, HelpModal, FightModal, RosterModal, FighterInfoModal } from './Modals.jsx';

const createNewFighter = () => ({
    name: '', devHouse: '', publisher: '',
    record: { tko: 0, ko: 0, losses: 0, pastTitles: {} },
    scores: { metacritic: '' },
    steamData: null,
    genres: [],
    appId: null,
    isHallOfFamer: false,
    isRetired: false,
    lastModified: new Date().toISOString()
});

const Header = ({ onHelpClick, onRosterClick }) => (
    <div className="text-center mb-8 relative">
        <div className="flex justify-center items-center gap-4">
             <h1 className="text-4xl font-extrabold text-white tracking-tight">Bout Time Reviews <span className="text-sm font-light text-purple-400">(React Edition)</span></h1>
        </div>
        <p className="text-gray-400 mt-2">Which one will be crowned the winner?</p>
        <div className="absolute top-0 right-0 flex items-center">
            <button onClick={onRosterClick} className="p-2 text-gray-400 hover:text-white" title="Roster Management">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
            </button>
             <button onClick={onHelpClick} className="p-2 text-gray-400 hover:text-white" title="Quick Start Guide">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
        </div>
    </div>
);

const FighterCard = ({ fighter, prefix, handleFetch, setFighter, universeFighters, onFighterInfoClick }) => {
    const [steamIdInput, setSteamIdInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { setSteamIdInput(fighter?.appId || ''); }, [fighter]);

    const onFetchClick = async () => { setIsLoading(true); await handleFetch(prefix, steamIdInput); setIsLoading(false); };
    const handleSelectChange = (e) => {
        const selectedFighter = universeFighters.find(f => f.appId === e.target.value);
        setFighter(selectedFighter || createNewFighter());
    };

    if (!fighter) return <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-2 flex flex-col animate-pulse min-h-[600px]"></div>;

    const fighterName = fighter.name || (prefix === 'item1' ? 'Fighter 1' : 'Fighter 2');
    const steamReviewDesc = fighter.steamData ? `${fighter.steamData.review_score_desc} (${(fighter.steamData.total_positive / fighter.steamData.total_reviews * 100).toFixed(1)}%)` : '';

    return (
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-2 transition-shadow duration-300 flex flex-col">
            <div>
                <div className="flex justify-center items-center gap-2">
                    <div className="text-2xl font-bold bg-gray-900 w-full p-2 rounded-lg text-center text-white truncate h-[48px] flex items-center justify-center">{fighterName}</div>
                    <span className="text-2xl w-8 text-center"></span>
                </div>
                <div className="flex justify-center items-baseline gap-4 mt-2"><p className="text-center text-sm text-gray-400">Record: <span>{`${fighter.record.tko}-${fighter.record.ko}-${fighter.record.losses}`}</span></p><p className="text-center text-sm font-semibold text-gray-300"></p></div>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-xl space-y-2 mt-2">
                <h3 className="text-lg font-semibold text-white text-center">Load Fighter</h3>
                 <select value={fighter.appId || ''} onChange={handleSelectChange} className="form-select w-full bg-gray-900 border-gray-600 rounded-md py-2 px-3 text-white">
                    <option value="">Select from Universe</option>
                    {universeFighters.map(f => <option key={f.appId} value={f.appId}>{f.name}</option>)}
                </select>
                <p className="text-center text-xs text-gray-400">- OR -</p>
                <div className="flex gap-2 items-center">
                    <input type="text" value={steamIdInput} onChange={(e) => setSteamIdInput(e.target.value)} placeholder="Enter Steam App ID" className="form-input w-full bg-gray-800 border-gray-600 rounded-md py-2 px-3 text-white" />
                    <button onClick={onFetchClick} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-32 disabled:bg-gray-500">{isLoading ? '...' : 'Fetch'}</button>
                </div>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-xl space-y-3 mt-2">
                <h3 className="text-lg font-semibold text-white mb-2 text-center">Review Scores</h3>
                <div className="space-y-2 text-center"><p className="text-sm font-medium text-gray-300">Steam Community Score</p><p className="text-lg font-bold text-amber-400 h-6" dangerouslySetInnerHTML={{ __html: steamReviewDesc }}></p></div>
                 <div><label className="block text-sm font-medium text-gray-300">Metacritic</label><p className="mt-1 w-full text-center bg-gray-800 border-gray-600 rounded-md py-2 px-1 text-white h-10 flex items-center justify-center">{fighter.scores.metacritic}</p></div>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-xl mt-2 flex-grow space-y-2">
                <h3 className="text-lg font-semibold text-white text-center">Origins</h3>
                <div><label className="block text-sm font-medium text-gray-300">Dev House</label><p className="mt-1 w-full text-center bg-gray-800 border-gray-600 rounded-md py-2 px-1 text-white truncate h-10 flex items-center justify-center">{fighter.devHouse}</p></div>
                 <div><label className="block text-sm font-medium text-gray-300">Publisher</label><p className="mt-1 w-full text-center bg-gray-800 border-gray-600 rounded-md py-2 px-1 text-white truncate h-10 flex items-center justify-center">{fighter.publisher}</p></div>
            </div>
             <div className="mt-auto pt-4">
                <button onClick={() => onFighterInfoClick(fighter)} disabled={!fighter.appId} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-xs w-full disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed">Fighter Data</button>
            </div>
        </div>
    );
};

const CenterPanel = ({ fighter1, fighter2, finalScores, onFightClick }) => (
    <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 flex flex-col items-center justify-center space-y-4 order-first lg:order-none">
        <div id="champions-hall" className="bg-gray-900 w-full p-3 rounded-lg text-center relative mt-4"><h3 className="text-lg font-bold text-amber-400 underline decoration-wavy">Hall of Champions</h3></div>
        <div className="flex items-center justify-around w-full">
            <div className="text-center"><p className="text-gray-400 text-sm truncate">{fighter1?.name || 'Fighter 1'}</p><p className="text-5xl font-bold text-blue-400 transition-colors duration-300">{finalScores.score1 > 0 ? finalScores.score1.toFixed(2) : '-.--'}</p></div>
            <p className="text-5xl font-black text-gray-600">VS</p>
            <div className="text-center"><p className="text-gray-400 text-sm truncate">{fighter2?.name || 'Fighter 2'}</p><p className="text-5xl font-bold text-purple-400 transition-colors duration-300">{finalScores.score2 > 0 ? finalScores.score2.toFixed(2) : '-.--'}</p></div>
        </div>
        <div id="winner-box" className="text-center bg-gray-900 w-full p-4 rounded-lg min-h-[96px] flex flex-col justify-center"><h2 id="winner-title" className="text-2xl font-bold text-amber-300"></h2><p id="winnerText" className="text-gray-300"></p></div>
        <div className="w-full space-y-3"><button onClick={onFightClick} className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg w-full transition duration-200 disabled:bg-gray-500" disabled={!fighter1?.appId || !fighter2?.appId}>Fight!</button></div>
    </div>
);

function App() {
    const [fighter1, setFighter1] = useState(null);
    const [fighter2, setFighter2] = useState(null);
    const [universeFighters, setUniverseFighters] = useState([]);
    const [roster, setRoster] = useState({});
    const [finalScores, setFinalScores] = useState({ score1: 0, score2: 0 });
    
    const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
    const [isUniverseSetupVisible, setIsUniverseSetupVisible] = useState(false);
    const [isFightModalVisible, setIsFightModalVisible] = useState(false);
    const [isRosterModalVisible, setIsRosterModalVisible] = useState(false);
    const [isFighterInfoModalVisible, setIsFighterInfoModalVisible] = useState(false);
    
    const [selectedFighter, setSelectedFighter] = useState(null);
    const [fightState, setFightState] = useState(null);

    useEffect(() => {
        let isLoaded = false;
        try {
            const savedData = localStorage.getItem('boutTimeUniverseData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if (parsedData.universeFighters && parsedData.roster) {
                    setUniverseFighters(parsedData.universeFighters);
                    setRoster(parsedData.roster); isLoaded = true;
                }
            }
        } catch (e) { console.error("Failed to load universe:", e); }
        if (!isLoaded) { setIsUniverseSetupVisible(true); }
        setFighter1(createNewFighter()); setFighter2(createNewFighter());
    }, []);

    useEffect(() => {
        if (fighter1 && fighter2 && roster) {
            const rawScore1 = calculateRawScore(fighter1); const finalScore1 = applyBonuses(rawScore1, fighter1, roster);
            const rawScore2 = calculateRawScore(fighter2); const finalScore2 = applyBonuses(rawScore2, fighter2, roster);
            setFinalScores({ score1: finalScore1, score2: finalScore2 });
        }
    }, [fighter1, fighter2, roster]);

    const saveUniverse = (newUniverse, newRoster) => {
        localStorage.setItem('boutTimeUniverseData', JSON.stringify({ universeFighters: newUniverse, roster: newRoster }));
    };
    
    const handleFetch = async (prefix, appId) => {
        const newFighterData = await fetchSteamData(appId);
        if (newFighterData) {
            if (prefix === 'item1') setFighter1(newFighterData); else setFighter2(newFighterData);
            if (!universeFighters.some(f => f.appId === newFighterData.appId)) {
                const newUniverse = [...universeFighters, newFighterData];
                setUniverseFighters(newUniverse); saveUniverse(newUniverse, roster);
            }
        } else { alert(`Failed to fetch data for App ID: ${appId}`); }
    };

    const handleStartFight = () => {
        if (!fighter1?.appId || !fighter2?.appId) return;
        setFightState({ health1: 100, health2: 100, stamina1: 100, stamina2: 100, log: ["The fight is about to begin!"], round: 1, turn: 0, winner: null });
        setIsFightModalVisible(true);
        runFightSimulation(fighter1, fighter2, finalScores, (newState) => { setFightState(prevState => ({ ...prevState, ...newState })); });
    };

    const handleFighterInfoClick = (fighter) => { setSelectedFighter(fighter); setIsFighterInfoModalVisible(true); };
    const handleAddFighterToUniverse = async (appId) => {
        const newFighter = await fetchSteamData(appId);
        if (newFighter && !universeFighters.some(f => f.appId === appId)) {
            const newUniverse = [...universeFighters, newFighter];
            setUniverseFighters(newUniverse); saveUniverse(newUniverse, roster);
        }
    };
    const handleSaveChanges = (updatedFighter) => {
        const newUniverse = universeFighters.map(f => f.appId === updatedFighter.appId ? updatedFighter : f);
        setUniverseFighters(newUniverse);
        saveUniverse(newUniverse, roster);
        if(fighter1.appId === updatedFighter.appId) setFighter1(updatedFighter);
        if(fighter2.appId === updatedFighter.appId) setFighter2(updatedFighter);
        setIsFighterInfoModalVisible(false);
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen p-4 sm:p-6 w-full">
            <div className="w-full max-w-7xl mx-auto">
                <Header onHelpClick={() => setIsHelpModalVisible(true)} onRosterClick={() => setIsRosterModalVisible(true)} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <FighterCard fighter={fighter1} prefix="item1" handleFetch={handleFetch} setFighter={setFighter1} universeFighters={universeFighters} onFighterInfoClick={handleFighterInfoClick} />
                    <CenterPanel fighter1={fighter1} fighter2={fighter2} finalScores={finalScores} onFightClick={handleStartFight} />
                    <FighterCard fighter={fighter2} prefix="item2" handleFetch={handleFetch} setFighter={setFighter2} universeFighters={universeFighters} onFighterInfoClick={handleFighterInfoClick} />
                </div>
            </div>
            <UniverseSetupModal visible={isUniverseSetupVisible} onClose={() => setIsUniverseSetupVisible(false)} />
            <HelpModal visible={isHelpModalVisible} onClose={() => setIsHelpModalVisible(false)} />
            <FightModal visible={isFightModalVisible} onClose={() => setIsFightModalVisible(false)} fighter1={fighter1} fighter2={fighter2} fightState={fightState} />
            <RosterModal visible={isRosterModalVisible} onClose={() => setIsRosterModalVisible(false)} roster={roster} universeFighters={universeFighters} onFighterClick={handleFighterInfoClick} onAddFighter={handleAddFighterToUniverse} />
            <FighterInfoModal visible={isFighterInfoModalVisible} onClose={() => setIsFighterInfoModalVisible(false)} fighter={selectedFighter} onSaveChanges={handleSaveChanges} />
        </div>
    );
}

export default App;

