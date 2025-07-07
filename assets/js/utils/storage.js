import { STORAGE_KEYS } from './constants.js';
export class StorageManager {
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`❌ Error al obtener ${key}:`, error);
            return defaultValue;
        }
    }
    static set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error(`❌ Error al guardar ${key}:`, error);
            return false;
        }
    }
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`❌ Error al eliminar ${key}:`, error);
            return false;
        }
    }
    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('❌ Error al limpiar el almacenamiento', error);
            return false;
        }
    }
    static exists(key) {
        return localStorage.getItem(key) !== null;
    }
}


export class UserStorage {
    static getUsers() {
        return StorageManager.get(STORAGE_KEYS.users, []);
    }
    static setUsers(users) {
        return StorageManager.set(STORAGE_KEYS.users, users);
    }
    static addUser(user) {
        user.eventsRegistered = user.eventsRegistered || [];
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
}


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
