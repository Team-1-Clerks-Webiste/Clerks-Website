// ============================================================
//  assistant.js — Clerks AI shopping assistant
//  Usage: <script src="/js/assistant.js"></script> (after cart.js)
//  Talks to POST /ai/chat on the backend; the model and its key
//  live server-side only.
// ============================================================

(() => {
  const AI_API = "http://127.0.0.1:8000/ai";
  const STORAGE_KEY = "clerks_assistant_chat";
  const MAX_SENT = 10;
  const STARTERS = [
    "Comfy school shoes under £50",
    "What's your returns policy?",
    "Help me pick a size",
  ];
  const IMAGE_MAX_PX = 1024;
  const THUMB_MAX_PX = 240;
  // Named colours the backend's local matcher understands, used as a hint for it
  const COLOUR_SWATCHES = {
    black: [25, 25, 25],
    white: [240, 240, 240],
    grey: [128, 128, 128],
    brown: [120, 75, 40],
    tan: [200, 160, 110],
    blue: [50, 90, 190],
    navy: [25, 35, 80],
    red: [190, 35, 35],
    pink: [235, 140, 175],
    green: [50, 140, 70],
  };
  const GREETING =
    "Hi! I'm the Clerks assistant. Tell me what you're looking for and I'll find the right pair, or ask me about sizing, delivery and returns.";

  // ── Styles ──
  const style = document.createElement("style");
  style.textContent = `
    .assistant-fab {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 1500;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 20px;
      background: var(--gold);
      color: #111;
      border: none;
      border-radius: var(--r-pill);
      font-size: 0.875rem;
      font-weight: 600;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      transition: background-color var(--ease), transform var(--ease);
    }
    .assistant-fab:hover { background: var(--gold-hover); transform: translateY(-2px); }
    .assistant-fab svg { width: 18px; height: 18px; }
    .assistant-fab.is-hidden { display: none; }

    .assistant {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 1600;
      width: 380px;
      height: min(620px, calc(100vh - 48px));
      display: none;
      flex-direction: column;
      background: var(--surface);
      border: 1px solid var(--border-strong);
      border-radius: var(--r-md);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
      overflow: hidden;
    }
    .assistant.is-open { display: flex; }

    .assistant__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
      background: var(--surface-2);
    }
    .assistant__title {
      font-family: var(--font-display);
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .assistant__sub { font-size: 0.72rem; color: var(--text-faint); }
    .assistant__head-actions { display: flex; gap: 4px; }
    .assistant__icon-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 0.75rem;
      padding: 6px 8px;
      border-radius: var(--r-sm);
    }
    .assistant__icon-btn:hover { color: var(--text); background: var(--surface); }
    .assistant__close { font-size: 1.4rem; line-height: 1; }

    .assistant__log {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 0.875rem;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .msg--assistant {
      align-self: flex-start;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-bottom-left-radius: 4px;
    }
    .msg--user {
      align-self: flex-end;
      background: var(--gold);
      color: #111;
      border-bottom-right-radius: 4px;
    }

    .msg-products {
      align-self: stretch;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .chat-product {
      display: grid;
      grid-template-columns: 64px 1fr auto;
      align-items: center;
      gap: 12px;
      padding: 8px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--r-sm);
      transition: border-color var(--ease);
    }
    .chat-product:hover { border-color: rgba(201, 168, 76, 0.4); }
    .chat-product img {
      width: 64px;
      height: 48px;
      object-fit: cover;
      border-radius: 4px;
      background: var(--surface-2);
    }
    .chat-product__name { font-size: 0.85rem; font-weight: 500; }
    .chat-product__price { font-size: 0.8rem; color: var(--gold); font-weight: 600; }
    .chat-product__add {
      padding: 6px 10px;
      background: transparent;
      border: 1px solid var(--border-strong);
      border-radius: var(--r-sm);
      font-size: 0.72rem;
      font-weight: 600;
      white-space: nowrap;
      transition: background-color var(--ease), border-color var(--ease), color var(--ease);
    }
    .chat-product__add:hover:not(:disabled),
    .chat-product__add.is-added {
      background: var(--gold);
      border-color: var(--gold);
      color: #111;
    }

    .typing { display: inline-flex; gap: 4px; padding: 14px; }
    .typing span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--text-muted);
      animation: typing 1s infinite ease-in-out;
    }
    .typing span:nth-child(2) { animation-delay: 0.15s; }
    .typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes typing {
      0%, 60%, 100% { opacity: 0.25; transform: translateY(0); }
      30% { opacity: 1; transform: translateY(-3px); }
    }

    .assistant__starters {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 0 16px 12px;
    }
    .starter {
      padding: 6px 12px;
      background: transparent;
      border: 1px solid var(--border-strong);
      border-radius: var(--r-pill);
      color: var(--text-muted);
      font-size: 0.75rem;
      transition: border-color var(--ease), color var(--ease);
    }
    .starter:hover { border-color: var(--gold); color: var(--gold); }

    .assistant__form {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid var(--border);
    }
    .assistant__form .input { padding-top: 0.65rem; padding-bottom: 0.65rem; }
    .assistant__send { padding: 0 16px; }
    .assistant__photo {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      background: transparent;
      border: 1px solid var(--border-strong);
      border-radius: var(--r-sm);
      color: var(--text-muted);
      transition: border-color var(--ease), color var(--ease);
    }
    .assistant__photo:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }
    .assistant__photo svg { width: 18px; height: 18px; }

    .msg__image {
      display: block;
      max-width: 100%;
      max-height: 180px;
      margin-bottom: 6px;
      border-radius: 8px;
      object-fit: cover;
    }

    .assistant__note {
      padding: 0 16px 10px;
      font-size: 0.68rem;
      color: var(--text-faint);
      text-align: center;
    }

    @media (max-width: 600px) {
      .assistant {
        inset: 0;
        width: 100%;
        height: 100%;
        border-radius: 0;
        border: none;
      }
      .assistant-fab { right: 16px; bottom: 16px; padding: 14px; }
      .assistant-fab .assistant-fab__label { display: none; }
    }
  `;
  document.head.appendChild(style);

  // ── State ──
  let history = loadHistory();
  let busy = false;

  function loadHistory() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  function saveHistory() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-30)));
    } catch (err) {
      console.warn("Could not save chat history:", err);
    }
  }

  function currentShoeId() {
    if (!window.location.pathname.endsWith("/product.html")) return null;
    const id = parseInt(new URLSearchParams(window.location.search).get("id"), 10);
    return Number.isFinite(id) ? id : null;
  }

  // ── DOM ──
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const fab = el("button", "assistant-fab");
  fab.setAttribute("aria-label", "Open shopping assistant");
  fab.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>
    </svg>
    <span class="assistant-fab__label">Ask Clerks</span>`;

  const panel = el("section", "assistant");
  panel.setAttribute("aria-label", "Clerks shopping assistant");
  panel.innerHTML = `
    <header class="assistant__head">
      <div>
        <div class="assistant__title">Clerks Assistant</div>
        <div class="assistant__sub">Find your perfect pair</div>
      </div>
      <div class="assistant__head-actions">
        <button type="button" class="assistant__icon-btn" data-action="reset">New chat</button>
        <button type="button" class="assistant__icon-btn assistant__close" data-action="close" aria-label="Close assistant">×</button>
      </div>
    </header>
    <div class="assistant__log" aria-live="polite"></div>
    <div class="assistant__starters"></div>
    <form class="assistant__form">
      <button type="button" class="assistant__photo" data-action="photo" aria-label="Find shoes from a photo" title="Find shoes from a photo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
      </button>
      <input type="file" accept="image/*" hidden data-role="photo-input" />
      <input class="input" type="text" maxlength="1000" placeholder="Ask about shoes, or send a photo…" aria-label="Message" />
      <button class="btn btn--primary assistant__send" type="submit">Send</button>
    </form>
    <p class="assistant__note">AI can make mistakes. Check sizes and prices before ordering.</p>`;

  const log = panel.querySelector(".assistant__log");
  const starters = panel.querySelector(".assistant__starters");
  const form = panel.querySelector(".assistant__form");
  const input = form.querySelector('input[type="text"]');
  const sendBtn = form.querySelector('button[type="submit"]');
  const photoBtn = form.querySelector('[data-action="photo"]');
  const photoInput = form.querySelector('[data-role="photo-input"]');

  STARTERS.forEach((text) => {
    const chip = el("button", "starter", text);
    chip.type = "button";
    chip.addEventListener("click", () => send(text));
    starters.appendChild(chip);
  });

  function productRow(shoe) {
    const row = el("a", "chat-product");
    row.href = `/pages/product.html?id=${shoe.id}`;

    const img = el("img");
    img.src = typeof shoeImage === "function" ? shoeImage(shoe) : `/${shoe.image}`;
    img.alt = shoe.name;

    const info = el("div");
    info.append(el("div", "chat-product__name", shoe.name), el("div", "chat-product__price", `£${shoe.price}`));

    const add = el("button", "chat-product__add", "Add to Bag");
    add.type = "button";
    add.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof addToBag !== "function") return;
      addToBag(shoe.name, `£${shoe.price}`, img.src, shoe.id);
      if (typeof flashAdded === "function") flashAdded(add);
    });

    row.append(img, info, add);
    return row;
  }

  function renderMessage(msg) {
    const bubble = el("div", `msg msg--${msg.role}`);
    if (msg.image) {
      const img = el("img", "msg__image");
      img.src = msg.image;
      img.alt = "Your photo";
      bubble.appendChild(img);
    }
    bubble.appendChild(document.createTextNode(msg.content));
    log.appendChild(bubble);
    if (msg.products && msg.products.length) {
      const list = el("div", "msg-products");
      msg.products.forEach((shoe) => list.appendChild(productRow(shoe)));
      log.appendChild(list);
    }
  }

  function render() {
    log.innerHTML = "";
    renderMessage({ role: "assistant", content: GREETING });
    history.forEach(renderMessage);
    starters.style.display = history.length ? "none" : "flex";
    log.scrollTop = log.scrollHeight;
  }

  function setBusy(value) {
    busy = value;
    input.disabled = value;
    sendBtn.disabled = value;
    photoBtn.disabled = value;
  }

  // ── Send ──
  // Shows the user's message, POSTs `body` to `path`, then shows the reply
  async function ask(userMsg, path, buildBody, failText) {
    history.push(userMsg);
    saveHistory();
    render();
    input.value = "";
    setBusy(true);

    const typing = el("div", "msg msg--assistant typing");
    typing.innerHTML = "<span></span><span></span><span></span>";
    log.appendChild(typing);
    log.scrollTop = log.scrollHeight;

    let reply;
    try {
      const res = await fetch(`${AI_API}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(await buildBody()),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      reply = { role: "assistant", content: data.reply, products: data.products || [] };
    } catch (err) {
      console.error("Assistant error:", err);
      reply = { role: "assistant", content: failText, products: [] };
    }

    history.push(reply);
    saveHistory();
    setBusy(false);
    render();
    input.focus();
  }

  function send(text) {
    text = text.trim();
    if (!text || busy) return;

    ask({ role: "user", content: text }, "/chat", () => ({
      messages: history.slice(-MAX_SENT).map(({ role, content }) => ({ role, content })),
      shoe_id: currentShoeId(),
    }), "Sorry, I can't connect right now. Please try again in a moment.");
  }

  // ── Photo search ──
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read that image"));
      };
      img.src = url;
    });
  }

  // Draws the image scaled to fit within maxPx, so uploads stay small
  function drawScaled(img, maxPx) {
    const scale = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff"; // transparent PNGs become white, not black, as JPEG
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  // Most common named colour in the centre of the photo, skipping plain backgrounds
  function dominantColour(canvas) {
    const ctx = canvas.getContext("2d");
    const x = Math.floor(canvas.width * 0.2);
    const y = Math.floor(canvas.height * 0.2);
    const w = Math.max(1, Math.floor(canvas.width * 0.6));
    const h = Math.max(1, Math.floor(canvas.height * 0.6));
    const { data } = ctx.getImageData(x, y, w, h);

    const counts = {};
    const step = 4 * Math.max(1, Math.floor((w * h) / 4000)); // ~4000 samples
    for (let i = 0; i < data.length; i += step) {
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      if (Math.min(r, g, b) > 225) continue; // likely a white backdrop
      let best = null;
      let bestDist = Infinity;
      for (const [name, [sr, sg, sb]] of Object.entries(COLOUR_SWATCHES)) {
        const dist = (r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2;
        if (dist < bestDist) [best, bestDist] = [name, dist];
      }
      counts[best] = (counts[best] || 0) + 1;
    }

    const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return ranked.length ? ranked[0][0] : "white";
  }

  async function sendPhoto(file) {
    if (!file || busy) return;
    if (!file.type.startsWith("image/")) {
      history.push({ role: "assistant", content: "That doesn't look like an image. Please choose a photo of some shoes.", products: [] });
      saveHistory();
      render();
      return;
    }

    let img;
    try {
      img = await loadImage(file);
    } catch (err) {
      console.error("Assistant image error:", err);
      history.push({ role: "assistant", content: "Sorry, I couldn't open that photo. Try a JPEG or PNG.", products: [] });
      saveHistory();
      render();
      return;
    }

    const note = input.value.trim();
    const full = drawScaled(img, IMAGE_MAX_PX);
    const thumb = drawScaled(img, THUMB_MAX_PX).toDataURL("image/jpeg", 0.7);

    ask(
      { role: "user", content: note || "Find shoes like these", image: thumb },
      "/image-match",
      () => ({
        image: full.toDataURL("image/jpeg", 0.85),
        note,
        colour_hint: dominantColour(full),
      }),
      "Sorry, I couldn't analyse that photo right now. Please try again in a moment."
    );
  }

  // ── Open / close ──
  function open() {
    panel.classList.add("is-open");
    fab.classList.add("is-hidden");
    render();
    input.focus();
  }

  function close() {
    panel.classList.remove("is-open");
    fab.classList.remove("is-hidden");
  }

  fab.addEventListener("click", open);
  panel.querySelector('[data-action="close"]').addEventListener("click", close);
  panel.querySelector('[data-action="reset"]').addEventListener("click", () => {
    history = [];
    saveHistory();
    render();
    input.focus();
  });
  photoBtn.addEventListener("click", () => photoInput.click());
  photoInput.addEventListener("change", () => {
    sendPhoto(photoInput.files[0]);
    photoInput.value = ""; // allow picking the same file again
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    send(input.value);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("is-open")) close();
  });

  function mount() {
    document.body.append(fab, panel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
