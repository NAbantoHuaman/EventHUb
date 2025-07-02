// Sidebar Manager Component - Redesigned
export class SidebarManager {
    constructor() {
        this.isExpanded = false;
        this.isMobile = window.innerWidth <= 1024;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateLayout();
        
        // Listen for window resize
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 1024;
            
            if (wasMobile !== this.isMobile) {
                this.updateLayout();
            }
        });
    }

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

        // Quick action buttons
        this.setupQuickActions();

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isExpanded) {
                this.close();
            }
        });
    }

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

    toggle() {
        if (this.isExpanded) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        const sidebar = document.getElementById('sidebar-dashboard');
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebar) {
            sidebar.classList.add('expanded');
            this.isExpanded = true;

            if (this.isMobile && overlay) {
                overlay.classList.add('show');
            }

            // Trigger content animation
            setTimeout(() => {
                const content = sidebar.querySelector('.sidebar-content');
                if (content) {
                    content.style.opacity = '1';
                    content.style.visibility = 'visible';
                }
            }, 100);
        }
    }

    close() {
        const sidebar = document.getElementById('sidebar-dashboard');
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebar) {
            sidebar.classList.remove('expanded');
            this.isExpanded = false;

            if (overlay) {
                overlay.classList.remove('show');
            }

            // Hide content immediately
            const content = sidebar.querySelector('.sidebar-content');
            if (content) {
                content.style.opacity = '0';
                content.style.visibility = 'hidden';
            }
        }
    }

    updateLayout() {
        const body = document.body;
        
        if (this.isMobile) {
            body.style.paddingLeft = '0';
        } else {
            body.style.paddingLeft = '80px';
        }

        // Close sidebar on mobile if open
        if (this.isMobile && this.isExpanded) {
            this.close();
        }
    }

    updateStats(stats) {
        console.log('📊 SidebarManager: Updating stats:', stats);
        this.updateStatCard('available-events', stats.available || 0);
        this.updateStatCard('registered-events', stats.registered || 0);
        this.updateStatCard('total-events', stats.total || 0);
        this.updateStatCard('categories-count', stats.categories || 0);
    }

    updateStatCard(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

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

    applyQuickFilter(filterType) {
        // Emit custom event for main app to handle
        const event = new CustomEvent('quickFilter', {
            detail: { filterType }
        });
        document.dispatchEvent(event);
        
        // Close sidebar on mobile after action
        if (this.isMobile) {
            this.close();
        }
    }

    showMyEvents() {
        // Switch to registered events tab
        const event = new CustomEvent('switchTab', {
            detail: { tab: 'registered' }
        });
        document.dispatchEvent(event);
        
        // Close sidebar on mobile after action
        if (this.isMobile) {
            this.close();
        }
    }

    showAuthenticatedElements(show) {
        const authElements = document.querySelectorAll('.sidebar-upcoming-events');
        authElements.forEach(element => {
            element.style.display = show ? 'block' : 'none';
        });
    }

    // Animation methods for smooth interactions
    animateStatUpdate(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Add pulse animation
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