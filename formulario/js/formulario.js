import { getToken } from '../../dashboard/js/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    // auth.js ya ejecuta automáticamente el flujo de seguridad (verificar JWT, renovar token, etc.)
    // Si el usuario no tiene token o está expirado, auth.js mostrará "401 No Autorizado".

    const token = getToken();
    if (!token) {
        console.warn("Sesión bloqueada en Formulario.");
        return;
    }

    console.log("Módulo de Formulario validado e inicializado.");

    // URL base del formulario público (pedidosForms en Vercel)
    const BASE_FORM_URL = "https://pedido-repartos-lima-provincia.vercel.app/pedidosForms/pedidosForms.html";

    /**
     * Genera el link completo del formulario con el userId como query param
     */
    const buildFormLink = (userId) => {
        const url = new URL(BASE_FORM_URL);
        url.searchParams.set('id', userId);
        return url.toString();
    };

    /**
     * Carga el link del formulario en la UI usando el ID del usuario
     */
    const loadFormLink = () => {
        const configsResponse = window.userConfigs;
        if (!configsResponse || !configsResponse.config || !configsResponse.config.id) {
            console.warn("No se encontró el ID del usuario en userConfigs.");
            return;
        }

        const userId = configsResponse.config.id;
        const formLink = buildFormLink(userId);

        const linkInput = document.getElementById('formulario-link');
        if (linkInput) {
            linkInput.value = formLink;
        }

        console.log("Link del formulario generado:", formLink);
    };

    // Botón para copiar el link al portapapeles
    const btnCopy = document.getElementById('btn-copy-link');
    if (btnCopy) {
        btnCopy.addEventListener('click', async () => {
            const linkInput = document.getElementById('formulario-link');
            if (!linkInput || linkInput.value === 'Cargando...') return;

            try {
                await navigator.clipboard.writeText(linkInput.value);

                // Feedback visual
                const originalHTML = btnCopy.innerHTML;
                btnCopy.innerHTML = `
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    ¡Copiado!
                `;
                btnCopy.classList.remove('bg-brandGray', 'hover:bg-brandGrayOutline');
                btnCopy.classList.add('bg-green-600', 'hover:bg-green-700');

                setTimeout(() => {
                    btnCopy.innerHTML = originalHTML;
                    btnCopy.classList.remove('bg-green-600', 'hover:bg-green-700');
                    btnCopy.classList.add('bg-brandGray', 'hover:bg-brandGrayOutline');
                }, 2000);
            } catch (err) {
                // Fallback para navegadores que no soporten clipboard API
                linkInput.select();
                document.execCommand('copy');
                alert('Link copiado al portapapeles');
            }
        });
    }

    // auth.js se ejecuta asíncronamente en su propio DOMContentLoaded.
    // Para asegurar que window.userConfigs esté listo, hacemos un pequeño polling temporal.
    if (window.userConfigs) {
        loadFormLink();
    } else {
        const checkInterval = setInterval(() => {
            if (window.userConfigs) {
                clearInterval(checkInterval);
                loadFormLink();
            }
        }, 50);

        // Evitar bucle sin fin si auth falla
        setTimeout(() => clearInterval(checkInterval), 10000);
    }
});
