import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Callback realtime 
let onChangement = null;

export function setOnChangement(fn) {
    onChangement = fn;
}

// CRUD 
export async function ajouterIdee(titre, categorie, description) {
    const { data, error } = await supabase
        .from("idees")
        .insert({ titre, categorie, description })
        .select();
    if (error) {
        console.error("Erreur lors de l'ajout :", error);
        return null;
    }
    return data;
}

export async function recupererIdees() {
    const { data, error } = await supabase
        .from("idees")
        .select("*");
    if (error) {
        console.error("Erreur lors de la récupération :", error);
        return [];
    }
    return data;
}

export async function supprimerIdee(id) {
    const { error } = await supabase
        .from("idees")
        .delete()
        .eq("id", id);
    if (error) {
        console.error("Erreur lors de la suppression :", error);
        return false;
    }
    return true;
}

export async function modifierIdee(id, titre, categorie, description) {
    const { error } = await supabase
        .from("idees")
        .update({ titre, categorie, description })
        .eq("id", id);
    if (error) {
        console.error("Erreur lors de la modification :", error);
        return false;
    }
    return true;
}

// Realtime
supabase
    .channel("realtime-idees")
    .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "idees" },
        async (payload) => {
            console.log("Changement reçu :", payload);
            if (onChangement) await onChangement();
        }
    )
    .subscribe((status) => {
        console.log("Statut abonnement realtime :", status);
    });