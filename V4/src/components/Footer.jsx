// Footer.jsx — Pied de page du portfolio
// Affiche les liens vers les réseaux sociaux et la mention de copyright

import React from 'react'

// Données des réseaux sociaux (tableau pour faciliter l'ajout/suppression)
const reseaux = [
  { href: 'https://www.linkedin.com/in/safi3', icon: 'fab fa-linkedin', label: 'LinkedIn' },
  { href: 'https://github.com/sfy7/Projets-fil-rouge/tree/main/V4', icon: 'fab fa-github', label: 'GitHub' },
  { href: '#', icon: 'fab fa-facebook', label: 'Facebook' },
  { href: 'https://wa.me/221772975658', icon: 'fab fa-whatsapp', label: 'WhatsApp' },
  { href: '#', icon: 'fab fa-instagram', label: 'Instagram' },
  { href: 'mailto:safietou0218@gmail.com', icon: 'fab fa-google', label: 'Email' },
]

function Footer() {
  return (
    <footer className="bg-[#0d0d14] border-t border-[#1e1e2e] px-10 py-10 flex items-center justify-between flex-wrap gap-4">
      {/* Espace vide à gauche pour centrer le copyright */}
      <div className="flex-1"></div>

      {/* Copyright centré */}
      <p className="text-[#8b8aa0] text-[0.85rem] flex-1 text-center">
        © 2026 — Portfolio Safiétou Sy. Tous droits réservés.
      </p>

      {/* Liens réseaux sociaux */}
      <div className="flex gap-5 flex-1 justify-end ">
        {reseaux.map(({ href, icon, label }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            aria-label={label}    /* Accessibilité : décrit le lien pour les lecteurs d'écran */
            className="text-[#8b8aa0] text-xl no-underline transition-colors duration-200 hover:text-violet-400">
            {/* Icône Font Awesome (classe CSS) */}
            <i className={icon}></i>
          </a>
        ))}
      </div>
    </footer>
  )
}

export default Footer
