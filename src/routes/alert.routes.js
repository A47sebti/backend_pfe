const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// Routes protégées par authentification
router.use(authMiddleware);

// Routes pour les administrateurs
router.post('/start',
    roleMiddleware(['ADMIN']),
    alertController.startAlertService
);

router.post('/stop',
    roleMiddleware(['ADMIN']),
    alertController.stopAlertService
);

// Routes pour les administrateurs et les gestionnaires
router.get('/',
    roleMiddleware(['ADMIN', 'GESTIONNAIRE']),
    alertController.getAllAlerts
);

router.get('/site/:siteId',
    roleMiddleware(['ADMIN', 'GESTIONNAIRE']),
    alertController.getSiteAlerts
);

router.delete('/:alertKey',
    roleMiddleware(['ADMIN', 'GESTIONNAIRE']),
    alertController.removeAlert
);

router.get('/status',
    roleMiddleware(['ADMIN', 'GESTIONNAIRE']),
    alertController.getServiceStatus
);

module.exports = router; 