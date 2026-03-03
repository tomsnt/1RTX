// ============================================
// EFFETTO RUMORE GRANULARE TV - INTENSO
// ============================================

const noiseCanvas = document.getElementById('noise');
const noiseCtx = noiseCanvas.getContext('2d');
const psychedelicCanvas = document.getElementById('psychedelic');
const psychedelicCtx = psychedelicCanvas.getContext('2d');

// Posizione mouse per effetto magnetico
let mouseX = -1000;
let mouseY = -1000;
let targetMouseX = -1000;
let targetMouseY = -1000;
const magnetRadius = 150; // Raggio dell'effetto magnetico
const magnetStrength = 25; // Intensità della distorsione

function resizeCanvases() {
    noiseCanvas.width = window.innerWidth;
    noiseCanvas.height = window.innerHeight;
    psychedelicCanvas.width = window.innerWidth;
    psychedelicCanvas.height = window.innerHeight;
}

// Rumore TV statico costante
let noiseIntensity = 1;
let horizontalWaveOffset = 0;

function generateNoise() {
    const width = noiseCanvas.width;
    const height = noiseCanvas.height;
    const imageData = noiseCtx.createImageData(width, height);
    const data = imageData.data;
    
    // Smooth follow del mouse
    mouseX += (targetMouseX - mouseX) * 0.15;
    mouseY += (targetMouseY - mouseY) * 0.15;
    
    // Aggiorna offset per onde orizzontali
    horizontalWaveOffset += 2;
    
    for (let y = 0; y < height; y++) {
        // Calcola distorsione orizzontale per questa riga
        const waveDistortion = Math.sin((y + horizontalWaveOffset) * 0.05) * 0.3 +
                               Math.sin((y - horizontalWaveOffset * 0.7) * 0.02) * 0.2;
        
        // Banda di distorsione che scorre (effetto TV vintage)
        const bandY = (horizontalWaveOffset * 0.5) % height;
        const distToBand = Math.abs(y - bandY);
        const bandEffect = distToBand < 40 ? (1 - distToBand / 40) * 0.4 : 0;
        
        for (let x = 0; x < width; x++) {
            // Calcola distorsione magnetica
            const dx = x - mouseX;
            const dy = y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            let magneticOffsetX = 0;
            let magneticOffsetY = 0;
            let magneticBrightness = 0;
            
            if (dist < magnetRadius && dist > 0) {
                // Effetto di distorsione che si attenua con la distanza
                const falloff = 1 - (dist / magnetRadius);
                const falloffSmooth = falloff * falloff; // Curva più morbida
                
                // Offset radiale (spinge i pixel verso l'esterno)
                magneticOffsetX = (dx / dist) * magnetStrength * falloffSmooth;
                magneticOffsetY = (dy / dist) * magnetStrength * falloffSmooth;
                
                // Aggiunge luminosità al centro della distorsione
                magneticBrightness = falloffSmooth * 60;
            }
            
            // Posizione sorgente del pixel (con distorsione magnetica)
            const srcX = Math.floor(x - magneticOffsetX);
            const srcY = Math.floor(y - magneticOffsetY);
            
            const i = (y * width + x) * 4;
            
            // Rumore base costante
            let value = Math.random() * 180 + 40;
            
            // Applica variazione da onda orizzontale (con distorsione magnetica)
            const distortedY = srcY + magneticOffsetY * 2;
            const magneticWave = Math.sin((distortedY + horizontalWaveOffset) * 0.05) * 0.3;
            value = value * (0.85 + (waveDistortion + magneticWave * 0.3) * 0.15);
            
            // Aggiungi effetto banda scorrevole
            value = value + bandEffect * 80;
            
            // Aggiungi luminosità magnetica
            value = value + magneticBrightness;
            
            // Clamp value
            value = Math.min(255, Math.max(0, value));
            
            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
            data[i + 3] = 255;
        }
    }
    
    noiseCtx.putImageData(imageData, 0, 0);
}

// ============================================
// EFFETTO PSICHEDELICO FLUIDO
// ============================================

let time = 0;
let hueOffset = 0;

function generatePsychedelicEffect() {
    // Leggero effetto vignette statico
    const width = psychedelicCanvas.width;
    const height = psychedelicCanvas.height;
    
    // Pulisci con nero trasparente
    psychedelicCtx.clearRect(0, 0, width, height);
    
    // Gradiente vignette fisso
    const gradient = psychedelicCtx.createRadialGradient(
        width/2, height/2, 0,
        width/2, height/2,
        Math.max(width, height) * 0.7
    );
    
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, 'transparent');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    
    psychedelicCtx.fillStyle = gradient;
    psychedelicCtx.fillRect(0, 0, width, height);
}

