const mongoose = require('mongoose');

const siegeSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    adresse: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    gestionnaireId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site'
    }],
    techniciens: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Siege', siegeSchema); 