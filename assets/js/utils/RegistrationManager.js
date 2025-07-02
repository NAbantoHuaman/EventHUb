// Gestor de Inscripciones
export class RegistrationManager {
    constructor() {
        this.STORAGE_KEY = 'eventhub_registrations';
        this.init();
    }

    init() {
        console.log('🚀 RegistrationManager: Inicializando...');
        this.ensureStorageExists();
        console.log('✅ RegistrationManager: Inicializado');
    }

    // Asegura que exista el almacenamiento de inscripciones en localStorage
    ensureStorageExists() {
        const existing = localStorage.getItem(this.STORAGE_KEY);
        if (!existing) {
            console.log('🔧 RegistrationManager: Creando almacenamiento de inscripciones');
            const initialData = {
                registrations: {},
                metadata: {
                    created: new Date().toISOString(),
                    version: '1.0.0'
                }
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialData));
        }
    }

    // Obtiene todas las inscripciones de todos los usuarios
    getAllRegistrations() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) {
                console.log('⚠️ RegistrationManager: No se encontraron datos de inscripciones');
                return {};
            }
            
            const parsed = JSON.parse(data);
            console.log('📊 RegistrationManager: Inscripciones recuperadas:', Object.keys(parsed.registrations || {}).length, 'usuarios');
            return parsed.registrations || {};
        } catch (error) {
            console.error('❌ RegistrationManager: Error al obtener inscripciones:', error);
            return {};
        }
    }

    // Obtiene las inscripciones de un usuario específico
    getUserRegistrations(userId) {
        console.log('🔍 RegistrationManager: Obteniendo inscripciones para el usuario:', userId);
        const allRegistrations = this.getAllRegistrations();
        const userRegistrations = allRegistrations[userId] || [];
        console.log('📊 RegistrationManager: El usuario tiene', userRegistrations.length, 'inscripciones');
        console.log('📊 RegistrationManager: IDs de inscripciones:', userRegistrations);
        return userRegistrations;
    }

    // Guarda todas las inscripciones en localStorage
    saveAllRegistrations(registrations) {
        try {
            console.log('💾 RegistrationManager: Guardando inscripciones para', Object.keys(registrations).length, 'usuarios');
            
            const data = {
                registrations: registrations,
                metadata: {
                    lastUpdated: new Date().toISOString(),
                    version: '1.0.0'
                }
            };
            
            const serialized = JSON.stringify(data);
            localStorage.setItem(this.STORAGE_KEY, serialized);
            
            const verification = localStorage.getItem(this.STORAGE_KEY);
            if (verification === serialized) {
                console.log('✅ RegistrationManager: Guardado exitoso y verificado');
                return true;
            } else {
                console.error('❌ RegistrationManager: Falló la verificación del guardado');
                return false;
            }
        } catch (error) {
            console.error('❌ RegistrationManager: Error al guardar inscripciones:', error);
            return false;
        }
    }

    // Agrega una inscripción para un usuario a un evento
    addRegistration(userId, eventId) {
        console.log('➕ RegistrationManager: Agregando inscripción - Usuario:', userId, 'Evento:', eventId);
        
        const allRegistrations = this.getAllRegistrations();
        
        // Inicializa el array de inscripciones si no existe
        if (!allRegistrations[userId]) {
            allRegistrations[userId] = [];
            console.log('🔧 RegistrationManager: Se creó un nuevo array de inscripciones para el usuario');
        }
        
        // Verifica si ya está inscrito
        if (allRegistrations[userId].includes(eventId)) {
            console.log('⚠️ RegistrationManager: El usuario ya está inscrito en este evento');
            return false;
        }
        
        // Agrega la inscripción
        allRegistrations[userId].push(eventId);
        console.log('📊 RegistrationManager: El usuario ahora tiene', allRegistrations[userId].length, 'inscripciones');
        
        // Guarda en el almacenamiento
        const saved = this.saveAllRegistrations(allRegistrations);
        
        if (saved) {
            const verifyRegistrations = this.getUserRegistrations(userId);
            if (verifyRegistrations.includes(eventId)) {
                console.log('✅ RegistrationManager: Inscripción agregada y verificada');
                return true;
            } else {
                console.error('❌ RegistrationManager: La inscripción no se encontró en la verificación');
                return false;
            }
        }
        
        return false;
    }

    // Elimina una inscripción de un usuario a un evento
    removeRegistration(userId, eventId) {
        console.log('➖ RegistrationManager: Eliminando inscripción - Usuario:', userId, 'Evento:', eventId);
        
        const allRegistrations = this.getAllRegistrations();
        
        if (!allRegistrations[userId]) {
            console.log('⚠️ RegistrationManager: No se encontraron inscripciones para el usuario');
            return false;
        }
        
        const index = allRegistrations[userId].indexOf(eventId);
        if (index === -1) {
            console.log('⚠️ RegistrationManager: Inscripción no encontrada');
            return false;
        }
        
        // Elimina la inscripción
        allRegistrations[userId].splice(index, 1);
        console.log('📊 RegistrationManager: El usuario ahora tiene', allRegistrations[userId].length, 'inscripciones');
        
        // Guarda en el almacenamiento
        const saved = this.saveAllRegistrations(allRegistrations);
        
        if (saved) {
            const verifyRegistrations = this.getUserRegistrations(userId);
            if (!verifyRegistrations.includes(eventId)) {
                console.log('✅ RegistrationManager: Inscripción eliminada y verificada');
                return true;
            } else {
                console.error('❌ RegistrationManager: La inscripción aún existe tras la verificación');
                return false;
            }
        }
        
        return false;
    }

    // Verifica si un usuario está inscrito en un evento
    isUserRegistered(userId, eventId) {
        const userRegistrations = this.getUserRegistrations(userId);
        const isRegistered = userRegistrations.includes(eventId);
        console.log(`🔍 RegistrationManager: ¿Usuario ${userId} inscrito en ${eventId}?: ${isRegistered}`);
        return isRegistered;
    }

    // Obtiene el número de inscripciones para un evento
    getEventRegistrationCount(eventId) {
        const allRegistrations = this.getAllRegistrations();
        let count = 0;
        
        Object.values(allRegistrations).forEach(userRegs => {
            if (userRegs.includes(eventId)) {
                count++;
            }
        });
        
        console.log(`📊 RegistrationManager: El evento ${eventId} tiene ${count} inscripciones`);
        return count;
    }

    // Muestra en consola el estado completo de las inscripciones (debug)
    debugRegistrations() {
        console.log('🔍 RegistrationManager: DEBUG - Estado completo de inscripciones');
        console.log('📊 Clave de almacenamiento:', this.STORAGE_KEY);
        
        const rawData = localStorage.getItem(this.STORAGE_KEY);
        console.log('📊 Datos en crudo del almacenamiento:', rawData);
        
        if (rawData) {
            try {
                const parsed = JSON.parse(rawData);
                console.log('📊 Datos parseados:', parsed);
                console.log('📊 Objeto de inscripciones:', parsed.registrations);
                console.log('📊 Número de usuarios con inscripciones:', Object.keys(parsed.registrations || {}).length);
                
                Object.entries(parsed.registrations || {}).forEach(([userId, events]) => {
                    console.log(`📊 Usuario ${userId}: ${events.length} eventos - ${events.join(', ')}`);
                });
            } catch (error) {
                console.error('❌ Error al parsear los datos de inscripciones:', error);
            }
        }
    }

    // Elimina todas las inscripciones del almacenamiento
    clearAllRegistrations() {
        console.log('🗑️ RegistrationManager: Eliminando todas las inscripciones');
        localStorage.removeItem(this.STORAGE_KEY);
        this.ensureStorageExists();
        console.log('✅ RegistrationManager: Todas las inscripciones eliminadas');
    }
}