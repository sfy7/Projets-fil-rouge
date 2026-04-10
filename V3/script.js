let projets = [];
const API_URL = "http://localhost:3000/projets";

// ============================================================
// CHARGER LES PROJETS — GET
// ============================================================
async function chargerProjets() {
  try {
    const response = await fetch(API_URL);
    projets = await response.json();
    projets.forEach(p => {
      creerProjet(p.id, p.libelle, p.image);
    });
  } catch (error) {
    console.error("Erreur chargement projets :", error);
  }
}

// ============================================================
// CREER UN PROJET
// ============================================================
function creerProjet(id, libelle, image) {
  const article = document.createElement("article");
  article.id = "projet-" + id;
  article.className = "group bg-gray-800/75 rounded-xl overflow-hidden border border-transparent hover:border-teal-400 shadow-lg hover:shadow-xl transition-shadow duration-300";

  article.innerHTML = `
    <img src="${image}" alt="${libelle}" class="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-110">
    <div class="p-4">
      <h3 class="text-white text-2xl font-semibold mb-1">${libelle}</h3>
    </div>
    <div class="m-4 flex gap-2">
      <button onclick="detaillerProjet('${id}')"
        class="px-4 py-2 bg-teal-400 text-gray-900 rounded-lg font-medium hover:shadow-xl hover:shadow-teal-400/75 transition duration-300">
        Voir détails
      </button>
      <button onclick="supprimerProjet('${id}')"
        class="px-4 py-2 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-700 hover:text-white transition duration-300">
        Supprimer
      </button>
    </div>
  `;

  const grille = document.getElementById("grille-projets");
  grille.insertBefore(article, grille.firstChild);

  return article;
}


// ============================================================
// AJOUTER UN PROJET — POST
// ============================================================
async function ajouterProjet(event) {
  event.preventDefault();

  const libelle      = document.getElementById("input-libelle").value.trim();
  const description  = document.getElementById("input-description").value.trim();
  const technologies = document.getElementById("input-technologies").value.trim();
  const imageUrl     = document.getElementById("input-image-url").value.trim();
  const fichier      = document.getElementById("imageUpload").files[0];
  const date         = "Ajouté le " + new Date().toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric"
  });

  if (!libelle || !description || !technologies) {
    alert("Veuillez remplir tous les champs obligatoires.");
    return;
  }

  // Lire l'image choisie depuis le fichier local
  if (fichier) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      const image = e.target.result;
      await envoyerProjet(libelle, description, technologies, image, date, event);
    };
    reader.readAsDataURL(fichier);
  } else {
    const image = imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=500&q=80";
    await envoyerProjet(libelle, description, technologies, image, date, event);
  }
}

// Afficher le nom du fichier image choisi
document.getElementById("imageUpload").addEventListener("change", function () {
  const input = document.getElementById("input-filename");
  input.value = this.files[0] ? this.files[0].name : "";
});

// Envoyer les données du projet au serveur

async function envoyerProjet(libelle, description, technologies, image, date, event) {
  const nouveauProjet = { libelle, description, technologies, image, date };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nouveauProjet)
    });
    const projetSauvegarde = await response.json();

    projets.unshift(projetSauvegarde);
    creerProjet(projetSauvegarde.id, projetSauvegarde.libelle, projetSauvegarde.image);

    event.target.reset();
    document.getElementById("input-filename").value = ""; // Vider le champ nom du fichier
    window.location.href = "#projets";

  } catch (error) {
    console.error("Erreur ajout projet :", error);
    alert("Erreur lors de l'ajout. Vérifiez que json-server est lancé.");
  }
}


// Lancement au démarrage
chargerProjets();