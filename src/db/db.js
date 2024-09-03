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