from dotenv import load_dotenv

import sqlite3
import os

load_dotenv()
DB_PATH = os.getenv("DATABASE_URL") or "test.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Table 1: User Login Info
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            PRIMARY KEY (username, password)
        )
    """)

    # Table 2: URL Scans linked to user
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            username TEXT NOT NULL,
            url TEXT NOT NULL,
            score REAL,
            threats TEXT,
            scanned_at TEXT,
            FOREIGN KEY (username) REFERENCES users(username)
        )
    """)
    conn.commit()
    conn.close()

def create_user(username: str, password: str) -> bool:
    """Add new user's info to DB. If user is already exist, return false"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (username, password)
            VALUES (?, ?)
        """, (username, password))
        conn.commit()
        conn.close()
        return True
    except sqlite3.IntegrityError:
        # Username already exists (username, password pair is primary key)
        return False
    
def check_user_credentials(username: str, password: str) -> bool:
    """Returns True if the given username/password pair exists in the database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 1 FROM users WHERE username = ? AND password = ?
    """, (username, password))
    
    result = cursor.fetchone()
    conn.close()
    return result is not None

def insert_scan_db(username: str, url: str, score: float, threats: list[str], scanned_at:str):
    """Log scan result for the user"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    threat_string = ", ".join(threats)

    cursor.execute("""
        INSERT INTO scans (username, url, score, threats, scanned_at) 
        VALUES (?, ?, ?, ?, ?)
    """, (username, url, score, threat_string, scanned_at))
    conn.commit()
    conn.close()

def scan_history(username: str):
    """Return scan history for a specific user."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT username, url, score, threats, scanned_at 
        FROM scans 
        WHERE username = ?
        ORDER BY scanned_at DESC 
        LIMIT 50
    """, (username,))
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "url": r[1],
            "score": r[2],
            "threats": r[3].split(", "),
            "timestamp": r[4]
        }
        for r in rows
    ]