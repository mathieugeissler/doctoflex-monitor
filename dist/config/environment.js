"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
// Charger les variables d'environnement
dotenv_1.default.config();
// Schéma de validation des variables d'environnement
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('3000').transform(Number),
    NODE_ENV: zod_1.z.enum(['development', 'production']).default('development'),
    CORS_ORIGINS: zod_1.z.string().default('http://localhost:3000').transform(str => str.split(',')),
    LOG_LEVEL: zod_1.z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    PUPPETEER_HEADLESS: zod_1.z.string().default('true').transform(str => str === 'true'),
    LOG_FILE_DIR: zod_1.z.string().default('./logs'),
    LOG_MAX_FILES: zod_1.z.string().default('14').transform(Number),
    LOG_MAX_SIZE: zod_1.z.string().default('20m'),
    DOCTOFLEX_URL: zod_1.z.string()
});
// Valider et exporter l'environnement
exports.env = envSchema.parse(process.env);
// Logging de la configuration
logger_1.logger.info('Environment configuration loaded', {
    nodeEnv: exports.env.NODE_ENV,
    port: exports.env.PORT,
    logLevel: exports.env.LOG_LEVEL
});
//# sourceMappingURL=environment.js.map