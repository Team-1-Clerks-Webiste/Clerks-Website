from fastapi import FastAPI, APIRouter
import sqlite3

app = FastAPI()
router = APIRouter()

def get_db():
    conn = sqlite3.connect('clerksdb.db')
    conn.row_factory = sqlite3.Row
    return conn

@router.get("/users")
def get_users():
    conn = get_db()
    users = conn.execute("SELECT username,password,email FROM users").fetchall()
    return [dict(user) for user in users]