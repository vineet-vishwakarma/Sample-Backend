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