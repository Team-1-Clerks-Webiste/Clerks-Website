import time
from typing import List

from backend.database import supabase

CATALOGUE_TTL_SECONDS = 300

STORE_POLICIES = """\
- Delivery: free UK delivery on orders over £50, otherwise £2.99.
- Returns: free returns and exchanges within 30 days.
- Sizes: EU sizes 36 to 46. If between sizes, suggest the larger size; kids' feet grow fast, so leave a thumb's width of room.
- Ranges: Men, Women and Kids, in Casual, Sports and Luxury styles.
- About: Clerks was founded in 1825 in Street, Somerset, and is known for comfort and craftsmanship.
- Payment: online payment is coming soon; shoppers can build their bag now."""

_cache = {"shoes": [], "loaded_at": 0.0}


def get_catalogue() -> List[dict]:
    """All shoes from Supabase, cached for a few minutes."""
    if _cache["shoes"] and time.time() - _cache["loaded_at"] < CATALOGUE_TTL_SECONDS:
        return _cache["shoes"]

    response = supabase.table("shoes").select("*").execute()
    _cache["shoes"] = response.data or []
    _cache["loaded_at"] = time.time()
    return _cache["shoes"]


def shoes_by_id(shoes: List[dict]) -> dict:
    return {shoe["id"]: shoe for shoe in shoes}


def catalogue_as_text(shoes: List[dict]) -> str:
    """One compact line per shoe so the whole catalogue fits in the prompt."""
    return "\n".join(
        f'{s["id"]} | {s["name"]} | £{s["price"]} | {s["category"]} | '
        f'{s["style"]} | {s["color"]} | {s["material"]}'
        for s in shoes
    )
