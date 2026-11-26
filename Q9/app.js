const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let nextId = 4;
let products = [
    {
        id: 1,
        name: "Laptop",
        price: 74999,
        description: "A portable computer for work and study"
    },
    {
        id: 2,
        name: "Headphones",
        price: 2499,
        description: "Wireless over-ear headphones"
    },
    {
        id: 3,
        name: "Notebook",
        price: 120,
        description: "A ruled notebook for notes"
    }
];

function validateProduct(body, isUpdate = false) {
    const name = String(body.name ?? "").trim();
    const description = String(body.description ?? "").trim();
    const price = Number(body.price);

    if (!isUpdate) {
        if (!name || !description || body.price === undefined) {
            return "Product name, price, and description are required.";
        }
    } else if (body.name !== undefined && !name) {
        return "Product name cannot be empty.";
    } else if (body.description !== undefined && !description) {
        return "Product description cannot be empty.";
    }

    if (body.price !== undefined && (!Number.isFinite(price) || price < 0)) {
        return "Price must be a non-negative number.";
    }

    return null;
}

app.get("/", (request, response) => {
    response.json({
        message: "Product REST API",
        routes: {
            "GET /api/products": "List all products",
            "GET /api/products/:id": "Get one product",
            "POST /api/products": "Create a product",
            "PUT /api/products/:id": "Replace a product",
            "DELETE /api/products/:id": "Delete a product"
        }
    });
});

app.get("/api/products", (request, response) => {
    response.json({ count: products.length, products });
});

app.get("/api/products/:id", (request, response) => {
    const id = Number(request.params.id);
    const product = products.find((item) => item.id === id);

    if (!product) {
        return response.status(404).json({ error: "Product not found." });
    }

    response.json(product);
});

app.post("/api/products", (request, response) => {
    const error = validateProduct(request.body);
    if (error) {
        return response.status(400).json({ error });
    }

    const product = {
        id: nextId++,
        name: String(request.body.name).trim(),
        price: Number(request.body.price),
        description: String(request.body.description).trim()
    };

    products.push(product);
    response.status(201).json(product);
});

app.put("/api/products/:id", (request, response) => {
    const id = Number(request.params.id);
    const index = products.findIndex((item) => item.id === id);

    if (index === -1) {
        return response.status(404).json({ error: "Product not found." });
    }

    const error = validateProduct(request.body);
    if (error) {
        return response.status(400).json({ error });
    }

    products[index] = {
        id,
        name: String(request.body.name).trim(),
        price: Number(request.body.price),
        description: String(request.body.description).trim()
    };

    response.json(products[index]);
});

app.delete("/api/products/:id", (request, response) => {
    const id = Number(request.params.id);
    const index = products.findIndex((item) => item.id === id);

    if (index === -1) {
        return response.status(404).json({ error: "Product not found." });
    }

    const deletedProduct = products[index];
    products.splice(index, 1);
    response.json({ message: "Product deleted.", product: deletedProduct });
});

app.use((request, response) => {
    response.status(404).json({ error: "Route not found." });
});

app.listen(PORT, () => {
    console.log(`Product CRUD server running at http://localhost:${PORT}`);
});
