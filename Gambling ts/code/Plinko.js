// Game Variables
let balance = 500;
let currentBet = 10;
let rows = 8;
let inGame = false;
let currentTheme = 'default';

const canvas = document.getElementById('plinko-canvas');
const ctx = canvas.getContext('2d');

const themes = {
    default: {
        primary: '#ffc400',
        secondary: '#00cc66',
        background: '#0b0f1a',
        cardBg: '#111627',
        cellBg: '#1a2030',
        text: '#ffffff',
        peg: '#ffc400',
        ball: '#00cc66'
    },
    dark: {
        primary: '#60a5fa',
        secondary: '#a78bfa',
        background: '#000000',
        cardBg: '#1a1a1a',
        cellBg: '#2a2a2a',
        text: '#f9fafb',
        peg: '#60a5fa',
        ball: '#a78bfa'
    },
    neon: {
        primary: '#ec4899',
        secondary: '#06b6d4',
        background: '#0f172a',
        cardBg: '#1e293b',
        cellBg: '#334155',
        text: '#f0abfc',
        peg: '#ec4899',
        ball: '#06b6d4'
    }
};

// Balance Management
function updateBalance(amount) {
    balance = Math.max(0, balance + amount);
    document.getElementById('balance').textContent = balance;
}

// Bet Management
document.getElementById('scommessa').addEventListener('input', (e) => {
    if (inGame) return;
    currentBet = Math.min(parseInt(e.target.value) || 0, balance);
    e.target.value = currentBet;
});

document.querySelectorAll('.bet-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (inGame) return;
        const add = parseInt(btn.dataset.add);
        currentBet = Math.min(currentBet + add, balance);
        document.getElementById('scommessa').value = currentBet;
    });
});

document.querySelector('.max-bet-btn').addEventListener('click', () => {
    if (inGame) return;
    currentBet = balance;
    document.getElementById('scommessa').value = currentBet;
});

// Difficulty Selection
document.querySelectorAll('.version-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (inGame) return;
        document.querySelectorAll('.version-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        rows = parseInt(btn.dataset.rows);
        setupPlinko();
    });
});

// Theme Switcher
document.getElementById('theme-button').addEventListener('click', () => {
    document.getElementById('theme-menu').classList.toggle('hidden');
});

document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        applyTheme(theme);
        document.getElementById('theme-menu').classList.add('hidden');
    });
});

function applyTheme(themeName) {
    currentTheme = themeName;
    const theme = themes[themeName];
    document.documentElement.style.setProperty('--color-primary', theme.primary);
    document.documentElement.style.setProperty('--color-secondary', theme.secondary);
    document.documentElement.style.setProperty('--color-background', theme.background);
    document.documentElement.style.setProperty('--color-card-bg', theme.cardBg);
    document.documentElement.style.setProperty('--color-cell-bg', theme.cellBg);
    document.documentElement.style.setProperty('--color-text', theme.text);

    document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');

    setupPlinko();
}

// Plinko Game Logic
class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 8;
        this.gravity = 0.5;
        this.bounce = 0.6;
    }

    update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
    }

    draw() {
        const theme = themes[currentTheme];
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = theme.ball;
        ctx.shadowBlur = 15;
        ctx.shadowColor = theme.ball;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

let pegs = [];
let multipliers = [];
let balls = [];

function setupPlinko() {
    pegs = [];
    const pegSpacing = 40;
    const startX = canvas.width / 2 - (rows / 2) * pegSpacing;
    const startY = 100;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col <= row; col++) {
            pegs.push({
                x: startX + col * pegSpacing + (rows - row - 1) * pegSpacing / 2,
                y: startY + row * pegSpacing,
                radius: 5
            });
        }
    }

    // Setup multipliers
    const slots = rows + 1;
    multipliers = [];
    const multValues = generateMultipliers(slots);

    const multContainer = document.getElementById('multipliers');
    multContainer.innerHTML = '';

    multValues.forEach((mult, i) => {
        multipliers.push({
            x: startX + i * pegSpacing - pegSpacing / 2,
            value: mult
        });

        const box = document.createElement('div');
        box.className = 'multiplier-box';
        if (mult >= 10) box.classList.add('mult-high');
        else if (mult >= 2) box.classList.add('mult-medium');
        else box.classList.add('mult-low');
        box.textContent = `×${mult}`;
        multContainer.appendChild(box);
    });

    drawPlinko();
}

function generateMultipliers(slots) {
    const mults = [];
    const center = Math.floor(slots / 2);

    for (let i = 0; i < slots; i++) {
        const distance = Math.abs(i - center);
        if (distance === 0) mults.push(16);
        else if (distance === 1) mults.push(9);
        else if (distance === 2) mults.push(2);
        else if (distance === 3) mults.push(1.2);
        else if (distance === 4) mults.push(0.5);
        else mults.push(0.3);
    }

    return mults;
}

function drawPlinko() {
    const theme = themes[currentTheme];
    ctx.fillStyle = theme.cellBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pegs
    pegs.forEach(peg => {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
        ctx.fillStyle = theme.peg;
        ctx.shadowBlur = 10;
        ctx.shadowColor = theme.peg;
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Draw balls
    balls.forEach(ball => ball.draw());
}

function checkCollisions(ball) {
    pegs.forEach(peg => {
        const dx = ball.x - peg.x;
        const dy = ball.y - peg.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ball.radius + peg.radius) {
            const angle = Math.atan2(dy, dx);
            ball.x = peg.x + Math.cos(angle) * (ball.radius + peg.radius);
            ball.y = peg.y + Math.sin(angle) * (ball.radius + peg.radius);

            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            ball.vx = Math.cos(angle) * speed * ball.bounce + (Math.random() - 0.5) * 2;
            ball.vy = Math.sin(angle) * speed * ball.bounce;
        }
    });
}

function getMultiplierSlot(x) {
    for (let i = 0; i < multipliers.length; i++) {
        const mult = multipliers[i];
        const nextMult = multipliers[i + 1];
        if (nextMult && x >= mult.x && x < nextMult.x) {
            return i;
        }
    }
    return multipliers.length - 1;
}

function animate() {
    drawPlinko();

    balls = balls.filter(ball => {
        ball.update();
        checkCollisions(ball);

        if (ball.y > canvas.height - 50) {
            const slot = getMultiplierSlot(ball.x);
            const mult = multipliers[slot].value;
            const winAmount = Math.floor(currentBet * mult);

            updateBalance(winAmount);
            document.getElementById('last-win').textContent = winAmount;

            if (mult >= 5) {
                showWinPopup(winAmount);
            }

            return false;
        }

        return ball.y < canvas.height + 50;
    });

    if (balls.length > 0 || inGame) {
        requestAnimationFrame(animate);
    } else {
        inGame = false;
    }
}

function dropBall() {
    if (currentBet <= 0 || currentBet > balance) return;

    updateBalance(-currentBet);

    const ball = new Ball(canvas.width / 2 + (Math.random() - 0.5) * 20, 50);
    balls.push(ball);

    if (!inGame) {
        inGame = true;
        animate();
    }
}

document.getElementById('drop-btn').addEventListener('click', dropBall);

function showWinPopup(amount) {
    document.getElementById('win-amount').textContent = amount;
    document.getElementById('overlay').style.display = 'flex';
}

function closePopup() {
    document.getElementById('overlay').style.display = 'none';
}

// Initialize
setupPlinko();