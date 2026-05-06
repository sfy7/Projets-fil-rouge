// api.js — Service de communication avec le backend Express
// Toutes les requêtes HTTP vers l'API passent par ce fichier

// URL de base du backend Express (port 5000)
const BASE_URL = 'http://localhost:5000/api/projets'

const jsonHeaders = {
  'Content-Type': 'application/json',
}

// Express retourne { success: true, data: ... }
// On extrait automatiquement le champ "data"
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Erreur HTTP ${response.status}`)
  }
  if (response.status === 204) return null
  const json = await response.json()
  return json.data !== undefined ? json.data : json
}

// -------------------------------------------------------
// GET /projets — Récupère la liste de tous les projets
// -------------------------------------------------------
export const getProjets = async () => {
  const response = await fetch(`${BASE_URL}`)
  return handleResponse(response)
}

// -------------------------------------------------------
// GET /projets/:id — Récupère un seul projet par son ID
// -------------------------------------------------------
export const getProjetById = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`)
  return handleResponse(response)
}

// -------------------------------------------------------
// POST /projets — Ajoute un nouveau projet
// -------------------------------------------------------
export const ajouterProjet = async (projetData) => {
  const response = await fetch(`${BASE_URL}`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(projetData),
  })
  return handleResponse(response)
}

// -------------------------------------------------------
// PUT /projets/:id — Modifie un projet existant
// -------------------------------------------------------
export const modifierProjet = async (id, projetData) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(projetData),
  })
  return handleResponse(response)
}

// -------------------------------------------------------
// DELETE /projets/:id — Supprime un projet par son ID
// -------------------------------------------------------
export const supprimerProjet = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  })
  await handleResponse(response)
}
