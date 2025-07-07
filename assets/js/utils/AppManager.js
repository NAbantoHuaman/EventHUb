import { AuthManager } from '../components/AuthManager.js';
import { EventManager } from '../components/EventManager.js';
import { NotificationManager } from '../components/NotificationManager.js';
import { ModalManager } from '../components/ModalManager.js';
import { SidebarManager } from '../components/SidebarManager.js';
import { UIManager } from '../components/UIManager.js';
import { RegistrationManager } from './RegistrationManager.js';

export class AppManager {
    constructor() {
        this.isInitialized = false;
        this.managers = {};
        this.initPromise = null;
    }

    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._performInit();
        return this.initPromise;
    }

    async _performInit() {
        if (this.isInitialized) {
            return this.managers;
        }

        console.log('🚀 AppManager: Inicializando aplicación...');

        try {
            this.managers.notification = new NotificationManager();
            this.managers.registration = new RegistrationManager();
            this.managers.auth = new AuthManager();
            this.managers.event = new EventManager();
            this.managers.modal = new ModalManager();
            this.managers.sidebar = new SidebarManager();
            this.managers.ui = new UIManager();
            const initOrder = [
                this.managers.notification,
                this.managers.modal,
                this.managers.sidebar,
                this.managers.ui,
                this.managers.auth,
                this.managers.event,
                this.managers.registration
            ];
            for (const manager of initOrder) {
                if (manager && typeof manager.initialize === 'function') {
                    await manager.initialize();
                }
            }
            this._setupCrossReferences();

            this.isInitialized = true;
            console.log('✅ AppManager: Aplicación inicializada correctamente');

            return this.managers;
        } catch (error) {
            console.error('❌ AppManager: Error durante la inicialización:', error);
            throw error;
        }
    }

    async _waitForAuthManager() {
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('✅ AppManager: AuthManager listo');
    }
    _setupCrossReferences() {
        if (this.managers.auth && this.managers.registration) {
            this.managers.auth.registrationManager = this.managers.registration;
        }
    }
    get authManager() {
        return this.managers.auth;
    }
    get eventManager() {
        return this.managers.event;
    }
    get notificationManager() {
        return this.managers.notification;
    }
    get modalManager() {
        return this.managers.modal;
    }
    get sidebarManager() {
        return this.managers.sidebar;
    }
    get uiManager() {
        return this.managers.ui;
    }
    get registrationManager() {
        return this.managers.registration;
    }
    isAuthenticated() {
        return this.managers.auth?.isAuthenticated() || false;
    }
    getCurrentUser() {
        return this.managers.auth?.getCurrentUser() || null;
    }
    logout() {
        if (this.managers.auth) {
            this.managers.auth.logout();
        }
    }
    requireAuth() {
        return this.managers.auth?.requireAuth() || false;
    }
    debug() {
        console.log('🔍 AppManager: Estado de la aplicación');
        console.log('📊 Inicializada:', this.isInitialized);
        console.log('📊 Managers disponibles:', Object.keys(this.managers));
        console.log('📊 Usuario autenticado:', this.isAuthenticated());
        if (this.isAuthenticated()) {
            console.log('📊 Usuario actual:', this.getCurrentUser()?.getFullName());
        }
        if (this.managers.auth) {
            this.managers.auth.debugCurrentUser();
        }
    }

    /**
     * Obtiene el estado de todos los managers
     * @returns {Object}
     */
    getStatus() {
        const status = {
            isInitialized: this.isInitialized,
            managers: {}
        };
        
        Object.keys(this.managers).forEach(key => {
            const manager = this.managers[key];
            if (manager && typeof manager.getStatus === 'function') {
                status.managers[key] = manager.getStatus();
            } else {
                status.managers[key] = {
                    isInitialized: manager.isInitialized || false,
                    name: manager.constructor.name
                };
            }
        });
        
        return status;
    }

    /**
     * Limpia todos los managers
     */
    cleanup() {
        console.log('🧹 AppManager: Limpiando recursos...');
        
        Object.values(this.managers).forEach(manager => {
            if (manager && typeof manager.cleanup === 'function') {
                manager.cleanup();
            }
        });
        
        this.isInitialized = false;
        console.log('✅ AppManager: Recursos limpiados');
    }

    /**
     * Valida la configuración de la aplicación
     * @param {Object} config - Configuración a validar
     * @returns {boolean}
     */
    validate(config) {
        return config && typeof config === 'object';
    }

    /**
     * Reinicia todos los managers
     */
    async restart() {
        console.log('🔄 AppManager: Reiniciando aplicación...');
        this.cleanup();
        await this.init();
    }
}
let appManagerInstance = null;
export function getAppManager() {
    if (!appManagerInstance) {
        appManagerInstance = new AppManager();
    }
    return appManagerInstance;
}
export async function initializeApp() {
    const appManager = getAppManager();
    return await appManager.init();
}
export default getAppManager();