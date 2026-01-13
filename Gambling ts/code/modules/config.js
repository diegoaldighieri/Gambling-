// ===== CONFIGURAZIONE E COSTANTI =====

// Livelli di gioco
export const levels = {
    1: { name: 'Principiante', icon: '🎮', multiplier: 1.0, minGames: 0, color: '#9ca3af' },
    2: { name: 'Intermedio', icon: '🎯', multiplier: 1.05, minGames: 10, color: '#60a5fa' },
    3: { name: 'Esperto', icon: '⭐', multiplier: 1.10, minGames: 50, color: '#a78bfa' },
    4: { name: 'Maestro', icon: '👑', multiplier: 1.15, minGames: 100, color: '#fbbf24' },
    5: { name: 'Leggenda', icon: '💎', multiplier: 1.20, minGames: 250, color: '#ffc400' }
};

// Obiettivi (achievements)
export const achievements = [
    {
        id: 'prima_vittoria',
        name: 'Prima Vittoria',
        icon: '🏆',
        description: 'Vinci la tua prima partita',
        check: (stats) => stats.partiteVinte >= 1
    },
    {
        id: 'combo_5',
        name: 'Combo 5x',
        icon: '🔥',
        description: 'Trova 5 diamanti di fila in una partita',
        check: (trovati, inGioco) => trovati >= 5 && inGioco
    },
    {
        id: 'vincita_1000',
        name: 'Jackpot 1000+',
        icon: '💰',
        description: 'Vinci 1000 o più in una singola partita',
        check: (stats) => stats.vincitaMassima >= 1000
    },
    {
        id: 'griglia_completa',
        name: 'Perfezionista',
        icon: '💎',
        description: 'Completa una griglia 5×5 senza errori',
        check: (trovati, versione, numBombe, inGioco) => versione === 3 && trovati === (25 - numBombe) && inGioco
    },
    {
        id: 'rischio_estremo',
        name: 'Temerario',
        icon: '⚡',
        description: 'Vinci una partita con 10+ bombe',
        check: (numBombe, inGioco) => numBombe >= 10 && !inGioco
    },
    {
        id: 'serie_10',
        name: 'Invincibile',
        icon: '🛡️',
        description: 'Vinci 10 partite consecutive',
        check: (streak) => streak >= 10
    },
    {
        id: 'partite_50',
        name: 'Veterano',
        icon: '🎖️',
        description: 'Gioca 50 partite',
        check: (stats) => stats.partiteGiocate >= 50
    },
    {
        id: 'partite_100',
        name: 'Esperto Certificato',
        icon: '⭐',
        description: 'Gioca 100 partite',
        check: (stats) => stats.partiteGiocate >= 100
    },
    {
        id: 'profitto_5000',
        name: 'Imprenditore',
        icon: '📈',
        description: 'Ottieni un profitto netto di 5000+',
        check: (stats) => (stats.totaleVinto - stats.totaleScommesso) >= 5000
    },
    {
        id: 'cashout_veloce',
        name: 'Giocatore Prudente',
        icon: '🎯',
        description: 'Ritira la vincita dopo aver trovato solo 1 diamante',
        check: (trovati, inGioco) => trovati === 1 && !inGioco
    }
];

// Tabelle moltiplicatori
export const moltiplicatoriTabelle = {
    "9_1": [1.10, 1.23, 1.38, 1.57, 1.80, 2.12, 2.51, 3.02],
    "9_2": [1.23, 1.57, 2.12, 3.02, 4.50, 7.20, 11.70],
    "9_3": [1.38, 2.12, 3.66, 7.20, 14.40, 31.50],
    "9_4": [1.57, 3.02, 7.20, 18.00, 49.50],
    "9_5": [1.80, 4.50, 14.40, 49.50],
    "9_6": [2.12, 7.20, 31.50],
    "16_1": [1.06, 1.11, 1.18, 1.25, 1.33, 1.42, 1.51, 1.62, 1.74, 1.87, 2.02, 2.20, 2.42, 2.67, 2.96],
    "16_2": [1.11, 1.25, 1.42, 1.62, 1.87, 2.20, 2.67, 3.30, 4.12, 5.28, 6.92, 9.42, 13.20],
    "16_3": [1.18, 1.42, 1.74, 2.20, 2.96, 4.12, 5.97, 9.13, 14.84, 25.74, 49.50, 112.64],
    "16_4": [1.25, 1.62, 2.20, 3.30, 5.28, 9.13, 17.32, 36.30, 88.00, 264.00],
    "16_5": [1.33, 1.87, 2.96, 5.28, 10.56, 24.24, 64.36, 214.50],
    "16_6": [1.42, 2.20, 4.12, 9.13, 24.24, 79.20, 346.50],
    "16_7": [1.51, 2.67, 5.97, 17.32, 64.36, 346.50],
    "16_8": [1.62, 3.30, 9.13, 36.30, 214.50],
    "16_9": [1.74, 4.12, 14.84, 88.00],
    "16_10": [1.87, 5.28, 25.74, 264.00],
    "16_11": [2.02, 6.92, 49.50],
    "16_12": [2.20, 9.42, 112.64],
    "25_1": [1.03, 1.07, 1.10, 1.14, 1.18, 1.22, 1.27, 1.32, 1.37, 1.42, 1.48, 1.54, 1.61, 1.68, 1.76, 1.84, 1.94, 2.03, 2.14, 2.26, 2.40, 2.54, 2.71, 2.90],
    "25_2": [1.07, 1.14, 1.22, 1.32, 1.42, 1.54, 1.68, 1.84, 2.03, 2.26, 2.54, 2.90, 3.36, 4.12, 4.97, 6.13, 7.73, 10.06, 13.66, 19.48, 30.26, 52.51],
    "25_3": [1.10, 1.22, 1.38, 1.57, 1.80, 2.12, 2.51, 3.02, 3.66, 4.50, 5.59, 7.05, 9.04, 11.81, 15.85, 21.94, 31.63, 48.10, 78.47, 140.63, 295.31],
    "25_4": [1.14, 1.32, 1.54, 1.84, 2.26, 2.90, 4.12, 6.13, 10.06, 19.48, 48.10, 140.63, 590.63],
    "25_5": [1.18, 1.42, 1.76, 2.26, 3.13, 4.54, 7.04, 11.79, 21.44, 44.00, 103.13, 288.81, 963.00],
    "25_10": [1.48, 2.54, 5.59, 13.75, 41.27, 151.36, 743.00, 5280.00],
    "25_15": [1.94, 6.13, 30.26, 288.81, 8800.00],
    "25_20": [2.90, 19.48, 577.50, 88000.00],
};

