export class IManager {
    constructor() {
        if (this.constructor === IManager) {
            throw new Error('IManager es una interfaz y no puede ser instanciada directamente');
        }
        
        this.isInitialized = false;
        this.name = this.constructor.name;
    }

    async initialize() {
        throw new Error(`${this.name} debe implementar el método initialize()`);
    }

    getStatus() {
        return {
            name: this.name,
            initialized: this.isInitialized,
            timestamp: new Date().toISOString()
        };
    }

    validate(data) {
        throw new Error(`${this.name} debe implementar el método validate()`);
    }

    cleanup() {
        console.log(`🧹 ${this.name}: Limpiando recursos...`);
        this.isInitialized = false;
    }

    debug() {
        return {
            name: this.name,
            initialized: this.isInitialized,
            methods: Object.getOwnPropertyNames(Object.getPrototypeOf(this))
                .filter(name => name !== 'constructor' && typeof this[name] === 'function')
        };
    }
}

export class IDataManager extends IManager {
    constructor() {
        super();
        this.data = new Map();
    }

    async loadData() {
        throw new Error(`${this.name} debe implementar el método loadData()`);
    }

    async saveData() {
        throw new Error(`${this.name} debe implementar el método saveData()`);
    }

    getById(id) {
        return this.data.get(id);
    }

    getAll() {
        return Array.from(this.data.values());
    }

    add(id, item) {
        this.data.set(id, item);
    }

    remove(id) {
        return this.data.delete(id);
    }

    exists(id) {
        return this.data.has(id);
    }

    count() {
        return this.data.size;
    }

    clear() {
        this.data.clear();
    }

    filter(predicate) {
        return this.getAll().filter(predicate);
    }

    find(predicate) {
        return this.getAll().find(predicate);
    }
}

export class IUIManager extends IManager {
    constructor() {
        super();
        this.elements = new Map();
        this.eventListeners = new Map();
    }

    render() {
        throw new Error(`${this.name} debe implementar el método render()`);
    }

    update() {
        throw new Error(`${this.name} debe implementar el método update()`);
    }

    registerElement(key, element) {
        this.elements.set(key, element);
    }

    getElement(key) {
        return this.elements.get(key);
    }

    addEventListener(key, element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.set(key, { element, event, handler });
    }

    removeEventListener(key) {
        const listener = this.eventListeners.get(key);
        if (listener) {
            listener.element.removeEventListener(listener.event, listener.handler);
            this.eventListeners.delete(key);
        }
    }

    cleanup() {
        super.cleanup();
        for (const [key] of this.eventListeners) {
            this.removeEventListener(key);
        }
        this.elements.clear();
    }
}