// Contact.jsx — Section formulaire de contact
// Permet aux visiteurs d'envoyer un message
// (Dans ce projet, le formulaire affiche juste une confirmation — pas de backend email)

import React, { useState } from 'react'

function Contact() {
  // État pour le formulaire
  const [envoye, setEnvoye] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()    // Empêche le rechargement de la page
    setEnvoye(true)       // Affiche le message de succès
  }

  return (
    <section id="contact" className="max-w-170 mx-auto px-6 py-20 scroll-mt-20">
      {/* En-tête */}
      <div className="text-center mb-10">
        <h2 className="font-syne text-[2.5rem] font-extrabold text-[#f1f0f8]">
          Contactez-<span className="text-violet-400">moi</span>
        </h2>
        <p className="text-slate-400 mt-2"> {/* gris, petite marge haute */}
          Une idée de projet ? Écrivez-moi, je réponds rapidement.
        </p>
      </div>

      {/* Conteneur du formulaire */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-8">
        {envoye ? (
          /* Message de succès affiché après soumission */
          <p className="text-center py-8 text-emerald-400 font-syne text-[1.1rem]">
            ✅ Message envoyé ! Je vous répondrai très bientôt.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" /* colonne, espace entre les champs */
          >

            {/* Prénom + Nom sur la même ligne */}
            <div className="grid grid-cols-2 gap-4"> {/* 2 colonnes égales, espacées */}

              <div className="flex flex-col gap-1.5"> {/* colonne, petit espace label/input */}
                <label className="text-white text-sm font-medium">Prénom</label>
                <input className="form-input py-3 px-3 placeholder:text-sm placeholder-gray-400 text-gray-400 bg-[#111118] border border-violet-600 rounded-md hover:border-violet-700 transition-colors" type="text" placeholder="Votre prénom" required />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-white text-sm font-medium">Nom</label>
                <input className="form-input py-3 px-3 placeholder:text-sm placeholder-gray-400 text-gray-400 bg-[#111118] border border-violet-600 rounded-md hover:border-violet-700 transition-colors" type="text" placeholder="Votre nom" required />
              </div>

            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white text-sm font-medium">Email</label>
              <input className="form-input py-3 px-3 placeholder:text-sm placeholder-gray-400 text-gray-400 bg-[#111118] border border-violet-600 rounded-md hover:border-violet-700 transition-colors" type="email" placeholder="votre@email.com" required />
            </div>

            {/* Sujet */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white text-sm font-medium">Sujet</label>
              <input className="form-input py-3 px-3 placeholder:text-sm placeholder-gray-400 text-gray-400 bg-[#111118] border border-violet-600 rounded-md hover:border-violet-700 transition-colors" type="text" placeholder="Sujet de votre message" />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white text-sm font-medium">Message</label>
              <textarea
                className="form-input resize-y py-3 px-3 placeholder:text-sm placeholder-gray-400 text-gray-400 bg-[#111118] border border-violet-600 rounded-md hover:border-violet-700 transition-colors" /* resize-y = redimensionnable verticalement */
                rows="5"
                placeholder="Écrivez votre message ici..."
                required
              />
            </div>

            {/* Bouton d'envoi */}
            <div className="text-center pt-2"> {/* centré, petit espace haut */}
              <button type="submit"
                className="px-10 py-3 rounded-lg text-base font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors">
                Envoyer le message →
              </button>
            </div>

          </form>
        )}
      </div>
    </section>
  )
}

export default Contact
