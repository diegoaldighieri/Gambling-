// ===== SISTEMA SHOP E POWER-UPS =====

import { storage } from './storage.js';
import { getCaramelle, setCaramelle } from './balance.js';
import { showNotification, playSound } from './audio.js';

// Definizione items shop
const shopItems = {
    powerups: [
        {
            id: 'reveal_safe',
            nome: 'Rivela Cella Sicura',
            descrizione: 'Rivela automaticamente una cella sicura',
            icona: '🔍',
            prezzo: 50,
            tipo: 'consumabile',
            usa: (gameState) => {
                // Trova una cella sicura non cliccata
                const { celle, cliccata, bombe } = gameState;
                const celleSicure = [];
                
                celle.forEach((cella, i) => {
                    if (!cliccata[i] && !bombe.includes(i)) {
                        celleSicure.push(i);
                    }
                });

                if (celleSicure.length > 0) {
                    const randomIndex = Math.floor(Math.random() * celleSicure.length);
                    const cellaIndex = celleSicure[randomIndex];
                    
                    // Simula click sulla cella
                    celle[cellaIndex].click();
                    
                    showNotification('🔍 Cella sicura rivelata!', 'success');
                    return true;
                }
                
                showNotification('❌ Nessuna cella sicura disponibile!', 'error');
                return false;
            }
        },
        {
            id: 'bomb_protection',
            nome: 'Protezione Bomba',
            descrizione: 'Ti salva dalla prossima bomba (1 volta)',
            icona: '🛡️',
            prezzo: 100,
            tipo: 'consumabile',
            attivo: false
        },
        {
            id: 'double_win',
            nome: 'Raddoppia Vincita',
            descrizione: 'Raddoppia la vincita della prossima partita',
            icona: '💎',
            prezzo: 200,
            tipo: 'consumabile',
            attivo: false
        },
        {
            id: 'multiplier_boost',
            nome: 'Booster 1.5x',
            descrizione: 'Moltiplicatore +50% per 5 partite',
            icona: '⚡',
            prezzo: 150,
            tipo: 'temporaneo',
            durata: 5,
            bonus: 0.5
        },
        {
            id: 'xp_boost',
            nome: 'XP Doppia',
            descrizione: 'XP raddoppiata per 10 partite',
            icona: '📈',
            prezzo: 200,
            tipo: 'temporaneo',
            durata: 10,
            bonus: 1.0
        },
        {
            id: 'streak_protector',
            nome: 'Proteggi Serie',
            descrizione: 'Salva la serie di vittorie una volta',
            icona: '🔥',
            prezzo: 300,
            tipo: 'consumabile',
            attivo: false
        }
    ],
    temi: [
        {
            id: 'cosmic',
            nome: 'Cosmic Dream',
            descrizione: 'Tema spaziale con stelle',
            icona: '🌌',
            prezzo: 500,
            tipo: 'cosmetico',
            theme: {
                primary: '#8b5cf6',
                primaryHover: '#7c3aed',
                secondary: '#06b6d4',
                background: '#0f0a1f',
                cardBg: '#1a1233',
                cellBg: '#2d1b4e',
                text: '#e0e7ff',
                textDark: '#0f0a1f'
            }
        },
        {
            id: 'rainbow',
            nome: 'Rainbow Paradise',
            descrizione: 'Colori arcobaleno vibranti',
            icona: '🌈',
            prezzo: 750,
            tipo: 'cosmetico',
            theme: {
                primary: '#ff6b9d',
                primaryHover: '#ff4d88',
                secondary: '#ffd93d',
                background: '#1a0033',
                cardBg: '#2d0052',
                cellBg: '#4a007a',
                text: '#fff0f5',
                textDark: '#1a0033'
            }
        },
        {
            id: 'steampunk',
            nome: 'Steampunk Era',
            descrizione: 'Stile retrò industriale',
            icona: '⚙️',
            prezzo: 600,
            tipo: 'cosmetico',
            theme: {
                primary: '#cd7f32',
                primaryHover: '#b8860b',
                secondary: '#8b4513',
                background: '#1c1410',
                cardBg: '#2d1f1a',
                cellBg: '#3d2817',
                text: '#f5deb3',
                textDark: '#1c1410'
            }
        }
    ],
    animazioni: [
        {
            id: 'explosion_effect',
            nome: 'Esplosione Epica',
            descrizione: 'Animazione bomba migliorata',
            icona: '💥',
            prezzo: 400,
            tipo: 'cosmetico'
        },
        {
            id: 'diamond_sparkle',
            nome: 'Scintillio Diamanti',
            descrizione: 'Particelle brillanti sui diamanti',
            icona: '✨',
            prezzo: 350,
            tipo: 'cosmetico'
        },
        {
            id: 'rainbow_trail',
            nome: 'Scia Arcobaleno',
            descrizione: 'Trail colorato del cursore',
            icona: '🌟',
            prezzo: 300,
            tipo: 'cosmetico'
        }
    ]
};

