const express = require('express');
const router = express.Router();
const siteController = require('../controllers/site.controller');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Routes publiques
router.get('/', siteController.getAllSites);
router.get('/:id', siteController.getSiteById);

// Routes protégées nécessitant une authentification
router.use(auth);

// Routes pour les gestionnaires
router.post('/', checkRole(['GESTIONNAIRE', 'ADMIN']), siteController.createSite);
router.put('/:id', checkRole(['GESTIONNAIRE', 'ADMIN']), siteController.updateSite);
router.delete('/:id', checkRole(['ADMIN']), siteController.deleteSite);

// Routes spécifiques pour la gestion des équipements
router.post('/:id/equipements', checkRole(['GESTIONNAIRE', 'ADMIN']), siteController.addEquipement);
router.put('/:id/equipements/status', checkRole(['GESTIONNAIRE', 'ADMIN']), siteController.updateEquipementStatus);

// Route pour l'assignation des gestionnaires (uniquement pour les admins)
router.put('/:id/assign-gestionnaire', checkRole(['ADMIN']), siteController.assignGestionnaire);

// Routes pour la validation des sites (uniquement pour les admins)
router.get('/pending', checkRole(['ADMIN']), siteController.getPendingSites);
router.put('/:id/validate', checkRole(['ADMIN']), siteController.validateSite);
router.put('/:id/reject', checkRole(['ADMIN']), siteController.rejectSite);

module.exports = router; 