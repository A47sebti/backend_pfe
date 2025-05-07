const Site = require('../models/Site');
const User = require('../models/user.model');

// Seuils pour les différents types d'équipements
const SEUILS = {
    antenne: {
        tilt: {
            normal: { min: -5, max: 5 },
            warning: { min: -10, max: -5 },
            critical: { min: -15, max: -10 }
        },
        azimut: {
            normal: { min: 0, max: 360 },
            warning: { min: 0, max: 360 },
            critical: { min: 0, max: 360 }
        },
        puissance: {
            normal: { min: 40, max: 50 },
            warning: { min: 30, max: 40 },
            critical: { min: 0, max: 30 }
        }
    },
    transmission: {
        debit: {
            normal: { min: 80, max: 100 },
            warning: { min: 50, max: 80 },
            critical: { min: 0, max: 50 }
        },
        latence: {
            normal: { min: 0, max: 50 },
            warning: { min: 50, max: 100 },
            critical: { min: 100, max: 200 }
        },
        bandePassante: {
            normal: { min: 80, max: 100 },
            warning: { min: 50, max: 80 },
            critical: { min: 0, max: 50 }
        }
    }
};

// Générer une valeur aléatoire dans une plage
const getRandomValue = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Déterminer le statut basé sur la valeur et les seuils
const getStatus = (value, type, metric) => {
    const seuils = SEUILS[type][metric];
    if (value >= seuils.normal.min && value <= seuils.normal.max) return 'NORMAL';
    if (value >= seuils.warning.min && value <= seuils.warning.max) return 'PANNE';
    return 'MAINTENANCE';
};

// Générer des métriques pour une antenne
const generateAntennaMetrics = () => {
    return {
        tilt: {
            value: getRandomValue(-15, 15),
            status: 'NORMAL'
        },
        azimut: {
            value: getRandomValue(0, 360),
            status: 'NORMAL'
        },
        puissance: {
            value: getRandomValue(0, 50),
            status: 'NORMAL'
        }
    };
};

// Générer des métriques pour un équipement de transmission
const generateTransmissionMetrics = () => {
    return {
        debit: {
            value: getRandomValue(0, 100),
            status: 'NORMAL'
        },
        latence: {
            value: getRandomValue(0, 200),
            status: 'NORMAL'
        },
        bandePassante: {
            value: getRandomValue(0, 100),
            status: 'NORMAL'
        }
    };
};

// Simuler une panne aléatoire pour une antenne
const simulateAntennaFailure = (metrics) => {
    const failureTypes = ['tilt', 'puissance'];
    const randomType = failureTypes[Math.floor(Math.random() * failureTypes.length)];
    
    metrics[randomType] = {
        value: getRandomValue(
            SEUILS.antenne[randomType].critical.min,
            SEUILS.antenne[randomType].critical.max
        ),
        status: 'PANNE'
    };

    return metrics;
};

// Simuler une panne aléatoire pour un équipement de transmission
const simulateTransmissionFailure = (metrics) => {
    const failureTypes = ['debit', 'latence', 'bandePassante'];
    const randomType = failureTypes[Math.floor(Math.random() * failureTypes.length)];
    
    metrics[randomType] = {
        value: getRandomValue(
            SEUILS.transmission[randomType].critical.min,
            SEUILS.transmission[randomType].critical.max
        ),
        status: 'PANNE'
    };

    return metrics;
};

// Service principal de simulation
class SimulationService {
    constructor() {
        this.isRunning = false;
        this.interval = null;
        this.notifications = new Map(); // Stocker les notifications en cours
    }

    // Envoyer une notification au gestionnaire
    async sendNotification(site, equipment, oldStatus, newStatus) {
        try {
            // Trouver le gestionnaire responsable du site
            const gestionnaire = await User.findOne({
                _id: site.gestionnaireId,
                role: 'GESTIONNAIRE'
            });

            if (gestionnaire) {
                const notification = {
                    siteId: site._id,
                    siteName: site.adresse,
                    equipmentType: equipment.type || 'transmission',
                    equipmentId: equipment._id,
                    oldStatus,
                    newStatus,
                    timestamp: new Date(),
                    message: `L'équipement ${equipment.type || 'de transmission'} du site ${site.adresse} est passé de ${oldStatus} à ${newStatus}`
                };

                // Stocker la notification
                if (!this.notifications.has(gestionnaire._id)) {
                    this.notifications.set(gestionnaire._id, []);
                }
                this.notifications.get(gestionnaire._id).push(notification);

                console.log(`Notification envoyée au gestionnaire ${gestionnaire.nom} ${gestionnaire.prenom}: ${notification.message}`);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la notification:', error);
        }
    }

    // Obtenir les notifications d'un gestionnaire
    getNotifications(gestionnaireId) {
        return this.notifications.get(gestionnaireId) || [];
    }

    // Supprimer les notifications d'un gestionnaire
    clearNotifications(gestionnaireId) {
        this.notifications.delete(gestionnaireId);
    }

    // Démarrer la simulation
    async start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.interval = setInterval(async () => {
            try {
                // Récupérer tous les sites
                const sites = await Site.find();
                
                for (const site of sites) {
                    let siteModified = false;

                    // Simuler les antennes
                    if (site.equipements.antennes) {
                        for (let antenne of site.equipements.antennes) {
                            // 5% de chance de changer l'état
                            if (Math.random() < 0.05) {
                                const oldStatus = antenne.status;
                                // Changer aléatoirement l'état entre NORMAL, PANNE et MAINTENANCE
                                const states = ['NORMAL', 'PANNE', 'MAINTENANCE'];
                                antenne.status = states[Math.floor(Math.random() * states.length)];
                                
                                // Si l'état a changé, envoyer une notification
                                if (oldStatus !== antenne.status) {
                                    await this.sendNotification(site, antenne, oldStatus, antenne.status);
                                }
                                
                                siteModified = true;
                            }
                        }
                    }

                    // Simuler les équipements de transmission
                    if (site.equipements.transmission) {
                        for (let transmission of site.equipements.transmission) {
                            // 5% de chance de changer l'état
                            if (Math.random() < 0.05) {
                                const oldStatus = transmission.status;
                                // Changer aléatoirement l'état entre NORMAL, PANNE et MAINTENANCE
                                const states = ['NORMAL', 'PANNE', 'MAINTENANCE'];
                                transmission.status = states[Math.floor(Math.random() * states.length)];
                                
                                // Si l'état a changé, envoyer une notification
                                if (oldStatus !== transmission.status) {
                                    await this.sendNotification(site, transmission, oldStatus, transmission.status);
                                }
                                
                                siteModified = true;
                            }
                        }
                    }

                    // Sauvegarder les modifications seulement si quelque chose a changé
                    if (siteModified) {
                        await site.save();
                        console.log(`Site ${site._id} mis à jour avec de nouveaux états d'équipements`);
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la simulation:', error);
            }
        }, 10000); // Mise à jour toutes les 10 secondes
    }

    // Arrêter la simulation
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
    }

    // Vérifier si la simulation est en cours
    isActive() {
        return this.isRunning;
    }
}

module.exports = new SimulationService(); 