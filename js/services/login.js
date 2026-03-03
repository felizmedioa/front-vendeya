// ============================================================
//  Servicio de Login — Obtiene token de autenticación
// ============================================================
import { URL_BACKEND } from '../config.js';

/**
 * Solicita un token de autenticación al backend.
 * @returns {Promise<Object>} Datos del token
 */
export async function login() {
    try {
        const response = await fetch(`${URL_BACKEND}/obtener-token`);

        if (!response.ok) {
            throw new Error(`Error en login: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        throw error;
    }
}