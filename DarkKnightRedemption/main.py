from app import app

if __name__ == "__main__":
    # This is only used for local development
    # For production, gunicorn will import the app directly
    app.run(host="0.0.0.0", port=5000, debug=True)