// ============================================================
//  Punto de Entrada — Registro de Pedido (index.html)
// ============================================================

// --- Servicios ---
import { iniciarMapa } from './services/mapa.service.js';
import {
    inicializarAgencias,
    abrirModalAgencias,
    cerrarModalBackdropAgencias
} from './services/agencias.service.js';
import { inicializarFormulario } from './services/formulario.service.js';
import { inicializarEnvio } from './services/envio.service.js';

// --- API ---
import { login } from './services/login.js';
import { obtenerAgencias } from '../data/agencias.js';

// ---- Funciones globales (necesarias para onclick en HTML) ----
window.abrirModalAgencias = abrirModalAgencias;
window.cerrarModalBackdropAgencias = cerrarModalBackdropAgencias;

// ---- Inicialización de servicios ----
iniciarMapa();
inicializarAgencias();
inicializarFormulario();
inicializarEnvio();

// ---- Carga de datos del backend (login → agencias) ----
(async () => {
    // Login y agencias se ejecutan de forma independiente:
    // si login falla, las agencias aún intentan cargarse del backend.
    // Si obtenerAgencias también falla, se usan las agencias por defecto (hardcoded).

    try {
        await login();
        console.log('✅ Login exitoso');
    } catch (error) {
        console.warn('⚠️ Error en login, continuando con agencias por defecto:', error);
    }

    try {
        await obtenerAgencias();
        console.log('✅ Agencias cargadas desde el backend');
    } catch (error) {
        console.warn('⚠️ Error al obtener agencias del backend, usando lista por defecto:', error);
    }
})();
