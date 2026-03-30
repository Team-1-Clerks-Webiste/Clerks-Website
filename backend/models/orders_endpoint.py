from fastapi import APIRouter
import sqlite3

router = APIRouter()


def get_db():
    conn = sqlite3.connect('clerksdb.db')
    conn.row_factory = sqlite3.Row
    return conn


@router.post("/orders/{user_id}")
def place_order(user_id: int):
    conn = get_db()
    cart_items = conn.execute(
        """SELECT cart.shoe_id, cart.quantity, shoes.PRICE as price
           FROM cart JOIN shoes ON cart.shoe_id = shoes.ID
           WHERE cart.user_id = ?""",
        (user_id,)
    ).fetchall()

    if not cart_items:
        conn.close()
        return {"error": "Cart is empty"}

    total_price = sum(item["price"] * item["quantity"] for item in cart_items)

    cursor = conn.execute(
        "INSERT INTO orders (user_id, total_price) VALUES (?, ?)",
        (user_id, total_price)
    )
    order_id = cursor.lastrowid

    for item in cart_items:
        conn.execute(
            "INSERT INTO order_items (order_id, shoe_id, quantity, price) VALUES (?, ?, ?, ?)",
            (order_id, item["shoe_id"], item["quantity"], item["price"])
        )

    conn.execute("DELETE FROM cart WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()
    return {"message": "Order placed successfully", "order_id": order_id, "total_price": total_price}


@router.get("/orders/{user_id}")
def get_orders(user_id: int):
    conn = get_db()
    orders = conn.execute(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,)
    ).fetchall()

    result = []
    for order in orders:
        items = conn.execute(
            """SELECT order_items.*, shoes.NAME as name
               FROM order_items JOIN shoes ON order_items.shoe_id = shoes.ID
               WHERE order_items.order_id = ?""",
            (order["id"],)
        ).fetchall()
        result.append({
            "id": order["id"],
            "total_price": order["total_price"],
            "created_at": order["created_at"],
            "items": [dict(item) for item in items]
        })

    conn.close()
    return result
