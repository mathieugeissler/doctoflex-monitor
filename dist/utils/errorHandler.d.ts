import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    message: string;
    statusCode: number;
    code: string;
    constructor(message: string, statusCode?: number, code?: string);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
export declare class ScrapingError extends AppError {
    constructor(message: string);
}
export declare const errorHandler: (err: Error, req: Request, res: Response, _next: NextFunction) => Response<any, Record<string, any>>;
