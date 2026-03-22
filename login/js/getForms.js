import { URL_BACKEND } from "../../js/config.js";

const usuario = document.getElementById('usuario');
const password = document.getElementById('password');
const form = document.getElementById('form');
const errorMessage = document.getElementById('error-message');
const btnSubmit = form.querySelector('button[type="submit"]');

// Mover el foco al password cuando se presiona Enter en usuario
usuario.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Evitar enviar el formulario prematuramente
        password.focus();
    }
});

function guardarToken(token) {
    localStorage.removeItem('userConfigs');
    localStorage.setItem('token', token);
}

function redirigir() {
    window.location.href = "../dashboard/dashboard.html";
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = usuario.value;
    const pass = password.value;

    // Ocultar mensaje previo
    if (errorMessage) {
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';
    }

    // Visualizar que está cargando
    const originalBtnContent = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.classList.add('opacity-70', 'cursor-not-allowed');
    btnSubmit.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Cargando...`;

    try {
        const response = await fetch(URL_BACKEND + '/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: user,
                password: pass
            })
        });

        if (!response.ok) {
            throw new Error('Error interno del servidor.');
        }

        const data = await response.json();

        if (!data.success) {
            if (errorMessage) {
                errorMessage.textContent = data.message;
                errorMessage.classList.remove('hidden');
            } else {
                alert(data.message);
            }
            
            // Restaurar botón
            btnSubmit.disabled = false;
            btnSubmit.classList.remove('opacity-70', 'cursor-not-allowed');
            btnSubmit.innerHTML = originalBtnContent;
            return;
        }

        // Éxito
        btnSubmit.innerHTML = `<svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Entrando...`;
        guardarToken(data.token);
        redirigir();

    } catch (error) {
        console.error('Error:', error);
        if (errorMessage) {
            errorMessage.textContent = "Error del servidor al intentar conectar.";
            errorMessage.classList.remove('hidden');
        } else {
            alert("Error del servidor al intentar conectar.");
        }
        
        // Restaurar botón
        btnSubmit.disabled = false;
        btnSubmit.classList.remove('opacity-70', 'cursor-not-allowed');
        btnSubmit.innerHTML = originalBtnContent;
    }
});