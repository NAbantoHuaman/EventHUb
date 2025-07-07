import { BaseManager } from './BaseManager.js';

export class BaseNotification {
    constructor(message, options = {}) {
        this.id = this.generateId();
        this.message = message;
        this.timestamp = Date.now();
        this.isVisible = false;
        this.element = null;
        
        this.options = {
            duration: 5000,
            closable: true,
            persistent: false,
            position: 'top-right',
            ...options
        };
    }

    generateId() {
        return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    async show() {
        try {
            if (!this.validate()) {
                throw new Error('Datos de notificación inválidos');
            }

            this.element = this.createElement();
            
            this.applyStyles();
            
            this.addToDOM();
            
            await this.animateIn();
            
            if (!this.options.persistent && this.options.duration > 0) {
                this.scheduleAutoClose();
            }
            
            this.setupEvents();
            
            this.isVisible = true;
            this.onShow();
            
        } catch (error) {
            console.error('Error mostrando notificación:', error);
            this.onError(error);
        }
    }

    async hide() {
        if (!this.isVisible) return;
        
        try {
            await this.animateOut();
            
            this.removeFromDOM();
            
            this.cleanup();
            
            this.isVisible = false;
            this.onHide();
            
        } catch (error) {
            console.error('Error ocultando notificación:', error);
            this.onError(error);
        }
    }

    validate() {
        return this.message && typeof this.message === 'string' && this.message.trim().length > 0;
    }

    createElement() {
        throw new Error('El método createElement() debe ser implementado por la clase hija');
    }

    applyStyles() {
        throw new Error('El método applyStyles() debe ser implementado por la clase hija');
    }

    addToDOM() {
        const container = this.getContainer();
        container.appendChild(this.element);
    }

    removeFromDOM() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    getContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = `notification-container ${this.options.position}`;
            document.body.appendChild(container);
        }
        return container;
    }

    async animateIn() {
        return new Promise(resolve => {
            this.element.style.opacity = '0';
            this.element.style.transform = 'translateX(100%)';
            
            requestAnimationFrame(() => {
                this.element.style.transition = 'all 0.3s ease-out';
                this.element.style.opacity = '1';
                this.element.style.transform = 'translateX(0)';
                
                setTimeout(resolve, 300);
            });
        });
    }

    async animateOut() {
        return new Promise(resolve => {
            this.element.style.transition = 'all 0.3s ease-in';
            this.element.style.opacity = '0';
            this.element.style.transform = 'translateX(100%)';
            
            setTimeout(resolve, 300);
        });
    }

    scheduleAutoClose() {
        this.autoCloseTimer = setTimeout(() => {
            this.hide();
        }, this.options.duration);
    }

    cancelAutoClose() {
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
        }
    }

    setupEvents() {
        if (this.options.closable) {
            const closeBtn = this.element.querySelector('.notification-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.hide());
            }
        }

        this.element.addEventListener('mouseenter', () => this.cancelAutoClose());
        this.element.addEventListener('mouseleave', () => {
            if (!this.options.persistent && this.options.duration > 0) {
                this.scheduleAutoClose();
            }
        });
    }

    cleanup() {
        this.cancelAutoClose();
        if (this.element) {
            this.element.replaceWith(this.element.cloneNode(true));
        }
    }

    onShow() { }
    onHide() { }
    onError(error) { console.error('Error en notificación:', error); }
}

export class SuccessNotification extends BaseNotification {
    constructor(message, options = {}) {
        super(message, {
            duration: 4000,
            ...options
        });
        this.type = 'success';
    }

    createElement() {
        const element = document.createElement('div');
        element.className = 'notification notification-success';
        element.innerHTML = `
            <div class="notification-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="notification-content">
                <div class="notification-message">${this.message}</div>
            </div>
            ${this.options.closable ? '<button class="notification-close">&times;</button>' : ''}
        `;
        return element;
    }

    applyStyles() {
        this.element.style.cssText += `
            background-color: #10b981;
            border-left: 4px solid #059669;
            color: white;
        `;
    }

    onShow() {
        console.log('✅ Notificación de éxito mostrada:', this.message);
    }
}

export class ErrorNotification extends BaseNotification {
    constructor(message, options = {}) {
        super(message, {
            duration: 8000,
            persistent: false,
            ...options
        });
        this.type = 'error';
    }

    createElement() {
        const element = document.createElement('div');
        element.className = 'notification notification-error';
        element.innerHTML = `
            <div class="notification-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="notification-content">
                <div class="notification-message">${this.message}</div>
            </div>
            ${this.options.closable ? '<button class="notification-close">&times;</button>' : ''}
        `;
        return element;
    }

    applyStyles() {
        this.element.style.cssText += `
            background-color: #ef4444;
            border-left: 4px solid #dc2626;
            color: white;
        `;
    }

    async animateIn() {
        return new Promise(resolve => {
            this.element.style.opacity = '0';
            this.element.style.transform = 'translateX(100%) scale(0.8)';
            
            requestAnimationFrame(() => {
                this.element.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                this.element.style.opacity = '1';
                this.element.style.transform = 'translateX(0) scale(1)';
                
                setTimeout(() => {
                    this.element.style.animation = 'shake 0.5s ease-in-out';
                }, 100);
                
                setTimeout(resolve, 400);
            });
        });
    }

    onShow() {
        console.error('❌ Notificación de error mostrada:', this.message);
    }
}

export class InfoNotification extends BaseNotification {
    constructor(message, options = {}) {
        super(message, {
            duration: 6000,
            ...options
        });
        this.type = 'info';
    }

    createElement() {
        const element = document.createElement('div');
        element.className = 'notification notification-info';
        element.innerHTML = `
            <div class="notification-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="notification-content">
                <div class="notification-message">${this.message}</div>
            </div>
            ${this.options.closable ? '<button class="notification-close">&times;</button>' : ''}
        `;
        return element;
    }

    applyStyles() {
        this.element.style.cssText += `
            background-color: #3b82f6;
            border-left: 4px solid #2563eb;
            color: white;
        `;
    }

    onShow() {
        console.log('ℹ️ Notificación de información mostrada:', this.message);
    }
}

export class WarningNotification extends BaseNotification {
    constructor(message, options = {}) {
        super(message, {
            duration: 7000,
            ...options
        });
        this.type = 'warning';
    }

    createElement() {
        const element = document.createElement('div');
        element.className = 'notification notification-warning';
        element.innerHTML = `
            <div class="notification-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="notification-content">
                <div class="notification-message">${this.message}</div>
            </div>
            ${this.options.closable ? '<button class="notification-close">&times;</button>' : ''}
        `;
        return element;
    }

    applyStyles() {
        this.element.style.cssText += `
            background-color: #f59e0b;
            border-left: 4px solid #d97706;
            color: white;
        `;
    }


    onShow() {
        console.warn('⚠️ Notificación de advertencia mostrada:', this.message);
    }
}

export class NotificationFactory {
    static create(type, message, options = {}) {
        switch (type.toLowerCase()) {
            case 'success':
                return new SuccessNotification(message, options);
            case 'error':
                return new ErrorNotification(message, options);
            case 'info':
                return new InfoNotification(message, options);
            case 'warning':
                return new WarningNotification(message, options);
            default:
                throw new Error(`Tipo de notificación no soportado: ${type}`);
        }
    }

    static getAvailableTypes() {
        return ['success', 'error', 'info', 'warning'];
    }
}