import fetchAPI from './api';

export const getAllProjets = () => fetchAPI('/projets');
export const getProjet = (id) => fetchAPI(`/projets/${id}`);
export const createProjet = (data) => fetchAPI('/projets', { method: 'POST', body: JSON.stringify(data) });
export const updateProjet = (id, data) => fetchAPI(`/projets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProjet = (id) => fetchAPI(`/projets/${id}`, { method: 'DELETE' });