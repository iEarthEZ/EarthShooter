const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const mainMenu = document.getElementById('main-menu');
const gameOverScreen = document.getElementById('game-over');
const upgradeScreen = document.getElementById('upgrade-screen');
const upgradeOptionsContainer = document.getElementById('upgrade-options');
const hud = document.getElementById('hud');
const startBtn = document.getElementById('start-btn');
const respawnBtn = document.getElementById('respawn-btn');
const menuBtn = document.getElementById('menu-btn');
const scoreDisplay = document.getElementById('score-display');
const levelDisplay = document.getElementById('level-display');
const finalScoreDisplay = document.getElementById('final-score');
const finalLevelDisplay = document.getElementById('final-level');
const playerHealthBar = document.getElementById('player-health-bar');
const expBar = document.getElementById('exp-bar');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

let animationId;
let score = 0;
let level = 1;
let exp = 0;
let expToNextLevel = 5;
let frames = 0;
let isGameOver = false;
let isPaused = false;
let stars = [];
let audioCtx = null;
let screenShake = 0;

const keys = { w: false, a: false, s: false, d: false };
const mouse = { x: canvas.width / 2, y: canvas.height / 2, isDown: false, worldX: 0, worldY: 0 };

window.addEventListener('keydown', (e) => { if(keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if(keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; });
window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mousedown', (e) => { if(e.button === 0) mouse.isDown = true; });
window.addEventListener('mouseup', (e) => { if(e.button === 0) mouse.isDown = false; });

function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playShootSound() {
    if (!audioCtx) return;
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
}

function playHitSound() {
    if (!audioCtx) return;
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(30, audioCtx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
}

function playEnemyDieSound(isHeavy) {
    if (!audioCtx) return;
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    let duration = isHeavy ? 0.3 : 0.15;
    let baseFreq = isHeavy ? 150 : 220;
    osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + duration);
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playBossDieSound() {
    if (!audioCtx) return;
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(5, audioCtx.currentTime + 1.5);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.5);
}

function playLevelUpSound() {
    if (!audioCtx) return;
    let now = audioCtx.currentTime;
    let notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, idx) => {
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.12, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.18);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.18);
    });
}

function playGameOverSound() {
    if (!audioCtx) return;
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 0.7);
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.7);
}

function playClickSound() {
    initAudio();
    if (!audioCtx) return;
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

function applyScreenShake(amount) {
    screenShake = amount;
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.0;
        this.decay = Math.random() * 0.03 + 0.02;
        this.size = Math.random() * 3 + 1;
    }
    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.draw();
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.acceleration = 0.9;
        this.friction = 0.82;
        this.maxSpeed = 6;
        this.radius = 15;
        this.color = '#4CAF50';
        this.maxHealth = 100;
        this.health = 100;
        this.shootCooldown = 0;
        this.fireRate = 12;
        this.projectileSize = 5;
        this.projectileDamage = 1;
        this.spreadCount = 1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        
        const angle = Math.atan2(mouse.worldY - this.y, mouse.worldX - this.x);
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.cos(angle) * 25, this.y + Math.sin(angle) * 25);
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.closePath();
    }

    update() {
        if (keys.w) this.vy -= this.acceleration;
        if (keys.s) this.vy += this.acceleration;
        if (keys.a) this.vx -= this.acceleration;
        if (keys.d) this.vx += this.acceleration;

        this.vx *= this.friction;
        this.vy *= this.friction;

        const speed = Math.hypot(this.vx, this.vy);
        if (speed > this.maxSpeed) {
            const ratio = this.maxSpeed / speed;
            this.vx *= ratio;
            this.vy *= ratio;
        }

        this.x += this.vx;
        this.y += this.vy;
        
        if (this.shootCooldown > 0) this.shootCooldown--;
        if (mouse.isDown && this.shootCooldown <= 0) {
            this.shoot();
            this.shootCooldown = this.fireRate;
        }

        this.draw();
    }

    shoot() {
        const angle = Math.atan2(mouse.worldY - this.y, mouse.worldX - this.x);
        const baseSpeed = 15;
        playShootSound();
        
        if (this.spreadCount === 1) {
            const velocity = { x: Math.cos(angle) * baseSpeed, y: Math.sin(angle) * baseSpeed };
            projectiles.push(new Projectile(this.x, this.y, this.projectileSize, '#ffff00', velocity, this.projectileDamage));
        } else {
            const spreadStep = 0.15;
            const startOffset = -Math.floor(this.spreadCount / 2) * spreadStep;
            
            for(let i = 0; i < this.spreadCount; i++) {
                const spreadAngle = angle + startOffset + (i * spreadStep);
                const velocity = { x: Math.cos(spreadAngle) * baseSpeed, y: Math.sin(spreadAngle) * baseSpeed };
                projectiles.push(new Projectile(this.x, this.y, this.projectileSize, '#00ffff', velocity, this.projectileDamage));
            }
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (amount > 0) {
            playHitSound();
            applyScreenShake(8);
            for(let i = 0; i < 5; i++) particles.push(new Particle(this.x, this.y, this.color));
        }
        const healthPercent = Math.max(0, (this.health / this.maxHealth) * 100);
        playerHealthBar.style.width = `${healthPercent}%`;
        
        if (healthPercent > 50) playerHealthBar.style.backgroundColor = '#4CAF50';
        else if (healthPercent > 20) playerHealthBar.style.backgroundColor = '#ffeb3b';
        else playerHealthBar.style.backgroundColor = '#f44336';

        if (this.health <= 0 && !isGameOver) {
            triggerGameOver();
        }
    }
}

