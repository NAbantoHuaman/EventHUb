// User Class - Enhanced
import { generateId } from '../utils/helpers.js';

export class User {
    constructor(userData) {
        this.id = userData.id || generateId('user');
        this.firstName = userData.firstName;
        this.lastName = userData.lastName;
        this.email = userData.email;
        this.phone = userData.phone || '';
        this.password = userData.password;
        this.createdAt = userData.createdAt || new Date().toISOString();
        this.lastLogin = userData.lastLogin || null;
        this.isActive = userData.isActive !== undefined ? userData.isActive : true;
        this.preferences = userData.preferences || {
            emailNotifications: true,
            eventReminders: true,
            newsletter: true
        };
        this.avatar = userData.avatar || null;
        this.role = userData.role || 'user';
        
        // 🟡 Aún se pueden usar para compatibilidad (hasta implementar RegistrationManager)
        this.eventsRegistered = userData.eventsRegistered || []; 
    }

    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    getInitials() {
        return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
    }

    updateLastLogin() {
        this.lastLogin = new Date().toISOString();
    }

    updatePreferences(newPreferences) {
        this.preferences = { ...this.preferences, ...newPreferences };
    }

    registerEvent(eventId) {
        if (!this.eventsRegistered.includes(eventId)) {
            this.eventsRegistered.push(eventId);
        }
    }

    unregisterEvent(eventId) {
        this.eventsRegistered = this.eventsRegistered.filter(id => id !== eventId);
    }

    getMembershipDuration() {
        const createdDate = new Date(this.createdAt);
        const now = new Date();
        const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

        if (diffDays < 30) return `${diffDays} día${diffDays === 1 ? '' : 's'}`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} mes(es)`;
        return `${Math.floor(diffDays / 365)} año(s)`;
    }

    isNewUser() {
        const diffDays = (new Date() - new Date(this.createdAt)) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
    }

    getActivityLevel() {
        const count = this.eventsRegistered?.length || 0;
        if (count === 0) return 'Inactivo';
        if (count < 3) return 'Bajo';
        if (count < 6) return 'Moderado';
        return 'Alto';
    }

    canReceiveNotifications() {
        return this.preferences.emailNotifications && this.isActive;
    }

    canReceiveReminders() {
        return this.preferences.eventReminders && this.isActive;
    }

    canReceiveNewsletter() {
        return this.preferences.newsletter && this.isActive;
    }

    toJSON() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phone: this.phone,
            password: this.password,
            createdAt: this.createdAt,
            lastLogin: this.lastLogin,
            isActive: this.isActive,
            preferences: this.preferences,
            avatar: this.avatar,
            role: this.role,
            eventsRegistered: this.eventsRegistered
        };
    }

    toPublicJSON() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            initials: this.getInitials(),
            fullName: this.getFullName(),
            avatar: this.avatar,
            activityLevel: this.getActivityLevel(),
            memberSince: new Date(this.createdAt).getFullYear(),
            isNewUser: this.isNewUser()
        };
    }

    static fromJSON(data) {
        return new User(data);
    }

    // Validation
    static validateUserData(userData) {
        const errors = [];

        if (!userData.firstName || userData.firstName.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }

        if (!userData.lastName || userData.lastName.trim().length < 2) {
            errors.push('El apellido debe tener al menos 2 caracteres');
        }

        if (!userData.email || !this.isValidEmail(userData.email)) {
            errors.push('El correo electrónico no es válido');
        }

        if (!userData.password || userData.password.length < 8) {
            errors.push('La contraseña debe tener al menos 8 caracteres');
        }

        if (userData.phone && !this.isValidPhone(userData.phone)) {
            errors.push('El número de teléfono no es válido');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    static searchUsers(users, query) {
        const searchTerm = query.toLowerCase();
        return users.filter(user =>
            user.firstName.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
    }

    static filterUsersByActivity(users, activityLevel) {
        return users.filter(user => user.getActivityLevel() === activityLevel);
    }

    static sortUsers(users, sortBy = 'name', order = 'asc') {
        return users.sort((a, b) => {
            let aValue, bValue;
            switch (sortBy) {
                case 'name':
                    aValue = a.getFullName().toLowerCase();
                    bValue = b.getFullName().toLowerCase();
                    break;
                case 'email':
                    aValue = a.email.toLowerCase();
                    bValue = b.email.toLowerCase();
                    break;
                case 'created':
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                case 'lastLogin':
                    aValue = a.lastLogin ? new Date(a.lastLogin) : new Date(0);
                    bValue = b.lastLogin ? new Date(b.lastLogin) : new Date(0);
                    break;
                default:
                    aValue = a.getFullName().toLowerCase();
                    bValue = b.getFullName().toLowerCase();
            }

            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }
}
