import { ApiError } from "../utils/ApiError.js"; // Import the ApiError class for handling API errors
import { asyncHandler } from "../utils/asyncHandler.js"; // Import the asyncHandler utility for managing async errors
import jwt from "jsonwebtoken"; // Import the jsonwebtoken library for JWT operations
import { User } from "../models/user.models.js"; // Import the User model to interact with the user database

// Middleware to verify JWT and attach the user to the request object
const verifyJWT = asyncHandler(async (req, _, next) => {
    // Log the request body (for debugging purposes)
    console.log(req.body); 

    try {
        // Extract token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // Check if token is present
        if (!token) {
            throw new ApiError(401, "Unauthorized request"); // Throw error if token is missing
        }

        // Verify the token using the ACCESS_TOKEN_SECRET
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the user by ID from the decoded token and exclude sensitive fields
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        // Check if the user exists
        if (!user) {
            throw new ApiError(401, "Invalid Access Token"); // Throw error if user is not found
        }

        // Attach the user to the request object
        req.user = user;

        // Call the next middleware function
        next();
    } catch (error) {
        // Handle errors and throw API error
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

// Export the middleware for use in other parts of the application
export { verifyJWT }; 