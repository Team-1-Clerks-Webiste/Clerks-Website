from fastapi import FastAPI, APIRouter
import sqlite3

app = FastAPI()
router = APIRouter()

def get_db():
    conn = sqlite3.connect('clerksdb.db')
    conn.row_factory = sqlite3.Row
    return conn

@router.get("/shoes")
def get_shoes():
    conn = get_db()
    shoes = conn.execute("SELECT * FROM shoes").fetchall()
    return [dict(shoe) for shoe in shoes]


app.include_router(router)