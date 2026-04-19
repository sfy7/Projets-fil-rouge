import React, { useState } from "react";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("accueil");

  return (
    <header>
      <nav className="fixed top-0 w-full z-50 flex items-center px-10 py-6 bg-slate-900">
        <img src="logo.png" alt="Logo" className="h-20 w-auto hover:scale-110 transition duration-300" />
        <p className="text-2xl text-white font-semibold ml-2">FullStack_Portfolio</p>
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <a
            href="#accueil"
            onClick={() => setActiveSection("accueil")}
            className={`px-6 py-3 rounded-full font-display text-md font-medium transition-all duration-300 ${
              activeSection === "accueil"
                ? "bg-violet-500 text-white shadow-lg shadow-violet-500/75"
                : "bg-gray-800 text-white hover:bg-violet-700/30 hover:text-violet-400"
            }`}
          >
            Accueil
          </a>
          <a
            href="#projets"
            onClick={() => setActiveSection("projets")}
            className={`px-6 py-3 rounded-full font-display text-md font-medium transition-all duration-300 ${
              activeSection === "projets"
                ? "bg-violet-500 text-white shadow-lg shadow-violet-500/75"
                : "bg-gray-800 text-white hover:bg-violet-700/30 hover:text-violet-400"
            }`}
          >
            Mes Projets
          </a>
        </div>
        <div className="ml-auto">
          <a
            href="#contact"
            onClick={() => setActiveSection("contact")}
            className={`px-6 py-3 rounded-full font-display text-md font-medium transition-all duration-300 ${
              activeSection === "contact"
                ? "bg-violet-500 text-white shadow-lg shadow-violet-500/75"
                : "bg-gray-800 text-white hover:bg-violet-700/30 hover:text-violet-400"
            }`}
          >
            Contact
          </a>
        </div>
      </nav>
    </header>
  );
}
