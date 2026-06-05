export function validerTitre(titre) {
    if (!titre || titre.trim().length === 0) {
        return "Le titre est requis.";
    }
    if (titre.length < 3) {
        return "Le titre doit contenir au moins 3 caractères.";
    }
    if (titre.length > 100) {
        return "Le titre ne doit pas dépasser 100 caractères.";
    }
    return null;
}

export function validerDescription(description) {
    if (!description || description.trim().length === 0) {
        return "La description est requise.";
    }
    if (description.length < 3) {
        return "La description doit contenir au moins 25 caractères.";
    }
    if (description.length > 400) {
        return "La description ne doit pas dépasser 400 caractères.";
    }
    return null;
}

export function nettoyerChamp(champ) {
  return champ
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}