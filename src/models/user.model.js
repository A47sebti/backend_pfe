const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['ADMIN', 'GESTIONNAIRE', 'TECHNICIEN'],
        required: true
    },
    siegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Siege'
    },
    telephone: String,
    sitesResponsables: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site'
    }]
}, {
    timestamps: true
});

// Hash du mot de passe avant la sauvegarde
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Méthode pour vérifier le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 