class Projectile {
    constructor(x, y, size, color, velocity, damage) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.radius = size;
        this.color = color;
        this.velocity = velocity;
        this.damage = damage;
        this.distanceTraveled = 0;
    }

    draw() {
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.fillStyle = this.color;
        const scale = this.size / 5;
        ctx.fillRect(-10 * scale, -2 * scale, 20 * scale, 4 * scale); 
        ctx.restore();
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.distanceTraveled += Math.hypot(this.velocity.x, this.velocity.y);
        this.draw();
    }
}

class EnemyProjectile extends Projectile {
    constructor(x, y, size, color, velocity, damage) {
        super(x, y, size, color, velocity, damage);
    }
}

class Boss {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 80;
        this.maxHealth = 500 + (level * 50);
        this.health = this.maxHealth;
        this.name = "TON-618 SINGULARITY";
        this.pulse = 0;
        this.shootCooldown = 120;
    }

    draw() {
        this.pulse += 0.05;
        const glow = Math.abs(Math.sin(this.pulse)) * 15 + 10;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + glow, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(156, 39, 176, 0.3)';
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#050505';
        ctx.strokeStyle = '#9c27b0';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }

    update() {
        const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
        const angleToPlayer = Math.atan2(this.y - player.y, this.x - player.x);
        
        const gravityForce = 4.5 / Math.max(1, (distToPlayer / 100));
        player.vx += Math.cos(angleToPlayer) * gravityForce;
        player.vy += Math.sin(angleToPlayer) * gravityForce;

        if (this.shootCooldown > 0) this.shootCooldown--;
        if (this.shootCooldown <= 0) {
            playShootSound();
            for (let i = 0; i < 12; i++) {
                const angle = (Math.PI * 2 / 12) * i + this.pulse;
                const velocity = { x: Math.cos(angle) * 4, y: Math.sin(angle) * 4 };
                enemyProjectiles.push(new EnemyProjectile(this.x, this.y, 8, '#ff00ff', velocity, 20));
            }
            this.shootCooldown = 100;
        }

        this.draw();
    }
}

