// Local Storage Utilities
import { STORAGE_KEYS } from './constants.js';

export class StorageManager {
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`❌ Error getting ${key}:`, error);
            return defaultValue;
        }
    }

    static set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error(`❌ Error setting ${key}:`, error);
            return false;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`❌ Error removing ${key}:`, error);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('❌ Error clearing storage', error);
            return false;
        }
    }

    static exists(key) {
        return localStorage.getItem(key) !== null;
    }
}

// --- User Storage ---
export class UserStorage {
    static getUsers() {
        return StorageManager.get(STORAGE_KEYS.users, []);
    }

    static setUsers(users) {
        return StorageManager.set(STORAGE_KEYS.users, users);
    }

    static addUser(user) {
        user.eventsRegistered = user.eventsRegistered || []; // Asegura campo
        const users = this.getUsers();
        users.push(user);
        return this.setUsers(users);
    }

    static updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            return this.setUsers(users);
        }
        return false;
    }

    static removeUser(userId) {
        const users = this.getUsers().filter(u => u.id !== userId);
        return this.setUsers(users);
    }

    static getUserById(userId) {
        return this.getUsers().find(u => u.id === userId);
    }

    static findUser(email) {
        return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    static clearAllUsers() {
        return StorageManager.remove(STORAGE_KEYS.users);
    }

    // 🔄 Registro de eventos (nuevo)
    static registerEvent(userId, eventId) {
        const user = this.getUserById(userId);
        if (!user) return false;
        user.eventsRegistered = user.eventsRegistered || [];
        if (!user.eventsRegistered.includes(eventId)) {
            user.eventsRegistered.push(eventId);
            return this.updateUser(userId, user);
        }
        return false;
    }

    static unregisterEvent(userId, eventId) {
        const user = this.getUserById(userId);
        if (!user || !user.eventsRegistered) return false;
        user.eventsRegistered = user.eventsRegistered.filter(id => id !== eventId);
        return this.updateUser(userId, user);
    }

    static isUserRegistered(userId, eventId) {
        const user = this.getUserById(userId);
        return user?.eventsRegistered?.includes(eventId) || false;
    }

    static getRegisteredEvents(userId) {
        const user = this.getUserById(userId);
        return user?.eventsRegistered || [];
    }
}

// --- Session Storage ---
export class SessionStorage {
    static getSession() {
        return StorageManager.get(STORAGE_KEYS.session, null);
    }

    static setSession(session) {
        return StorageManager.set(STORAGE_KEYS.session, session);
    }

    static clearSession() {
        return StorageManager.remove(STORAGE_KEYS.session);
    }

    static isSessionValid(timeout = 24 * 60 * 60 * 1000) {
        const session = this.getSession();
        if (!session || !session.timestamp) return false;
        return Date.now() - session.timestamp < timeout;
    }

    static extendSession() {
        const session = this.getSession();
        if (session) {
            session.timestamp = Date.now();
            return this.setSession(session);
        }
        return false;
    }
}

// --- Preferences Storage ---
export class PreferencesStorage {
    static getPreferences() {
        return StorageManager.get(STORAGE_KEYS.preferences, {
            theme: 'light',
            language: 'es',
            notifications: true,
            emailNotifications: true,
            eventReminders: true,
            newsletter: true
        });
    }

    static setPreferences(preferences) {
        return StorageManager.set(STORAGE_KEYS.preferences, preferences);
    }

    static updatePreference(key, value) {
        const preferences = this.getPreferences();
        preferences[key] = value;
        return this.setPreferences(preferences);
    }

    static getPreference(key, defaultValue = null) {
        const preferences = this.getPreferences();
        return preferences[key] !== undefined ? preferences[key] : defaultValue;
    }
}
