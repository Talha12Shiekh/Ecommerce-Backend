# Upload Function Logic Explanation

Here is the step-by-step breakdown of the `uploadProductImage` function you asked about.

```javascript
exports.uploadProductImage = async (req, res) => { ... }
```

## Step 1: Check if File Exists
```javascript
if (!req.files) {
    return res.status(400).json({ ... });
}
```
*   **What it does**: Checks if the request actually contains any files. `req.files` is populated by the `express-fileupload` middleware.
*   **Why**: If the user forgot to attach a file, we stop here.

## Step 2: Normalize to Array (Critical Step)
```javascript
const productImages = req.files.image;
const images = [...productImages]; // CAUTION: Potential Bug Here
```
*   **Intent**: The goal is to make sure `images` is always an **Array**, so we can loop over it later.
*   **How it works**:
    *   `req.files.image`: Can be a single **Object** (if 1 file) or an **Array** (if multiple files).
    *   **The Issue**: The spread syntax `[...variable]` **only works if the variable is iterable** (like an array).
    *   **Bug Warning**: If the user uploads a **single file**, `req.files.image` is an *Object* (not iterable). Using `[...obj]` will cause a **crash** (`TypeError: productImages is not iterable`).
    *   **Fix**: Use `const images = [].concat(productImages);` instead. This safely handles both single objects and arrays.

## Step 3: Prepare for Loop
```javascript
const uploadedImagePaths = [];
const maxSize = 1024 * 1024; // 1MB
```
*   `uploadedImagePaths`: An empty list to store the paths of successfully uploaded files.
*   `maxSize`: Sets a 1 Megabyte limit.

## Step 4: Process Each Image (The Loop)
```javascript
for (const image of images) { ... }
```
We iterate through every file in the `images` array.

### A. Validate Type
```javascript
if (!image.mimetype.startsWith('image')) { ... }
```
*   Checks if the file is truly an image (e.g., `image/jpeg`, `image/png`). Rejects PDFs, text files, etc.

### B. Validate Size
```javascript
if (image.size > maxSize) { ... }
```
*   Checks if the file is larger than 1MB.

### C. Construct Path & Move
```javascript
const imagePath = path.join(__dirname, '../public/uploads/' + `${image.name}`);
await image.mv(imagePath);
```
*   **`imagePath`**: calculate the full absolute path on the server where the file will reach.
*   **`image.mv(imagePath)`**: "Move" the file from temporary memory to that final location on the disk.

### D. Store Public Path
```javascript
uploadedImagePaths.push(`/uploads/${image.name}`);
```
*   We save the relative path (e.g., `/uploads/car.jpg`) to our list. This is the URL the frontend will use.

## Step 5: Send Response
```javascript
res.status(200).json({
    success: true,
    message: 'Images uploaded',
    data: uploadedImagePaths
});
```
*   Returns the array of all uploaded image URLs.
