import { generateId, formatDate, formatPrice } from '../utils/helpers.js';
import { EVENT_CATEGORIES, STORAGE_KEYS } from '../utils/constants.js';
import { StorageManager } from '../utils/storage.js';
import { BaseDataManager } from './BaseManager.js';

export class EventManager extends BaseDataManager {
    constructor() {
        super('EventManager', 'events');
        this.filteredEvents = [];
        this.currentFilters = {
            search: '',
            category: 'all',
            location: 'all',
            date: ''
        };
    }

    async setup() {
        this.addDependency('StorageManager');
    }

    async loadData() {
        await this.loadEvents();
    }

    async loadEvents() {
        try {
            const storedEvents = StorageManager.get(STORAGE_KEYS.events) || [];
            
            if (storedEvents.length === 0) {
                console.log('📦 EventManager: No hay eventos almacenados, cargando eventos mock...');
                const mockEvents = this.loadMockEvents();
                this.data = new Map();
                mockEvents.forEach(event => {
                    this.data.set(event.id, event);
                });
                await this.saveData();
            } else {
                console.log(`📦 EventManager: Cargando ${storedEvents.length} eventos desde almacenamiento...`);
                this.data = new Map();
                storedEvents.forEach(eventData => {
                    this.data.set(eventData.id, eventData);
                });
            }
            
            this.filteredEvents = Array.from(this.data.values());
            console.log(`✅ EventManager: ${this.data.size} eventos cargados`);
        } catch (error) {
            console.error('❌ EventManager: Error cargando eventos:', error);
            throw error;
        }
    }

    async saveData() {
        try {
            const eventsArray = Array.from(this.data.values());
            StorageManager.set(STORAGE_KEYS.events, eventsArray);
            console.log(`💾 EventManager: ${eventsArray.length} eventos guardados`);
            this.isDirty = false;
        } catch (error) {
            console.error('❌ EventManager: Error guardando eventos:', error);
            throw error;
        }
    }

    saveEvents() {
        this.saveData();
    }

