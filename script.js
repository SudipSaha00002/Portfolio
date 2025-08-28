const navs = document.querySelectorAll('.nav-list li');
const cube = document.querySelector('.box');
const sections = document.querySelectorAll('.section');
const resumeLists = document.querySelectorAll('.resume-list');
const resumeBoxs = document.querySelectorAll('.resume-box');
const portfolioLists = document.querySelectorAll('.portfolio-list');
const portfolioBoxs = document.querySelectorAll('.portfolio-box');

// Particle Systems Manager
const particleSystems = new Map();

function createParticleSystem(section) {
    const canvas = section.querySelector('.particle-canvas');
    if (!canvas) {
        console.error('No particle-canvas found in section:', section);
        return { start: () => {}, stop: () => {} };
    }
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const updateCanvasSize = () => {
        canvas.width = section.offsetWidth;
        canvas.height = section.offsetHeight;
    };
    updateCanvasSize();

    const mouse = {
        x: undefined,
        y: undefined,
        radius: 150
    };

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = Math.random() * 5 + 1;
            this.cursorInfluenced = false;
        }

        draw() {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }

        update() {
            if (mouse.x !== undefined && mouse.y !== undefined) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    this.x += dx * 0.015;
                    this.y += dy * 0.015;
                } else {
                    this.x += this.speedX;
                    this.y += this.speedY;
                }
            } else {
                this.x += this.speedX;
                this.y += this.speedY;
            }

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

            this.draw();
        }
    }

    let particles = [];
    const init = () => {
        particles = [];
        const count = Math.min(50, Math.floor((canvas.width * canvas.height) / 10000));
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    };

    const connect = () => {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 80) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance/80})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
            if (mouse.x && mouse.y) {
                const dx = particles[a].x - mouse.x;
                const dy = particles[a].y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance/100})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    };

    const animate = () => {
        if (!section.classList.contains('active')) {
            cancelAnimationFrame(animationFrameId);
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => particle.update());
        connect();
        animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
        mouse.x = undefined;
        mouse.y = undefined;
    };

    const handleResize = () => {
        updateCanvasSize();
        init();
    };

    return {
        start: () => {
            init();
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseleave', handleMouseLeave);
            window.addEventListener('resize', handleResize);
            animate();
        },
        stop: () => {
            cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('resize', handleResize);
        }
    };
}

function initParticles() {
    sections.forEach((section, index) => {
        if (!particleSystems.has(index)) {
            const system = createParticleSystem(section);
            particleSystems.set(index, system);
        }
    });
}

navs.forEach((nav, idx) => {
    nav.addEventListener('click', () => {
        document.querySelector('.nav-list li.active').classList.remove('active');
        document.querySelector('.section.active').classList.remove('active');
        nav.classList.add('active');
        sections[idx].classList.add('active');
        cube.style.transform = `rotateY(${idx * -90}deg)`;
        particleSystems.forEach((system, key) => {
            if (key === idx) system.start();
            else system.stop();
        });
        const arrSecs = Array.from(sections).slice(1, -1);
        if (arrSecs.some(sec => sec.classList.contains('active'))) {
            sections[4].classList.add('action-contact');
        } else {
            sections[4].classList.remove('action-contact');
        }
    });
});

resumeLists.forEach((list, idx) => {
    list.addEventListener('click', () => {
        document.querySelector('.resume-list.active').classList.remove('active');
        document.querySelector('.resume-box.active').classList.remove('active');
        list.classList.add('active');
        resumeBoxs[idx].classList.add('active');
    });
});

portfolioLists.forEach((list, idx) => {
    list.addEventListener('click', () => {
        document.querySelector('.portfolio-list.active').classList.remove('active');
        document.querySelector('.portfolio-box.active').classList.remove('active');
        list.classList.add('active');
        portfolioBoxs[idx].classList.add('active');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('Sections found:', sections.length);
    initParticles();
    particleSystems.get(0)?.start();
});
