import { URL_BACKEND } from '../../js/config.env.js';

// Ocultar el contenido hasta que se valide el token (evita "parpadeos" de la UI)
document.documentElement.style.visibility = 'hidden';

// Modularizamos las funciones
export function getToken() {
    return localStorage.getItem('token');
}

export function setToken(token) {
    localStorage.setItem('token', token);
}

export function removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('userConfigs');
}

export function isTokenExpiredLocally(token) {
    try {
        const payloadJWT = token.split('.')[1];
        const payload = JSON.parse(atob(payloadJWT));
        const fechaActual = Date.now();
        const fechaExpiracion = payload.exp * 1000;
        return fechaActual >= fechaExpiracion;
    } catch (error) {
        return true; 
    }
}

export async function renewToken(token) {
    try {
        // Enviamos al login endpoint que renueva el token
        const response = await fetch(`${URL_BACKEND}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: token })
        });
        
        if (!response.ok) return null;
        
        const data = await response.json();
        if (data.success && data.token) {
            return data.token;
        }
        return null;
    } catch (error) {
        console.error("Error renovando token con el backend:", error);
        return null;
    }
}

export async function fetchUserConfigs(token) {
    try {
        // Traer configuraciones
        const response = await fetch(`${URL_BACKEND}/user/me?token=${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Error obteniendo configuraciones:", error);
        return null;
    }
}

function showUnauthorizedPage() {
    // Restaurar visibilidad para mostrar el mensaje de error
    document.documentElement.style.visibility = '';
    document.body.innerHTML = `
        <div class="h-screen w-full flex flex-col items-center justify-center bg-gray-50 font-sans text-gray-800">
            <svg class="w-20 h-20 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h1 class="text-4xl font-bold mb-2 text-gray-900">401 No Autorizado</h1>
            <p class="text-gray-500 mb-6 text-center max-w-md">Tu sesión ha expirado o no tienes permisos para ver esta página. Por favor vuelve a iniciar sesión.</p>
            <a href="../login/login.html" class="px-6 py-3 bg-brandPrimary hover:bg-brandPrimaryHover text-white rounded-lg font-medium transition-colors shadow-sm cursor-pointer">
                Ir al Inicio de Sesión
            </a>
        </div>
    `;
}

// Flujo Principal al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    // 0. Manejo del botón Cerrar Sesión (síncrono para evitar clicks antes de que cargue el backend)
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            removeToken();
            window.location.href = '../login/login.html';
        });
    }

    // 1. Obtener y verificar token local
    const currentToken = getToken();

    // Si no hay token o ya expiró localmente, desautorizamos inmediatamente sin red
    if (!currentToken || isTokenExpiredLocally(currentToken)) {
        removeToken();
        showUnauthorizedPage();
        return;
    }

    // 2. Revisar si ya tenemos las configuraciones del usuario cacheadas
    const cachedConfigs = localStorage.getItem('userConfigs');
    if (cachedConfigs) {
        window.userConfigs = JSON.parse(cachedConfigs);
        console.log("Configuraciones cargadas desde caché:", window.userConfigs);
        document.documentElement.style.visibility = ''; // Mostrar UI instantáneamente
        return;
    }

    // 3. Solo si no tenemos configs cacheadas (ej. login reciente), consultamos al backend
    
    // (Opcional) Renovar token antes de pedir configs, tal como estaba antes
    const renewedToken = await renewToken(currentToken);

    if (!renewedToken) {
        removeToken();
        showUnauthorizedPage();
        return;
    }

    // Guardar el nuevo token renovado
    setToken(renewedToken);

    // Traer las configuraciones con "/user/me"
    const userConfigs = await fetchUserConfigs(renewedToken);
    
    if (!userConfigs) {
        removeToken();
        showUnauthorizedPage();
        return;
    }

    // Guardamos las configuraciones localmente para futuras navegaciones
    localStorage.setItem('userConfigs', JSON.stringify(userConfigs));
    window.userConfigs = userConfigs;
    console.log("Configuraciones cargadas desde api:", userConfigs);
    
    document.documentElement.style.visibility = '';
});
