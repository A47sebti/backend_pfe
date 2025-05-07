const Site = require('../models/Site');
const Intervention = require('../models/intervention.model');
const User = require('../models/user.model');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ExportService {
    constructor() {
        this.exportDir = path.join(__dirname, '../exports');
        if (!fs.existsSync(this.exportDir)) {
            fs.mkdirSync(this.exportDir);
        }
    }

    // Générer un rapport Excel des interventions
    async generateInterventionsReport(filters = {}) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Interventions');

        // En-têtes
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Site', key: 'site', width: 30 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Priorité', key: 'priorite', width: 15 },
            { header: 'Statut', key: 'status', width: 15 },
            { header: 'Date Début', key: 'dateDebut', width: 20 },
            { header: 'Date Fin', key: 'dateFin', width: 20 },
            { header: 'Techniciens', key: 'techniciens', width: 30 },
            { header: 'Description', key: 'description', width: 50 }
        ];

        // Récupérer les interventions avec filtres
        const interventions = await Intervention.find(filters)
            .populate('siteId', 'adresse')
            .populate('techniciens', 'nom prenom');

        // Ajouter les données
        interventions.forEach(intervention => {
            worksheet.addRow({
                id: intervention._id,
                site: intervention.siteId.adresse,
                type: intervention.type,
                priorite: intervention.priorite,
                status: intervention.status,
                dateDebut: intervention.dateDebut.toLocaleString(),
                dateFin: intervention.dateFin ? intervention.dateFin.toLocaleString() : 'En cours',
                techniciens: intervention.techniciens.map(t => `${t.nom} ${t.prenom}`).join(', '),
                description: intervention.description
            });
        });

        // Style
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Sauvegarder le fichier
        const filename = `interventions_${new Date().toISOString().split('T')[0]}.xlsx`;
        const filepath = path.join(this.exportDir, filename);
        await workbook.xlsx.writeFile(filepath);

        return { filename, filepath };
    }

    // Générer un rapport PDF des équipements d'un site
    async generateSiteEquipmentReport(siteId) {
        const site = await Site.findById(siteId)
            .populate('gestionnaireId', 'nom prenom');

        if (!site) {
            throw new Error('Site non trouvé');
        }

        const doc = new PDFDocument();
        const filename = `site_${site._id}_${new Date().toISOString().split('T')[0]}.pdf`;
        const filepath = path.join(this.exportDir, filename);
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // En-tête
        doc.fontSize(20).text('Rapport des Équipements', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Site: ${site.adresse}`);
        doc.text(`Gestionnaire: ${site.gestionnaireId.nom} ${site.gestionnaireId.prenom}`);
        doc.moveDown();

        // Antennes
        doc.fontSize(16).text('Antennes');
        doc.moveDown();
        if (site.equipements.antennes && site.equipements.antennes.length > 0) {
            site.equipements.antennes.forEach(antenne => {
                doc.fontSize(12).text(`ID: ${antenne._id}`);
                doc.text(`Type: ${antenne.type}`);
                doc.text(`Statut: ${antenne.status}`);
                if (antenne.metrics) {
                    doc.text('Métriques:');
                    doc.text(`- Tilt: ${antenne.metrics.tilt.value}° (${antenne.metrics.tilt.status})`);
                    doc.text(`- Azimut: ${antenne.metrics.azimut.value}° (${antenne.metrics.azimut.status})`);
                    doc.text(`- Puissance: ${antenne.metrics.puissance.value} dBm (${antenne.metrics.puissance.status})`);
                }
                doc.moveDown();
            });
        } else {
            doc.text('Aucune antenne installée');
        }

        // Équipements de transmission
        doc.fontSize(16).text('Équipements de Transmission');
        doc.moveDown();
        if (site.equipements.transmission && site.equipements.transmission.length > 0) {
            site.equipements.transmission.forEach(transmission => {
                doc.fontSize(12).text(`ID: ${transmission._id}`);
                doc.text(`Type: ${transmission.type}`);
                doc.text(`Statut: ${transmission.status}`);
                if (transmission.metrics) {
                    doc.text('Métriques:');
                    doc.text(`- Débit: ${transmission.metrics.debit.value}% (${transmission.metrics.debit.status})`);
                    doc.text(`- Latence: ${transmission.metrics.latence.value}ms (${transmission.metrics.latence.status})`);
                    doc.text(`- Bande passante: ${transmission.metrics.bandePassante.value}% (${transmission.metrics.bandePassante.status})`);
                }
                doc.moveDown();
            });
        } else {
            doc.text('Aucun équipement de transmission installé');
        }

        // Pied de page
        doc.fontSize(10).text(
            `Généré le ${new Date().toLocaleString()}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
        );

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve({ filename, filepath }));
            stream.on('error', reject);
        });
    }

    // Générer un rapport des performances
    async generatePerformanceReport(siteId, startDate, endDate) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Performances');

        // En-têtes
        worksheet.columns = [
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Équipement', key: 'equipment', width: 20 },
            { header: 'Métrique', key: 'metric', width: 15 },
            { header: 'Valeur', key: 'value', width: 15 },
            { header: 'Statut', key: 'status', width: 15 }
        ];

        // Récupérer les données de performance
        const site = await Site.findById(siteId);
        if (!site) {
            throw new Error('Site non trouvé');
        }

        // Ajouter les données des antennes
        if (site.equipements.antennes) {
            for (const antenne of site.equipements.antennes) {
                if (antenne.metrics) {
                    worksheet.addRow({
                        date: new Date().toLocaleString(),
                        type: 'Antenne',
                        equipment: antenne._id,
                        metric: 'Tilt',
                        value: antenne.metrics.tilt.value,
                        status: antenne.metrics.tilt.status
                    });
                    worksheet.addRow({
                        date: new Date().toLocaleString(),
                        type: 'Antenne',
                        equipment: antenne._id,
                        metric: 'Puissance',
                        value: antenne.metrics.puissance.value,
                        status: antenne.metrics.puissance.status
                    });
                }
            }
        }

        // Ajouter les données des équipements de transmission
        if (site.equipements.transmission) {
            for (const transmission of site.equipements.transmission) {
                if (transmission.metrics) {
                    worksheet.addRow({
                        date: new Date().toLocaleString(),
                        type: 'Transmission',
                        equipment: transmission._id,
                        metric: 'Débit',
                        value: transmission.metrics.debit.value,
                        status: transmission.metrics.debit.status
                    });
                    worksheet.addRow({
                        date: new Date().toLocaleString(),
                        type: 'Transmission',
                        equipment: transmission._id,
                        metric: 'Latence',
                        value: transmission.metrics.latence.value,
                        status: transmission.metrics.latence.status
                    });
                }
            }
        }

        // Style
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Sauvegarder le fichier
        const filename = `performance_${siteId}_${new Date().toISOString().split('T')[0]}.xlsx`;
        const filepath = path.join(this.exportDir, filename);
        await workbook.xlsx.writeFile(filepath);

        return { filename, filepath };
    }

    // Nettoyer les anciens fichiers d'export
    async cleanupOldExports(maxAge = 7) { // 7 jours par défaut
        const files = fs.readdirSync(this.exportDir);
        const now = new Date();

        for (const file of files) {
            const filepath = path.join(this.exportDir, file);
            const stats = fs.statSync(filepath);
            const age = (now - stats.mtime) / (1000 * 60 * 60 * 24); // âge en jours

            if (age > maxAge) {
                fs.unlinkSync(filepath);
            }
        }
    }
}

module.exports = new ExportService(); 