from fastapi import APIRouter
from pydantic import BaseModel
import sqlite3

router = APIRouter()


def get_db():
    conn = sqlite3.connect('clerksdb.db')
    conn.row_factory = sqlite3.Row
    return conn


class ShoeCreate(BaseModel):
    name: str
    price: int
    category: str
    style: str
    color: str
    material: str
    image: str = ""


@router.get("/shoes")
def get_shoes():
    conn = get_db()
    shoes = conn.execute("SELECT * FROM shoes").fetchall()
    conn.close()
    return [dict(shoe) for shoe in shoes]


@router.get("/shoes/{shoe_id}")
def get_shoe(shoe_id: int):
    conn = get_db()
    shoe = conn.execute("SELECT * FROM shoes WHERE id = ?", (shoe_id,)).fetchone()
    conn.close()
    if shoe is None:
        return {"error": "Shoe not found"}
    return dict(shoe)


@router.post("/shoes")
def create_shoe(shoe: ShoeCreate):
    conn = get_db()
    conn.execute(
        "INSERT INTO shoes (NAME, PRICE, CATEGORY, STYLE, COLOR, MATERIAL, IMAGE) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (shoe.name, shoe.price, shoe.category, shoe.style, shoe.color, shoe.material, shoe.image)
    )
    conn.commit()
    conn.close()
    return {"message": "Shoe created successfully"}


@router.delete("/shoes/{shoe_id}")
def delete_shoe(shoe_id: int):
    conn = get_db()
    result = conn.execute("DELETE FROM shoes WHERE id = ?", (shoe_id,))
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        return {"error": "Shoe not found"}
    return {"message": "Shoe deleted successfully"}
