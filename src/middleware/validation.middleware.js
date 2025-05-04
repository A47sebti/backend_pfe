const { body, validationResult } = require('express-validator');

// Validation pour la création de compte
exports.validateRegister = [
    body('nom')
        .notEmpty().withMessage('Le nom est requis')
        .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
    
    body('prenom')
        .notEmpty().withMessage('Le prénom est requis')
        .isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
    
    body('email')
        .notEmpty().withMessage('L\'email est requis')
        .isEmail().withMessage('Format d\'email invalide'),
    
    body('password')
        .notEmpty().withMessage('Le mot de passe est requis')
        .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'),
    
    body('role')
        .notEmpty().withMessage('Le rôle est requis')
        .isIn(['ADMIN', 'GESTIONNAIRE', 'TECHNICIEN']).withMessage('Rôle invalide'),
    
    body('telephone')
        .optional()
        .matches(/^[0-9]{10}$/).withMessage('Format de téléphone invalide'),
    
    body('siegeId')
        .if(body('role').equals('GESTIONNAIRE').or(body('role').equals('TECHNICIEN')))
        .notEmpty().withMessage('Le siège est requis pour les gestionnaires et techniciens')
        .isMongoId().withMessage('ID de siège invalide'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation pour la connexion
exports.validateLogin = [
    body('email')
        .notEmpty().withMessage('L\'email est requis')
        .isEmail().withMessage('Format d\'email invalide'),
    
    body('password')
        .notEmpty().withMessage('Le mot de passe est requis'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
]; 