from fastapi import APIRouter
from pydantic import BaseModel
from backend.database import supabase

router = APIRouter()


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
    response = (
        supabase
        .table("shoes")
        .select("*")
        .execute()
    )

    return response.data


@router.get("/shoes/{shoe_id}")
def get_shoe(shoe_id: int):
    response = (
        supabase
        .table("shoes")
        .select("*")
        .eq("id", shoe_id)
        .execute()
    )

    if not response.data:
        return {"error": "Shoe not found"}

    return response.data[0]


@router.post("/shoes")
def create_shoe(shoe: ShoeCreate):
    response = (
        supabase
        .table("shoes")
        .insert({
            "name": shoe.name,
            "price": shoe.price,
            "category": shoe.category,
            "style": shoe.style,
            "color": shoe.color,
            "material": shoe.material,
            "image": shoe.image
        })
        .execute()
    )

    if not response.data:
        return {"error": "Failed to create shoe"}

    return {"message": "Shoe created successfully"}


@router.delete("/shoes/{shoe_id}")
def delete_shoe(shoe_id: int):
    response = (
        supabase
        .table("shoes")
        .delete()
        .eq("id", shoe_id)
        .execute()
    )

    if not response.data:
        return {"error": "Shoe not found"}

    return {"message": "Shoe deleted successfully"}