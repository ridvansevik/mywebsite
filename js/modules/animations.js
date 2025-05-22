// js/modules/animations.js
import { CLASS_DARK_MODE, PARTICLE_COUNT_DESKTOP, PARTICLE_COUNT_MOBILE, RESIZE_DEBOUNCE_MS } from './constants.js';

const activeTxtRotateInstances = new Map();

export class TxtRotate {
    constructor(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.isDeleting = false;
        this.timeoutId = null;
        // Elemanın içeriğini başlangıçta temizle, böylece eski "wrap" span'leri kalmaz.
        this.el.innerHTML = '<span class="wrap"></span>';
        this.tick();
    }

    tick() {
        if (!activeTxtRotateInstances.has(this.el) || activeTxtRotateInstances.get(this.el) !== this) {
            return; // Bu örnek artık aktif değilse dur.
        }

        const i = this.loopNum % this.toRotate.length;
        const fullTxt = this.toRotate[i];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }
        
        // .wrap span'ını bul ve içeriğini güncelle
        const wrapSpan = this.el.querySelector('.wrap');
        if (wrapSpan) {
            wrapSpan.textContent = this.txt;
        } else {
            // Eğer .wrap span yoksa (beklenmedik bir durum), doğrudan elemanın içeriğini ayarla
            // ancak bu, TxtRotate'in stilini bozabilir.
            this.el.innerHTML = `<span class="wrap">${this.txt}</span>`;
        }
        
        let delta = 200 - Math.random() * 100;
        if (this.isDeleting) {
            delta /= 2;
        }

        if (!this.isDeleting && this.txt === fullTxt) {
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.loopNum++;
            delta = 500;
        }
        this.timeoutId = setTimeout(() => this.tick(), delta);
    }

    stop() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        // İsteğe bağlı: Durdurulduğunda elemanın içeriğini temizleyebilirsiniz.
        // if (this.el) this.el.innerHTML = '';
    }
}

export function initTxtRotate(specificElement = null) {
    const elements = specificElement ? [specificElement] : document.querySelectorAll('.txt-rotate');
    
    elements.forEach(el => {
        if (activeTxtRotateInstances.has(el)) {
            activeTxtRotateInstances.get(el).stop();
            activeTxtRotateInstances.delete(el);
        }

        const toRotateData = el.getAttribute('data-rotate');
        if (!toRotateData || toRotateData.trim() === "" || toRotateData.trim() === "[]") { // Boş veya geçersiz veri kontrolü
            console.warn("TxtRotate: data-rotate attribute is missing or empty for element:", el);
            el.innerHTML = ''; // Veri yoksa içeriği temizle
            return;
        }
        
        const period = el.getAttribute('data-period') || 2000;
        
        try {
            const toRotate = JSON.parse(toRotateData);
            if (toRotate && toRotate.length > 0) {
                const newInstance = new TxtRotate(el, toRotate, period);
                activeTxtRotateInstances.set(el, newInstance);
            } else {
                console.warn("TxtRotate: Parsed data-rotate is empty for element:", el);
                el.innerHTML = ''; // Boş dizi ise içeriği temizle
            }
        } catch (error) {
            console.error("Error initializing TxtRotate for element:", el, ". Data:", toRotateData, "Error:", error);
            el.innerHTML = ''; // Hata durumunda içeriği temizle
        }
    });
}

// --- Basic Hero Canvas Animation ---
let animationFrameId = null; // Keep track of animation frame
export function setupHeroCanvas() {
    const heroCanvas = document.getElementById('heroCanvas');
    if (!heroCanvas) return;

    const ctx = heroCanvas.getContext('2d');
    let particles = [];
    let canvasWidth, canvasHeight;

    function resizeCanvasAndParticles() {
        canvasWidth = heroCanvas.width = heroCanvas.offsetWidth;
        canvasHeight = heroCanvas.height = heroCanvas.offsetHeight;
        initCanvasParticles();
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvasWidth;
            this.y = Math.random() * canvasHeight;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.updateColor();
        }
        updateColor() {
            this.color = document.body.classList.contains(CLASS_DARK_MODE) ? 'rgba(255, 255, 255, 0.2)' : 'rgba(50, 50, 50, 0.15)';
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvasWidth) this.speedX *= -1;
            if (this.y < 0 || this.y > canvasHeight) this.speedY *= -1;
        }
        draw() {
            if (!ctx) return;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initCanvasParticles() {
        particles = [];
        let numberOfParticles = canvasWidth > 768 ? PARTICLE_COUNT_DESKTOP : PARTICLE_COUNT_MOBILE;
        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    }

    function animateCanvasParticles() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        animationFrameId = requestAnimationFrame(animateCanvasParticles);
    }

    // Initial setup
    resizeCanvasAndParticles();
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    animateCanvasParticles();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Re-cancel before re-setup to prevent multiple animation loops
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            resizeCanvasAndParticles(); // This calls initCanvasParticles
            animateCanvasParticles(); // Restart animation
        }, RESIZE_DEBOUNCE_MS);
    });

    const themeObserver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                particles.forEach(p => p.updateColor());
                break;
            }
        }
    });
    if (document.body) {
        themeObserver.observe(document.body, { attributes: true });
    }
}