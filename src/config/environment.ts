import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from '../utils/logger';

// Charger les variables d'environnement
dotenv.config();

// Schéma de validation des variables d'environnement
const envSchema = z.object({
  PORT: z.string().default('3000').transform(Number),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  CORS_ORIGINS: z.string().default('http://localhost:3000').transform(str => str.split(',')),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  PUPPETEER_HEADLESS: z.string().default('true').transform(str => str === 'true'),
  LOG_FILE_DIR: z.string().default('./logs'),
  LOG_MAX_FILES: z.string().default('14').transform(Number),
  LOG_MAX_SIZE: z.string().default('20m'),
  DOCTOFLEX_URL: z.string()
});

// Type de l'environnement
export type Environment = z.infer<typeof envSchema>;

// Valider et exporter l'environnement
export const env = envSchema.parse(process.env);

// Logging de la configuration
logger.info('Environment configuration loaded', {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  logLevel: env.LOG_LEVEL
});
