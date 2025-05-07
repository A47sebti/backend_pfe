const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// Routes protégées par authentification
router.use(authMiddleware);

// Routes accessibles uniquement aux gestionnaires
router.get('/',
    roleMiddleware(['GESTIONNAIRE']),
    notificationController.getNotifications
);

router.delete('/',
    roleMiddleware(['GESTIONNAIRE']),
    notificationController.clearNotifications
);

module.exports = router; 