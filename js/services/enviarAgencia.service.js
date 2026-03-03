// ============================================================
//  Servicio de Envío de Agencia — POST a /procesar-envio
// ============================================================
import { URL_BACKEND } from '../config.js';
import { getAgenciaSeleccionada } from './agencias.service.js';

/**
 * Limpia el prefijo internacional del teléfono.
 * Ejemplo: "+51987654321" → "987654321"
 *
 * @param {string} telefono — Número con posible prefijo
 * @returns {string} Número local sin prefijo (9 dígitos para Perú)
 */
function limpiarTelefono(telefono) {
    let limpio = telefono.trim().replace(/\s+/g, '');

    if (limpio.startsWith('+')) {
        limpio = limpio.substring(1);
    }

    if (limpio.startsWith('51') && limpio.length > 9) {
        limpio = limpio.substring(2);
    }

    return limpio;
}

/**
 * Envía los datos de la agencia seleccionada al backend.
 * Lee DNI y teléfono directamente del formulario.
 *
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function enviarAgencia() {
    const agencia = getAgenciaSeleccionada();

    if (!agencia) {
        console.warn('⚠️ No se ha seleccionado una agencia, se omite el envío.');
        return;
    }

    const dni = document.getElementById('dni').value;
    const telefono = limpiarTelefono(document.getElementById('whatsapp').value);

    console.log('📤 Enviando a API:', { dni, telefono, destino: agencia.nombre_resumido });

    const response = await fetch(`${URL_BACKEND}/procesar-envio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            dni: String(dni),
            telefono: String(telefono),
            destino: String(agencia.nombre_resumido)
        })
    });

    if (!response.ok) {
        throw new Error(`Error HTTP ${response.status} al enviar agencia`);
    }

    return await response.json();
}