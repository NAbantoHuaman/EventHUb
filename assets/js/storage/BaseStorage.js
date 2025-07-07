import { IDataManager } from '../interfaces/IManager.js';
export class BaseStorage extends IDataManager {
    constructor(storageKey, storageType = 'localStorage') {
        super();
        this.storageKey = storageKey;
        this.storageType = storageType;
        this.cache = new Map();
        this.isInitialized = false;
    }


    async initialize() {
        if (this.isInitialized) {
            return;
        }

        console.log(`🚀 ${this.constructor.name}: Inicializando storage...`);
        
        try {
            await this.loadData();
            this.isInitialized = true;
            console.log(`✅ ${this.constructor.name}: Storage inicializado`);
        } catch (error) {
            console.error(`❌ ${this.constructor.name}: Error inicializando storage:`, error);
            throw error;
        }
    }


    getStorage() {
        switch (this.storageType) {
            case 'sessionStorage':
                return sessionStorage;
            case 'localStorage':
            default:
                return localStorage;
        }
    }


    async loadData() {
        try {
            const storage = this.getStorage();
            const data = storage.getItem(this.storageKey);
            
            if (data) {
                const parsedData = JSON.parse(data);
                this.cache.clear();
                
                if (Array.isArray(parsedData)) {
                    parsedData.forEach((item, index) => {
                        this.cache.set(item.id || index.toString(), item);
                    });
                } else if (typeof parsedData === 'object') {
                    Object.entries(parsedData).forEach(([key, value]) => {
                        this.cache.set(key, value);
                    });
                }
            }
            
            console.log(`📦 ${this.constructor.name}: ${this.cache.size} elementos cargados`);
        } catch (error) {
            console.error(`❌ ${this.constructor.name}: Error cargando datos:`, error);
            this.cache.clear();
        }
    }


    async saveData() {
        try {
            const storage = this.getStorage();
            const dataToSave = this.prepareDataForSaving();
            storage.setItem(this.storageKey, JSON.stringify(dataToSave));
            console.log(`💾 ${this.constructor.name}: Datos guardados`);
        } catch (error) {
            console.error(`❌ ${this.constructor.name}: Error guardando datos:`, error);
            throw error;
        }
    }


    prepareDataForSaving() {
        return Array.from(this.cache.values());
    }


    getById(id) {
        return this.cache.get(id);
    }


    getAll() {
        return Array.from(this.cache.values());
    }


    add(id, item) {
        if (!this.validate(item)) {
            throw new Error(`${this.constructor.name}: Datos inválidos para agregar`);
        }
        
        this.cache.set(id, item);
        this.saveData();
    }

    /**
     * Actualiza un elemento
     * @override
     * @param {string} id - ID del elemento
     * @param {*} item - Elemento actualizado
     */
    update(id, item) {
        if (!this.exists(id)) {
            throw new Error(`${this.constructor.name}: Elemento con ID ${id} no existe`);
        }
        
        if (!this.validate(item)) {
            throw new Error(`${this.constructor.name}: Datos inválidos para actualizar`);
        }
        
        this.cache.set(id, item);
        this.saveData();
    }

    /**
     * Remueve un elemento
     * @override
     * @param {string} id - ID del elemento
     * @returns {boolean}
     */
    remove(id) {
        const removed = this.cache.delete(id);
        if (removed) {
            this.saveData();
        }
        return removed;
    }

    /**
     * Verifica si existe un elemento
     * @override
     * @param {string} id - ID del elemento
     * @returns {boolean}
     */
    exists(id) {
        return this.cache.has(id);
    }

    /**
     * Obtiene el número de elementos
     * @override
     * @returns {number}
     */
    count() {
        return this.cache.size;
    }

    /**
     * Limpia todos los datos
     * @override
     */
    clear() {
        this.cache.clear();
        const storage = this.getStorage();
        storage.removeItem(this.storageKey);
        console.log(`🧹 ${this.constructor.name}: Datos limpiados`);
    }

    /**
     * Filtra elementos según un criterio
     * @override
     * @param {Function} predicate - Función de filtrado
     * @returns {Array}
     */
    filter(predicate) {
        return this.getAll().filter(predicate);
    }

