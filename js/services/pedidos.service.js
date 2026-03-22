import { URL_BACKEND } from '../config.env.js';

const CACHE_KEY = 'pedidos_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de tiempo de vida (TTL)

/**
 * Obtiene la lista de pedidos. Primero intenta desde el caché de sesión, 
 * y si no existe, está expirado, o se fuerza, lo trae del backend.
 * @param {string} token El JWT del usuario
 * @param {boolean} forceRefresh Obliga a saltarse el caché
 */
export async function fetchPedidos(token, forceRefresh = false) {
    if (!forceRefresh) {
        const cachedStr = sessionStorage.getItem(CACHE_KEY);
        if (cachedStr) {
            try {
                const cached = JSON.parse(cachedStr);
                const now = Date.now();
                if (now - cached.timestamp < CACHE_TTL_MS) {
                    console.log("Cargando pedidos desde caché local (Rápido) ⚡");
                    return cached.data;
                }
            } catch(e) {
                console.warn("Caché local corrupto. Obteniendo datos frescos...");
            }
        }
    }

    console.log("Consumiendo API Backend para traer pedidos 🌍");
    const response = await fetch(`${URL_BACKEND}/pedidos-forms/list`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token })
    });

    if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
    }

    const pedidos = await response.json();
    
    // Guardar en caché usando sessionStorage (se limpia al cerrar la pestaña/navegador)
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: pedidos
    }));

    return pedidos;
}

/**
 * Limpia manualmente el caché de pedidos (Útil al hacer logout o actualizar/crear un pedido)
 */
export function invalidarCachePedidos() {
    sessionStorage.removeItem(CACHE_KEY);
}
