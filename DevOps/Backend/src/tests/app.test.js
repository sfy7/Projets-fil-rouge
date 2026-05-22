// src/tests/app.test.js

// ─────────────────────────────────────────────────────────────
// 1. MOCKS DOIVENT ÊTRE AVANT IMPORT APP (IMPORTANT)
// ─────────────────────────────────────────────────────────────

// Mock MongoDB connection (évite vraie connexion en CI)
jest.mock('../config/connectdb', () => jest.fn());

// Mock du modèle Projet
jest.mock('../models/model', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

const Projet = require('../models/model');

// ─────────────────────────────────────────────────────────────
// 2. IMPORT APP APRÈS MOCKS
// ─────────────────────────────────────────────────────────────
const request = require('supertest');
const app = require('../app');

// ─────────────────────────────────────────────────────────────
// 3. CLEAN MOCKS
// ─────────────────────────────────────────────────────────────
afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

// ─────────────────────────────────────────────────────────────
// GET /
// ─────────────────────────────────────────────────────────────
describe('GET /', () => {
  it('retourne 200 et le message de santé', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/API/i);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/projets
// ─────────────────────────────────────────────────────────────
describe('GET /api/projets', () => {

  it('retourne 200 avec la liste des projets', async () => {

    Projet.find.mockResolvedValue([
      { _id: '1', libelle: 'Projet 1', description: 'Desc 1' },
      { _id: '2', libelle: 'Projet 2', description: 'Desc 2' }
    ]);

    const res = await request(app).get('/api/projets');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('retourne 500 si erreur DB', async () => {

    Projet.find.mockRejectedValue(new Error('DB Error'));

    const res = await request(app).get('/api/projets');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// POST /api/projets
// ─────────────────────────────────────────────────────────────
describe('POST /api/projets', () => {

  it('retourne 201 quand projet créé', async () => {

    Projet.create.mockResolvedValue({
      _id: '123',
      libelle: 'Mon Projet',
      description: 'Une description'
    });

    const res = await request(app)
      .post('/api/projets')
      .send({
        libelle: 'Mon Projet',
        description: 'Une description'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('retourne 400 si libelle manquant', async () => {

    const res = await request(app)
      .post('/api/projets')
      .send({ description: 'test' });

    expect(res.status).toBe(400);
  });

  it('retourne 400 si description manquante', async () => {

    const res = await request(app)
      .post('/api/projets')
      .send({ libelle: 'test' });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/projets/:id
// ─────────────────────────────────────────────────────────────
describe('GET /api/projets/:id', () => {

  it('retourne 200 projet trouvé', async () => {

    Projet.findById.mockResolvedValue({
      _id: '1',
      libelle: 'Projet'
    });

    const res = await request(app)
      .get('/api/projets/64a1b2c3d4e5f6a7b8c9d0e1');

    expect(res.status).toBe(200);
  });

  it('retourne 404 si inexistant', async () => {

    Projet.findById.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/projets/64a1b2c3d4e5f6a7b8c9d0e1');

    expect(res.status).toBe(404);
  });

  it('retourne 400 si ID invalide', async () => {

    const res = await request(app)
      .get('/api/projets/id-invalide');

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────
// PUT /api/projets/:id
// ─────────────────────────────────────────────────────────────
describe('PUT /api/projets/:id', () => {

  it('retourne 200 update OK', async () => {

    Projet.findByIdAndUpdate.mockResolvedValue({
      _id: '1',
      libelle: 'modifié'
    });

    const res = await request(app)
      .put('/api/projets/64a1b2c3d4e5f6a7b8c9d0e1')
      .send({ libelle: 'modifié', description: 'desc' });

    expect(res.status).toBe(200);
  });

  it('retourne 404 si inexistant', async () => {

    Projet.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/projets/64a1b2c3d4e5f6a7b8c9d0e1')
      .send({ libelle: 'x', description: 'x' });

    expect(res.status).toBe(404);
  });

  it('retourne 400 si ID invalide', async () => {

    const res = await request(app)
      .put('/api/projets/id-invalide')
      .send({ libelle: 'x', description: 'x' });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/projets/:id
// ─────────────────────────────────────────────────────────────
describe('DELETE /api/projets/:id', () => {

  it('retourne 200 supprimé', async () => {

    Projet.findByIdAndDelete.mockResolvedValue({ _id: '1' });

    const res = await request(app)
      .delete('/api/projets/64a1b2c3d4e5f6a7b8c9d0e1');

    expect(res.status).toBe(200);
  });

  it('retourne 404 si inexistant', async () => {

    Projet.findByIdAndDelete.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/projets/64a1b2c3d4e5f6a7b8c9d0e1');

    expect(res.status).toBe(404);
  });

  it('retourne 400 si ID invalide', async () => {

    const res = await request(app)
      .delete('/api/projets/id-invalide');

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────
// Route inexistante
// ─────────────────────────────────────────────────────────────
describe('Route inexistante', () => {

  it('retourne 404', async () => {

    const res = await request(app)
      .get('/route-inexistante');

    expect(res.status).toBe(404);
  });
});