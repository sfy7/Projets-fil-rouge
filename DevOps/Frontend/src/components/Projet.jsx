// Projet.jsx — Composant carte d'un projet individuel
import React from 'react'

function Projet({ projet, onSupprimer, onVoirDetail }) {
  const libelleProjet = projet.libelle || 'Projet sans libelle'
  const dateProjet = projet.date

  // Les technologies viennent de MongoDB sous forme de tableau
  // On affiche les 3 premières pour ne pas déborder
  const techArray = Array.isArray(projet.technologies)
    ? projet.technologies
    : (projet.technologies || '').split(',').map(t => t.trim())

  // Formate la date MongoDB (ISO) en français
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    // Si c'est déjà une date française formatée, on la retourne telle quelle
    if (typeof dateStr === 'string' && dateStr.startsWith('Ajouté')) return dateStr
    try {
      return 'Ajouté le ' + new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <article className="bg-[#111118] border border-[#1e1e2e] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-900/20">

      {/* Image du projet */}
      {projet.image ? (
        <img
          src={projet.image}
          alt={libelleProjet}
          className="w-full h-55 object-cover block"
          onError={e => { e.target.style.display = 'none' }}
        />
      ) : (
        <div className="w-full h-55 flex items-center justify-center text-5xl bg-linear-to-br from-[#1a1a2e] to-[#16213e]">
          🖥️
        </div>
      )}

      {/* Corps de la carte */}
      <div className="p-5">

        {/* Libelle cliquable */}
        <span
          className="font-syne font-bold text-[1.05rem] text-[#f1f0f8] mb-2 cursor-pointer transition-colors duration-200 block hover:text-violet-400"
          onClick={() => onVoirDetail(projet)}
          title="Cliquer pour voir les détails"
        >
          {libelleProjet}
        </span>

        {/* Date */}
        <p className="text-xs text-[#8b8aa0] mb-3">
          📅 {formatDate(dateProjet)}
        </p>

        {/* Badges technologies (3 max) */}
        <div className="flex flex-wrap gap-1 mb-4">
          {techArray.slice(0, 3).map((tech, i) => (
            <span key={i} className="px-2 py-0.5 bg-violet-950/20 border border-violet-700/35 rounded-full text-violet-400 text-[0.75rem] font-semibold">
              {tech}
            </span>
          ))}
          {techArray.length > 3 && (
            <span className="px-2 py-0.5 text-slate-500 text-[0.75rem]">
              +{techArray.length - 3}
            </span>
          )}
        </div>

        {/* Bouton supprimer */}
        <div className="flex justify-end items-center mt-4">
          <button
            type="button"
            className="text-xs px-3 py-1.5 rounded-lg font-medium bg-rose-950/30 text-rose-400 border border-rose-800/40 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-colors duration-200"
            onClick={e => {
              e.stopPropagation()
              onSupprimer(projet.id)
            }}
          >
            🗑 Supprimer
          </button>
        </div>
      </div>
    </article>
  )
}

export default Projet
