"""
WSGI Entry Point for Gunicorn & Production Application Servers.
"""

from app import app

if __name__ == "__main__":
    app.run()
