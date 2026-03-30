from fastapi import APIRouter
from pydantic import BaseModel
import sqlite3

router = APIRouter()


def get_db():
    conn = sqlite3.connect('clerksdb.db')
    conn.row_factory = sqlite3.Row
    return conn


class CartItem(BaseModel):
    user_id: int
    shoe_id: int
    quantity: int = 1


@router.get("/cart/{user_id}")
def get_cart(user_id: int):
    conn = get_db()
    items = conn.execute(
        """SELECT cart.id, cart.shoe_id, cart.quantity, shoes.NAME as name, shoes.PRICE as price
           FROM cart JOIN shoes ON cart.shoe_id = shoes.ID
           WHERE cart.user_id = ?""",
        (user_id,)
    ).fetchall()
    conn.close()
    return [dict(item) for item in items]


@router.post("/cart")
def add_to_cart(item: CartItem):
    conn = get_db()
    conn.execute(
        "INSERT INTO cart (user_id, shoe_id, quantity) VALUES (?, ?, ?)",
        (item.user_id, item.shoe_id, item.quantity)
    )
    conn.commit()
    conn.close()
    return {"message": "Item added to cart"}


@router.delete("/cart/{cart_id}")
def remove_from_cart(cart_id: int):
    conn = get_db()
    result = conn.execute("DELETE FROM cart WHERE id = ?", (cart_id,))
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        return {"error": "Cart item not found"}
    return {"message": "Item removed from cart"}
