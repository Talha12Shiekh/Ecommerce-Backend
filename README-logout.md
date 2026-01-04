# Logout Functionality

## Overview
The logout functionality is designed to securely terminate a user's session. Since the current implementation mainly relies on JWTs (JSON Web Tokens) which are often stored on the client-side (e.g., localStorage), the "logout" action involves two parts:
1.  **Backend**: Clearing any server-set cookies (if applicable).
2.  **Frontend**: Removing the token from the client's storage.

## Backend Implementation
The backend provides a specific endpoint for logout:
-   **Endpoint**: `GET /api/v1/auth/logout`
-   **Access**: Public

### How it works
When this endpoint is hit:
1.  It sets the `token` cookie to `none` and sets its expiration to a short time in the future (10 seconds). This effectively deletes the cookie from the browser if it was set.
2.  It returns a standard JSON success response:
    ```json
    {
      "success": true,
      "data": {}
    }
    ```

## Frontend Implementation Guide
To fully log the user out, the frontend application should perform the following steps:

1.  **Call the Logout Endpoint**: Make a request to the backend logout endpoint.
    ```javascript
    fetch('/api/v1/user/logout');
    ```
2.  **Clear Local Storage**: If the JWT was stored in `localStorage`, remove it.
    ```javascript
    localStorage.removeItem('token');
    ```
3.  **Redirect**: Redirect the user to the login page or home page.

## Notes
-   Cannot invalidate a standard JWT token on the server-side without a database blacklist mechanism.
-   The critical step for security in a stateless JWT setup is **deleting the key from the client**.
