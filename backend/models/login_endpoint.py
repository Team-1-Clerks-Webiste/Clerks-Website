from fastapi import APIRouter
from pydantic import BaseModel
import sqlite3
import hashlib

router = APIRouter()


def get_db():
    conn = sqlite3.connect('clerksdb.db')
    conn.row_factory = sqlite3.Row
    return conn


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(req: RegisterRequest):
    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE email = ?", (req.email,)).fetchone()
    if existing:
        conn.close()
        return {"error": "Email already registered"}
    hashed = hash_password(req.password)
    conn.execute(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        (req.username, req.email, hashed)
    )
    conn.commit()
    conn.close()
    return {"message": "User registered successfully"}


@router.post("/login")
def login(req: LoginRequest):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (req.email,)).fetchone()
    conn.close()
    if user is None:
        return {"error": "Invalid email or password"}
    if user["password"] != hash_password(req.password):
        return {"error": "Invalid email or password"}
    return {"message": "Login successful", "user_id": user["id"], "username": user["username"]}
