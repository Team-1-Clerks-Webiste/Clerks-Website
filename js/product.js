document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const shoeId = params.get("id");
  const title = document.getElementById("product-title");

  function showError(message) {
    title.textContent = "Not found";
    document.getElementById("crumb-name").textContent = "Not found";
    document.getElementById("product-price").textContent = "";
    document.querySelector(".details").insertAdjacentHTML(
      "beforeend",
      `<p class="empty-state">${message} <a href="/pages/shop.html">Back to shop</a></p>`,
    );
    document.querySelector(".size-picker").remove();
    document.getElementById("add-to-bag").remove();
  }

  if (!shoeId) {
    showError("No product selected.");
    return;
  }

  let shoe;
  try {
    const response = await fetch(`http://127.0.0.1:8000/shoes/${shoeId}`);
    shoe = await response.json();
  } catch (error) {
    console.error("Error loading product:", error);
    showError("We couldn't load this product right now.");
    return;
  }

  if (!shoe || shoe.error) {
    showError("We couldn't find that shoe.");
    return;
  }

  const imgSrc = shoeImage(shoe);

  // Populate product page
  document.title = `${shoe.name} — Clerks`;
  title.textContent = shoe.name;
  document.getElementById("product-meta").textContent = [shoe.category, shoe.style]
    .filter(Boolean)
    .join(" · ");
  document.getElementById("product-price").textContent = `£${shoe.price}`;
  document.getElementById("product-colour").textContent = shoe.color
    ? `Colour: ${shoe.color}`
    : "";

  const mainImg = document.getElementById("main-image");
  mainImg.src = imgSrc;
  mainImg.alt = shoe.name;

  // Breadcrumb
  document.getElementById("crumb-name").textContent = shoe.name;
  if (shoe.category) {
    const crumb = document.getElementById("crumb-category");
    crumb.textContent = shoe.category;
    crumb.href = `/pages/shop.html?category=${encodeURIComponent(shoe.category)}`;
  }

  // Details list
  const spec = document.getElementById("spec-list");
  [
    ["Category", shoe.category],
    ["Style", shoe.style],
    ["Colour", shoe.color],
    ["Material", shoe.material],
  ].forEach(([label, value]) => {
    if (!value) return;
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    spec.append(dt, dd);
  });

  // Size selection
  let selectedSize = null;
  const sizeMsg = document.getElementById("size-msg");
  const sizeLabel = document.getElementById("size-selected");
  document.querySelectorAll(".size-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".size-btn")
        .forEach((b) => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      selectedSize = btn.dataset.size;
      sizeLabel.textContent = selectedSize;
      sizeMsg.textContent = "";
    });
  });

  // Add to Bag
  const addBtn = document.getElementById("add-to-bag");
  addBtn.addEventListener("click", () => {
    if (!selectedSize) {
      sizeMsg.textContent = "Please select a size.";
      return;
    }
    addToBag(shoe.name, `£${shoe.price}`, imgSrc, shoe.id);
    flashAdded(addBtn);
  });
});
