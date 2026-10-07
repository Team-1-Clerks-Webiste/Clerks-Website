document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const shoeId = params.get("id");

  if (!shoeId) {
    console.error("No shoe ID provided");
    return;
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/shoes/${shoeId}`);
    const shoe = await response.json();

    if (shoe.error) {
      console.error("Shoe not found");
      return;
    }

    // Populate product page
    document.querySelector(".product-name").textContent = shoe.NAME;
    document.querySelector(".product-price").textContent = `£${shoe.PRICE}`;
    document.querySelector(".product-colour").textContent = shoe.COLOR || "";
    document.querySelector(".product-available-colours").textContent =
      shoe.COLOR ? `Available Colours: ${shoe.COLOR}` : "";

    // Update main product image
    const mainImg = document.querySelector(".left_content img");
    const imgSrc = shoe.IMAGE ? `/${shoe.IMAGE}` : "/assets/mens_sports.png";
    if (mainImg) {
      mainImg.src = imgSrc;
      mainImg.alt = shoe.NAME;
    }

    // Update colour thumbnail images
    document.querySelectorAll(".colour-image").forEach((thumb) => {
      thumb.src = imgSrc;
      thumb.alt = shoe.NAME;
    });

    // Update description
    const descEl = document.querySelector(".product-description");
    if (descEl) {
      descEl.textContent = shoe.MATERIAL
        ? `Material: ${shoe.MATERIAL}. Category: ${shoe.CATEGORY}. Style: ${shoe.STYLE}.`
        : "";
    }

    // Update page title
    document.title = `Clerks - ${shoe.NAME}`;

    // Set up Add to Bag button
    const addBtn = document.querySelector(".add-to-bag");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        if (typeof addToBag === "function") {
          addToBag(
            shoe.NAME,
            `£${shoe.PRICE}`,
            shoe.IMAGE ? `/${shoe.IMAGE}` : "/assets/mens_sports.png",
            shoe.ID,
          );
          addBtn.textContent = "Added!";
          addBtn.disabled = true;
          setTimeout(() => {
            addBtn.textContent = "Add to Bag";
            addBtn.disabled = false;
          }, 2000);
          if (typeof updateCounter === "function") {
            updateCounter();
          }
        }
      });
    }
  } catch (error) {
    console.error("Error loading product:", error);
  }
});
