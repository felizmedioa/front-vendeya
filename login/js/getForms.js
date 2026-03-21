import { URL_BACKEND } from "../../js/config.js";

const usuario = document.getElementById('usuario');
const password = document.getElementById('password');
const form = document.getElementById('form');
const errorMessage = document.getElementById('error-message');

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
            return;
        }

        // Éxito
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
    }
});