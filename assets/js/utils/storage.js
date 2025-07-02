// Utilidades para Local Storage
import { STORAGE_KEYS } from './constants.js';

// --- Gestor general de almacenamiento ---
export class StorageManager {
    // Obtiene un valor del almacenamiento local
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`❌ Error al obtener ${key}:`, error);
            return defaultValue;
        }
    }

    // Guarda un valor en el almacenamiento local
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

    // Elimina un valor del almacenamiento local
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`❌ Error al eliminar ${key}:`, error);
            return false;
        }
    }

    // Limpia todo el almacenamiento local
    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('❌ Error al limpiar el almacenamiento', error);
            return false;
        }
    }

    // Verifica si existe una clave en el almacenamiento local
    static exists(key) {
        return localStorage.getItem(key) !== null;
    }
}

// --- Almacenamiento de usuarios ---
export class UserStorage {
    // Obtiene todos los usuarios
    static getUsers() {
        return StorageManager.get(STORAGE_KEYS.users, []);
    }

    // Guarda la lista de usuarios
    static setUsers(users) {
        return StorageManager.set(STORAGE_KEYS.users, users);
    }

    // Agrega un usuario
    static addUser(user) {
        user.eventsRegistered = user.eventsRegistered || []; // Asegura campo
        const users = this.getUsers();
        users.push(user);
        return this.setUsers(users);
    }

    // Actualiza un usuario por ID
    static updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            return this.setUsers(users);
        }
        return false;
    }

    // Elimina un usuario por ID
    static removeUser(userId) {
        const users = this.getUsers().filter(u => u.id !== userId);
        return this.setUsers(users);
    }

    // Obtiene un usuario por ID
    static getUserById(userId) {
        return this.getUsers().find(u => u.id === userId);
    }

    // Busca un usuario por email
    static findUser(email) {
        return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    // Elimina todos los usuarios
    static clearAllUsers() {
        return StorageManager.remove(STORAGE_KEYS.users);
    }

    // Registra un evento para un usuario
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

    // Elimina la inscripción de un evento para un usuario
    static unregisterEvent(userId, eventId) {
        const user = this.getUserById(userId);
        if (!user || !user.eventsRegistered) return false;
        user.eventsRegistered = user.eventsRegistered.filter(id => id !== eventId);
        return this.updateUser(userId, user);
    }

    // Verifica si un usuario está inscrito en un evento
    static isUserRegistered(userId, eventId) {
        const user = this.getUserById(userId);
        return user?.eventsRegistered?.includes(eventId) || false;
    }

    // Obtiene los eventos en los que está inscrito un usuario
    static getRegisteredEvents(userId) {
        const user = this.getUserById(userId);
        return user?.eventsRegistered || [];
    }
}

// --- Almacenamiento de sesión ---
export class SessionStorage {
    // Obtiene la sesión actual
    static getSession() {
        return StorageManager.get(STORAGE_KEYS.session, null);
    }

    // Guarda la sesión
    static setSession(session) {
        return StorageManager.set(STORAGE_KEYS.session, session);
    }

    // Elimina la sesión
    static clearSession() {
        return StorageManager.remove(STORAGE_KEYS.session);
    }

    // Verifica si la sesión es válida (por tiempo)
    static isSessionValid(timeout = 24 * 60 * 60 * 1000) {
        const session = this.getSession();
        if (!session || !session.timestamp) return false;
        return Date.now() - session.timestamp < timeout;
    }

    // Extiende la sesión actualizando el timestamp
    static extendSession() {
        const session = this.getSession();
        if (session) {
            session.timestamp = Date.now();
            return this.setSession(session);
        }
        return false;
    }
}

// --- Almacenamiento de preferencias ---
export class PreferencesStorage {
    // Obtiene las preferencias del usuario
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

    // Guarda las preferencias
    static setPreferences(preferences) {
        return StorageManager.set(STORAGE_KEYS.preferences, preferences);
    }

    // Actualiza una preferencia específica
    static updatePreference(key, value) {
        const preferences = this.getPreferences();
        preferences[key] = value;
        return this.setPreferences(preferences);
    }

    // Obtiene una preferencia específica
    static getPreference(key, defaultValue = null) {
        const preferences = this.getPreferences();
        return preferences[key] !== undefined ? preferences[key] : defaultValue;
    }
}
