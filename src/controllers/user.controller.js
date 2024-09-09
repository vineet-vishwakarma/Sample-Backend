import { asyncHandler } from "../utils/asyncHandler.js" // Importing the asyncHandler utility to handle async errors
import { ApiError } from "../utils/ApiError.js" // Importing the ApiError class to handle API errors
import { User } from "../models/user.models.js" // Importing the User model for database operations
import { ApiResponse } from "../utils/ApiResponse.js" // Importing the ApiResponse class to format API responses
import { uploadOnCloudinary } from "../utils/cloudinary.js" // Importing the function to upload images to Cloudinary
import jwt from "jsonwebtoken"; // Importing the jsonwebtoken library for token management

// Function to generate access and refresh tokens for a user
const generateAccessAndRefreshToken = async (userId) => {
    try {
        // Fetch the user by ID
        const user = await User.findById(userId); 
        // Generate access token
        const accessToken = user.generateAccessToken(); 
        // Generate refresh token
        const refreshToken = user.generateRefreshToken(); 

        // Save the refresh token in the user document
        user.refreshToken = refreshToken; 
        // Save the user without validation
        await user.save({ validateBeforeSave: false }); 

        // Return the generated tokens
        return { accessToken, refreshToken }; 

        // Handle errors
    } catch (error) {
        throw new ApiError(500, "Error while generating Tokens"); 
    }
}

// Handler to register a new user
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body; // Destructure request body

    // Check if all required fields are provided
    if ([email, username, password].some(field => !field.trim())) {
        throw new ApiError(400, "All fields are required !!!");
    }

    // Check if user already exists by email or username
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    // Handle user existence conflict
    if (existedUser) {
        throw new ApiError(409, "User already exists !!!"); 
    }

    let profilePictureLocalPath;
    // Check if a profile picture file is uploaded
    if (req.files && Array.isArray(req.files.profilePicture) && req.files.profilePicture.length > 0) {
        profilePictureLocalPath = req.files.profilePicture[0].path; // Get the local path of the uploaded file
    }

    // Upload the profile picture to Cloudinary
    const profilePicture = await uploadOnCloudinary(profilePictureLocalPath);

    // Create a new user in the database
    const user = await User.create({
        username,
        email,
        password,
        profilePicture: profilePicture?.url || "https://i.sstatic.net/l60Hf.png" // Set a default profile picture if none is provided
    });

    // Retrieve the created user without sensitive information
    const createdUser = await User.findById(user._id).select("-password -refreshToken"); 

    // Handle registration failure
    if (!createdUser) {
        throw new ApiError(500, "User Registration Failed"); 
    }

    // Send a success response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully") 
    );
});

// Handler to log in a user
const loginUser = asyncHandler(async (req, res) => {
    // Destructure request body
    const { email, username, password } = req.body; 

    // Check if either username or email is provided
    if (!username && !email) {
        throw new ApiError(400, "Username and Email are required !!!");
    }

    // Find the user by email or username
    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    // Handle user not found
    if (!user) {
        throw new ApiError(404, "User does not exist !!!"); 
    }

    // Verify the password
    const isPasswordValid = await user.isPasswordCorrect(password); 

    // Handle incorrect password
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password !!!"); 
    }

    // Generate tokens for the user
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id); 

    // Retrieve the logged-in user without sensitive information
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken"); 

    const options = {
        httpOnly: true,
        secure: true
    };

    // Send response with cookies for tokens
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User Logged In Successfully !!!"
            )
        );
});

// Handler to log out a user
const logoutUser = asyncHandler(async (req, res) => {
    console.log("logout");

    // Update the user document to clear the refresh token
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    // Clear cookies for tokens and send a success response
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User Logged Out Successfully"
            )
        );
});

// Handler to refresh the access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    // Get refresh token from cookies or body
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken; 

    // Handle missing refresh token
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request"); 
    }

    try {
        // Verify the refresh token
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET 
        );

        // Find user by ID from token
        const user = await User.findById(decodedToken?._id); 

        // Handle invalid token
        if (!user) {
            throw new ApiError(401, "Invalid refresh token"); 
        }

        // Handle token expiration or reuse
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used"); 
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        // Generate new tokens
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        // Handle errors in token verification
        throw new ApiError(401, error?.message || "Invalid refresh token"); 
    }
});

// Handler to change a user's password
const changePassword = asyncHandler(async (req, res) => {
    // Destructure request body
    const { oldPassword, newPassword } = req.body; 

    // Find user by ID from the request
    const user = await User.findById(req.user._id); 
    // Verify the old password
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword); 

    // Handle incorrect old password
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Incorrect Password"); 
    }

    // Set the new password
    user.password = newPassword; 
    // Save the user with the new password
    await user.save({ validateBeforeSave: false }); 

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password changed successfully"
            )
        );
});

// Handler to get the current logged-in user's details
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "User retrieved successfully"
        )
    );
});

// Handler to update the profile picture of a user
const updateProfilePicture = asyncHandler(async (req, res) => {
    // Get the local path of the uploaded profile picture
    const profilePictureLocalPath = req.file?.path; 

    // Handle missing profile picture
    if (!profilePictureLocalPath) {
        throw new ApiError(400, "Profile Picture is required"); 
    }

    // Upload the new profile picture to Cloudinary
    const profilePicture = await uploadOnCloudinary(profilePictureLocalPath);

    // Handle upload failure
    if (!profilePicture.url) {
        throw new ApiError(400, "Error while uploading Profile Picture"); 
    }

    // Update the user's profile picture in the database
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { profilePicture: profilePicture.url }
        },
        { new: true }
    ).select("-password");

    return res.status(200)
        .json(new ApiResponse(
            200,
            {},
            "Profile Picture updated successfully"
        ));
});

// Export all the handlers for
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateProfilePicture,
}; 