    loadMockEvents() {
        const now = new Date();
        const getRandomFutureDate = (daysFromNow) => {
            const date = new Date(now);
            date.setDate(date.getDate() + daysFromNow);
            return date.toISOString();
        };

        return [
            {
                id: generateId('event'),
                name: 'Conferencia de Tecnología 2025',
                description: 'Una conferencia sobre las últimas tendencias en tecnología, inteligencia artificial y desarrollo de software. Expertos de la industria compartirán sus conocimientos y experiencias.',
                category: 'Tecnología',
                date: getRandomFutureDate(15),
                location: 'Centro de Convenciones',
                organizer: 'TechCorp',
                price: 150000,
                capacity: 500,
                registered: 342,
                image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg'
            },
            {
                id: generateId('event'),
                name: 'Festival de Música Electrónica',
                description: 'Un festival de música electrónica con los mejores DJs nacionales e internacionales. Una experiencia única con efectos visuales espectaculares.',
                category: 'Música',
                date: getRandomFutureDate(45),
                location: 'Parque Metropolitano',
                organizer: 'MusicEvents',
                price: 80000,
                capacity: 2000,
                registered: 1850,
                image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'
            },
            {
                id: generateId('event'),
                name: 'Taller de Cocina Italiana',
                description: 'Aprende a preparar auténticos platos italianos con un chef profesional. Incluye degustación y recetas para llevar a casa.',
                category: 'Gastronomía',
                date: getRandomFutureDate(8),
                location: 'Escuela Culinaria',
                organizer: 'Chef Mario',
                price: 0,
                capacity: 30,
                registered: 28,
                image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
            },
            {
                id: generateId('event'),
                name: 'Maratón de la Ciudad',
                description: 'Participa en el maratón anual de la ciudad. Diferentes categorías disponibles: 5K, 10K y 21K. Incluye medalla y camiseta.',
                category: 'Deportes',
                date: getRandomFutureDate(60),
                location: 'Centro Histórico',
                organizer: 'Alcaldía Municipal',
                price: 45000,
                capacity: 1000,
                registered: 756,
                image: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg'
            },
            {
                id: generateId('event'),
                name: 'Exposición de Arte Moderno',
                description: 'Exposición de obras de artistas emergentes locales. Una oportunidad única para conocer el talento artístico de la región.',
                category: 'Arte',
                date: getRandomFutureDate(30),
                location: 'Museo de Arte Contemporáneo',
                organizer: 'Fundación Arte',
                price: 25000,
                capacity: 200,
                registered: 89,
                image: 'https://images.pexels.com/photos/1570264/pexels-photo-1570264.jpeg'
            },
            {
                id: generateId('event'),
                name: 'Seminario de Emprendimiento',
                description: 'Seminario dirigido a emprendedores y empresarios. Temas sobre financiación, marketing digital y estrategias de crecimiento.',
                category: 'Negocios',
                date: getRandomFutureDate(22),
                location: 'Hotel Business Center',
                organizer: 'Cámara de Comercio',
                price: 120000,
                capacity: 150,
                registered: 98,
                image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg'
            },
            {
                id: generateId('event'),
                name: 'Workshop de Fotografía Digital',
                description: 'Aprende técnicas avanzadas de fotografía digital con profesionales reconocidos. Incluye práctica con equipos profesionales.',
                category: 'Arte',
                date: getRandomFutureDate(12),
                location: 'Estudio Fotográfico Central',
                organizer: 'Asociación de Fotógrafos',
                price: 75000,
                capacity: 25,
                registered: 18,
                image: 'https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg'
            },
            {
                id: generateId('event'),
                name: 'Conferencia de Marketing Digital',
                description: 'Estrategias modernas de marketing digital, redes sociales y comercio electrónico. Casos de éxito y tendencias actuales.',
                category: 'Negocios',
                date: getRandomFutureDate(18),
                location: 'Centro Empresarial',
                organizer: 'Digital Marketing Pro',
                price: 95000,
                capacity: 300,
                registered: 245,
                image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg'
            },
            {
                id: generateId('event'),
                name: 'Festival de Jazz en Vivo',
                description: 'Una noche mágica con los mejores músicos de jazz de la región. Ambiente íntimo y música de alta calidad.',
                category: 'Música',
                date: getRandomFutureDate(35),
                location: 'Teatro Municipal',
                organizer: 'Jazz Society',
                price: 60000,
                capacity: 400,
                registered: 320,
                image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg'
            },
            {
                id: generateId('event'),
                name: 'Torneo de Ajedrez Profesional',
                description: 'Competencia de ajedrez para jugadores de todos los niveles. Premios en efectivo y trofeos para los ganadores.',
                category: 'Deportes',
                date: getRandomFutureDate(25),
                location: 'Club de Ajedrez',
                organizer: 'Federación de Ajedrez',
                price: 30000,
                capacity: 64,
                registered: 52,
                image: 'https://images.pexels.com/photos/1040157/pexels-photo-1040157.jpeg'
            },
            {
                id: generateId('event'),
                name: 'Curso de Desarrollo Web',
                description: 'Curso intensivo de desarrollo web con HTML, CSS, JavaScript y frameworks modernos. Incluye certificación.',
                category: 'Tecnología',
                date: getRandomFutureDate(40),
                location: 'Academia de Programación',
                organizer: 'CodeAcademy',
                price: 200000,
                capacity: 50,
                registered: 35,
                image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg'
            },
            {
                id: generateId('event'),
                name: 'Feria de Comida Internacional',
                description: 'Degusta platos de diferentes culturas del mundo. Food trucks, restaurantes locales y chefs internacionales.',
                category: 'Gastronomía',
                date: getRandomFutureDate(20),
                location: 'Plaza Central',
                organizer: 'Asociación Gastronómica',
                price: 0,
                capacity: 1500,
                registered: 890,
                image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
            },
            {
                id: generateId('event'),
                name: 'Exposición de Ciencia y Tecnología',
                description: 'Muestra interactiva de los últimos avances en ciencia y tecnología. Ideal para familias y estudiantes.',
                category: 'Educación',
                date: getRandomFutureDate(50),
                location: 'Museo de Ciencias',
                organizer: 'Fundación Científica',
                price: 15000,
                capacity: 800,
                registered: 456,
                image: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg'
            },
            {
                id: generateId('event'),
                name: 'Concierto de Música Clásica',
                description: 'Velada de música clásica con la orquesta sinfónica local. Repertorio de compositores clásicos y contemporáneos.',
                category: 'Música',
                date: getRandomFutureDate(28),
                location: 'Auditorio Nacional',
                organizer: 'Orquesta Sinfónica',
                price: 85000,
                capacity: 600,
                registered: 420,
                image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg'
            },
            {
                id: generateId('event'),
                name: 'Taller de Yoga y Meditación',
                description: 'Sesión de relajación y bienestar con instructores certificados. Incluye técnicas de respiración y mindfulness.',
                category: 'Salud',
                date: getRandomFutureDate(10),
                location: 'Centro de Bienestar',
                organizer: 'Yoga Center',
                price: 40000,
                capacity: 40,
                registered: 32,
                image: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg'
            }
        ];
    }

