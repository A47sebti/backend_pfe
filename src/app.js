const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const monitoringService = require('./services/monitoringService');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
const siteRoutes = require('./routes/site.routes');
app.use('/api/sites', siteRoutes);
app.use('/api/interventions', require('./routes/intervention.routes'));
app.use('/api/simulation', require('./routes/simulation.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/alerts', require('./routes/alert.routes'));
app.use('/api/monitoring', require('./routes/monitoring.routes'));
app.use('/api/exports', require('./routes/export.routes'));

// Initialiser le service de monitoring avec le serveur WebSocket
monitoringService.initialize(server);

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/backendpfe', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
}); 