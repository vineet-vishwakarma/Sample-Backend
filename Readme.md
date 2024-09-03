## Step 1 
- Folder/File Structure 

## Step 2 
- Install neccessary packages like (mongoose, express, cors, cookie-parser, dotenv)

## Step 3
- Create a new file called .env and add your MongoDB connection string to it.
- Create a constant DB_NAME in the constants.js file

## Step 4 (DB Connection)
- Establish connection with the MongoDB (location: src\db\db.js)
```javascript []
// Importing Mongoose, which is a library that provides a MongoDB object data modeling (ODM) solution for Node.js.
import mongoose from "mongoose";

// Importing a constant 'DB_NAME' from another file (likely a configuration file or constants.js), 
// which contains the name of the database to connect to.
import { DB_NAME } from "../constants.js";

// Asynchronous function to connect to the MongoDB database using Mongoose.
const connectDB = async() => {
    try {
        // Attempt to connect to MongoDB using the URI stored in environment variable 'MONGODB_URI'.
        // The database name is appended to this URI.
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        
        // If the connection is successful, log a success message with the MongoDB host.
        console.log(`\nMongoDB Connected ✅: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        // If there's an error during the connection attempt, log an error message with details.
        console.log("⚠️ MongoDB connection Failed !!!", error);
        
        // Exit the Node.js process with a failure code (1), indicating that the connection failed.
        process.exit(1);
    }
}

// Exporting the 'connectDB' function so it can be used in other parts of the application.
export { connectDB };
```
## Step 5 (Initiates App)
- Create app by using express framework (location src\app.js)
```javascript []
// Importing the Express framework, which is used to create a web server and handle HTTP requests in Node.js.
import express from "express"; 

// Creating an instance of an Express application. This 'app' object is used to define routes, middleware, and other application logic.
const app = express(); 

// Exporting the 'app' instance so it can be imported and used in other files, such as in setting up the server or handling routes.
export { app }; 
```

## Step 6 (Start the Server)
- Start the server by using the app instance (location src\index.js)
```javascript []
// Importing the dotenv package, which loads environment variables from a .env file into process.env.
import dotenv from "dotenv";

// Importing the connectDB function from the db.js file to establish a MongoDB connection.
import { connectDB } from "./db/db.js";

// Importing the Express application instance (app) from app.js, which handles HTTP requests.
import app from "./app.js";

// Configuring dotenv to load environment variables from a .env file located in the project's root directory.
dotenv.config({
    path: './.env'
});

connectDB()
// If the MongoDB connection is successful, the following code is executed.
.then(() => {
    
    // Listening for a custom event "Server Initiation Failed" on the app object.
    app.on("Server Initiation Failed ⚠️ !!!", (error) => {
        console.log("Error", error);
        throw error;
    });

    // Starting the Express server, listening on a port defined in the .env file or defaulting to port 8000.
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at ${process.env.PORT || 8000}`);
    });
})
// If MongoDB connection fails, this block handles the error.
.catch((error) => {
    console.error("MongoDB Connection Failed ⚠️ !!!", error);
});
```

## Step 7 (Config Middlewares)
- Importing and config middleware such as cors & cookie-parser (location: src/app.js).
``` javascript []
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

// Exporting the 'app' instance for use in other parts of the application, such as initializing the server and defining routes.
export { app }; 
```

## Step 8 (Utils)
- asyncHandler
``` javascript []
// asyncHandler is a higher-order function that takes in a request handler (requestHandler) as an argument.
// It returns a new asynchronous function that wraps the original request handler with error handling logic.
const asyncHandler = (requestHandler) => async (req, res, next) => {

    try {
        // The function tries to execute the original request handler passed as an argument.
        // 'await' ensures that the asynchronous request handler completes before proceeding.
        await requestHandler(req, res, next);

        // If an error occurs during the execution of the request handler, it is caught in this catch block.
    } catch (error) {

        // The error is handled by sending a JSON response with the error's status code (or 500 by default) and a message.
        // This ensures that the client receives a proper error response in case something goes wrong.
        res.status(error.code || 500).json({
            success: false,
            message: error.message,
        });
    }
}
```
- ApiError (Streamline the Api Error)
``` javascript []
class ApiError extends Error {
// Calling the parent constructor (Error) with the message argument.
    constructor( 
        statusCode, 
        message = "Something went wrong", 
        errors = [], 
        stack = ""
    ) {
        super(message);

        // Assigning the custom properties to the ApiError instance.
        
        // HTTP status code for the error (e.g., 400, 404, 500).
        this.statusCode = statusCode; 
        // Placeholder property, can be used to attach additional data if needed.
        this.data = null; 
        // Indicates the success status, set to false since this is an error.
        this.success = false; 
        // An array of specific errors or validation issues related to the error.
        this.errors = errors; 

        // If a stack trace is provided, set it to the stack property.
        if (stack) {
            this.stack = stack;
            // If no stack trace is provided, capture the current stack trace.
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
```

- ApiResponse (Streamline the Api Response)
``` javascript []
class ApiResponse {
    constructor(
        // The HTTP status code for the response (e.g., 200, 201, 404, etc.).
        statusCode, 
        // The data to be sent in the response body (could be any type: object, array, etc.).
        data,       
        // A message for the response, defaulting to "Success".
        message = "Success"
    ) {
        // Assigning the provided status code to the instance.
        this.statusCode = statusCode; 
        // Assigning the provided data to the instance.
        this.data = data; 
        // Assigning the provided message or default message to the instance.
        this.message = message; 
        // A boolean indicating whether the request was successful, based on the status code.
        // If the status code is less than 400, success is true; otherwise, it's false.
        this.success = statusCode < 400; 
    }
}
```