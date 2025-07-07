import { BasePageManager } from '../components/BasePageManager.js';
import { formatDate, formatPrice } from '../utils/helpers.js';

class MyRegistrationsPageManager extends BasePageManager {
    constructor() {
        super();
        this.regularRegistrations = [];
        this.customRegistrations = [];
        this.allEvents = [];
        this.filteredRegistrations = [];
        this.currentView = 'grid';
    }


    async loadPageData() {
        this.loadAllData();
    }


    updateUI() {
        super.updateUI();

    }

    loadAllData() {
        console.log('🔄 MyRegistrationsPageManager: Loading all data...');
        
        this.allEvents = this.eventManager.getAllEvents();
        
        this.regularRegistrations = this.registrationManager.getUserRegistrations(this.currentUser.id);
        
        this.customRegistrations = this.registrationManager.getUserCustomRegistrations(this.currentUser.id);
        
        console.log('📊 MyRegistrationsPageManager: Data loaded:', {
            events: this.allEvents.length,
            regular: this.regularRegistrations.length,
            custom: this.customRegistrations.length
        });
        
        this.updateStats();
        
        this.filterAndDisplayRegistrations();
    }


    setupEventListeners() {
        super.setupEventListeners();
        
        const typeFilter = document.getElementById('type-filter');
        const statusFilter = document.getElementById('status-filter');
        const searchInput = document.getElementById('search-registrations');
        
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.filterAndDisplayRegistrations());
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterAndDisplayRegistrations());
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterAndDisplayRegistrations());
        }
        
        const gridViewBtn = document.getElementById('grid-view-btn');
        const listViewBtn = document.getElementById('list-view-btn');
        
        if (gridViewBtn) {
            gridViewBtn.addEventListener('click', () => this.switchView('grid'));
        }
        
        if (listViewBtn) {
            listViewBtn.addEventListener('click', () => this.switchView('list'));
        }
        
        const closeModal = document.getElementById('close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }
    }



    updateStats() {
        const regularCount = this.regularRegistrations.length;
        const customCount = this.customRegistrations.length;
        const totalCount = regularCount + customCount;
        
        this.updateElement('regular-count', regularCount);
        this.updateElement('custom-count', customCount);
        this.updateElement('total-count', totalCount);
    }

    filterAndDisplayRegistrations() {
        const typeFilter = document.getElementById('type-filter')?.value || 'all';
        const statusFilter = document.getElementById('status-filter')?.value || 'all';
        const searchTerm = document.getElementById('search-registrations')?.value.toLowerCase() || '';
        
        let allRegistrations = [];
        
        if (typeFilter === 'all' || typeFilter === 'regular') {
            this.regularRegistrations.forEach(eventId => {
                const event = this.allEvents.find(e => e.id === eventId);
                if (event) {
                    allRegistrations.push({
                        type: 'regular',
                        event: event,
                        registrationData: null,
                        status: this.getEventStatus(event)
                    });
                }
            });
        }
        
        if (typeFilter === 'all' || typeFilter === 'custom') {
            this.customRegistrations.forEach(registration => {
                const event = this.allEvents.find(e => e.id === registration.eventId);
                if (event) {
                    allRegistrations.push({
                        type: 'custom',
                        event: event,
                        registrationData: registration,
                        status: registration.status || 'pending'
                    });
                }
            });
        }
        
        if (statusFilter !== 'all') {
            allRegistrations = allRegistrations.filter(reg => {
                if (statusFilter === 'upcoming') {
                    return new Date(reg.event.date) > new Date();
                } else if (statusFilter === 'past') {
                    return new Date(reg.event.date) <= new Date();
                } else if (statusFilter === 'pending') {
                    return reg.status === 'pending';
                }
                return true;
            });
        }
        
        if (searchTerm) {
            allRegistrations = allRegistrations.filter(reg => {
                const eventName = reg.event.name.toLowerCase();
                const eventDescription = reg.event.description.toLowerCase();
                let personalName = '';
                
                if (reg.type === 'custom' && reg.registrationData) {
                    personalName = `${reg.registrationData.firstName || ''} ${reg.registrationData.lastName || ''}`.toLowerCase();
                }
                
                return eventName.includes(searchTerm) || 
                       eventDescription.includes(searchTerm) || 
                       personalName.includes(searchTerm);
            });
        }
        
        allRegistrations.sort((a, b) => new Date(b.event.date) - new Date(a.event.date));
        
        this.filteredRegistrations = allRegistrations;
        this.displayRegistrations();
    }

    getEventStatus(event) {
        const now = new Date();
        const eventDate = new Date(event.date);
        
        if (eventDate > now) {
            return 'upcoming';
        } else {
            return 'past';
        }
    }

    displayRegistrations() {
        const container = document.getElementById('registrations-container');
        const noRegistrations = document.getElementById('no-registrations');
        
        if (!container) return;
        
        if (this.filteredRegistrations.length === 0) {
            container.style.display = 'none';
            noRegistrations.style.display = 'block';
            return;
        }
        
        container.style.display = 'grid';
        noRegistrations.style.display = 'none';
        
        container.innerHTML = this.filteredRegistrations.map(registration => {
            if (this.currentView === 'grid') {
                return this.createRegistrationCard(registration);
            } else {
                return this.createRegistrationListItem(registration);
            }
        }).join('');
        
        this.attachRegistrationEventListeners();
    }

    createRegistrationCard(registration) {
        const { type, event, registrationData, status } = registration;
        const isPast = new Date(event.date) <= new Date();
        const typeLabel = type === 'regular' ? 'Normal' : 'Personalizada';
        const statusLabel = this.getStatusLabel(status);
        const statusClass = this.getStatusClass(status);
        
        return `
            <div class="registration-card" data-type="${type}" data-event-id="${event.id}" data-registration-id="${registrationData?.id || ''}">
                <div class="registration-image-container">
                    <img src="${event.image}" alt="${event.name}" class="registration-image" loading="lazy">
                    <div class="registration-badges">
                        <span class="badge badge-type badge-${type}">${typeLabel}</span>
                        <span class="badge badge-status badge-${statusClass}">${statusLabel}</span>
                    </div>
                </div>
                <div class="registration-content">
                    <h3 class="registration-title">${event.name}</h3>
                    <p class="registration-description">${event.description}</p>
                    <div class="registration-details">
                        <div class="registration-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span>${formatDate(event.date)}</span>
                        </div>
                        <div class="registration-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span>${event.location}</span>
                        </div>
                        ${event.price > 0 ? `
                        <div class="registration-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="1" x2="12" y2="23"/>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                            <span>${formatPrice(event.price)}</span>
                        </div>
                        ` : ''}
                    </div>
                    ${type === 'custom' && registrationData ? `
                    <div class="registration-personal-info">
                        <p><strong>Inscrito como:</strong> ${registrationData.firstName} ${registrationData.lastName}</p>
                        <p><strong>Email:</strong> ${registrationData.email}</p>
                    </div>
                    ` : ''}
                </div>
                <div class="registration-actions">
                    <button class="btn btn-secondary btn-sm view-details-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Ver Detalles
                    </button>
                    ${!isPast && (status === 'upcoming' || status === 'pending' || status === 'confirmed') ? `
                    <button class="btn btn-danger btn-sm unregister-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Cancelar Inscripción
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    createRegistrationListItem(registration) {
        const { type, event, registrationData, status } = registration;
        const typeLabel = type === 'regular' ? 'Normal' : 'Personalizada';
        const statusLabel = this.getStatusLabel(status);
        const statusClass = this.getStatusClass(status);
        
        return `
            <div class="registration-list-item" data-type="${type}" data-event-id="${event.id}" data-registration-id="${registrationData?.id || ''}">
                <div class="registration-list-image">
                    <img src="${event.image}" alt="${event.name}" loading="lazy">
                </div>
                <div class="registration-list-content">
                    <div class="registration-list-header">
                        <h3>${event.name}</h3>
                        <div class="registration-list-badges">
                            <span class="badge badge-type badge-${type}">${typeLabel}</span>
                            <span class="badge badge-status badge-${statusClass}">${statusLabel}</span>
                        </div>
                    </div>
                    <p class="registration-list-description">${event.description}</p>
                    <div class="registration-list-details">
                        <span>${formatDate(event.date)}</span>
                        <span>${event.location}</span>
                        ${event.price > 0 ? `<span>${formatPrice(event.price)}</span>` : ''}
                    </div>
                    ${type === 'custom' && registrationData ? `
                    <div class="registration-list-personal">
                        <span>Inscrito como: ${registrationData.firstName} ${registrationData.lastName}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="registration-list-actions">
                    <button class="btn btn-secondary btn-sm view-details-btn">Ver Detalles</button>
                    ${!new Date(event.date) <= new Date() && (status === 'upcoming' || status === 'pending' || status === 'confirmed') ? `
                    <button class="btn btn-danger btn-sm unregister-btn">Cancelar</button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    getStatusLabel(status) {
        const labels = {
            'upcoming': 'Próximo',
            'past': 'Pasado',
            'pending': 'Pendiente',
            'confirmed': 'Confirmado',
            'cancelled': 'Cancelado'
        };
        return labels[status] || 'Desconocido';
    }

    getStatusClass(status) {
        const classes = {
            'upcoming': 'upcoming',
            'past': 'past',
            'pending': 'pending',
            'confirmed': 'confirmed',
            'cancelled': 'cancelled'
        };
        return classes[status] || 'unknown';
    }

    attachRegistrationEventListeners() {
        console.log('🔗 MyRegistrationsPageManager: Attaching event listeners...');
        
        const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
        console.log('🔍 Found view details buttons:', viewDetailsBtns.length);
        
        viewDetailsBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('👆 View details button clicked');
                e.stopPropagation();
                const card = btn.closest('.registration-card, .registration-list-item');
                console.log('📋 Card found:', card);
                this.showRegistrationDetails(card);
            });
        });
        
        const unregisterBtns = document.querySelectorAll('.unregister-btn');
        console.log('🗑️ Found unregister buttons:', unregisterBtns.length);
        
        unregisterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.registration-card, .registration-list-item');
                this.handleUnregister(card);
            });
        });
    }

    showRegistrationDetails(card) {
        console.log('📋 MyRegistrationsPageManager: Showing registration details...');
        console.log('Card:', card);
        
        if (!card) {
            console.error('❌ No card provided');
            return;
        }
        
        const type = card.dataset.type;
        const eventId = card.dataset.eventId;
        const registrationId = card.dataset.registrationId;
        
        console.log('📊 Registration details:', { type, eventId, registrationId });
        
        const event = this.allEvents.find(e => e.id === eventId);
        if (!event) {
            console.error('❌ Event not found:', eventId);
            return;
        }
        
        console.log('🎉 Event found:', event.name);
        
        let registrationData = null;
        if (type === 'custom' && registrationId) {
            registrationData = this.customRegistrations.find(r => r.id === registrationId);
            console.log('👤 Registration data:', registrationData);
        }
        
        this.displayRegistrationModal(event, type, registrationData);
    }

    displayRegistrationModal(event, type, registrationData) {
        console.log('🎭 MyRegistrationsPageManager: Displaying registration modal...');
        console.log('Event:', event.name, 'Type:', type);
        
        const modal = document.getElementById('registration-details-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('registration-details-content');
        
        console.log('🔍 Modal elements found:', {
            modal: !!modal,
            modalTitle: !!modalTitle,
            modalContent: !!modalContent
        });
        
        if (!modal || !modalTitle || !modalContent) {
            console.error('❌ Modal elements not found');
            return;
        }
        
        const typeLabel = type === 'regular' ? 'Normal' : 'Personalizada';
        modalTitle.textContent = `Inscripción ${typeLabel} - ${event.name}`;
        
        let content = `
            <div class="registration-modal-content">
                <div class="event-info-section">
                    <h3>Información del Evento</h3>
                    <div class="event-info-grid">
                        <div class="event-info-item">
                            <strong>Nombre:</strong> ${event.name}
                        </div>
                        <div class="event-info-item">
                            <strong>Descripción:</strong> ${event.description}
                        </div>
                        <div class="event-info-item">
                            <strong>Fecha:</strong> ${formatDate(event.date)}
                        </div>
                        <div class="event-info-item">
                            <strong>Ubicación:</strong> ${event.location}
                        </div>
                        <div class="event-info-item">
                            <strong>Categoría:</strong> ${event.category}
                        </div>
                        <div class="event-info-item">
                            <strong>Precio:</strong> ${formatPrice(event.price)}
                        </div>
                        <div class="event-info-item">
                            <strong>Capacidad:</strong> ${event.registered}/${event.capacity}
                        </div>
                    </div>
                </div>
        `;
        
        if (type === 'custom' && registrationData) {
            content += `
                <div class="personal-info-section">
                    <h3>Información Personal</h3>
                    <div class="personal-info-grid">
                        <div class="personal-info-item">
                            <strong>Nombre:</strong> ${registrationData.firstName} ${registrationData.lastName}
                        </div>
                        <div class="personal-info-item">
                            <strong>Email:</strong> ${registrationData.email}
                        </div>
                        <div class="personal-info-item">
                            <strong>Teléfono:</strong> ${registrationData.phone || 'No especificado'}
                        </div>
                        <div class="personal-info-item">
                            <strong>Dirección:</strong> ${registrationData.address || 'No especificada'}
                        </div>
                        <div class="personal-info-item">
                            <strong>Ciudad:</strong> ${registrationData.city || 'No especificada'}
                        </div>
                        <div class="personal-info-item">
                            <strong>Contacto de emergencia:</strong> ${registrationData.emergencyContact || 'No especificado'}
                        </div>
                        <div class="personal-info-item">
                            <strong>Teléfono de emergencia:</strong> ${registrationData.emergencyPhone || 'No especificado'}
                        </div>
                        <div class="personal-info-item">
                            <strong>Requerimientos especiales:</strong> ${registrationData.specialRequirements || 'Ninguno'}
                        </div>
                        <div class="personal-info-item">
                            <strong>Restricciones dietéticas:</strong> ${registrationData.dietaryRestrictions || 'Ninguna'}
                        </div>
                        <div class="personal-info-item">
                            <strong>Notas adicionales:</strong> ${registrationData.notes || 'Ninguna'}
                        </div>
                        <div class="personal-info-item">
                            <strong>Estado:</strong> ${this.getStatusLabel(registrationData.status)}
                        </div>
                        <div class="personal-info-item">
                            <strong>Fecha de inscripción:</strong> ${formatDate(registrationData.createdAt)}
                        </div>
                    </div>
                </div>
            `;
        }
        
        content += '</div>';
        modalContent.innerHTML = content;
        modal.style.display = 'flex';
        modal.classList.add('show');
    }

    handleUnregister(card) {
        const eventId = card.dataset.eventId;
        const registrationId = card.dataset.registrationId;
        const type = card.dataset.type;
        const event = this.allEvents.find(e => e.id === eventId);
        
        if (!event) return;
        
        const typeLabel = type === 'regular' ? 'normal' : 'personalizada';
        
        if (confirm(`¿Estás seguro de que quieres cancelar tu inscripción ${typeLabel} a "${event.name}"?`)) {
            let success = false;
            
            if (type === 'regular') {
                success = this.registrationManager.removeRegistration(this.currentUser.id, eventId);
            } else if (type === 'custom' && registrationId) {
                success = this.customRegistrationManager.removeCustomRegistration(registrationId);
            }
            
            if (success) {
                this.notificationManager.success('Inscripción cancelada exitosamente');
                this.loadAllData();
            } else {
                this.notificationManager.error('Error al cancelar la inscripción');
            }
        }
    }

    switchView(view) {
        this.currentView = view;
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-view="${view}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        const container = document.getElementById('registrations-container');
        if (container) {
            container.className = view === 'grid' ? 'registrations-grid' : 'registrations-list';
        }
        
        this.displayRegistrations();
    }

    closeModal() {
        const modal = document.getElementById('registration-details-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    updateAuthUI() {
        if (!this.currentUser) return;
        
        this.updateElement('user-name-header', this.currentUser.getFullName());
        this.updateElement('user-initials', this.currentUser.getInitials());
        
        document.body.classList.add('authenticated');
    }



}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 My Registrations page DOM loaded, initializing...');
    window.myRegistrationsPageManager = new MyRegistrationsPageManager();
});