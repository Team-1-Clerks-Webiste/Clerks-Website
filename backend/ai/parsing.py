import json
import re
from typing import Iterable, List

_FENCE = re.compile(r"```(?:json)?\s*(.*?)```", re.S)


def _first_json_object(text: str):
    """Find the first {...} JSON object in text, even if wrapped in prose or code fences."""
    fenced = _FENCE.search(text)
    candidates = [fenced.group(1)] if fenced else []
    candidates.append(text)

    decoder = json.JSONDecoder()
    for candidate in candidates:
        for i, ch in enumerate(candidate):
            if ch != "{":
                continue
            try:
                obj, _ = decoder.raw_decode(candidate[i:])
            except ValueError:
                continue
            if isinstance(obj, dict):
                return obj
    return None


def valid_ids(ids, known_ids: Iterable[int], limit: int, exclude=None) -> List[int]:
    """Keep only real catalogue ids (models can hallucinate), de-duplicated and capped."""
    known = set(known_ids)
    result = []
    for raw in ids if isinstance(ids, list) else []:
        try:
            shoe_id = int(raw)
        except (TypeError, ValueError):
            continue
        if shoe_id in known and shoe_id != exclude and shoe_id not in result:
            result.append(shoe_id)
        if len(result) >= limit:
            break
    return result


def parse_model_json(text: str, known_ids: Iterable[int], limit: int = 4, exclude=None) -> dict:
    """Turn raw model output into {"reply", "reason", "product_ids"} safely."""
    text = (text or "").strip()
    obj = _first_json_object(text)

    if obj is None:
        return {"reply": text, "reason": "", "product_ids": []}

    return {
        "reply": str(obj.get("reply", "")).strip(),
        "reason": str(obj.get("reason", "")).strip(),
        "product_ids": valid_ids(obj.get("product_ids"), known_ids, limit, exclude),
    }
