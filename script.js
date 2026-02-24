// ============================================
// EFFETTO RUMORE GRANULARE TV - INTENSO
// ============================================

const noiseCanvas = document.getElementById('noise');
const noiseCtx = noiseCanvas.getContext('2d');
const psychedelicCanvas = document.getElementById('psychedelic');
const psychedelicCtx = psychedelicCanvas.getContext('2d');

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
            const i = (y * width + x) * 4;
            
            // Rumore base costante
            let value = Math.random() * 180 + 40;
            
            // Applica variazione da onda orizzontale
            value = value * (0.85 + waveDistortion * 0.15);
            
            // Aggiungi effetto banda scorrevole
            value = value + bandEffect * 80;
            
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
// EFFETTO SCIA DISTURBO - PIÙ GRANDE
// ============================================

const trailsContainer = document.getElementById('distortion-trails');
const interferenceBands = document.getElementById('interference-bands');
let lastMouseX = 0;
let lastMouseY = 0;
let lastTrailTime = 0;

function createDistortionTrail(x, y, velocityX, velocityY) {
    const trail = document.createElement('div');
    trail.className = 'distortion-trail';
    
    // Dimensioni grandi
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    const width = Math.min(800, Math.max(200, speed * 8));
    const height = Math.random() * 30 + 15;
    
    const offsetY = (Math.random() - 0.5) * 80;
    
    trail.style.left = x + 'px';
    trail.style.top = (y + offsetY) + 'px';
    trail.style.width = width + 'px';
    trail.style.height = height + 'px';
    
    // Bianco e nero
    const brightness = Math.random() * 40 + 60;
    trail.style.background = 'linear-gradient(90deg, transparent, rgba(' + brightness + ',' + brightness + ',' + brightness + ', 0.5), rgba(255, 255, 255, 0.4), rgba(' + brightness + ',' + brightness + ',' + brightness + ', 0.3), transparent)';
    
    // Glitch casuale
    if (Math.random() > 0.3) {
        const glitchOffset = (Math.random() - 0.5) * 40;
        trail.style.transform = 'translateX(-50%) translateY(-50%) skewX(' + glitchOffset + 'deg)';
    }
    
    trailsContainer.appendChild(trail);
    
    setTimeout(function() {
        trail.remove();
    }, 1200);
}

function createInterferenceBand(y) {
    const band = document.createElement('div');
    band.className = 'interference-band';
    band.style.top = y + 'px';
    band.style.height = (Math.random() * 100 + 50) + 'px';
    
    const gray = Math.random() * 100 + 155;
    band.style.background = 'linear-gradient(180deg, transparent, rgba(' + gray + ',' + gray + ',' + gray + ', 0.15), rgba(255, 255, 255, 0.1), transparent)';
    
    interferenceBands.appendChild(band);
    
    setTimeout(function() {
        band.remove();
    }, 500);
}

function createGlitchBlock(x, y) {
    const block = document.createElement('div');
    block.className = 'glitch-block';
    
    const width = Math.random() * 200 + 50;
    const height = Math.random() * 30 + 10;
    
    block.style.left = x + 'px';
    block.style.top = y + 'px';
    block.style.width = width + 'px';
    block.style.height = height + 'px';
    
    const gray = Math.random() * 155 + 100;
    block.style.background = 'rgba(' + gray + ',' + gray + ',' + gray + ', 0.5)';
    
    trailsContainer.appendChild(block);
    
    setTimeout(function() {
        block.remove();
    }, 300);
}

function createMultipleTrails(x, y, velocityX, velocityY) {
    const trailCount = Math.min(8, Math.floor(Math.abs(velocityX) / 8) + 2);
    
    for (let i = 0; i < trailCount; i++) {
        setTimeout(function() {
            createDistortionTrail(x, y, velocityX, velocityY);
            
            // Aggiungi bande di interferenza casuali
            if (Math.random() > 0.6) {
                createInterferenceBand(y + (Math.random() - 0.5) * 200);
            }
            
            // Aggiungi blocchi glitch casuali
            if (Math.random() > 0.7) {
                createGlitchBlock(x + (Math.random() - 0.5) * 300, y + (Math.random() - 0.5) * 100);
            }
        }, i * 15);
    }
}

document.addEventListener('mousemove', function(e) {
    const currentTime = Date.now();
    
    const velocityX = e.clientX - lastMouseX;
    const velocityY = e.clientY - lastMouseY;
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    
    // Reattivo ma senza cambiare intensità rumore
    if (speed > 5 && currentTime - lastTrailTime > 40) {
        createMultipleTrails(e.clientX, e.clientY, velocityX, velocityY);
        lastTrailTime = currentTime;
        // Niente modifica al rumore - rimane costante
    }
    
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

// ============================================
// SUPPORTO TOUCH PER DISPOSITIVI MOBILI
// ============================================

let lastTouchX = 0;
let lastTouchY = 0;
let lastTouchTime = 0;
let activeTrails = 0;
const MAX_ACTIVE_TRAILS = 15; // Limita elementi DOM attivi

document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 0) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
    }
}, { passive: true });

document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        const currentTime = Date.now();
        
        const velocityX = touch.clientX - lastTouchX;
        const velocityY = touch.clientY - lastTouchY;
        const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        
        // Throttle più aggressivo su mobile (100ms invece di 40ms)
        // e limita elementi attivi per evitare freeze
        if (speed > 8 && currentTime - lastTouchTime > 100 && activeTrails < MAX_ACTIVE_TRAILS) {
            createMobileTrail(touch.clientX, touch.clientY, velocityX, velocityY);
            lastTouchTime = currentTime;
        }
        
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
    }
}, { passive: true });

// Versione semplificata per mobile (meno elementi DOM)
function createMobileTrail(x, y, velocityX, velocityY) {
    activeTrails++;
    
    const trail = document.createElement('div');
    trail.className = 'distortion-trail';
    
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    const width = Math.min(400, Math.max(100, speed * 4));
    const height = Math.random() * 20 + 10;
    
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    trail.style.width = width + 'px';
    trail.style.height = height + 'px';
    
    const brightness = Math.random() * 40 + 60;
    trail.style.background = 'linear-gradient(90deg, transparent, rgba(' + brightness + ',' + brightness + ',' + brightness + ', 0.4), transparent)';
    
    trailsContainer.appendChild(trail);
    
    setTimeout(function() {
        trail.remove();
        activeTrails--;
    }, 600);
}

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
