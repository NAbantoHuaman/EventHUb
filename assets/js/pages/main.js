// Main Application Entry Point - CORRECCIÓN CRÍTICA del flujo de carga
import { AuthManager } from '../components/AuthManager.js';
import { EventManager } from '../components/EventManager.js';
import { UIManager } from '../components/UIManager.js';
import { SidebarManager } from '../components/SidebarManager.js';
import { ModalManager } from '../components/ModalManager.js';
import { NotificationManager } from '../components/NotificationManager.js';
import { RegistrationManager } from '../utils/RegistrationManager.js';
import { debounce } from '../utils/helpers.js';

class MainApp {
    constructor() {
        this.authManager = new AuthManager();
        this.eventManager = new EventManager();
        this.uiManager = new UIManager();
        this.sidebarManager = new SidebarManager();
        this.modalManager = new ModalManager();
        this.notificationManager = new NotificationManager();
        this.registrationManager = new RegistrationManager();
        
        this.currentTab = 'all';
        this.userRegistrations = [];
        this.isDataLoaded = false;
        
        this.init();
    }

    async init() {
        console.log('🚀 MainApp: Initializing...');
        
        // ✅ CRÍTICO: Orden correcto de inicialización
        await this.waitForAuthManager();
        this.setupEventListeners();
        await this.loadInitialData();
        this.updateAuthUI();
        this.renderEvents();
        
        this.isDataLoaded = true;
        console.log('✅ MainApp: Initialized successfully');
        console.log('📊 MainApp: Final user registrations:', this.userRegistrations);
    }

    // ✅ CRÍTICO: Esperar a que AuthManager esté completamente listo
    async waitForAuthManager() {
        return new Promise((resolve) => {
            // Dar tiempo al AuthManager para procesar la sesión completamente
            setTimeout(() => {
                console.log('✅ MainApp: AuthManager ready');
                resolve();
            }, 100);
        });
    }

