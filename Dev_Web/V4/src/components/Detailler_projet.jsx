// Detailler_projet.jsx — Panneau de détail d'un projet
import React from 'react'

const slideInStyle = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);   opacity: 1; }
  }
  .panel-slide-in {
    animation: slideIn 0.3s ease;
  }
`

function DetaillerProjet({ projet, onAnnuler, onEditer }) {
  if (!projet) return null

  const libelleProjet = projet.libelle || 'Projet sans libelle'
  const dateProjet = projet.date

  // Technologies : tableau MongoDB ou chaîne fallback
  const techArray = Array.isArray(projet.technologies)
    ? projet.technologies
    : (projet.technologies || '').split(',').map(t => t.trim())

  // Formate la date MongoDB en français
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
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
    <div
      className="fixed inset-0 bg-black/70 z-200 flex justify-center items-center backdrop-blur-sm"
      onClick={onAnnuler}
    >
      <style>{slideInStyle}</style>

      <div
        className="panel-slide-in w-full max-w-130 bg-[#0d0d14] shadow-2xl border border-[#1e1e2e] rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        {projet.image ? (
          <img
            src={projet.image}
            alt={libelleProjet}
            className="w-full h-55 object-cover rounded-t-2xl"
          />
        ) : (
          <div className="w-full h-55 flex items-center justify-center text-6xl bg-linear-to-br from-[#1a1a2e] to-[#2d1b69] rounded-t-2xl">
            🖥️
          </div>
        )}

        {/* Corps */}
        <div className="p-6">

          {/* Libelle */}
          <h3 className="font-syne text-[1.6rem] font-extrabold text-violet-400 mb-1">
            {libelleProjet}
          </h3>

          {/* Date */}
          <p className="text-[#8b8aa0] text-sm mb-6">
            {formatDate(dateProjet)}
          </p>

          {/* Description */}
          <p className="font-syne text-base font-bold text-[#f1f0f8] mt-5 mb-2">
            Description
          </p>
          <p className="text-[#c5c4d8] text-[0.95rem] leading-7">
            {projet.description}
          </p>

          {/* Technologies */}
          <p className="font-syne text-base font-bold text-[#f1f0f8] mt-5 mb-2">
            Technologies utilisées
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {techArray.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-violet-950/20 border border-violet-700/35 rounded-full text-violet-400 text-[0.82rem] font-semibold"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Boutons */}
          <div className="flex gap-3 mt-8 pt-5 border-t border-[#1e1e2e]">
            <button
              type="button"
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-[#1e1e2e] text-[#8b8aa0] border border-[#2a2a3e] hover:bg-[#2a2a3e] transition-colors"
              onClick={onAnnuler}
            >
              ✕ Annuler
            </button>
            <button
              type="button"
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              onClick={() => onEditer(projet)}
            >
              ✏️ Éditer
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default DetaillerProjet
