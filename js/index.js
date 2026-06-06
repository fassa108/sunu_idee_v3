import { ajouterIdee, recupererIdees, supprimerIdee, modifierIdee } from "./supabase.js";
import { genererCategorie } from "./ai.js";
import { validerTitre, validerDescription } from "./validation.js";
import {setOnChangement} from "./supabase.js"

// ─── Modales ──────────────────────────────────────────────────────────────────
const modalAjout  = new bootstrap.Modal(document.getElementById('modalAjouter'));
const modalEditer = new bootstrap.Modal(document.querySelector("#modalEditer"));

// ─── Sélecteurs ───────────────────────────────────────────────────────────────
const btnAjouter      = document.getElementById('btn-ajouter');
const inputTitre      = document.querySelector("#ajout-titre");
const inputCategorie  = document.querySelector("#ajout-categorie");
const inputDescription= document.querySelector("#ajout-description");
const btnSoumettre    = document.querySelector("#btn-soumettre");
const mur             = document.querySelector("#mur");
const messageVide     = document.querySelector("#message-vide");
const compteur        = document.querySelector("#compteur");
const editTitre       = document.querySelector("#edit-titre");
const editCategorie   = document.querySelector("#edit-categorie");
const editDescription = document.querySelector("#edit-description");
const btnSauvegarder  = document.querySelector("#btn-sauvegarder");

// ─── Données ──────────────────────────────────────────────────────────────────
let idees = await recupererIdees() || [];
let idEnCoursEdition = null;

inputCategorie.disabled = true;

// ─── Constantes ───────────────────────────────────────────────────────────────
const couleurs = {
    "pedagogie":              "#0d6efd",
    "evenement":              "#198754",
    "vie_de_campus":          "#fd7e14",
    "amelioration_technique": "#dc3545",
    "autre":                  "#6f2da8"
};

const CATEGORIES = [
    "pedagogie",
    "evenement",
    "vie_de_campus",
    "amelioration_technique",
    "autre"
];

// ─── Erreurs inline ───────────────────────────────────────────────────────────
function afficherErreur(id, message) {
    const el = document.getElementById(id);
    if (!el) return;

    // Trouver l'input associé — il est juste avant le <small>
    const input = el.previousElementSibling;

    if (message) {
        el.textContent = message;
        el.classList.remove("d-none");
        input?.classList.add("is-invalid");
    } else {
        el.textContent = "";
        el.classList.add("d-none");
        input?.classList.remove("is-invalid");
    }
}

function effacerErreurs() {
    afficherErreur("erreur-titre", null);
    afficherErreur("erreur-description", null);
}

// ─── Loading overlay ──────────────────────────────────────────────────────────
function setLoading(actif) {
    const overlay = document.getElementById("overlay-loading");
    actif
        ? overlay.classList.remove("d-none")
        : overlay.classList.add("d-none");
}

// ─── Formulaire ───────────────────────────────────────────────────────────────
function reinitialiserFormulaire() {
    inputTitre.value        = "";
    inputCategorie.value    = "";
    inputDescription.value  = "";
    effacerErreurs();
}

async function sauvegarder(idee) {
    await ajouterIdee(idee.titre, idee.categorie, idee.description);
    idees = await recupererIdees();
    afficherTout();
}

// ─── Listeners ────────────────────────────────────────────────────────────────
btnAjouter.addEventListener('click', () => modalAjout.show());

// Validation temps réel
inputTitre.addEventListener("input", () => {
    const erreur = validerTitre(inputTitre.value.trim());
    afficherErreur("erreur-titre", erreur !== inputTitre.value.trim() ? erreur : null);
});

inputDescription.addEventListener("input", () => {
    const erreur = validerDescription(inputDescription.value.trim());
    afficherErreur("erreur-description", erreur);
});

// Catégorisation IA au blur
inputTitre.addEventListener("blur", async () => {
    if (!inputTitre.value.trim()) return;

    setLoading(true);
    let categorieGeneree = await genererCategorie(inputTitre.value); // ✅ let
    setLoading(false);

    if (!CATEGORIES.includes(categorieGeneree)) {
        categorieGeneree = "autre"; // ✅ fonctionne avec let
    }
    inputCategorie.value = categorieGeneree;
});

