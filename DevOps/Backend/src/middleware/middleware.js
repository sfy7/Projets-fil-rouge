// src/middleware/middleware.js
// Middlewares personnalisés pour l'application

/**
 * MIDDLEWARE : Fonction qui s'exécute entre la requête et la réponse.
 * Signature : (req, res, next) => void
 * next() passe au middleware ou à la route suivante.
 */

/**
 * Middleware de journalisation (Logger)
 * Enregistre chaque requête entrante avec méthode, URL, et timestamp
 */
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next(); // Indispensable pour passer à la suite
};

/**
 * Middleware de validation de l'ID MongoDB
 * Vérifie que le paramètre :id est un ObjectId valide avant d'atteindre le contrôleur
 */
const validerObjectId = (req, res, next) => {
  const { id } = req.params;
  // Un ObjectId MongoDB est une chaîne hexadécimale de 24 caractères
  const objectIdRegex = /^[a-fA-F0-9]{24}$/;

  if (id && !objectIdRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: `L'ID "${id}" n'est pas un identifiant MongoDB valide`,
    });
  }
  next();
};

/**
 * Middleware de vérification des champs obligatoires du body
 * Utilisé sur la route POST pour s'assurer que libelle et description sont présents
 */
const validerCorpsProjet = (req, res, next) => {
  const { libelle, description } = req.body;

  if (!libelle || !description) {
    return res.status(400).json({
      success: false,
      message: 'Les champs "libelle" et "description" sont obligatoires',
    });
  }
  next();
};

/**
 * Middleware de gestion des routes inexistantes (404)
 * Doit être placé après toutes les routes dans app.js
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route introuvable : ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Middleware de gestion globale des erreurs (Error Handler)
 * Signature spéciale avec 4 paramètres : (err, req, res, next)
 * Express reconnaît automatiquement ce middleware comme gestionnaire d'erreurs
 */
const errorHandler = (err, req, res, next) => {
  console.error('🔴 Erreur globale :', err.stack);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = {
  logger,
  validerObjectId,
  validerCorpsProjet,
  notFound,
  errorHandler,
};
