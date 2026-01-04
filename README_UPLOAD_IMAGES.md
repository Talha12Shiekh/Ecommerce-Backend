# Product Image Upload Implementation

This document details how the "Upload Product Image" feature was implemented.

## 1. Dependencies
We installed **`express-fileupload`**:
```bash
npm install express-fileupload
```
This library provides middleware that parses `multipart/form-data` requests (which are used for file uploads) and makes the uploaded files accessible via `req.files`.

## 2. Server Configuration (`src/app.js`)

We added two key lines to `app.js`:

### Middleware Setup
```javascript
const fileUpload = require('express-fileupload');
app.use(fileUpload());
```
*   **What it does**: Intercepts requests. If a file is uploaded, it places it into `req.files`.

### Static Folder Setup
```javascript
const path = require('path');
app.use(express.static(path.join(__dirname, './public')));
```
*   **What it does**: Tells Express to serve files inside `src/public` as if they were invalid root URLs.
*   **Example**: If you have a file at `src/public/uploads/image.jpg`, you can access it via `http://localhost:5000/uploads/image.jpg`.

## 3. Controller Logic (`src/controllers/productController.js`)

The function `uploadProductImage` handles the actual upload logic:

1.  **Check for content**:
    ```javascript
    if (!req.files) ...
    ```
    Ensures a file was actually sent.

2.  **Handle Multiple Files**:
    ```javascript
    const productImages = req.files.image;
    const images = [].concat(productImages); // Ensure array
    ```
    We detect if `req.files.image` is a single object or an array. By using `[].concat()`, we ensure we always work with an array loop, supporting both single and multiple file uploads.

3.  **Validate & Move (Loop)**:
    We loop through each image:
    *   **Validate Type**: Check `mimetype` (must be image).
    *   **Validate Size**: Check `size` (must be < 1MB).
    *   **Move File**: Use `.mv()` to save to `public/uploads`.
    *   **Collect Path**: Add the public URL to a list.

4.  **Response**:
    Returns an object with a list of uploaded paths:
    ```json
    {
      "success": true,
      "message": "Images uploaded",
      "data": ["/uploads/img1.jpg", "/uploads/img2.jpg"]
    }
    ```

## 4. Route (`src/routes/productRoutes.js`)

```javascript
router.post("/upload", uploadProductImage);
```
*   Maps `POST /api/v1/products/upload` to the controller function.
*   Note: While we added `protect` and `authorize` middleware globally in this file, this route is thus also protected.
