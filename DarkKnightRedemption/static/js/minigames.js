class MiniGames {
    static async shadowDodge(canvas, ctx) {
        let gameActive = true;
        let score = 0;

        // Center the player vertically and horizontally
        let player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            size: 20
        };

        const shadows = [];
        const particleEffect = new ParticleEffect(canvas, ctx);
        const trail = new LightTrail(canvas, ctx);
        let frameCount = 0; 

        function spawnShadow() {
            if (shadows.length >= 5) return;

            // Spawn shadows in a circle around the player
            const angle = Math.random() * Math.PI * 2;
            const distance = canvas.height * 0.4; // Spawn radius
            shadows.push({
                x: canvas.width/2 + Math.cos(angle) * distance,
                y: canvas.height/2 + Math.sin(angle) * distance,
                speed: 2 + Math.random() * 2,
                size: 15 + Math.random() * 10,
                angle: Math.atan2(player.y - (canvas.height/2 + Math.sin(angle) * distance),
                                player.x - (canvas.width/2 + Math.cos(angle) * distance))
            });
        }

        const mouseMoveHandler = (e) => {
            const rect = canvas.getBoundingClientRect();
            player.x = e.clientX - rect.left;
            player.y = e.clientY - rect.top;
            trail.addPoint(player.x, player.y, false);
        };

        canvas.addEventListener('mousemove', mouseMoveHandler);

        function checkCollision(shadow) {
            const dx = shadow.x - player.x;
            const dy = shadow.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < (shadow.size + player.size);
        }

        function cleanup() {
            canvas.removeEventListener('mousemove', mouseMoveHandler);
            particleEffect.cleanup();
            trail.cleanup();
            clearInterval(spawnInterval);
        }

        function update() {
            if (!gameActive) return;

            frameCount++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            trail.update();
            trail.draw();

            // Create a temporary array to track shadows to remove
            const shadowsToRemove = [];

            shadows.forEach((shadow, index) => {
                // Move shadows toward player
                const speed = shadow.speed;
                shadow.x += Math.cos(shadow.angle) * speed;
                shadow.y += Math.sin(shadow.angle) * speed;

                ctx.shadowBlur = 15;
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.arc(shadow.x, shadow.y, shadow.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                if (frameCount % 30 === 0) {
                    particleEffect.emit(shadow.x, shadow.y, 1, false);
                }

                // Check for collision with player (game over)
                if (checkCollision(shadow)) {
                    particleEffect.emit(player.x, player.y, 10, false);
                    gameActive = false;
                    cleanup();
                    return;
                }

                // Remove shadows that are far from center
                const distanceFromCenter = Math.sqrt(
                    Math.pow(shadow.x - canvas.width/2, 2) + 
                    Math.pow(shadow.y - canvas.height/2, 2)
                );

                if (distanceFromCenter > canvas.height * 0.6) {
                    shadowsToRemove.push(index);
                    score++;
                    particleEffect.emit(shadow.x, shadow.y, 3, true);
                }
            });

            // Remove shadows after the loop
            for (let i = shadowsToRemove.length - 1; i >= 0; i--) {
                shadows.splice(shadowsToRemove[i], 1);
            }

            // Draw player
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(200, 200, 200, 0.5)';
            ctx.fillStyle = '#666';
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            particleEffect.update();
            particleEffect.draw();

            // Draw score with better visibility
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(10, 10, 120, 40);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.fillText(`Score: ${score}`, 20, 38);

            if (gameActive) {
                requestAnimationFrame(update);
            }
        }

        const spawnInterval = setInterval(() => {
            if (gameActive) spawnShadow();
        }, 2000);

        update();

        return new Promise((resolve) => {
            setTimeout(() => {
                gameActive = false;
                cleanup();
                resolve(score >= 5); // Success if player scored at least 5 points
            }, 30000); // Game lasts 30 seconds
        });
    }
    static async memoryMatch(canvas, ctx) {
        const symbols = ['☀️', '🌙', '⚔️', '🛡️', '✨', '🌟', '🔮', '⚡'];
        const cards = [];
        let flipped = [];
        let matched = [];
        let gameActive = true;
        const particleEffect = new ParticleEffect(canvas, ctx);

        for (let i = 0; i < 16; i++) {
            cards.push({
                symbol: symbols[Math.floor(i / 2)],
                x: (i % 4) * 100 + 50,
                y: Math.floor(i / 4) * 100 + 50,
                flipped: false,
                matched: false,
                rotation: 0,
                scale: 1
            });
        }

        function drawCard(card) {
            ctx.save();
            ctx.translate(card.x + 35, card.y + 35);
            ctx.rotate(card.rotation);
            ctx.scale(card.scale, card.scale);

            ctx.fillStyle = card.flipped ? '#fff' : '#444';
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(-35, -35, 70, 70);
            ctx.shadowBlur = 0;

            if (card.flipped) {
                ctx.fillStyle = '#000';
                ctx.font = '40px Arial';
                ctx.fillText(card.symbol, -20, 15);

                if (card.matched) {
                    ctx.strokeStyle = '#4CAF50';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(-35, -35, 70, 70);
                }
            }

            ctx.restore();
        }

        const clickHandler = (e) => {
            if (!gameActive) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            cards.forEach((card) => {
                if (x > card.x && x < card.x + 70 &&
                    y > card.y && y < card.y + 70 &&
                    !card.matched && !card.flipped && flipped.length < 2) {
                    card.flipped = true;
                    card.rotation = Math.PI;
                    card.scale = 1.2;
                    flipped.push(card);

                    if (flipped.length === 2) {
                        if (flipped[0].symbol === flipped[1].symbol) {
                            matched.push(...flipped);
                            flipped[0].matched = flipped[1].matched = true;
                            particleEffect.emit(flipped[0].x + 35, flipped[0].y + 35, 5, true);
                            particleEffect.emit(flipped[1].x + 35, flipped[1].y + 35, 5, true);
                            flipped = [];
                        } else {
                            setTimeout(() => {
                                flipped.forEach(c => {
                                    c.flipped = false;
                                    c.rotation = Math.PI;
                                });
                                flipped = [];
                            }, 1000);
                        }
                    }
                }
            });
        };

        canvas.addEventListener('click', clickHandler);

        function cleanup() {
            canvas.removeEventListener('click', clickHandler);
            particleEffect.cleanup();
            gameActive = false;
        }

        function update() {
            if (!gameActive) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            cards.forEach(card => {
                if (card.rotation > 0) {
                    card.rotation = Math.max(0, card.rotation - 0.1);
                }
                if (card.scale > 1) {
                    card.scale = Math.max(1, card.scale - 0.05);
                }
            });

            cards.forEach(drawCard);
            particleEffect.update();
            particleEffect.draw();

            requestAnimationFrame(update);
        }

        update();

        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (matched.length === cards.length) {
                    cleanup();
                    clearInterval(checkInterval);
                    resolve(true);
                }
            }, 500);
        });
    }
}