// Ottieni inventario giocatore
export function getInventario() {
    return storage.get('inventario', {
        powerups: {},
        temi: [],
        animazioni: [],
        attivi: {}
    });
}

// Salva inventario
function salvaInventario(inventario) {
    storage.set('inventario', inventario);
}

// Acquista item
export function acquistaItem(itemId, categoria) {
    const item = shopItems[categoria].find(i => i.id === itemId);

    if (!item) {
        showNotification('❌ Item non trovato!', 'error');
        return false;
    }

    const saldo = getCaramelle();

    if (saldo < item.prezzo) {
        showNotification('❌ Saldo insufficiente!', 'error');
        return false;
    }

    // Verifica se già posseduto (per items non consumabili)
    const inventario = getInventario();

    if (categoria === 'temi' && inventario.temi.includes(itemId)) {
        showNotification('⚠️ Hai già questo tema!', 'warning');
        return false;
    }

    if (categoria === 'animazioni' && inventario.animazioni.includes(itemId)) {
        showNotification('⚠️ Hai già questa animazione!', 'warning');
        return false;
    }

    // Acquista
    setCaramelle(saldo - item.prezzo);

    // Aggiungi all'inventario
    if (categoria === 'powerups') {
        if (!inventario.powerups[itemId]) {
            inventario.powerups[itemId] = 0;
        }
        inventario.powerups[itemId]++;
    } else if (categoria === 'temi') {
        inventario.temi.push(itemId);

        // ===== FIX: Aggiungi tema al menu =====
        aggiungiTemaAlMenu(itemId, item);
        // ======================================

    } else if (categoria === 'animazioni') {
        inventario.animazioni.push(itemId);
    }

    salvaInventario(inventario);

    playSound('cashout');
    showNotification(`✅ ${item.nome} acquistato!`, 'success');

    renderShop();
    renderInventario();

    return true;
}

// Funzione helper per aggiungere tema al menu
function aggiungiTemaAlMenu(temaId, temaItem) {
    const themeMenu = document.getElementById('theme-menu');
    if (!themeMenu) return;

    // Controlla se il tema esiste già
    if (themeMenu.querySelector(`[data-theme="${temaId}"]`)) {
        showNotification(`✨ Tema "${temaItem.nome}" già disponibile nel menu!`, 'info');
        return;
    }

    // Crea il pulsante
    const button = document.createElement('button');
    button.className = 'theme-option';
    button.setAttribute('data-theme', temaId);

    // Anteprima colore
    const preview = document.createElement('span');
    preview.className = 'theme-preview';
    const theme = temaItem.theme;
    preview.style.background = `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`;

    // Nome
    const name = document.createElement('span');
    name.textContent = temaItem.nome;

    button.appendChild(preview);
    button.appendChild(name);

    // Event listener
    button.addEventListener('click', () => {
        playSound('click');

        // Applica il tema manualmente
        const t = temaItem.theme;
        document.documentElement.style.setProperty('--color-primary', t.primary);
        document.documentElement.style.setProperty('--color-primary-hover', t.primaryHover);
        document.documentElement.style.setProperty('--color-secondary', t.secondary);
        document.documentElement.style.setProperty('--color-background', t.background);
        document.documentElement.style.setProperty('--color-card-bg', t.cardBg);
        document.documentElement.style.setProperty('--color-cell-bg', t.cellBg);
        document.documentElement.style.setProperty('--color-text', t.text);
        document.documentElement.style.setProperty('--color-text-dark', t.textDark);

        // Aggiorna selezione
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // Salva tema
        storage.set('selectedTheme', temaId);

        themeMenu.classList.add('hidden');

        showNotification(`✨ Tema "${temaItem.nome}" applicato!`, 'success');
    });

    themeMenu.appendChild(button);

    showNotification(`🎨 Tema "${temaItem.nome}" aggiunto al menu! Clicca il pulsante 🎨 per applicarlo.`, 'success', 6000);
}

