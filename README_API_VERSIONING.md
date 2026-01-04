# API URL Structure Explanation

This document explains the reasoning behind the URL pattern: `/api/v1/auth`.

## Breakdown

### 1. `/api`
*   **Purpose**: Namespace.
*   **Why**: It clearly separates "application endpoints" (that return JSON/XML data) from "web pages" (HTML/CSS/JS).
*   **Benefit**: If you later decide to serve your React frontend from the same server, your frontend routes (e.g., `/home`, `/login`) won't conflict with your backend data routes.

### 2. `/v1` (Version 1)
*   **Purpose**: Versioning.
*   **Why**: APIs change over time. Someday, you might want to change how login works entirely (e.g., different response format) in a way that would break existing apps using your API.
*   **Benefit**:
    *   **Backward Compatibility**: You can create `/api/v2/auth` for the new method while keeping `/api/v1/auth` active.
    *   **Safe Upgrades**: Old mobile apps or third-party integrations continue working on `v1` while you build new features on `v2`.

### 3. `/auth` (Resource)
*   **Purpose**: Resource or Domain identification.
*   **Why**: It groups related functionality.
*   **Benefit**:
    *   Everything under `/auth` handles authentication (login, register).
    *   Everything under `/users` handles user management.
    *   Everything under `/products` handles products.
    *   This makes the API intuitive and organized (RESTful design).

## Summary in Code

In `app.js`:
```javascript
app.use('/api/v1/auth', authRoutes);
```

This means **any** route defined inside `authRoutes.js` will automatically have this prefix.

*   If `authRoutes` defines a route `/login`...
*   The final URL becomes: **`http://localhost:5000/api/v1/auth/login`**
