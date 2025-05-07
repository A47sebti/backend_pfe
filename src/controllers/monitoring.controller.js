const monitoringService = require('../services/monitoringService');

// Démarrer le service de monitoring
exports.startMonitoring = async (req, res) => {
    try {
        monitoringService.start();
        res.json({ message: 'Service de monitoring démarré avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Arrêter le service de monitoring
exports.stopMonitoring = async (req, res) => {
    try {
        monitoringService.stop();
        res.json({ message: 'Service de monitoring arrêté avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les métriques d'un site
exports.getSiteMetrics = async (req, res) => {
    try {
        const metrics = monitoringService.getSiteMetrics(req.params.siteId);
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les métriques d'un équipement
exports.getEquipmentMetrics = async (req, res) => {
    try {
        const { siteId, equipmentId } = req.params;
        const metrics = monitoringService.getEquipmentMetrics(siteId, equipmentId);
        
        if (!metrics) {
            return res.status(404).json({ message: 'Métriques non trouvées' });
        }
        
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Vérifier le statut du service
exports.getServiceStatus = async (req, res) => {
    try {
        const isActive = monitoringService.isActive();
        res.json({ isActive });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 