import type { DeepPartial } from "../get-dictionary";
import type { Dictionary } from "./en";

/** Partial translation — missing keys fall back to English via `getDictionary`. */
const fr: DeepPartial<Dictionary> = {
  common: {
    loading: "Chargement…",
    search: "Rechercher",
    cancel: "Annuler",
    save: "Enregistrer",
    delete: "Supprimer",
    confirm: "Confirmer",
    back: "Retour",
    viewAll: "Tout afficher",
    noResults: "Aucun résultat",
  },
  nav: {
    home: "Accueil",
    dashboard: "Tableau de bord",
    analytics: "Analytique",
    orders: "Commandes",
    schools: "Écoles",
    priceLists: "Tarifs",
    settings: "Paramètres",
    login: "Connexion",
    logout: "Déconnexion",
    cart: "Panier",
  },
  cart: {
    title: "Votre panier",
    empty: "Votre panier est vide",
    subtotal: "Sous-total",
    total: "Total",
    checkout: "Passer à la caisse",
  },
};

export default fr;
