import { NOTIFICATION_TYPES } from '../utils/constants.js';
import { createElement } from '../utils/helpers.js';
import { BaseManager } from './BaseManager.js';
import { NotificationFactory } from './NotificationTypes.js';

export class NotificationManager extends BaseManager {
    constructor() {
        super('NotificationManager');
        this.notifications = [];
        this.container = null;
        this.maxNotifications = 5;
        this.defaultDuration = 5000;
    }

    async setup() {
        this.container = this.createContainer();
    }

    validate(notification) {
        if (!super.validate(notification)) return false;
        
        return typeof notification.message === 'string' && 
               notification.message.trim().length > 0;
    }

    createContainer() {
        let container = document.getElementById('notifications');
        if (!container) {
            container = createElement('div', 'notifications');
            container.id = 'notifications';
            document.body.appendChild(container);
        }
        return container;
    }

    addNotification(message, type = NOTIFICATION_TYPES.INFO, duration = 5000, actions = null) {
        const id = Math.random().toString(36).substr(2, 9);
        const notification = { id, message, type, duration, actions };
        
        this.notifications.push(notification);
        this.renderNotification(notification);

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

    removeNotification(id) {
        const index = this.notifications.findIndex(notification => notification.id === id);
        if (index !== -1) {
            const notification = this.notifications[index];
            if (typeof notification.hide === 'function') {
                notification.hide().catch(error => {
                    console.error('Error ocultando notificación:', error);
                });
            } else {
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
            this.notifications.splice(index, 1);
            
            console.log(`🗑️ NotificationManager: Notificación removida:`, notification.message);
            return true;
        }
        return false;
    }

    remove(id) {
        return this.removeNotification(id);
    }

    removeOldest() {
        if (this.notifications.length > 0) {
            const oldest = this.notifications[0];
            this.remove(oldest.id);
        }
    }


    removeAll() {
        const notificationsToRemove = [...this.notifications];
        
        notificationsToRemove.forEach(notification => {
            this.remove(notification.id);
        });
        
        console.log('🧹 NotificationManager: Todas las notificaciones removidas');
    }


    getStats() {
        const stats = {
            total: this.notifications.length,
            byType: {}
        };
        
        this.notifications.forEach(notification => {
            const type = notification.type || 'unknown';
            stats.byType[type] = (stats.byType[type] || 0) + 1;
        });
        
        return stats;
    }


    getStatus() {
        return {
            ...super.getStatus(),
            ...this.getStats(),
            maxNotifications: this.maxNotifications,
            defaultDuration: this.defaultDuration
        };
    }

    removeAllNotifications() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification.id);
        });
    }

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

    success(message, options = {}) {
        const notification = NotificationFactory.create('success', message, options);
        return this.addNotificationObject(notification);
    }

    error(message, options = {}) {
        const notification = NotificationFactory.create('error', message, options);
        return this.addNotificationObject(notification);
    }

    info(message, options = {}) {
        const notification = NotificationFactory.create('info', message, options);
        return this.addNotificationObject(notification);
    }

    warning(message, options = {}) {
        const notification = NotificationFactory.create('warning', message, options);
        return this.addNotificationObject(notification);
    }

    persistent(message, type = 'info', options = {}) {
        const notification = NotificationFactory.create(type, message, {
            persistent: true,
            ...options
        });
        return this.addNotificationObject(notification);
    }

    addNotificationObject(notification) {
        if (this.notifications.length >= this.maxNotifications) {
            this.removeOldest();
        }

        this.notifications.push(notification);

        notification.show().catch(error => {
            console.error('Error mostrando notificación:', error);
            this.remove(notification.id);
        });

        console.log(`📢 NotificationManager: Notificación ${notification.type} agregada:`, notification.message);
        return notification.id;
    }

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

    getNotificationCount(type = null) {
        if (type) {
            return this.notifications.filter(n => n.type === type).length;
        }
        return this.notifications.length;
    }

    static isSupported() {
        return 'Notification' in window;
    }

    static async requestPermission() {
        if (this.isSupported()) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }

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