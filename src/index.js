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
