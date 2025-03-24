class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.lightLevel = 0;
        this.gameState = {
            lightLevel: 0,
            unlockedMemories: [],
            completedChallenges: [],
            currentStory: 0
        };

        this.setupCanvas();
        this.loadGameState();
        this.initializeEventListeners();
        this.storyManager = new StoryManager();
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.drawBackground();
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        const darkColor = `rgba(26, 26, 26, ${1 - this.lightLevel / 100})`;
        const lightColor = `rgba(240, 240, 240, ${this.lightLevel / 100})`;

        gradient.addColorStop(0, darkColor);
        gradient.addColorStop(1, lightColor);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    async loadGameState() {
        try {
            const response = await fetch('/load_progress');
            if (!response.ok) {
                throw new Error('Failed to load game state');
            }
            const data = await response.json();
            if (data && Object.keys(data).length > 0) {
                this.gameState = data;
                this.lightLevel = data.lightLevel || 0;
                this.storyManager.currentChapter = data.currentStory || 0;
                this.updateTransformation();
                console.log('Loaded game state:', this.gameState);
            }
        } catch (error) {
            console.error('Failed to load game state:', error);
        }
    }

    async saveGameState() {
        try {
            const state = {
                lightLevel: this.lightLevel,
                currentStory: this.storyManager.currentChapter,
                unlockedMemories: this.gameState.unlockedMemories,
                completedChallenges: this.gameState.completedChallenges
            };

            const response = await fetch('/save_progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(state)
            });

            if (!response.ok) {
                throw new Error('Failed to save game state');
            }

            console.log('Saved game state:', state);
        } catch (error) {
            console.error('Failed to save game state:', error);
        }
    }

    updateTransformation() {
        const progress = document.getElementById('transformationProgress');
        progress.style.width = `${this.lightLevel}%`;

        const progressText = document.getElementById('transformationText');
        if (!progressText) {
            const textDiv = document.createElement('div');
            textDiv.id = 'transformationText';
            textDiv.className = 'transformation-text';
            document.querySelector('.progress-container').appendChild(textDiv);
        }
        document.getElementById('transformationText').textContent = 
            `Transformation: ${Math.floor(this.lightLevel)}% Light`;

        document.body.dataset.lightLevel = Math.floor(this.lightLevel);
        this.drawBackground();
    }

    initializeEventListeners() {
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleInteraction(touch.clientX, touch.clientY);
    }

    handleClick(e) {
        this.handleInteraction(e.clientX, e.clientY);
    }

    handleInteraction(x, y) {
        // Start the story if it hasn't begun
        if (!this.storyManager.storyStarted) {
            this.storyManager.startStory();
        }
    }

    increaseLight(amount) {
        const oldLevel = this.lightLevel;
        this.lightLevel = Math.min(100, this.lightLevel + amount);

        if (oldLevel !== this.lightLevel) {
            const start = oldLevel;
            const end = this.lightLevel;
            const duration = 1000; 
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                this.lightLevel = start + (end - start) * progress;
                this.updateTransformation();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        }

        this.saveGameState();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});