    /**
     * Busca elementos según un criterio
     * @override
     * @param {Function} predicate - Función de búsqueda
     * @returns {*}
     */
    find(predicate) {
        return this.getAll().find(predicate);
    }

    /**
     * Valida datos de entrada (implementación base)
     * @override
     * @param {*} data - Datos a validar
     * @returns {boolean}
     */
    validate(data) {
        return data !== null && data !== undefined;
    }

    /**
     * Obtiene el estado del storage
     * @override
     * @returns {Object}
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            name: this.constructor.name,
            storageKey: this.storageKey,
            storageType: this.storageType,
            itemCount: this.count(),
            cacheSize: this.cache.size
        };
    }

    /**
     * Limpia recursos del storage
     * @override
     */
    cleanup() {
        this.cache.clear();
        this.isInitialized = false;
        console.log(`🧹 ${this.constructor.name}: Recursos limpiados`);
    }

    /**
     * Método de depuración
     * @override
     * @returns {Object}
     */
    debug() {
        return {
            ...this.getStatus(),
            cacheContents: Array.from(this.cache.entries()),
            storageContents: this.getStorage().getItem(this.storageKey)
        };
    }
}

/**
 * Clase especializada para almacenamiento de usuarios
 */
export class BaseUserStorage extends BaseStorage {
    constructor(storageKey = 'users') {
        super(storageKey);
    }

    /**
     * Valida datos de usuario
     * @override
     * @param {Object} user - Datos del usuario
     * @returns {boolean}
     */
    validate(user) {
        if (!super.validate(user)) return false;
        
        return user.email && 
               user.username && 
               typeof user.email === 'string' && 
               typeof user.username === 'string';
    }

    /**
     * Busca usuario por email
     * @param {string} email - Email del usuario
     * @returns {Object|null}
     */
    findByEmail(email) {
        return this.find(user => user.email === email);
    }

    /**
     * Busca usuario por username
     * @param {string} username - Username del usuario
     * @returns {Object|null}
     */
    findByUsername(username) {
        return this.find(user => user.username === username);
    }

    /**
     * Verifica si un email ya existe
     * @param {string} email - Email a verificar
     * @returns {boolean}
     */
    emailExists(email) {
        return this.findByEmail(email) !== undefined;
    }

    /**
     * Verifica si un username ya existe
     * @param {string} username - Username a verificar
     * @returns {boolean}
     */
    usernameExists(username) {
        return this.findByUsername(username) !== undefined;
    }
}

/**
 * Clase especializada para almacenamiento de sesiones
 */
export class BaseSessionStorage extends BaseStorage {
    constructor(storageKey = 'session', storageType = 'sessionStorage') {
        super(storageKey, storageType);
        this.sessionTimeout = 30 * 60 * 1000;
    }

    /**
     * Valida datos de sesión
     * @override
     * @param {Object} session - Datos de la sesión
     * @returns {boolean}
     */
    validate(session) {
        if (!super.validate(session)) return false;
        
        return session.userId && 
               session.timestamp && 
               typeof session.userId === 'string';
    }

    /**
     * Verifica si la sesión es válida
     * @param {Object} session - Datos de la sesión
     * @returns {boolean}
     */
    isSessionValid(session) {
        if (!this.validate(session)) return false;
        
        const now = Date.now();
        const sessionAge = now - session.timestamp;
        
        return sessionAge < this.sessionTimeout;
    }

    /**
     * Extiende la sesión actual
     * @param {string} sessionId - ID de la sesión
     */
    extendSession(sessionId) {
        const session = this.getById(sessionId);
        if (session) {
            session.timestamp = Date.now();
            this.update(sessionId, session);
        }
    }

    /**
     * Limpia sesiones expiradas
     */
    cleanExpiredSessions() {
        const sessions = this.getAll();
        const expiredSessions = sessions.filter(session => !this.isSessionValid(session));
        
        expiredSessions.forEach(session => {
            this.remove(session.id);
        });
        
        if (expiredSessions.length > 0) {
            console.log(`🧹 ${this.constructor.name}: ${expiredSessions.length} sesiones expiradas eliminadas`);
        }
    }
}