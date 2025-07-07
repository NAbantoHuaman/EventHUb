import { StorageManager } from './storage.js';

class RegistrationManager {
    constructor() {
        this.regularStorageKey = 'eventhub_registrations';
        this.customStorageKey = 'eventhub_custom_registrations';
        this.init();
    }

    init() {
        if (!StorageManager.get(this.regularStorageKey)) {
            StorageManager.set(this.regularStorageKey, {
                registrations: {},
                lastUpdated: new Date().toISOString()
            });
        }
        if (!StorageManager.get(this.customStorageKey)) {
            StorageManager.set(this.customStorageKey, {
                registrations: {},
                lastUpdated: new Date().toISOString()
            });
        }
    }
    getAllRegistrations() {
        const data = StorageManager.get(this.regularStorageKey);
        return data ? data.registrations : {};
    }
    saveAllRegistrations(registrations) {
        StorageManager.set(this.regularStorageKey, {
            registrations,
            lastUpdated: new Date().toISOString()
        });
    }
    getUserRegistrations(userId) {
        const allRegistrations = this.getAllRegistrations();
        return allRegistrations[userId] || [];
    }
    addRegistration(userId, eventId) {
        console.log(`🔄 RegistrationManager: Agregando inscripción regular - Usuario: ${userId}, Evento: ${eventId}`);
        const allRegistrations = this.getAllRegistrations();
        if (!allRegistrations[userId]) {
            allRegistrations[userId] = [];
        }
        if (allRegistrations[userId].includes(eventId)) {
            console.log(`⚠️ RegistrationManager: Usuario ${userId} ya está inscrito en evento ${eventId}`);
            return false;
        }
        allRegistrations[userId].push(eventId);
        this.saveAllRegistrations(allRegistrations);
        console.log(`✅ RegistrationManager: Inscripción regular agregada exitosamente`);
        console.log(`📊 RegistrationManager: Inscripciones del usuario ${userId}:`, allRegistrations[userId]);
        return true;
    }
    removeRegistration(userId, eventId) {
        console.log(`🔄 RegistrationManager: Removiendo inscripción regular - Usuario: ${userId}, Evento: ${eventId}`);
        const allRegistrations = this.getAllRegistrations();
        if (!allRegistrations[userId]) {
            console.log(`⚠️ RegistrationManager: Usuario ${userId} no tiene inscripciones`);
            return false;
        }
        const index = allRegistrations[userId].indexOf(eventId);
        if (index === -1) {
            console.log(`⚠️ RegistrationManager: Usuario ${userId} no está inscrito en evento ${eventId}`);
            return false;
        }
        allRegistrations[userId].splice(index, 1);
        this.saveAllRegistrations(allRegistrations);
        console.log(`✅ RegistrationManager: Inscripción regular removida exitosamente`);
        console.log(`📊 RegistrationManager: Inscripciones del usuario ${userId}:`, allRegistrations[userId]);
        return true;
    }
    getAllCustomRegistrations() {
        const data = StorageManager.get(this.customStorageKey);
        return data ? data.registrations : {};
    }
    saveAllCustomRegistrations(registrations) {
        StorageManager.set(this.customStorageKey, {
            registrations,
            lastUpdated: new Date().toISOString()
        });
    }
    getUserCustomRegistrations(userId) {
        const allRegistrations = this.getAllCustomRegistrations();
        return Object.keys(allRegistrations).filter(regId => 
            allRegistrations[regId].userId === userId
        ).map(regId => allRegistrations[regId]);
    }
    addCustomRegistration(registrationData) {
        console.log(`🔄 RegistrationManager: Agregando inscripción personalizada - Usuario: ${registrationData.userId}, Evento: ${registrationData.eventId}`);
        try {
            if (!registrationData.userId || !registrationData.eventId) {
                return {
                    success: false,
                    error: 'Datos de usuario o evento faltantes'
                };
            }
            
            const allRegistrations = this.getAllCustomRegistrations();
            const registrationId = this.generateRegistrationId();
            
            const registration = {
                id: registrationId,
                userId: registrationData.userId,
                eventId: registrationData.eventId,
                eventName: registrationData.eventName,
                firstName: registrationData.firstName,
                lastName: registrationData.lastName,
                email: registrationData.email,
                phone: registrationData.phone,
                address: registrationData.address,
                city: registrationData.city,
                emergencyContact: registrationData.emergencyContact,
                emergencyPhone: registrationData.emergencyPhone,
                specialRequirements: registrationData.specialRequirements,
                dietaryRestrictions: registrationData.dietaryRestrictions,
                notes: registrationData.notes,
                paymentRequired: registrationData.paymentRequired,
                notifications: registrationData.notifications,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            allRegistrations[registrationId] = registration;
            this.saveAllCustomRegistrations(allRegistrations);
            
            console.log(`✅ RegistrationManager: Inscripción personalizada agregada con ID: ${registrationId}`);
            
            return {
                success: true,
                registrationId: registrationId,
                registration: registration
            };
        } catch (error) {
            console.error('❌ RegistrationManager: Error al agregar inscripción personalizada:', error);
            return {
                success: false,
                error: 'Error interno al procesar la inscripción'
            };
        }
    }


    removeCustomRegistration(registrationId) {
        console.log(`🔄 RegistrationManager: Removiendo inscripción personalizada - ID: ${registrationId}`);
        const allRegistrations = this.getAllCustomRegistrations();
        if (!allRegistrations[registrationId]) {
            console.log(`⚠️ RegistrationManager: Inscripción personalizada ${registrationId} no encontrada`);
            return false;
        }
        delete allRegistrations[registrationId];
        this.saveAllCustomRegistrations(allRegistrations);
        console.log(`✅ RegistrationManager: Inscripción personalizada ${registrationId} removida exitosamente`);
        return true;
    }
    isUserRegistered(userId, eventId) {
        const regularRegistrations = this.getUserRegistrations(userId);
        if (regularRegistrations.includes(eventId)) {
            return true;
        }
        const customRegistrations = this.getUserCustomRegistrations(userId);
        return customRegistrations.some(reg => reg.eventId === eventId);
    }
    generateRegistrationId() {
        return 'reg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    getEventRegistrationCount(eventId) {
        const allRegistrations = this.getAllRegistrations();
        let regularCount = 0;
        Object.values(allRegistrations).forEach(userRegs => {
            if (userRegs.includes(eventId)) {
                regularCount++;
            }
        });
        const customRegistrations = this.getAllCustomRegistrations();
        const customCount = Object.values(customRegistrations).filter(reg => 
            reg.eventId === eventId
        ).length;
        return regularCount + customCount;
    }
    getEventRegistrations(eventId) {
        const registeredUsers = [];
        const allRegistrations = this.getAllRegistrations();
        Object.keys(allRegistrations).forEach(userId => {
            if (allRegistrations[userId].includes(eventId)) {
                registeredUsers.push({ userId, type: 'regular' });
            }
        });
        const customRegistrations = this.getAllCustomRegistrations();
        Object.values(customRegistrations).forEach(reg => {
            if (reg.eventId === eventId) {
                registeredUsers.push({ userId: reg.userId, type: 'custom', registrationId: reg.id });
            }
        });
        return registeredUsers;
    }


    cleanupInvalidRegistrations(validEventIds) {
        console.log('🔄 RegistrationManager: Limpiando inscripciones inválidas...');
        let hasChanges = false;
        const allRegistrations = this.getAllRegistrations();
        Object.keys(allRegistrations).forEach(userId => {
            const validRegistrations = allRegistrations[userId].filter(eventId => 
                validEventIds.includes(eventId)
            );
            if (validRegistrations.length !== allRegistrations[userId].length) {
                allRegistrations[userId] = validRegistrations;
                hasChanges = true;
                console.log(`🧹 RegistrationManager: Limpiadas inscripciones regulares inválidas para usuario ${userId}`);
            }
        });
        if (hasChanges) {
            this.saveAllRegistrations(allRegistrations);
        }
        const customRegistrations = this.getAllCustomRegistrations();
        const validCustomRegistrations = {};
        Object.keys(customRegistrations).forEach(regId => {
            const reg = customRegistrations[regId];
            if (validEventIds.includes(reg.eventId)) {
                validCustomRegistrations[regId] = reg;
            } else {
                hasChanges = true;
                console.log(`🧹 RegistrationManager: Eliminada inscripción personalizada inválida ${regId}`);
            }
        });
        if (Object.keys(validCustomRegistrations).length !== Object.keys(customRegistrations).length) {
            this.saveAllCustomRegistrations(validCustomRegistrations);
        }
        if (hasChanges) {
            console.log('✅ RegistrationManager: Limpieza completada');
        } else {
            console.log('ℹ️ RegistrationManager: No se encontraron inscripciones inválidas');
        }
    }
    getRegistrationStats() {
        const allRegistrations = this.getAllRegistrations();
        const customRegistrations = this.getAllCustomRegistrations();
        const stats = {
            regular: {
                totalUsers: Object.keys(allRegistrations).length,
                totalRegistrations: 0
            },
            custom: {
                totalRegistrations: Object.keys(customRegistrations).length,
                pending: 0,
                confirmed: 0,
                cancelled: 0
            },
            total: {
                users: new Set(),
                registrations: 0
            }
        };
        Object.keys(allRegistrations).forEach(userId => {
            stats.regular.totalRegistrations += allRegistrations[userId].length;
            stats.total.users.add(userId);
        });
        Object.values(customRegistrations).forEach(reg => {
            stats.custom[reg.status]++;
            stats.total.users.add(reg.userId);
        });
        stats.total.users = stats.total.users.size;
        stats.total.registrations = stats.regular.totalRegistrations + stats.custom.totalRegistrations;
        return stats;
    }
    exportAllRegistrations() {
        return {
            regular: StorageManager.get(this.regularStorageKey),
            custom: StorageManager.get(this.customStorageKey),
            exportDate: new Date().toISOString()
        };
    }
    importRegistrations(data) {
        let success = true;
        if (data.regular && data.regular.registrations) {
            StorageManager.set(this.regularStorageKey, {
                registrations: data.regular.registrations,
                lastUpdated: new Date().toISOString()
            });
        } else {
            success = false;
        }
        if (data.custom && data.custom.registrations) {
            StorageManager.set(this.customStorageKey, {
                registrations: data.custom.registrations,
                lastUpdated: new Date().toISOString()
            });
        }
        return success;
    }
    debugRegistrations() {
        console.log('🔍 RegistrationManager: DEBUG - Estado completo de inscripciones');
        console.log('📊 Clave de almacenamiento regular:', this.regularStorageKey);
        console.log('📊 Clave de almacenamiento personalizado:', this.customStorageKey);
        const regularData = StorageManager.get(this.regularStorageKey);
        const customData = StorageManager.get(this.customStorageKey);
        console.log('📊 Datos regulares:', regularData);
        console.log('📊 Datos personalizados:', customData);
        if (regularData && regularData.registrations) {
            console.log('📊 Número de usuarios con inscripciones regulares:', Object.keys(regularData.registrations).length);
            Object.entries(regularData.registrations).forEach(([userId, events]) => {
                console.log(`📊 Usuario ${userId}: ${events.length} eventos regulares - ${events.join(', ')}`);
            });
        }
        if (customData && customData.registrations) {
            console.log('📊 Número de inscripciones personalizadas:', Object.keys(customData.registrations).length);
            Object.entries(customData.registrations).forEach(([regId, reg]) => {
                console.log(`📊 Inscripción ${regId}: Usuario ${reg.userId}, Evento ${reg.eventId}, Estado ${reg.status}`);
            });
        }
    }
    clearAllRegistrations() {
        console.log('🗑️ RegistrationManager: Eliminando todas las inscripciones');
        StorageManager.remove(this.regularStorageKey);
        StorageManager.remove(this.customStorageKey);
        this.init();
        console.log('✅ RegistrationManager: Todas las inscripciones eliminadas');
    }
}

export { RegistrationManager };