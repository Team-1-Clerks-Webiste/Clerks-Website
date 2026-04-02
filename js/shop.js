// Fetch shoes from the API and populate the shop
async function loadShoes() {
  try {
    const response = await fetch("http://127.0.0.1:8000/shoes");
    const shoes = await response.json();

    if (!shoes || shoes.length === 0) {
      console.log("No shoes found in the database");
      return;
    }

    // Get the products section
    const productsSection = document.querySelector(".products");

    // Clear existing product cards
    productsSection.innerHTML = "";

    // Create cards and append directly to products section
    shoes.forEach((shoe, index) => {
      const card = createProductCard(shoe, index + 1);
      productsSection.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading shoes:", error);
  }
}

// Create a product card element
function createProductCard(shoe, id) {
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

// Load shoes when the page loads
document.addEventListener("DOMContentLoaded", loadShoes);
