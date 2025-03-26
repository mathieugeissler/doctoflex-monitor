"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ScrapingError = exports.ValidationError = exports.AppError = void 0;
const logger_1 = require("./logger");
// Types d'erreurs personnalisés
class AppError extends Error {
    message;
    statusCode;
    code;
    constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.code = code;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}
exports.ValidationError = ValidationError;
class ScrapingError extends AppError {
    constructor(message) {
        super(message, 500, 'SCRAPING_ERROR');
    }
}
exports.ScrapingError = ScrapingError;
// Middleware de gestion des erreurs
const errorHandler = (err, req, res, _next) => {
    // Log de l'erreur
    logger_1.logger.error('Error occurred:', {
        error: {
            message: err.message,
            stack: err.stack,
            name: err.name,
            ...(err instanceof AppError && {
                statusCode: err.statusCode,
                code: err.code,
            }),
        },
        request: {
            method: req.method,
            url: req.url,
            params: req.params,
            query: req.query,
            body: req.body,
        },
    });
    // Si c'est une erreur personnalisée
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message,
            },
        });
    }
    // Erreur par défaut
    return res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Une erreur interne est survenue',
        },
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map