import { Router } from 'express';
import { ConfigurationService } from '../services/ConfigurationService';
import { ValidationError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

const router = Router();
const configService = ConfigurationService.getInstance();

// GET /api/config
router.get('/', (_, res) => {
  try {
    const config = configService.getConfiguration();
    res.json(config);
  } catch (error) {
    logger.error('Erreur lors de la récupération de la configuration', { error });
    throw error;
  }
});

// PUT /api/config
router.put('/', (req, res) => {
  try {
    const newConfig = req.body;
    if (!newConfig || typeof newConfig !== 'object') {
      throw new ValidationError('Configuration invalide');
    }

    configService.updateConfiguration(newConfig);
    res.json(configService.getConfiguration());
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de la configuration', { error });
    throw error;
  }
});

export default router;
