// JavaScript para el menú hamburguesa
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const body = document.body;
    
    // Crear overlay para cerrar el menú
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    body.appendChild(overlay);
    
    // Variable para controlar el estado del menú
    let menuAbierto = false;
    
    // Función para abrir el menú
    function abrirMenu() {
        hamburgerBtn.classList.add('active');
        dropdownMenu.classList.add('active');
        overlay.classList.add('active');
        menuAbierto = true;
        
        // Prevenir scroll del body cuando el menú está abierto
        body.style.overflow = 'hidden';
    }
    
    // Función para cerrar el menú
    function cerrarMenu() {
        hamburgerBtn.classList.remove('active');
        dropdownMenu.classList.remove('active');
        overlay.classList.remove('active');
        menuAbierto = false;
        
        // Restaurar scroll del body
        body.style.overflow = '';
    }
    
    // Event listener para el botón hamburguesa (click opcional)
    hamburgerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (menuAbierto) {
            cerrarMenu();
        } else {
            abrirMenu();
        }
    });
    
    // Mantener el menú abierto mientras el mouse esté sobre él
    let timeoutId;
    
    hamburgerMenu.addEventListener('mouseenter', function() {
        clearTimeout(timeoutId);
        if (!menuAbierto) {
            abrirMenu();
        }
    });
    
    hamburgerMenu.addEventListener('mouseleave', function() {
        timeoutId = setTimeout(function() {
            if (menuAbierto) {
                cerrarMenu();
            }
        }, 300); // Retraso de 300ms antes de cerrar
    });
    
    // Cerrar menú al hacer clic en el overlay
    overlay.addEventListener('click', function() {
        cerrarMenu();
    });
    
    // Cerrar menú al hacer clic en un enlace
    const menuLinks = document.querySelectorAll('.dropdown-menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Solo cerrar si no es el enlace de cerrar sesión
            if (!this.getAttribute('onclick')) {
                cerrarMenu();
            }
        });
    });
    
    // Cerrar menú con la tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menuAbierto) {
            cerrarMenu();
        }
    });
    
    // Prevenir que el menú se cierre al hacer clic dentro de él
    dropdownMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Cerrar menú al hacer clic fuera de él
    document.addEventListener('click', function(e) {
        if (menuAbierto && !hamburgerMenu.contains(e.target)) {
            cerrarMenu();
        }
    });
    
    // Manejar resize de ventana
    window.addEventListener('resize', function() {
        if (menuAbierto) {
            cerrarMenu();
        }
    });
});

// Función para cerrar sesión (ya referenciada en tu HTML)
function cerrarSesion() {
    // Aquí puedes agregar la lógica para cerrar sesión
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Limpiar localStorage/sessionStorage si los usas
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirigir a la página de login o inicio
        window.location.href = 'index.html';
    }
}

// Función adicional para destacar la página actual en el menú
function destacarPaginaActual() {
    const currentPage = window.location.pathname.split('/').pop();
    const menuLinks = document.querySelectorAll('.dropdown-menu a[href]');
    
    menuLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage) {
            link.style.backgroundColor = '#3498db';
            link.style.color = '#ffffff';
        }
    });
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', destacarPaginaActual);