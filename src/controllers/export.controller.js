const exportService = require('../services/exportService');
const fs = require('fs');

// Exporter le rapport des interventions
exports.exportInterventions = async (req, res) => {
    try {
        const { filters } = req.body;
        const { filename, filepath } = await exportService.generateInterventionsReport(filters);
        
        res.download(filepath, filename, (err) => {
            if (err) {
                console.error('Erreur lors du téléchargement:', err);
            }
            // Supprimer le fichier après le téléchargement
            fs.unlink(filepath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Erreur lors de la suppression du fichier:', unlinkErr);
                }
            });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Exporter le rapport des équipements d'un site
exports.exportSiteEquipment = async (req, res) => {
    try {
        const { siteId } = req.params;
        const { filename, filepath } = await exportService.generateSiteEquipmentReport(siteId);
        
        res.download(filepath, filename, (err) => {
            if (err) {
                console.error('Erreur lors du téléchargement:', err);
            }
            // Supprimer le fichier après le téléchargement
            fs.unlink(filepath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Erreur lors de la suppression du fichier:', unlinkErr);
                }
            });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Exporter le rapport des performances
exports.exportPerformance = async (req, res) => {
    try {
        const { siteId } = req.params;
        const { startDate, endDate } = req.query;
        
        const { filename, filepath } = await exportService.generatePerformanceReport(
            siteId,
            startDate ? new Date(startDate) : null,
            endDate ? new Date(endDate) : null
        );
        
        res.download(filepath, filename, (err) => {
            if (err) {
                console.error('Erreur lors du téléchargement:', err);
            }
            // Supprimer le fichier après le téléchargement
            fs.unlink(filepath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Erreur lors de la suppression du fichier:', unlinkErr);
                }
            });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Nettoyer les anciens fichiers d'export
exports.cleanupExports = async (req, res) => {
    try {
        const { maxAge } = req.query;
        await exportService.cleanupOldExports(maxAge ? parseInt(maxAge) : 7);
        res.json({ message: 'Nettoyage des exports terminé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 