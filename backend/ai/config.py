import os
from dotenv import load_dotenv

load_dotenv()

# "mock" runs a local responder (no IBM access needed); "ica" calls IBM Consulting Advantage
AI_PROVIDER = os.getenv("AI_PROVIDER", "mock").strip().lower()

ICA_API_URL = os.getenv(
    "ICA_API_URL", "https://api.servicesessentials.ibm.com/v1/assistants/chat/completions"
).strip()
ICA_API_KEY = os.getenv("ICA_API_KEY", "").strip()
# Assistant / model id from GET /assistants/models (sent as the OpenAI-style "model" field)
ICA_MODEL = os.getenv("ICA_MODEL", "").strip()

# "chat" = messages list in, "prompt" = single input string in
ICA_API_STYLE = os.getenv("ICA_API_STYLE", "chat").strip().lower()

# Header that carries the key. "Authorization" is sent as "Bearer <key>", anything else as the raw key
ICA_AUTH_HEADER = os.getenv("ICA_AUTH_HEADER", "Authorization").strip()

ICA_TIMEOUT = float(os.getenv("ICA_TIMEOUT", "30"))
