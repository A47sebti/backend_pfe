const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
    adresse: {
        type: String,
        required: true
    },
    typeSiteMobile: {
        type: String,
        enum: ['INDOOR', 'OUTDOOR'],
        required: true
    },
    categorieSiteMobile: {
        type: String,
        enum: ['MACRO', 'MICRO'],
        required: true
    },
    technologieSiteMobile: {
        type: String,
        enum: ['2G', '3G', '4G', '5G'],
        required: true
    },
    adresseIP: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(v);
            },
            message: props => `${props.value} n'est pas une adresse IP valide!`
        }
    },
    status: {
        type: String,
        enum: ['EN_ATTENTE', 'VALIDE', 'REJETE'],
        default: 'EN_ATTENTE'
    },
    equipements: {
        antennes: [{
            type: {
                type: String,
                enum: ['TILT', 'AZIMUT'],
                required: true
            },
            fournisseur: {
                type: String,
                enum: ['KATHREIN', 'JAYBEAM', 'HUAWEI'],
                required: true
            },
            modele: String,
            status: {
                type: String,
                enum: ['NORMAL', 'PANNE', 'MAINTENANCE'],
                default: 'NORMAL'
            },
            caracteristiques: {
                frequence: Number,
                puissance: Number,
                gain: Number,
                tilt: Number,
                azimut: Number
            }
        }],
        transmission: [{
            categorieSupport: {
                type: String,
                enum: ['HDSL', 'FAICEAUX', 'FIBRE'],
                required: true
            },
            type: String,
            modele: String,
            status: {
                type: String,
                enum: ['NORMAL', 'PANNE', 'MAINTENANCE'],
                default: 'NORMAL'
            },
            caracteristiques: {
                debit: Number,
                latence: Number,
                bandePassante: Number
            }
        }]
    },
    siegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Siege',
        required: true
    },
    gestionnaireId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    historique: [{
        date: {
            type: Date,
            default: Date.now
        },
        type: {
            type: String,
            enum: ['CREATION', 'MODIFICATION', 'MAINTENANCE', 'PANNE'],
            required: true
        },
        description: String,
        utilisateurId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Site', siteSchema); 