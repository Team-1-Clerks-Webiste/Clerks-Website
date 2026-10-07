from fastapi import APIRouter
from pydantic import BaseModel
from backend.database import supabase
import hashlib

router = APIRouter()


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(req: RegisterRequest):
    # Check whether the email is already registered
    existing = (
        supabase
        .table("users")
        .select("id")
        .eq("email", req.email)
        .execute()
    )

    if existing.data:
        return {"error": "Email already registered"}

    # Hash the password before storing it
    hashed = hash_password(req.password)

    # Insert the new user into Supabase
    response = (
        supabase
        .table("users")
        .insert({
            "username": req.username,
            "email": req.email,
            "password": hashed
        })
        .execute()
    )

    if not response.data:
        return {"error": "Failed to register user"}

    return {"message": "User registered successfully"}


@router.post("/login")
def login(req: LoginRequest):
    # Find the user by email
    response = (
        supabase
        .table("users")
        .select("*")
        .eq("email", req.email)
        .execute()
    )

    if not response.data:
        return {"error": "Invalid email or password"}

    user = response.data[0]

    # Check the password
    if user["password"] != hash_password(req.password):
        return {"error": "Invalid email or password"}

    return {
        "message": "Login successful",
        "user_id": user["id"],
        "username": user["username"]
    }