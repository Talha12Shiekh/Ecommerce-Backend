# Category Management

This document details the API endpoints for managing Product Categories.

## Endpoints

### 1. Create Category (Admin)
*   **URL**: `/api/v1/categories`
*   **Method**: `POST`
*   **Access**: Private (Admin)
*   **Body**:
    ```json
    { "name": "Living Room" }
    ```

### 2. Get All Categories (Public)
*   **URL**: `/api/v1/categories`
*   **Method**: `GET`
*   **Access**: Public
*   **Response**: List of all categories.

### 3. Get Single Category (Public)
*   **URL**: `/api/v1/categories/:id`
*   **Method**: `GET`
*   **Access**: Public

### 4. Update Category (Admin)
*   **URL**: `/api/v1/categories/:id`
*   **Method**: `PATCH`
*   **Access**: Private (Admin)
*   **Body**:
    ```json
    { "name": "Living Room Updated" }
    ```

### 5. Delete Category (Admin)
*   **URL**: `/api/v1/categories/:id`
*   **Method**: `DELETE`
*   **Access**: Private (Admin)

---

## Products by Category

### Get Products by Category (Public)
*   **URL**: `/api/v1/products/category/:id`
*   **Method**: `GET`
*   **Access**: Public
*   **Response**: List of products belonging to the specified category ID.
