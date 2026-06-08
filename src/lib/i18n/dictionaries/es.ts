import type { DeepPartial } from "../get-dictionary";
import type { Dictionary } from "./en";

/** Partial translation — missing keys fall back to English via `getDictionary`. */
const es: DeepPartial<Dictionary> = {
  common: {
    loading: "Cargando…",
    search: "Buscar",
    cancel: "Cancelar",
    save: "Guardar cambios",
    delete: "Eliminar",
    confirm: "Confirmar",
    back: "Volver",
    viewAll: "Ver todo",
    noResults: "Sin resultados",
  },
  nav: {
    home: "Inicio",
    dashboard: "Panel",
    analytics: "Analítica",
    orders: "Pedidos",
    schools: "Escuelas",
    priceLists: "Tarifas",
    settings: "Ajustes",
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
    cart: "Carrito",
  },
  cart: {
    title: "Tu carrito",
    empty: "Tu carrito está vacío",
    subtotal: "Subtotal",
    total: "Total",
    checkout: "Ir a pagar",
  },
};

export default es;
