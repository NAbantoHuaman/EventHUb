// Application Constants - Redesigned
export const APP_CONFIG = {
    name: 'EventHub',
    version: '2.0.0',
    description: 'Gestión profesional de eventos'
};

export const STORAGE_KEYS = {
    users: 'eventhub_users',
    session: 'eventhub_session',
    registrations: 'eventhub_registrations', 
    preferences: 'eventhub_preferences'
};

export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning'
};

export const EVENT_CATEGORIES = [
    'Tecnología',
    'Música',
    'Arte',
    'Deportes',
    'Gastronomía',
    'Negocios',
    'Educación',
    'Salud',
    'Entretenimiento'
];

export const PASSWORD_STRENGTH = {
    WEAK: { strength: 0, text: 'Muy débil', class: 'weak' },
    FAIR: { strength: 1, text: 'Débil', class: 'weak' },
    GOOD: { strength: 2, text: 'Regular', class: 'fair' },
    STRONG: { strength: 3, text: 'Buena', class: 'good' },
    VERY_STRONG: { strength: 4, text: 'Fuerte', class: 'strong' },
    EXCELLENT: { strength: 5, text: 'Muy fuerte', class: 'strong' }
};

export const DATE_FILTERS = {
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month'
};

export const VALIDATION_RULES = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\+]?[1-9][\d]{0,15}$/,
    minPasswordLength: 8
};

export const UI_BREAKPOINTS = {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    large: 1200
};

export const ANIMATION_DURATION = {
    fast: 150,
    normal: 300,
    slow: 500
};