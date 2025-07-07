import { IManager, IDataManager } from '../interfaces/IManager.js';

export class BaseManager extends IManager {
    constructor(name) {
        super();
        this.name = name || this.constructor.name;
        this.dependencies = new Set();
        this.initializationPromise = null;
    }

    async initialize() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this._doInitialize();
        return this.initializationPromise;
    }

    async _doInitialize() {
        if (this.isInitialized) {
            return;
        }

        console.log(`🚀 ${this.name}: Inicializando...`);
        
        try {
            await this.validateDependencies();
            await this.setup();
            if (this.loadData && typeof this.loadData === 'function') {
                await this.loadData();
            }
            await this.postInitialize();
            
            this.isInitialized = true;
            console.log(`✅ ${this.name}: Inicializado exitosamente`);
        } catch (error) {
            console.error(`❌ ${this.name}: Error durante la inicialización:`, error);
            throw error;
        }
    }

    async validateDependencies() {
    }

    async setup() {
    }

    async postInitialize() {
    }

    addDependency(dependencyName) {
        this.dependencies.add(dependencyName);
    }

    hasDependency(dependencyName) {
        return this.dependencies.has(dependencyName);
    }

    getDependencies() {
        return Array.from(this.dependencies);
    }

    validate(data) {
        return data !== null && data !== undefined;
    }

    getStatus() {
        return {
            ...super.getStatus(),
            dependencies: this.getDependencies(),
            hasData: this.data ? this.data.size : 0
        };
    }

    async restart() {
        console.log(`🔄 ${this.name}: Reiniciando...`);
        this.cleanup();
        this.initializationPromise = null;
        await this.initialize();
    }

    cleanup() {
        super.cleanup();
        this.initializationPromise = null;
    }
}

export class BaseDataManager extends BaseManager {
    constructor(name, storageKey) {
        super(name);
        this.storageKey = storageKey;
        this.data = new Map();
        this.cache = new Map();
        this.isDirty = false;
    }

    async loadData() {
        throw new Error(`${this.name} debe implementar el método loadData()`);
    }

    async saveData() {
        throw new Error(`${this.name} debe implementar el método saveData()`);
    }

    getById(id) {
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }
        
        const item = this.data.get(id);
        if (item) {
            this.cache.set(id, item);
        }
        return item;
    }

    getAll() {
        return Array.from(this.data.values());
    }

    add(id, item) {
        if (!this.validate(item)) {
            throw new Error(`${this.name}: Datos inválidos para agregar`);
        }
        
        this.data.set(id, item);
        this.cache.set(id, item);
        this.isDirty = true;
        this.onDataChanged('add', id, item);
    }

    update(id, item) {
        if (!this.exists(id)) {
            throw new Error(`${this.name}: Elemento con ID ${id} no existe`);
        }
        
        if (!this.validate(item)) {
            throw new Error(`${this.name}: Datos inválidos para actualizar`);
        }
        
        const oldItem = this.data.get(id);
        this.data.set(id, item);
        this.cache.set(id, item);
        this.isDirty = true;
        this.onDataChanged('update', id, item, oldItem);
    }

    remove(id) {
        const item = this.data.get(id);
        const removed = this.data.delete(id);
        if (removed) {
            this.cache.delete(id);
            this.isDirty = true;
            this.onDataChanged('remove', id, null, item);
        }
        return removed;
    }

    exists(id) {
        return this.data.has(id);
    }

    count() {
        return this.data.size;
    }

    clear() {
        const oldSize = this.data.size;
        this.data.clear();
        this.cache.clear();
        if (oldSize > 0) {
            this.isDirty = true;
            this.onDataChanged('clear');
        }
    }

    filter(predicate) {
        return this.getAll().filter(predicate);
    }

    find(predicate) {
        return this.getAll().find(predicate);
    }

    clearCache() {
        this.cache.clear();
        console.log(`🧹 ${this.name}: Caché limpiada`);
    }

    async autoSave() {
        if (this.isDirty) {
            await this.saveData();
            this.isDirty = false;
        }
    }

    onDataChanged(operation, id, newItem, oldItem) {
        console.log(`📊 ${this.name}: Datos cambiados - ${operation}`, { id, newItem, oldItem });
    }

    getDataStats() {
        return {
            totalItems: this.count(),
            cacheSize: this.cache.size,
            isDirty: this.isDirty,
            storageKey: this.storageKey
        };
    }

    cleanup() {
        super.cleanup();
        this.clear();
        this.clearCache();
        this.isDirty = false;
    }
}