function drawPsychedelicWaves() {
    const width = psychedelicCanvas.width;
    const height = psychedelicCanvas.height;
    
    for (let i = 0; i < 5; i++) {
        psychedelicCtx.beginPath();
        psychedelicCtx.strokeStyle = 'hsla(' + ((hueOffset + i * 50) % 360) + ', 100%, 60%, 0.15)';
        psychedelicCtx.lineWidth = 20 + Math.sin(time + i) * 10;
        
        for (let x = 0; x < width; x += 5) {
            const y = height/2 + 
                Math.sin(x * 0.01 + time + i) * 100 + 
                Math.sin(x * 0.02 - time * 0.5) * 50 +
                Math.cos(x * 0.005 + time * 0.3) * 150;
            
            if (x === 0) {
                psychedelicCtx.moveTo(x, y);
            } else {
                psychedelicCtx.lineTo(x, y);
            }
        }
        psychedelicCtx.stroke();
    }
}

// ============================================
// ANIMAZIONE PRINCIPALE FLUIDA
// ============================================

function animate() {
    // Pulisci canvas psichedelico con fade
    psychedelicCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    psychedelicCtx.fillRect(0, 0, psychedelicCanvas.width, psychedelicCanvas.height);
    
    generateNoise();
    generatePsychedelicEffect();
    
    requestAnimationFrame(animate);
}

// Inizializza
resizeCanvases();
animate();

window.addEventListener('resize', resizeCanvases);

// ============================================
// EFFETTO DISTORSIONE MAGNETICA
// (L'effetto è integrato in generateNoise)
// ============================================

let lastMouseX = 0;
let lastMouseY = 0;

document.addEventListener('mousemove', function(e) {
    const currentTime = Date.now();
    
    const velocityX = e.clientX - lastMouseX;
    const velocityY = e.clientY - lastMouseY;
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    
    // Aggiorna posizione mouse per effetto magnetico
    const glitchCodeElement = document.getElementById('glitch-code');
    const isOverGlitch = glitchCodeElement && glitchCodeElement.matches(':hover');
    
    if (!isOverGlitch) {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
    } else {
        // Sposta il magnete fuori dallo schermo quando sopra il testo glitch
        targetMouseX = -1000;
        targetMouseY = -1000;
    }
    
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

// Quando il mouse esce dalla finestra, rimuovi l'effetto magnetico
document.addEventListener('mouseleave', function() {
    targetMouseX = -1000;
    targetMouseY = -1000;
});

// ============================================
// SUPPORTO TOUCH PER DISPOSITIVI MOBILI
// ============================================

let lastTouchX = 0;
let lastTouchY = 0;

document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 0) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        targetMouseX = lastTouchX;
        targetMouseY = lastTouchY;
    }
}, { passive: true });

document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        targetMouseX = touch.clientX;
        targetMouseY = touch.clientY;
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
    }
}, { passive: true });

document.addEventListener('touchend', function() {
    // Rimuovi effetto magnetico quando il dito si alza
    targetMouseX = -1000;
    targetMouseY = -1000;
}, { passive: true });

// ============================================
// EFFETTI CASUALI AUTOMATICI
// ============================================

function randomStaticBurst() {
    // Disabilitato - niente lampeggio
    // La statica rimane costante
}

function randomInterference() {
    // Disabilitato - niente interferenze random
    // Le onde di distorsione sono già nel rumore di fondo
}

function createRollingBar() {
    const bar = document.createElement('div');
    bar.className = 'rolling-bar';
    document.body.appendChild(bar);
    
    setTimeout(function() {
        bar.remove();
    }, 3000);
}

// Effetti automatici disabilitati per statica costante
// Le onde di distorsione orizzontali sono integrate nel rumore

// ============================================
// EFFETTO GLITCH - Decodifica progressiva
// ============================================

// Caratteri per l'effetto glitch (stile Minecraft enchantment table)
const glitchChars = [
    'Δ', 'Ω', 'Π', 'Ж', 'Ҫ', 'Ɣ', '҂', '₪', 'Ƨ', 'ᛉ',
    'Ø', 'I', 'Z', 'Ξ', 'Ψ', 'Σ', 'G', 'Λ', '∞', 'Φ',
    '◊', '▓', '░', '█', '▄', '▀', '■', '□', '▪', '▫',
    'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ',
    'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛞ',
    '⌐', '¬', '½', '¼', '░', '▒', '▓', '│', '┤', '╡',
    '₿', '₴', '₵', '₸', '₹', '₺', '₻', '₼', '₽', '₾',
    'Ꮬ', 'Ꮭ', 'Ꮮ', 'Ꮯ', 'Ꮰ', 'Ꮱ', 'Ꮲ', 'Ꮳ', 'Ꮴ', 'Ꮵ',
    '⌘', '⏎', '⌥', '⇧', '⌫', '⌦', '↵', '⇥', '⌤', '⎋',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'A', 'B', 'C', 'D', 'E', 'F', 'X', 'Y', 'Z', 'W'
];

