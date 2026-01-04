# Logout with Local Storage

Since the application issues a JWT (JSON Web Token) that is sent in the response body (not a cookie), the client (Frontend) is responsible for storing and managing this token, typically in `localStorage`.

## How Logout Works in this Scenario

In a stateless JWT authentication system using `localStorage`, the server does not "store" the session. Therefore, the server cannot "destroy" the session solely on its own.

### The "Logout" Action
The logout process is primarily a **Client-Side Action**.

1.  **Frontend**: The frontend application must delete the token from the browser's storage.
2.  **Backend**: The `/logout` endpoint we created is mainly for:
    -   Logging purposes (tracking when users sign out).
    -   Clearing any cookies (if you switch to cookie-based auth in the future).
    -   Implementing "Token Blacklisting" (advanced, see below).

### Implementation Steps

#### 1. Frontend Logic (React/JS Example)
When the user clicks "Logout", run this function:

```javascript
// Function to handle logout
function handleLogout() {
  // 1. Remove the token from storage
  localStorage.removeItem('token'); 
  // OR sessionStorage.removeItem('token'); depending on where you saved it

  // 2. (Optional) Notify the server
  fetch('http://localhost:5000/api/v1/auth/logout', { method: 'GET' });

  // 3. Redirect user to login or home
  window.location.href = '/login';
}
```

#### 2. Backend Logic (Existing)
The current `/logout` endpoint in `authController.js` is perfectly fine. It will return a 200 OK.
```javascript
exports.logout = async (req, res) => {
    // Even if you don't use cookies, this response confirms the server processed the request
    res.status(200).json({
        success: true,
        data: {}
    });
};
```

## Advanced: Secure Server-Side Logout (Blacklisting)

If you require the server to **invalidate** a token immediately (so it cannot be used even if stolen), `localStorage.removeItem` is not enough. You must implement **Token Blacklisting**.

**How Token Blacklisting Works:**
1.  **Logout Request**: When `/logout` is called, the client sends the current token.
2.  **Store Token**: The server saves this specific token (or its ID) into a database (e.g., Redis or MongoDB `BlacklistToken` collection) with a TTL (Time To Live) equal to the token's remaining validity.
3.  **Middleware Check**: Create a middleware (e.g., `protect`) that runs on every authenticated request:
    -   It verifies the token signature (standard JWT check).
    -   **New Step**: It checks if the token exists in the `Blacklist`. If yes, it rejects the request (`401 Unauthorized`).

*Note: The current implementation is the standard "Stateless" approach. Blacklisting adds complexity and database/cache overhead.*
