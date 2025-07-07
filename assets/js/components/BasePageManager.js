import { getAppManager } from '../utils/AppManager.js';

export class BasePageManager {
    constructor() {
        if (this.constructor === BasePageManager) {
            throw new Error('BasePageManager es una clase abstracta y no puede ser instanciada directamente');
        }
        
        this.appManager = getAppManager();
        this.currentUser = null;
        this.isInitialized = false;
        
        this.authManager = null;
        this.eventManager = null;
        this.notificationManager = null;
        this.registrationManager = null;
        
        this.init();
    }

    async init() {
        console.log(`🚀 ${this.constructor.name}: Inicializando...`);
        
        try {
            await this.initializeAppManager();
            
            if (this.requiresAuth() && !this.checkAuthentication()) {
                return;
            }
            
            this.setupManagers();
            
            await this.loadPageData();
            
            this.setupEventListeners();
            
            this.updateUI();
            
            await this.onPageReady();
            
            this.isInitialized = true;
            console.log(`✅ ${this.constructor.name}: Inicialización exitosa`);
        } catch (error) {
            console.error(`❌ ${this.constructor.name}: Error durante la inicialización:`, error);
            this.handleInitializationError(error);
        }
    }


    async initializeAppManager() {
        await this.appManager.init();
    }


    requiresAuth() {
        return true;
    }


    checkAuthentication() {
        if (!this.appManager.authManager.requireAuth()) {
            return false;
        }
        
        this.currentUser = this.appManager.authManager.getCurrentUser();
        if (!this.currentUser) {
            console.error(`❌ ${this.constructor.name}: No se encontró usuario actual`);
            window.location.href = 'login.html';
            return false;
        }
        
        console.log(`✅ ${this.constructor.name}: Usuario encontrado:`, this.currentUser.getFullName());
        return true;
    }


    setupManagers() {
        this.authManager = this.appManager.authManager;
        this.eventManager = this.appManager.eventManager;
        this.notificationManager = this.appManager.notificationManager;
        this.registrationManager = this.appManager.registrationManager;
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


    setupLogoutButton() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }


    handleLogout() {
        this.authManager.logout();
        this.notificationManager.info('Sesión cerrada exitosamente');
    }


    updateAuthUI() {
        if (this.currentUser) {
            this.updateElement('user-name-header', this.currentUser.getFullName());
            this.updateElement('user-initials', this.currentUser.getInitials());
        }
    }


    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }


    toggleElement(id, show) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    }


    toggleClass(id, className, add) {
        const element = document.getElementById(id);
        if (element) {
            if (add) {
                element.classList.add(className);
            } else {
                element.classList.remove(className);
            }
        }
    }

    async loadPageData() {
    }

    setupEventListeners() {
        this.setupUserMenu();
        this.setupLogoutButton();
    }

    updateUI() {
        this.updateAuthUI();
    }

    async onPageReady() {
    }


    handleInitializationError(error) {
        if (this.notificationManager) {
            this.notificationManager.error('Error al inicializar la página');
        }
    }

    destroy() {
        console.log(`🧹 ${this.constructor.name}: Limpiando recursos...`);
    }
}