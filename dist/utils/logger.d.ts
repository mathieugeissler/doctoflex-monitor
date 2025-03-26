import winston from 'winston';
import 'winston-daily-rotate-file';
export declare function createLogger(service: string): winston.Logger;
export declare const logger: winston.Logger;