const glitchDisplay = document.getElementById('glitch-display');
const targetText = "2026 ANNIVERSARY DJ SET";
let isHovering = false;
let lockedChars = []; // Array di booleani per caratteri "decodificati"
let decodeTimeouts = [];

// Inizializza array di lock
for (let i = 0; i < targetText.length; i++) {
    lockedChars[i] = false;
}

// Genera un carattere glitch casuale
function getRandomGlitchChar() {
    return glitchChars[Math.floor(Math.random() * glitchChars.length)];
}

// Genera stringa con mix di glitch e caratteri decodificati
function generateMixedString() {
    let result = '';
    for (let i = 0; i < targetText.length; i++) {
        if (lockedChars[i]) {
            // Carattere già decodificato - mostra quello vero
            result += targetText[i];
        } else {
            // Carattere ancora in glitch
            if (targetText[i] === ' ') {
                result += ' ';
            } else {
                result += getRandomGlitchChar();
            }
        }
    }
    return result;
}

// Aggiorna il display con effetto glitch
function updateGlitchDisplay() {
    if (glitchDisplay) {
        glitchDisplay.textContent = generateMixedString();
    }
}

// Decodifica progressiva quando in hover
function startDecoding() {
    // Cancella eventuali timeout precedenti
    decodeTimeouts.forEach(t => clearTimeout(t));
    decodeTimeouts = [];
    
    // Ordine casuale per decodifica
    let indices = [];
    for (let i = 0; i < targetText.length; i++) {
        if (targetText[i] !== ' ') {
            indices.push(i);
        }
    }
    // Mescola gli indici
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    // Decodifica ogni carattere con delay progressivo
    indices.forEach((charIndex, orderIndex) => {
        const timeout = setTimeout(() => {
            lockedChars[charIndex] = true;
            updateGlitchDisplay();
        }, 30 + orderIndex * 40); // 40ms tra ogni carattere
        decodeTimeouts.push(timeout);
    });
}

// Reset quando esce dall'hover
function resetDecoding() {
    // Cancella timeout pendenti
    decodeTimeouts.forEach(t => clearTimeout(t));
    decodeTimeouts = [];
    
    // Reset graduale dei caratteri (effetto inverso)
    let indices = [];
    for (let i = 0; i < targetText.length; i++) {
        if (lockedChars[i]) {
            indices.push(i);
        }
    }
    // Mescola per reset casuale
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    indices.forEach((charIndex, orderIndex) => {
        setTimeout(() => {
            lockedChars[charIndex] = false;
        }, orderIndex * 25);
    });
}

// Velocità variabile per effetto più organico
function scheduleNextUpdate() {
    const interval = Math.random() * 60 + 30;
    setTimeout(function() {
        updateGlitchDisplay();
        scheduleNextUpdate();
    }, interval);
}

// Eventi hover
const glitchCode = document.getElementById('glitch-code');
if (glitchCode) {
    glitchCode.addEventListener('mouseenter', function() {
        isHovering = true;
        startDecoding();
    });
    
    glitchCode.addEventListener('mouseleave', function() {
        isHovering = false;
        resetDecoding();
    });
    
    // Touch support
    glitchCode.addEventListener('touchstart', function() {
        isHovering = true;
        startDecoding();
    }, { passive: true });
    
    glitchCode.addEventListener('touchend', function() {
        setTimeout(function() {
            isHovering = false;
            resetDecoding();
        }, 2000); // Mantieni visibile per 2s dopo il touch
    }, { passive: true });
}

// Avvia l'effetto
updateGlitchDisplay();
scheduleNextUpdate();

// ============================================
// GLITCH PESANTE OCCASIONALE SUL LOGO
// ============================================

const centerLogo = document.getElementById('center-logo');

function triggerHeavyGlitch() {
    // Probabilità bassa di glitch (circa ogni 3-8 secondi)
    const nextGlitch = Math.random() * 5000 + 3000;
    
    setTimeout(function() {
        if (centerLogo) {
            // Attiva glitch pesante
            centerLogo.classList.add('heavy-glitch');
            
            // Rimuovi dopo l'animazione
            setTimeout(function() {
                centerLogo.classList.remove('heavy-glitch');
            }, 150);
        }
        
        // Programma il prossimo glitch
        triggerHeavyGlitch();
    }, nextGlitch);
}

// Avvia il ciclo di glitch
triggerHeavyGlitch();

console.log('Psychedelic TV Static Effect attivo!');
