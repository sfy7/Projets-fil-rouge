import React from "react";
import Navbar from "./components/Navbar";
import Dossier from "./components/Dossier"
import Contact from "./components/Contact"
import Footer from './components/Footer'
import './index.css'

function App() {
  return (
    <div className="scroll-smooth">
      <Navbar />

      <main className="bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 min-h-screen pt-32">
        {/* Section Accueil */}
        <section
          id="accueil"
          className="scroll-mt-[80px] flex flex-col justify-center items-center min-h-[calc(100vh-6rem)] px-10 text-center space-y-6"
        >
          <h1 className="text-[55px] font-semibold text-white leading-tight">
            Bienvenue sur mon portfolio
          </h1>
          <h1 className="text-[38px] font-medium text-violet-600">
            Je suis Safiétou Sy, développeuse FullStack
          </h1>
          <p className="text-gray-300 text-md leading-relaxed max-w-3xl">
            Passionnée par la technologie et le développement web. J'aime transformer des idées en
            applications fonctionnelles et intuitives. À travers mes projets, je cherche à créer des
            solutions utiles tout en améliorant continuellement mes compétences en programmation, en
            conception d'interfaces et en architecture web. N'hésitez pas à me contacter si vous avez
            des questions ou souhaitez collaborer sur un projet.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <button className="px-6 py-3 bg-transparent text-white rounded-full font-medium border border-white/20 hover:bg-violet-700/20 transition duration-300">
              Formations
            </button>
            <button className="px-6 py-3 bg-transparent text-white rounded-full font-medium border border-white/20 hover:bg-violet-700/20 transition duration-300">
              Compétences
            </button>
            <button className="px-6 py-3 bg-transparent text-white rounded-full font-medium border border-white/20 hover:bg-violet-700/20 transition duration-300">
              Expériences
            </button>
            <button className="px-6 py-3 bg-transparent text-white rounded-full font-medium border border-white/20 hover:bg-violet-700/20 transition duration-300">
              Télécharger CV
            </button>
          </div>
          <a href="#projets" className="inline-block mt-12">
            <button className="px-6 py-3 bg-gradient-to-r from-slate-900 to-violet-700 text-white rounded-full font-medium hover:shadow-2xl hover:translate-y-1 hover:shadow-violet-400/100 transition duration-300">
              Voir mes projets
            </button>
          </a>
        </section>

        {/* Composant Dossier — gère toute la logique projets */}
        <Dossier />

        {/* Section Contact*/}
        <div className="w-full border-t border-white/5" />
        <Contact />
      </main>

      <Footer/>
    </div>
  );
}

export default App;