class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        
        if (type === 1) {
            this.radius = 28;
            this.color = '#9c27b0';
            this.speed = Math.random() * 0.8 + 0.6;
            this.maxHealth = 20 + Math.floor(level * 2);
            this.scoreValue = 5;
            this.damage = 40;
        } else if (type === 2) {
            this.radius = 14;
            this.color = '#00bcd4';
            this.speed = Math.random() * 1.5 + 1.5;
            this.maxHealth = 5 + Math.floor(level * 0.5);
            this.scoreValue = 3;
            this.damage = 10;
            this.shootCooldown = Math.floor(Math.random() * 60) + 60;
        } else {
            this.radius = 16;
            this.color = '#f44336';
            this.speed = Math.random() * 1.5 + 1.2;
            this.maxHealth = 3 + Math.floor(level * 1);
            this.scoreValue = 1;
            this.damage = 20;
        }
        
        this.health = this.maxHealth;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        const barWidth = this.radius * 2;
        const barHeight = 4;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 10, barWidth, barHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 10, barWidth * (this.health / this.maxHealth), barHeight);
    }

    update() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        const dist = Math.hypot(player.x - this.x, player.y - this.y);

        if (activeBoss) {
            const angleToBoss = Math.atan2(activeBoss.y - this.y, activeBoss.x - this.x);
            this.x += Math.cos(angleToBoss) * 3;
            this.y += Math.sin(angleToBoss) * 3;
            if (Math.hypot(activeBoss.x - this.x, activeBoss.y - this.y) < activeBoss.radius) {
                this.health = 0; 
            }
        } else {
            if (this.type === 2) {
                if (dist > 350) {
                    this.x += Math.cos(angle) * this.speed;
                    this.y += Math.sin(angle) * this.speed;
                } else if (dist < 250) {
                    this.x -= Math.cos(angle) * this.speed;
                    this.y -= Math.sin(angle) * this.speed;
                }
                
                if (this.shootCooldown > 0) this.shootCooldown--;
                if (this.shootCooldown <= 0 && dist < 500) {
                    const velocity = { x: Math.cos(angle) * 7, y: Math.sin(angle) * 7 };
                    enemyProjectiles.push(new EnemyProjectile(this.x, this.y, 5, '#ff9800', velocity, this.damage));
                    this.shootCooldown = 90;
                }
            } else {
                this.x += Math.cos(angle) * this.speed;
                this.y += Math.sin(angle) * this.speed;
            }
        }

        this.draw();
    }
}

let player;
let projectiles = [];
let enemyProjectiles = [];
let enemies = [];
let particles = [];
let activeBoss = null;
let bossDefeatedThisLevel = false;

const upgradesList = [
    { name: "Rapid Fire", desc: "Decreases shoot cooldown.", apply: () => player.fireRate = Math.max(3, player.fireRate - 2) },
    { name: "Spread Shot", desc: "+2 Projectiles per shot.", apply: () => player.spreadCount += 2 },
    { name: "Heavy Rounds", desc: "Increases bullet size & damage.", apply: () => { player.projectileDamage += 2; player.projectileSize += 2; } },
    { name: "Agility", desc: "Increases movement speed.", apply: () => player.maxSpeed += 1 },
    { name: "Vitality", desc: "Max HP +20 and fully heals.", apply: () => { player.maxHealth += 20; player.health = player.maxHealth; player.takeDamage(0); } }
];