// Usa power-up
export function usaPowerup(itemId, gameState) {
    const inventario = getInventario();
    
    if (!inventario.powerups[itemId] || inventario.powerups[itemId] <= 0) {
        showNotification('❌ Non hai questo power-up!', 'error');
        return false;
    }

    const item = shopItems.powerups.find(i => i.id === itemId);
    
    if (!item) return false;

    // Usa il power-up
    if (item.tipo === 'consumabile' && item.usa) {
        const success = item.usa(gameState);
        if (success) {
            inventario.powerups[itemId]--;
            salvaInventario(inventario);
            renderInventario();
        }
        return success;
    }

    // Attiva power-up
    if (item.tipo === 'consumabile' && !item.usa) {
        inventario.attivi[itemId] = true;
        inventario.powerups[itemId]--;
        salvaInventario(inventario);
        showNotification(`✅ ${item.nome} attivato!`, 'success');
        renderInventario();
        return true;
    }

    if (item.tipo === 'temporaneo') {
        inventario.attivi[itemId] = {
            partiteRimaste: item.durata,
            bonus: item.bonus
        };
        inventario.powerups[itemId]--;
        salvaInventario(inventario);
        showNotification(`✅ ${item.nome} attivato per ${item.durata} partite!`, 'success');
        renderInventario();
        return true;
    }

    return false;
}

// Controlla power-up attivi
export function hasPowerupAttivo(itemId) {
    const inventario = getInventario();
    return inventario.attivi[itemId] === true || 
           (inventario.attivi[itemId] && inventario.attivi[itemId].partiteRimaste > 0);
}

// Consuma power-up temporaneo (chiamato a fine partita)
export function consumaPowerupTemporaneo(itemId) {
    const inventario = getInventario();
    
    if (inventario.attivi[itemId] && inventario.attivi[itemId].partiteRimaste) {
        inventario.attivi[itemId].partiteRimaste--;
        
        if (inventario.attivi[itemId].partiteRimaste <= 0) {
            delete inventario.attivi[itemId];
            showNotification(`⚠️ ${itemId} terminato!`, 'warning');
        }
        
        salvaInventario(inventario);
    }
}

// Disattiva power-up consumabile
export function disattivaPowerup(itemId) {
    const inventario = getInventario();
    delete inventario.attivi[itemId];
    salvaInventario(inventario);
}

// Ottieni bonus moltiplicatore attivo
export function getBonusMoltiplicatoreAttivo() {
    const inventario = getInventario();
    let bonus = 0;

    Object.keys(inventario.attivi).forEach(itemId => {
        const attivo = inventario.attivi[itemId];
        if (attivo && attivo.bonus) {
            bonus += attivo.bonus;
        }
    });

    // Double win
    if (inventario.attivi['double_win']) {
        bonus += 1.0; // Raddoppia (100% bonus)
    }

    return bonus;
}

