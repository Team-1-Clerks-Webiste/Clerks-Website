from fastapi import APIRouter
import sqlite3

router = APIRouter()

def get_db():
    conn = sqlite3.connect('clerksdb.db')
    conn.row_factory = sqlite3.Row
    return conn

@router.get("/users")
def get_users():
    conn = get_db()
    users = conn.execute("SELECT id, username, email FROM users").fetchall()
    return [dict(user) for user in users]

# @router.get("/users/{email}")
# def get_user(email: str):
#     conn = get_db()
#     user = conn.execute("SELECT id, username, email FROM users WHERE email = ?", (email,)).fetchone()
#     if user is None:
#         return {"error": "User not found"}
#     return dict(user)

# @router.post("/users/{password}")
# def get_user(password: str):
#     conn = get_db()
#     user = conn.execute("SELECT id, username, email FROM users WHERE password = ?", (password,)).fetchone()
#     if user is None:
#         return {"error": "User not found"}
#     return dict(user)