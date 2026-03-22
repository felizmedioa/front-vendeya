import { URL_BACKEND } from '../../js/config.env.js';
import { getToken } from '../../dashboard/js/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const btnUpdatePassword = document.getElementById('btn-update-password');
    const inputCurrentPassword = document.getElementById('input-current-password');
    const inputNewPassword = document.getElementById('input-new-password');
    const inputConfirmPassword = document.getElementById('input-confirm-password');

    if (!btnUpdatePassword || !inputCurrentPassword || !inputNewPassword || !inputConfirmPassword) {
        return; // Elementos no encontrados
    }

    btnUpdatePassword.addEventListener('click', async () => {
        const token = getToken();
        if (!token) {
            alert("Su sesión ha expirado. Por favor, inicie sesión nuevamente.");
            window.location.reload();
            return;
        }

        const currentPassword = inputCurrentPassword.value.trim();
        const newPassword = inputNewPassword.value.trim();
        const confirmPassword = inputConfirmPassword.value.trim();

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Por favor, complete todos los campos de contraseña.");
            return;
        }

        if (newPassword.length < 8) {
            alert("La nueva contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Las nuevas contraseñas no coinciden. Verifique e intente de nuevo.");
            return;
        }

        if (newPassword === currentPassword) {
            alert("La nueva contraseña no puede ser igual a la anterior.");
            return;
        }

        // Estado de carga visual
        const originalText = btnUpdatePassword.innerHTML;
        btnUpdatePassword.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Actualizando...`;
        btnUpdatePassword.disabled = true;

        try {
            const response = await fetch(`${URL_BACKEND}/auth/password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: token,
                    old_password: currentPassword,
                    new_password: newPassword
                })
            });

            if (!response.ok) {
                throw new Error("Error en la conexión con el servidor");
            }

            const data = await response.json();

            if (data.status === "success") {
                alert("¡Contraseña actualizada exitosamente!");
                // Limpiar campos
                inputCurrentPassword.value = "";
                inputNewPassword.value = "";
                inputConfirmPassword.value = "";
            } else {
                // Mostrar alerta de error basada en la respuesta ("contraseña actual incorrecta", etc)
                alert(data.message || "Error al actualizar la contraseña");
            }
        } catch (error) {
            console.error(error);
            alert("Ocurrió un error al procesar la solicitud. Inténtelo más tarde.");
        } finally {
            // Restaurar estado del botón
            btnUpdatePassword.innerHTML = originalText;
            btnUpdatePassword.disabled = false;
        }
    });
});
