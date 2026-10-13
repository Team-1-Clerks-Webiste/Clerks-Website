from typing import List

import httpx

from backend.ai import config


class AIUnavailable(Exception):
    """The model could not be reached or returned something unusable."""


def is_live() -> bool:
    return config.AI_PROVIDER == "ica"


def _headers() -> dict:
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if config.ICA_AUTH_HEADER.lower() == "authorization":
        headers["Authorization"] = f"Bearer {config.ICA_API_KEY}"
    else:
        headers[config.ICA_AUTH_HEADER] = config.ICA_API_KEY
    return headers


def _payload(system: str, messages: List[dict], model: str) -> dict:
    if config.ICA_API_STYLE == "prompt":
        transcript = "\n".join(f'{m["role"].upper()}: {m["content"]}' for m in messages)
        payload = {"input": f"{system}\n\n{transcript}\nASSISTANT:"}
    else:
        payload = {"messages": [{"role": "system", "content": system}, *messages]}

    if model:
        payload["model"] = model
    return payload


def _extract_text(data) -> str:
    """Pull the generated text out of the response, trying the common response shapes."""
    if isinstance(data, str):
        return data
    if not isinstance(data, dict):
        raise AIUnavailable(f"Unexpected response type: {type(data).__name__}")

    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        pass
    try:
        return data["results"][0]["generated_text"]
    except (KeyError, IndexError, TypeError):
        pass
    for key in ("output", "generated_text", "response", "answer", "text", "content"):
        value = data.get(key)
        if isinstance(value, str):
            return value
        if isinstance(value, dict) and isinstance(value.get("text"), str):
            return value["text"]

    raise AIUnavailable(f"Could not find generated text in response keys: {list(data)}")


def _call_ica(system: str, messages: List[dict], url: str = "", model: str = "") -> str:
    """IBM Consulting Advantage chat completions (OpenAI-compatible), e.g. POST /v1/assistants/chat/completions."""
    url = url or config.ICA_API_URL
    model = model or config.ICA_MODEL
    if not config.ICA_API_KEY or not model:
        raise AIUnavailable("ICA_API_KEY / ICA_MODEL are not set")

    try:
        response = httpx.post(
            url,
            headers=_headers(),
            json=_payload(system, messages, model),
            timeout=config.ICA_TIMEOUT,
        )
        response.raise_for_status()
        return _extract_text(response.json())
    except httpx.HTTPStatusError as e:
        raise AIUnavailable(f"ICA returned {e.response.status_code}: {e.response.text[:300]}") from e
    except (httpx.HTTPError, ValueError) as e:
        raise AIUnavailable(f"ICA request failed: {e}") from e


def generate(system: str, messages: List[dict]) -> str:
    return _call_ica(system, messages)


def generate_with_image(system: str, text: str, image_data_url: str) -> str:
    """Send one user turn with an image attached (OpenAI-style multimodal content).

    Needs ICA_API_STYLE=chat and a vision-capable model (ICA_VISION_MODEL, else ICA_MODEL).
    """
    if config.ICA_API_STYLE != "chat":
        raise AIUnavailable("Image analysis needs ICA_API_STYLE=chat")

    content = [
        {"type": "text", "text": text},
        {"type": "image_url", "image_url": {"url": image_data_url}},
    ]
    return _call_ica(
        system,
        [{"role": "user", "content": content}],
        url=config.ICA_VISION_API_URL,
        model=config.ICA_VISION_MODEL,
    )
