import logging
import time
from typing import List, Literal, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from backend.ai import client
from backend.ai.knowledge import get_catalogue, shoes_by_id
from backend.ai.mock import mock_chat
from backend.ai.parsing import parse_model_json, valid_ids
from backend.ai.prompts import chat_system_prompt, recommendation_prompt

router = APIRouter(prefix="/ai")
log = logging.getLogger("clerks.ai")

MAX_HISTORY = 10
RECS_TTL_SECONDS = 600
FALLBACK_REPLY = (
    "Sorry, I'm having trouble right now. You can still browse the full range in the shop, "
    "and delivery is free over £50 with 30-day returns."
)

_recs_cache = {}


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=1000)


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(min_length=1, max_length=20)
    shoe_id: Optional[int] = None


@router.post("/chat")
def chat(request: ChatRequest):
    if request.messages[-1].role != "user":
        raise HTTPException(status_code=422, detail="Last message must be from the user")

    shoes = get_catalogue()
    by_id = shoes_by_id(shoes)
    current = by_id.get(request.shoe_id) if request.shoe_id else None
    history = [m.model_dump() for m in request.messages[-MAX_HISTORY:]]

    try:
        if client.is_live():
            raw = client.generate(chat_system_prompt(shoes, current), history)
        else:
            raw = mock_chat(history, shoes, current)
    except client.AIUnavailable as e:
        log.warning("AI chat failed: %s", e)
        return {"reply": FALLBACK_REPLY, "products": []}

    parsed = parse_model_json(raw, by_id.keys())
    return {
        "reply": parsed["reply"] or FALLBACK_REPLY,
        "products": [by_id[i] for i in parsed["product_ids"]],
    }


def _rule_based(shoe: dict, shoes: List[dict], exclude: List[int], limit: int) -> List[int]:
    """Same category first, then same style, then closest price."""
    others = [s for s in shoes if s["id"] != shoe["id"] and s["id"] not in exclude]
    others.sort(key=lambda s: (
        s["category"] != shoe["category"],
        s["style"] != shoe["style"],
        abs(s["price"] - shoe["price"]),
    ))
    return [s["id"] for s in others[:limit]]


@router.get("/recommendations/{shoe_id}")
def recommendations(shoe_id: int, limit: int = Query(4, ge=1, le=8)):
    cache_key = (shoe_id, limit)
    cached = _recs_cache.get(cache_key)
    if cached and time.time() - cached["at"] < RECS_TTL_SECONDS:
        return cached["data"]

    shoes = get_catalogue()
    by_id = shoes_by_id(shoes)
    shoe = by_id.get(shoe_id)
    if not shoe:
        raise HTTPException(status_code=404, detail="Shoe not found")

    ids, reason, source = [], "", "rules"
    if client.is_live():
        try:
            raw = client.generate(
                recommendation_prompt(shoe, shoes, limit),
                [{"role": "user", "content": "Recommend shoes."}],
            )
            parsed = parse_model_json(raw, by_id.keys(), limit, exclude=shoe_id)
            ids, reason = parsed["product_ids"], parsed["reason"]
            source = "ai" if ids else "rules"
        except client.AIUnavailable as e:
            log.warning("AI recommendations failed: %s", e)

    if len(ids) < limit:
        ids += _rule_based(shoe, shoes, ids, limit - len(ids))

    data = {
        "products": [by_id[i] for i in valid_ids(ids, by_id.keys(), limit, exclude=shoe_id)],
        "reason": reason or f"Picked to go with the {shoe['name']}.",
        "source": source,
    }
    _recs_cache[cache_key] = {"at": time.time(), "data": data}
    return data
