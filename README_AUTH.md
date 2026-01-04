# Authentication Flow Explained: User Registration

This document details the step-by-step flow of the User Registration feature, explaining how data moves from the client to the database and how security is handled using `bcryptjs` and `jsonwebtoken`.

## Overview of the Flow

1.  **Client initiates request** (User submits registration form).
2.  **Server receives request** (Express route listens for POST).
3.  **Controller processes data** (Validates and prepares user data).
4.  **Model handles security** (Hashes password before saving).
5.  **Database saves user** (MongoDB stores the record).
6.  **Token generation** (JWT created for the new user).
7.  **Response sent** (Client receives token and user info).

---


---

## Feature Workflow: User Login

1.  **Client Request:** A `POST` request is sent to `/api/v1/auth/login` with `email` and `password`.
2.  **Route Handling:** The request hits `src/routes/authRoutes.js`, which calls the `login` function in `src/controllers/authController.js`.
3.  **Controller Logic:**
    -   Validates that both email and password are provided.
    -   Finds the user by email in the database.
    -   **Password Verification:** Calls `user.matchPassword(password)` to compare the provided password with the stored hash.
    -   **Token Generation:** If matches, generates a JWT using `user.getSignedJwtToken()`.
4.  **Response:** The server responds with the token.

### POST /api/v1/auth/login

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secretpassword"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "data": { ... }
}
```

## Detailed Step-by-Step Breakdown

### Step 1: The Route (`src/routes/authRoutes.js`)
The entry point for the request. We defined a route that listens for `POST` requests at `/register`.

```javascript
router.post('/register', register);
```
-   **What happens:** When someone sends data to `http://localhost:5000/api/v1/auth/register`, this line tells Express to run the `register` function located in the controller.

### Step 2: The Controller (`src/controllers/authController.js`)
The `register` function is the "brain" of this operation.

1.  **Destructuring:** It extracts `name`, `email`, `password`, and `role` from `req.body`.
2.  **Validation:** It checks `User.findOne({ email })` to see if the user already exists.
3.  **Creation:** If the user is new, it calls `User.create({ ... })`.

```javascript
const user = await User.create({
    name,
    email,
    password, // This is still plain text here!
    role
});
```

const user = await User.create({
    name,
    email,
    password, // This is still plain text here!
    role
});
```

### Important Note on Security: `.select('+password')`
In `src/controllers/authController.js` (Login), you will see:
```javascript
const user = await User.findOne({ email }).select('+password');
```
We set `select: false` in the `User` model for the password field. This means normally, when we fetch a user, the password (hash) is **excluded** for security.
However, during login, we *need* the password hash to compare it with what the user typed. `.select('+password')` tells Mongoose: "I know it's hidden, but I need it this time."

### Step 3: The Model Middlewear (`src/models/User.js`)
**Crucial Security Step:** Before the user is actually saved to MongoDB, Mongoose runs a "Pre-Save Hook".

#### Password Hashing with `bcryptjs`
We don't want to save the plain text password.
1.  **Hook:** `userSchema.pre('save', ...)` intercepts the save process.
2.  **Salt:** `bcrypt.genSalt(10)` creates a random string (salt) to ensure two identical passwords don't have the same hash.
3.  **Hash:** `bcrypt.hash(this.password, salt)` mixes the password with the salt and scrambles it into a secure string.
4.  **Save:** The *hashed* password replaces the plain one in the user object.

```javascript
this.password = await bcrypt.hash(this.password, salt);
```

### Step 4: Token Generation (`src/models/User.js`)
After the user is successfully created and saved, we need to log them in immediately by giving them an access token.

#### JWT with `jsonwebtoken`
We call the custom method `user.getSignedJwtToken()`.
1.  **Payload:** We pack the user's `id` and `role` into the token.
2.  **Sign:** We sign it using `process.env.JWT_SECRET`. This ensures that only our server can validate this token later.
3.  **Return:** The function returns a long string (the JWT).

```javascript
return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, ...);
```

### Detailed Code Breakdown

Here is a deep dive into the specific security methods used in `src/models/User.js`:

#### 1. Pre-Save Hook (Password Encryption)
```javascript
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
```
-   **`userSchema.pre('save', ...)`**: This is Mongoose middleware. It runs *before* the `save()` event.
-   **`!this.isModified('password')`**: Efficiency check. If the user is just updating their name or email, we don't want to re-hash an already hashed password. If the password hasn't changed, `next()` skips to the saving part.
-   **`bcrypt.genSalt(10)`**: Generates a "salt" with 10 rounds. A salt is random data added to the password. "10 rounds" means the algorithm runs 2^10 times, making it computationally expensive for attackers to crack.
-   **`bcrypt.hash(...)`**: Takes the plain password and the salt, and returns the encrypted string.

#### 2. Password Comparison Method
```javascript
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
```
-   **`userSchema.methods`**: Adds a custom method to every `User` document. You can call `user.matchPassword(...)` on any user object found in the database.
-   **`bcrypt.compare(...)`**: This is the magic. It takes the plain text password (e.g., "secret123") and the hash from the database (e.g., "$2a$10$..."). It re-hashes the plain text with the **same salt** found inside the hash string and checks if they match. It returns `true` or `false`.

#### 3. JWT Generation Method
```javascript
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};
```
-   **`jwt.sign(...)`**: Creates the token.
-   **First Argument (Payload)**: The data we want to hide inside the token (`id` and `role`). This lets us know *who* the user is when they send the token back later.
-   **Second Argument (Secret)**: `process.env.JWT_SECRET`. This is a private key on the server. If someone tries to allow token, the signature won't match this secret, and we'll know it's fake.
-   **Third Argument (Options)**: `expiresIn` sets how long the token is valid (e.g., 30 days).
```

