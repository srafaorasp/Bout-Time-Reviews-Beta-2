import '../css/style.css';
import '../css/components.css';
import '../css/animations.css';
import { initializeApp, attachEventListeners } from './state.js';
import { initAudio } from './sound.js';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app state and attach event listeners now that the DOM is ready.
    initializeApp();
    attachEventListeners();

    // Initialize audio context on the first user interaction to comply with browser policies.
    const initAudioOnce = () => {
        initAudio();
        // Remove the listeners after the first interaction.
        document.body.removeEventListener('click', initAudioOnce);
        document.body.removeEventListener('keydown', initAudioOnce);
    };
    document.body.addEventListener('click', initAudioOnce, { once: true });
    document.body.addEventListener('keydown', initAudioOnce, { once: true });
});
