document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");
  if (!nav) return;

  // --- Burger button ---
  const burger = document.createElement("button");
  burger.id = "burger-btn";
  burger.setAttribute("aria-label", "Open menu");
  burger.innerHTML = "<span></span><span></span><span></span>";
  nav.appendChild(burger);

  // --- Mobile overlay ---
  const overlay = document.createElement("div");
  overlay.id = "mobile-menu";

  const closeBtn = document.createElement("button");
  closeBtn.id = "close-menu";
  closeBtn.setAttribute("aria-label", "Close menu");
  closeBtn.textContent = "\u00d7";

  const mobileUl = document.createElement("ul");

  // Clone links from the existing nav list
  const existingItems = nav.querySelectorAll(".links ul li");
  existingItems.forEach((li) => {
    mobileUl.appendChild(li.cloneNode(true));
  });

  overlay.appendChild(closeBtn);
  overlay.appendChild(mobileUl);
  document.body.appendChild(overlay);

  // --- Toggle logic ---
  function openMenu() {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  burger.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);

  mobileUl.querySelectorAll("li").forEach((li) => {
    li.addEventListener("click", closeMenu);
  });

  // Close and reset when viewport widens past mobile breakpoint
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
});
