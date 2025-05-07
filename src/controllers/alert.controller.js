const alertService = require('../services/alertService');

// Démarrer le service d'alerte
exports.startAlertService = async (req, res) => {
    try {
        alertService.start();
        res.json({ message: 'Service d\'alerte démarré avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Arrêter le service d'alerte
exports.stopAlertService = async (req, res) => {
    try {
        alertService.stop();
        res.json({ message: 'Service d\'alerte arrêté avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir toutes les alertes
exports.getAllAlerts = async (req, res) => {
    try {
        const alerts = alertService.getAlerts();
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les alertes d'un site spécifique
exports.getSiteAlerts = async (req, res) => {
    try {
        const alerts = alertService.getSiteAlerts(req.params.siteId);
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer une alerte
exports.removeAlert = async (req, res) => {
    try {
        const { alertKey } = req.params;
        alertService.removeAlert(alertKey);
        res.json({ message: 'Alerte supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Vérifier le statut du service d'alerte
exports.getServiceStatus = async (req, res) => {
    try {
        const isActive = alertService.isActive();
        res.json({ isActive });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 