// src/models/model.js
// Modele Mongoose d'un projet.

const mongoose = require('mongoose');

const projetSchema = new mongoose.Schema({
  libelle: {
    type: String,
    required: [true, 'Le libelle du projet est obligatoire'],
    trim: true,
    maxlength: [100, 'Le libelle ne peut pas depasser 100 caracteres'],
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
    trim: true,
  },
  technologies: {
    type: [String],
    default: [],
  },
  image: {
    type: String,
    trim: true,
    default: null,
  },
  imageNom: {
    type: String,
    trim: true,
    default: null,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Projet = mongoose.model('Projet', projetSchema);

module.exports = Projet;
