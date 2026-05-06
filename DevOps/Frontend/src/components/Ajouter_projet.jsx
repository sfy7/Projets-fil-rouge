// Ajouter_projet.jsx — Formulaire d'ajout (ou d'édition) d'un projet
import React, { useState, useMemo } from 'react'

function AjouterProjet({ onAjouter, onAnnuler, projetAEditer }) {
  const [editionDirect, setEditionDirect] = useState({})
  const [dernierIdEdition, setDernierIdEdition] = useState(projetAEditer?.id)

  const extractFileName = (url) => {
    if (!url) return 'Aucun fichier choisi'
    if (url.startsWith('data:')) return 'Image uploadée'
    try {
      return url.split('/').pop() || 'Image actuelle'
    } catch {
      return 'Image actuelle'
    }
  }

  // Réinitialiser quand on change de projet en édition
  if (projetAEditer?.id !== dernierIdEdition) {
    setDernierIdEdition(projetAEditer?.id)
    setEditionDirect({})
  }

  // Technologies : convertir tableau → string pour l'affichage dans l'input
  const techToString = (tech) => {
    if (!tech) return ''
    if (Array.isArray(tech)) return tech.join(', ')
    return tech
  }

  const valeurFormulaire = useMemo(() => {
    if (projetAEditer) {
      return {
        libelle: (editionDirect.libelle ?? projetAEditer.libelle) || '',
        description: (editionDirect.description ?? projetAEditer.description) || '',
        imageUrl: editionDirect.imageUrl || '',
        uploadedImage: editionDirect.uploadedImage || '',
        imageNom: editionDirect.imageNom ?? extractFileName(projetAEditer.image),
        technologies: (editionDirect.technologies ?? techToString(projetAEditer.technologies)) || ''
      }
    }
    return {
      libelle: editionDirect.libelle || '',
      description: editionDirect.description || '',
      imageUrl: editionDirect.imageUrl || '',
      uploadedImage: editionDirect.uploadedImage || '',
      imageNom: editionDirect.imageNom || 'Aucun fichier choisi',
      technologies: editionDirect.technologies || ''
    }
  }, [projetAEditer, editionDirect])

  const { libelle, description, imageUrl, uploadedImage, imageNom, technologies } = valeurFormulaire

  const updateField = (field, value) => {
    setEditionDirect(prev => ({ ...prev, [field]: value }))
  }

  // Upload image → base64 redimensionnée
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    updateField('imageNom', file.name)
    updateField('imageUrl', '')

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const maxWidth = 800
        const maxHeight = 600
        let { width, height } = img

        if (width > height) {
          if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth }
        } else {
          if (height > maxHeight) { width = (width * maxHeight) / height; height = maxHeight }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        updateField('uploadedImage', canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Convertir technologies string → tableau pour MongoDB
    const techArray = technologies
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    const image = uploadedImage || imageUrl || projetAEditer?.image

    const projet = {
      libelle,
      description,
      technologies: techArray,            // tableau pour MongoDB
    }

    if (image) projet.image = image

    onAjouter(projet)

    if (!projetAEditer) {
      setEditionDirect({})
    }
  }

  const isEdition = !!projetAEditer

  return (
    <section id="ajouter_projet" className="max-w-170 mx-auto px-6 py-16 scroll-mt-20">
      <div className="text-center mb-10">
        <h2 className="font-syne text-[2.5rem] font-extrabold text-[#f1f0f8] mb-2">
          {isEdition ? 'Modifier le ' : 'Ajouter un '}
          <span className="text-violet-600">Projet</span>
        </h2>
        <p className="text-slate-400 text-base">
          {isEdition
            ? 'Modifiez les informations du projet ci-dessous.'
            : 'Renseignez les informations ci-dessous pour ajouter un nouveau projet.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-8 flex flex-col gap-5">

        {/* Libelle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white text-sm font-medium">Libellé du projet</label>
          <input
            className="form-input py-3 px-3 placeholder:text-sm placeholder-gray-400 text-gray-400 bg-[#111118] border border-violet-600 rounded-md hover:border-violet-700 transition-colors"
            type="text"
            placeholder="Ex : Application E-commerce"
            value={libelle}
            onChange={e => updateField('libelle', e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white text-sm font-medium">Description</label>
          <textarea
            className="form-input resize-y py-3 px-3 placeholder:text-sm placeholder-gray-400 text-gray-400 bg-[#111118] border border-violet-600 rounded-md hover:border-violet-700 transition-colors"
            rows="5"
            placeholder="Décrivez votre projet..."
            value={description}
            onChange={e => updateField('description', e.target.value)}
            required
          />
        </div>

        {/* Image */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white text-sm font-medium">Image du projet</label>

          <div className="flex items-center gap-3">
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="imageUpload"
              className="px-5 py-2.5 bg-violet-950/25 border border-violet-700/45 rounded-lg text-violet-400 font-syne font-semibold text-[0.85rem] cursor-pointer whitespace-nowrap hover:bg-violet-950/40 transition-colors"
            >
              📁 Choisir une image
            </label>
            <input
              className="form-input flex-1 text-violet-400 cursor-default"
              type="text"
              readOnly
              value={imageNom}
            />
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-sm my-1">
            <div className="flex-1 h-px bg-[#1e1e2e]"></div>
            <span>OU</span>
            <div className="flex-1 h-px bg-[#1e1e2e]"></div>
          </div>

          <label className="text-white text-sm font-medium">URL de l'image</label>
          <input
            className="form-input py-3 px-3 placeholder:text-sm placeholder-gray-400 text-gray-400 bg-[#111118] border border-violet-600 rounded-md hover:border-violet-700 transition-colors"
            type="url"
            placeholder="https://exemple.com/image.jpg"
            value={imageUrl}
            onChange={e => {
              updateField('imageUrl', e.target.value)
              if (e.target.value) updateField('uploadedImage', '')
            }}
          />
        </div>

        {/* Technologies */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white text-sm font-medium">Technologies utilisées</label>
          <input
            className="form-input py-3 px-3 placeholder:text-sm placeholder-gray-400 text-gray-400 bg-[#111118] border border-violet-600 rounded-md hover:border-violet-700 transition-colors"
            type="text"
            placeholder="HTML, Tailwind, React..."
            value={technologies}
            onChange={e => updateField('technologies', e.target.value)}
            required
          />
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            className="px-5 py-2 rounded-lg text-sm font-medium bg-[#1e1e2e] text-slate-400 border border-[#2a2a3e] hover:bg-[#2a2a3e] transition-colors"
            onClick={onAnnuler}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors"
          >
            {isEdition ? '✏️ Enregistrer les modifications' : '+ Ajouter le projet'}
          </button>
        </div>

      </form>
    </section>
  )
}

export default AjouterProjet
