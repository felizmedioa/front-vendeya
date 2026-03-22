import { getToken } from './auth.js';
import { fetchPedidos } from '../../js/services/pedidos.service.js';

document.addEventListener('DOMContentLoaded', async () => {
    const token = getToken();

    // Activar botón de Refresco Manual
    const btnRefresh = document.getElementById('btn-refresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            sessionStorage.removeItem('pedidos_cache');
            window.location.reload();
        });
    }

    // Referencias a los contadores
    const countRecibidos = document.getElementById('count-recibidos');
    const countRegistrados = document.getElementById('count-registrados');
    const countEnviados = document.getElementById('count-enviados');
    const countClientes = document.getElementById('count-clientes');

    const tbody = document.getElementById('recent-orders-tbody');

    if (!token) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Inicia sesión para ver los pedidos recientes.</td></tr>`;
        return;
    }

    try {
        const pedidos = await fetchPedidos(token);

        // Calcular estadísticas
        let recibidos = 0; // "Pedido" (Pendiente)
        let registrados = 0; // "Registrado"
        let enviados = 0; // "Enviado"

        const now = Date.now();
        const treintaDiasMs = 30 * 24 * 60 * 60 * 1000;
        const clientesUnicos30Dias = new Set();

        pedidos.forEach(p => {
            // Conteo de Estados
            const estado = (p.estado || 'Pedido').toLowerCase();
            if (estado.includes('enviado')) {
                enviados++;
            } else if (estado.includes('registrado')) {
                registrados++;
            } else {
                recibidos++;
            }

            // Conteo de Clientes Nuevos Únicos (Últimos 30 días)
            const fechaPedido = new Date(p.timestamp || p.fecha || now).getTime();
            if (now - fechaPedido <= treintaDiasMs) {
                if (p.dni && p.dni.toString().trim() !== '') {
                    clientesUnicos30Dias.add(p.dni.toString().trim());
                } else if (p.telefono && p.telefono.toString().trim() !== '') {
                    // Fallback: usar teléfono si falta el DNI
                    clientesUnicos30Dias.add(p.telefono.toString().trim());
                }
            }
        });

        const clientesReales = clientesUnicos30Dias.size;

        if (countRecibidos) countRecibidos.innerText = recibidos;
        if (countRegistrados) countRegistrados.innerText = registrados;
        if (countEnviados) countEnviados.innerText = enviados;
        if (countClientes) countClientes.innerText = clientesReales;

        // Renderizar los últimos 5 pedidos
        renderUltimosPedidos(pedidos, tbody);

    } catch (error) {
        console.error("Error al obtener pedidos:", error);
        if (countRecibidos) countRecibidos.innerText = '-';
        if (countRegistrados) countRegistrados.innerText = '-';
        if (countEnviados) countEnviados.innerText = '-';
        if (countClientes) countClientes.innerText = '-';
        if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Hubo un error al cargar los últimos pedidos.</td></tr>`;
    }
});

function renderUltimosPedidos(pedidos, tbody) {
    if (!tbody) return;

    if (!pedidos || pedidos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Aún no tienes pedidos registrados.</td></tr>`;
        return;
    }

    tbody.innerHTML = ''; // Limpiar la tabla mockeada

    // Tomar los últimos 4 pedidos (asumiendo que están mezclados o ya ordenados; si el backend devuelve cronológico, tomamos el slice final y revertimos)
    // El backend GS a veces devuelve cronológico antiguo -> nuevo. Revertimos para tener los más recientes primero.
    const ultimos = [...pedidos].reverse().slice(0, 4);

    ultimos.forEach(pedido => {
        const correlativo = (pedido.id_pedido || '').split('-')[1];
        const idPedido = correlativo ? `#PED-${correlativo}` : '#PED-N/A';
        const nombreSuelto = pedido.nombre_completo || 'Desconocido';
        const estadoRaw = pedido.estado || 'Pedido';

        // Formatear Fecha (El backend te da un ISO date)
        const fechaRaw = new Date(pedido.timestamp || pedido.fecha || Date.now());
        const fechaFormat = `${fechaRaw.getDate().toString().padStart(2, '0')}/${(fechaRaw.getMonth() + 1).toString().padStart(2, '0')}/${fechaRaw.getFullYear()}`;

        let agencia_destino = pedido.agencia || '';
        if (pedido.destino && !agencia_destino.includes(pedido.destino)) {
            agencia_destino = `${pedido.destino} - ${agencia_destino}`;
        }
        if (!agencia_destino.trim()) agencia_destino = pedido.direccion || 'Desconocido';

        // Obtener iniciales 
        const partesNombre = nombreSuelto.split(' ').slice(0, 2);
        const iniciales = partesNombre.map(n => n.charAt(0).toUpperCase()).join('').substring(0, 2);
        const nombreCorto = partesNombre.join(' ');

        // Colores de Avatar variados
        const avatarColors = [
            'bg-orange-100 text-brandGray',
            'bg-yellow-50 text-yellow-700',
            'bg-gray-100 text-gray-600',
            'bg-red-50 text-red-700',
            'bg-blue-50 text-blue-700'
        ];
        const avatarColor = avatarColors[nombreSuelto.length % avatarColors.length];

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50/50 transition-colors';

        tr.innerHTML = `
            <td class="px-6 py-4 font-medium text-sidebarBg">${idPedido}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full ${avatarColor} flex justify-center items-center font-bold mr-3 shadow-sm shrink-0">${iniciales}</div>
                    <span class="text-gray-700 font-medium">${nombreCorto}</span>
                </div>
            </td>
            <td class="px-6 py-4 text-gray-600 truncate max-w-[150px]" title="${agencia_destino}">${agencia_destino}</td>
            <td class="px-6 py-4 text-gray-500 whitespace-nowrap">${fechaFormat}</td>
            <td class="px-6 py-4">
                ${getStatusBadge(estadoRaw)}
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function getStatusBadge(status) {
    const s = (status || '').toLowerCase();
    if (s.includes('enviado')) return '<span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold whitespace-nowrap">Enviado</span>';
    if (s.includes('registrado')) return '<span class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold whitespace-nowrap">Registrado</span>';
    return '<span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold whitespace-nowrap">Pendiente</span>';
}
