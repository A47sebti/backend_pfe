const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

exports.register = async (req, res) => {
    try {
        const { nom, prenom, email, password, role, siegeId, telephone } = req.body;
        const currentUser = req.user; // Utilisateur actuel qui fait la requête

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Vérification des permissions
        if (currentUser) {
            // Si l'utilisateur est connecté (admin ou gestionnaire)
            if (currentUser.role === 'ADMIN') {
                // L'admin peut créer n'importe quel type de compte
            } else if (currentUser.role === 'GESTIONNAIRE') {
                // Le gestionnaire ne peut créer que des techniciens
                if (role !== 'TECHNICIEN') {
                    return res.status(403).json({ message: 'Les gestionnaires ne peuvent créer que des comptes techniciens' });
                }
                // Vérifier que le technicien est créé dans le même siège que le gestionnaire
                if (siegeId !== currentUser.siegeId.toString()) {
                    return res.status(403).json({ message: 'Le technicien doit être créé dans le même siège que le gestionnaire' });
                }
            } else {
                return res.status(403).json({ message: 'Vous n\'avez pas les permissions pour créer des comptes' });
            }
        } else {
            // Si personne n'est connecté, seul un compte admin peut être créé
            if (role !== 'ADMIN') {
                return res.status(403).json({ message: 'Seul un compte administrateur peut être créé sans authentification' });
            }
        }

        // Créer un nouvel utilisateur
        const user = new User({
            nom,
            prenom,
            email,
            password,
            role,
            siegeId,
            telephone
        });

        await user.save();

        // Générer le token si c'est une création sans authentification
        const token = currentUser ? null : generateToken(user._id);

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role
            },
            token: token
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trouver l'utilisateur
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Générer le token
        const token = generateToken(user._id);

        res.json({
            message: 'Connexion réussie',
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
    }
}; 