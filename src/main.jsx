import React, { useState, useEffect } from 'react';
import '../css/style.css';
import '../css/components.css';
import '../css/animations.css';

// --- Helper function to create a default fighter state ---
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

// --- UI Components ---

const Header = () => (
    <div className="text-center mb-8 relative">
        <div className="flex justify-center items-center gap-4">
             <h1 className="text-4xl font-extrabold text-white tracking-tight">Bout Time Reviews <span className="text-sm font-light text-purple-400">(React Edition)</span></h1>
        </div>
        <p className="text-gray-400 mt-2">Which one will be crowned the winner?</p>
    </div>
);

const FighterCard = ({ fighter, prefix }) => {
    // This is a controlled component, but for now, we'll just display data.
    // In Phase 3, we'll add onChange handlers and state updates.
    if (!fighter) {
        return <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-2 flex flex-col animate-pulse"></div>;
    }

    const fighterName = fighter.name || (prefix === 'item1' ? 'Fighter 1' : 'Fighter 2');
    const steamReviewDesc = fighter.steamData ? `${fighter.steamData.review_score_desc} (${(fighter.steamData.total_positive / fighter.steamData.total_reviews * 100).toFixed(1)}%)` : '';

    return (
        <div id={`${prefix}-card`} className="bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-2 transition-shadow duration-300 flex flex-col">
            <div>
                <div className="flex justify-center items-center gap-2">
                    <div id={`${prefix}-name`} className="text-2xl font-bold bg-gray-900 w-full p-2 rounded-lg text-center text-white truncate h-[48px] flex items-center justify-center">{fighterName}</div>
                    <span id={`${prefix}-symbol`} className="text-2xl w-8 text-center"></span>
                </div>
                <div className="flex justify-center items-baseline gap-4 mt-2">
                    <p className="text-center text-sm text-gray-400">Record: <span id={`${prefix}-record`}>{`${fighter.record.tko}-${fighter.record.ko}-${fighter.record.losses}`}</span></p>
                    <p id={`${prefix}-weight-class`} className="text-center text-sm font-semibold text-gray-300"></p>
                </div>
            </div>

            <div className="bg-gray-700/50 p-4 rounded-xl space-y-2 mt-2">
                <h3 className="text-lg font-semibold text-white text-center">Load Fighter</h3>
                 <select id={`${prefix}-universe-select`} className="form-select w-full bg-gray-900 border-gray-600 rounded-md py-2 px-3 text-white">
                    <option value="">Select from Universe</option>
                </select>
                <p className="text-center text-xs text-gray-400">- OR -</p>
                <div className="flex gap-2 items-center">
                    <input type="text" id={`${prefix}-steam-id`} placeholder="Enter Steam App ID" className="form-input w-full bg-gray-800 border-gray-600 rounded-md py-2 px-3 text-white" defaultValue={fighter.appId || ''} />
                    <button id={`${prefix}-fetch-steam-btn`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-32">Fetch</button>
                </div>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-xl space-y-3 mt-2">
                <h3 className="text-lg font-semibold text-white mb-2 text-center">Review Scores</h3>
                <div className="space-y-2 text-center">
                    <p className="text-sm font-medium text-gray-300">Steam Community Score</p>
                    <p id={`${prefix}-steam-score-display`} className="text-lg font-bold text-amber-400 h-6" dangerouslySetInnerHTML={{ __html: steamReviewDesc }}></p>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Metacritic</label>
                    <p id={`${prefix}-metacritic`} className="mt-1 w-full text-center bg-gray-800 border-gray-600 rounded-md py-2 px-1 text-white h-10 flex items-center justify-center">{fighter.scores.metacritic}</p>
                </div>
            </div>

            <div className="bg-gray-700/50 p-4 rounded-xl mt-2 flex-grow space-y-2">
                <h3 className="text-lg font-semibold text-white text-center">Origins</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Dev House</label>
                    <p id={`${prefix}-dev-house`} className="mt-1 w-full text-center bg-gray-800 border-gray-600 rounded-md py-2 px-1 text-white truncate h-10 flex items-center justify-center">{fighter.devHouse}</p>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Publisher</label>
                    <p id={`${prefix}-publisher`} className="mt-1 w-full text-center bg-gray-800 border-gray-600 rounded-md py-2 px-1 text-white truncate h-10 flex items-center justify-center">{fighter.publisher}</p>
                </div>
            </div>
        </div>
    );
};

const CenterPanel = ({ fighter1, fighter2 }) => (
    <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 flex flex-col items-center justify-center space-y-4 order-first lg:order-none">
        <div id="champions-hall" className="bg-gray-900 w-full p-3 rounded-lg text-center relative mt-4">
            <h3 className="text-lg font-bold text-amber-400 underline decoration-wavy">Hall of Champions</h3>
        </div>
        <div className="flex items-center justify-around w-full">
            <div className="text-center">
                <p className="text-gray-400 text-sm truncate">{fighter1?.name || 'Fighter 1'}</p>
                <p id="item1-final-score" className="text-5xl font-bold text-blue-400 transition-colors duration-300">-.--</p>
            </div>
            <p className="text-5xl font-black text-gray-600">VS</p>
            <div className="text-center">
                 <p className="text-gray-400 text-sm truncate">{fighter2?.name || 'Fighter 2'}</p>
                <p id="item2-final-score" className="text-5xl font-bold text-purple-400 transition-colors duration-300">-.--</p>
            </div>
        </div>
        <div id="winner-box" className="text-center bg-gray-900 w-full p-4 rounded-lg min-h-[96px] flex flex-col justify-center">
            <h2 id="winner-title" className="text-2xl font-bold text-amber-300"></h2>
            <p id="winnerText" className="text-gray-300"></p>
        </div>
        <div className="w-full space-y-3">
            <button id="fight-btn" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg w-full transition duration-200">Fight!</button>
        </div>
    </div>
);


// --- Main App Component ---

function App() {
    const [fighter1, setFighter1] = useState(null);
    const [fighter2, setFighter2] = useState(null);
    const [universeFighters, setUniverseFighters] = useState([]);
    const [roster, setRoster] = useState({});

    // Effect for initializing the app state from localStorage
    useEffect(() => {
        console.log("Attempting to load data from localStorage...");
        try {
            const savedData = localStorage.getItem('boutTimeUniverseData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if (parsedData.universeFighters && parsedData.roster) {
                    setUniverseFighters(parsedData.universeFighters);
                    setRoster(parsedData.roster);
                    console.log("Universe loaded from previous session!");
                }
            } else {
                 console.log("No saved data found, initializing new universe.");
            }
        } catch (e) {
            console.error("Failed to load or parse universe from local storage:", e);
        }
        
        // Always ensure fighters are initialized
        setFighter1(createNewFighter());
        setFighter2(createNewFighter());
    }, []); // Empty dependency array means this runs only once on mount

    return (
        <div className="bg-gray-900 text-white min-h-screen p-4 sm:p-6 w-full">
            <div className="w-full max-w-7xl mx-auto">
                <Header />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <FighterCard fighter={fighter1} prefix="item1" />
                    <CenterPanel fighter1={fighter1} fighter2={fighter2} />
                    <FighterCard fighter={fighter2} prefix="item2" />
                </div>
            </div>
            {/* Modals will be added here in Phase 4 */}
        </div>
    );
}

export default App;

