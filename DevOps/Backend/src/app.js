// src/app.js
// Point d'entrée de l'application — API REST Portfolio

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connectdb');
const projetRoutes = require('./routes/routes');
const { logger, notFound, errorHandler } = require('./middleware/middleware');

// ─── Connexion à MongoDB ─────────────────────────────────────────────────────
connectDB();

// ─── Initialisation d'Express ────────────────────────────────────────────────
const app = express();

// ─── Middlewares globaux ─────────────────────────────────────────────────────

// CORS — doit être en PREMIER avant toutes les routes
app.use(cors({ origin: 'http://localhost:5173' }));

// Parse le body JSON
app.use(express.json({ limit: '10mb' })); // limit augmentée pour les images base64

// Parse les données URL-encodées
app.use(express.urlencoded({ extended: true }));

// Logger
app.use(logger);

// ─── Route de santé ───────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 API Portfolio opérationnelle',
    version: '1.0.0',
    endpoints: {
      getAllProjets:  'GET    /api/projets',
      createProjet:  'POST   /api/projets',
      getOneProjet:  'GET    /api/projets/:id',
      updateProjet:  'PUT    /api/projets/:id',
      deleteProjet:  'DELETE /api/projets/:id',
    },
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/projets', projetRoutes);

// ─── Gestion des erreurs ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Démarrage ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Serveur démarré en mode ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 En écoute sur : http://localhost:${PORT}`);
  console.log(`📋 Documentation des endpoints : http://localhost:${PORT}\n`);
});

module.exports = app;
