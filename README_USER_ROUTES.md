# User Routes Explanation (`src/routes/userRoutes.js`)

This document provides a detailed explanation of the code within `src/routes/userRoutes.js`. This file defines the API routes for managing users, specifically restricted to administrators.

## Code Breakdown

### 1. Imports

```javascript
const express = require('express');
const { getAllUsers, getSingleUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
```
*   **`express`**: The Express framework is imported to access the Router factory.
*   **Controller Functions**: `getAllUsers` and `getSingleUser` are imported from the `userController`. These functions contain the logic for fetching data from the database.
*   **Middleware**:
    *   `protect`: Ensures a user is authenticated (logged in).
    *   `authorize`: Checks if the authenticated user has specific privileges (e.g., 'admin').

### 2. Router Initialization

```javascript
const router = express.Router();
```
*   Initializes a new `Router` object. This creates a mini-application capable of performing middleware and routing functions, which can later be mounted in the main app.

### 3. Applying Global Restrictions

```javascript
// Apply protection and authorization to all routes
router.use(protect);
router.use(authorize('admin'));
```
*   **`router.use(...)`**: This method applies middleware to **all** routes defined *after* this point in the file.
*   **Security Layer**:
    1.  First, `protect` runs to verify the user's JWT token.
    2.  Second, `authorize('admin')` runs to check if the user's role is indeed 'admin'.
*   **Benefit**: This avoids repetition. We don't need to add `protect` and `authorize` to every single route manually. Any route added to this file is automatically secured.

### 4. Defining Routes

#### Root Route (`/`)
```javascript
router.get('/', getAllUsers);
```
*   **Path**: Matches the base path where this router is mounted (likely `/api/v1/users`).
*   **Method**: `GET`.
*   **Action**: Calls `getAllUsers` to return a list of all users.

#### ID Route (`/:id`)
```javascript
router.get('/:id', getSingleUser);
```
*   **Path**: Matches the base path followed by an ID (e.g., `/api/v1/users/12345`).
*   **Param**: `:id` acts as a variable parameter to capture the specific user's ID.
*   **Method**: `GET`.
*   **Action**: Calls `getSingleUser` to return details for that specific user.

### 5. Export

```javascript
module.exports = router;
```
*   Exports the configured router so it can be imported and used in the main application file (`app.js`).
