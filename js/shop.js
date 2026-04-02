// ── Shop: Fetch, Filter, Sort, Search ──

let allShoes = []; // master list from API

// Fetch shoes once, then render
async function loadShoes() {
  try {
    const response = await fetch("http://127.0.0.1:8000/shoes");
    allShoes = await response.json();
    if (!allShoes || allShoes.length === 0) {
      console.log("No shoes found in the database");
      return;
    }
    applyFilters();
  } catch (error) {
    console.error("Error loading shoes:", error);
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
  const checked = document.querySelector(
    '#sort-section input[type="radio"]:checked',
  );
  return checked ? checked.value : "relevance";
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
  const colours = getCheckedValues("colour");
  const styles = getCheckedValues("style");
  const materials = getCheckedValues("material");
  const prices = getCheckedValues("price");
  const search = getSearchQuery();
  const sort = getActiveSortValue();

  let filtered = allShoes.filter((shoe) => {
    // Colour — shoe.COLOR may contain "Black, White"
    if (colours.length) {
      const shoeColours = shoe.COLOR.toLowerCase();
      if (!colours.some((c) => shoeColours.includes(c))) return false;
    }
    // Style — shoe.STYLE is e.g. "Sports", "Casual", "Luxury"
    if (styles.length) {
      const shoeStyle = shoe.STYLE.toLowerCase();
      // handle "sport" matching "sports"
      if (!styles.some((s) => shoeStyle.includes(s))) return false;
    }
    // Material — shoe.MATERIAL may contain "Mesh, Rubber"
    if (materials.length) {
      const shoeMat = shoe.MATERIAL.toLowerCase();
      if (!materials.some((m) => shoeMat.includes(m))) return false;
    }
    // Price range
    if (prices.length) {
      if (!matchesPriceRange(shoe.PRICE, prices)) return false;
    }
    // Search
    if (search) {
      const haystack = (
        shoe.NAME +
        " " +
        shoe.CATEGORY +
        " " +
        shoe.STYLE +
        " " +
        shoe.COLOR +
        " " +
        shoe.MATERIAL
      ).toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  // Sort
  switch (sort) {
    case "price_high-low":
      filtered.sort((a, b) => b.PRICE - a.PRICE);
      break;
    case "price_low-high":
      filtered.sort((a, b) => a.PRICE - b.PRICE);
      break;
    case "alpha_a-z":
      filtered.sort((a, b) => a.NAME.localeCompare(b.NAME));
      break;
    case "alpha_z-a":
      filtered.sort((a, b) => b.NAME.localeCompare(a.NAME));
      break;
    default:
      break; // relevance = original API order
  }

  renderShoes(filtered);
}

// ── Render cards ──
function renderShoes(shoes) {
  const productsSection = document.querySelector(".products");
  productsSection.innerHTML = "";

  if (shoes.length === 0) {
    const msg = document.createElement("p");
    msg.className = "no-results";
    msg.textContent = "No shoes match your filters.";
    productsSection.appendChild(msg);
    return;
  }

  shoes.forEach((shoe) => {
    productsSection.appendChild(createProductCard(shoe));
  });
}

// Create a product card element
function createProductCard(shoe) {
  const card = document.createElement("div");
  card.className = "card";
  card.setAttribute("data-shoe-id", shoe.ID);
  card.style.cursor = "pointer";

  // Navigate to product page when card is clicked (but not the Add to Bag button)
  card.addEventListener("click", (e) => {
    if (e.target.closest(".add-to-bag")) return;
    window.location.href = `product.html?id=${shoe.ID}`;
  });

  const img = document.createElement("img");
  img.src = shoe.IMAGE ? `/${shoe.IMAGE}` : "/assets/mens_sports.png";
  img.alt = shoe.NAME;

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const productName = document.createElement("p");
  productName.className = "product-name";
  productName.textContent = shoe.NAME;

  const productPrice = document.createElement("p");
  productPrice.className = "product-price";
  productPrice.textContent = `£${shoe.PRICE}`;

  const addButton = document.createElement("button");
  addButton.className = "add-to-bag";
  addButton.textContent = "Add to Bag";

  // Integrate with existing cart functionality
  addButton.addEventListener("click", () => {
    const price = `£${shoe.PRICE}`;
    const image = shoe.IMAGE ? `/${shoe.IMAGE}` : "/assets/mens_sports.png";
    const shoeId = shoe.ID;

    // Call the cart.js function
    if (typeof addToBag === "function") {
      addToBag(shoe.NAME, price, image, shoeId);

      // Update button feedback
      addButton.textContent = "Added!";
      addButton.disabled = true;

      // Reset after 2 seconds
      setTimeout(() => {
        addButton.textContent = "Add to Bag";
        addButton.disabled = false;
      }, 2000);

      // Update counter
      if (typeof updateCounter === "function") {
        updateCounter();
      }
    } else {
      console.error("addToBag function not found");
    }
  });

  cardBody.appendChild(productName);
  cardBody.appendChild(productPrice);
  cardBody.appendChild(addButton);

  card.appendChild(img);
  card.appendChild(cardBody);

  return card;
}

// ── Wire up event listeners ──
document.addEventListener("DOMContentLoaded", () => {
  loadShoes();

  // Filter checkboxes — re-filter on every change
  document
    .querySelectorAll('.filter[data-filter] input[type="checkbox"]')
    .forEach((cb) => {
      cb.addEventListener("change", applyFilters);
    });

  // Sort radio buttons
  document
    .querySelectorAll('#sort-section input[type="radio"]')
    .forEach((rb) => {
      rb.addEventListener("change", applyFilters);
    });

  // Click-to-toggle filter dropdowns
  document.querySelectorAll(".filter .field_name").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const filter = btn.closest(".filter");
      const wasOpen = filter.classList.contains("open");
      // Close all filters first
      document
        .querySelectorAll(".filter")
        .forEach((f) => f.classList.remove("open"));
      document.querySelector(".sort_by")?.classList.remove("open");
      if (!wasOpen) filter.classList.add("open");
    });
  });

  // Click-to-toggle sort dropdown
  const sortBtn = document.querySelector(".sort_button");
  if (sortBtn) {
    sortBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const sortBy = sortBtn.closest(".sort_by");
      const wasOpen = sortBy.classList.contains("open");
      document
        .querySelectorAll(".filter")
        .forEach((f) => f.classList.remove("open"));
      sortBy.classList.remove("open");
      if (!wasOpen) sortBy.classList.add("open");
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener("click", () => {
    document
      .querySelectorAll(".filter")
      .forEach((f) => f.classList.remove("open"));
    document.querySelector(".sort_by")?.classList.remove("open");
  });

  // Prevent clicks inside dropdowns from closing them
  document
    .querySelectorAll(".dropdown_content, .sort_content")
    .forEach((dd) => {
      dd.addEventListener("click", (e) => e.stopPropagation());
    });

  // Navbar search bar — filter as you type
  const searchInput = document.querySelector(
    '.clerks-navbar .clerks-icons input[type="text"]',
  );
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }
});
