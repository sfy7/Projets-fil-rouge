// src/controllers/controller.js
// Module contenant la logique metier (CRUD) pour les projets.

const Projet = require('../models/model');

const normaliserProjet = (projet) => {
  if (!projet) return projet;

  const objet = projet.toObject ? projet.toObject() : projet;
  const { _id, __v, ...reste } = objet;

  return {
    id: objet.id || (_id ? _id.toString() : undefined),
    ...reste,
    libelle: objet.libelle || '',
    date: objet.date || null,
  };
};

/**
 * @desc    Ajouter un nouveau projet
 * @route   POST /api/projets
 * @access  Public
 */
const ajouterProjet = async (req, res) => {
  try {
    const { libelle, description, technologies, image, imageNom, statut, date } = req.body;

    const nouveauProjet = new Projet({
      libelle,
      description,
      technologies,
      image,
      imageNom,
      statut,
      date,
    });

    const projetSauvegarde = await nouveauProjet.save();

    res.status(201).json({
      success: true,
      message: 'Projet ajoute avec succes',
      data: normaliserProjet(projetSauvegarde),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Donnees invalides',
        errors: messages,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la creation du projet',
      error: error.message,
    });
  }
};

/**
 * @desc    Retourner tous les projets
 * @route   GET /api/projets
 * @access  Public
 */
const obtenirTousProjets = async (req, res) => {
  try {
    const { statut, technologies, page = 1, limit = 10 } = req.query;

    const filtre = {};
    if (statut) filtre.statut = statut;
    if (technologies) filtre.technologies = { $in: [technologies] };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const projets = await Projet.find(filtre)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Projet.countDocuments(filtre);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: projets.map(normaliserProjet),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la recuperation des projets',
      error: error.message,
    });
  }
};

/**
 * @desc    Retourner un projet
 * @route   GET /api/projets/:id
 * @access  Public
 */
const obtenirUnProjet = async (req, res) => {
  try {
    const { id } = req.params;

    const projet = await Projet.findById(id);

    if (!projet) {
      return res.status(404).json({
        success: false,
        message: `Aucun projet trouve avec l'id : ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: normaliserProjet(projet),
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de projet invalide',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la recuperation du projet',
      error: error.message,
    });
  }
};

/**
 * @desc    Modifier un projet
 * @route   PUT /api/projets/:id
 * @access  Public
 */
const modifierProjet = async (req, res) => {
  try {
    const { id } = req.params;
    const champsAutorises = ['libelle', 'description', 'technologies', 'image', 'imageNom', 'date'];
    const donneesProjet = {};

    champsAutorises.forEach((champ) => {
      if (req.body[champ] === undefined) return;
      if ((champ === 'image' || champ === 'imageNom') && !req.body[champ]) return;
      donneesProjet[champ] = req.body[champ];
    });

    const projetModifie = await Projet.findByIdAndUpdate(
      id,
      { $set: donneesProjet },
      { new: true, runValidators: true }
    );

    if (!projetModifie) {
      return res.status(404).json({
        success: false,
        message: `Aucun projet trouve avec l'id : ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Projet modifie avec succes',
      data: normaliserProjet(projetModifie),
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Donnees invalides', errors: messages });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la modification du projet',
      error: error.message,
    });
  }
};

/**
 * @desc    Supprimer un projet
 * @route   DELETE /api/projets/:id
 * @access  Public
 */
const supprimerProjet = async (req, res) => {
  try {
    const { id } = req.params;

    const projetSupprime = await Projet.findByIdAndDelete(id);

    if (!projetSupprime) {
      return res.status(404).json({
        success: false,
        message: `Aucun projet trouve avec l'id : ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Projet supprime avec succes',
      data: normaliserProjet(projetSupprime),
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du projet',
      error: error.message,
    });
  }
};

module.exports = {
  ajouterProjet,
  obtenirTousProjets,
  obtenirUnProjet,
  modifierProjet,
  supprimerProjet,
};
