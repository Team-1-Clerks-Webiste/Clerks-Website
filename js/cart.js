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

function addToBag(name, price, image) {
  const cart = getCart();
  cart.push({ name, price, image });
  saveCart(cart);
  updateCounter();
}

document.addEventListener("DOMContentLoaded", () => {
  updateCounter();

  document.querySelectorAll(".card").forEach((card) => {
    const btn = card.querySelector(".add-to-bag");
    if (!btn) return;

    const name = card.querySelector(".product-name").textContent;
    const price = card.querySelector(".product-price").textContent;
    const image = card.querySelector("img").src;

    btn.addEventListener("click", () => {
      addToBag(name, price, image);

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
