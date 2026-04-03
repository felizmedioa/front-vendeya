// ============================================================
//  pedidosForms.js — Lógica de toggle de secciones + envío
//  Importa datos reales desde /data/ para cada agencia
// ============================================================

import { Agencias as AgenciasShalom } from '../../data/agencias.js';
import { Agencias as AgenciasOlva } from '../../data/agenciasOlva.js';
import { Agencias as AgenciasMarvisur } from '../../data/agenciasMarvisur.js';
import { Agencias as DistritosDinsides } from '../../data/agenciasDinside.js';
import { URL_BACKEND } from '../../js/config.js';

// ---- Estado global de selección por sección ----
// Guarda el objeto completo seleccionado para poder armar el payload
const seleccion = {
    shalom: null,    // { nombre, direccion, nombre_resumido }
    olva: null,
    marvisur: null,
    dinsides: null,  // { distrito, precio }
};

// ============================================================
//  UTILIDAD — Obtener ID del query param
// ============================================================
function getFormIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || null;
}

// ============================================================
//  INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const agenciaSelect = document.getElementById('agencia_select');
    const form = document.getElementById('pedidoForm');

    // Validar que exista un ID en el query param
    const formId = getFormIdFromURL();
    if (!formId) {
        console.warn('No se encontró el parámetro "id" en la URL.');
    }

    // Todas las secciones condicionales
    const secciones = {
        delivery:      document.getElementById('seccionDelivery'),
        dinsides:      document.getElementById('seccionDinsides'),
        shalom:        document.getElementById('seccionShalom'),
        olva:          document.getElementById('seccionOlva'),
        marvisur:      document.getElementById('seccionMarvisur'),
        retiro_tienda: document.getElementById('seccionRetiro'),
    };

    // ---- Toggle de secciones ----
    agenciaSelect.addEventListener('change', () => {
        const valor = agenciaSelect.value;

        // Ocultar todas
        Object.values(secciones).forEach(sec => sec.classList.add('hidden'));

        // Mostrar la correspondiente
        if (secciones[valor]) {
            secciones[valor].classList.remove('hidden');
        }

        // Si es delivery, invalidar tamaño del mapa (Leaflet bug al estar oculto)
        if (valor === 'delivery' && window._mapaLeaflet) {
            setTimeout(() => window._mapaLeaflet.invalidateSize(), 200);
        }
    });

    // ---- Inicializar cada sección ----
    initDeliveryMap();
    initDistritosDinsides();
    initAgenciasLista('buscarAgenciaShalom', 'listaAgenciasShalom', 'agencia_shalom_value', AgenciasShalom, 'shalom');
    initAgenciasLista('buscarAgenciaOlva', 'listaAgenciasOlva', 'agencia_olva_value', AgenciasOlva, 'olva');
    initAgenciasLista('buscarAgenciaMarvisur', 'listaAgenciasMarvisur', 'agencia_marvisur_value', AgenciasMarvisur, 'marvisur');

    // ---- Envío del formulario ----
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSubmit(formId);
    });
});

