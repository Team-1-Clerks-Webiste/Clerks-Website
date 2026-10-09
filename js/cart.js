const CART_API = "http://localhost:8000";
const FALLBACK_IMAGE = "/assets/mens_sports.png";

function getCart() {
  return JSON.parse(localStorage.getItem("clerks_cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("clerks_cart", JSON.stringify(cart));
}

function updateCounter() {
  const count = getCart().length;
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}

function addToBag(name, price, image, shoeId) {
  const cart = getCart();
  cart.push({ name, price, image });
  saveCart(cart);
  updateCounter();

  const userId = localStorage.getItem("user_id");
  if (userId && shoeId) {
    fetch(`${CART_API}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: parseInt(userId), shoe_id: parseInt(shoeId), quantity: 1 }),
    });
  }
}

function shoeImage(shoe) {
  return shoe.image ? `/${shoe.image}` : FALLBACK_IMAGE;
}

// Brief "Added" confirmation on an Add to Bag button
function flashAdded(btn, label = "Add to Bag") {
  btn.textContent = "Added ✓";
  btn.classList.add("is-added");
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = label;
    btn.classList.remove("is-added");
    btn.disabled = false;
  }, 1600);
}

// Shared product card used by the home and shop pages
function createProductCard(shoe) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.shoeId = shoe.id;

  card.addEventListener("click", (e) => {
    if (e.target.closest(".add-to-bag")) return;
    window.location.href = `/pages/product.html?id=${shoe.id}`;
  });

  const media = document.createElement("div");
  media.className = "card-media";
  const img = document.createElement("img");
  img.src = shoeImage(shoe);
  img.alt = shoe.name;
  img.loading = "lazy";
  media.appendChild(img);

  const body = document.createElement("div");
  body.className = "card-body";

  const meta = document.createElement("p");
  meta.className = "card-meta";
  meta.textContent = [shoe.category, shoe.style].filter(Boolean).join(" · ");

  const name = document.createElement("h3");
  name.className = "product-name";
  name.textContent = shoe.name;

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = `£${shoe.price}`;

  const btn = document.createElement("button");
  btn.className = "add-to-bag";
  btn.textContent = "Add to Bag";
  btn.addEventListener("click", () => {
    addToBag(shoe.name, `£${shoe.price}`, shoeImage(shoe), shoe.id);
    flashAdded(btn);
  });

  body.append(meta, name, price, btn);
  card.append(media, body);
  return card;
}

document.addEventListener("DOMContentLoaded", updateCounter);
