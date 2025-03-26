"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ConfigurationService_1 = require("../services/ConfigurationService");
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const configService = ConfigurationService_1.ConfigurationService.getInstance();
// GET /api/config
router.get('/', (_, res) => {
    try {
        const config = configService.getConfiguration();
        res.json(config);
    }
    catch (error) {
        logger_1.logger.error('Erreur lors de la récupération de la configuration', { error });
        throw error;
    }
});
// PUT /api/config
router.put('/', (req, res) => {
    try {
        const newConfig = req.body;
        if (!newConfig || typeof newConfig !== 'object') {
            throw new errorHandler_1.ValidationError('Configuration invalide');
        }
        configService.updateConfiguration(newConfig);
        res.json(configService.getConfiguration());
    }
    catch (error) {
        logger_1.logger.error('Erreur lors de la mise à jour de la configuration', { error });
        throw error;
    }
});
exports.default = router;
//# sourceMappingURL=config.js.map