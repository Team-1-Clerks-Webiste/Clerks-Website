import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
TOKEN_LIFETIME = timedelta(hours=2)
ADMIN_EMAILS = {
    e.strip().lower() for e in os.getenv("ADMIN_EMAILS", "").split(",") if e.strip()
}

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET environment variable is missing")

# auto_error=False so a missing header gives our 401 instead of FastAPI's 403
bearer = HTTPBearer(auto_error=False)


def create_token(user: dict) -> str:
    payload = {
        "sub": str(user["id"]),
        "username": user["username"],
        "admin": user["email"].lower() in ADMIN_EMAILS,
        "exp": datetime.now(timezone.utc) + TOKEN_LIFETIME,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not logged in")

    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired, please log in again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    return {"id": int(payload["sub"]), "username": payload["username"], "admin": payload["admin"]}


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if not user["admin"]:
        raise HTTPException(status_code=403, detail="Admins only")
    return user


def require_same_user(user_id: int, user: dict) -> None:
    """Stop users reading or changing another user's data."""
    if user_id != user["id"]:
        raise HTTPException(status_code=403, detail="You can only access your own account")
