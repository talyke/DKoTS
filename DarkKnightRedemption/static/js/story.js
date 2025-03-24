class StoryManager {
    constructor() {
        this.storyDialog = document.getElementById('storyDialog');
        this.storyText = document.getElementById('storyText');
        this.choiceButtons = document.getElementById('choiceButtons');
        this.currentChapter = 0;
        this.storyStarted = false;
        this.storyData = null;

        console.log('StoryManager initialized, MiniGames available:', typeof MiniGames);

        this.loadStory().then(() => {
            console.log('Story data loaded successfully');
        }).catch(error => {
            console.error('Error loading story:', error);
        });
    }

    async loadStory() {
        try {
            const response = await fetch('/static/data/story.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.storyData = data.chapters;
            console.log('Loaded story data:', this.storyData);
        } catch (error) {
            console.error('Failed to load story:', error);
            this.storyData = [];
        }
    }

    startStory() {
        console.log('Attempting to start story', { started: this.storyStarted, data: this.storyData });
        if (!this.storyStarted && this.storyData) {
            this.storyStarted = true;
            this.continueStory();
        }
    }

    async showDialog(text, choices) {
        console.log('Showing dialog:', { text, choices });
        this.storyText.textContent = text;
        this.choiceButtons.innerHTML = '';
        this.storyDialog.classList.remove('d-none');

        // Add choices but keep them hidden initially
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'btn choice-button';
            button.textContent = choice.text;
            button.addEventListener('click', () => this.makeChoice(choice));
            this.choiceButtons.appendChild(button);
        });

        // Reset states
        this.storyText.style.opacity = '0';
        this.storyText.style.display = 'block';
        this.choiceButtons.style.display = 'none';
        this.choiceButtons.classList.remove('visible');

        // Show text with animation
        await new Promise(resolve => setTimeout(resolve, 100));
        this.storyText.classList.add('visible');

        // Wait for click to start fade out
        await new Promise(resolve => {
            const clickHandler = () => {
                this.storyText.removeEventListener('click', clickHandler);
                this.storyText.classList.add('fade-out');
                setTimeout(resolve, 500); // Wait for fade out animation
            };
            this.storyText.addEventListener('click', clickHandler);
        });

        // Hide text and show choices with animation
        this.storyText.style.display = 'none';
        this.choiceButtons.style.display = 'flex';

        // Small delay before showing choices
        await new Promise(resolve => setTimeout(resolve, 100));
        this.choiceButtons.classList.add('visible');
    }

    hideDialog() {
        this.storyDialog.classList.add('d-none');
        this.storyText.classList.remove('visible', 'fade-out');
        this.choiceButtons.classList.remove('visible');
        this.storyText.style.display = 'block';
        this.choiceButtons.style.display = 'none';
    }

    async makeChoice(choice) {
        console.log('Making choice:', choice);
        this.hideDialog();

        if (choice.lightChange) {
            window.game.increaseLight(choice.lightChange);
        }

        if (choice.minigame) {
            console.log('Starting minigame:', choice.minigame, 'MiniGames available:', typeof MiniGames);
            const success = await this.startMinigame(choice.minigame);
            if (success) {
                window.game.increaseLight(5);
            }
        }

        if (choice.nextChapter !== undefined) {
            this.currentChapter = choice.nextChapter;
            this.continueStory();
        }
    }

    async startMinigame(gameName) {
        console.log('Starting minigame:', gameName);
        if (typeof MiniGames === 'undefined') {
            console.error('MiniGames class is not defined!');
            return false;
        }

        try {
            switch (gameName) {
                case 'shadowDodge':
                    return await MiniGames.shadowDodge(
                        window.game.canvas,
                        window.game.ctx
                    );
                case 'memoryMatch':
                    return await MiniGames.memoryMatch(
                        window.game.canvas,
                        window.game.ctx
                    );
                default:
                    console.error('Unknown minigame:', gameName);
                    return false;
            }
        } catch (error) {
            console.error('Error in minigame:', error);
            return false;
        }
    }

    continueStory() {
        console.log('Continuing story at chapter:', this.currentChapter);
        const chapter = this.storyData[this.currentChapter];
        if (chapter) {
            this.showDialog(chapter.text, chapter.choices);
        }
    }
}