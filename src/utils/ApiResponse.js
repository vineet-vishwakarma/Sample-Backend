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