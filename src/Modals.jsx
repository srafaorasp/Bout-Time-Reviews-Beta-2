import React, { useState, useEffect } from 'react';

const ModalWrapper = ({ children, title, onClose, visible, borderColor = 'border-amber-400', size = 'max-w-lg' }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-[100] p-4">
            <div className={`bg-gray-800 p-6 rounded-2xl w-full ${size} shadow-2xl border-2 ${borderColor}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-amber-400">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

export const UniverseSetupModal = ({ visible, onClose }) => (
    <ModalWrapper title="Create Your Universe" onClose={onClose} visible={visible}>
        <div className="text-center">
            <p className="text-gray-300 mb-2">Start by populating your universe. Add Steam App IDs one by one, or paste a comma-separated list below.</p>
            <p className="text-gray-400 text-sm mb-4">You need at least 6 fighters to create a universe.</p>
            <div className="flex gap-2 mb-2">
                <input type="text" id="single-steam-id-input" className="form-input w-full bg-gray-900 border-gray-600 rounded-md py-2 px-3 text-white" placeholder="Add one Steam App ID" />
                <button id="add-single-steam-id-btn" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Add</button>
            </div>
            <textarea id="steam-ids-input" rows="3" className="form-input w-full bg-gray-900 border-gray-600 rounded-md py-2 px-3 text-white mb-2" placeholder="e.g., 730, 570, 271590, 1091500, 1086940, 1174180"></textarea>
            <div className="flex justify-center gap-4 flex-wrap">
                 <button id="start-universe-btn" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg">Create Universe</button>
            </div>
        </div>
    </ModalWrapper>
);

export const HelpModal = ({ visible, onClose }) => (
     <ModalWrapper title="Quick Start Guide" onClose={onClose} visible={visible}>
         <div className="space-y-4 overflow-y-auto text-gray-300 pr-2 max-h-[60vh]">
            <h4 className="font-semibold text-lg text-white">Getting Started</h4>
            <p>Welcome to Bout Time Reviews! This tool lets you pit any two things against each other in a simulated fight based on review scores.</p>
            <h4 className="font-semibold text-lg text-white">1. Creating a Fighter</h4>
            <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Select from Universe:</strong> Use the dropdown on either fighter card to select a fighter you've already added to your universe.</li>
                <li><strong>Fetch by ID:</strong> Enter a valid Steam App ID into the "Steam App ID" field and click "Fetch." This will pull the game's data and add the fighter to your universe.</li>
            </ul>
            <h4 className="font-semibold text-lg text-white">2. The Fight!</h4>
            <p>Once your fighters are ready, click the "Fight!" button to start the simulation and see who comes out on top!</p>
        </div>
         <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Got It!</button>
        </div>
     </ModalWrapper>
);

export const FightModal = ({ visible, onClose, fighter1, fighter2, fightState }) => {
    if (!visible || !fightState) return null;
    const { health1, health2, stamina1, stamina2, log, round, turn, winner } = fightState;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-4xl relative">
                <div className="text-center mb-2"><p className="text-xl font-bold text-amber-300">{winner ? 'Fight Over!' : `Round ${round}/${6}`}</p><p className="text-sm text-gray-400">{!winner && `Turn: ${turn}/20`}</p></div>
                <div className="flex justify-between items-start mb-4 relative">
                    <div className="text-center w-2/5"><p className="font-bold text-blue-400 truncate">{fighter1.name}</p><div className="w-full bg-gray-600 rounded-full h-4 mt-1"><div className="bg-red-500 h-4 rounded-full" style={{ width: `${health1}%` }}></div></div><p className="text-xs">{health1.toFixed(1)} / 100 Health</p><div className="w-full bg-gray-600 rounded-full h-2 mt-1"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${stamina1}%` }}></div></div><p className="text-xs">Stamina: {stamina1.toFixed(1)}%</p></div>
                    <div className="text-center w-2/5"><p className="font-bold text-purple-400 truncate">{fighter2.name}</p><div className="w-full bg-gray-600 rounded-full h-4 mt-1"><div className="bg-red-500 h-4 rounded-full" style={{ width: `${health2}%` }}></div></div><p className="text-xs">{health2.toFixed(1)} / 100 Health</p><div className="w-full bg-gray-600 rounded-full h-2 mt-1"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${stamina2}%` }}></div></div><p className="text-xs">Stamina: {stamina2.toFixed(1)}%</p></div>
                </div>
                <div className="text-center h-40 overflow-y-auto bg-gray-900 rounded-lg p-2 text-sm" ref={el => el && (el.scrollTop = el.scrollHeight)}>{log.map((entry, index) => <p key={index}>{entry}</p>)}</div>
                {winner && (<button onClick={onClose} className="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg w-full">Return to Main Screen</button>)}
            </div>
        </div>
    );
};

export const RosterModal = ({ visible, onClose, roster, universeFighters, onFighterClick, onAddFighter }) => {
    const [newFighterId, setNewFighterId] = useState('');

    const handleAddClick = () => {
        if (newFighterId.trim()) {
            onAddFighter(newFighterId.trim());
            setNewFighterId('');
        }
    };
    
    return (
        <ModalWrapper title="Roster Management" onClose={onClose} visible={visible} size="max-w-4xl" borderColor="border-blue-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm max-h-[70vh] overflow-y-auto">
                <div className="bg-gray-900 p-3 rounded-lg">
                    <h4 className="font-semibold text-center mb-2 text-amber-400">Champions</h4>
                    {roster.major && Object.entries(roster.major).map(([key, title]) => (
                        <div key={key} className="flex items-center justify-between bg-gray-800 p-1 rounded mb-1">
                            <span className="font-semibold">{title.symbol} {key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                            <span className="truncate" title={title.name}>{title.name}</span>
                        </div>
                    ))}
                </div>
                <div className="bg-gray-900 p-3 rounded-lg">
                    <h4 className="font-semibold text-center mb-2 text-amber-400">Universe Fighters</h4>
                    <div className="space-y-1">
                        {universeFighters.sort((a,b) => a.name.localeCompare(b.name)).map(fighter => (
                             <div key={fighter.appId} onClick={() => onFighterClick(fighter)} className="universe-fighter-entry cursor-pointer hover:bg-gray-700 p-1 rounded" >
                                {fighter.name}
                            </div>
                        ))}
                    </div>
                     <div className="mt-4 border-t border-gray-700 pt-3">
                        <h4 className="font-semibold text-center mb-2">Add New Fighter</h4>
                        <div className="flex items-center gap-2">
                            <input type="text" value={newFighterId} onChange={(e) => setNewFighterId(e.target.value)} placeholder="Enter Steam App ID to Add" className="form-input w-full bg-gray-800 border-gray-600 rounded-md py-1 px-2 text-white" />
                            <button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg whitespace-nowrap">Add</button>
                        </div>
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
};

export const FighterInfoModal = ({ visible, onClose, fighter, onSaveChanges }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableFighter, setEditableFighter] = useState(null);

    useEffect(() => {
        if (fighter) {
            setEditableFighter(JSON.parse(JSON.stringify(fighter))); // Deep copy for editing
        }
    }, [fighter]);
    
    if (!visible || !editableFighter) return null;

    const handleInputChange = (e, field) => {
        const { value } = e.target;
        setEditableFighter(prev => ({
            ...prev,
            record: { ...prev.record, [field]: parseInt(value, 10) || 0 }
        }));
    };
    
    const handleSave = () => {
        onSaveChanges(editableFighter);
        setIsEditing(false);
    };

    return (
        <ModalWrapper title={editableFighter.name} onClose={onClose} visible={visible} borderColor="border-green-500">
            <div className="space-y-3 text-gray-300">
                {!isEditing ? (
                    <div className="space-y-2">
                        <p><strong>Record:</strong> {`${editableFighter.record.tko}-${editableFighter.record.ko}-${editableFighter.record.losses}`}</p>
                        <p><strong>Developer:</strong> {editableFighter.devHouse || 'N/A'}</p>
                        <p><strong>Publisher:</strong> {editableFighter.publisher || 'N/A'}</p>
                    </div>
                ) : (
                    <div className="space-y-3 bg-gray-900 p-3 rounded-lg">
                        <div>
                            <label className="block font-medium">TKO Wins</label>
                            <input type="number" value={editableFighter.record.tko} onChange={(e) => handleInputChange(e, 'tko')} className="form-input mt-1 w-full text-center bg-gray-700 border-gray-600 rounded-md py-1 px-1 text-white" />
                        </div>
                        <div>
                            <label className="block font-medium">KO Wins</label>
                            <input type="number" value={editableFighter.record.ko} onChange={(e) => handleInputChange(e, 'ko')} className="form-input mt-1 w-full text-center bg-gray-700 border-gray-600 rounded-md py-1 px-1 text-white" />
                        </div>
                        <div>
                            <label className="block font-medium">Losses</label>
                            <input type="number" value={editableFighter.record.losses} onChange={(e) => handleInputChange(e, 'losses')} className="form-input mt-1 w-full text-center bg-gray-700 border-gray-600 rounded-md py-1 px-1 text-white" />
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Edit Record</button>
                ) : (
                    <>
                        <button onClick={() => setIsEditing(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Save Changes</button>
                    </>
                )}
            </div>
        </ModalWrapper>
    );
};

