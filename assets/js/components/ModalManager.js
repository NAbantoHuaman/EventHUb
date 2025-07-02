// Modal Manager Component - Redesigned
import { formatDate, formatPrice } from '../utils/helpers.js';

export class ModalManager {
    constructor() {
        this.activeModal = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardNavigation();
    }

    setupEventListeners() {
        // Close modal buttons
        const closeButtons = document.querySelectorAll('[id^="close-"], [id$="-close-btn"]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.closeActiveModal());
        });

        // Modal overlay clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeActiveModal();
            }
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeActiveModal();
            }
        });
    }

    openEventModal(event, isRegistered = false, authManager = null) {
        const modal = document.getElementById('event-modal');
        if (!modal || !event) return;

        this.populateEventModal(event, isRegistered, authManager);
        this.openModal('event-modal');
    }

    populateEventModal(event, isRegistered, authManager) {
        // Update modal content
        this.updateModalElement('modal-title', event.name);
        this.updateModalElement('modal-description', event.description);
        this.updateModalElement('modal-category', event.category);
        this.updateModalElement('modal-date', formatDate(event.date));
        this.updateModalElement('modal-location', event.location);
        this.updateModalElement('modal-organizer', event.organizer);
        this.updateModalElement('modal-price', formatPrice(event.price));

        // Update image
        const modalImage = document.getElementById('modal-image');
        if (modalImage) {
            modalImage.src = event.image;
            modalImage.alt = event.name;
        }

        // Update capacity info
        const capacityElement = document.getElementById('modal-capacity');
        const progressElement = document.getElementById('modal-progress');
        
        if (capacityElement) {
            capacityElement.textContent = `${event.registered}/${event.capacity} inscritos`;
        }
        
        if (progressElement) {
            const progressPercentage = (event.registered / event.capacity) * 100;
            progressElement.style.width = `${progressPercentage}%`;
        }

        // Update registration badge
        const registeredBadge = document.getElementById('modal-registered');
        if (registeredBadge) {
            registeredBadge.style.display = isRegistered ? 'inline-block' : 'none';
        }

        // Update action button
        this.updateActionButton(event, isRegistered, authManager);

        // Update alerts
        this.updateModalAlerts(event, isRegistered);
    }

    updateActionButton(event, isRegistered, authManager) {
        const actionBtn = document.getElementById('modal-action-btn');
        if (!actionBtn) return;

        const isPast = new Date(event.date) <= new Date();
        const isFull = event.registered >= event.capacity;
        const isAuthenticated = authManager && authManager.isAuthenticated();

        if (isPast) {
            actionBtn.textContent = 'Evento finalizado';
            actionBtn.className = 'btn btn-secondary';
            actionBtn.disabled = true;
            actionBtn.onclick = null;
        } else if (isFull) {
            actionBtn.textContent = 'Evento lleno';
            actionBtn.className = 'btn btn-secondary';
            actionBtn.disabled = true;
            actionBtn.onclick = null;
        } else if (isRegistered) {
            actionBtn.textContent = 'Cancelar inscripción';
            actionBtn.className = 'btn btn-danger';
            actionBtn.disabled = false;
            actionBtn.onclick = () => this.handleUnregister(event.id, authManager);
        } else if (!isAuthenticated) {
            actionBtn.textContent = 'Iniciar sesión para inscribirse';
            actionBtn.className = 'btn btn-primary';
            actionBtn.disabled = false;
            actionBtn.onclick = () => window.location.href = 'login.html';
        } else {
            actionBtn.textContent = 'Inscribirse al evento';
            actionBtn.className = 'btn btn-primary';
            actionBtn.disabled = false;
            actionBtn.onclick = () => this.handleRegister(event.id, authManager);
        }
    }

    updateModalAlerts(event, isRegistered) {
        const alertsContainer = document.getElementById('modal-alerts');
        if (!alertsContainer) return;

        let alerts = [];
        const isPast = new Date(event.date) <= new Date();
        const isFull = event.registered >= event.capacity;
        const spotsLeft = event.capacity - event.registered;

        if (isPast) {
            alerts.push({
                type: 'info',
                message: 'Este evento ya ha finalizado.'
            });
        } else if (isFull) {
            alerts.push({
                type: 'warning',
                message: 'Este evento ha alcanzado su capacidad máxima.'
            });
        } else if (spotsLeft <= 10) {
            alerts.push({
                type: 'warning',
                message: `¡Últimos ${spotsLeft} cupos disponibles!`
            });
        }

        if (isRegistered && !isPast) {
            alerts.push({
                type: 'success',
                message: 'Ya estás inscrito en este evento.'
            });
        }

        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="status-alert alert-${alert.type}">
                ${alert.message}
            </div>
        `).join('');
    }

    handleRegister(eventId, authManager) {
        if (!authManager || !authManager.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // Emit registration event
        const event = new CustomEvent('registerForEvent', {
            detail: { eventId }
        });
        document.dispatchEvent(event);
    }

    handleUnregister(eventId, authManager) {
        if (!authManager || !authManager.isAuthenticated()) {
            return;
        }

        // Emit unregistration event
        const event = new CustomEvent('unregisterFromEvent', {
            detail: { eventId }
        });
        document.dispatchEvent(event);
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        this.activeModal = modalId;
        modal.classList.add('show');
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus management
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100);
        }

        // Add backdrop blur
        modal.classList.add('modal-backdrop');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('show');
        modal.classList.remove('modal-backdrop');
        
        setTimeout(() => {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }, 300);

        // Restore body scroll
        document.body.style.overflow = '';
        
        if (this.activeModal === modalId) {
            this.activeModal = null;
        }
    }

    closeActiveModal() {
        if (this.activeModal) {
            this.closeModal(this.activeModal);
        }
    }

    updateModalElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    // Animation helpers
    animateModalEntry(modal) {
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.style.transform = 'scale(0.9) translateY(-20px)';
            content.style.opacity = '0';
            
            setTimeout(() => {
                content.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                content.style.transform = 'scale(1) translateY(0)';
                content.style.opacity = '1';
            }, 10);
        }
    }

    animateModalExit(modal) {
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.style.transition = 'all 0.2s ease-out';
            content.style.transform = 'scale(0.95) translateY(-10px)';
            content.style.opacity = '0';
        }
    }
}