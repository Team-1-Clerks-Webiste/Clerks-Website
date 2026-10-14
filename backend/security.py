import os
import time
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


MIN_PASSWORD_LENGTH = 8


def password_problems(password: str) -> list:
    """Return the rules a password breaks (empty list means it's strong enough)."""
    problems = []
    if len(password) < MIN_PASSWORD_LENGTH:
        problems.append(f"at least {MIN_PASSWORD_LENGTH} characters")
    if not any(c.isupper() for c in password):
        problems.append("an uppercase letter")
    if not any(c.islower() for c in password):
        problems.append("a lowercase letter")
    if not any(c.isdigit() for c in password):
        problems.append("a number")
    return problems


# Login rate limit: after MAX_LOGIN_ATTEMPTS failures within LOGIN_WINDOW_SECONDS,
# that IP + email is locked out until the window ends. Stops password guessing.
MAX_LOGIN_ATTEMPTS = 5
LOGIN_WINDOW_SECONDS = 60

_failed_logins = {}


def login_lockout_seconds(key: str) -> int:
    """Seconds left on the lockout for this key, or 0 if they can try again."""
    entry = _failed_logins.get(key)
    if not entry:
        return 0

    elapsed = time.time() - entry["first"]
    if elapsed > LOGIN_WINDOW_SECONDS:
        del _failed_logins[key]
        return 0

    if entry["count"] >= MAX_LOGIN_ATTEMPTS:
        return int(LOGIN_WINDOW_SECONDS - elapsed) + 1
    return 0


def record_failed_login(key: str) -> None:
    entry = _failed_logins.get(key)
    if entry is None or time.time() - entry["first"] > LOGIN_WINDOW_SECONDS:
        _failed_logins[key] = {"count": 1, "first": time.time()}
    else:
        entry["count"] += 1


def clear_failed_logins(key: str) -> None:
    _failed_logins.pop(key, None)
