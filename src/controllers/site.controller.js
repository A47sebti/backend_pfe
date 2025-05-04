const Site = require('../models/site.model');
const User = require('../models/user.model');

// Créer un nouveau site
exports.createSite = async (req, res) => {
    try {
        const site = new Site({
            ...req.body,
            gestionnaireId: req.body.gestionnaireId || null
        });
        await site.save();
        res.status(201).json(site);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Récupérer tous les sites
exports.getAllSites = async (req, res) => {
    try {
        const sites = await Site.find()
            .populate('gestionnaireId', 'nom prenom email')
            .populate('siegeId', 'nom adresse');
        res.json(sites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Récupérer un site par son ID
exports.getSiteById = async (req, res) => {
    try {
        const site = await Site.findById(req.params.id)
            .populate('gestionnaireId', 'nom prenom email')
            .populate('siegeId', 'nom adresse');
        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }
        res.json(site);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour un site
exports.updateSite = async (req, res) => {
    try {
        const site = await Site.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true }
        ).populate('gestionnaireId', 'nom prenom email')
         .populate('siegeId', 'nom adresse');

        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }

        // Ajouter une entrée dans l'historique
        site.historique.push({
            type: 'MODIFICATION',
            description: 'Mise à jour des informations du site',
            utilisateurId: req.user._id
        });
        await site.save();

        res.json(site);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un site
exports.deleteSite = async (req, res) => {
    try {
        const site = await Site.findByIdAndDelete(req.params.id);
        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }
        res.json({ message: 'Site supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Assigner un gestionnaire à un site
exports.assignGestionnaire = async (req, res) => {
    try {
        const { gestionnaireId } = req.body;
        
        // Vérifier si l'utilisateur existe et est un gestionnaire
        const user = await User.findById(gestionnaireId);
        if (!user || user.role !== 'GESTIONNAIRE') {
            return res.status(400).json({ message: 'Utilisateur non trouvé ou n\'est pas un gestionnaire' });
        }

        const site = await Site.findByIdAndUpdate(
            req.params.id,
            { gestionnaireId },
            { new: true }
        ).populate('gestionnaireId', 'nom prenom email')
         .populate('siegeId', 'nom adresse');

        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }

        // Ajouter une entrée dans l'historique
        site.historique.push({
            type: 'MODIFICATION',
            description: `Assignation du gestionnaire ${user.nom} ${user.prenom}`,
            utilisateurId: req.user._id
        });
        await site.save();

        res.json(site);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Ajouter un équipement (antenne ou transmission)
exports.addEquipement = async (req, res) => {
    try {
        const { type, equipement } = req.body;
        const site = await Site.findById(req.params.id);

        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }

        if (type === 'antenne') {
            site.equipements.antennes.push(equipement);
        } else if (type === 'transmission') {
            site.equipements.transmission.push(equipement);
        } else {
            return res.status(400).json({ message: 'Type d\'équipement invalide' });
        }

        // Ajouter une entrée dans l'historique
        site.historique.push({
            type: 'MODIFICATION',
            description: `Ajout d'un nouvel équipement de type ${type}`,
            utilisateurId: req.user._id
        });

        await site.save();
        res.json(site);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mettre à jour le statut d'un équipement
exports.updateEquipementStatus = async (req, res) => {
    try {
        const { type, equipementId, status } = req.body;
        const site = await Site.findById(req.params.id);

        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }

        let equipement;
        if (type === 'antenne') {
            equipement = site.equipements.antennes.id(equipementId);
        } else if (type === 'transmission') {
            equipement = site.equipements.transmission.id(equipementId);
        } else {
            return res.status(400).json({ message: 'Type d\'équipement invalide' });
        }

        if (!equipement) {
            return res.status(404).json({ message: 'Équipement non trouvé' });
        }

        equipement.status = status;

        // Ajouter une entrée dans l'historique
        site.historique.push({
            type: 'MAINTENANCE',
            description: `Mise à jour du statut de l'équipement ${type} à ${status}`,
            utilisateurId: req.user._id
        });

        await site.save();
        res.json(site);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Valider un site (Admin uniquement)
exports.validateSite = async (req, res) => {
    try {
        const site = await Site.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'VALIDE',
                $push: {
                    historique: {
                        type: 'VALIDATION',
                        description: 'Site validé par l\'administrateur',
                        utilisateurId: req.user._id
                    }
                }
            },
            { new: true }
        ).populate('gestionnaireId', 'nom prenom email')
         .populate('siegeId', 'nom adresse');

        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }

        res.json(site);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Rejeter un site (Admin uniquement)
exports.rejectSite = async (req, res) => {
    try {
        const { raison } = req.body;
        if (!raison) {
            return res.status(400).json({ message: 'La raison du rejet est requise' });
        }

        const site = await Site.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'REJETE',
                $push: {
                    historique: {
                        type: 'REJET',
                        description: `Site rejeté par l'administrateur: ${raison}`,
                        utilisateurId: req.user._id
                    }
                }
            },
            { new: true }
        ).populate('gestionnaireId', 'nom prenom email')
         .populate('siegeId', 'nom adresse');

        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }

        res.json(site);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Récupérer les sites en attente de validation
exports.getPendingSites = async (req, res) => {
    try {
        const sites = await Site.find({ status: 'EN_ATTENTE' })
            .populate('gestionnaireId', 'nom prenom email')
            .populate('siegeId', 'nom adresse');
        res.json(sites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 