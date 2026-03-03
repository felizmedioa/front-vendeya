// --- Servicio de Agencias (Modal BoxSelect) ---
import { Agencias } from '../../data/agencias.js';

// --- Referencias del DOM ---
let modalBackdropAgencias, boxSelectAgencias, inputBusquedaModal;
let listaAgenciasModal, inputAgenciaProvincia, inputAgenciaValue;

// Agencia seleccionada (objeto completo del API)
let agenciaSeleccionada = null;

/**
 * Retorna el objeto completo de la agencia seleccionada
 */
export function getAgenciaSeleccionada() {
    return agenciaSeleccionada;
}

/**
 * Inicializa el servicio de agencias: captura referencias DOM y asigna listeners
 */
export function inicializarAgencias() {
    modalBackdropAgencias = document.getElementById('modalBackdropAgencias');
    boxSelectAgencias = document.getElementById('boxSelectAgencias');
    inputBusquedaModal = document.getElementById('inputBusquedaModal');
    listaAgenciasModal = document.getElementById('listaAgenciasModal');
    inputAgenciaProvincia = document.getElementById('agencia_provincia');
    inputAgenciaValue = document.getElementById('agencia_value');

    // Filtrado en tiempo real
    inputBusquedaModal.addEventListener('input', () => {
        const texto = inputBusquedaModal.value;
        const agenciasFiltradas = filtrarAgencias(texto, Agencias);
        renderizarAgencias(agenciasFiltradas);
    });
}

/**
 * Formatea el valor de la agencia: "DEPARTAMENTO NOMBRE_AGENCIA"
 */
function formatearValue(agencia) {
    const partes = agencia.split(' / ');
    const departamento = partes[0];
    const nombreAgencia = partes[partes.length - 1];
    return `${departamento} ${nombreAgencia}`;
}

/**
 * Abre el modal de selección de agencias
 */
export function abrirModalAgencias() {
    modalBackdropAgencias.classList.remove('hidden');
    boxSelectAgencias.classList.remove('modal-exit');
    boxSelectAgencias.classList.add('modal-enter');
    inputBusquedaModal.value = '';
    inputBusquedaModal.focus();
    renderizarAgencias(Agencias);
}

/**
 * Cierra el modal con animación
 */
export function cerrarModalAgencias() {
    boxSelectAgencias.classList.remove('modal-enter');
    boxSelectAgencias.classList.add('modal-exit');
    setTimeout(() => {
        modalBackdropAgencias.classList.add('hidden');
    }, 280);
}

/**
 * Cierra el modal si se hizo clic en el backdrop
 */
export function cerrarModalBackdropAgencias(event) {
    if (event.target === modalBackdropAgencias) {
        cerrarModalAgencias();
    }
}

/**
 * Filtra la lista de agencias por texto
 */
function filtrarAgencias(texto, lista) {
    return lista.filter(item => {
        const nombre = item.nombre || item;
        return nombre.toUpperCase().includes(texto.toUpperCase());
    });
}

/**
 * Renderiza la lista de agencias en el modal
 */
function renderizarAgencias(agencias) {
    listaAgenciasModal.innerHTML = '';

    if (agencias.length === 0) {
        const li = document.createElement('li');
        li.className = 'p-4 text-center text-gray-500';
        li.textContent = 'No se encontraron agencias';
        listaAgenciasModal.appendChild(li);
        return;
    }

    agencias.forEach(agencia => {
        const li = document.createElement('li');
        li.className = 'p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100';
        li.innerHTML = `<span class="text-sm text-gray-800 leading-tight block">${agencia.nombre}</span>`;

        li.addEventListener('click', () => seleccionarAgencia(agencia));
        listaAgenciasModal.appendChild(li);
    });
}

/**
 * Selecciona una agencia y actualiza los inputs
 */
function seleccionarAgencia(agencia) {
    const valueFormateado = formatearValue(agencia.nombre);

    // Guardar el objeto completo de la agencia seleccionada
    agenciaSeleccionada = agencia;

    // Actualizar el input visible con el nombre completo
    inputAgenciaProvincia.value = agencia.nombre;

    // Guardar el value formateado en el input oculto
    inputAgenciaValue.value = valueFormateado;

    // Cerrar modal
    cerrarModalAgencias();
}
