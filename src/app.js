// Importing the Express framework, which provides tools to create and manage a web server in Node.js.
import express from "express"; 

// Importing the CORS (Cross-Origin Resource Sharing) middleware to allow/deny requests from different domains.
import cors from "cors";

// Importing cookie-parser middleware to parse cookies attached to the client-side requests.
import cookieParser from "cookie-parser";

// Creating an instance of an Express application, which will serve as the foundation for handling routes, middleware, and other app logic.
const app = express(); 

app.use(cors({
    // Enabling CORS with specific configurations. The 'origin' is set from the environment variable to restrict which domains can make requests.
    origin: process.env.CORS_ORIGIN, 
    
    // Allowing credentials (such as cookies) to be sent in cross-origin requests.
    credentials: true, 
}));

// Middleware that parses incoming JSON requests. It allows the application to handle JSON-formatted data in requests.
app.use(express.json());

// Middleware to parse URL-encoded data from incoming requests. The 'extended: true' option allows for rich objects and arrays to be encoded into the URL.
app.use(express.urlencoded({ extended: true }));

// Using cookie-parser to parse cookies attached to client requests, making them available via 'req.cookies'.
app.use(cookieParser());

// import router
import userRouter from "./routes/user.routes.js"

// routes declaration
app.use("/api/v1/users", userRouter);

// Exporting the 'app' instance for use in other parts of the application, such as initializing the server and defining routes.
export { app }; 
