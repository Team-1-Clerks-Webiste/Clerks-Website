from fastapi import APIRouter
from pydantic import BaseModel
from backend.database import supabase

router = APIRouter()


class CartItem(BaseModel):
    user_id: int
    shoe_id: int
    quantity: int = 1


@router.get("/cart/{user_id}")
def get_cart(user_id: int):
    response = (
        supabase
        .table("cart")
        .select("id, shoe_id, quantity, shoes(name, price)")
        .eq("user_id", user_id)
        .execute()
    )

    cart_items = []

    for item in response.data:
        shoe = item.get("shoes") or {}

        cart_items.append({
            "id": item["id"],
            "shoe_id": item["shoe_id"],
            "quantity": item["quantity"],
            "name": shoe.get("name"),
            "price": shoe.get("price")
        })

    return cart_items


@router.post("/cart")
def add_to_cart(item: CartItem):
    response = (
        supabase
        .table("cart")
        .insert({
            "user_id": item.user_id,
            "shoe_id": item.shoe_id,
            "quantity": item.quantity
        })
        .execute()
    )

    if not response.data:
        return {"error": "Failed to add item to cart"}

    return {"message": "Item added to cart"}


@router.delete("/cart/{cart_id}")
def remove_from_cart(cart_id: int):
    response = (
        supabase
        .table("cart")
        .delete()
        .eq("id", cart_id)
        .execute()
    )

    if not response.data:
        return {"error": "Cart item not found"}

    return {"message": "Item removed from cart"}