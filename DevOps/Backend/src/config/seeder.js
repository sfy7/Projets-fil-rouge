// src/config/seeder.js
// Script pour peupler la base de données MongoDB avec des données initiales

require('dotenv').config();
const mongoose = require('mongoose');
const Projet = require('../models/model');
const connectDB = require('./connectdb');

const projetsData = [
  {
    libelle: "Application E-commerce",
    description: "Développement d'une plateforme e-commerce complète avec gestion des produits, panier d'achat, paiements en ligne et tableau de bord administrateur. L'application supporte plusieurs devises et langues, intègre un système de recommandation basé sur l'IA et offre une expérience utilisateur fluide sur tous les appareils.",
    technologies: ["React", "Node.js", "PostgreSQL", "Stripe API", "Docker", "Redis"],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=500&q=80",
    statut: "terminé",
    date: new Date("2023-10-05"),
  },
  {
    libelle: "Application mobile de santé",
    description: "Développement d'une application mobile de santé permettant aux utilisateurs de suivre leur état de santé, de planifier leurs rendez-vous médicaux et d'accéder à leurs dossiers médicaux numériques.",
    technologies: ["React", "Node.js", "PostgreSQL", "Stripe API", "Docker", "Redis"],
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=500&q=80",
    statut: "terminé",
    date: new Date("2024-09-15"),
  },
  {
    libelle: "Dashboard Analytics Temps Réel",
    description: "Développement d'un dashboard d'analytics en temps réel permettant de visualiser et d'analyser les données instantanément. L'application affiche des indicateurs clés sous forme de graphiques interactifs et de tableaux dynamiques.",
    technologies: ["React", "PHP", "MySQL", "API", "Git/Github", "Trello"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=80",
    statut: "terminé",
    date: new Date("2025-11-10"),
  },
  {
    libelle: "Application gestion de pointage",
    description: "Développement d'une application de gestion de pointage pour les employés, permettant de suivre les heures d'entrée et de sortie à l'aide de QR codes.",
    technologies: ["React", "Node.js", "MySQL", "React Native Camera", "AWS", "API GPS ET GEOFENCING"],
    image: "https://fr.organilog.com/wp-content/uploads/2022/11/logiciel-de-pointage-qr-code-equipement.webp",
    statut: "terminé",
    date: new Date("2024-01-18"),
  },
];

// ─── Fonction principale du seeder ───────────────────────────────────────────
const importData = async () => {
  try {
    await connectDB();

    // Suppression des données existantes avant l'import
    await Projet.deleteMany();
    console.log('🗑️  Données existantes supprimées');

    // Insertion des nouvelles données
    const projetsInseres = await Projet.insertMany(projetsData);
    console.log(`✅ ${projetsInseres.length} projets insérés avec succès`);

    projetsInseres.forEach((p, i) => {
      console.log(`   [${i + 1}] ${p.libelle} → id: ${p.id}`);
    });

    console.log('\n🎉 Seeder terminé avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seeder :', error.message);
    process.exit(1);
  }
};

// ─── Fonction pour vider la base ─────────────────────────────────────────────
const destroyData = async () => {
  try {
    await connectDB();
    await Projet.deleteMany();
    console.log('🗑️  Toutes les données ont été supprimées');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la suppression :', error.message);
    process.exit(1);
  }
};

// ─── Choix selon l'argument passé en ligne de commande ───────────────────────
// node src/config/seeder.js          → importe les données
// node src/config/seeder.js -d       → supprime toutes les données
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
