// ============================================================
//  Servicio de Envío — Submit del formulario de pedido
//  Envía en paralelo a Google Sheets y al Backend (API)
// ============================================================
import { URL_API, WHATSAPP_NUMBER } from '../config.js';
import { enviarAgencia } from './enviarAgencia.service.js';

// ---- Funciones de envío independientes ----

/**
 * Envía los datos del pedido a Google Apps Script (Sheets)
 */
async function enviarAGoogleSheets(data) {
    await fetch(URL_API, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
    });
}

/**
 * Envía los datos de agencia al Backend (FastAPI)
 */
async function enviarABackend() {
    await enviarAgencia();
}

// ---- Recolección de datos ----

/**
 * Lee todos los campos del formulario y retorna un objeto con los datos
 */
function recolectarDatosFormulario() {
    return {
        nombre_completo: document.getElementById('nombre_completo').value,
        dni: document.getElementById('dni').value,
        whatsapp: document.getElementById('whatsapp').value,
        producto: document.getElementById('producto').value,
        metodo_pago: document.getElementById('metodo_pago').value,
        valor_restante: document.getElementById('valor_restante').value,
        fecha: document.getElementById('fecha').value,
        tipo_envio: document.getElementById('tipo_envio').value,
        distrito: document.getElementById('distrito_lima').value,
        direccion_link: document.getElementById('direccion_link').value,
        lat: document.getElementById('latitud').value,
        lng: document.getElementById('longitud').value,
        agencia: document.getElementById('agencia_provincia').value
    };
}

// ---- UI del botón ----

function deshabilitarBoton(btn) {
    btn.disabled = true;
    btn.innerText = '⏳ Enviando datos...';
    btn.style.opacity = 0.7;
}

// ---- Confirmación WhatsApp ----

function ofrecerWhatsApp(data) {
    if (confirm('✅ ¡Registrado! ¿Deseas enviar la confirmación al WhatsApp?')) {
        const mensaje = `Hola, acabo de registrar mi pedido: ${data.producto} a nombre de ${data.nombre_completo}.`;
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    }
}

// ---- Inicialización ----

/**
 * Registra el listener de submit del formulario.
 * Ambos envíos (Sheets + API) corren en paralelo e independientemente:
 * si uno falla, el otro se completa igual.
 */
export function inicializarEnvio() {
    const form = document.getElementById('pedidoForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        deshabilitarBoton(document.getElementById('btnSubmit'));

        const data = recolectarDatosFormulario();

        // Envíos paralelos e independientes
        const [sheetsResult, apiResult] = await Promise.allSettled([
            enviarAGoogleSheets(data),
            enviarABackend()
        ]);

        // Logs de resultados
        if (sheetsResult.status === 'fulfilled') {
            console.log('✅ Google Sheets OK');
        } else {
            console.error('❌ Error en Google Sheets:', sheetsResult.reason);
        }

        if (apiResult.status === 'fulfilled') {
            console.log('✅ Backend API OK');
        } else {
            console.error('❌ Error en Backend API:', apiResult.reason);
        }

        // Siempre ofrecer WhatsApp, sin importar los resultados
        ofrecerWhatsApp(data);
        form.reset();

        setTimeout(() => window.location.reload(), 2000);
    });
}
