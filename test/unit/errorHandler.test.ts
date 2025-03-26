import { Request, Response } from 'express';
import { AppError, ValidationError, ScrapingError, errorHandler } from '../../src/utils/errorHandler';

// Mock setImmediate
const mockSetImmediate = function setImmediate(callback: () => void) {
  return setTimeout(callback, 0) as unknown as NodeJS.Immediate;
};
mockSetImmediate.__promisify__ = () => Promise.resolve();
global.setImmediate = mockSetImmediate as typeof global.setImmediate;

describe('Error Handler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      url: '/test',
      params: {},
      query: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should handle AppError correctly', () => {
    const error = new AppError('Test error', 400, 'TEST_ERROR');
    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: 'TEST_ERROR',
        message: 'Test error',
      },
    });
  });

  it('should handle ValidationError correctly', () => {
    const error = new ValidationError('Invalid input');
    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
      },
    });
  });

  it('should handle ScrapingError correctly', () => {
    const error = new ScrapingError('Scraping failed');
    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: 'SCRAPING_ERROR',
        message: 'Scraping failed',
      },
    });
  });

  it('should handle unknown errors correctly', () => {
    const error = new Error('Unknown error');
    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Une erreur interne est survenue',
      },
    });
  });
});
