import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

// Types d'erreurs personnalisés
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class ScrapingError extends AppError {
  constructor(message: string) {
    super(message, 500, 'SCRAPING_ERROR');
  }
}

// Middleware de gestion des erreurs
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log de l'erreur
  logger.error('Error occurred:', {
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
