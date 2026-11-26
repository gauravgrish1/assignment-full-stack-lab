const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let nextId = 4;
let products = [
    { id: 1, name: "Laptop", price: 74999, rating: 4.8 },
    { id: 2, name: "Headphones", price: 2499, rating: 4.5 },
    { id: 3, name: "Smart Watch", price: 4999, rating: 4.2 }
];

app.get("/api/products", (request, response) => {
    response.json(products);
});

app.post("/api/products", (request, response) => {
    const product = {
        id: nextId++,
        name: request.body.name,
        price: Number(request.body.price),
        rating: Number(request.body.rating)
    };

    products.push(product);
    response.status(201).json(product);
});

app.listen(PORT, () => {
    console.log(`Product API running at http://localhost:${PORT}`);
});
