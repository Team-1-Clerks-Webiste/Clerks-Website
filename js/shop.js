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

    // Clear existing product rows
    productsSection.innerHTML = "";

    // Create rows with 2 products each
    for (let i = 0; i < shoes.length; i += 2) {
      const rowDiv = document.createElement("div");
      rowDiv.className = "rows";

      const gridDiv = document.createElement("div");
      gridDiv.className = "product-grid";

      // First product in row
      const card1 = createProductCard(shoes[i], i + 1);
      gridDiv.appendChild(card1);

      // Second product in row (if exists)
      if (i + 1 < shoes.length) {
        const card2 = createProductCard(shoes[i + 1], i + 2);
        gridDiv.appendChild(card2);
      }

      rowDiv.appendChild(gridDiv);
      productsSection.appendChild(rowDiv);
    }
  } catch (error) {
    console.error("Error loading shoes:", error);
  }
}

// Create a product card element
function createProductCard(shoe, id) {
  const card = document.createElement("div");
  card.className = "card";
  card.setAttribute("data-shoe-id", id);

  const img = document.createElement("img");
  img.src = "../assets/mens_sports.png"; // Default image
  img.alt = shoe.name;

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const productName = document.createElement("p");
  productName.className = "product-name";
  productName.textContent = shoe.name;

  const productPrice = document.createElement("p");
  productPrice.className = "product-price";
  productPrice.textContent = `£${shoe.price}`;

  const addButton = document.createElement("button");
  addButton.className = "add-to-bag";
  addButton.textContent = "Add to Bag";
  addButton.onclick = () => addToCart(shoe.name, shoe.price);

  cardBody.appendChild(productName);
  cardBody.appendChild(productPrice);
  cardBody.appendChild(addButton);

  card.appendChild(img);
  card.appendChild(cardBody);

  return card;
}

// Add to cart function
function addToCart(productName, productPrice) {
  console.log(`Added ${productName} to cart - £${productPrice}`);
  // You can integrate this with your existing cart logic
}

// Load shoes when the page loads
document.addEventListener("DOMContentLoaded", loadShoes);
