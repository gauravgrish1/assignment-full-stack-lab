const productList = document.getElementById("product-list");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const cartMessage = document.getElementById("cart-message");
const productForm = document.getElementById("product-form");
const sellerMessage = document.getElementById("seller-message");

let products = [];
let editingId = "";
let cart = JSON.parse(localStorage.getItem("q12-cart") || "{}");

function priceText(price) {
    return `₹${Number(price).toFixed(2)}`;
}

function showMessage(element, text, isError = false) {
    element.textContent = text;
    element.className = isError ? "message error" : "message success";
}

async function request(url, options = {}) {
    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "Request failed.");
    }

    return result;
}

async function loadProducts() {
    products = await request("/api/products");
    productList.replaceChildren();

    for (const product of products) {
        const card = document.createElement("article");
        card.className = "product-card";

        const name = document.createElement("h3");
        name.textContent = product.name;
        const description = document.createElement("p");
        description.textContent = product.description;
        const price = document.createElement("strong");
        price.textContent = priceText(product.price);

        const actions = document.createElement("div");
        actions.className = "product-actions";
        const addButton = document.createElement("button");
        addButton.className = "button";
        addButton.textContent = "Add to cart";
        addButton.addEventListener("click", () => addToCart(product._id));
        const editButton = document.createElement("button");
        editButton.className = "button secondary";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editProduct(product));

        actions.append(addButton, editButton);
        card.append(name, description, price, actions);
        productList.appendChild(card);
    }

    renderCart();
}

function addToCart(productId) {
    cart[productId] = (cart[productId] || 0) + 1;
    saveCart();
    renderCart();
}

function saveCart() {
    localStorage.setItem("q12-cart", JSON.stringify(cart));
}

function renderCart() {
    cartItems.replaceChildren();
    let total = 0;
    let count = 0;

    for (const [productId, quantity] of Object.entries(cart)) {
        const product = products.find((item) => item._id === productId);
        if (!product) continue;

        total += product.price * quantity;
        count += quantity;

        const row = document.createElement("div");
        row.className = "cart-row";
        const details = document.createElement("span");
        details.textContent = `${product.name} × ${quantity} — ${priceText(product.price * quantity)}`;
        const remove = document.createElement("button");
        remove.className = "text-button";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => {
            delete cart[productId];
            saveCart();
            renderCart();
        });
        row.append(details, remove);
        cartItems.appendChild(row);
    }

    if (count === 0) {
        cartItems.textContent = "Your cart is empty.";
    }

    cartCount.textContent = count;
    cartTotal.textContent = `Total: ${priceText(total)}`;
}

document.getElementById("checkout-button").addEventListener("click", async () => {
    const items = Object.entries(cart).map(([productId, quantity]) => ({
        productId,
        quantity
    }));

    try {
        const result = await request("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items })
        });
        window.location.href = result.checkoutUrl;
    } catch (error) {
        showMessage(cartMessage, error.message, true);
    }
});

function editProduct(product) {
    editingId = product._id;
    document.getElementById("product-name").value = product.name;
    document.getElementById("product-description").value = product.description;
    document.getElementById("product-price").value = product.price;
    document.getElementById("save-product").textContent = "Save changes";
    document.getElementById("cancel-edit").hidden = false;
    document.getElementById("seller").scrollIntoView({ behavior: "smooth" });
}

function clearProductForm() {
    editingId = "";
    productForm.reset();
    document.getElementById("save-product").textContent = "Add product";
    document.getElementById("cancel-edit").hidden = true;
}

document.getElementById("cancel-edit").addEventListener("click", clearProductForm);

productForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const product = {
        name: document.getElementById("product-name").value,
        description: document.getElementById("product-description").value,
        price: Number(document.getElementById("product-price").value)
    };
    const password = document.getElementById("seller-password").value;

    try {
        await request(editingId ? `/api/products/${editingId}` : "/api/products", {
            method: editingId ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                "x-seller-password": password
            },
            body: JSON.stringify(product)
        });
        clearProductForm();
        showMessage(sellerMessage, "Product saved.");
        await loadProducts();
    } catch (error) {
        showMessage(sellerMessage, error.message, true);
    }
});

async function loadOrders() {
    const orders = await request("/api/orders");
    const orderList = document.getElementById("order-list");
    orderList.replaceChildren();

    if (orders.length === 0) {
        orderList.textContent = "No successful orders yet.";
        return;
    }

    for (const order of orders) {
        const card = document.createElement("article");
        card.className = "order-card";
        const title = document.createElement("strong");
        title.textContent = `Order ${order._id} — ${priceText(order.total)}`;
        const items = document.createElement("p");
        items.textContent = order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ");
        card.append(title, items);
        orderList.appendChild(card);
    }
}

async function checkPaymentReturn() {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (params.get("payment") === "cancelled") {
        showMessage(cartMessage, "Payment was cancelled. Your cart is still here.", true);
    }

    if (sessionId) {
        try {
            await request(`/api/checkout/confirm/${encodeURIComponent(sessionId)}`);
            cart = {};
            saveCart();
            showMessage(cartMessage, "Payment successful. Your order is confirmed.");
            await loadOrders();
        } catch (error) {
            showMessage(cartMessage, error.message, true);
        }
        history.replaceState({}, "", "/");
    }
}

async function startStore() {
    try {
        await loadProducts();
        await loadOrders();
        await checkPaymentReturn();
    } catch (error) {
        showMessage(document.getElementById("store-message"), error.message, true);
    }
}

startStore();
