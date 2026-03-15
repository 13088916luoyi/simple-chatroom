import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SECRET_KEY = os.environ.get('SECRET_KEY') or 'chatroom-secret-key-2024'

HOST = '0.0.0.0'
PORT = 5000
DEBUG = True

DATABASE_PATH = os.path.join(BASE_DIR, 'chatroom.db')
DATABASE_URL = os.environ.get('DATABASE_URL') or f'sqlite:///{DATABASE_PATH}'
