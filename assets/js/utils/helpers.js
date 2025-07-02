// Utility Helper Functions - Redesigned
export function formatDate(dateString, options = {}) {
    const date = new Date(dateString);
    const defaultOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('es-ES', { ...defaultOptions, ...options });
}

export function formatPrice(price) {
    return price === 0 ? 'Gratis' : `${price.toLocaleString()}`;
}

export function generateId(prefix = '') {
    const id = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}_${id}` : id;
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export function sanitizeHtml(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePassword(password) {
    return password && password.length >= 8;
}

export function getPasswordStrength(password) {
    if (!password) return { strength: 0, text: 'Ingresa una contraseña', class: 'weak' };
    
    let score = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('al menos 8 caracteres');

    // Lowercase check
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('una letra minúscula');

    // Uppercase check
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('una letra mayúscula');

    // Number check
    if (/\d/.test(password)) score += 1;
    else feedback.push('un número');

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('un carácter especial');

    const strengthLevels = [
        { strength: 0, text: 'Muy débil', class: 'weak' },
        { strength: 1, text: 'Débil', class: 'weak' },
        { strength: 2, text: 'Regular', class: 'fair' },
        { strength: 3, text: 'Buena', class: 'good' },
        { strength: 4, text: 'Fuerte', class: 'strong' },
        { strength: 5, text: 'Muy fuerte', class: 'strong' }
    ];

    return strengthLevels[score];
}

export function createElement(tag, className = '', content = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.innerHTML = content;
    return element;
}

export function getElement(selector) {
    return document.querySelector(selector);
}

export function getElements(selector) {
    return document.querySelectorAll(selector);
}

export function addClass(element, className) {
    if (element) element.classList.add(className);
}

export function removeClass(element, className) {
    if (element) element.classList.remove(className);
}

export function toggleClass(element, className) {
    if (element) element.classList.toggle(className);
}

export function hasClass(element, className) {
    return element ? element.classList.contains(className) : false;
}

export function setAttributes(element, attributes) {
    if (element && attributes) {
        Object.keys(attributes).forEach(key => {
            element.setAttribute(key, attributes[key]);
        });
    }
}

export function removeAttributes(element, attributes) {
    if (element && attributes) {
        attributes.forEach(attr => {
            element.removeAttribute(attr);
        });
    }
}

export function isElementVisible(element) {
    return element && element.offsetParent !== null;
}

export function scrollToElement(element, behavior = 'smooth') {
    if (element) {
        element.scrollIntoView({ behavior, block: 'start' });
    }
}

export function copyToClipboard(text) {
    return navigator.clipboard.writeText(text);
}

export function isMobile() {
    return window.innerWidth <= 768;
}

export function isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
}

export function isDesktop() {
    return window.innerWidth > 1024;
}

export function getViewportSize() {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
}

export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

export function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function slugify(str) {
    return removeAccents(str)
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
}

export function randomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
}

export function getContrastColor(hexColor) {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
}