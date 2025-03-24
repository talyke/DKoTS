import os
import multiprocessing

# Server socket
bind = "0.0.0.0:5000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = 'sync'
worker_connections = 1000
timeout = 30
keepalive = 2

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# Process naming
proc_name = 'Dark Knight Game'

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL
keyfile = None
certfile = None

# Server hooks
def on_starting(server):
    """Log when server starts."""
    server.log.info("Starting Dark Knight Game server")

def on_reload(server):
    """Log when server reloads."""
    server.log.info("Reloading Dark Knight Game server")

def on_exit(server):
    """Log when server exits."""
    server.log.info("Shutting down Dark Knight Game server")
