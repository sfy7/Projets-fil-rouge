// src/routes/routes.js
// Module définissant les routes de l'API avec express.Router

const express = require('express');

// express.Router() crée un mini-routeur modulaire et montable
const router = express.Router();

// Import des contrôleurs (logique métier)
const {
  ajouterProjet,
  obtenirTousProjets,
  obtenirUnProjet,
  modifierProjet,
  supprimerProjet,
} = require('../controllers/controller');

// Import des middlewares spécifiques aux routes
const { validerObjectId, validerCorpsProjet } = require('../middleware/middleware');

/**
 * Routes de la collection /projets
 *
 * express.Router permet de :
 * - Regrouper les routes liées
 * - Appliquer des middlewares par groupe
 * - Monter le routeur sur un préfixe dans app.js
 */

// GET    /api/projets       → Récupérer tous les projets (avec query string optionnel)
// POST   /api/projets       → Ajouter un nouveau projet
router
  .route('/')
  .get(obtenirTousProjets)
  .post(validerCorpsProjet, ajouterProjet); // middleware de validation avant le contrôleur

// GET    /api/projets/:id   → Récupérer un projet par son ID (paramètre de route)
// PUT    /api/projets/:id   → Modifier un projet
// DELETE /api/projets/:id   → Supprimer un projet
router
  .route('/:id')
  .get(validerObjectId, obtenirUnProjet)
  .put(validerObjectId, modifierProjet)
  .delete(validerObjectId, supprimerProjet);

/**
 * Exemple de route avec plusieurs paramètres de route :
 * router.get('/:id/technologies/:tech', ...) → req.params = { id, tech }
 */

module.exports = router;
