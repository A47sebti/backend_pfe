const simulationService = require('../services/simulationService');

// Obtenir les notifications d'un gestionnaire
exports.getNotifications = async (req, res) => {
    try {
        const notifications = simulationService.getNotifications(req.user._id);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer les notifications d'un gestionnaire
exports.clearNotifications = async (req, res) => {
    try {
        simulationService.clearNotifications(req.user._id);
        res.json({ message: 'Notifications supprimées avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 