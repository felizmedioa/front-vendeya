export function setupFilters(allPedidos, renderPedidosFn, tbody) {
    const searchInput = document.getElementById('filter-search');
    const agencySelect = document.getElementById('filter-agency');
    const statusSelect = document.getElementById('filter-status');
    const dateFrom = document.getElementById('filter-date-from');
    const dateTo = document.getElementById('filter-date-to');

    const applyFilters = () => {
        const searchTerm = (searchInput?.value || '').toLowerCase();
        const agency = (agencySelect?.value || '').toLowerCase();
        const status = (statusSelect?.value || '').toLowerCase();
        const fromDate = dateFrom?.value;
        const toDate = dateTo?.value;

        const filtered = allPedidos.filter(p => {
            const cliente = (p.nombre_completo || '').toLowerCase();
            const dniStr = (p.dni || '').toString().toLowerCase();
            const telefonoStr = (p.telefono || '').toString().toLowerCase();

            // Buscar solo por Nombre, DNI o Teléfono
            const matchSearch = cliente.includes(searchTerm) || 
                                dniStr.includes(searchTerm) || 
                                telefonoStr.includes(searchTerm);
            
            const pAgency = (p.agencia || '').toLowerCase();
            const matchAgency = agency === '' || pAgency.includes(agency);
            
            const pStatus = (p.estado || '').toLowerCase();
            let matchStatus = false;
            if (status === '') matchStatus = true;
            else if (status === 'pedido' && !pStatus.includes('registrado') && !pStatus.includes('enviado')) matchStatus = true;
            else if (status !== 'pedido' && pStatus.includes(status)) matchStatus = true;

            let matchDate = true;
            if (fromDate || toDate) {
                // p.fecha format example: 2026-03-10T15:30:20
                let pDateStr = (p.fecha || '').split('T')[0];
                let pDateParts = pDateStr.split('-');
                if (pDateParts.length === 3) {
                    // Normalize date
                    const pDate = new Date(Date.UTC(pDateParts[0], pDateParts[1] - 1, pDateParts[2]));
                    if (fromDate) {
                        const fParts = fromDate.split('-');
                        const fDate = new Date(Date.UTC(fParts[0], fParts[1] - 1, fParts[2]));
                        if (pDate < fDate) matchDate = false;
                    }
                    if (toDate) {
                        const tParts = toDate.split('-');
                        const tDate = new Date(Date.UTC(tParts[0], tParts[1] - 1, tParts[2]));
                        if (pDate > tDate) matchDate = false;
                    }
                } else {
                    matchDate = false; // Invalid date
                }
            }

            return matchSearch && matchAgency && matchStatus && matchDate;
        });

        renderPedidosFn(filtered, tbody);
    };

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (agencySelect) agencySelect.addEventListener('change', applyFilters);
    if (statusSelect) statusSelect.addEventListener('change', applyFilters);
    if (dateFrom) dateFrom.addEventListener('change', applyFilters);
    if (dateTo) dateTo.addEventListener('change', applyFilters);
}
