document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('open-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    function openSidebar() {
        // Mostrar sidebar
        sidebar.classList.remove('-translate-x-full');
        
        // Mostrar fondo blur
        sidebarOverlay.classList.remove('hidden');
        
        // Pequeño delay para permitir que el display:block se note antes de la transición de opacidad
        setTimeout(() => {
            sidebarOverlay.classList.remove('opacity-0');
            sidebarOverlay.classList.add('opacity-100');
        }, 10);
        
        // Evitar que el fondo (body) haga scroll
        document.body.classList.add('overflow-hidden');
    }

    function closeSidebar() {
        // Ocultar sidebar
        sidebar.classList.add('-translate-x-full');
        
        // Iniciar transición de opacidad del blur a 0
        sidebarOverlay.classList.remove('opacity-100');
        sidebarOverlay.classList.add('opacity-0');
        
        // Esperar a que acabe la animación (300ms) para ocultarlo del DOM
        setTimeout(() => {
            sidebarOverlay.classList.add('hidden');
        }, 300);
        
        // Permitir scroll de nuevo
        document.body.classList.remove('overflow-hidden');
    }

    // Event Listeners
    openSidebarBtn.addEventListener('click', openSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);
    
    // Cerrar menú al tocar el overlay oscuro que está detrás
    sidebarOverlay.addEventListener('click', closeSidebar);
});
