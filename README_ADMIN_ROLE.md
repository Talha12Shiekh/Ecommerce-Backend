# Admin Role Implementation

This document explains the implementation of the Admin Role feature in the E-commerce Backend.

## Overview

The admin role allows specific users to access privileged routes, such as managing users. This is achieved through:
1.  **User Model**: A `role` field in the `User` schema (defaulting to 'user', can be 'admin').
2.  **Middleware**: An `authorize` middleware that checks if the authenticated user has the required role.
3.  **Routes**: Special routes that are protected by both authentication and role authorization.

## Components

### 1. User Model (`src/models/User.js`)

The `role` field was added to the schema:

```javascript
role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
},
```

### 2. Authorization Middleware (`src/middleware/authMiddleware.js`)

The `authorize` function checks the user's role:

```javascript
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};
```

### 3. User Controller (`src/controllers/userController.js`)

New controller functions were added to handle admin-only operations:
-   `getAllUsers`: Retrieves all users.
-   `getSingleUser`: Retrieves a user by ID.

### 4. User Routes (`src/routes/userRoutes.js`)

Routes were created and protected:

```javascript
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);       // Ensure user is logged in
router.use(authorize('admin')); // Ensure user is an admin

router.route('/').get(getAllUsers);
router.route('/:id').get(getSingleUser);
```

## Usage

### Creating an Admin
To create an admin, register a user with `"role": "admin"`.

**Endpoint:** `POST /api/v1/auth/register`

**Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

### Accessing Admin Routes
Include the admin's JWT token in the Authorization header.

**Endpoint:** `GET /api/v1/users`

**Header:**
```
Authorization: Bearer <your_admin_token>
```

**Response:**
Returns a list of all registered users.

## Security Note

In a production environment, you might want to restrict the ability to register as an 'admin' directly through the public registration route detailed above. Typically, admins are created manually in the database or via a special internal tool.