function initStars() {
    stars = [];
    const colors = ['#ffffff', '#ffffff', '#80deea', '#b388ff'];
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2.5 + 0.5,
            speedFactor: Math.random() * 0.4 + 0.1,
            twinkleSpeed: Math.random() * 0.03 + 0.005,
            alpha: Math.random(),
            dir: Math.random() > 0.5 ? 1 : -1,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

function updateAndDrawStars(vx, vy) {
    for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        
        star.alpha += star.twinkleSpeed * star.dir;
        if (star.alpha > 1 || star.alpha < 0.2) star.dir *= -1;
        
        star.x -= vx * star.speedFactor;
        star.y -= vy * star.speedFactor;
        
        if (activeBoss) {
            const angleToBoss = Math.atan2(activeBoss.y - (star.y + player.y - canvas.height/2), activeBoss.x - (star.x + player.x - canvas.width/2));
            star.x += Math.cos(angleToBoss) * 2;
            star.y += Math.sin(angleToBoss) * 2;
        }
        
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
        
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    ctx.globalAlpha = 1.0;
}

function init() {
    initAudio();
    player = new Player(0, 0);
    projectiles = [];
    enemyProjectiles = [];
    enemies = [];
    particles = [];
    activeBoss = null;
    bossDefeatedThisLevel = false;
    screenShake = 0;
    score = 0;
    level = 1;
    exp = 0;
    expToNextLevel = 10;
    frames = 0;
    isGameOver = false;
    isPaused = false;
    
    initStars();
    updateHUD();
    player.takeDamage(0);
    
    mainMenu.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    upgradeScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    
    animate();
}

function updateHUD() {
    scoreDisplay.innerText = score;
    levelDisplay.innerText = level;
    const expPercent = Math.min(100, (exp / expToNextLevel) * 100);
    expBar.style.width = `${expPercent}%`;
}

function addExperience(amount) {
    exp += amount;
    if (exp >= expToNextLevel) {
        exp -= expToNextLevel;
        level++;
        expToNextLevel = Math.floor(expToNextLevel * 1.5);
        bossDefeatedThisLevel = false;
        triggerLevelUp();
    }
    updateHUD();
}

function triggerLevelUp() {
    isPaused = true;
    mouse.isDown = false;
    playLevelUpSound();
    upgradeOptionsContainer.innerHTML = '';
    
    let shuffled = upgradesList.sort(() => 0.5 - Math.random());
    let selectedUpgrades = shuffled.slice(0, 3);
    
    selectedUpgrades.forEach(upgrade => {
        const card = document.createElement('div');
        card.classList.add('upgrade-card');
        card.innerHTML = `<h3>${upgrade.name}</h3><p>${upgrade.desc}</p>`;
        card.addEventListener('click', () => {
            playClickSound();
            upgrade.apply();
            isPaused = false;
            upgradeScreen.classList.add('hidden');
            hud.classList.remove('hidden');
            animate();
        });
        upgradeOptionsContainer.appendChild(card);
    });
    
    hud.classList.add('hidden');
    upgradeScreen.classList.remove('hidden');
}

function spawnEnemy() {
    const spawnRadius = Math.max(canvas.width, canvas.height);
    const angle = Math.random() * Math.PI * 2;
    const x = player.x + Math.cos(angle) * spawnRadius;
    const y = player.y + Math.sin(angle) * spawnRadius;
    
    let type = 0;
    const rand = Math.random();
    
    if (level > 2 && rand < 0.25) type = 2;
    else if (level > 4 && rand < 0.4) type = 1;
    
    enemies.push(new Enemy(x, y, type));
}

function drawInfiniteGrid(cameraX, cameraY) {
    const gridSize = 100;
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    
    const startX = Math.floor(cameraX / gridSize) * gridSize - gridSize;
    const endX = startX + canvas.width + gridSize * 2;
    const startY = Math.floor(cameraY / gridSize) * gridSize - gridSize;
    const endY = startY + canvas.height + gridSize * 2;

    ctx.beginPath();
    for (let x = startX; x <= endX; x += gridSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += gridSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
    }
    ctx.stroke();
}

function drawBossUI() {
    if (!activeBoss) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); 
    
    const barWidth = canvas.width * 0.6;
    const barHeight = 20;
    const x = (canvas.width - barWidth) / 2;
    const y = 40;
    
    ctx.fillStyle = '#fff';
    ctx.font = '20px "Courier New", Courier, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(activeBoss.name, canvas.width / 2, y - 10);
    
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, barWidth, barHeight);
    
    const healthPercent = Math.max(0, activeBoss.health / activeBoss.maxHealth);
    ctx.fillStyle = '#9c27b0';
    ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);
    
    ctx.restore();
}

