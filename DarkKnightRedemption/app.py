import os
import logging
from flask import Flask, render_template, jsonify, session, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from sqlalchemy.orm import DeclarativeBase
from werkzeug.security import generate_password_hash

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__, static_folder='static', static_url_path='/static')
app.secret_key = os.environ.get("SESSION_SECRET")

# Configure SQLAlchemy
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///game.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
db.init_app(app)

# Configure Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['POST'])
def register():
    try:
        from models import User
        data = request.get_json()

        if User.query.filter_by(username=data['username']).first():
            return jsonify({"error": "Username already exists"}), 400

        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email already exists"}), 400

        user = User(
            username=data['username'],
            email=data['email']
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()

        login_user(user)
        return jsonify({"message": "Registration successful"})
    except Exception as e:
        logging.error(f"Registration error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['GET', 'POST'])
def login():
    try:
        if request.method == 'GET':
            # Return a JSON response for GET requests
            return jsonify({"message": "Please log in"}), 401

        from models import User
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()

        if user and user.check_password(data['password']):
            login_user(user)
            return jsonify({"message": "Login successful"})

        return jsonify({"error": "Invalid username or password"}), 401
    except Exception as e:
        logging.error(f"Login error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logout successful"})

@app.route('/save_progress', methods=['POST'])
@login_required
def save_progress():
    try:
        from models import GameState
        progress = request.get_json()
        logging.debug(f"Saving progress for user {current_user.id}: {progress}")

        game_state = GameState.query.filter_by(user_id=current_user.id).first()
        if not game_state:
            game_state = GameState(user_id=current_user.id)
            db.session.add(game_state)
            logging.debug(f"Created new game state for user {current_user.id}")

        game_state.light_level = progress.get('lightLevel', 0)
        game_state.current_chapter = progress.get('currentStory', 0)
        game_state.unlocked_memories = progress.get('unlockedMemories', [])
        game_state.completed_challenges = progress.get('completedChallenges', [])

        db.session.commit()
        logging.debug(f"Successfully saved progress for user {current_user.id}")
        return jsonify({"status": "success"})
    except Exception as e:
        logging.error(f"Error saving progress: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/load_progress')
@login_required
def load_progress():
    try:
        from models import GameState
        logging.debug(f"Loading progress for user {current_user.id}")

        game_state = GameState.query.filter_by(user_id=current_user.id).first()
        if game_state:
            data = {
                "lightLevel": game_state.light_level,
                "currentStory": game_state.current_chapter,
                "unlockedMemories": game_state.unlocked_memories or [],
                "completedChallenges": game_state.completed_challenges or []
            }
            logging.debug(f"Loaded game state: {data}")
            return jsonify(data)

        logging.debug(f"No existing game state found for user {current_user.id}")
        return jsonify({})
    except Exception as e:
        logging.error(f"Error loading progress: {str(e)}")
        return jsonify({"error": str(e)}), 500

with app.app_context():
    import models
    db.create_all()