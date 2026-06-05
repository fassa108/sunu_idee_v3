const CATEGORIES_VALIDES = [
    "pedagogie",
    "evenement",
    "vie_de_campus",
    "amelioration_technique",
    "autre"
];

export async function genererCategorie(titre) {
    try {
        const resultat = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`
            },
            body: JSON.stringify({
                model: "poolside/laguna-xs.2:free",
                messages: [{
                    role: "user",
                    content: `Tu es un assistant de classification. Réponds UNIQUEMENT avec l'une de ces valeurs exactes, sans majuscules, sans ponctuation, sans rien d'autre :
pedagogie
evenement
vie_de_campus
amelioration_technique
autre

Classe ce titre : "${titre}"`
                }]
            })
        });

        const donnee = await resultat.json();
        const brut = donnee.choices[0].message.content.trim().toLowerCase();
        console.log("Réponse brute IA :", brut);

        
        const trouve = CATEGORIES_VALIDES.find(c => brut.includes(c));
        return trouve ?? "autre";

    } catch (err) {
        console.error("IA indisponible :", err);
        return "autre"; // catégorie par défaut si l'IA plante
    }
}