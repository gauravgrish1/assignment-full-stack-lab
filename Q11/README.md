# Q11: Product CRUD API

This Express application stores products in MongoDB. Each product has a name,
price, and description.

## Run the application

1. Make sure MongoDB is running locally, or get a MongoDB Atlas connection URI.
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI` in `.env` to your MongoDB connection URI.
4. In this folder, run:

   ```bash
   npm install
   npm start
   ```

The API starts at `http://localhost:3000`. The database and `products`
collection are created by MongoDB when the first product is added.

## REST routes

| Method | Route | Action |
| --- | --- | --- |
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get one product |
| POST | `/api/products` | Add a product |
| PUT | `/api/products/:id` | Replace a product |
| DELETE | `/api/products/:id` | Delete a product |

Send JSON for POST and PUT, for example:

```json
{
  "name": "Keyboard",
  "price": 1299,
  "description": "A mechanical keyboard"
}
```
