# Protected Routes

## Overview
Protected routes are endpoints that require the user to be authenticated. This application uses **JSON Web Tokens (JWT)** to handle authentication.

## How it Works
1.  **Login/Register**: When a user logs in or registers, the server returns a `token` in the response body.
2.  **Accessing Protected Routes**: To access a protected route (like `/api/v1/auth/me`), the client **MUST** send this token in the HTTP Request Header.

## Request Header Format
The token must be sent in the `Authorization` header using the `Bearer` schema.

```http
Authorization: Bearer <your_jwt_token_here>
```

## Middleware Logic (`authMiddleware.js`)
We use a custom middleware function `protect` that runs before the controller:
1.  **Extracts Token**: Checks for the `Authorization` header starting with `Bearer`.
2.  **Verifies Token**: Uses `jwt.verify` to check if the token is valid and not expired.
3.  **Finds User**: Fetches the user associated with the token from the database.
4.  **Attaches User**: Adds the user object to the request (`req.user`) so the controller can access it.
5.  **Rejection**: If any step fails (no token, invalid token), it returns a `401 Unauthorized` error.

## Example: `/me` Endpoint
The `/api/v1/auth/me` endpoint is a simple protected route that returns the current logged-in user's data.

**Request:**
```http
GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "_id": "60d0fe2f5311236168a109ca",
    "name": "John Doe",
    "email": "john@gmail.com",
    "role": "user"
  }
}
```

**Response (Error - No Token):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```
