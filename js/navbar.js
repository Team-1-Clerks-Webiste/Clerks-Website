(function () {
  /* ── Styles ── */
  const style = document.createElement("style");
  style.textContent = `
    .promo-bar {
      width: 100%;
      padding: 8px 1rem;
      background-color: #000;
      border-bottom: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      text-align: center;
    }

    .promo-bar strong {
      color: var(--gold);
      font-weight: 600;
    }

    .clerks-navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      width: 100%;
      height: var(--nav-h);
      padding: 0 2rem;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 1.5rem;
      background-color: rgba(11, 11, 11, 0.88);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }

    .clerks-navbar .clerks-logo img {
      height: 52px;
      width: auto;
      filter: invert(1) brightness(1.1);
    }

    .clerks-navbar .clerks-links ul {
      display: flex;
      align-items: center;
      gap: 2rem;
      list-style: none;
    }

    .clerks-navbar .clerks-links a {
      position: relative;
      display: block;
      padding: 6px 0;
      font-size: 0.85rem;
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-muted);
      transition: color var(--ease);
    }

    .clerks-navbar .clerks-links a::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1px;
      background: var(--gold);
      transform: scaleX(0);
      transition: transform var(--ease);
    }

    .clerks-navbar .clerks-links a:hover,
    .clerks-navbar .clerks-links a.is-active {
      color: var(--text);
    }

    .clerks-navbar .clerks-links a:hover::after,
    .clerks-navbar .clerks-links a.is-active::after {
      transform: scaleX(1);
    }

    .clerks-navbar .clerks-icons {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 1.1rem;
    }

    .clerks-navbar .clerks-icons input[type="text"] {
      width: clamp(120px, 14vw, 200px);
      padding: 8px 14px 8px 34px;
      background-color: var(--surface-2);
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='M20 20l-3.5-3.5'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: 12px center;
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      color: var(--text);
      font-size: 0.8rem;
      outline: none;
      transition: border-color var(--ease), width var(--ease);
    }

    .clerks-navbar .clerks-icons input[type="text"]::placeholder {
      color: var(--text-faint);
    }

    .clerks-navbar .clerks-icons input[type="text"]:focus {
      border-color: var(--gold);
    }

    .clerks-navbar .clerks-icons a {
      position: relative;
      display: flex;
      align-items: center;
    }

    .clerks-navbar .clerks-icon {
      width: 20px;
      height: 20px;
      object-fit: contain;
      filter: invert(1);
      opacity: 0.75;
      transition: opacity var(--ease);
    }

    .clerks-navbar .clerks-icons a:hover .clerks-icon {
      opacity: 1;
    }

    .clerks-navbar .nav-greeting {
      font-size: 0.8rem;
      color: var(--gold);
      white-space: nowrap;
    }

    .clerks-navbar #cart-count {
      display: none;
      position: absolute;
      top: -7px;
      right: -9px;
      min-width: 17px;
      height: 17px;
      padding: 0 4px;
      background: var(--gold);
      color: #111;
      font-size: 10px;
      font-weight: 700;
      border-radius: var(--r-pill);
      align-items: center;
      justify-content: center;
      line-height: 1;
      pointer-events: none;
    }

    @media (max-width: 1100px) {
      .clerks-navbar .clerks-links ul {
        gap: 1.25rem;
      }
    }

    @media (max-width: 900px) {
      .clerks-navbar {
        grid-template-columns: auto 1fr;
        padding: 0 1rem;
      }
      .clerks-navbar .clerks-links {
        display: none;
      }
      .clerks-navbar .clerks-icons {
        gap: 0.9rem;
      }
    }

    @media (max-width: 600px) {
      .clerks-navbar .clerks-icons input[type="text"] {
        width: 110px;
      }
      .clerks-navbar .nav-greeting {
        display: none;
      }
    }
  `;
  document.head.appendChild(style);

  /* ── Asset paths — hardcoded root-relative ── */
  const ASSETS = "/assets/";

  function makeImg(src, alt, className) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    if (className) img.className = className;
    return img;
  }

  function makeLink(href, child, label) {
    const a = document.createElement("a");
    a.href = href;
    if (label) a.setAttribute("aria-label", label);
    a.appendChild(child);
    return a;
  }

  /* ── Promo bar ── */
  const promoBar = document.createElement("div");
  promoBar.className = "promo-bar";
  promoBar.innerHTML =
    "<strong>Free UK delivery</strong> on orders over £50 · 30-day returns";

  /* ── Navbar ── */
  const nav = document.createElement("nav");
  nav.className = "clerks-navbar";

  // Logo
  const logoDiv = document.createElement("div");
  logoDiv.className = "clerks-logo";
  logoDiv.appendChild(
    makeLink("/index.html", makeImg(ASSETS + "clerks logo.png", "Clerks")),
  );

  // Nav links
  const linksDiv = document.createElement("div");
  linksDiv.className = "clerks-links";
  const ul = document.createElement("ul");
  const currentPath = window.location.pathname;
  [
    { label: "Home", href: "/index.html" },
    { label: "Shop", href: "/pages/shop.html" },
    { label: "Men", href: "/pages/shop.html?category=Men" },
    { label: "Women", href: "/pages/shop.html?category=Women" },
    { label: "Kids", href: "/pages/shop.html?category=Kids" },
    { label: "About", href: "/pages/about-us.html" },
  ].forEach(function (item) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = item.href;
    a.textContent = item.label;

    const url = new URL(item.href, window.location.origin);
    const samePath =
      url.pathname === currentPath ||
      (url.pathname === "/index.html" && currentPath === "/");
    if (samePath && url.search === window.location.search) {
      a.classList.add("is-active");
    }

    li.appendChild(a);
    ul.appendChild(li);
  });
  linksDiv.appendChild(ul);

  // Icons
  const iconsDiv = document.createElement("div");
  iconsDiv.className = "clerks-icons";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search";
  searchInput.setAttribute("aria-label", "Search shoes");

  // Outside the shop page, pressing Enter takes you to the shop with the query
  if (!currentPath.endsWith("/shop.html")) {
    searchInput.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      const q = searchInput.value.trim();
      window.location.href =
        "/pages/shop.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    });
  } else {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) searchInput.value = q;
  }

  iconsDiv.appendChild(searchInput);
  iconsDiv.appendChild(
    makeLink(
      "/pages/login.html",
      makeImg(ASSETS + "user.png", "", "clerks-icon"),
      "Account",
    ),
  );
  const bagLink = makeLink(
    "/pages/checkout.html",
    makeImg(ASSETS + "shopping-bag.png", "", "clerks-icon"),
    "Bag",
  );
  const cartBadge = document.createElement("span");
  cartBadge.id = "cart-count";
  cartBadge.textContent = "0";
  bagLink.appendChild(cartBadge);
  iconsDiv.appendChild(bagLink);

  nav.appendChild(logoDiv);
  nav.appendChild(linksDiv);
  nav.appendChild(iconsDiv);

  /* ── Insert at top of <body> ── */
  document.body.insertBefore(nav, document.body.firstChild);
  document.body.insertBefore(promoBar, document.body.firstChild);
})();
