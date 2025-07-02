// Profile Page JavaScript - Sistema completo de perfil de usuario
import { AuthManager } from '../components/AuthManager.js';
import { EventManager } from '../components/EventManager.js';
import { NotificationManager } from '../components/NotificationManager.js';
import { RegistrationManager } from '../utils/RegistrationManager.js';
import { formatDate } from '../utils/helpers.js';

class ProfilePageManager {
    constructor() {
        this.authManager = new AuthManager();
        this.eventManager = new EventManager();
        this.notificationManager = new NotificationManager();
        this.registrationManager = new RegistrationManager();
        this.currentUser = null;
        this.userRegistrations = [];
        this.activeTab = 'overview';
        
        this.init();
    }

    async init() {
        console.log('🚀 ProfilePageManager: Initializing...');
        
        // Verificar autenticación
        if (!this.authManager.requireAuth()) {
            return;
        }
        
        this.currentUser = this.authManager.getCurrentUser();
        if (!this.currentUser) {
            console.error('❌ ProfilePageManager: No current user found');
            window.location.href = 'login.html';
            return;
        }
        
        console.log('✅ ProfilePageManager: User found:', this.currentUser.getFullName());
        
        // Cargar datos del usuario
        await this.loadUserData();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Actualizar UI
        this.updateProfileUI();
        this.loadTabContent();
        
        console.log('✅ ProfilePageManager: Initialized successfully');
    }

    async loadUserData() {
        console.log('🔄 ProfilePageManager: Loading user data...');
        
        // Cargar registraciones del usuario
        this.userRegistrations = this.registrationManager.getUserRegistrations(this.currentUser.id);
        console.log('📊 ProfilePageManager: User registrations:', this.userRegistrations.length);
    }

