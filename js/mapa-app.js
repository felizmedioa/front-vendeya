// ============================================================
//  Punto de Entrada — Mapa Logístico (mapa.html)
// ============================================================
import { URL_API, DEFAULT_COORDS } from './config.js';

// ---- Mapa ----
const map = L.map('map', { zoomControl: false }).setView(DEFAULT_COORDS, 12);
L.control.zoom({ position: 'topright' }).addTo(map);
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// ---- Sidebar ----
const sidebar = document.getElementById('sidebar');
const iconMenu = document.getElementById('icon-menu');
const iconClose = document.getElementById('icon-close');
let isOpen = true;
let pedidosGlobal = [];

function toggleSidebar() {
    isOpen = !isOpen;
    if (isOpen) {
        sidebar.classList.remove('sidebar-closed');
        iconMenu.classList.add('hidden');
        iconClose.classList.remove('hidden');
    } else {
        sidebar.classList.add('sidebar-closed');
        iconMenu.classList.remove('hidden');
        iconClose.classList.add('hidden');
    }
}

// Inicializar sidebar abierto
toggleSidebar();
toggleSidebar();

// ---- Colores por Zona ----

const COLORES_ZONA = {
    'Cono Norte': 'green',
    'Cono Sur': 'red',
    'Cono Este': 'orange',
    'Callao': 'violet'
};

function obtenerIcono(zona) {
    const color = COLORES_ZONA[zona] || 'blue';
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
}

function obtenerClaseZona(zona) {
    if (zona.includes('Norte')) return 'bg-norte';
    if (zona.includes('Sur')) return 'bg-sur';
    if (zona.includes('Este')) return 'bg-este';
    return 'bg-centro';
}

// ---- Pedidos ----

async function cargarPedidos() {
    const listaDiv = document.getElementById('lista');
    listaDiv.innerHTML = "<p class='p-4 text-center text-gray-400'>Actualizando...</p>";

    // Limpiar marcadores existentes
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    try {
        const res = await fetch(URL_API);
        pedidosGlobal = await res.json();
        renderizarLista(pedidosGlobal);
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
    }
}

// ---- Renderizado ----

function crearPopupHTML(p) {
    return `
    <div class="text-sm font-sans min-w-[220px]">
        <strong class="block text-base mb-1 text-gray-800">${p.nombre}</strong>
        <span class="text-gray-500 block mb-2">Cobrar: S/ ${p.monto}</span>

        <div class="grid grid-cols-2 gap-2 mb-3">
            <a href="https://waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes" target="_blank"
               class="bg-blue-100 text-blue-700 font-bold py-2 rounded text-center hover:bg-blue-200">🚙 Waze</a>
            <a href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank"
               class="bg-gray-100 text-gray-700 font-bold py-2 rounded text-center hover:bg-gray-200">🗺️ Maps</a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}" target="_blank"
               class="bg-gray-100 text-gray-700 font-bold py-2 rounded text-center hover:bg-gray-200 col-span-2">🚗 Navegar</a>
        </div>

        <button onclick="avisarEnCamino('${p.telefono}', ${p.lat}, ${p.lng})"
            class="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 shadow transition mb-2">
            📲 EN CAMINO
        </button>

        <button onclick="confirmarEntrega('${p.nombre}', this)"
            class="w-full bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700 shadow-lg transition">
            ✅ CONFIRMAR ENTREGA
        </button>
    </div>`;
}

function crearItemSidebar(p, zona) {
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
        <div class="flex justify-between items-start mb-1">
            <span class="font-bold text-gray-800 text-sm truncate w-32">${p.nombre}</span>
            <span class="badge ${obtenerClaseZona(zona)}">${zona.replace('Cono ', '')}</span>
        </div>
        <div class="flex justify-between text-xs text-gray-500">
            <span>📱 ${p.telefono}</span>
            <span class="font-bold text-green-700">S/ ${p.monto}</span>
        </div>`;
    return item;
}

function renderizarLista(pedidos) {
    const listaDiv = document.getElementById('lista');
    listaDiv.innerHTML = '';
    document.getElementById('contador').innerText = `${pedidos.length} pendientes`;

    if (pedidos.length === 0) {
        listaDiv.innerHTML = "<div class='p-10 text-center text-gray-500'>✅ Todo al día<br>No hay pendientes para hoy.</div>";
        return;
    }

    pedidos.forEach(p => {
        const zona = p.zona || 'Lima Centro';
        const marker = L.marker([p.lat, p.lng], { icon: obtenerIcono(zona) }).addTo(map);

        marker.bindPopup(crearPopupHTML(p));

        const item = crearItemSidebar(p, zona);
        item.onclick = () => {
            map.setView([p.lat, p.lng], 16);
            marker.openPopup();
        };
        listaDiv.appendChild(item);
    });
}

// ---- Búsqueda ----

function filtrarLista() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    const filtrados = pedidosGlobal.filter(p =>
        (p.telefono && p.telefono.toString().includes(texto)) ||
        p.nombre.toLowerCase().includes(texto)
    );
    renderizarLista(filtrados);
}

// ---- Acciones ----

async function confirmarEntrega(nombre, btnElement) {
    if (!confirm(`¿Entregado a ${nombre}?`)) return;

    const originalText = btnElement.innerHTML;
    btnElement.innerHTML = '⏳ ...';
    btnElement.disabled = true;

    try {
        await fetch(URL_API, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ accion: 'ENTREGAR', nombre })
        });
        btnElement.innerHTML = '✨ ¡Listo!';
        setTimeout(() => { map.closePopup(); cargarPedidos(); }, 1500);
    } catch (error) {
        alert('Error de conexión');
        btnElement.innerHTML = originalText;
        btnElement.disabled = false;
    }
}

function avisarEnCamino(telefono, lat, lng) {
    const mensaje = `Hola 👋 tu repartidor de Spitech.
Ya esta en camino 🚴‍♂️

Puedes ver su ruta y el tiempo estimado aquí:
https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    const numero = telefono.toString().startsWith('51') ? telefono : '51' + telefono;
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank');
}

// ---- Exponer funciones al scope global (onclick en HTML) ----
window.toggleSidebar = toggleSidebar;
window.cargarPedidos = cargarPedidos;
window.filtrarLista = filtrarLista;
window.confirmarEntrega = confirmarEntrega;
window.avisarEnCamino = avisarEnCamino;

// ---- Iniciar ----
cargarPedidos();
