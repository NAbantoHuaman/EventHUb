import { getAppManager } from '../utils/AppManager.js';
import { debounce } from '../utils/helpers.js';

class MainApp {
    constructor() {
        this.appManager = getAppManager();
        this.currentTab = 'all';
        this.userRegistrations = [];
        this.isDataLoaded = false;
        
        this.init();
    }

    async init() {
        console.log('🚀 MainApp: Inicializando...');
        try {
            await this.appManager.init();
            this.authManager = this.appManager.authManager;
            this.eventManager = this.appManager.eventManager;
            this.notificationManager = this.appManager.notificationManager;
            this.modalManager = this.appManager.modalManager;
            this.sidebarManager = this.appManager.sidebarManager;
            this.uiManager = this.appManager.uiManager;
            this.registrationManager = this.appManager.registrationManager;
            
            this.setupEventListeners();
            await this.loadInitialData();
            this.updateAuthUI();
            this.renderEvents();
            
            this.isDataLoaded = true;
            console.log('✅ MainApp: Inicialización exitosa');
            console.log('📊 MainApp: Inscripciones finales del usuario:', this.userRegistrations);
        } catch (error) {
            console.error('❌ MainApp: Error durante la inicialización:', error);
            this.appManager.notificationManager?.error('Error al inicializar la aplicación');
        }
    }
    setupEventListeners() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
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
        this.setupUserMenu();
        this.setupModalEvents();
        this.setupCustomEvents();
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
        const closeButtons = document.querySelectorAll('#close-modal, #modal-close-btn');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.modalManager.closeActiveModal());
        });
        const modal = document.getElementById('event-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.modalManager.closeActiveModal();
                }
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.modalManager.closeActiveModal();
            }
        });
    }
    setupCustomEvents() {
        document.addEventListener('quickFilter', (e) => {
            this.handleQuickFilter(e.detail.filterType);
        });
        document.addEventListener('switchTab', (e) => {
            this.switchTab(e.detail.tab);
        });
        document.addEventListener('registerForEvent', (e) => {
            this.registerForEvent(e.detail.eventId);
        });

        document.addEventListener('unregisterFromEvent', (e) => {
            this.unregisterFromEvent(e.detail.eventId);
        });
    }
    async loadInitialData() {
        console.log('🔄 MainApp: Cargando datos iniciales...');
        await this.loadUserRegistrations();
        const categories = this.eventManager.getCategories();
        const locations = this.eventManager.getLocations();
        this.uiManager.updateFilterOptions(categories, locations);
        this.updateStats();
        
        console.log('✅ MainApp: Datos iniciales cargados');
        console.log('📊 MainApp: Total de eventos disponibles:', this.eventManager.getAllEvents().length);
        console.log('📊 MainApp: Inscripciones del usuario:', this.userRegistrations.length);
        console.log('📊 MainApp: IDs de inscripciones:', this.userRegistrations);
    }
    async loadUserRegistrations() {
        console.log('🔄 MainApp: Cargando inscripciones del usuario...');
        const user = this.authManager.getCurrentUser();
        if (user) {
            console.log('✅ MainApp: Usuario encontrado:', user.getFullName());
            this.userRegistrations = this.registrationManager.getUserRegistrations(user.id);
            console.log('📊 MainApp: Inscripciones directas desde RegistrationManager:', this.userRegistrations.length);
            const allEvents = this.eventManager.getAllEvents();
            const validRegistrations = [];
            this.userRegistrations.forEach(regId => {
                const eventExists = allEvents.some(event => event.id === regId);
                if (eventExists) {
                    validRegistrations.push(regId);
                    console.log(`✅ MainApp: Inscripción válida para el evento: ${regId}`);
                } else {
                    console.warn(`⚠️ MainApp: Inscripción inválida para evento inexistente: ${regId}`);
                }
            });
            this.userRegistrations = validRegistrations;
            console.log('✅ MainApp: Inscripciones válidas finales:', this.userRegistrations.length);
        } else {
            console.log('ℹ️ MainApp: No hay usuario autenticado');
            this.userRegistrations = [];
        }
        console.log('🔍 MainApp: Verificación final de inscripciones:');
        this.userRegistrations.forEach((regId, index) => {
            console.log(`📊 Inscripción ${index + 1}: ${regId}`);
        });
    }
    updateAuthUI() {
        const user = this.authManager.getCurrentUser();
        const isAuthenticated = this.authManager.isAuthenticated();
        console.log('🔄 MainApp: Actualizando UI de autenticación, autenticado:', isAuthenticated);
        console.log('📊 MainApp: Inscripciones del usuario para UI:', this.userRegistrations.length);
        document.body.classList.toggle('authenticated', isAuthenticated);
        if (isAuthenticated && user) {
            this.updateElement('user-name-header', user.getFullName());
            this.updateElement('user-initials', user.getInitials());
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
        const registrationStats = this.registrationManager.getRegistrationStats();
        const currentUserId = this.authManager.getCurrentUser()?.id;
        let totalUserRegistrations = this.userRegistrations.length;
        if (currentUserId) {
            const customRegistrations = this.registrationManager.getAllCustomRegistrations();
            const userCustomRegistrations = Object.values(customRegistrations).filter(reg => 
                reg.userId === currentUserId
            ).length;
            totalUserRegistrations += userCustomRegistrations;
        }
        
        console.log('📊 MainApp: Actualizando estadísticas:', eventStats);
        console.log('📊 MainApp: Inscripciones regulares del usuario:', this.userRegistrations.length);
        console.log('📊 MainApp: Inscripciones totales del usuario:', totalUserRegistrations);
        this.uiManager.updateStats(eventStats);
        const sidebarStats = {
            available: eventStats.available,
            registered: totalUserRegistrations,
            total: eventStats.total,
            categories: eventStats.categories
        };
        this.sidebarManager.updateStats(sidebarStats);
    }
    updateTabCounts() {
        const allCount = this.eventManager.getAllEvents().length;
        const registeredCount = this.userRegistrations.length;
        console.log('📊 MainApp: Actualizando contadores de pestañas - Todos:', allCount, 'Inscritos:', registeredCount);
        this.uiManager.animateCountUpdate('all-count', allCount);
        this.uiManager.animateCountUpdate('registered-count', registeredCount);
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
        console.log('🔄 MainApp: Cambiando a la pestaña:', tab);
        this.currentTab = tab;
        this.uiManager.switchTab(tab);
        const title = document.getElementById('events-title');
        if (title) {
            title.textContent = tab === 'all' ? 'Eventos disponibles' : 'Mis inscripciones';
        }
        this.renderEvents();
        this.updateTabCounts();
    }
    renderEvents() {
        console.log('🔄 MainApp: Renderizando eventos para la pestaña:', this.currentTab);
        console.log('📊 MainApp: Inscripciones actuales del usuario:', this.userRegistrations);
        let events;
        let registeredCount = this.userRegistrations.length;
        if (this.currentTab === 'all') {
            events = this.eventManager.getFilteredEvents();
        } else if (this.currentTab === 'registered') {
            const allEvents = this.eventManager.getAllEvents();
            events = allEvents.filter(event => {
                const isRegistered = this.userRegistrations.includes(event.id);
                console.log(`🔍 MainApp: Evento "${event.name}" (${event.id}): inscrito = ${isRegistered}`);
                return isRegistered;
            });
            console.log('✅ MainApp: Eventos filtrados inscritos:', events.length);
        }
        console.log('📊 MainApp: Eventos a renderizar:', events.length);
        const eventsGrid = document.getElementById('events-grid');
        const noEventsDiv = document.getElementById('no-events');
        if (!eventsGrid || !noEventsDiv) {
            console.error('❌ MainApp: No se encontró el grid de eventos o el div de no-eventos');
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
            eventsGrid.innerHTML = events.map(event => {
                const isRegistered = this.userRegistrations.includes(event.id);
                console.log(`📊 MainApp: Renderizando evento "${event.name}" (${event.id}): inscrito = ${isRegistered}`);
                if (isRegistered) {
                    console.log(`✅ MainApp: Evento ${event.id} INSCRITO - debe mostrar estado inscrito`);
                } else {
                    console.log(`❌ MainApp: Evento ${event.id} NO INSCRITO - debe mostrar botón de inscripción`);
                }
                return this.uiManager.createEventCard(event, isRegistered);
            }).join('');
        }
        const allCount = this.eventManager.getAllEvents().length;
        this.uiManager.updateCounts(allCount, registeredCount, events.length);
        this.updateTabCounts();
    }
    applyFilters() {
        const searchValue = document.getElementById('search-input')?.value || '';
        const categoryValue = document.getElementById('category-filter')?.value || 'all';
        const locationValue = document.getElementById('location-filter')?.value || 'all';
        const dateValue = document.getElementById('date-filter')?.value || '';
        console.log('🔄 MainApp: Aplicando filtros:', { searchValue, categoryValue, locationValue, dateValue });
        const filters = {
            search: searchValue,
            category: categoryValue,
            location: locationValue,
            date: dateValue
        };
        this.eventManager.applyFilters(filters);
        const hasFilters = searchValue || categoryValue !== 'all' || locationValue !== 'all' || dateValue;
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.style.display = hasFilters ? 'block' : 'none';
        }
        this.renderEvents();
    }
    clearFilters() {
        console.log('🔄 MainApp: Limpiando filtros');
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        const locationFilter = document.getElementById('location-filter');
        const dateFilter = document.getElementById('date-filter');
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        if (locationFilter) locationFilter.value = 'all';
        if (dateFilter) dateFilter.value = '';
        this.eventManager.clearFilters();
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.style.display = 'none';
        }
        this.renderEvents();
    }
    handleQuickFilter(filterType) {
        console.log('🔄 MainApp: Aplicando filtro rápido:', filterType);
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
                const freeEvents = this.eventManager.getAllEvents().filter(event => event.price === 0);
                this.eventManager.filteredEvents = freeEvents;
                this.renderEvents();
                break;
        }
    }
    openEventModal(eventId) {
        console.log('🔄 MainApp: Abriendo modal para evento:', eventId);
        const event = this.eventManager.getEventById(eventId);
        if (!event) {
            console.error('❌ MainApp: Evento no encontrado:', eventId);
            this.notificationManager.error('Evento no encontrado');
            return;
        }
        const isRegistered = this.userRegistrations.includes(eventId);
        console.log(`📊 MainApp: Modal para evento ${eventId}: inscrito = ${isRegistered}`);
        console.log(`🔍 MainApp: Inscripciones actuales:`, this.userRegistrations);
        this.modalManager.openEventModal(event, isRegistered, this.authManager);
    }
    registerForEvent(eventId) {
        console.log('🔄 MainApp: Inscribiendo en evento:', eventId);
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
        console.log('🔄 MainApp: Iniciando proceso de inscripción...');
        const user = this.authManager.getCurrentUser();
        const success = this.registrationManager.addRegistration(user.id, eventId);
        if (success) {
            console.log('✅ MainApp: Inscripción exitosa en RegistrationManager');
            this.userRegistrations.push(eventId);
            console.log('✅ MainApp: Inscripciones locales actualizadas:', this.userRegistrations);
            this.eventManager.updateEventRegistration(eventId, true);
            this.notificationManager.success(`Te has inscrito exitosamente en "${event.name}"`);
            this.updateStats();
            this.updateTabCounts();
            this.renderEvents();
            this.updateAuthUI();
            this.modalManager.closeActiveModal();
        } else {
            console.error('❌ MainApp: Falló la inscripción');
            this.notificationManager.error('Error al inscribirse en el evento');
        }
    }
    unregisterFromEvent(eventId) {
        console.log('🔄 MainApp: Desinscribiendo del evento:', eventId);
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
        console.log('🔄 MainApp: Iniciando proceso de desinscripción...');
        const user = this.authManager.getCurrentUser();
        const success = this.registrationManager.removeRegistration(user.id, eventId);
        if (success) {
            console.log('✅ MainApp: Desinscripción exitosa en RegistrationManager');
            const index = this.userRegistrations.indexOf(eventId);
            if (index > -1) {
                this.userRegistrations.splice(index, 1);
            }
            console.log('✅ MainApp: Inscripciones locales actualizadas:', this.userRegistrations);
            this.eventManager.updateEventRegistration(eventId, false);
            this.notificationManager.success(`Te has desinscrito de "${event.name}"`);
            this.updateStats();
            this.updateTabCounts();
            this.renderEvents();
            this.updateAuthUI();
            this.modalManager.closeActiveModal();
        } else {
            console.error('❌ MainApp: Falló la desinscripción');
            this.notificationManager.error('Error al desinscribirse del evento');
        }
    }
    handleLogout() {
        this.authManager.logout();
        this.notificationManager.info('Sesión cerrada exitosamente');
    }
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }
    debugApp() {
        console.log('🔍 MainApp: DEBUG - Estado completo de la app');
        console.log('📊 Pestaña actual:', this.currentTab);
        console.log('📊 Inscripciones del usuario (local):', this.userRegistrations);
        console.log('📊 Datos cargados:', this.isDataLoaded);
        const user = this.authManager.getCurrentUser();
        if (user) {
            console.log('📊 Usuario en AuthManager:', user.getFullName());
            console.log('📊 Inscripciones en AuthManager:', this.authManager.getUserRegistrations());
        }
        this.registrationManager.debugRegistrations();
        const eventsGrid = document.getElementById('events-grid');
        if (eventsGrid) {
            const eventCards = eventsGrid.querySelectorAll('.event-card');
            console.log('📊 Tarjetas de eventos renderizadas:', eventCards.length);
            eventCards.forEach((card, index) => {
                const eventId = card.dataset.eventId;
                const isRegistered = this.userRegistrations.includes(eventId);
                const hasRegisteredBadge = card.querySelector('.badge-registered');
                console.log(`📊 Tarjeta ${index + 1}: Evento ${eventId}, Inscrito: ${isRegistered}, Tiene badge: ${!!hasRegisteredBadge}`);
            });
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM cargado, inicializando app...');
    window.mainApp = new MainApp();
});


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

window.debugApp = () => {
    if (window.mainApp) {
        window.mainApp.debugApp();
    }
};