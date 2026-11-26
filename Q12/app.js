require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Stripe = require("stripe");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const CURRENCY = (process.env.STRIPE_CURRENCY || "inr").toLowerCase();
const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
    items: [{
        productId: String,
        name: String,
        price: Number,
        quantity: Number
    }],
    total: Number,
    paymentStatus: { type: String, default: "pending" },
    checkoutSessionId: String
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

function handleAsync(route) {
    return (request, response, next) => {
        route(request, response).catch(next);
    };
}

function requireSeller(request, response, next) {
    if (!process.env.SELLER_PASSWORD) {
        return response.status(503).json({ error: "Set SELLER_PASSWORD in .env." });
    }

    if (request.get("x-seller-password") !== process.env.SELLER_PASSWORD) {
        return response.status(401).json({ error: "Seller password is incorrect." });
    }

    next();
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/products", handleAsync(async (request, response) => {
    const products = await Product.find().sort({ name: 1 });
    response.json(products);
}));

app.post("/api/products", requireSeller, handleAsync(async (request, response) => {
    const body = request.body || {};
    const product = await Product.create({
        name: body.name,
        description: body.description,
        price: body.price
    });

    response.status(201).json(product);
}));

app.put("/api/products/:id", requireSeller, handleAsync(async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.id)) {
        return response.status(400).json({ error: "Invalid product ID." });
    }

    const { name, description, price } = request.body || {};
    if (name === undefined || description === undefined || price === undefined) {
        return response.status(400).json({
            error: "Name, description, and price are required."
        });
    }

    const product = await Product.findByIdAndUpdate(
        request.params.id,
        { name, description, price },
        { new: true, runValidators: true }
    );

    if (!product) {
        return response.status(404).json({ error: "Product not found." });
    }

    response.json(product);
}));

app.post("/api/checkout", handleAsync(async (request, response) => {
    if (!stripe) {
        return response.status(503).json({ error: "Add your Stripe test key to .env." });
    }

    const cartItems = request.body && request.body.items;
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return response.status(400).json({ error: "Your cart is empty." });
    }

    const quantities = new Map();
    for (const item of cartItems) {
        if (!item ||
            !mongoose.isValidObjectId(item.productId) ||
            !Number.isInteger(item.quantity) ||
            item.quantity < 1 ||
            item.quantity > 20) {
            return response.status(400).json({ error: "Cart item is invalid." });
        }

        quantities.set(
            item.productId,
            (quantities.get(item.productId) || 0) + item.quantity
        );
        if (quantities.get(item.productId) > 20) {
            return response.status(400).json({ error: "Maximum quantity per product is 20." });
        }
    }

    const products = await Product.find({
        _id: { $in: Array.from(quantities.keys()) }
    });

    if (products.length !== quantities.size) {
        return response.status(400).json({ error: "A cart product no longer exists." });
    }

    const items = products.map((product) => ({
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: quantities.get(product._id.toString())
    }));

    const order = await Order.create({
        items,
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    });

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: items.map((item) => ({
                price_data: {
                    currency: CURRENCY,
                    unit_amount: Math.round(item.price * 100),
                    product_data: { name: item.name }
                },
                quantity: item.quantity
            })),
            metadata: { orderId: order._id.toString() },
            success_url: `${process.env.APP_URL || `http://localhost:${PORT}`}/?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.APP_URL || `http://localhost:${PORT}`}/?payment=cancelled`
        });

        await Order.findByIdAndUpdate(order._id, {
            checkoutSessionId: session.id
        });
        response.json({ checkoutUrl: session.url });
    } catch (error) {
        await Order.findByIdAndDelete(order._id);
        throw error;
    }
}));

app.get("/api/checkout/confirm/:sessionId", handleAsync(async (request, response) => {
    if (!stripe) {
        return response.status(503).json({ error: "Stripe is not configured." });
    }

    const session = await stripe.checkout.sessions.retrieve(request.params.sessionId);
    if (session.payment_status !== "paid" || !session.metadata.orderId) {
        return response.status(400).json({ error: "Payment is not complete." });
    }

    const order = await Order.findOneAndUpdate(
        { _id: session.metadata.orderId, checkoutSessionId: session.id },
        { paymentStatus: "paid" },
        { new: true }
    );

    if (!order) {
        return response.status(404).json({ error: "Order not found." });
    }

    response.json(order);
}));

app.get("/api/orders", handleAsync(async (request, response) => {
    const orders = await Order.find({ paymentStatus: "paid" }).sort({ createdAt: -1 });
    response.json(orders);
}));

app.use((error, request, response, next) => {
    if (error.name === "ValidationError" ||
        error.name === "CastError" ||
        error.type === "entity.parse.failed") {
        return response.status(400).json({ error: error.message });
    }

    console.error(error);
    response.status(500).json({ error: "Something went wrong. Check the server log." });
});

async function startServer() {
    if (!process.env.MONGODB_URI) {
        throw new Error("Set MONGODB_URI in .env before starting the application.");
    }
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_SECRET_KEY.startsWith("sk_test_")) {
        throw new Error("Add a Stripe test secret key (sk_test_...) to .env.");
    }
    await mongoose.connect(process.env.MONGODB_URI);

    if (await Product.countDocuments() === 0) {
        await Product.insertMany([
            { name: "Canvas Backpack", description: "Everyday backpack with roomy pockets.", price: 2499 },
            { name: "Desk Lamp", description: "Adjustable LED lamp for your workspace.", price: 1599 },
            { name: "Water Bottle", description: "Reusable stainless-steel bottle.", price: 799 }
        ]);
    }

    app.listen(PORT, () => {
        console.log(`Store running at http://localhost:${PORT}`);
    });
}

startServer().catch((error) => {
    console.error("Could not start the store:", error.message);
    process.exit(1);
});
