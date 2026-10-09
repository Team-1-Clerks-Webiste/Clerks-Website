// ── Shop: Fetch, Filter, Sort, Search ──

let allShoes = []; // master list from API

// Fetch shoes once, then render
async function loadShoes() {
  try {
    const response = await fetch("http://127.0.0.1:8000/shoes");
    allShoes = await response.json();
    if (!Array.isArray(allShoes)) allShoes = [];
    applyFilters();
  } catch (error) {
    console.error("Error loading shoes:", error);
    renderMessage("We couldn't load the collection right now. Please try again shortly.");
    setResultCount("");
  }
}

// ── Gather active filter values ──
function getCheckedValues(filterName) {
  const section = document.querySelector(
    `.filter[data-filter="${filterName}"]`,
  );
  if (!section) return [];
  return Array.from(
    section.querySelectorAll('input[type="checkbox"]:checked'),
  ).map((cb) => cb.value.toLowerCase());
}

function getActiveSortValue() {
  const select = document.getElementById("sort-select");
  return select ? select.value : "relevance";
}

function getSearchQuery() {
  const input = document.querySelector(
    '.clerks-navbar .clerks-icons input[type="text"]',
  );
  return input ? input.value.trim().toLowerCase() : "";
}

// ── Price-range helper ──
function matchesPriceRange(price, ranges) {
  return ranges.some((r) => {
    if (r === "£100+") return price >= 100;
    const parts = r.replace(/£/g, "").split("-");
    const lo = parseFloat(parts[0]);
    const hi = parseFloat(parts[1]);
    return price >= lo && price <= hi;
  });
}

// ── Main filter / sort / search pipeline ──
function applyFilters() {
  const categories = getCheckedValues("category");
  const colours = getCheckedValues("colour");
  const styles = getCheckedValues("style");
  const materials = getCheckedValues("material");
  const prices = getCheckedValues("price");
  const search = getSearchQuery();
  const sort = getActiveSortValue();

  let filtered = allShoes.filter((shoe) => {
    // Category — "Men", "Women", "Kids"
    if (categories.length) {
      if (!categories.includes((shoe.category || "").toLowerCase())) return false;
    }
    // Colour — shoe.color may contain "Black, White"
    if (colours.length) {
      const shoeColours = (shoe.color || "").toLowerCase();
      if (!colours.some((c) => shoeColours.includes(c))) return false;
    }
    // Style — shoe.style is e.g. "Sports", "Casual", "Luxury"
    if (styles.length) {
      const shoeStyle = (shoe.style || "").toLowerCase();
      // handle "sport" matching "sports"
      if (!styles.some((s) => shoeStyle.includes(s))) return false;
    }
    // Material — shoe.material may contain "Mesh, Rubber"
    if (materials.length) {
      const shoeMat = (shoe.material || "").toLowerCase();
      if (!materials.some((m) => shoeMat.includes(m))) return false;
    }
    // Price range
    if (prices.length) {
      if (!matchesPriceRange(shoe.price, prices)) return false;
    }
    // Search
    if (search) {
      const haystack = [shoe.name, shoe.category, shoe.style, shoe.color, shoe.material]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  // Sort
  switch (sort) {
    case "price_high-low":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "price_low-high":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "alpha_a-z":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "alpha_z-a":
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    default:
      break; // relevance = original API order
  }

  updateTitle(categories);
  setResultCount(`${filtered.length} ${filtered.length === 1 ? "style" : "styles"}`);
  renderShoes(filtered);
}

// ── Header / count ──
function updateTitle(categories) {
  const title = document.getElementById("shop-title");
  if (!title) return;
  title.textContent =
    categories.length === 1
      ? `Shop ${categories[0].charAt(0).toUpperCase()}${categories[0].slice(1)}`
      : "Shop All";
}

function setResultCount(text) {
  const el = document.getElementById("result-count");
  if (el) el.textContent = text;
}

// ── Render cards ──
function renderMessage(text) {
  const productsSection = document.querySelector(".products");
  productsSection.innerHTML = "";
  const msg = document.createElement("p");
  msg.className = "empty-state";
  msg.textContent = text;
  productsSection.appendChild(msg);
}

function renderShoes(shoes) {
  if (shoes.length === 0) {
    renderMessage("No shoes match your filters. Try removing a few.");
    return;
  }

  const productsSection = document.querySelector(".products");
  productsSection.innerHTML = "";
  shoes.forEach((shoe) => {
    productsSection.appendChild(createProductCard(shoe));
  });
}

// ── Wire up event listeners ──
document.addEventListener("DOMContentLoaded", () => {
  // Pre-select a category passed in the URL (e.g. ?category=Men)
  const category = new URLSearchParams(window.location.search).get("category");
  if (category) {
    const cb = document.querySelector(
      `.filter[data-filter="category"] input[value="${category.toLowerCase()}"]`,
    );
    if (cb) cb.checked = true;
  }

  // Collapse filter groups by default on small screens
  if (window.innerWidth <= 900) {
    document.querySelectorAll(".filter").forEach((f) => f.removeAttribute("open"));
  }

  loadShoes();

  // Filter checkboxes — re-filter on every change
  document
    .querySelectorAll('.filter[data-filter] input[type="checkbox"]')
    .forEach((cb) => {
      cb.addEventListener("change", applyFilters);
    });

  // Sort dropdown
  document.getElementById("sort-select")?.addEventListener("change", applyFilters);

  // Clear all filters
  document.getElementById("clear-filters")?.addEventListener("click", () => {
    document
      .querySelectorAll('.filter input[type="checkbox"]')
      .forEach((cb) => (cb.checked = false));
    applyFilters();
  });

  // Navbar search bar — filter as you type
  const searchInput = document.querySelector(
    '.clerks-navbar .clerks-icons input[type="text"]',
  );
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }
});
