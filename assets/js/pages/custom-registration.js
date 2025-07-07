import { BasePageManager } from '../components/BasePageManager.js';
import { formatDate, formatPrice } from '../utils/helpers.js';

class CustomRegistrationPageManager extends BasePageManager {
    constructor() {
        super();
        this.selectedEvent = null;
    }
    async loadPageData() {
        this.loadAvailableEvents();
    }
    updateUI() {
        super.updateUI();
        this.prefillUserInfo();
    }
    async onPageReady() {
        this.customRegistrationManager = this.appManager.registrationManager;
    }
    setupEventListeners() {
        super.setupEventListeners();
        const eventSelect = document.getElementById('event-select');
        if (eventSelect) {
            eventSelect.addEventListener('change', (e) => this.handleEventSelection(e));
        }
        const customRegistrationForm = document.getElementById('custom-registration-form');
        if (customRegistrationForm) {
            customRegistrationForm.addEventListener('submit', (e) => this.handleFormSubmission(e));
        }
    }
    loadAvailableEvents() {
        console.log('🔄 CustomRegistrationPageManager: Loading available events...');
        const eventSelect = document.getElementById('event-select');
        if (!eventSelect) return;
        
        const allEvents = this.eventManager.getAllEvents();
        const now = new Date();
        const availableEvents = allEvents.filter(event => {
            const eventDate = new Date(event.date);
            const isNotFull = event.registered < event.capacity;
            const isFuture = eventDate > now;
            return isNotFull && isFuture;
        });
        
        console.log('📊 CustomRegistrationPageManager: Available events:', availableEvents.length);
        eventSelect.innerHTML = '<option value="">Selecciona un evento</option>';
        availableEvents.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.name} - ${formatDate(event.date, { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}`;
            option.dataset.eventData = JSON.stringify(event);
            eventSelect.appendChild(option);
        });
        
        if (availableEvents.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay eventos disponibles';
            option.disabled = true;
            eventSelect.appendChild(option);
        }
    }

    handleEventSelection(e) {
        const selectedOption = e.target.selectedOptions[0];
        const eventDetailsDiv = document.getElementById('event-details');
        
        if (!selectedOption || !selectedOption.value) {
            this.selectedEvent = null;
            eventDetailsDiv.style.display = 'none';
            return;
        }
        
        try {
            this.selectedEvent = JSON.parse(selectedOption.dataset.eventData);
            console.log('📊 CustomRegistrationPageManager: Event selected:', this.selectedEvent.name);
            
            this.displayEventDetails();
            eventDetailsDiv.style.display = 'block';
        } catch (error) {
            console.error('❌ CustomRegistrationPageManager: Error parsing event data:', error);
            this.notificationManager.error('Error al cargar los detalles del evento');
        }
    }

    displayEventDetails() {
        if (!this.selectedEvent) return;
        
        const eventDetailsDiv = document.getElementById('event-details');
        if (!eventDetailsDiv) return;
        
        const spotsLeft = this.selectedEvent.capacity - this.selectedEvent.registered;
        const progressPercentage = (this.selectedEvent.registered / this.selectedEvent.capacity) * 100;
        
        eventDetailsDiv.innerHTML = `
            <div class="event-preview-card">
                <div class="event-preview-header">
                    <img src="${this.selectedEvent.image}" alt="${this.selectedEvent.name}" class="event-preview-image">
                    <div class="event-preview-badges">
                        <span class="badge badge-category">${this.selectedEvent.category}</span>
                        <span class="badge badge-available">${spotsLeft} cupos disponibles</span>
                    </div>
                </div>
                <div class="event-preview-content">
                    <h4>${this.selectedEvent.name}</h4>
                    <p class="event-preview-description">${this.selectedEvent.description}</p>
                    <div class="event-preview-details">
                        <div class="event-preview-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span>${formatDate(this.selectedEvent.date)}</span>
                        </div>
                        <div class="event-preview-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span>${this.selectedEvent.location}</span>
                        </div>
                        <div class="event-preview-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="1" x2="12" y2="23"/>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                            <span>${formatPrice(this.selectedEvent.price)}</span>
                        </div>
                    </div>
                    <div class="event-preview-capacity">
                        <div class="capacity-info">
                            <span>Capacidad: ${this.selectedEvent.registered}/${this.selectedEvent.capacity}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    prefillUserInfo() {
        if (!this.currentUser) return;
        console.log('🔄 CustomRegistrationPageManager: Pre-filling user information...');
        this.setInputValue('firstName', this.currentUser.firstName);
        this.setInputValue('lastName', this.currentUser.lastName);
        this.setInputValue('email', this.currentUser.email);
        this.setInputValue('phone', this.currentUser.phone || '');
    }

    async handleFormSubmission(e) {
        e.preventDefault();
        console.log('🔄 CustomRegistrationPageManager: Processing form submission...');
        if (!this.selectedEvent) {
            this.notificationManager.error('Por favor selecciona un evento');
            return;
        }
        const existingRegistrations = this.customRegistrationManager.getUserCustomRegistrations(this.currentUser.id);
        const hasExistingRegistration = existingRegistrations.some(reg => reg.eventId === this.selectedEvent.id);
        if (hasExistingRegistration) {
            this.notificationManager.warning('Ya tienes una inscripción personalizada para este evento');
            return;
        }
        const formData = new FormData(e.target);
        if (!formData.get('terms')) {
            this.notificationManager.error('Debes aceptar los términos y condiciones');
            return;
        }
        const registrationData = {
            userId: this.currentUser.id,
            eventId: this.selectedEvent.id,
            eventName: this.selectedEvent.name,
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            emergencyContact: formData.get('emergencyContact'),
            emergencyPhone: formData.get('emergencyPhone'),
            specialRequirements: formData.get('specialRequirements'),
            dietaryRestrictions: formData.get('dietaryRestrictions'),
            notes: formData.get('notes'),
            paymentRequired: this.selectedEvent.price > 0,
            notifications: formData.get('notifications') === 'on'
        };
        console.log('📊 CustomRegistrationPageManager: Registration data prepared');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(submitBtn, true);
        try {
            console.log('🔄 About to call addCustomRegistration...');
            const result = this.customRegistrationManager.addCustomRegistration(registrationData);
            console.log('📊 Registration result:', result);
            
            if (result.success) {
                console.log('✅ CustomRegistrationPageManager: Registration successful');
                console.log('🔔 About to show notification...');
                if (!this.notificationManager) {
                    console.error('❌ NotificationManager not found!');
                    alert('¡Inscripción completada exitosamente!');
                    return;
                }
                console.log('📢 NotificationManager found, calling success...');
                const notificationContainer = document.getElementById('notifications');
                console.log('🔍 Notification container exists:', !!notificationContainer);
                if (notificationContainer) {
                    console.log('📦 Container element:', notificationContainer);
                    console.log('📦 Container styles:', window.getComputedStyle(notificationContainer));
                }
                this.notificationManager.success(
                    `¡Inscripción personalizada completada exitosamente para "${this.selectedEvent.name}"!`,
                    8000,
                    [{
                        text: 'Ver mis inscripciones',
                        handler: 'window.location.href="my-custom-registrations.html"',
                        primary: true
                    }]
                );
                console.log('✅ Notification should be displayed now!');
                setTimeout(() => {
                    const notifications = document.querySelectorAll('.notification');
                    console.log('🔍 Notifications in DOM:', notifications.length);
                    notifications.forEach((notif, index) => {
                        console.log(`📋 Notification ${index}:`, notif);
                        console.log(`📋 Notification ${index} styles:`, window.getComputedStyle(notif));
                    });
                }, 100);
                setTimeout(() => {
                    e.target.reset();
                    this.selectedEvent = null;
                    document.getElementById('event-details').style.display = 'none';
                    this.prefillUserInfo();
                }, 2000);
            } else {
                console.error('❌ CustomRegistrationPageManager: Registration failed:', result.error);
                this.notificationManager.error(result.error || 'Error al procesar la inscripción');
            }
        } catch (error) {
            console.error('❌ CustomRegistrationPageManager: Registration error:', error);
            this.notificationManager.error('Error inesperado al procesar la inscripción');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    updateAuthUI() {
        if (!this.currentUser) return;
        this.updateElement('user-name-header', this.currentUser.getFullName());
        this.updateElement('user-initials', this.currentUser.getInitials());
        document.body.classList.add('authenticated');
    }

    setInputValue(id, value) {
        const input = document.getElementById(id);
        if (input) {
            input.value = value || '';
        }
    }

    setButtonLoading(button, loading) {
        if (!button) return;
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
            if (btnText) btnText.style.opacity = '0';
            if (btnLoader) btnLoader.style.display = 'block';
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            if (btnText) btnText.style.opacity = '1';
            if (btnLoader) btnLoader.style.display = 'none';
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Custom Registration page DOM loaded, initializing...');
    window.customRegistrationPageManager = new CustomRegistrationPageManager();
});