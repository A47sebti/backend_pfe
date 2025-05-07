const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoring.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// Routes protégées par authentification
router.use(authMiddleware);

// Routes pour les administrateurs
router.post('/start',
    roleMiddleware(['ADMIN']),
    monitoringController.startMonitoring
);

router.post('/stop',
    roleMiddleware(['ADMIN']),
    monitoringController.stopMonitoring
);

// Routes pour les administrateurs et les gestionnaires
router.get('/site/:siteId',
    roleMiddleware(['ADMIN', 'GESTIONNAIRE']),
    monitoringController.getSiteMetrics
);

router.get('/equipment/:siteId/:equipmentId',
    roleMiddleware(['ADMIN', 'GESTIONNAIRE']),
    monitoringController.getEquipmentMetrics
);

router.get('/status',
    roleMiddleware(['ADMIN', 'GESTIONNAIRE']),
    monitoringController.getServiceStatus
);

module.exports = router; 