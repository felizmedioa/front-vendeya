import { getToken } from '../../dashboard/js/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    // La importación local de auth.js arriba arranca y ejecuta automáticamente el flujo de seguridad.
    // Si el usuario no tiene token o está expirado, auth.js mostrará la pantalla "401 No Autorizado".
    
    const token = getToken();
    if (!token) {
        // Bloqueo preventivo visual si el token es nulo localmente
        console.warn("Sesión bloqueada en Configuraciones.");
        return; 
    }

    console.log("Módulo de Configuraciones validado e inicializado.");

    // Lógica para botón de Refresh Manual de configuraciones
    const btnRefresh = document.getElementById('btn-refresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            // Borramos el caché local para forzar que auth.js consulte de nuevo /user/me
            localStorage.removeItem('userConfigs');
            window.location.reload();
        });
    }

    // --- CARGAR CONFIGURACIONES EN LA UI ---
    const loadConfigsIntoUI = () => {
        const configsResponse = window.userConfigs;
        if (!configsResponse || !configsResponse.config) return;
        
        const config = configsResponse.config;
        
        // Rellenar Perfil
        const inputNombre = document.getElementById('input-nombre-empresa');
        const inputTelefono = document.getElementById('input-telefono');
        if (inputNombre) inputNombre.value = config.nombre_empresa || '';
        if (inputTelefono) inputTelefono.value = config.telefono || '';
        
        // Rellenar Agencias (Los toggles de checkbox reflejan booleanos verdaderos devueltos por la API)
        const toggleShalom = document.getElementById('toggle-shalom');
        const toggleOlva = document.getElementById('toggle-olva');
        const toggleMarvisur = document.getElementById('toggle-marvisur');
        const toggleDinsides = document.getElementById('toggle-dinsides');
        const toggleDelivery = document.getElementById('toggle-delivery');
        const toggleRetiro = document.getElementById('toggle-retiro-tienda');
        
        if (toggleShalom) toggleShalom.checked = config.shalom === true;
        if (toggleOlva) toggleOlva.checked = config.olva === true;
        if (toggleMarvisur) toggleMarvisur.checked = config.marvisur === true;
        if (toggleDinsides) toggleDinsides.checked = config.dinsides === true;
        if (toggleDelivery) toggleDelivery.checked = config.delivery === true;
        if (toggleRetiro) toggleRetiro.checked = config.retiro_tienda === true;
        
        console.log("Configuraciones aplicadas en la UI.");
    };

    // --- GUARDAR CONFIGURACIONES EN EL BACKEND ---
    const btnSaveConfigs = document.getElementById('btn-save-configs');
    if (btnSaveConfigs) {
        btnSaveConfigs.addEventListener('click', async () => {
            const token = getToken();
            if (!token) {
                alert("La sesión expiró.");
                window.location.reload();
                return;
            }

            // Recopilar datos de la UI
            const updatePayload = {
                nombre_empresa: document.getElementById('input-nombre-empresa')?.value || '',
                telefono: document.getElementById('input-telefono')?.value || '',
                shalom: document.getElementById('toggle-shalom')?.checked || false,
                olva: document.getElementById('toggle-olva')?.checked || false,
                marvisur: document.getElementById('toggle-marvisur')?.checked || false,
                dinsides: document.getElementById('toggle-dinsides')?.checked || false,
                delivery: document.getElementById('toggle-delivery')?.checked || false,
                retiro_tienda: document.getElementById('toggle-retiro-tienda')?.checked || false
            };

            const originalText = btnSaveConfigs.innerHTML;
            btnSaveConfigs.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Guardando...`;
            btnSaveConfigs.disabled = true;

            try {
                // Endpoint definido en API Shalom: PUT /user/me
                const response = await fetch(`${window.URL_BACKEND || 'http://localhost:8000'}/user/me?token=${token}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatePayload)
                });
                
                const responseData = await response.json();
                
                if (!response.ok) throw new Error(responseData.detail || "Error al actualizar configuraciones");
                
                // Éxito: borrar caché local para forzar actualización de la UI
                localStorage.removeItem('userConfigs');
                
                btnSaveConfigs.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Guardado`;
                setTimeout(() => window.location.reload(), 800);
            } catch (error) {
                console.error(error);
                alert("Ocurrió un error al guardar: " + error.message);
                btnSaveConfigs.innerHTML = originalText;
                btnSaveConfigs.disabled = false;
            }
        });
    }

    // auth.js se ejecuta asíncronamente en su propio DOMContentLoaded. 
    // Para asegurar que window.userConfigs esté listo, hacemos un pequeño polling temporal.
    if (window.userConfigs) {
        loadConfigsIntoUI();
    } else {
        const checkInterval = setInterval(() => {
            if (window.userConfigs) {
                clearInterval(checkInterval);
                loadConfigsIntoUI();
            }
        }, 50);
        
        // Evitar blucle sin fin si auth falla
        setTimeout(() => clearInterval(checkInterval), 10000); 
    }
});