    setupEventListeners() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Search and filters with debounce
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        const locationFilter = document.getElementById('location-filter');
        const dateFilter = document.getElementById('date-filter');
        const clearFiltersBtn = document.getElementById('clear-filters');

        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => this.applyFilters(), 300));
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.applyFilters());
        }

        if (locationFilter) {
            locationFilter.addEventListener('change', () => this.applyFilters());
        }

        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.applyFilters());
        }

        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        // User menu
        this.setupUserMenu();

        // Modal events
        this.setupModalEvents();

        // Custom events
        this.setupCustomEvents();

        // Show all events button
        const showAllEventsBtn = document.getElementById('show-all-events');
        if (showAllEventsBtn) {
            showAllEventsBtn.addEventListener('click', () => {
                this.clearFilters();
                this.switchTab('all');
            });
        }
    }

    setupUserMenu() {
        const userMenuTrigger = document.getElementById('user-menu-trigger');
        const userMenuDropdown = document.getElementById('user-menu-dropdown');
        const logoutBtn = document.getElementById('logout-btn');

        if (userMenuTrigger && userMenuDropdown) {
            userMenuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenuDropdown.classList.toggle('show');
            });

            document.addEventListener('click', () => {
                userMenuDropdown.classList.remove('show');
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    setupModalEvents() {
        // Close modal buttons
        const closeButtons = document.querySelectorAll('#close-modal, #modal-close-btn');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.modalManager.closeActiveModal());
        });

        // Modal overlay click
        const modal = document.getElementById('event-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.modalManager.closeActiveModal();
                }
            });
        }

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.modalManager.closeActiveModal();
            }
        });
    }

    setupCustomEvents() {
        // Quick filter events
        document.addEventListener('quickFilter', (e) => {
            this.handleQuickFilter(e.detail.filterType);
        });

        // Switch tab events
        document.addEventListener('switchTab', (e) => {
            this.switchTab(e.detail.tab);
        });

        // Registration events
        document.addEventListener('registerForEvent', (e) => {
            this.registerForEvent(e.detail.eventId);
        });

        document.addEventListener('unregisterFromEvent', (e) => {
            this.unregisterFromEvent(e.detail.eventId);
        });
    }

    // ✅ CRÍTICO: Carga de datos con orden correcto y verificación
    async loadInitialData() {
        console.log('🔄 MainApp: Loading initial data...');
        
        // ✅ CRÍTICO: Primero cargar registraciones del usuario
        await this.loadUserRegistrations();
        
        // Luego cargar opciones de filtros
        const categories = this.eventManager.getCategories();
        const locations = this.eventManager.getLocations();
        this.uiManager.updateFilterOptions(categories, locations);

        // Finalmente actualizar estadísticas
        this.updateStats();
        
        console.log('✅ MainApp: Initial data loaded successfully');
        console.log('📊 MainApp: Total events available:', this.eventManager.getAllEvents().length);
        console.log('📊 MainApp: User registrations loaded:', this.userRegistrations.length);
        console.log('📊 MainApp: Registration IDs:', this.userRegistrations);
    }

    // ✅ CRÍTICO: Método dedicado para cargar registraciones con verificación completa
    async loadUserRegistrations() {
        console.log('🔄 MainApp: Loading user registrations...');
        
        const user = this.authManager.getCurrentUser();
        if (user) {
            console.log('✅ MainApp: User found:', user.getFullName());
            
            // ✅ CRÍTICO: Obtener registraciones directamente del RegistrationManager
            this.userRegistrations = this.registrationManager.getUserRegistrations(user.id);
            console.log('📊 MainApp: Direct registrations from RegistrationManager:', this.userRegistrations.length);
            
            // ✅ CRÍTICO: Verificar que cada registro corresponde a un evento existente
            const allEvents = this.eventManager.getAllEvents();
            const validRegistrations = [];
            
            this.userRegistrations.forEach(regId => {
                const eventExists = allEvents.some(event => event.id === regId);
                if (eventExists) {
                    validRegistrations.push(regId);
                    console.log(`✅ MainApp: Valid registration for event: ${regId}`);
                } else {
                    console.warn(`⚠️ MainApp: Invalid registration for non-existent event: ${regId}`);
                }
            });
            
            this.userRegistrations = validRegistrations;
            console.log('✅ MainApp: Final valid registrations:', this.userRegistrations.length);
            
        } else {
            console.log('ℹ️ MainApp: No authenticated user');
            this.userRegistrations = [];
        }
        
        // ✅ CRÍTICO: Verificación final
        console.log('🔍 MainApp: Final user registrations verification:');
        this.userRegistrations.forEach((regId, index) => {
            console.log(`📊 Registration ${index + 1}: ${regId}`);
        });
    }

    updateAuthUI() {
        const user = this.authManager.getCurrentUser();
        const isAuthenticated = this.authManager.isAuthenticated();
        
        console.log('🔄 MainApp: Updating auth UI, authenticated:', isAuthenticated);
        console.log('📊 MainApp: User registrations for UI:', this.userRegistrations.length);

        // Toggle auth elements
        document.body.classList.toggle('authenticated', isAuthenticated);

        if (isAuthenticated && user) {
            // Update user info
            this.updateElement('user-name-header', user.getFullName());
            this.updateElement('user-initials', user.getInitials());
            
            // Update sidebar
            this.sidebarManager.showAuthenticatedElements(true);
            this.sidebarManager.updateUpcomingEvents(
                this.eventManager.getUpcomingEvents(),
                this.userRegistrations
            );
        } else {
            this.sidebarManager.showAuthenticatedElements(false);
        }
    }

    updateStats() {
        const eventStats = this.eventManager.getEventStats();
        
        console.log('📊 MainApp: Updating stats:', eventStats);
        console.log('📊 MainApp: User registrations for stats:', this.userRegistrations.length);
        
        this.uiManager.updateStats(eventStats);
        
        // Update sidebar stats
        const sidebarStats = {
            available: eventStats.available,
            registered: this.userRegistrations.length,
            total: eventStats.total,
            categories: eventStats.categories
        };
        
        this.sidebarManager.updateStats(sidebarStats);
    }

    updateTabCounts() {
        const allCount = this.eventManager.getAllEvents().length;
        const registeredCount = this.userRegistrations.length;
        
        console.log('📊 MainApp: Updating tab counts - All:', allCount, 'Registered:', registeredCount);
        
        // Update tab button counts with animation
        this.uiManager.animateCountUpdate('all-count', allCount);
        this.uiManager.animateCountUpdate('registered-count', registeredCount);
        
        // Update events found count based on current tab
        let currentEvents;
        if (this.currentTab === 'all') {
            currentEvents = this.eventManager.getFilteredEvents().length;
        } else if (this.currentTab === 'registered') {
            const allEvents = this.eventManager.getAllEvents();
            const registeredEvents = allEvents.filter(event => this.userRegistrations.includes(event.id));
            currentEvents = registeredEvents.length;
        } else {
            currentEvents = 0;
        }
        
        this.updateElement('events-found', `${currentEvents} eventos encontrados`);
    }

    switchTab(tab) {
        console.log('🔄 MainApp: Switching to tab:', tab);
        
        this.currentTab = tab;
        this.uiManager.switchTab(tab);
        
        // Update tab title
        const title = document.getElementById('events-title');
        if (title) {
            title.textContent = tab === 'all' ? 'Eventos disponibles' : 'Mis inscripciones';
        }
        
        // ✅ CRÍTICO: NO recargar registraciones al cambiar tab, usar las ya cargadas
        this.renderEvents();
        this.updateTabCounts();
    }

    // ✅ CRÍTICO: Renderizado con verificación completa de estado de inscripción
    renderEvents() {
        console.log('🔄 MainApp: Rendering events for tab:', this.currentTab);
        console.log('📊 MainApp: Current user registrations:', this.userRegistrations);
        
        let events;
        let registeredCount = this.userRegistrations.length;
        
        if (this.currentTab === 'all') {
            events = this.eventManager.getFilteredEvents();
        } else if (this.currentTab === 'registered') {
            const allEvents = this.eventManager.getAllEvents();
            events = allEvents.filter(event => {
                const isRegistered = this.userRegistrations.includes(event.id);
                console.log(`🔍 MainApp: Event "${event.name}" (${event.id}): registered = ${isRegistered}`);
                return isRegistered;
            });
            console.log('✅ MainApp: Filtered registered events:', events.length);
        }
        
        console.log('📊 MainApp: Events to render:', events.length);
        
        const eventsGrid = document.getElementById('events-grid');
        const noEventsDiv = document.getElementById('no-events');
        
        if (!eventsGrid || !noEventsDiv) {
            console.error('❌ MainApp: Events grid or no-events div not found');
            return;
        }
        
        if (events.length === 0) {
            eventsGrid.style.display = 'none';
            noEventsDiv.style.display = 'block';
            
            const title = document.getElementById('no-events-title');
            const message = document.getElementById('no-events-message');
            const showAllBtn = document.getElementById('show-all-events');
            
            if (this.currentTab === 'registered') {
                if (title) title.textContent = 'No tienes eventos registrados';
                if (message) message.textContent = 'Explora los eventos disponibles y regístrate en los que te interesen.';
                if (showAllBtn) showAllBtn.style.display = 'block';
            } else {
                if (title) title.textContent = 'No se encontraron eventos';
                if (message) message.textContent = 'Intenta ajustar los filtros para encontrar eventos que te interesen.';
                if (showAllBtn) showAllBtn.style.display = 'none';
            }
        } else {
            eventsGrid.style.display = 'grid';
            noEventsDiv.style.display = 'none';
            
            // ✅ CRÍTICO: Verificación exhaustiva del estado de inscripción para cada evento
            eventsGrid.innerHTML = events.map(event => {
                const isRegistered = this.userRegistrations.includes(event.id);
                console.log(`📊 MainApp: Rendering event "${event.name}" (${event.id}): registered = ${isRegistered}`);
                
                // ✅ CRÍTICO: Verificación adicional para debug
                if (isRegistered) {
                    console.log(`✅ MainApp: Event ${event.id} IS REGISTERED - should show registered state`);
                } else {
                    console.log(`❌ MainApp: Event ${event.id} NOT REGISTERED - should show register button`);
                }
                
                return this.uiManager.createEventCard(event, isRegistered);
            }).join('');
        }
        
        // Update counts
        const allCount = this.eventManager.getAllEvents().length;
        this.uiManager.updateCounts(allCount, registeredCount, events.length);
        this.updateTabCounts();
    }

    applyFilters() {
        const searchValue = document.getElementById('search-input')?.value || '';
        const categoryValue = document.getElementById('category-filter')?.value || 'all';
        const locationValue = document.getElementById('location-filter')?.value || 'all';
        const dateValue = document.getElementById('date-filter')?.value || '';
        
        console.log('🔄 MainApp: Applying filters:', { searchValue, categoryValue, locationValue, dateValue });
        
        const filters = {
            search: searchValue,
            category: categoryValue,
            location: locationValue,
            date: dateValue
        };
        
        this.eventManager.applyFilters(filters);
        
        // Show/hide clear filters button
        const hasFilters = searchValue || categoryValue !== 'all' || locationValue !== 'all' || dateValue;
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.style.display = hasFilters ? 'block' : 'none';
        }
        
        this.renderEvents();
    }

    clearFilters() {
        console.log('🔄 MainApp: Clearing filters');
        
        // Clear form inputs
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        const locationFilter = document.getElementById('location-filter');
        const dateFilter = document.getElementById('date-filter');
        
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        if (locationFilter) locationFilter.value = 'all';
        if (dateFilter) dateFilter.value = '';
        
        // Clear filters in event manager
        this.eventManager.clearFilters();
        
        // Hide clear button
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.style.display = 'none';
        }
        
        this.renderEvents();
    }

    handleQuickFilter(filterType) {
        console.log('🔄 MainApp: Handling quick filter:', filterType);
        
        this.clearFilters();
        
        switch (filterType) {
            case 'today':
                const dateFilter = document.getElementById('date-filter');
                if (dateFilter) dateFilter.value = 'today';
                this.applyFilters();
                break;
            case 'week':
                const weekFilter = document.getElementById('date-filter');
                if (weekFilter) weekFilter.value = 'week';
                this.applyFilters();
                break;
            case 'free':
                // Filter for free events (price = 0)
                const freeEvents = this.eventManager.getAllEvents().filter(event => event.price === 0);
                this.eventManager.filteredEvents = freeEvents;
                this.renderEvents();
                break;
        }
    }

    // Global methods for onclick handlers
    openEventModal(eventId) {
        console.log('🔄 MainApp: Opening modal for event:', eventId);
        
        const event = this.eventManager.getEventById(eventId);
        if (!event) {
            console.error('❌ MainApp: Event not found:', eventId);
            this.notificationManager.error('Evento no encontrado');
            return;
        }
        
        // ✅ CRÍTICO: Verificación en tiempo real del estado de inscripción
        const isRegistered = this.userRegistrations.includes(eventId);
        console.log(`📊 MainApp: Modal for event ${eventId}: registered = ${isRegistered}`);
        console.log(`🔍 MainApp: Current registrations:`, this.userRegistrations);
        
        this.modalManager.openEventModal(event, isRegistered, this.authManager);
    }

    // ✅ CRÍTICO: Registro con actualización inmediata y verificación
    registerForEvent(eventId) {
        console.log('🔄 MainApp: Registering for event:', eventId);
        
        if (!this.authManager.isAuthenticated()) {
            this.notificationManager.warning('Debes iniciar sesión para inscribirte en eventos');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        const event = this.eventManager.getEventById(eventId);
        if (!event) {
            this.notificationManager.error('Evento no encontrado');
            return;
        }
        
        if (this.eventManager.isEventFull(eventId)) {
            this.notificationManager.warning('Este evento ya está lleno');
            return;
        }
        
        if (this.eventManager.isEventPast(eventId)) {
            this.notificationManager.warning('Este evento ya ha finalizado');
            return;
        }
        
        if (this.userRegistrations.includes(eventId)) {
            this.notificationManager.info('Ya estás inscrito en este evento');
            return;
        }
        
        console.log('🔄 MainApp: Starting registration process...');
        
        // ✅ CRÍTICO: Registro directo en RegistrationManager
        const user = this.authManager.getCurrentUser();
        const success = this.registrationManager.addRegistration(user.id, eventId);
        
        if (success) {
            console.log('✅ MainApp: Registration successful in RegistrationManager');
            
            // ✅ CRÍTICO: Actualización inmediata de la lista local
            this.userRegistrations.push(eventId);
            console.log('✅ MainApp: Updated local registrations:', this.userRegistrations);
            
            // Update event registration count
            this.eventManager.updateEventRegistration(eventId, true);
            
            this.notificationManager.success(`Te has inscrito exitosamente en "${event.name}"`);
            
            // ✅ CRÍTICO: Re-renderizar inmediatamente para mostrar el cambio
            this.updateStats();
            this.updateTabCounts();
            this.renderEvents();
            this.updateAuthUI();
            
            this.modalManager.closeActiveModal();
        } else {
            console.error('❌ MainApp: Registration failed');
            this.notificationManager.error('Error al inscribirse en el evento');
        }
    }

    // ✅ CRÍTICO: Desinscripción con actualización inmediata y verificación
    unregisterFromEvent(eventId) {
        console.log('🔄 MainApp: Unregistering from event:', eventId);
        
        if (!this.authManager.isAuthenticated()) {
            return;
        }
        
        const event = this.eventManager.getEventById(eventId);
        if (!event) {
            this.notificationManager.error('Evento no encontrado');
            return;
        }
        
        if (!this.userRegistrations.includes(eventId)) {
            this.notificationManager.info('No estás inscrito en este evento');
            return;
        }
        
        console.log('🔄 MainApp: Starting unregistration process...');
        
        // ✅ CRÍTICO: Desinscripción directa en RegistrationManager
        const user = this.authManager.getCurrentUser();
        const success = this.registrationManager.removeRegistration(user.id, eventId);
        
        if (success) {
            console.log('✅ MainApp: Unregistration successful in RegistrationManager');
            
            // ✅ CRÍTICO: Actualización inmediata de la lista local
            const index = this.userRegistrations.indexOf(eventId);
            if (index > -1) {
                this.userRegistrations.splice(index, 1);
            }
            console.log('✅ MainApp: Updated local registrations:', this.userRegistrations);
            
            // Update event registration count
            this.eventManager.updateEventRegistration(eventId, false);
            
            this.notificationManager.success(`Te has desinscrito de "${event.name}"`);
            
            // ✅ CRÍTICO: Re-renderizar inmediatamente para mostrar el cambio
            this.updateStats();
            this.updateTabCounts();
            this.renderEvents();
            this.updateAuthUI();
            
            this.modalManager.closeActiveModal();
        } else {
            console.error('❌ MainApp: Unregistration failed');
            this.notificationManager.error('Error al desinscribirse del evento');
        }
    }

    handleLogout() {
        this.authManager.logout();
        this.notificationManager.info('Sesión cerrada exitosamente');
    }

    // Utility method
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    // ✅ CRÍTICO: Debug method mejorado
    debugApp() {
        console.log('🔍 MainApp: DEBUG - Full app state');
        console.log('📊 Current tab:', this.currentTab);
        console.log('📊 User registrations (local):', this.userRegistrations);
        console.log('📊 Data loaded:', this.isDataLoaded);
        
        // Debug AuthManager
        const user = this.authManager.getCurrentUser();
        if (user) {
            console.log('📊 AuthManager user:', user.getFullName());
            console.log('📊 AuthManager registrations:', this.authManager.getUserRegistrations());
        }
        
        // Debug RegistrationManager
        this.registrationManager.debugRegistrations();
        
        // Debug eventos renderizados
        const eventsGrid = document.getElementById('events-grid');
        if (eventsGrid) {
            const eventCards = eventsGrid.querySelectorAll('.event-card');
            console.log('📊 Rendered event cards:', eventCards.length);
            
            eventCards.forEach((card, index) => {
                const eventId = card.dataset.eventId;
                const isRegistered = this.userRegistrations.includes(eventId);
                const hasRegisteredBadge = card.querySelector('.badge-registered');
                console.log(`📊 Card ${index + 1}: Event ${eventId}, Registered: ${isRegistered}, Has badge: ${!!hasRegisteredBadge}`);
            });
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing app...');
    window.mainApp = new MainApp();
});

// Make methods globally available for onclick handlers
window.openEventModal = (eventId) => {
    if (window.mainApp) {
        window.mainApp.openEventModal(eventId);
    }
};

window.registerForEvent = (eventId) => {
    if (window.mainApp) {
        window.mainApp.registerForEvent(eventId);
    }
};

window.unregisterFromEvent = (eventId) => {
    if (window.mainApp) {
        window.mainApp.unregisterFromEvent(eventId);
    }
};

// ✅ CRÍTICO: Global debug function
window.debugApp = () => {
    if (window.mainApp) {
        window.mainApp.debugApp();
    }
};