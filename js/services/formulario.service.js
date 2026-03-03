// ============================================================
//  Servicio del Formulario — Toggle de secciones Lima/Provincia
// ============================================================
import { centrarEnDistrito, invalidarTamano } from './mapa.service.js';

/**
 * Inicializa los listeners del formulario.
 * - Muestra/oculta las secciones según tipo de envío
 * - Centra el mapa al seleccionar un distrito
 */
export function inicializarFormulario() {
    const tipoEnvio = document.getElementById('tipo_envio');
    const distritoSelect = document.getElementById('distrito_lima');

    const seccionLima = document.getElementById('seccionLima');
    const seccionProvincia = document.getElementById('seccionProvincia');
    const inputDireccion = document.getElementById('direccion_link');
    const inputAgencia = document.getElementById('agencia_provincia');

    tipoEnvio.addEventListener('change', () => {
        const tipo = tipoEnvio.value;

        // Ocultar ambas secciones
        seccionLima.classList.add('hidden');
        seccionProvincia.classList.add('hidden');
        inputDireccion.required = false;
        inputAgencia.required = false;

        // Mostrar la sección correspondiente
        if (tipo === 'Lima') {
            seccionLima.classList.remove('hidden');
            inputDireccion.required = true;
            invalidarTamano();

        } else if (tipo === 'Provincia') {
            seccionProvincia.classList.remove('hidden');
            inputAgencia.required = true;
        }
    });

    distritoSelect.addEventListener('change', () => {
        centrarEnDistrito(distritoSelect.value);
    });
}
