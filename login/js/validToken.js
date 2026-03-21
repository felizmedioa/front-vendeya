function verificarToken() {
    let token = localStorage.getItem('token');
    if (!token) {
        return false;
    }

    try {
        const payloadJWT = token.split('.')[1];
        const payload = JSON.parse(atob(payloadJWT));

        const fechaActual = Date.now();
        const fechaExpiracion = payload.exp * 1000;

        if (fechaActual >= fechaExpiracion) {
            localStorage.removeItem('token');
            return false;
        }

        return true;

    } catch (error) {
        console.error('Error al verificar el token:', error);
        return false;
    }

}

document.addEventListener('DOMContentLoaded', () => {
    if (verificarToken()) {
        window.location.href = "../dashboard/dashboard.html";
    }
});
