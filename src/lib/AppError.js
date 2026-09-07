class ApiError extends Error {
    constructor(message, statusCode, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;
    }

    static badRequest(message, errors) {
        return new ApiError(message, 400, errors);
    }
    static unauthorized(message) {
        return new ApiError(message || 'Unauthorized', 401);
    }
    static forbidden(message) {
        return new ApiError(message || 'Forbidden', 403);
    }
    static notFound(message) {
        return new ApiError(message || 'Not Found', 404);
    }
    static tooManyRequests(message) {
        return new ApiError(message || 'Too Many Requests', 429);
    }
    static internal(message) {
        return new ApiError(message || 'Internal Server Error', 500);
    }
}

module.exports = ApiError;
