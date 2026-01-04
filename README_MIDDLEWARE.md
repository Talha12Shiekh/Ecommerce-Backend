# Express Middleware Explanation

You asked for an explanation of these four lines in `app.js`:

```javascript
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, './public')));
app.use(fileUpload());
```

Here is exactly what each one does:

## 1. `app.use(express.json());`
*   **The Problem**: By default, Express **cannot read** JSON data sent in the `body` of a request (like when you send data from Postman or a React frontend). `req.body` would be `undefined`.
*   **The Solution**: This middleware listens for requests with `Content-Type: application/json`. It parses the incoming JSON data and puts it into the `req.body` object so you can use it (e.g., `req.body.name`).

## 2. `app.use(cors());`
*   **The Problem**: Browsers have a security feature called **CORS** (Cross-Origin Resource Sharing). It blocks a frontend running on one port (like `localhost:3000`) from talking to a backend on a different port (your `localhost:5000`) unless the backend explicitly says "It's okay".
*   **The Solution**: This middleware adds special headers (like `Access-Control-Allow-Origin: *`) to every response, telling the browser "Yes, allow other websites to talk to this API".

## 3. `app.use(express.static(...));`
*   **The Problem**: You want to show images or files directly in the browser (like `http://localhost:5000/uploads/my-image.jpg`), but Express routes normally look for code functions, not files.
*   **The Solution**: This tells Express to treat the `./public` folder as a **public file server**.
    *   `path.join(__dirname, './public')`: detailed calculation of the absolute path to your `public` folder.
    *   **Result**: If you put `cat.png` in `src/public/`, you can access it at `localhost:5000/cat.png`.

## 4. `app.use(fileUpload());`
*   **The Problem**: Uploading files uses a special encoding called `multipart/form-data`. Neither `express.json()` nor standard Express can understand this format.
*   **The Solution**: This middleware (from the `express-fileupload` library) parses that complex format.
    *   It takes any uploaded files and places them into a special `req.files` object.
    *   It also gives you the `.mv()` function to easily save the file to disk.
