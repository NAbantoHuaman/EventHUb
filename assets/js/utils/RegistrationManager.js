// Registration Manager 
export class RegistrationManager {
    constructor() {
        this.STORAGE_KEY = 'eventhub_registrations';
        this.init();
    }

    init() {
        console.log('🚀 RegistrationManager: Initializing...');
        this.ensureStorageExists();
        console.log('✅ RegistrationManager: Initialized');
    }

    ensureStorageExists() {
        const existing = localStorage.getItem(this.STORAGE_KEY);
        if (!existing) {
            console.log('🔧 RegistrationManager: Creating new registration storage');
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

    getAllRegistrations() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) {
                console.log('⚠️ RegistrationManager: No registration data found');
                return {};
            }
            
            const parsed = JSON.parse(data);
            console.log('📊 RegistrationManager: Retrieved registrations:', Object.keys(parsed.registrations || {}).length, 'users');
            return parsed.registrations || {};
        } catch (error) {
            console.error('❌ RegistrationManager: Error getting registrations:', error);
            return {};
        }
    }

    getUserRegistrations(userId) {
        console.log('🔍 RegistrationManager: Getting registrations for user:', userId);
        const allRegistrations = this.getAllRegistrations();
        const userRegistrations = allRegistrations[userId] || [];
        console.log('📊 RegistrationManager: User has', userRegistrations.length, 'registrations');
        console.log('📊 RegistrationManager: Registration IDs:', userRegistrations);
        return userRegistrations;
    }

    saveAllRegistrations(registrations) {
        try {
            console.log('💾 RegistrationManager: Saving registrations for', Object.keys(registrations).length, 'users');
            
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
                console.log('✅ RegistrationManager: Save successful and verified');
                return true;
            } else {
                console.error('❌ RegistrationManager: Save verification failed');
                return false;
            }
        } catch (error) {
            console.error('❌ RegistrationManager: Error saving registrations:', error);
            return false;
        }
    }

    addRegistration(userId, eventId) {
        console.log('➕ RegistrationManager: Adding registration - User:', userId, 'Event:', eventId);
        
        const allRegistrations = this.getAllRegistrations();
        
        // Initialize user registrations if not exists
        if (!allRegistrations[userId]) {
            allRegistrations[userId] = [];
            console.log('🔧 RegistrationManager: Created new registration array for user');
        }
        
        // Check if already registered
        if (allRegistrations[userId].includes(eventId)) {
            console.log('⚠️ RegistrationManager: User already registered for this event');
            return false;
        }
        
        // Add registration
        allRegistrations[userId].push(eventId);
        console.log('📊 RegistrationManager: User now has', allRegistrations[userId].length, 'registrations');
        
        // Save to storage
        const saved = this.saveAllRegistrations(allRegistrations);
        
        if (saved) {
            const verifyRegistrations = this.getUserRegistrations(userId);
            if (verifyRegistrations.includes(eventId)) {
                console.log('✅ RegistrationManager: Registration added and verified');
                return true;
            } else {
                console.error('❌ RegistrationManager: Registration not found in verification');
                return false;
            }
        }
        
        return false;
    }

    removeRegistration(userId, eventId) {
        console.log('➖ RegistrationManager: Removing registration - User:', userId, 'Event:', eventId);
        
        const allRegistrations = this.getAllRegistrations();
        
        if (!allRegistrations[userId]) {
            console.log('⚠️ RegistrationManager: No registrations found for user');
            return false;
        }
        
        const index = allRegistrations[userId].indexOf(eventId);
        if (index === -1) {
            console.log('⚠️ RegistrationManager: Registration not found');
            return false;
        }
        
        // Remove registration
        allRegistrations[userId].splice(index, 1);
        console.log('📊 RegistrationManager: User now has', allRegistrations[userId].length, 'registrations');
        
        // Save to storage
        const saved = this.saveAllRegistrations(allRegistrations);
        
        if (saved) {
            const verifyRegistrations = this.getUserRegistrations(userId);
            if (!verifyRegistrations.includes(eventId)) {
                console.log('✅ RegistrationManager: Registration removed and verified');
                return true;
            } else {
                console.error('❌ RegistrationManager: Registration still found in verification');
                return false;
            }
        }
        
        return false;
    }

    isUserRegistered(userId, eventId) {
        const userRegistrations = this.getUserRegistrations(userId);
        const isRegistered = userRegistrations.includes(eventId);
        console.log(`🔍 RegistrationManager: User ${userId} registered for ${eventId}: ${isRegistered}`);
        return isRegistered;
    }

    getEventRegistrationCount(eventId) {
        const allRegistrations = this.getAllRegistrations();
        let count = 0;
        
        Object.values(allRegistrations).forEach(userRegs => {
            if (userRegs.includes(eventId)) {
                count++;
            }
        });
        
        console.log(`📊 RegistrationManager: Event ${eventId} has ${count} registrations`);
        return count;
    }

    debugRegistrations() {
        console.log('🔍 RegistrationManager: DEBUG - Full registration state');
        console.log('📊 Storage key:', this.STORAGE_KEY);
        
        const rawData = localStorage.getItem(this.STORAGE_KEY);
        console.log('📊 Raw storage data:', rawData);
        
        if (rawData) {
            try {
                const parsed = JSON.parse(rawData);
                console.log('📊 Parsed data:', parsed);
                console.log('📊 Registrations object:', parsed.registrations);
                console.log('📊 Number of users with registrations:', Object.keys(parsed.registrations || {}).length);
                
                Object.entries(parsed.registrations || {}).forEach(([userId, events]) => {
                    console.log(`📊 User ${userId}: ${events.length} events - ${events.join(', ')}`);
                });
            } catch (error) {
                console.error('❌ Error parsing registration data:', error);
            }
        }
    }

    clearAllRegistrations() {
        console.log('🗑️ RegistrationManager: Clearing all registrations');
        localStorage.removeItem(this.STORAGE_KEY);
        this.ensureStorageExists();
        console.log('✅ RegistrationManager: All registrations cleared');
    }
}