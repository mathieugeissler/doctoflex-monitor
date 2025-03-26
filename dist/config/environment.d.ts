import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    PORT: z.ZodEffects<z.ZodDefault<z.ZodString>, number, string | undefined>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production"]>>;
    CORS_ORIGINS: z.ZodEffects<z.ZodDefault<z.ZodString>, string[], string | undefined>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
    PUPPETEER_HEADLESS: z.ZodEffects<z.ZodDefault<z.ZodString>, boolean, string | undefined>;
    LOG_FILE_DIR: z.ZodDefault<z.ZodString>;
    LOG_MAX_FILES: z.ZodEffects<z.ZodDefault<z.ZodString>, number, string | undefined>;
    LOG_MAX_SIZE: z.ZodDefault<z.ZodString>;
    DOCTOFLEX_URL: z.ZodString;
}, "strip", z.ZodTypeAny, {
    LOG_LEVEL: "info" | "error" | "debug" | "warn";
    CORS_ORIGINS: string[];
    PORT: number;
    NODE_ENV: "development" | "production";
    PUPPETEER_HEADLESS: boolean;
    LOG_FILE_DIR: string;
    LOG_MAX_FILES: number;
    LOG_MAX_SIZE: string;
    DOCTOFLEX_URL: string;
}, {
    DOCTOFLEX_URL: string;
    LOG_LEVEL?: "info" | "error" | "debug" | "warn" | undefined;
    CORS_ORIGINS?: string | undefined;
    PORT?: string | undefined;
    NODE_ENV?: "development" | "production" | undefined;
    PUPPETEER_HEADLESS?: string | undefined;
    LOG_FILE_DIR?: string | undefined;
    LOG_MAX_FILES?: string | undefined;
    LOG_MAX_SIZE?: string | undefined;
}>;
export type Environment = z.infer<typeof envSchema>;
export declare const env: {
    LOG_LEVEL: "info" | "error" | "debug" | "warn";
    CORS_ORIGINS: string[];
    PORT: number;
    NODE_ENV: "development" | "production";
    PUPPETEER_HEADLESS: boolean;
    LOG_FILE_DIR: string;
    LOG_MAX_FILES: number;
    LOG_MAX_SIZE: string;
    DOCTOFLEX_URL: string;
};
export {};
