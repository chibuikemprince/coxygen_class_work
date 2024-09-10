import { printHtmlReceipt, sendADA } from "./index.js";

// Select necessary DOM elements
const buyButtons = document.querySelectorAll(".buy-button");
const purchasedList = document.getElementById("purchasedList");
const purchasedItemsSection = document.getElementById("purchasedItems");
const toggleView = document.getElementById("toggleView");

localStorage.setItem("WALLET_CONNECTED", false);
// Retrieve purchased items from local storage or initialize an empty array

let purchasedItems = JSON.parse(localStorage.getItem("purchasedItems")) || [];

// Function to handle the purchase button click
async function handlePurchase(event) {
  const product = event.target.parentElement; // Get the parent product div
  const productName = product.querySelector("h3").innerText; // Get the product name
  const imgUrl = product.querySelector("img").src; // Get the product name
  const productPrice = Number(product.dataset.price); // Get the product price

  // Add the purchased item to the purchasedItems array
  purchasedItems.push({ name: productName, price: productPrice });
  // Save the updated array to local storage
  localStorage.setItem("purchasedItems", JSON.stringify(purchasedItems));

  // Alert the user of their purchase
  let WALLET_CONNECTED = localStorage.getItem("WALLET_CONNECTED");
  console.log({
    WALLET_CONNECTED,
    WALLET_CONNECTED_Bool: Boolean(WALLET_CONNECTED),
  });
  if (WALLET_CONNECTED == "false") {
    alert("Wallet not connect, refresh to connect wallet again");
  } else {
    // alert(`${productName} purchased for ${productPrice} Ada!`);
    const productData = { productName, productPrice, imgUrl };
    const sellerAddress =
      "addr_test1qrzwukf2fadpgt4cxqypd2em9utqrkcvgvry2674kpkt869akcdlt7uxz2fvxg9k9jmx0rscuhglkemcuwcynhe8ztgqq6e5r2";
    console.log(productData);
    const myWalletData = localStorage.getItem("walletData");
    await sendADA(
      sellerAddress,
      productPrice,
      JSON.parse(myWalletData),
      productData
    );
    printHtmlReceipt(productName, productPrice, imgUrl);
  }
}

// Add click event listeners to each buy button
buyButtons.forEach((button) => {
  button.addEventListener("click", handlePurchase);
});

// Function to toggle between viewing products and purchased items
function toggleViewHandler() {
  /*
  if (toggleView.value === "products") {
    purchasedItemsSection.style.display = "none"; // Hide purchased items
    document.getElementById("products").style.display = "block"; // Show products
  } else {
    document.getElementById("products").style.display = "none"; // Hide products
    purchasedItemsSection.style.display = "block"; // Show purchased items
    renderPurchasedItems(); // Render the list of purchased items
  }

  */
}

//toggleView.addEventListener("change", toggleViewHandler);

// Function to render the list of purchased items
function renderPurchasedItems() {
  purchasedList.innerHTML = ""; // Clear the current list
  if (purchasedItems.length === 0) {
    purchasedList.innerHTML = "<p>No items purchased yet.</p>"; // Display a message if no items
    return;
  }

  // Create product elements for each purchased item
  purchasedItems.forEach((item) => {
    const productDiv = document.createElement("div");
    productDiv.className = "product";
    productDiv.innerHTML = `
            <h3>${item.name}</h3>
            <p>Price: ${item.price} Ada</p>
        `;
    purchasedList.appendChild(productDiv); // Add the product to the purchased list
  });
}
