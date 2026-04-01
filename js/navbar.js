(function () {
  /* ── Inject Google Fonts if not already present ── */
  if (!document.querySelector('link[href*="Cormorant+Garamond"]')) {
    const font = document.createElement("link");
    font.rel = "stylesheet";
    font.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Josefin+Sans:wght@300;400&display=swap";
    document.head.appendChild(font);
  }

  /* ── Styles ── */
  const style = document.createElement("style");
  style.textContent = `
    .top-nav {
      width: 100%;
      height: 32px;
      background-color: #d9d9d9;
    }

    .clerks-navbar {
      width: 100%;
      background-color: #ffffff;
      color: #000;
      padding: 10px 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 1px 0 rgba(0,0,0,0.08);
      top: 0;
      z-index: 1000;
      box-sizing: border-box;
    }

    .clerks-navbar .clerks-logo img {
      height: 120px;
      width: auto;
      display: block;
    }

    .clerks-navbar .clerks-links ul {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .clerks-navbar .clerks-links ul li {
      font-size: 15px;
      letter-spacing: 0em;
      color: #111;
      cursor: pointer;
      transition: color 0.2s;
    }

    .clerks-navbar .clerks-links ul li:hover {
      color: #c9a84c;
    }

    .clerks-navbar .clerks-links ul li a {
      color: inherit;
      text-decoration: none;
    }

    .clerks-navbar .clerks-icons {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .clerks-navbar .clerks-icons input[type="text"] {
      background: #d9d9d9;
      border: 1px solid #d9d9d9;
      border-radius: 15px;
      padding: 6px 12px;
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      color: #111;
      outline: none;
      width: (60px, 10vw, 186px);
      transition: border-color 0.2s;
    }

    .clerks-navbar .clerks-icons input[type="text"]:focus {
      border-color: #c9a84c;
    }

    .clerks-navbar .clerks-icons .clerks-icon {
      height: 20px;
      width: 20px;
      object-fit: contain;
      cursor: pointer;
      opacity: 0.75;
      transition: opacity 0.2s;
    }

    .clerks-navbar .clerks-icons .clerks-icon:hover {
      opacity: 1;
    }

    .clerks-navbar .clerks-icons a {
      display: flex;
      align-items: center;
      position: relative;
    }

    .clerks-navbar #cart-count {
      display: none;
      position: absolute;
      top: -8px;
      right: -8px;
      width: 16px;
      height: 16px;
      background: #c9922a;
      color: white;
      font-size: 10px;
      font-weight: 700;
      border-radius: 50%;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      line-height: 1;
    }

    @media (max-width: 780px) {
      .clerks-navbar .clerks-links {
        display: none;
      }
      .clerks-navbar .clerks-icons input[type="text"] {
        width: 110px;
      }
    }
  `;
  document.head.appendChild(style);

  /* ── Asset paths — hardcoded root-relative ── */
  /* nav.js is at /js/nav.js, assets are at /assets/  */
  const ASSETS = "/assets/";

  function makeImg(src, alt, className) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    if (className) img.className = className;
    return img;
  }

  function makeLink(href, child) {
    const a = document.createElement("a");
    a.href = href;
    a.appendChild(child);
    return a;
  }

  /* ── Plain gray top bar ── */
  const topNav = document.createElement("div");
  topNav.className = "top-nav";

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
  [
    { label: "Men", href: null },
    { label: "Women", href: null },
    { label: "Children", href: null },
    { label: "Sport", href: null },
    { label: "School", href: null },
    { label: "About", href: "/pages/about-us.html" },
    { label: "Sale", href: null },
  ].forEach(function (item) {
    const li = document.createElement("li");
    if (item.href) {
      const a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      li.appendChild(a);
    } else {
      li.textContent = item.label;
    }
    ul.appendChild(li);
  });
  linksDiv.appendChild(ul);

  // Icons
  const iconsDiv = document.createElement("div");
  iconsDiv.className = "clerks-icons";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = " Search...";

  iconsDiv.appendChild(searchInput);
  iconsDiv.appendChild(makeImg(ASSETS + "heart.png", "", "clerks-icon"));
  iconsDiv.appendChild(
    makeLink(
      "/pages/login.html",
      makeImg(ASSETS + "user.png", "", "clerks-icon"),
    ),
  );
  const bagLink = makeLink(
    "/pages/checkout.html",
    makeImg(ASSETS + "shopping-bag.png", "", "clerks-icon"),
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
  document.body.insertBefore(topNav, document.body.firstChild);
})();
