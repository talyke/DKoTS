class ParticleEffect {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.maxParticles = 50; // Limit maximum particles
        this.lastEmitTime = 0; // For throttling
    }

    createParticle(x, y, isLight) {
        return {
            x,
            y,
            size: Math.random() * 3 + 2,
            speedX: (Math.random() - 0.5) * 3,
            speedY: (Math.random() - 0.5) * 3,
            life: 1,
            color: isLight ? 
                `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})` :
                `rgba(0, 0, 0, ${Math.random() * 0.5 + 0.5})`
        };
    }

    emit(x, y, count, isLight) {
        const now = performance.now();
        // Throttle particle emission to maximum 30 times per second
        if (now - this.lastEmitTime < 33) {
            return;
        }
        this.lastEmitTime = now;

        // Limit the number of particles created at once
        const actualCount = Math.min(count, 5);
        for (let i = 0; i < actualCount; i++) {
            if (this.particles.length < this.maxParticles) {
                this.particles.push(this.createParticle(x, y, isLight));
            }
        }
    }

    update() {
        this.particles.forEach((particle, index) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.life -= 0.02;

            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }

    draw() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    cleanup() {
        this.particles = [];
    }
}

class LightTrail {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.points = [];
        this.maxPoints = 50;
        this.lastAddTime = 0;
    }

    addPoint(x, y, isLight) {
        const now = performance.now();
        // Throttle point addition to maximum 60 times per second
        if (now - this.lastAddTime < 16) {
            return;
        }
        this.lastAddTime = now;

        this.points.push({
            x,
            y,
            life: 1,
            color: isLight ? 
                `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.2})` :
                `rgba(0, 0, 0, ${Math.random() * 0.3 + 0.2})`
        });

        if (this.points.length > this.maxPoints) {
            this.points.shift();
        }
    }

    update() {
        this.points.forEach((point, index) => {
            point.life -= 0.02;
            if (point.life <= 0) {
                this.points.splice(index, 1);
            }
        });
    }

    draw() {
        if (this.points.length < 2) return;

        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 1; i < this.points.length; i++) {
            const curr = this.points[i];
            const prev = this.points[i - 1];
            const xc = (prev.x + curr.x) / 2;
            const yc = (prev.y + curr.y) / 2;

            this.ctx.quadraticCurveTo(prev.x, prev.y, xc, yc);
            this.ctx.strokeStyle = curr.color;
            this.ctx.lineWidth = curr.life * 3;
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(xc, yc);
        }
    }

    cleanup() {
        this.points = [];
    }
}