// Soumission
btnSoumettre.addEventListener("click", async () => {
    const titre       = inputTitre.value.trim();
    const description = inputDescription.value.trim();
    const categorie   = inputCategorie.value;

    

    const erreurTitre = validerTitre(titre);
    if (erreurTitre !== null) {
        afficherErreur("erreur-titre", erreurTitre);
        return;
    }

    const erreurDescription = validerDescription(description);
    if (erreurDescription) {
        afficherErreur("erreur-description", erreurDescription);
        return;
    }

    setLoading(true);
    try {
        await sauvegarder({ titre, categorie, description });
        reinitialiserFormulaire();
        modalAjout.hide();
    } catch (err) {
        console.error("Erreur :", err);
        afficherErreur("erreur-description", "Une erreur est survenue, réessayez.");
    } finally {
        setLoading(false);
    }
});

// ─── Affichage mur ────────────────────────────────────────────────────────────
export async function afficherTout() {
    mur.innerHTML = "";
    const idees = await recupererIdees();
    if (idees.length === 0) {
        messageVide.classList.remove("d-none");
        compteur.textContent = "0 idée(s)";
        return;
    }

    messageVide.classList.add("d-none");
    compteur.textContent = `${idees.length} idée(s)`;

    idees.forEach(idee => {
        const col = document.createElement("div");
        col.classList.add("col-md-6", "col-xl-4");
        col.innerHTML = `
            <div class="card h-100 shadow-sm border-0 carte-idee">
                <div class="card-body d-flex flex-column">
                    <span class="badge mb-2 px-2 py-1 align-self-start"
                          style="background-color: ${couleurs[idee.categorie] || '#6f2da8'}">
                        ${idee.categorie}
                    </span>
                    <h5 class="card-title fw-bold mb-2">${idee.titre}</h5>
                    <p class="card-text text-muted flex-grow-1">${idee.description}</p>
                    <div class="d-flex gap-2 mt-3">
                        <button class="btn btn-sm btn-outline-warning flex-grow-1"
                                onclick="ouvrirEdition('${idee.id}')">
                            <i class="bi bi-pencil me-1"></i>Modifier
                        </button>
                        <button class="btn btn-sm btn-outline-danger flex-grow-1"
                                onclick="supprimerUneIdee('${idee.id}')">
                            <i class="bi bi-trash me-1"></i>Supprimer
                        </button>
                    </div>
                </div>
            </div>`;
        mur.appendChild(col);
    });
}
setOnChangement(afficherTout);

// ─── Édition ─────────────────────────────────────────────────────────────────
window.ouvrirEdition = function(id) {
    const idee = idees.find(i => i.id === id);
    if (!idee) return;
    idEnCoursEdition = id;
    editTitre.value       = idee.titre;
    editCategorie.value   = idee.categorie;
    editDescription.value = idee.description;
    modalEditer.show();
}; 

btnSauvegarder.addEventListener("click", async () => {
    const titre       = editTitre.value.trim();
    const categorie   = editCategorie.value;
    const description = editDescription.value.trim();
    if (!titre || !categorie || !description) return;

    const idee = idees.find(i => i.id === idEnCoursEdition);
    if (!idee) return;

    const succes = await modifierIdee(idEnCoursEdition, titre, categorie, description);
    if (!succes) {
        alert("Erreur lors de la modification.");
        return;
    }
    idees = await recupererIdees();
    afficherTout();
    modalEditer.hide();
    idEnCoursEdition = null;
});

// ─── Suppression ─────────────────────────────────────────────────────────────
window.supprimerUneIdee = async (id) => {
    if (!confirm("Supprimer définitivement cette idée ?")) return;
    const succes = await supprimerIdee(id);
    if (!succes) {
        alert("Erreur lors de la suppression.");
        return;
    }
    idees = await recupererIdees();
    afficherTout();
};

// ─── Init ─────────────────────────────────────────────────────────────────────
afficherTout();