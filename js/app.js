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

// ---- Funciones globales (necesarias para onclick en HTML) ----
window.abrirModalAgencias = abrirModalAgencias;
window.cerrarModalBackdropAgencias = cerrarModalBackdropAgencias;

// ---- Inicialización de servicios ----
iniciarMapa();
inicializarAgencias();
inicializarFormulario();
inicializarEnvio();

// ---- Login al backend ----
(async () => {
    try {
        await login();
        console.log('✅ Login exitoso');
    } catch (error) {
        console.warn('⚠️ Error en login:', error);
    }
})();

