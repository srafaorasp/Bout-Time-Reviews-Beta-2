import React from 'react';

// A generic, reusable modal component wrapper to keep styling consistent.
const ModalWrapper = ({ children, title, onClose, visible, borderColor = 'border-amber-400' }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-[100] p-4">
            <div className={`bg-gray-800 p-6 rounded-2xl w-full max-w-lg shadow-2xl border-2 ${borderColor}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-amber-400">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

// The modal for the initial universe setup.
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

// The modal for showing the quick start guide.
export const HelpModal = ({ visible, onClose }) => (
     <ModalWrapper title="Quick Start Guide" onClose={onClose} visible={visible}>
         <div className="space-y-4 overflow-y-auto text-gray-300 pr-2 max-h-[60vh]">
            <h4 className="font-semibold text-lg text-white">Getting Started</h4>
            <p>Welcome to Bout Time Reviews! This tool lets you pit any two things against each other in a simulated fight based on review scores.</p>
            
            <h4 className="font-semibold text-lg text-white">1. Creating a Fighter</h4>
            <p>All fighters are created by fetching data from Steam. You have two ways to load one:</p>
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

