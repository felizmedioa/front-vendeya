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
    try {
        await login();
        await obtenerAgencias();
        console.log('✅ Login y agencias cargadas correctamente');
    } catch (error) {
        console.error('❌ Error en inicialización:', error);
    }
})();
