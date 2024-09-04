// Importing the Cloudinary SDK, specifically version 2, for handling media uploads.
import { v2 as cloudinary } from "cloudinary";

// Importing the file system module (fs) to handle file operations such as deleting files.
import fs from "fs";

// Configuring Cloudinary with credentials (cloud name, API key, and API secret) from environment variables.
// These credentials are needed to authenticate API requests with Cloudinary.
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        // If no file path is provided, return null. This prevents the function from attempting to upload an invalid file.
        if (!localFilePath)
            return null;

        // Uploading the file to Cloudinary. The `resource_type: "auto"` option allows Cloudinary to automatically detect the file type (image, video, etc.).
        // The file is uploaded from the provided local file path.
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // Log the success message and the URL of the uploaded file to the console.
        console.log("File uploaded successfully!!!", response.url);

        // Return the response from Cloudinary, which contains details about the uploaded file, including its URL.
        return response;

    } catch (error) {
        // If an error occurs during the upload, the local file is deleted using `fs.unlinkSync()` to clean up.
        fs.unlinkSync(localFilePath);
        
        // Return null to indicate that the upload failed.
        return null;
    }
}

// Exporting the `uploadOnCloudinary` function for use in other parts of the application.
export { uploadOnCloudinary };
