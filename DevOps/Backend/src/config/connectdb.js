// src/config/connectdb.js
// Module de connexion à MongoDB via Mongoose

const mongoose = require('mongoose');
const dns = require('dns');

/**
 * Connexion à MongoDB
 * Mongoose est une bibliothèque ODM (Object Data Modeling) pour MongoDB et Node.js.
 * Elle fournit une solution basée sur des schémas pour modéliser les données.
 */
const connectDB = async () => {
  try {
    let conn;

    try {
      conn = await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
      if (error.message && error.message.includes('querySrv ECONNREFUSED')) {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        conn = await mongoose.connect(process.env.MONGO_URI);
      } else {
        throw error;
      }
    }

    console.log(`✅ MongoDB connecté : ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB : ${error.message}`);
    process.exit(1); // Arrêt du processus en cas d'échec
  }
};

// Événements de connexion Mongoose
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB déconnecté');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnecté');
});

module.exports = connectDB;
