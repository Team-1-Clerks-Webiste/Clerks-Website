from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from backend.database import supabase
from backend.security import get_current_user, require_same_user

router = APIRouter()


class CartItem(BaseModel):
    # Ignored: the user comes from the login token, not the request body
    user_id: Optional[int] = None
    shoe_id: int
    quantity: int = 1


@router.get("/cart/{user_id}")
def get_cart(user_id: int, user: dict = Depends(get_current_user)):
    require_same_user(user_id, user)

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
def add_to_cart(item: CartItem, user: dict = Depends(get_current_user)):
    response = (
        supabase
        .table("cart")
        .insert({
            "user_id": user["id"],
            "shoe_id": item.shoe_id,
            "quantity": item.quantity
        })
        .execute()
    )

    if not response.data:
        return {"error": "Failed to add item to cart"}

    return {"message": "Item added to cart"}


@router.delete("/cart/{cart_id}")
def remove_from_cart(cart_id: int, user: dict = Depends(get_current_user)):
    # Check the cart item belongs to this user before deleting it
    existing = (
        supabase
        .table("cart")
        .select("user_id")
        .eq("id", cart_id)
        .execute()
    )

    if not existing.data:
        return {"error": "Cart item not found"}

    if existing.data[0]["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="You can only change your own cart")

    supabase.table("cart").delete().eq("id", cart_id).execute()

    return {"message": "Item removed from cart"}
