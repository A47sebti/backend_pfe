const Site = require('../models/Site');
const Intervention = require('../models/intervention.model');
const User = require('../models/user.model');

class AlertService {
    constructor() {
        this.isRunning = false;
        this.interval = null;
        this.alerts = new Map(); // Stocker les alertes en cours
    }

    // Créer une intervention automatique pour une panne
    async createAutomaticIntervention(site, equipment, alertType) {
        try {
            // Trouver les techniciens disponibles
            const techniciens = await User.find({
                role: 'TECHNICIEN',
                siegeId: site.siegeId
            }).limit(2); // Assigner 2 techniciens par défaut

            if (techniciens.length === 0) {
                console.log(`Aucun technicien disponible pour le site ${site.adresse}`);
                return null;
            }

            // Créer l'intervention
            const intervention = new Intervention({
                siteId: site._id,
                type: 'REPARATION',
                priorite: 'HAUTE',
                status: 'PLANIFIEE',
                description: `Intervention automatique pour ${alertType} sur l'équipement ${equipment.type || 'de transmission'} du site ${site.adresse}`,
                dateDebut: new Date(),
                techniciens: techniciens.map(t => t._id)
            });

            // Ajouter l'entrée dans l'historique
            intervention.ajouterHistorique(
                'CREATION',
                'Création automatique suite à une panne détectée',
                null // Créé par le système
            );

            await intervention.save();
            console.log(`Intervention automatique créée pour le site ${site.adresse}`);
            return intervention;
        } catch (error) {
            console.error('Erreur lors de la création de l\'intervention automatique:', error);
            return null;
        }
    }

    // Vérifier les pannes et créer des alertes
    async checkForFailures() {
        try {
            const sites = await Site.find();
            
            for (const site of sites) {
                // Vérifier les antennes
                if (site.equipements.antennes) {
                    for (const antenne of site.equipements.antennes) {
                        if (antenne.status === 'PANNE') {
                            const alertKey = `antenne_${site._id}_${antenne._id}`;
                            
                            // Si l'alerte n'existe pas déjà
                            if (!this.alerts.has(alertKey)) {
                                // Créer une intervention automatique
                                const intervention = await this.createAutomaticIntervention(
                                    site,
                                    antenne,
                                    'panne d\'antenne'
                                );

                                // Stocker l'alerte
                                this.alerts.set(alertKey, {
                                    siteId: site._id,
                                    siteName: site.adresse,
                                    equipmentType: 'antenne',
                                    equipmentId: antenne._id,
                                    status: 'PANNE',
                                    timestamp: new Date(),
                                    interventionId: intervention ? intervention._id : null
                                });

                                console.log(`Alerte créée pour la panne d'antenne sur le site ${site.adresse}`);
                            }
                        }
                    }
                }

                // Vérifier les équipements de transmission
                if (site.equipements.transmission) {
                    for (const transmission of site.equipements.transmission) {
                        if (transmission.status === 'PANNE') {
                            const alertKey = `transmission_${site._id}_${transmission._id}`;
                            
                            // Si l'alerte n'existe pas déjà
                            if (!this.alerts.has(alertKey)) {
                                // Créer une intervention automatique
                                const intervention = await this.createAutomaticIntervention(
                                    site,
                                    transmission,
                                    'panne de transmission'
                                );

                                // Stocker l'alerte
                                this.alerts.set(alertKey, {
                                    siteId: site._id,
                                    siteName: site.adresse,
                                    equipmentType: 'transmission',
                                    equipmentId: transmission._id,
                                    status: 'PANNE',
                                    timestamp: new Date(),
                                    interventionId: intervention ? intervention._id : null
                                });

                                console.log(`Alerte créée pour la panne de transmission sur le site ${site.adresse}`);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des pannes:', error);
        }
    }

    // Démarrer le service d'alerte
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.interval = setInterval(() => {
            this.checkForFailures();
        }, 30000); // Vérifier toutes les 30 secondes
    }

    // Arrêter le service d'alerte
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
    }

    // Obtenir toutes les alertes
    getAlerts() {
        return Array.from(this.alerts.values());
    }

    // Obtenir les alertes d'un site spécifique
    getSiteAlerts(siteId) {
        return this.getAlerts().filter(alert => alert.siteId.toString() === siteId.toString());
    }

    // Supprimer une alerte
    removeAlert(alertKey) {
        this.alerts.delete(alertKey);
    }

    // Vérifier si le service est actif
    isActive() {
        return this.isRunning;
    }
}

module.exports = new AlertService(); 