// ===== GESTIONE TEMI =====

import { themes, themeImages } from './config.js';
import { salvaTema } from './storage.js';
import { playSound } from './audio.js';

let currentTheme = 'default';

// Ottieni l'immagine per un tema
export function getThemeImage(theme) {
    return themeImages[theme] || themeImages['default'];
}

// Applica un tema
export function applyTheme(themeName) {
    currentTheme = themeName;
    const theme = themes[themeName];
    
    document.documentElement.style.setProperty('--color-primary', theme.primary);
    document.documentElement.style.setProperty('--color-primary-hover', theme.primaryHover);
    document.documentElement.style.setProperty('--color-secondary', theme.secondary);
    document.documentElement.style.setProperty('--color-background', theme.background);
    document.documentElement.style.setProperty('--color-card-bg', theme.cardBg);
    document.documentElement.style.setProperty('--color-cell-bg', theme.cellBg);
    document.documentElement.style.setProperty('--color-text', theme.text);
    document.documentElement.style.setProperty('--color-text-dark', theme.textDark);

    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === themeName) {
            btn.classList.add('active');
        }
    });

    salvaTema(themeName);
}

// Aggiorna le immagini delle celle quando cambia il tema
export function updateCellThemes(celle, cliccata) {
    celle.forEach((cella, index) => {
        if (!cliccata[index]) {
            const img = cella.querySelector('img.cella-img');
            if (img) {
                img.src = getThemeImage(currentTheme);
            }
        }
    });
}

// Ottieni il tema corrente
export function getCurrentTheme() {
    return currentTheme;
}

// Setup event listeners per i temi
export function setupThemeListeners() {
    const themeButton = document.getElementById('theme-button');
    const themeMenu = document.getElementById('theme-menu');
    
    themeButton?.addEventListener('click', () => {
        playSound('click');
        themeMenu.classList.toggle('hidden');
    });

    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            applyTheme(btn.dataset.theme);
            themeMenu.classList.add('hidden');
        });
    });
}