function createExplosion(x, y, color, amount) {
    for (let i = 0; i < amount; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function animate() {
    if (isGameOver || isPaused) return;
    animationId = requestAnimationFrame(animate);
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateAndDrawStars(player.vx, player.vy);

    ctx.save();
    
    if (screenShake > 0) {
        const dx = (Math.random() - 0.5) * screenShake;
        const dy = (Math.random() - 0.5) * screenShake;
        ctx.translate(dx, dy);
        screenShake *= 0.9;
        if (screenShake < 0.5) screenShake = 0;
    }

    const cameraX = player.x - canvas.width / 2;
    const cameraY = player.y - canvas.height / 2;
    mouse.worldX = mouse.x + cameraX;
    mouse.worldY = mouse.y + cameraY;
    
    ctx.translate(-cameraX, -cameraY);
    drawInfiniteGrid(cameraX, cameraY);

    if (level % 10 === 0 && !activeBoss && !bossDefeatedThisLevel) {
        activeBoss = new Boss(player.x, player.y - 600);
    }

    if (activeBoss) {
        activeBoss.update();
        const distToPlayer = Math.hypot(player.x - activeBoss.x, player.y - activeBoss.y);
        if (distToPlayer < activeBoss.radius + player.radius) {
            player.takeDamage(2);
        }
    }

    player.update();

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) particles.splice(i, 1);
    }

    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.update();
        
        let hit = false;
        
        if (activeBoss) {
            if (Math.hypot(p.x - activeBoss.x, p.y - activeBoss.y) < activeBoss.radius) {
                activeBoss.health -= p.damage;
                createExplosion(p.x, p.y, p.color, 3);
                hit = true;
                
                if (activeBoss.health <= 0) {
                    playBossDieSound();
                    applyScreenShake(30);
                    createExplosion(activeBoss.x, activeBoss.y, '#9c27b0', 100);
                    createExplosion(activeBoss.x, activeBoss.y, '#ffffff', 50);
                    score += 500;
                    addExperience(100);
                    activeBoss = null;
                    bossDefeatedThisLevel = true;
                }
            }
        }

        if (hit) {
            projectiles.splice(i, 1);
            continue;
        }

        if (p.distanceTraveled > 1500) projectiles.splice(i, 1);
    }

    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const ep = enemyProjectiles[i];
        ep.update();
        const distToPlayer = Math.hypot(player.x - ep.x, player.y - ep.y);
        if (distToPlayer - player.radius - ep.radius < 0) {
            player.takeDamage(ep.damage);
            enemyProjectiles.splice(i, 1);
            continue;
        }
        if (ep.distanceTraveled > 1500) enemyProjectiles.splice(i, 1);
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update();

        if (enemy.health <= 0) {
            enemies.splice(i, 1);
            continue;
        }

        const distToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (distToPlayer - enemy.radius - player.radius < 0) {
            player.takeDamage(enemy.damage);
            if (enemy.type !== 1) {
                createExplosion(enemy.x, enemy.y, enemy.color, 15);
                enemies.splice(i, 1);
            } else {
                enemy.health -= 10;
                if (enemy.health <= 0) {
                    playEnemyDieSound(true);
                    createExplosion(enemy.x, enemy.y, enemy.color, 30);
                    applyScreenShake(12);
                    enemies.splice(i, 1);
                }
            }
            continue;
        }

        for (let j = projectiles.length - 1; j >= 0; j--) {
            const projectile = projectiles[j];
            const distToProj = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            
            if (distToProj - enemy.radius - projectile.radius < 0) {
                projectiles.splice(j, 1);
                enemy.health -= projectile.damage;
                createExplosion(projectile.x, projectile.y, projectile.color, 4);
                
                if (enemy.health <= 0) {
                    playEnemyDieSound(enemy.type === 1);
                    createExplosion(enemy.x, enemy.y, enemy.color, enemy.type === 1 ? 30 : 15);
                    if (enemy.type === 1) applyScreenShake(10);
                    else applyScreenShake(3);
                    
                    enemies.splice(i, 1);
                    score += enemy.scoreValue;
                    addExperience(enemy.scoreValue);
                }
                break;
            }
        }
    }

    frames++;

    if (!activeBoss) {
        let spawnRate = Math.max(5, 60 - Math.floor(frames / 120)); 
        if (frames % spawnRate === 0) spawnEnemy();
    }

    ctx.restore();
    drawBossUI();
}

function triggerGameOver() {
    isGameOver = true;
    cancelAnimationFrame(animationId);
    playGameOverSound();
    hud.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreDisplay.innerText = score;
    finalLevelDisplay.innerText = level;
    mouse.isDown = false;
}

function returnToMenu() {
    gameOverScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
}

startBtn.addEventListener('click', () => { playClickSound(); init(); });
respawnBtn.addEventListener('click', () => { playClickSound(); init(); });
menuBtn.addEventListener('click', () => { playClickSound(); returnToMenu(); });