    getAllEvents() {
        return Array.from(this.data.values());
    }

    getFilteredEvents() {
        return this.filteredEvents;
    }

    getEventById(id) {
        return this.data.get(id);
    }

    applyFilters(filters) {
        this.currentFilters = { ...this.currentFilters, ...filters };

        this.filteredEvents = Array.from(this.data.values()).filter(event => {
            const matchesSearch = !this.currentFilters.search || 
                event.name.toLowerCase().includes(this.currentFilters.search.toLowerCase()) ||
                event.description.toLowerCase().includes(this.currentFilters.search.toLowerCase()) ||
                event.location.toLowerCase().includes(this.currentFilters.search.toLowerCase()) ||
                event.organizer.toLowerCase().includes(this.currentFilters.search.toLowerCase());

            const matchesCategory = this.currentFilters.category === 'all' || 
                event.category === this.currentFilters.category;

            const matchesLocation = this.currentFilters.location === 'all' || 
                event.location === this.currentFilters.location;

            const matchesDate = this.matchesDateFilter(event, this.currentFilters.date);

            return matchesSearch && matchesCategory && matchesLocation && matchesDate;
        });

        return this.filteredEvents;
    }

    matchesDateFilter(event, dateFilter) {
        if (!dateFilter) return true;

        const eventDate = new Date(event.date);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (dateFilter) {
            case 'today':
                const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
                return eventDay.getTime() === today.getTime();
            case 'week':
                const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                return eventDate >= today && eventDate <= weekFromNow;
            case 'month':
                const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
                return eventDate >= today && eventDate <= monthFromNow;
            default:
                return true;
        }
    }

    clearFilters() {
        this.currentFilters = {
            search: '',
            category: 'all',
            location: 'all',
            date: ''
        };
        this.filteredEvents = Array.from(this.data.values());
        return this.filteredEvents;
    }

    getCategories() {
        return EVENT_CATEGORIES;
    }

    getLocations() {
        const locations = [...new Set(Array.from(this.data.values()).map(event => event.location))];
        return locations.sort();
    }

    getEventStats() {
        const events = Array.from(this.data.values());
        const totalEvents = events.length;
        const now = new Date();
        const availableEvents = events.filter(event => 
            event.registered < event.capacity && new Date(event.date) > now
        ).length;
        const totalRegistrations = events.reduce((sum, event) => sum + event.registered, 0);
        const categories = this.getCategories().length;

        return {
            total: totalEvents,
            available: availableEvents,
            registrations: totalRegistrations,
            categories
        };
    }

    getUpcomingEvents(limit = 5) {
        const now = new Date();
        return Array.from(this.data.values())
            .filter(event => new Date(event.date) > now)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, limit);
    }

    isEventFull(eventId) {
        const event = this.getEventById(eventId);
        return event ? event.registered >= event.capacity : false;
    }

    isEventPast(eventId) {
        const event = this.getEventById(eventId);
        return event ? new Date(event.date) < new Date() : false;
    }

    getEventStatus(eventId) {
        if (this.isEventPast(eventId)) return 'past';
        if (this.isEventFull(eventId)) return 'full';
        return 'available';
    }

    searchEvents(query) {
        if (!query) return Array.from(this.data.values());

        const searchTerm = query.toLowerCase();
        return Array.from(this.data.values()).filter(event =>
            event.name.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm) ||
            event.category.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm) ||
            event.organizer.toLowerCase().includes(searchTerm)
        );
    }

    sortEvents(events, sortBy = 'date', order = 'asc') {
        return events.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'date':
                    aValue = new Date(a.date);
                    bValue = new Date(b.date);
                    break;
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'price':
                    aValue = a.price;
                    bValue = b.price;
                    break;
                case 'capacity':
                    aValue = a.capacity;
                    bValue = b.capacity;
                    break;
                case 'registered':
                    aValue = a.registered;
                    bValue = b.registered;
                    break;
                default:
                    aValue = new Date(a.date);
                    bValue = new Date(b.date);
            }

            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    updateEventRegistration(eventId, increment = true) {
        const event = this.getEventById(eventId);
        if (event) {
            if (increment) {
                event.registered = Math.min(event.registered + 1, event.capacity);
            } else {
                event.registered = Math.max(event.registered - 1, 0);
            }
            this.isDirty = true;
            this.saveEvents();
            return true;
        }
        return false;
    }

    addEvent(eventData) {
        this.data.set(eventData.id, eventData);
        this.filteredEvents = Array.from(this.data.values());
        this.isDirty = true;
        this.saveEvents();
    }
}
