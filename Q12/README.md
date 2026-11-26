# Q12 E-commerce demo

The app uses Express, MongoDB, and Stripe Checkout in test mode. It includes a
product catalogue, cart, seller add/edit panel, and a list of paid orders.

## Setup

1. Make sure MongoDB is running locally or use a MongoDB Atlas URI.
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI`, your Stripe **test** secret key, and a seller password.
4. Install and start the app:

   ```powershell
   npm install
   npm start
   ```

Open `http://localhost:3000`. After checkout, the app verifies the payment
directly with Stripe before marking the order successful. Test Checkout with
Stripe's test card
`4242 4242 4242 4242`, a future expiry date, and any three-digit CVC. Never use
live keys or real card details for this demo.

The seller panel uses the password configured as `SELLER_PASSWORD`. Product
prices are read from MongoDB on the server when checkout starts; the browser
does not decide the amount to charge.
