// Ajouter_projet.jsx — Formulaire d'ajout (ou d'édition) d'un projet
//
// Ce composant est réutilisé pour DEUX cas :
//   1. Ajouter un nouveau projet (projetAEditer = null)
//   2. Modifier un projet existant (projetAEditer = l'objet projet)
//
// Props :
//   - onAjouter (fn)      : appelée avec les données du formulaire à la soumission
//   - onAnnuler (fn)      : appelée quand l'utilisateur clique "Annuler"
//   - projetAEditer (obj) : si fourni, pré-remplit le formulaire pour édition

import React, { useState, useMemo } from 'react'

function AjouterProjet({ onAjouter, onAnnuler, projetAEditer }) {
  // --- État local pour les changements du formulaire ---
  // On trace la clé du projet en édition pour savoir quand réinitialiser
  const [editionDirect, setEditionDirect] = useState({})
  const [dernierIdEdition, setDernierIdEdition] = useState(projetAEditer?.id)

  // Fonction helper pour extraire le nom du fichier d'une URL
  const extractFileName = (url) => {
    if (!url) return 'Aucun fichier choisi'
    if (url.startsWith('data:')) return 'Image uploadée'
    try {
      return url.split('/').pop() || 'Image actuelle'
    } catch {
      return 'Image actuelle'
    }
  }

  // Réinitialiser editionDirect quand on change de projet en édition
  if (projetAEditer?.id !== dernierIdEdition) {
    setDernierIdEdition(projetAEditer?.id)
    setEditionDirect({})
  }

  // Calculer les valeurs affichées du formulaire : priorité aux changements directs, sinon valeurs du projet en édition ou vides
  const valeurFormulaire = useMemo(() => {
    if (projetAEditer) {
      return {
        libelle: (editionDirect.libelle ?? projetAEditer.libelle) || '',
        description: (editionDirect.description ?? projetAEditer.description) || '',
        imageUrl: editionDirect.imageUrl || '',
        uploadedImage: editionDirect.uploadedImage || '',
        imageNom: editionDirect.imageNom ?? (projetAEditer.imageNom || extractFileName(projetAEditer.image)),
        technologies: (editionDirect.technologies ?? projetAEditer.technologies) || ''
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


  // Destructure pour faciliter l'accès aux champs
  const { libelle, description, imageUrl, uploadedImage, imageNom, technologies } = valeurFormulaire

  // Fonction helper pour mettre à jour un champ du formulaire
  const updateField = (field, value) => {
    setEditionDirect(prev => ({ ...prev, [field]: value }))
  }

  // --- Gestion de l'upload d'image locale ---
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    updateField('imageNom', file.name)               // Affiche le nom du fichier
    updateField('imageUrl', '')                      // Vide le champ URL quand on upload un fichier

    // Redimensionner l'image avant de la convertir en base64
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const maxWidth = 800
        const maxHeight = 600
        let { width, height } = img

        // Calculer les nouvelles dimensions en gardant le ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8) // Qualité 80% pour réduire la taille
        updateField('uploadedImage', resizedDataUrl)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  // --- Soumission du formulaire ---
  const handleSubmit = (e) => {
    e.preventDefault()   // Empêche le rechargement de la page (comportement natif HTML)

    // Construction de l'objet projet à envoyer
    const projet = {
      libelle,
      description,
      image: uploadedImage || imageUrl,  // Utilise uploadedImage si disponible, sinon imageUrl
      technologies,
      imageNom: uploadedImage ? imageNom : (imageUrl ? extractFileName(imageUrl) : ''),
      // Si pas de date fournie, on génère la date du jour
      date: projetAEditer?.date || `Ajouté le ${new Date().toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
      })}`,
    }

    onAjouter(projet)    // Remonte les données au composant parent (Dossier)

    // Réinitialiser le formulaire (seulement si on ajoute, pas en édition)
    if (!projetAEditer) {
      setEditionDirect({})
    }
  }

  // Détermine si on est en mode "Édition" ou "Ajout"
  const isEdition = !!projetAEditer

  return (
    <section id="ajouter_projet" className="max-w-170 mx-auto px-6 py-16 scroll-mt-20">
      {/* En-tête de la section */}
      <div className="text-center mb-10"> {/* centré, marge basse */}
        <h2 className="font-syne text-[2.5rem] font-extrabold text-[#f1f0f8] mb-2">
          {isEdition ? 'Modifier le ' : 'Ajouter un '}
          <span className="text-violet-600"> {/* couleur accent violette */}
            Projet
          </span>
        </h2>
        <p className="text-slate-400 text-base"> {/* gris, taille normale */}
          {isEdition
            ? 'Modifiez les informations du projet ci-dessous.'
            : 'Renseignez les informations ci-dessous pour ajouter un nouveau projet.'}
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-8 flex flex-col gap-5">

        {/* Champ : Libellé */}
        <div className="flex flex-col gap-1.5"> {/* colonne, petit espace entre label et input */}
          <label className="text-white text-sm font-medium">
            Libellé du projet
          </label>
          <input className="form-input py-3 px-3 placeholder:text-sm placeholder-gray-400 text-gray-400 bg-[#111118] border border-violet-600 rounded-md hover:border-violet-700 transition-colors" /* classe CSS globale de votre projet */
            type="text"
            placeholder="Ex : Application E-commerce"
            value={libelle}
            onChange={e => updateField('libelle', e.target.value)}
            required
          />
        </div>

        {/* Champ : Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white text-sm font-medium">
            Description
          </label>
          <textarea
            className="form-input resize-y py-3 px-3 placeholder:text-sm placeholder-gray-400 text-gray-400 bg-[#111118] border border-violet-600 rounded-md hover:border-violet-700 transition-colors" /* resize-y = redimensionnable verticalement */
            rows="5"
            placeholder="Décrivez votre projet..."
            value={description}
            onChange={e => updateField('description', e.target.value)}
            required
          />
        </div>

        {/* Champ : Image (upload OU URL) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white text-sm font-medium">
            Image du projet
          </label>

          {/* Ligne avec bouton upload + nom du fichier */}
          <div className="flex items-center gap-3"> {/* côte à côte, alignés, espacés */}

            {/* Input file caché — déclenché par le label ci-dessous */}
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              className="hidden" /* display: none en Tailwind */
              onChange={handleFileChange}
            />

            {/* Bouton personnalisé qui déclenche l'input file caché */}
            <label htmlFor="imageUpload"
                className="px-5 py-2.5 bg-violet-950/25 border border-violet-700/45 rounded-lg text-violet-400 font-syne font-semibold text-[0.85rem] cursor-pointer whitespace-nowrap hover:bg-violet-950/40 transition-colors">
              📁 Choisir une image
            </label>

            {/* Affiche le nom du fichier choisi */}
            <input
              className="form-input flex-1 text-violet-400 cursor-default"
              /* flex-1 = prend l'espace restant ; cursor-default = pas de curseur texte */
              type="text"
              readOnly
              value={imageNom}
            />
          </div>

          {/* Séparateur "OU" */}
          <div className="flex items-center gap-4 text-slate-400 text-sm my-1">
            {/* my-1 = petite marge verticale */}
            <div className="flex-1 h-px bg-[#1e1e2e]"></div> {/* ligne gauche */}
            <span>OU</span>
            <div className="flex-1 h-px bg-[#1e1e2e]"></div> {/* ligne droite */}
          </div>

          {/* Alternative : saisir directement une URL */}
          <label className="text-white text-sm font-medium">
            URL de l'image
          </label>
          <input
            className="form-input py-3 px-3 placeholder:text-sm placeholder-gray-400 text-gray-400 bg-[#111118] border border-violet-600 rounded-md hover:border-violet-700 transition-colors"
            type="url"
            placeholder="https://exemple.com/image.jpg"
            value={imageUrl}
            onChange={e => {
              updateField('imageUrl', e.target.value)
              if (e.target.value) updateField('uploadedImage', '')  // Vide uploadedImage si on saisit une URL
            }}
          />
        </div>

        {/* Champ : Technologies */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white text-sm font-medium">
            Technologies utilisées
          </label>
          <input
            className="form-input py-3 px-3 placeholder:text-sm placeholder-gray-400 text-gray-400 bg-[#111118] border border-violet-600 rounded-md hover:border-violet-700 transition-colors"
            type="text"
            placeholder="HTML, Tailwind, React..."
            value={technologies}
            onChange={e => updateField('technologies', e.target.value)}
            required
          />
        </div>

        {/* Boutons Annuler / Soumettre */}
        <div className="flex justify-end gap-3 pt-2">
          {/* Bouton "Annuler" — style neutre/gris */}
          <button type="button"
            className="px-5 py-2 rounded-lg text-sm font-medium bg-[#1e1e2e] text-slate-400 border border-[#2a2a3e] hover:bg-[#2a2a3e] transition-colors"
            onClick={onAnnuler}
          >
            Annuler
          </button>

          {/* Bouton "Soumettre" — style primaire/violet */}
          <button type="submit" className="px-5 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors">
            {isEdition ? '✏️ Enregistrer les modifications' : '+ Ajouter le projet'}
          </button>
        </div>

      </form>
    </section>
  )
}

export default AjouterProjet
