const productList = document.getElementById("product-list");
const productForm = document.getElementById("product-form");

async function loadProducts() {
    const response = await fetch("/api/products");
    const products = await response.json();

    productList.innerHTML = "";

    for (const product of products) {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <h2>${product.name}</h2>
            <p>ID: ${product.id}</p>
            <p>Price: ₹${product.price}</p>
            <p>Rating: ${product.rating}</p>
        `;
        productList.appendChild(card);
    }
}

productForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const product = {
        name: document.getElementById("name").value,
        price: document.getElementById("price").value,
        rating: document.getElementById("rating").value
    };

    const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
    });

    productForm.reset();
    loadProducts();
});

loadProducts();
