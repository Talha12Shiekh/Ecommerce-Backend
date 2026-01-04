# Product Categories Features (Proposal)

Based on the existing `Category` model, here are the standard features we should implement for the Admin:

## 1. Manage Categories (Admin Only)

### **Create Category**
*   **Action**: Add a new category (e.g., "Office", "Living Room").
*   **Logic**: Must be unique. The backend will check if the name already exists.
*   **Endpoint**: `POST /api/v1/categories`

### **Update Category**
*   **Action**: Rename a category.
*   **Endpoint**: `PATCH /api/v1/categories/:id`

### **Delete Category**
*   **Action**: Remove a category for good.
*   **Endpoint**: `DELETE /api/v1/categories/:id`

## 2. Public Access

### **View All Categories**
*   **Action**: Comparison shopping / filtering requires seeing all categories.
*   **Endpoint**: `GET /api/v1/categories` (Publicly accessible)

### **View Single Category**
*   **Action**: Get details of a specific category.
*   **Endpoint**: `GET /api/v1/categories/:id`

## Why is this important?
*   Products rely on `category` IDs.
*   Admins need a way to create these IDs without manually editing the database.
*   Users need the list of categories to filter products on the frontend.