// ============================================================
//  ENVÍO DEL FORMULARIO
// ============================================================
async function handleSubmit(formId) {
    const btnSubmit = document.getElementById('btnSubmit');
    const agenciaValue = document.getElementById('agencia_select').value;

    // --- Validaciones generales ---
    if (!formId) {
        return showError('Error: No se encontró el ID del formulario en la URL.');
    }
    if (!agenciaValue) {
        return showError('Debes seleccionar una agencia.');
    }

    const nombre_completo = document.getElementById('nombre_completo').value.trim();
    const dni = document.getElementById('dni').value.trim();
    const telefono = document.getElementById('whatsapp').value.trim();

    if (!nombre_completo || !dni || !telefono) {
        return showError('Completa todos los campos obligatorios (Nombre, DNI, WhatsApp).');
    }

    // --- Determinar agencia, destino y dirección según la selección ---
    let agencia = '';
    let destino = '';
    let direccion = '';

    switch (agenciaValue) {
        case 'shalom': {
            if (!seleccion.shalom) return showError('Selecciona una agencia Shalom.');
            agencia = 'Shalom';
            destino = seleccion.shalom.nombre;
            direccion = seleccion.shalom.direccion;
            break;
        }
        case 'olva': {
            if (!seleccion.olva) return showError('Selecciona una agencia Olva.');
            agencia = 'Olva Courier';
            destino = seleccion.olva.nombre;
            direccion = seleccion.olva.direccion;
            break;
        }
        case 'marvisur': {
            if (!seleccion.marvisur) return showError('Selecciona una agencia Marvisur.');
            agencia = 'Marvisur';
            destino = seleccion.marvisur.nombre;
            direccion = seleccion.marvisur.direccion;
            break;
        }
        case 'dinsides': {
            if (!seleccion.dinsides) return showError('Selecciona un distrito para Dinsides.');
            agencia = 'Dinsides';
            destino = seleccion.dinsides.distrito;
            direccion = `S/ ${seleccion.dinsides.precio.toFixed(1)}`;
            break;
        }
        case 'delivery': {
            const distrito = document.getElementById('distrito_lima').value;
            const lat = document.getElementById('latitud').value;
            const lng = document.getElementById('longitud').value;
            if (!distrito) return showError('Selecciona un distrito para Delivery.');
            if (!lat || !lng) return showError('Marca tu ubicación en el mapa.');
            agencia = 'Delivery';
            destino = distrito;
            direccion = `${lat}, ${lng}`;
            break;
        }
        case 'retiro_tienda': {
            const tiendaInput = document.getElementById('retiro_tienda_input').value.trim();
            if (!tiendaInput) return showError('Escribe el nombre de la tienda para retiro.');
            agencia = 'Retiro en Tienda';
            destino = tiendaInput;
            direccion = tiendaInput;
            break;
        }
        default:
            return showError('Agencia no reconocida.');
    }

    // --- Armar payload ---
    const payload = {
        agencia,
        nombre_completo,
        dni,
        telefono,
        destino,
        direccion,
    };

    // --- Enviar ---
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Enviando...';

    try {
        const response = await fetch(`${URL_BACKEND}/pedidos-forms/${formId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || `Error ${response.status}`);
        }

        const result = await response.json().catch(() => ({}));

        // Éxito
        showSuccess('✅ ¡Pedido registrado exitosamente!');
        document.getElementById('pedidoForm').reset();
        // Limpiar selecciones
        seleccion.shalom = null;
        seleccion.olva = null;
        seleccion.marvisur = null;
        seleccion.dinsides = null;
        // Ocultar secciones condicionales
        ['seccionDelivery', 'seccionDinsides', 'seccionShalom', 'seccionOlva', 'seccionMarvisur', 'seccionRetiro']
            .forEach(id => document.getElementById(id).classList.add('hidden'));
        // Re-renderizar listas para quitar .selected
        document.querySelectorAll('.agencia-item.selected, .distrito-item.selected')
            .forEach(el => el.classList.remove('selected'));

    } catch (err) {
        console.error('Error al enviar pedido:', err);
        showError(`Error al registrar: ${err.message}`);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Registrar Pedido';
    }
}

// ============================================================
//  UI HELPERS — Mensajes de éxito / error
// ============================================================
function showError(msg) {
    removeMessages();
    const div = document.createElement('div');
    div.id = 'form-message';
    div.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 text-sm';
    div.textContent = msg;
    document.getElementById('pedidoForm').appendChild(div);
    div.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => div.remove(), 6000);
}

function showSuccess(msg) {
    removeMessages();
    const div = document.createElement('div');
    div.id = 'form-message';
    div.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4 text-sm font-semibold';
    div.textContent = msg;
    document.getElementById('pedidoForm').appendChild(div);
    div.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function removeMessages() {
    const existing = document.getElementById('form-message');
    if (existing) existing.remove();
}

// ============================================================
//  DELIVERY — Mapa Leaflet
// ============================================================
function initDeliveryMap() {
    const defaultCoords = [-12.046, -77.042];
    const map = L.map('mapa-selector').setView(defaultCoords, 12);
    window._mapaLeaflet = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    const marker = L.marker(defaultCoords, { draggable: true }).addTo(map);

    marker.on('dragend', () => {
        const pos = marker.getLatLng();
        document.getElementById('latitud').value = pos.lat;
        document.getElementById('longitud').value = pos.lng;
    });

    map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        document.getElementById('latitud').value = e.latlng.lat;
        document.getElementById('longitud').value = e.latlng.lng;
    });
}

// ============================================================
//  DINSIDES — Distritos con precio (desde agenciasDinside.js)
//  Estructura: { distrito: string, precio: number }
// ============================================================
function initDistritosDinsides() {
    const contenedor = document.getElementById('listaDistritosDinsides');
    const inputHidden = document.getElementById('distrito_dinsides_value');
    const inputBuscar = document.getElementById('buscarDistritoDinsides');

    function renderDistritos(filtro = '') {
        contenedor.innerHTML = '';
        const filtrados = DistritosDinsides.filter(d =>
            d.distrito.toLowerCase().includes(filtro.toLowerCase())
        );

        if (filtrados.length === 0) {
            contenedor.innerHTML = '<p class="p-4 text-center text-gray-400 text-sm">No se encontraron distritos</p>';
            return;
        }

        filtrados.forEach(d => {
            const div = document.createElement('div');
            div.className = 'distrito-item';
            if (inputHidden.value === d.distrito) div.classList.add('selected');
            div.innerHTML = `
                <span class="text-sm text-gray-800">${d.distrito}</span>
                <span class="distrito-precio">S/ ${d.precio.toFixed(1)}</span>
            `;
            div.addEventListener('click', () => {
                inputHidden.value = d.distrito;
                seleccion.dinsides = d; // Guardar objeto completo para el submit
                renderDistritos(inputBuscar.value);
            });
            contenedor.appendChild(div);
        });
    }

    inputBuscar.addEventListener('input', () => renderDistritos(inputBuscar.value));
    renderDistritos();
}

// ============================================================
//  AGENCIAS (Shalom, Olva, Marvisur) — Lista genérica con buscador
//  Todas comparten la misma estructura: { nombre, direccion, nombre_resumido }
//  El parámetro seleccionKey guarda el objeto completo en `seleccion`
// ============================================================
function initAgenciasLista(inputBuscarId, listaContenedorId, hiddenInputId, data, seleccionKey) {
    const contenedor = document.getElementById(listaContenedorId);
    const inputHidden = document.getElementById(hiddenInputId);
    const inputBuscar = document.getElementById(inputBuscarId);

    function renderAgencias(filtro = '') {
        contenedor.innerHTML = '';
        const textoUpper = filtro.toUpperCase();

        const filtrados = data.filter(a =>
            a.nombre.toUpperCase().includes(textoUpper) ||
            a.direccion.toUpperCase().includes(textoUpper) ||
            (a.nombre_resumido && a.nombre_resumido.toUpperCase().includes(textoUpper))
        );

        if (filtrados.length === 0) {
            contenedor.innerHTML = '<p class="p-4 text-center text-gray-400 text-sm">No se encontraron agencias</p>';
            return;
        }

        filtrados.forEach(a => {
            const div = document.createElement('div');
            div.className = 'agencia-item';
            if (inputHidden.value === a.nombre) div.classList.add('selected');
            div.innerHTML = `
                <span class="text-sm font-semibold text-gray-800 block">${a.nombre_resumido || a.nombre}</span>
                <span class="text-xs text-gray-500 block mt-0.5">${a.nombre}</span>
                <span class="text-xs text-gray-400 block mt-0.5">📍 ${a.direccion}</span>
            `;
            div.addEventListener('click', () => {
                inputHidden.value = a.nombre;
                seleccion[seleccionKey] = a; // Guardar objeto completo para el submit
                renderAgencias(inputBuscar.value);
            });
            contenedor.appendChild(div);
        });
    }

    inputBuscar.addEventListener('input', () => renderAgencias(inputBuscar.value));
    renderAgencias();
}