// Temi disponibili
export const themes = {
    default: {
        primary: '#ffc400',
        primaryHover: '#ffae00',
        secondary: '#00cc66',
        background: '#0b0f1a',
        cardBg: '#111627',
        cellBg: '#1a2030',
        text: '#ffffff',
        textDark: '#000000'
    },
    dark: {
        primary: '#60a5fa',
        primaryHover: '#3b82f6',
        secondary: '#a78bfa',
        background: '#000000',
        cardBg: '#1a1a1a',
        cellBg: '#2a2a2a',
        text: '#f9fafb',
        textDark: '#000000'
    },
    neon: {
        primary: '#ec4899',
        primaryHover: '#db2777',
        secondary: '#06b6d4',
        background: '#0f172a',
        cardBg: '#1e293b',
        cellBg: '#334155',
        text: '#f0abfc',
        textDark: '#0f172a'
    },
    forest: {
        primary: '#10b981',
        primaryHover: '#059669',
        secondary: '#34d399',
        background: '#064e3b',
        cardBg: '#065f46',
        cellBg: '#047857',
        text: '#d1fae5',
        textDark: '#064e3b'
    },
    sunset: {
        primary: '#f59e0b',
        primaryHover: '#d97706',
        secondary: '#ef4444',
        background: '#7c2d12',
        cardBg: '#9a3412',
        cellBg: '#b45309',
        text: '#fef3c7',
        textDark: '#7c2d12'
    },
    ocean: {
        primary: '#0ea5e9',
        primaryHover: '#0284c7',
        secondary: '#06b6d4',
        background: '#0c4a6e',
        cardBg: '#075985',
        cellBg: '#0369a1',
        text: '#e0f2fe',
        textDark: '#0c4a6e'
    },
    cyberpunk: {
        primary: '#ff00ff',
        primaryHover: '#cc00cc',
        secondary: '#00ffff',
        background: '#0a0a0a',
        cardBg: '#1a0a1f',
        cellBg: '#2d1b3d',
        text: '#00ffff',
        textDark: '#0a0a0a'
    },
    lava: {
        primary: '#ff4500',
        primaryHover: '#ff6347',
        secondary: '#ff8c00',
        background: '#1a0000',
        cardBg: '#330000',
        cellBg: '#4d0000',
        text: '#ffcc99',
        textDark: '#1a0000'
    },
    arctic: {
        primary: '#00d4ff',
        primaryHover: '#00bfea',
        secondary: '#b3e5fc',
        background: '#0a1929',
        cardBg: '#1e3a52',
        cellBg: '#2d4f6b',
        text: '#e1f5fe',
        textDark: '#0a1929'
    },
    goldRush: {
        primary: '#ffd700',
        primaryHover: '#ffed4e',
        secondary: '#ffb347',
        background: '#000000',
        cardBg: '#1a1410',
        cellBg: '#2d2416',
        text: '#fff8dc',
        textDark: '#000000'
    },
    purpleHaze: {
        primary: '#9c27b0',
        primaryHover: '#ba68c8',
        secondary: '#e91e63',
        background: '#1a0033',
        cardBg: '#2d0052',
        cellBg: '#3d006b',
        text: '#f3e5f5',
        textDark: '#1a0033'
    },
    matrix: {
        primary: '#00ff00',
        primaryHover: '#00cc00',
        secondary: '#39ff14',
        background: '#000000',
        cardBg: '#001a00',
        cellBg: '#003300',
        text: '#00ff00',
        textDark: '#000000'
    }
};

// Immagini per temi
export const themeImages = {
    'default': 'images/gray-square.png',
    'dark': 'images/scuro-square.png',
    'neon': 'images/neon-square.png',
    'forest': 'images/forest-square.png',
    'sunset': 'images/tramonto-square.png',
    'ocean': 'images/oceano-square.png',
    'lava': 'images/lava-square.png',
    'cyberpunk': 'images/cyberpunk-square.png',
    'arctic': 'images/arctic-square.png',
    'goldRush': 'images/gold-square.png',
    'matrix': 'images/matrix-square.png',
    'purpleHaze': 'images/purple-haze-square.png',
};
