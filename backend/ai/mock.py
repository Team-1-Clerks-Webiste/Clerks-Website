"""Local stand-in for the model so the store works before the ICA endpoint is connected.

It returns the same JSON shape the real model is asked for.
"""
import json
import re
from typing import List, Optional

CATEGORY_WORDS = {
    "Men": ["men", "mens", "man", "male", "him", "husband", "dad"],
    "Women": ["women", "womens", "woman", "ladies", "female", "her", "wife", "mum"],
    "Kids": ["kid", "kids", "child", "children", "school", "boy", "girl", "son", "daughter"],
}
STYLE_WORDS = {
    "Sports": ["sport", "sports", "running", "run", "gym", "trainer", "trainers", "active"],
    "Casual": ["casual", "everyday", "comfy", "comfortable", "relaxed", "weekend"],
    "Luxury": ["luxury", "smart", "formal", "dress", "wedding", "office", "work", "premium"],
}
COLOURS = ["black", "white", "brown", "blue", "grey", "pink", "red", "green", "navy", "tan"]
MATERIALS = ["leather", "fabric", "mesh", "suede", "canvas", "rubber"]


def _words(text: str) -> set:
    return set(re.findall(r"[a-z]+", text.lower()))


def _price_limits(text: str):
    text = text.lower()
    under = re.search(r"(?:under|below|less than|max|cheaper than|up to)\s*\D{0,3}?(\d+)", text)
    over = re.search(r"(?:over|above|more than|at least)\s*\D{0,3}?(\d+)", text)
    return (int(under.group(1)) if under else None, int(over.group(1)) if over else None)


def _reply(text: str, ids: Optional[List[int]] = None) -> str:
    return json.dumps({"reply": text, "product_ids": ids or []})


def mock_chat(messages: List[dict], shoes: List[dict], current_shoe: Optional[dict] = None) -> str:
    text = messages[-1]["content"]
    words = _words(text)

    if words & {"return", "returns", "refund", "exchange"}:
        return _reply("You can return or exchange any pair free of charge within 30 days. Just keep them unworn and in the original box.")
    if words & {"delivery", "deliver", "shipping", "postage", "arrive"}:
        return _reply("UK delivery is free on orders over £50, and £2.99 otherwise.")
    if words & {"size", "sizes", "sizing", "fit", "fits"}:
        about = f' The {current_shoe["name"]} is' if current_shoe else " Our shoes are"
        return _reply(f"We stock EU sizes 36 to 46.{about} true to size, so if you're between sizes we'd suggest going up half a size. For kids, leave about a thumb's width at the toe.")
    if words & {"history", "founded", "heritage", "about", "story"}:
        return _reply("Clerks was founded in 1825 in Street, Somerset, and we've been crafting comfortable, well-made shoes ever since.")

    category = next((c for c, ws in CATEGORY_WORDS.items() if words & set(ws)), None)
    style = next((s for s, ws in STYLE_WORDS.items() if words & set(ws)), None)
    colour = next((c for c in COLOURS if c in words), None)
    material = next((m for m in MATERIALS if m in words), None)
    under, over = _price_limits(text)

    if not any([category, style, colour, material, under, over]):
        if current_shoe and words & {"similar", "like", "alternative", "else", "other"}:
            category, style = current_shoe["category"], current_shoe["style"]
        else:
            return _reply("I can help you find the right pair, answer sizing questions, or explain delivery and returns. Try something like \"black leather shoes for work\" or \"kids' trainers under £50\".")

    def score(shoe):
        s = 0
        s += 3 if category and shoe["category"] == category else 0
        s += 2 if style and shoe["style"] == style else 0
        s += 1 if colour and colour in shoe["color"].lower() else 0
        s += 1 if material and material in shoe["material"].lower() else 0
        return s

    candidates = [
        shoe for shoe in shoes
        if (under is None or shoe["price"] <= under)
        and (over is None or shoe["price"] >= over)
        and (category is None or shoe["category"] == category)
        and (not current_shoe or shoe["id"] != current_shoe["id"])
    ]
    ranked = sorted(candidates, key=lambda s: (-score(s), s["price"]))
    exact = [s for s in ranked if score(s) == max((score(x) for x in ranked), default=0)]
    picks = (exact or ranked)[:4]

    if not picks:
        return _reply("I couldn't find anything matching that right now. Try widening your budget or browsing the full range in the shop.")

    desc = " ".join(filter(None, [colour, material, style.lower() if style else None, "shoes"]))
    who = f" for {category.lower()}" if category else ""
    budget = f" under £{under}" if under else ""
    return _reply(f"Here are some {desc}{who}{budget} I think you'll like:", [s["id"] for s in picks])
