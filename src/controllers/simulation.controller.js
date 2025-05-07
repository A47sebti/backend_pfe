const simulationService = require('../services/simulationService');

// Démarrer la simulation
exports.startSimulation = async (req, res) => {
    try {
        await simulationService.start();
        res.json({ message: 'Simulation démarrée avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Arrêter la simulation
exports.stopSimulation = async (req, res) => {
    try {
        simulationService.stop();
        res.json({ message: 'Simulation arrêtée avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir l'état de la simulation
exports.getSimulationStatus = async (req, res) => {
    try {
        const isActive = simulationService.isActive();
        res.json({ isActive });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 