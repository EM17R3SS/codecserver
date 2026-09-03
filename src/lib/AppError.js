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
        return new ApiError(message || 'Требуется авторизация', 401);
    }
    static forbidden(message) {
        return new ApiError(message || 'Доступ запрещён', 403);
    }
    static notFound(message) {
        return new ApiError(message || 'Не найдено', 404);
    }
    static tooManyRequests(message) {
        return new ApiError(message || 'Слишком много запросов', 429);
    }
    static internal(message) {
        return new ApiError(message || 'Внутренняя ошибка сервера', 500);
    }
}

module.exports = ApiError;
