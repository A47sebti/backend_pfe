const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulation.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// Routes protégées par authentification
router.use(authMiddleware);

// Routes accessibles uniquement aux administrateurs
router.post('/start',
    roleMiddleware(['ADMIN']),
    simulationController.startSimulation
);

router.post('/stop',
    roleMiddleware(['ADMIN']),
    simulationController.stopSimulation
);

router.get('/status',
    roleMiddleware(['ADMIN', 'GESTIONNAIRE']),
    simulationController.getSimulationStatus
);

module.exports = router; 