const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const products = [
    { name: "Laptop", price: 74999, category: "Electronics" },
    { name: "Notebook", price: 120, category: "Stationery" },
    { name: "Headphones", price: 2499, category: "Accessories" }
];

app.get("/", (request, response) => {
    response.render("home", { title: "Home", page: "home" });
});

app.get("/about", (request, response) => {
    response.render("about", { title: "About", page: "about" });
});

app.get("/products", (request, response) => {
    response.render("products", {
        title: "Products",
        page: "products",
        products
    });
});

app.get("/contact", (request, response) => {
    response.render("contact", {
        title: "Contact",
        page: "contact",
        result: null
    });
});

app.post("/contact", (request, response) => {
    const name = String(request.body.name || "").trim();
    const email = String(request.body.email || "").trim();
    const message = String(request.body.message || "").trim();

    if (!name || !email || !message) {
        return response.status(400).render("contact", {
            title: "Contact",
            page: "contact",
            result: { error: "Please fill in every field." }
        });
    }

    response.render("contact", {
        title: "Contact",
        page: "contact",
        result: {
            success: `Thank you, ${name}! Your message has been received.`
        }
    });
});

app.get("/api/products", (request, response) => {
    response.json({ count: products.length, products });
});

app.use((request, response) => {
    response.status(404).render("404", {
        title: "Page Not Found",
        page: ""
    });
});

app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
});
