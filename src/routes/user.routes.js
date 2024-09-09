import { Router } from "express"; // Import the Router class from Express to create a router instance
import { loginUser, registerUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js"; // Import user controller functions for handling authentication and user management
import { upload } from "../middleware/multer.middleware.js"; // Import the upload middleware for handling file uploads
import { verifyJWT } from "../middleware/auth.middleware.js"; // Import the middleware to verify JWT tokens

// Create a new router instance
const router = Router(); 

// Route for user registration
router.route("/register").post(
    upload.fields([ //middleware
        {
            name: "profilePicture", 
            maxCount: 1
        }
    ]),
    registerUser // Attach the registerUser controller function to handle POST requests to /register
);

// Route for user login
router.route("/login").post(loginUser); // Attach the loginUser controller function to handle POST requests to /login

// Route for user logout
router.route("/logout").post(verifyJWT, logoutUser); // Attach the verifyJWT middleware to ensure the user is authenticated before logging out, then call the logoutUser controller function

// Route for refreshing the access token
router.route("/refresh-token").post(refreshAccessToken); // Attach the refreshAccessToken controller function to handle POST requests to /refresh-token

// Export the router instance for use in other parts of the application
export default router; 