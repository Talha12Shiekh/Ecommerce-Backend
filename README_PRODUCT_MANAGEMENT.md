# Product Management (Admin Side)

This document explains the implementation of Product Management features, starting with "Add Product".

## Overview

Admins can create new products via the API. This ensures that only authorized personnel can add items to the store.

## Endpoints

### Create Product
*   **URL**: `/api/v1/products`
*   **Method**: `POST`
*   **Access**: Private (Admin only)
*   **Headers**:
    *   `Authorization`: `Bearer <admin_token>`

#### Request Body
```json
{
    "name": "Product Name",
    "price": 99.99,
    "description": "Product Description",
    "category": "category_id_here",
    "company": "ikea",
    "colors": ["#000000"]
}
```

#### Success Response (201 Created)
```json
{
    "success": true,
    "data": {
        "_id": "...",
        "name": "Product Name",
        "price": 99.99,
        "user": "admin_user_id",
        ...
    }
}
```

### Update Product
*   **URL**: `/api/v1/products/:id`
*   **Method**: `PATCH`
*   **Access**: Private (Admin)
*   **Headers**: `Authorization: Bearer <token>`

#### Request Body (example)
```json
{
    "price": 250,
    "description": "Updated description"
}
```

#### Success Response (200 OK)
Returns the updated product object.

### Delete Product
*   **URL**: `/api/v1/products/:id`
*   **Method**: `DELETE`
*   **Access**: Private (Admin)
*   **Headers**: `Authorization: Bearer <token>`

#### Success Response (200 OK)
```json
{
    "success": true,
    "message": "Product deleted"
}
```

### Upload Product Image
*   **URL**: `/api/v1/products/upload`
*   **Method**: `POST`
*   **Access**: Private (Admin)
*   **Headers**: 
    *   `Authorization: Bearer <token>`
    *   `Content-Type: multipart/form-data`
*   **Body**: Form-data with key `image` containing the file.

#### Success Response (200 OK)
```json
{
    "success": true,
    "message": "Images uploaded",
    "data": [
        "/uploads/filename1.jpg",
        "/uploads/filename2.jpg"
    ]
}
```

## Implementation Details

### Product Model (`src/models/Product.js`)
*   `image`: Type `[String]` (Array of strings). Default array containing example image.

### Controller (`src/controllers/productController.js`)
*   `createProduct`: Handles product creation.
*   `updateProduct`: Handles product updates (admin only).
*   `deleteProduct`: Handles product deletion (admin only).
*   `uploadProductImage`: Handles image upload, saves to `public/uploads`.

### Routes (`src/routes/productRoutes.js`)
*   Protected by `protect` (valid JWT) and `authorize('admin')`.

## Verification
You can verify this using the `verify_product.js` script.
