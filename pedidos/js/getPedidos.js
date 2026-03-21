import { URL_BACKEND } from '../../js/config.env.js';
import { getToken } from '../../dashboard/js/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('pedidos-tbody');
    const token = getToken();

    if (!token) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">Inicia sesión para ver tus pedidos.</td></tr>`;
        return;
    }

    try {
        const response = await fetch(`${URL_BACKEND}/pedidos-forms/list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: token })
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status}`);
        }

        const pedidos = await response.json();
        renderPedidos(pedidos, tbody);

    } catch (error) {
        console.error("Error al obtener pedidos:", error);
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-red-500">Hubo un error al cargar los pedidos.</td></tr>`;
    }
});

function renderPedidos(pedidos, tbody) {
    if (!pedidos || pedidos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">No tienes pedidos registrados.</td></tr>`;
        return;
    }

    tbody.innerHTML = ''; // Limpiar el esqueleto animado

    pedidos.forEach(pedido => {
        // Datos del Sheet: ID-Usuario, Agencia, Nombre-Completo, DNI, Telefono, Destino, Direccion, ID-Pedido, Estado, Fecha, Timestamp

        const correlativo = pedido.id_pedido.split('-')[1];
        const fecha_pedido = pedido.fecha.split('T')[0];

        const idPedido = correlativo || 'N/A';
        const nombreSuelto = pedido.nombre_completo || 'Desconocido';
        const estado = pedido.estado || 'Pedido';
        const fecha = fecha_pedido || 'N/A';
        const agencia = pedido.agencia || 'Desconocido';
        const destino = pedido.destino || pedido.direccion || 'N/A';

        // Obtener iniciales (ej: Luis Garcia -> LG)
        const partesNombre = nombreSuelto.split(' ').slice(0, 2);
        const iniciales = partesNombre.map(n => n.charAt(0).toUpperCase()).join('').substring(0, 2);
        const nombreCorto = partesNombre.join(' ');

        // Colores de Avatar variados (pseudo-aleatorio según longitud del nombre)
        const avatarColors = [
            'bg-orange-100 text-brandGray',
            'bg-mainBgTop text-brandPrimary',
            'bg-gray-100 text-gray-600',
            'bg-red-50 text-brandGray',
            'bg-blue-50 text-blue-700'
        ];
        const avatarColor = avatarColors[nombreSuelto.length % avatarColors.length];

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50/50 transition-colors';

        const telefonoLimpio = (pedido.telefono || '').toString().replace(/\D/g, '');
        let waHtml = '<span class="text-gray-400 text-xs italic">Sin tel.</span>';
        if (telefonoLimpio) {
            const numeroWa = telefonoLimpio.length === 9 ? `51${telefonoLimpio}` : telefonoLimpio;
            const mensaje = encodeURIComponent(`¡Hola ${nombreCorto}! Somos de VendeYa, nos comunicamos sobre tu pedido ${idPedido}...`);
            waHtml = `<a href="https://wa.me/${numeroWa}?text=${mensaje}" target="_blank" class="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-full text-xs font-medium transition-colors border border-green-200" title="Chatear por WhatsApp">
                <svg class="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                ${telefonoLimpio}
            </a>`;
        }

        tr.innerHTML = `
            <td class="px-6 py-4 font-medium text-sidebarBg">${idPedido}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full ${avatarColor} flex justify-center items-center font-bold mr-3 shadow-sm shrink-0">${iniciales}</div>
                    <span class="text-gray-700 font-medium">${nombreCorto}</span>
                </div>
            </td>
            <td class="px-6 py-4 text-gray-500 whitespace-nowrap">${fecha}</td>
            <td class="px-6 py-4 text-gray-600 whitespace-nowrap">
                ${getAgencyBadge(agencia)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${waHtml}
            </td>
            <td class="px-6 py-4 text-gray-500 truncate max-w-[200px]" title="${destino}">${destino}</td>
            <td class="px-6 py-4 text-center whitespace-nowrap">
                ${getStatusBadge(estado)}
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function getAgencyBadge(agencyName) {
    const name = agencyName.toLowerCase();
    if (name.includes('shalom')) return '<span class="px-2.5 py-1 bg-red-600 text-white rounded-md text-xs font-semibold shadow-sm">Shalom</span>';
    if (name.includes('olva')) return '<span class="px-2.5 py-1 bg-[#FBBF24] text-yellow-900 rounded-md text-xs font-semibold shadow-sm">Olva Courier</span>';
    if (name.includes('dinsides')) return '<span class="px-2.5 py-1 bg-black text-white rounded-md text-xs font-semibold shadow-sm">Dinsides</span>';
    if (name.includes('marvisur')) return '<span class="px-2.5 py-1 bg-white border border-brandGray text-brandGray rounded-md text-xs font-semibold shadow-sm">Marvisur</span>';
    if (name.includes('delivery')) return '<span class="px-2.5 py-1 bg-teal-100 text-teal-800 rounded-md text-xs font-semibold shadow-sm">Delivery Express</span>';
    if (name.includes('retiro') || name.includes('tienda')) return '<span class="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-semibold shadow-sm">Retiro Tienda</span>';
    return `<span class="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold shadow-sm">${agencyName}</span>`;
}

function getStatusBadge(status) {
    const s = (status || '').toLowerCase();
    if (s.includes('enviado')) return '<span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Enviado</span>';
    if (s.includes('registrado')) return '<span class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Registrado</span>';
    return '<span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">Pedido</span>';
}