### Step 5: The Response
Back in the **Controller**, we now have the `user` (saved) and the `token`. We send them back to the client.

```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
    "data": {
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
    }
}
```

### Routing and App Integration Explained

In addition to the logic inside the model and controller, two files are crucial for wiring everything together: `authRoutes.js` and `app.js`.

#### 1. The Routes File (`src/routes/authRoutes.js`)
This directory is where we define *what* URL paths correspond to *which* controller functions.
```javascript
const express = require('express');
const { register } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);

module.exports = router;
```
-   **`express.Router()`**: Creates a mini-application that only handles routes. This keeps our main `app.js` clean.
-   **`router.post('/register', register)`**: This says "If a POST request comes to `/register` (relative to where we mount this router), run the `register` function."
    -   We use **POST** because we are sending sensitive data (password) in the body, which shouldn't be visible in the URL (unlike GET params).

#### 2. The Main App File (`src/app.js`)
This is the entry point where we load all our separate route files and tell Express to use them.
```javascript
const authRoutes = require('./routes/authRoutes');

// ... other middleware ...

// Mount routers
app.use('/api/v1/auth', authRoutes);
```
-   **Importing**: We require the router we just exported.
-   **`app.use('/api/v1/auth', authRoutes)`**: This is the "mounting" step. It tells Express: "Any request that starts with `/api/v1/auth` should be handled by `authRoutes`."
    -   So, when `authRoutes` defines `/register`, the *full* path becomes `/api/v1/auth/register`.
    -   This modular approach allows us to easily add more routes (like `/api/v1/products`) without cluttering one massive file.

---

### Bonus: Cookies vs. Headers for Token Storage

You might wonder: *allowed do we store this token on the client?* There are two main ways:

#### 1. HTTP Headers (Authorization: Bearer [token])
-   **How it works:** The client (React/Vue/Postman) stores the token in `localStorage` or memory. For every request, it manually adds `Authorization: Bearer <token>` to the headers.
-   **Pros:** Easy to work with for APIs. No CSRF (Cross-Site Request Forgery) vulnerability because code must explicitly attach the token.
-   **Cons:** Vulnerable to XSS (Cross-Site Scripting). If an attacker can inject JS into your site, they can read `localStorage` and steal the token.

#### 2. HttpOnly Cookies
-   **How it works:** The server sends the token in a cookie with the `HttpOnly` flag. The browser automatically sends this cookie with every subsequent request.
-   **Pros:** **More secure against XSS.** JavaScript cannot read `HttpOnly` cookies, so even if you have an XSS bug, the attacker can't easily steal the token.
-   **Cons:** Vulnerable to CSRF. You need extra protection (like SameSite flags or anti-CSRF tokens) to prevent malicious sites from tricking the user into making requests.

**Current Implementation:**
We are returning the token in the JSON body (`res.json({ token })`). This gives the frontend developer the flexibility to choose either method (usually putting it in Headers for simplicity).

---

## Summary of Libraries

| Library | Purpose | Where it's used |
| :--- | :--- | :--- |
| **bcryptjs** | Security. Turns `password123` into `$2a$10$X8...` so even admins can't see the real password. | `User.js` (pre-save hook) |
| **jsonwebtoken** | Authentication. Creates a digital "ID card" (token) that the user shows to access protected routes later. | `User.js` (method) |
