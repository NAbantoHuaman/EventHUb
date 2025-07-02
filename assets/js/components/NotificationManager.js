// Componente Gestor de Notificaciones - Rediseñado
import { NOTIFICATION_TYPES } from '../utils/constants.js';
import { createElement } from '../utils/helpers.js';

export class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = this.createContainer();
        this.maxNotifications = 5;
    }

    // Crear el contenedor de notificaciones en el DOM
    createContainer() {
        let container = document.getElementById('notifications');
        if (!container) {
            container = createElement('div', 'notifications');
            container.id = 'notifications';
            document.body.appendChild(container);
        }
        return container;
    }

    // Agregar una notificación
    addNotification(message, type = NOTIFICATION_TYPES.INFO, duration = 5000, actions = null) {
        const id = Math.random().toString(36).substr(2, 9);
        const notification = { id, message, type, duration, actions };
        
        this.notifications.push(notification);
        this.renderNotification(notification);

        // Eliminar las notificaciones más antiguas si se supera el límite
        if (this.notifications.length > this.maxNotifications) {
            const oldestId = this.notifications[0].id;
            this.removeNotification(oldestId);
        }

        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(id);
            }, duration);
        }

        return id;
    }

    // Eliminar una notificación por ID
    removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        const element = document.getElementById(`notification-${id}`);
        if (element) {
            element.classList.add('slide-out');
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }
    }

    // Eliminar todas las notificaciones
    removeAllNotifications() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification.id);
        });
    }

    // Renderizar una notificación en el DOM
    renderNotification(notification) {
        const notificationElement = createElement('div', `notification notification-${notification.type}`);
        notificationElement.id = `notification-${notification.id}`;
        notificationElement.setAttribute('role', 'alert');
        notificationElement.setAttribute('aria-live', 'polite');

        const icon = this.getIcon(notification.type);
        
        let actionsHtml = '';
        if (notification.actions && notification.actions.length > 0) {
            actionsHtml = `
                <div class="notification-actions">
                    ${notification.actions.map(action => `
                        <button class="notification-action ${action.primary ? 'primary' : ''}" 
                                onclick="${action.handler}" 
                                data-notification-id="${notification.id}">
                            ${action.text}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        notificationElement.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${icon}
                </div>
                <div class="notification-message">
                    ${notification.message}
                    ${actionsHtml}
                </div>
                <button class="notification-close" onclick="notificationManager.removeNotification('${notification.id}')" aria-label="Cerrar notificación">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;

        this.container.appendChild(notificationElement);

        // Agregar manejador de clic para las acciones
        if (notification.actions) {
            notification.actions.forEach((action, index) => {
                const actionButton = notificationElement.querySelector(`.notification-action:nth-child(${index + 1})`);
                if (actionButton && action.onClick) {
                    actionButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        action.onClick(notification.id);
                    });
                }
            });
        }
    }

    // Obtener el ícono según el tipo de notificación
    getIcon(type) {
        switch (type) {
            case NOTIFICATION_TYPES.SUCCESS:
                return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>`;
            case NOTIFICATION_TYPES.ERROR:
                return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>`;
            case NOTIFICATION_TYPES.WARNING:
                return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>`;
            default:
                return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>`;
        }
    }

    // Métodos de conveniencia para mostrar notificaciones rápidas
    success(message, duration = 5000, actions = null) {
        return this.addNotification(message, NOTIFICATION_TYPES.SUCCESS, duration, actions);
    }

    error(message, duration = 7000, actions = null) {
        return this.addNotification(message, NOTIFICATION_TYPES.ERROR, duration, actions);
    }

    info(message, duration = 5000, actions = null) {
        return this.addNotification(message, NOTIFICATION_TYPES.INFO, duration, actions);
    }

    warning(message, duration = 6000, actions = null) {
        return this.addNotification(message, NOTIFICATION_TYPES.WARNING, duration, actions);
    }

    // Notificación persistente (no se cierra automáticamente)
    persistent(message, type = NOTIFICATION_TYPES.INFO, actions = null) {
        return this.addNotification(message, type, 0, actions);
    }

    // Actualizar una notificación existente
    updateNotification(id, message, type = null) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.message = message;
            if (type) notification.type = type;
            
            const element = document.getElementById(`notification-${id}`);
            if (element) {
                const messageElement = element.querySelector('.notification-message');
                if (messageElement) {
                    messageElement.textContent = message;
                }
                
                if (type) {
                    element.className = `notification notification-${type}`;
                }
            }
        }
    }

    // Obtener el número de notificaciones por tipo
    getNotificationCount(type = null) {
        if (type) {
            return this.notifications.filter(n => n.type === type).length;
        }
        return this.notifications.length;
    }

    // Verificar si las notificaciones del navegador están soportadas
    static isSupported() {
        return 'Notification' in window;
    }

    // Solicitar permiso para notificaciones del navegador
    static async requestPermission() {
        if (this.isSupported()) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }

    // Mostrar una notificación del navegador
    static showBrowserNotification(title, options = {}) {
        if (this.isSupported() && Notification.permission === 'granted') {
            return new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options
            });
        }
        return null;
    }
}