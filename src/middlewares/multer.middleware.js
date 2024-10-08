// Importing the Multer middleware, which is used for handling multipart/form-data (primarily for file uploads) in Node.js.
import multer from "multer";

// The `destination` option is a function that specifies where the uploaded files will be stored on the disk.
// In this case, files will be saved to the "./public/temp" directory.
const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        // The callback `cb` is called with two arguments: `null` (indicating no error) and the destination path.
        cb(null, "./public/temp");
    },
    // The `filename` option is a function that defines the naming convention for the uploaded files.
    filename: function (req, file, cb) {

        // The callback `cb` is called with `null` (indicating no error) and a unique filename.
        // The filename is generated by appending the current timestamp to the original file name,
        // ensuring that files have unique names and don't overwrite existing files.
        cb(null, `${file.originalname}_${Date.now()}`);
    }
});

// The Multer middleware is configured using the custom `storage` engine defined above, 
// which stores uploaded files in the specified directory with unique filenames.
// This `upload` instance can be used as middleware in routes to handle file uploads.
export const upload = multer({ 
    storage 
});
