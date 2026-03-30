const CART_API = "http://localhost:8000";

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

document.addEventListener("DOMContentLoaded", () => {
  updateCounter();

  document.querySelectorAll(".card").forEach((card) => {
    const btn = card.querySelector(".add-to-bag");
    if (!btn) return;

    const name = card.querySelector(".product-name").textContent;
    const price = card.querySelector(".product-price").textContent;
    const image = card.querySelector("img").src;
    const shoeId = card.dataset.shoeId;

    btn.addEventListener("click", () => {
      addToBag(name, price, image, shoeId);

      btn.textContent = "Added!";
      btn.style.background = "#c9922a";
      btn.style.borderColor = "#c9922a";
      setTimeout(() => {
        btn.textContent = "Add to Bag";
        btn.style.background = "";
        btn.style.borderColor = "";
      }, 1200);
    });
  });
});
