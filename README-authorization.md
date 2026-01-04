# Role-Based Authorization

The `authorize` function in `authMiddleware.js` is a **Middleware Factory** used for restricting access to specific user roles (e.g., 'admin', 'publisher').

## How it Works

```javascript
exports.authorize = (...roles) => {  // 1. Accepts allowed roles
    return (req, res, next) => {     // 2. Returns a middleware function
        // 3. Checks if the logged-in user's role is in the allowed list
        if (!roles.includes(req.user.role)) {
            // 4. Verification failed: 403 Forbidden
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        // 5. Verification passed: Proceed to controller
        next();
    };
};
```

1.  **Arguments (`...roles`)**: It takes a list of allowed roles. Example: `authorize('admin', 'moderator')`.
2.  **Dependency**: It **MUST** properly run *after* the `protect` middleware. This is because it relies on `req.user.role`, and `req.user` is only set by the `protect` middleware.

## Where is it used?

It is used in your route files (like `authRoutes.js`) to protect specific endpoints.

### Example Usage

If you wanted to create a route that only **Admins** can access:

```javascript
const { protect, authorize } = require('../middleware/authMiddleware');

// Route: DELETE /api/v1/auth/users/:id
// Only an 'admin' can delete users
router.delete('/users/:id', 
    protect,             // 1. First, check if user is logged in
    authorize('admin'),  // 2. Second, check if user is an admin
    deleteUser           // 3. Finally, run the controller
);
```

### Current Status
Currently, it is **defined but not used** in any active route. You can start using it whenever you implement admin-only features (like managing products, categories, or other users).
