const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin } = require('../middleware/validation.middleware');

// Route publique
router.post('/login', validateLogin, authController.login);

// Route protégée pour la création de compte
router.post('/register', 
    authMiddleware, 
    (req, res, next) => {
        // Vérifier si l'utilisateur est admin ou gestionnaire
        if (req.user.role === 'ADMIN' || req.user.role === 'GESTIONNAIRE') {
            next();
        } else {
            res.status(403).json({ message: 'Accès non autorisé' });
        }
    },
    validateRegister,
    authController.register
);

module.exports = router; 