# 🌙 Dark Knight of the Soul

A web-based narrative adventure game that explores moral complexity through an immersive interactive storytelling experience. Players navigate nuanced choices as the Dark Knight, experiencing a transformative journey while engaging with dynamic challenges and evolving game mechanics.

## ✨ Features

- **Interactive Storytelling**: Dynamic narrative system with branching choices that affect your journey
- **Visual Effects**: Stunning particle effects and light trails that respond to player actions
- **Mini-Games**: 
  - Shadow Dodge: Test your reflexes avoiding dark entities
  - Memory Match: Challenge your mind with mystical symbols
- **Progress System**: Track your transformation from darkness to light
- **Persistent Save States**: Continue your journey across sessions

## 🛠️ Tech Stack

- **Backend**: Flask + SQLAlchemy
- **Frontend**: HTML5 + JavaScript (Vanilla)
- **Database**: PostgreSQL
- **Authentication**: Flask-Login
- **Graphics**: Canvas API with custom particle system
- **Styling**: Bootstrap with custom dark theme

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- PostgreSQL
- Modern web browser with JavaScript enabled

### Installation

1. Clone the repository
2. Install Python dependencies:
```bash
pip install -r requirements.txt
```
3. Set up environment variables:
```bash
export DATABASE_URL="postgresql://..."
export SESSION_SECRET="your-secret-key"
```
4. Initialize the database:
```bash
flask db upgrade
```
5. Run the application:
```bash
python main.py
```

## 🎮 Game Mechanics

### Light/Dark Balance
- Every choice affects your character's alignment
- Visual feedback through dynamic lighting effects
- Unlock different paths based on your transformation level

### Mini-Games
- **Shadow Dodge**
  - Avoid dark entities
  - Collect light essence
  - Build up your transformation meter
  
- **Memory Match**
  - Match mystical symbols
  - Unlock forgotten memories
  - Gain insights into your past

## 🔧 Development

### Project Structure
```
├── static/
│   ├── css/
│   ├── js/
│   └── data/
├── templates/
├── app.py
├── models.py
└── main.py
```

### Key Components
- `app.py`: Core Flask application
- `models.py`: Database models
- `static/js/game.js`: Main game logic
- `static/js/effects.js`: Visual effects system
- `static/js/story.js`: Narrative management
- `static/data/story.json`: Story content and choices

## 📝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Particle effects system inspired by modern web graphics techniques
- Story structure influenced by classic moral choice-based narratives
- Gothic styling elements from medieval art and architecture
