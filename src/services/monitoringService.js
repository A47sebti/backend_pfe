const Site = require('../models/Site');
const WebSocket = require('ws');

class MonitoringService {
    constructor() {
        this.isRunning = false;
        this.interval = null;
        this.clients = new Set();
        this.metrics = new Map();
    }

    // Initialiser le serveur WebSocket
    initialize(server) {
        const wss = new WebSocket.Server({ server });

        wss.on('connection', (ws) => {
            this.clients.add(ws);

            ws.on('close', () => {
                this.clients.delete(ws);
            });

            // Envoyer les métriques actuelles au nouveau client
            this.sendMetricsToClient(ws);
        });
    }

    // Envoyer les métriques à un client spécifique
    sendMetricsToClient(client) {
        const metrics = Array.from(this.metrics.values());
        client.send(JSON.stringify({
            type: 'metrics',
            data: metrics
        }));
    }

    // Diffuser les métriques à tous les clients connectés
    broadcastMetrics() {
        const metrics = Array.from(this.metrics.values());
        const message = JSON.stringify({
            type: 'metrics',
            data: metrics
        });

        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    // Mettre à jour les métriques d'un équipement
    updateEquipmentMetrics(siteId, equipmentId, type, metrics) {
        const key = `${siteId}_${equipmentId}`;
        this.metrics.set(key, {
            siteId,
            equipmentId,
            type,
            metrics,
            timestamp: new Date()
        });
    }

    // Obtenir les métriques d'un site
    getSiteMetrics(siteId) {
        return Array.from(this.metrics.values())
            .filter(metric => metric.siteId.toString() === siteId.toString());
    }

    // Obtenir les métriques d'un équipement
    getEquipmentMetrics(siteId, equipmentId) {
        const key = `${siteId}_${equipmentId}`;
        return this.metrics.get(key);
    }

    // Démarrer le monitoring
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.interval = setInterval(async () => {
            try {
                const sites = await Site.find();
                
                for (const site of sites) {
                    // Mettre à jour les métriques des antennes
                    if (site.equipements.antennes) {
                        for (const antenne of site.equipements.antennes) {
                            const metrics = {
                                tilt: antenne.metrics?.tilt || { value: 0, status: 'NORMAL' },
                                azimut: antenne.metrics?.azimut || { value: 0, status: 'NORMAL' },
                                puissance: antenne.metrics?.puissance || { value: 0, status: 'NORMAL' },
                                status: antenne.status
                            };
                            this.updateEquipmentMetrics(site._id, antenne._id, 'antenne', metrics);
                        }
                    }

                    // Mettre à jour les métriques des équipements de transmission
                    if (site.equipements.transmission) {
                        for (const transmission of site.equipements.transmission) {
                            const metrics = {
                                debit: transmission.metrics?.debit || { value: 0, status: 'NORMAL' },
                                latence: transmission.metrics?.latence || { value: 0, status: 'NORMAL' },
                                bandePassante: transmission.metrics?.bandePassante || { value: 0, status: 'NORMAL' },
                                status: transmission.status
                            };
                            this.updateEquipmentMetrics(site._id, transmission._id, 'transmission', metrics);
                        }
                    }
                }

                // Diffuser les mises à jour à tous les clients
                this.broadcastMetrics();
            } catch (error) {
                console.error('Erreur lors de la mise à jour des métriques:', error);
            }
        }, 5000); // Mise à jour toutes les 5 secondes
    }

    // Arrêter le monitoring
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
    }

    // Vérifier si le service est actif
    isActive() {
        return this.isRunning;
    }
}

module.exports = new MonitoringService(); 