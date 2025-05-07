const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// Routes protégées par authentification
router.use(authMiddleware);

// Routes pour les administrateurs et les gestionnaires
router.post('/interventions',
    roleMiddleware(['ADMIN', 'GESTIONNAIRE']),
    exportController.exportInterventions
);

router.get('/site/:siteId/equipment',
    roleMiddleware(['ADMIN', 'GESTIONNAIRE']),
    exportController.exportSiteEquipment
);

router.get('/site/:siteId/performance',
    roleMiddleware(['ADMIN', 'GESTIONNAIRE']),
    exportController.exportPerformance
);

// Route pour le nettoyage des exports (admin uniquement)
router.post('/cleanup',
    roleMiddleware(['ADMIN']),
    exportController.cleanupExports
);

module.exports = router; 