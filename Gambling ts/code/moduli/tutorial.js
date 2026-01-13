// ===== GESTIONE TUTORIAL =====

import { playSound, showNotification } from './audio.js';
import { setTutorialCompleted } from './storage.js';

let currentTutorialStep = 0;

export function setupTutorial() {
    const tutorialButton = document.getElementById('tutorialButton');
    const tutorialModal = document.getElementById('tutorialModal');
    const closeTutorialBtn = document.getElementById('closeTutorial');
    const nextTutorialBtn = document.getElementById('nextTutorialStep');
    const skipTutorialBtn = document.getElementById('skipTutorial');

    tutorialButton?.addEventListener('click', () => {
        playSound('click');
        tutorialModal.style.display = 'flex';
        currentTutorialStep = 0;
        showTutorialStep(0);
    });

    closeTutorialBtn?.addEventListener('click', () => {
        playSound('click');
        tutorialModal.style.display = 'none';
    });

    skipTutorialBtn?.addEventListener('click', () => {
        playSound('click');
        tutorialModal.style.display = 'none';
        setTutorialCompleted(true);
    });

    nextTutorialBtn?.addEventListener('click', () => {
        playSound('click');
        const steps = document.querySelectorAll('.tutorial-step');
        currentTutorialStep++;

        if (currentTutorialStep >= steps.length) {
            tutorialModal.style.display = 'none';
            setTutorialCompleted(true);
            showNotification('✅ Tutorial completato!', 'success');
        } else {
            showTutorialStep(currentTutorialStep);
        }
    });

    tutorialModal?.addEventListener('click', (e) => {
        if (e.target === tutorialModal) {
            tutorialModal.style.display = 'none';
        }
    });
}

export function showTutorialStep(index) {
    const steps = document.querySelectorAll('.tutorial-step');
    steps.forEach((step, i) => {
        step.classList.toggle('active', i === index);
    });

    const nextBtn = document.getElementById('nextTutorialStep');
    if (nextBtn) {
        if (index === steps.length - 1) {
            nextBtn.textContent = 'Fine';
        } else {
            nextBtn.textContent = 'Avanti';
        }
    }
}
