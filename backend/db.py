from dotenv import load_dotenv
import sqlite3
import os

load_dotenv()
DB_PATH = os.getenv("DATABASE_URL") or "test.db"
DB_TIMEOUT = int(os.getenv("DB_TIMEOUT", 5))

def init_db():
    try:
        with sqlite3.connect(DB_PATH, timeout=DB_TIMEOUT) as conn:
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
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                url TEXT NOT NULL,
                score REAL,
                threats TEXT,
                scanned_at TEXT,
                UNIQUE(username, url, scanned_at),
                FOREIGN KEY (username) REFERENCES users(username)
            )
        """)
            conn.commit()
    except sqlite3.OperationalError as e:
        print(f"[DB ERROR] Failed to initialize DB: {e}")
        raise

def create_user(username: str, password: str) -> bool:
    """Add new user's info to DB. If user already exists, return False"""
    try:
        with sqlite3.connect(DB_PATH, timeout=DB_TIMEOUT) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO users (username, password)
                VALUES (?, ?)
            """, (username, password))
            conn.commit()
        return True
    except sqlite3.IntegrityError:
        # Username already exists (username, password pair is primary key)
        return False
    except sqlite3.OperationalError as e:
        print(f"[DB ERROR] Failed to create user: {e}")
        raise

def check_user_credentials(username: str, password: str) -> bool:
    """Returns True if the given username/password pair exists"""
    try:
        with sqlite3.connect(DB_PATH, timeout=DB_TIMEOUT) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 1 FROM users WHERE username = ? AND password = ?
            """, (username, password))
            return cursor.fetchone() is not None
    except sqlite3.OperationalError as e:
        print(f"[DB ERROR] Failed to check credentials: {e}")
        raise

def insert_scan_db(username: str, url: str, score: float, threats: list[str], scanned_at: str):
    """Log scan result for the user"""
    threat_string = ", ".join(threats)
    try:
        with sqlite3.connect(DB_PATH, timeout=DB_TIMEOUT) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO scans (username, url, score, threats, scanned_at) 
                VALUES (?, ?, ?, ?, ?)
            """, (username, url, score, threat_string, scanned_at))
            conn.commit()
    except sqlite3.OperationalError as e:
        print(f"[DB ERROR] Failed to insert scan: {e}")
        raise

def scan_history(username: str):
    """Return scan history for a specific user."""
    try:
        with sqlite3.connect(DB_PATH, timeout=DB_TIMEOUT) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT username, url, score, threats, scanned_at 
                FROM scans 
                WHERE username = ?
                ORDER BY scanned_at DESC 
                LIMIT 50
            """, (username,))
            rows = cursor.fetchall()
        return [
            {
                "url": r[1],
                "score": r[2],
                "threats": r[3].split(", "),
                "timestamp": r[4]
            }
            for r in rows
        ]
    except sqlite3.OperationalError as e:
        print(f"[DB ERROR] Failed to retrieve history: {e}")
        raise
