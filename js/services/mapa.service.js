// --- Servicio del Mapa (Leaflet) ---
import { DEFAULT_COORDS } from '../config.js';
import { centrosDistritos } from '../../data/distritos.js';

let map, marker;

/**
 * Inicializa el mapa Leaflet en el contenedor #mapa-selector
 */
export function iniciarMapa() {
    map = L.map('mapa-selector').setView(DEFAULT_COORDS, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    marker = L.marker(DEFAULT_COORDS, { draggable: true }).addTo(map);

    // Inicializar los inputs apenas carga el mapa
    actualizarInputs(marker.getLatLng());

    marker.on('dragend', function (e) { actualizarInputs(marker.getLatLng()); });
    map.on('click', function (e) {
        marker.setLatLng(e.latlng);
        actualizarInputs(e.latlng);
    });
}

/**
 * Actualiza los inputs ocultos de latitud y longitud
 */
export function actualizarInputs(latlng) {
    document.getElementById('latitud').value = latlng.lat.toFixed(6);
    document.getElementById('longitud').value = latlng.lng.toFixed(6);
}

/**
 * Centra el mapa en un distrito específico
 */
export function centrarEnDistrito(nombreDistrito) {
    if (centrosDistritos[nombreDistrito]) {
        const coords = centrosDistritos[nombreDistrito];
        map.setView(coords, 15);
        marker.setLatLng(coords);
        actualizarInputs({ lat: coords[0], lng: coords[1] });
    }
}

/**
 * Invalida el tamaño del mapa (necesario al mostrar/ocultar contenedores)
 */
export function invalidarTamano() {
    if (map) {
        setTimeout(() => { map.invalidateSize(); }, 200);
    }
}
