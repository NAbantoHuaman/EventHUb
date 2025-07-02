// Componente Gestor de Barra Lateral
export class SidebarManager {
    constructor() {
        this.isExpanded = false;
        this.isMobile = window.innerWidth <= 1024;
        this.init();
    }

    // Inicializar la barra lateral y eventos
    init() {
        this.setupEventListeners();
        this.updateLayout();
        
        // Escuchar cambios de tamaño de ventana
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 1024;
            
            if (wasMobile !== this.isMobile) {
                this.updateLayout();
            }
        });
    }

    // Configurar los listeners de eventos
    setupEventListeners() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebarClose = document.getElementById('sidebar-close');
        const sidebarOverlay = document.getElementById('sidebar-overlay');

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggle());
        }

        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => this.close());
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => this.close());
        }

        // Botones de acciones rápidas
        this.setupQuickActions();

        // Navegación por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isExpanded) {
                this.close();
            }
        });
    }

    // Configurar acciones rápidas de la barra lateral
    setupQuickActions() {
        const quickActions = {
            'quick-filter-today': () => this.applyQuickFilter('today'),
            'quick-filter-week': () => this.applyQuickFilter('week'),
            'quick-filter-free': () => this.applyQuickFilter('free'),
            'quick-my-events': () => this.showMyEvents()
        };

        Object.entries(quickActions).forEach(([id, handler]) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', handler);
            }
        });
    }

    // Alternar la barra lateral (abrir/cerrar)
    toggle() {
        if (this.isExpanded) {
            this.close();
        } else {
            this.open();
        }
    }

    // Abrir la barra lateral
    open() {
        const sidebar = document.getElementById('sidebar-dashboard');
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebar) {
            sidebar.classList.add('expanded');
            this.isExpanded = true;

            if (this.isMobile && overlay) {
                overlay.classList.add('show');
            }

            // Animar contenido de la barra lateral
            setTimeout(() => {
                const content = sidebar.querySelector('.sidebar-content');
                if (content) {
                    content.style.opacity = '1';
                    content.style.visibility = 'visible';
                }
            }, 100);
        }
    }

    // Cerrar la barra lateral
    close() {
        const sidebar = document.getElementById('sidebar-dashboard');
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebar) {
            sidebar.classList.remove('expanded');
            this.isExpanded = false;

            if (overlay) {
                overlay.classList.remove('show');
            }

            // Ocultar contenido inmediatamente
            const content = sidebar.querySelector('.sidebar-content');
            if (content) {
                content.style.opacity = '0';
                content.style.visibility = 'hidden';
            }
        }
    }

    // Actualizar el diseño según el tamaño de pantalla
    updateLayout() {
        const body = document.body;
        
        if (this.isMobile) {
            body.style.paddingLeft = '0';
        } else {
            body.style.paddingLeft = '80px';
        }

        // Cerrar barra lateral en móvil si está abierta
        if (this.isMobile && this.isExpanded) {
            this.close();
        }
    }

    // Actualizar las tarjetas de estadísticas
    updateStats(stats) {
        console.log('📊 SidebarManager: Actualizando estadísticas:', stats);
        this.updateStatCard('available-events', stats.available || 0);
        this.updateStatCard('registered-events', stats.registered || 0);
        this.updateStatCard('total-events', stats.total || 0);
        this.updateStatCard('categories-count', stats.categories || 0);
    }

    // Actualizar el valor de una tarjeta de estadística
    updateStatCard(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // Actualizar la lista de próximos eventos del usuario
    updateUpcomingEvents(events, userRegistrations = []) {
        const container = document.getElementById('sidebar-upcoming-events-list');
        if (!container) return;

        const upcomingUserEvents = events
            .filter(event => userRegistrations.includes(event.id))
            .slice(0, 3);

        if (upcomingUserEvents.length === 0) {
            container.innerHTML = `
                <div class="upcoming-event-item">
                    <div class="upcoming-event-name">No tienes eventos próximos</div>
                    <div class="upcoming-event-date">Explora eventos disponibles</div>
                </div>
            `;
            return;
        }

        container.innerHTML = upcomingUserEvents.map(event => `
            <div class="upcoming-event-item">
                <div class="upcoming-event-name">${event.name}</div>
                <div class="upcoming-event-date">${this.formatEventDate(event.date)}</div>
            </div>
        `).join('');
    }

    // Formatear la fecha de un evento para mostrar en la barra lateral
    formatEventDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Mañana';
        if (diffDays <= 7) return `En ${diffDays} días`;
        
        return date.toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric'
        });
    }

    // Aplicar filtro rápido desde la barra lateral
    applyQuickFilter(filterType) {
        // Emitir evento personalizado para que la app principal lo maneje
        const event = new CustomEvent('quickFilter', {
            detail: { filterType }
        });
        document.dispatchEvent(event);
        
        // Cerrar barra lateral en móvil después de la acción
        if (this.isMobile) {
            this.close();
        }
    }

    // Mostrar los eventos registrados del usuario
    showMyEvents() {
        // Cambiar a la pestaña de eventos registrados
        const event = new CustomEvent('switchTab', {
            detail: { tab: 'registered' }
        });
        document.dispatchEvent(event);
        
        // Cerrar barra lateral en móvil después de la acción
        if (this.isMobile) {
            this.close();
        }
    }

    // Mostrar u ocultar elementos autenticados en la barra lateral
    showAuthenticatedElements(show) {
        const authElements = document.querySelectorAll('.sidebar-upcoming-events');
        authElements.forEach(element => {
            element.style.display = show ? 'block' : 'none';
        });
    }

    // Métodos de animación para interacciones suaves
    animateStatUpdate(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Agregar animación de pulso
        element.style.transform = 'scale(1.1)';
        element.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
        }, 100);
        
        setTimeout(() => {
            element.style.transition = '';
        }, 300);
    }

    // Resaltar acción rápida al hacer clic
    highlightQuickAction(actionId) {
        const button = document.getElementById(actionId);
        if (!button) return;

        button.style.background = 'rgba(255, 255, 255, 0.2)';
        button.style.transform = 'translateY(-2px)';
        
        setTimeout(() => {
            button.style.background = '';
            button.style.transform = '';
        }, 200);
    }
}