// Renderizza shop
export function renderShop() {
    const powerupsContainer = document.getElementById('shopPowerups');
    const temiContainer = document.getElementById('shopTemi');
    const animazioniContainer = document.getElementById('shopAnimazioni');
    
    const inventario = getInventario();

    if (powerupsContainer) {
        powerupsContainer.innerHTML = shopItems.powerups.map(item => {
            const quantita = inventario.powerups[item.id] || 0;
            return `
                <div class="shop-item">
                    <div class="shop-item-icon">${item.icona}</div>
                    <div class="shop-item-info">
                        <div class="shop-item-name">${item.nome}</div>
                        <div class="shop-item-description">${item.descrizione}</div>
                        ${quantita > 0 ? `<div class="shop-item-owned">Posseduti: ${quantita}</div>` : ''}
                    </div>
                    <button class="shop-item-buy" onclick="window.shopBuy('${item.id}', 'powerups')">
                        ${item.prezzo}💵
                    </button>
                </div>
            `;
        }).join('');
    }

    if (temiContainer) {
        temiContainer.innerHTML = shopItems.temi.map(item => {
            const posseduto = inventario.temi.includes(item.id);
            return `
                <div class="shop-item ${posseduto ? 'owned' : ''}">
                    <div class="shop-item-icon">${item.icona}</div>
                    <div class="shop-item-info">
                        <div class="shop-item-name">${item.nome}</div>
                        <div class="shop-item-description">${item.descrizione}</div>
                        ${posseduto ? '<div class="shop-item-owned">✓ Posseduto</div>' : ''}
                    </div>
                    <button class="shop-item-buy" 
                            onclick="window.shopBuy('${item.id}', 'temi')"
                            ${posseduto ? 'disabled' : ''}>
                        ${posseduto ? '✓' : item.prezzo + '💵'}
                    </button>
                </div>
            `;
        }).join('');
    }

    if (animazioniContainer) {
        animazioniContainer.innerHTML = shopItems.animazioni.map(item => {
            const posseduto = inventario.animazioni.includes(item.id);
            return `
                <div class="shop-item ${posseduto ? 'owned' : ''}">
                    <div class="shop-item-icon">${item.icona}</div>
                    <div class="shop-item-info">
                        <div class="shop-item-name">${item.nome}</div>
                        <div class="shop-item-description">${item.descrizione}</div>
                        ${posseduto ? '<div class="shop-item-owned">✓ Posseduto</div>' : ''}
                    </div>
                    <button class="shop-item-buy" 
                            onclick="window.shopBuy('${item.id}', 'animazioni')"
                            ${posseduto ? 'disabled' : ''}>
                        ${posseduto ? '✓' : item.prezzo + '💵'}
                    </button>
                </div>
            `;
        }).join('');
    }
}

// Renderizza inventario
export function renderInventario() {
    const container = document.getElementById('inventoryItems');
    if (!container) return;

    const inventario = getInventario();
    const items = [];

    // Power-ups
    Object.keys(inventario.powerups).forEach(itemId => {
        const quantita = inventario.powerups[itemId];
        if (quantita > 0) {
            const item = shopItems.powerups.find(i => i.id === itemId);
            if (item) {
                const attivo = hasPowerupAttivo(itemId);
                items.push({
                    ...item,
                    quantita,
                    attivo,
                    categoria: 'powerup'
                });
            }
        }
    });

    container.innerHTML = items.map(item => `
        <div class="inventory-item ${item.attivo ? 'active' : ''}">
            <div class="inventory-item-icon">${item.icona}</div>
            <div class="inventory-item-info">
                <div class="inventory-item-name">${item.nome}</div>
                <div class="inventory-item-quantity">×${item.quantita}</div>
                ${item.attivo ? '<div class="inventory-item-active">ATTIVO</div>' : ''}
            </div>
            ${!item.attivo && item.categoria === 'powerup' ? 
                `<button class="inventory-item-use" onclick="window.usePowerup('${item.id}')">USA</button>` : 
                ''
            }
        </div>
    `).join('');

    if (items.length === 0) {
        container.innerHTML = '<div class="inventory-empty">Nessun power-up nell\'inventario</div>';
    }
}

// Setup modal shop
export function setupShopModal() {
    const button = document.getElementById('shopButton');
    const modal = document.getElementById('shopModal');
    const closeBtn = document.getElementById('closeShop');
    const tabs = document.querySelectorAll('.shop-tab');
    const contents = document.querySelectorAll('.shop-content');

    button?.addEventListener('click', () => {
        playSound('click');
        modal.style.display = 'flex';
        renderShop();
    });

    closeBtn?.addEventListener('click', () => {
        playSound('click');
        modal.style.display = 'none';
    });

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            playSound('click');
            const target = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`shop-${target}`).classList.add('active');
        });
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Setup modal inventario
export function setupInventoryModal() {
    const button = document.getElementById('inventoryButton');
    const modal = document.getElementById('inventoryModal');
    const closeBtn = document.getElementById('closeInventory');

    button?.addEventListener('click', () => {
        playSound('click');
        modal.style.display = 'flex';
        renderInventario();
    });

    closeBtn?.addEventListener('click', () => {
        playSound('click');
        modal.style.display = 'none';
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Esporta per uso globale
export { shopItems };