    setupEventListeners() {
        // User menu
        this.setupUserMenu();
        
        // Profile tabs
        this.setupProfileTabs();
        
        // Profile forms
        this.setupProfileForms();
        
        // Modal events
        this.setupModalEvents();
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    setupUserMenu() {
        const userMenuTrigger = document.getElementById('user-menu-trigger');
        const userMenuDropdown = document.getElementById('user-menu-dropdown');

        if (userMenuTrigger && userMenuDropdown) {
            userMenuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenuDropdown.classList.toggle('show');
            });

            document.addEventListener('click', () => {
                userMenuDropdown.classList.remove('show');
            });
        }
    }

    setupProfileTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    setupProfileForms() {
        // Personal info form
        const personalInfoForm = document.getElementById('personal-info-form');
        if (personalInfoForm) {
            personalInfoForm.addEventListener('submit', (e) => this.handlePersonalInfoUpdate(e));
        }

        // Password form
        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.handlePasswordChange(e));
        }

        // Edit profile modal form
        const editProfileForm = document.getElementById('edit-profile-form');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (e) => this.handleProfileEdit(e));
        }

        // Notification preferences
        this.setupNotificationPreferences();

        // Edit profile button
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.openEditProfileModal());
        }

        // Delete account button
        const deleteAccountBtn = document.getElementById('delete-account-btn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => this.handleDeleteAccount());
        }
    }

    setupModalEvents() {
        // Edit profile modal
        const editModal = document.getElementById('edit-profile-modal');
        const closeEditModal = document.getElementById('close-edit-modal');
        const cancelEditBtn = document.getElementById('cancel-edit-btn');

        if (closeEditModal) {
            closeEditModal.addEventListener('click', () => this.closeEditProfileModal());
        }

        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => this.closeEditProfileModal());
        }

        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target === editModal) {
                    this.closeEditProfileModal();
                }
            });
        }

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeEditProfileModal();
            }
        });
    }

    setupNotificationPreferences() {
        const emailNotifications = document.getElementById('email-notifications');
        const eventReminders = document.getElementById('event-reminders');
        const newsletter = document.getElementById('newsletter');

        [emailNotifications, eventReminders, newsletter].forEach(checkbox => {
            if (checkbox) {
                checkbox.addEventListener('change', () => this.updateNotificationPreferences());
            }
        });
    }

    updateProfileUI() {
        console.log('🔄 ProfilePageManager: Updating profile UI...');
        
        // Update header user info
        this.updateElement('user-name-header', this.currentUser.getFullName());
        this.updateElement('user-initials', this.currentUser.getInitials());

        // Update profile header
        this.updateElement('profile-name', this.currentUser.getFullName());
        this.updateElement('profile-email', this.currentUser.email);
        this.updateElement('profile-initials', this.currentUser.getInitials());

        // Update profile avatar
        const profileAvatar = document.getElementById('profile-avatar');
        if (profileAvatar) {
            profileAvatar.querySelector('span').textContent = this.currentUser.getInitials();
        }

        // Update stats
        this.updateProfileStats();

        // Update form fields
        this.populateFormFields();
    }

    updateProfileStats() {
        const registeredCount = this.userRegistrations.length;
        const attendedCount = 0; // This would come from an attendance system
        const memberSince = new Date(this.currentUser.createdAt).getFullYear();

        this.updateElement('events-registered', registeredCount);
        this.updateElement('events-attended', attendedCount);
        this.updateElement('member-since', memberSince);
    }

    populateFormFields() {
        // Personal info form
        this.setInputValue('edit-firstName', this.currentUser.firstName);
        this.setInputValue('edit-lastName', this.currentUser.lastName);
        this.setInputValue('edit-email', this.currentUser.email);
        this.setInputValue('edit-phone', this.currentUser.phone || '');

        // Modal form
        this.setInputValue('modal-firstName', this.currentUser.firstName);
        this.setInputValue('modal-lastName', this.currentUser.lastName);
        this.setInputValue('modal-email', this.currentUser.email);
        this.setInputValue('modal-phone', this.currentUser.phone || '');

        // Notification preferences
        const preferences = this.currentUser.preferences || {};
        this.setCheckboxValue('email-notifications', preferences.emailNotifications !== false);
        this.setCheckboxValue('event-reminders', preferences.eventReminders !== false);
        this.setCheckboxValue('newsletter', preferences.newsletter !== false);
    }

    switchTab(tab) {
        console.log('🔄 ProfilePageManager: Switching to tab:', tab);
        
        this.activeTab = tab;

        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tab);
        });

        // Update tab content
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tab}-content`);
        });

        // Load tab-specific content
        this.loadTabContent();
    }

    loadTabContent() {
        switch (this.activeTab) {
            case 'overview':
                this.loadOverviewContent();
                break;
            case 'events':
                this.loadEventsContent();
                break;
            case 'settings':
                // Settings content is already loaded
                break;
        }
    }

    loadOverviewContent() {
        console.log('🔄 ProfilePageManager: Loading overview content...');
        
        // Load upcoming events
        this.loadUpcomingEvents();
        
        // Load recent activity
        this.loadRecentActivity();
        
        // Load favorite categories
        this.loadFavoriteCategories();
    }

    loadUpcomingEvents() {
        const container = document.getElementById('upcoming-events-profile');
        if (!container) return;

        const allEvents = this.eventManager.getAllEvents();
        const userEvents = allEvents.filter(event => 
            this.userRegistrations.includes(event.id) && 
            new Date(event.date) > new Date()
        ).slice(0, 5);

        if (userEvents.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <h4>No tienes eventos próximos</h4>
                    <p>Explora eventos disponibles para inscribirte</p>
                </div>
            `;
            return;
        }

        container.innerHTML = userEvents.map(event => `
            <div class="upcoming-event-item">
                <div class="upcoming-event-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                </div>
                <div class="upcoming-event-info">
                    <div class="upcoming-event-name">${event.name}</div>
                    <div class="upcoming-event-date">${formatDate(event.date, { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</div>
                </div>
            </div>
        `).join('');
    }

    loadRecentActivity() {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        // Mock recent activity data
        const activities = [
            {
                type: 'registration',
                text: 'Te inscribiste en "Conferencia de Tecnología 2025"',
                time: '2 horas'
            },
            {
                type: 'update',
                text: 'Actualizaste tu información de perfil',
                time: '1 día'
            },
            {
                type: 'registration',
                text: 'Te inscribiste en "Workshop de Fotografía Digital"',
                time: '3 días'
            }
        ];

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        ${activity.type === 'registration' ? 
                            '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>' :
                            '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'
                        }
                    </svg>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">Hace ${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    loadFavoriteCategories() {
        const container = document.getElementById('favorite-categories');
        if (!container) return;

        // Calculate favorite categories based on user registrations
        const allEvents = this.eventManager.getAllEvents();
        const userEvents = allEvents.filter(event => this.userRegistrations.includes(event.id));
        
        const categoryCount = {};
        userEvents.forEach(event => {
            categoryCount[event.category] = (categoryCount[event.category] || 0) + 1;
        });

        const sortedCategories = Object.entries(categoryCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        if (sortedCategories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                        <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                    <h4>No hay categorías favoritas</h4>
                    <p>Inscríbete en eventos para ver tus categorías favoritas</p>
                </div>
            `;
            return;
        }

        container.innerHTML = sortedCategories.map(([category, count]) => `
            <span class="category-tag">${category} (${count})</span>
        `).join('');
    }

    loadEventsContent() {
        console.log('🔄 ProfilePageManager: Loading events content...');
        
        const container = document.getElementById('user-events-grid');
        if (!container) return;

        const allEvents = this.eventManager.getAllEvents();
        const userEvents = allEvents.filter(event => this.userRegistrations.includes(event.id));

        if (userEvents.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <h4>No tienes eventos registrados</h4>
                    <p>Explora los eventos disponibles y regístrate en los que te interesen</p>
                    <a href="index.html" class="btn btn-primary">Ver eventos disponibles</a>
                </div>
            `;
            return;
        }

        container.innerHTML = userEvents.map(event => this.createEventCard(event)).join('');
    }

    createEventCard(event) {
        const isPast = new Date(event.date) <= new Date();
        const progressPercentage = (event.registered / event.capacity) * 100;

        return `
            <article class="event-card">
                <div class="event-image-container">
                    <img src="${event.image}" alt="${event.name}" class="event-image" loading="lazy">
                    <div class="event-badges">
                        <span class="badge badge-category">${event.category}</span>
                        <span class="badge badge-registered">✓ Inscrito</span>
                    </div>
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.name}</h3>
                    <p class="event-description">${event.description}</p>
                    <div class="event-details">
                        <div class="event-detail event-detail-date">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            ${formatDate(event.date)}
                        </div>
                        <div class="event-detail event-detail-location">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            ${event.location}
                        </div>
                    </div>
                    <div class="event-meta">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                    </div>
                    <div class="event-actions">
                        <a href="index.html" class="btn btn-primary">Ver en eventos</a>
                        ${!isPast ? `
                            <button class="btn btn-danger" onclick="this.unregisterFromEvent('${event.id}')">
                                Cancelar inscripción
                            </button>
                        ` : ''}
                    </div>
                </div>
            </article>
        `;
    }

    // Form handlers
    async handlePersonalInfoUpdate(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const updates = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone')
        };

        console.log('🔄 ProfilePageManager: Updating personal info...');
        
        const result = this.authManager.updateUser(this.currentUser.id, updates);
        
        if (result.success) {
            this.currentUser = { ...this.currentUser, ...updates };
            this.updateProfileUI();
            this.notificationManager.success('Información personal actualizada exitosamente');
        } else {
            this.notificationManager.error(result.error);
        }
    }

    async handlePasswordChange(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmNewPassword = formData.get('confirmNewPassword');

        if (newPassword !== confirmNewPassword) {
            this.notificationManager.error('Las contraseñas no coinciden');
            return;
        }

        console.log('🔄 ProfilePageManager: Changing password...');
        
        const result = this.authManager.changePassword(this.currentUser.id, currentPassword, newPassword);
        
        if (result.success) {
            this.notificationManager.success('Contraseña cambiada exitosamente');
            e.target.reset();
        } else {
            this.notificationManager.error(result.error);
        }
    }

    async handleProfileEdit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const updates = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone')
        };

        console.log('🔄 ProfilePageManager: Updating profile via modal...');
        
        const result = this.authManager.updateUser(this.currentUser.id, updates);
        
        if (result.success) {
            this.currentUser = { ...this.currentUser, ...updates };
            this.updateProfileUI();
            this.closeEditProfileModal();
            this.notificationManager.success('Perfil actualizado exitosamente');
        } else {
            this.notificationManager.error(result.error);
        }
    }

    updateNotificationPreferences() {
        const preferences = {
            emailNotifications: document.getElementById('email-notifications')?.checked || false,
            eventReminders: document.getElementById('event-reminders')?.checked || false,
            newsletter: document.getElementById('newsletter')?.checked || false
        };

        console.log('🔄 ProfilePageManager: Updating notification preferences...');
        
        const updates = { preferences: { ...this.currentUser.preferences, ...preferences } };
        const result = this.authManager.updateUser(this.currentUser.id, updates);
        
        if (result.success) {
            this.currentUser.preferences = updates.preferences;
            this.notificationManager.success('Preferencias de notificación actualizadas');
        } else {
            this.notificationManager.error('Error al actualizar las preferencias');
        }
    }

    handleDeleteAccount() {
        if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            console.log('🔄 ProfilePageManager: Deleting account...');
            
            const result = this.authManager.deleteUser(this.currentUser.id);
            
            if (result.success) {
                this.notificationManager.success('Cuenta eliminada exitosamente');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                this.notificationManager.error('Error al eliminar la cuenta');
            }
        }
    }

    // Modal methods
    openEditProfileModal() {
        const modal = document.getElementById('edit-profile-modal');
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeEditProfileModal() {
        const modal = document.getElementById('edit-profile-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
    }

    handleLogout() {
        this.authManager.logout();
        this.notificationManager.info('Sesión cerrada exitosamente');
    }

    // Utility methods
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    setInputValue(id, value) {
        const input = document.getElementById(id);
        if (input) {
            input.value = value || '';
        }
    }

    setCheckboxValue(id, checked) {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = checked;
        }
    }

    unregisterFromEvent(eventId) {
        console.log('🔄 ProfilePageManager: Unregistering from event:', eventId);
        
        const success = this.registrationManager.removeRegistration(this.currentUser.id, eventId);
        
        if (success) {
            // Update local registrations
            const index = this.userRegistrations.indexOf(eventId);
            if (index > -1) {
                this.userRegistrations.splice(index, 1);
            }
            
            this.notificationManager.success('Te has desinscrito del evento exitosamente');
            
            // Reload content
            this.updateProfileStats();
            this.loadTabContent();
        } else {
            this.notificationManager.error('Error al desinscribirse del evento');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Profile page DOM loaded, initializing...');
    window.profilePageManager = new ProfilePageManager();
});

// Make unregister method globally available
window.unregisterFromEvent = (eventId) => {
    if (window.profilePageManager) {
        window.profilePageManager.unregisterFromEvent(eventId);
    }
};