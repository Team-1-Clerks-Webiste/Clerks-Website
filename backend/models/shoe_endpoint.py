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

@router.get("/shoes/{shoe_id}")
def get_shoe(shoe_id: int):
    conn = get_db()
    shoe = conn.execute("SELECT * FROM shoes WHERE id = ?", (shoe_id,)).fetchone()
    if shoe is None:
        return {"error": "Shoe not found"}
    return dict(shoe)

app.include_router(router)