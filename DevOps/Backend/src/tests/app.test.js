// src/tests/app.test.js
// Tests Jest — API Portfolio (routes + middlewares)
// On utilise supertest pour simuler les requêtes HTTP sans démarrer le serveur

const request = require('supertest');
const app     = require('../app');

// ─── Mock de Mongoose ─────────────────────────────────────────────────────────
// On ne veut pas de vraie connexion MongoDB pendant les tests
jest.mock('../config/connectdb', () => jest.fn());

// Mock du modèle Projet pour isoler les tests de la base de données
jest.mock('../models/model', () => ({
  find:       jest.fn(),
  findById:   jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  prototype: { save: jest.fn() },
}));

const Projet = require('../models/model');

// ─── Tests — Route racine ─────────────────────────────────────────────────────
describe('GET /', () => {
  it('retourne 200 et le message de santé', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('API Portfolio');
  });
});

// ─── Tests — GET /api/projets ─────────────────────────────────────────────────
describe('GET /api/projets', () => {
  it('retourne 200 avec la liste des projets', async () => {
    const mockProjets = [
      { _id: '64a1b2c3d4e5f6a7b8c9d0e1', libelle: 'Projet 1', description: 'Desc 1' },
      { _id: '64a1b2c3d4e5f6a7b8c9d0e2', libelle: 'Projet 2', description: 'Desc 2' },
    ];
    Projet.find.mockResolvedValue(mockProjets);

    const res = await request(app).get('/api/projets');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('retourne 500 si la base de données échoue', async () => {
    Projet.find.mockRejectedValue(new Error('DB Error'));

    const res = await request(app).get('/api/projets');
    expect(res.status).toBe(500);
  });
});

// ─── Tests — POST /api/projets ────────────────────────────────────────────────
describe('POST /api/projets', () => {
  it('retourne 201 quand le projet est créé avec succès', async () => {
    const nouveauProjet = { libelle: 'Mon Projet', description: 'Une description' };
    const mockSave = jest.fn().mockResolvedValue({
      _id: '64a1b2c3d4e5f6a7b8c9d0e3',
      ...nouveauProjet,
    });
    Projet.prototype.save = mockSave;

    const res = await request(app).post('/api/projets').send(nouveauProjet);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('retourne 400 si libelle est manquant', async () => {
    const res = await request(app)
      .post('/api/projets')
      .send({ description: 'Sans libelle' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('libelle');
  });

  it('retourne 400 si description est manquante', async () => {
    const res = await request(app)
      .post('/api/projets')
      .send({ libelle: 'Sans description' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('description');
  });
});

// ─── Tests — GET /api/projets/:id ─────────────────────────────────────────────
describe('GET /api/projets/:id', () => {
  it('retourne 200 avec le projet trouvé', async () => {
    const mockProjet = { _id: '64a1b2c3d4e5f6a7b8c9d0e1', libelle: 'Projet 1', description: 'Desc' };
    Projet.findById.mockResolvedValue(mockProjet);

    const res = await request(app).get('/api/projets/64a1b2c3d4e5f6a7b8c9d0e1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('retourne 404 si le projet n\'existe pas', async () => {
    Projet.findById.mockResolvedValue(null);

    const res = await request(app).get('/api/projets/64a1b2c3d4e5f6a7b8c9d0e1');
    expect(res.status).toBe(404);
  });

  it('retourne 400 si l\'ID est invalide', async () => {
    const res = await request(app).get('/api/projets/id-invalide');
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('valide');
  });
});

// ─── Tests — PUT /api/projets/:id ─────────────────────────────────────────────
describe('PUT /api/projets/:id', () => {
  it('retourne 200 avec le projet modifié', async () => {
    const mockProjet = { _id: '64a1b2c3d4e5f6a7b8c9d0e1', libelle: 'Modifié', description: 'Nouvelle desc' };
    Projet.findByIdAndUpdate.mockResolvedValue(mockProjet);

    const res = await request(app)
      .put('/api/projets/64a1b2c3d4e5f6a7b8c9d0e1')
      .send({ libelle: 'Modifié', description: 'Nouvelle desc' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('retourne 404 si le projet n\'existe pas', async () => {
    Projet.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/projets/64a1b2c3d4e5f6a7b8c9d0e1')
      .send({ libelle: 'Test', description: 'Test' });
    expect(res.status).toBe(404);
  });

  it('retourne 400 si l\'ID est invalide', async () => {
    const res = await request(app)
      .put('/api/projets/id-invalide')
      .send({ libelle: 'Test', description: 'Test' });
    expect(res.status).toBe(400);
  });
});

// ─── Tests — DELETE /api/projets/:id ──────────────────────────────────────────
describe('DELETE /api/projets/:id', () => {
  it('retourne 200 quand le projet est supprimé', async () => {
    Projet.findByIdAndDelete.mockResolvedValue({ _id: '64a1b2c3d4e5f6a7b8c9d0e1' });

    const res = await request(app).delete('/api/projets/64a1b2c3d4e5f6a7b8c9d0e1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('retourne 404 si le projet n\'existe pas', async () => {
    Projet.findByIdAndDelete.mockResolvedValue(null);

    const res = await request(app).delete('/api/projets/64a1b2c3d4e5f6a7b8c9d0e1');
    expect(res.status).toBe(404);
  });

  it('retourne 400 si l\'ID est invalide', async () => {
    const res = await request(app).delete('/api/projets/id-invalide');
    expect(res.status).toBe(400);
  });
});

// ─── Tests — Route inexistante (404) ──────────────────────────────────────────
describe('Route inexistante', () => {
  it('retourne 404 pour une route inconnue', async () => {
    const res = await request(app).get('/route-inexistante');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});