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