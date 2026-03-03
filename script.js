// ============================================
// EFFETTO RUMORE GRANULARE TV - INTENSO
// ============================================

const noiseCanvas = document.getElementById('noise');
const noiseCtx = noiseCanvas.getContext('2d');
const psychedelicCanvas = document.getElementById('psychedelic');
const psychedelicCtx = psychedelicCanvas.getContext('2d');

// Mouse e scia
let mouseX = -1000;
let mouseY = -1000;
const magnetRadius = 200;
const trailLength = 12;
const trail = [];
for (let i = 0; i < trailLength; i++) {
    trail.push({ x: -1000, y: -1000 });
}

function updateTrail() {
    // Shifta la scia
    for (let i = trailLength - 1; i > 0; i--) {
        trail[i].x = trail[i - 1].x;
        trail[i].y = trail[i - 1].y;
    }
    trail[0].x = mouseX;
    trail[0].y = mouseY;
}

function resizeCanvases() {
    noiseCanvas.width = window.innerWidth;
    noiseCanvas.height = window.innerHeight;
    psychedelicCanvas.width = window.innerWidth;
    psychedelicCanvas.height = window.innerHeight;
}

let horizontalWaveOffset = 0;

function generateNoise() {
    const width = noiseCanvas.width;
    const height = noiseCanvas.height;
    const imageData = noiseCtx.createImageData(width, height);
    const data = imageData.data;
    
    horizontalWaveOffset += 2;
    updateTrail();
    
    // Buffer rumore
    const noiseBuffer = new Float32Array(width * height);
    for (let i = 0; i < noiseBuffer.length; i++) {
        noiseBuffer[i] = Math.random() * 160 + 50;
    }
    
    for (let y = 0; y < height; y++) {
        const waveDistortion = Math.sin((y + horizontalWaveOffset) * 0.05) * 0.3;
        const bandY = (horizontalWaveOffset * 0.5) % height;
        const distToBand = Math.abs(y - bandY);
        const bandEffect = distToBand < 40 ? (1 - distToBand / 40) * 0.3 : 0;
        
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            
            // Calcola effetto combinato di tutti i punti della scia
            let totalBend = 0;
            let totalPull = 0;
            let totalChroma = 0;
            let totalFlicker = 0;
            
            for (let t = 0; t < trailLength; t++) {
                const tx = trail[t].x;
                const ty = trail[t].y;
                if (tx < -500) continue;
                
                const dx = x - tx;
                const dy = y - ty;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // Raggio decresce lungo la scia
                const trailFade = 1 - (t / trailLength);
                const radius = magnetRadius * trailFade;
                
                if (dist < radius && radius > 0) {
                    const intensity = (1 - dist / radius) * trailFade;
                    const curve = intensity * intensity;
                    
                    // Distorsione MOLTO intensa
                    totalBend += curve * 200 * (dy / radius);
                    totalPull += curve * 150 * Math.sign(dx);
                    
                    // Aberrazione cromatica (separazione RGB)
                    totalChroma += curve * 50;
                    
                    // Flicker
                    totalFlicker += curve * 80;
                }
            }
            
            // Coordinate sorgente distorte
            let srcX = x + totalPull;
            let srcY = y + totalBend;
            
            srcX = Math.max(0, Math.min(width - 1, Math.floor(srcX)));
            srcY = Math.max(0, Math.min(height - 1, Math.floor(srcY)));
            
            // Prendi valori
            let gray = noiseBuffer[srcY * width + srcX];
            gray *= (0.85 + waveDistortion * 0.15);
            gray += bandEffect * 60;
            
            // RGB con aberrazione cromatica naturale (solo separazione, no tinte)
            const srcXr = Math.max(0, Math.min(width - 1, Math.floor(srcX - totalChroma)));
            const srcXg = Math.max(0, Math.min(width - 1, Math.floor(srcX)));
            const srcXb = Math.max(0, Math.min(width - 1, Math.floor(srcX + totalChroma)));
            
            let r = noiseBuffer[srcY * width + srcXr];
            let g = noiseBuffer[srcY * width + srcXg];
            let b = noiseBuffer[srcY * width + srcXb];
            
            r *= (0.85 + waveDistortion * 0.15);
            g *= (0.85 + waveDistortion * 0.15);
            b *= (0.85 + waveDistortion * 0.15);
            r += bandEffect * 60;
            g += bandEffect * 60;
            b += bandEffect * 60;
            
            // Flicker nella zona distorta
            if (totalFlicker > 0) {
                const flicker = (Math.random() - 0.5) * totalFlicker;
                r += flicker;
                g += flicker;
                b += flicker;
            }
            
            data[i] = Math.min(255, Math.max(0, r));
            data[i + 1] = Math.min(255, Math.max(0, g));
            data[i + 2] = Math.min(255, Math.max(0, b));
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
// LOGO CANVAS CON WARP FLUIDO
// ============================================

const logoCanvas = document.getElementById('logo-canvas');
const logoCtx = logoCanvas.getContext('2d');
const centerLogoDiv = document.getElementById('center-logo');
const logoImg = centerLogoDiv ? centerLogoDiv.querySelector('img') : null;
const glitchCodeEl = document.getElementById('glitch-code');

let logoLoaded = false;
let logoWidth = 300;
let logoHeight = 300;

// Configura il canvas del logo
function setupLogoCanvas() {
    // Le posizioni sono gestite dal CSS (inclusa la media query mobile)
    // Solo le dimensioni del canvas sono settate qui
    logoCanvas.width = 500;
    logoCanvas.height = 500;
}

setupLogoCanvas();

// Aspetta che il logo sia caricato
if (logoImg) {
    if (logoImg.complete) {
        logoLoaded = true;
        logoWidth = Math.min(logoImg.naturalWidth, 300);
        logoHeight = Math.min(logoImg.naturalHeight, 300);
    } else {
        logoImg.onload = () => {
            logoLoaded = true;
            logoWidth = Math.min(logoImg.naturalWidth, 300);
            logoHeight = Math.min(logoImg.naturalHeight, 300);
        };
    }
}

// Funzione di warp fluido con scanlines
function drawWarpedLogo() {
    if (!logoLoaded || !logoImg) return;
    
    const canvasCenterX = logoCanvas.width / 2;
    const canvasCenterY = logoCanvas.height / 2;
    
    // Posizione del mouse relativa al centro del canvas
    // Su mobile (<=768px) il logo è a 20vh, su desktop a 35%
    const isMobile = window.innerWidth <= 768;
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = isMobile ? window.innerHeight * 0.20 : window.innerHeight * 0.35;
    const relMouseX = mouseX - screenCenterX;
    const relMouseY = mouseY - screenCenterY;
    
    const dist = Math.sqrt(relMouseX * relMouseX + relMouseY * relMouseY);
    const maxDist = 400;
    
    logoCtx.clearRect(0, 0, logoCanvas.width, logoCanvas.height);
    
    const startX = canvasCenterX - logoWidth / 2;
    const startY = canvasCenterY - logoHeight / 2;
    
    // Disegna il logo riga per riga con offset fluido
    const numLines = logoHeight;
    
    for (let line = 0; line < numLines; line++) {
        // Posizione Y della linea nel canvas
        const destY = startY + line;
        
        // Centro Y della linea relativo al centro
        const lineRelY = destY - canvasCenterY;
        
        // Calcola la distanza di questo punto dal mouse
        const lineMouseDist = Math.sqrt(relMouseX * relMouseX + (relMouseY - lineRelY) * (relMouseY - lineRelY));
        
        // Forza di attrazione basata sulla distanza
        const pullRadius = 300;
        const pull = Math.max(0, 1 - lineMouseDist / pullRadius);
        const pullStrength = pull * pull * pull; // Curva cubica
        
        // Offset orizzontale - la linea viene tirata verso il mouse
        const offsetX = relMouseX * pullStrength * 0.5;
        
        // Stretch orizzontale fluido - nessun salto brusco
        // Lo stretch dipende dalla distanza normalizzata, non dal segno
        const normalizedX = relMouseX / (Math.abs(relMouseX) + 100); // Transizione morbida attraverso lo zero
        const stretchFactor = 1 + pullStrength * 0.25;
        
        // Offset verticale per effetto liquido
        const offsetY = (relMouseY - lineRelY) * pullStrength * 0.2;
        
        // Calcola posizione sorgente (con un leggero shift per effetto liquido)
        const srcY = line - offsetY;
        
        // Salta se fuori range
        if (srcY < 0 || srcY >= logoHeight - 1) continue;
        
        // Calcola la larghezza stretched
        const stretchedWidth = logoWidth * stretchFactor;
        const stretchedStartX = startX + offsetX + (logoWidth - stretchedWidth) / 2;
        
        // Disegna la singola riga
        logoCtx.drawImage(
            logoImg,
            0, srcY, logoWidth, 1,  // Source: una riga
            stretchedStartX, destY + offsetY, stretchedWidth, 1.5  // Dest: riga stretched e spostata
        );
    }
    
    // Effetto flicker leggero
    if (Math.random() > 0.95) {
        logoCtx.globalAlpha = 0.7 + Math.random() * 0.3;
    }
}

// Animazione del logo warpato
function animateLogo() {
    drawWarpedLogo();
    requestAnimationFrame(animateLogo);
}

animateLogo();

function distortElements() {
    // Testo glitch
    if (glitchCodeEl) {
        const textRect = glitchCodeEl.getBoundingClientRect();
        const textCenterX = textRect.left + textRect.width / 2;
        const textCenterY = textRect.top + textRect.height / 2;
        
        const dx = mouseX - textCenterX;
        const dy = mouseY - textCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 250 && mouseX > 0) {
            const intensity = (1 - dist / 250);
            const curve = intensity * intensity;
            const time = Date.now() * 0.01;
            
            const skewX = Math.sin(time * 1.5) * curve * 25;
            const translateX = Math.sin(time * 2) * curve * 20;
            
            glitchCodeEl.style.transform = `translateX(-50%) skewX(${skewX}deg) translateX(${translateX}px)`;
        } else {
            glitchCodeEl.style.transform = 'translateX(-50%)';
        }
    }
    
    requestAnimationFrame(distortElements);
}

distortElements();

// ============================================
// MOUSE E TOUCH - DIRETTO
// ============================================

document.addEventListener('mousemove', function(e) {
    const glitchCodeElement = document.getElementById('glitch-code');
    const isOverGlitch = glitchCodeElement && glitchCodeElement.matches(':hover');
    
    if (!isOverGlitch) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    } else {
        mouseX = -1000;
        mouseY = -1000;
    }
});

document.addEventListener('mouseleave', function() {
    mouseX = -1000;
    mouseY = -1000;
});

// ============================================
// SUPPORTO TOUCH
// ============================================

document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    }
}, { passive: true });

document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    }
}, { passive: true });

document.addEventListener('touchend', function() {
    mouseX = -1000;
    mouseY = -1000;
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
