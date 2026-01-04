# Update Product Function Explanation

This document explains the logic behind the `updateProduct` function in `src/controllers/productController.js`.

```javascript
exports.updateProduct = async (req, res) => { ... }
```

## Step-by-Step Breakdown

### 1. Verify Product Exists
```javascript
let product = await Product.findById(req.params.id);

if (!product) {
    return res.status(404).json({
        success: false,
        message: `Product not found with id of ${req.params.id}`
    });
}
```
*   **Goal**: Before we try to update anything, we must make sure the product actually exists in the database.
*   **`req.params.id`**: This matches the `:id` in your route URL (e.g., `/products/123`).
*   **Logic**: If `findById` returns `null` (not found), we immediately stop and send a `404 Not Found` error. This prevents crashing or silent failures later.

### 2. Perform the Update
```javascript
product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
});
```
*   **Goal**: Apply the changes sent by the user (`req.body`) to the database.
*   **`req.body`**: Contains the fields to verify updates (e.g., `{ "price": 150, "name": "New Name" }`).
*   **Options Object** (Very Important):
    *   **`new: true`**: By default, Mongoose returns the *original* document (before update). Setting this to `true` tells Mongoose to return the **updated** version so we can show it to the user.
    *   **`runValidators: true`**: By default, Mongoose updates do *not* run schema validators (like checking if 'price' is a number). Setting this to `true` forces Mongoose to check your data against the Model rules.

### 3. Send Success Response
```javascript
res.status(200).json({
    success: true,
    data: product
});
```
*   **Goal**: Tell the client the operation worked and give them the new data.
*   **Status 200**: Standard "OK" status code.

### Why find it twice?
You might notice we fetch the product first (`findById`), and then update it (`findByIdAndUpdate`).
*   **Why?**: The primary reason to fetch it first is often to perform checks *before* updating. For example: "Does this product belong to this user?" or "Is this user an admin?".
*   In your current code, since only admins can access this route (checked by middleware), strict ownership checks might be less critical, but verifying existence first is still a good practice for clear error messaging.
