require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true }
});

const Product = mongoose.model("Product", productSchema);

function handleAsync(route) {
    return (request, response, next) => {
        route(request, response).catch(next);
    };
}

app.get("/", (request, response) => {
    response.send("Product API is running. Use /api/products to manage products.");
});

// Read all products
app.get("/api/products", handleAsync(async (request, response) => {
    const products = await Product.find();
    response.json(products);
}));

// Read one product
app.get("/api/products/:id", handleAsync(async (request, response) => {
    const product = await Product.findById(request.params.id);
    if (!product) {
        return response.status(404).json({ message: "Product not found" });
    }

    response.json(product);
}));

// Add a product
app.post("/api/products", handleAsync(async (request, response) => {
    const product = await Product.create({
        name: request.body.name,
        price: request.body.price,
        description: request.body.description
    });

    response.status(201).json(product);
}));

// Update a product
app.put("/api/products/:id", handleAsync(async (request, response) => {
    const product = await Product.findByIdAndUpdate(
        request.params.id,
        {
            name: request.body.name,
            price: request.body.price,
            description: request.body.description
        },
        { new: true, runValidators: true }
    );

    if (!product) {
        return response.status(404).json({ message: "Product not found" });
    }

    response.json(product);
}));

// Delete a product
app.delete("/api/products/:id", handleAsync(async (request, response) => {
    const product = await Product.findByIdAndDelete(request.params.id);
    if (!product) {
        return response.status(404).json({ message: "Product not found" });
    }

    response.json({ message: "Product deleted", product });
}));

app.use((error, request, response, next) => {
    if (error.name === "ValidationError" || error.name === "CastError") {
        return response.status(400).json({ message: error.message });
    }

    console.error(error);
    response.status(500).json({ message: "Server error" });
});

if (!process.env.MONGODB_URI) {
    console.error("Add MONGODB_URI to your .env file.");
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Could not connect to MongoDB:", error.message);
        process.exit(1);
    });
