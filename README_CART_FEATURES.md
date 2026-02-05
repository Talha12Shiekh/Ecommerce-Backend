# Cart Features

This document documents the `Cart` features.

## 1. Add to Cart

**POST** `/api/v1/cart`

**Access**: Private (Login required)

**Request Body:**

```json
{
    "productId": "64c9f1...",
    "amount": 2
}
```

**Success Response:**

```json
{
    "success": true,
    "data": {
        "_id": "64c9...",
        "cartItems": [
            {
                "name": "Product Name",
                "price": 100,
                "amount": 2,
                "product": "64c9f1...",
                "_id": "64c..."
            }
        ],
        "numItemsInCart": 2,
        "cartTotal": 200,
        "user": "64c8..."
    }
}
```

## Logic

1.  **Check Product**: Verify if the product exists.
2.  **Find User's Cart**: If doesn't exist, create a new one.
3.  **Update Item**:
    - If the product is already in the cart, increase the `amount`.
    - If not, push the new item to `cartItems`.
4.  **Recalculate**: Update `numItemsInCart` and `cartTotal` based on the new state.
