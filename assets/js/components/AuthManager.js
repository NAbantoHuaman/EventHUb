// Authentication Manager 
import { User } from './User.js';
import { UserStorage, SessionStorage } from '../utils/storage.js';
import { RegistrationManager } from '../utils/RegistrationManager.js';
import { SESSION_TIMEOUT } from '../utils/constants.js';
import { validateEmail, validatePassword, getPasswordStrength } from '../utils/helpers.js';

export class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.sessionTimeout = SESSION_TIMEOUT;
        this.registrationManager = new RegistrationManager();
        this.init();
    }

    init() {
        this.checkSession();
        this.setupSessionTimeout();
    }

    loadUsers() {
        try {
            const usersData = UserStorage.getUsers();
            console.log('🔄 AuthManager: Loading users from storage:', usersData.length);
            return usersData.map(userData => new User(userData));
        } catch (error) {
            console.error('❌ AuthManager: Error loading users:', error);
            return [];
        }
    }

    saveUsers() {
        try {
            const usersData = this.users.map(user => user.toJSON());
            console.log('🔄 AuthManager: Saving users to storage:', usersData.length);
            return UserStorage.setUsers(usersData);
        } catch (error) {
            console.error('❌ AuthManager: Error saving users:', error);
            return false;
        }
    }

    saveSession(user) {
        try {
            const session = {
                userId: user.id,
                timestamp: Date.now()
            };
            SessionStorage.setSession(session);
            return true;
        } catch (error) {
            console.error('❌ AuthManager: Error saving session:', error);
            return false;
        }
    }

    checkSession() {
        try {
            const session = SessionStorage.getSession();
            if (session && SessionStorage.isSessionValid(this.sessionTimeout)) {
                console.log('🔄 AuthManager: Valid session found for user:', session.userId);
                
                this.users = this.loadUsers();
                const user = this.users.find(u => u.id === session.userId);
                
                if (user && user.isActive) {
                    this.currentUser = user;
                    console.log('✅ AuthManager: User restored from session:', user.getFullName());
                    
                    this.syncUserRegistrations();
                    
                    return true;
                } else {
                    console.error('❌ AuthManager: User not found or inactive');
                }
            } else {
                console.log('ℹ️ AuthManager: No valid session found');
            }
            
            // Session expired or invalid
            this.clearSession();
            return false;
        } catch (error) {
            console.error('❌ AuthManager: Error checking session:', error);
            this.clearSession();
            return false;
        }
    }

    syncUserRegistrations() {
        if (!this.currentUser) return;
        
        console.log('🔄 AuthManager: Syncing user registrations...');
        
        // Get registrations from RegistrationManager
        const registrations = this.registrationManager.getUserRegistrations(this.currentUser.id);
        console.log('📊 AuthManager: Found registrations in RegistrationManager:', registrations.length);
        
        // Store in user object for compatibility
        this.currentUser.eventsRegistered = registrations;
        
        console.log('✅ AuthManager: User registrations synced');
    }

    clearSession() {
        SessionStorage.clearSession();
        this.currentUser = null;
    }

    setupSessionTimeout() {
        // Extend session on user activity
        const extendSession = () => {
            if (this.currentUser) {
                SessionStorage.extendSession();
            }
        };

        // Listen for user activity
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
            document.addEventListener(event, extendSession, { passive: true });
        });
    }

    async register(userData) {
        try {
            console.log('🔄 AuthManager: Registering user:', userData.email);
            
            // Validate user data
            const validation = User.validateUserData(userData);
            if (!validation.isValid) {
                throw new Error(validation.errors[0]);
            }

            // Check if email already exists
            const existingUser = this.users.find(user => 
                user.email.toLowerCase() === userData.email.toLowerCase()
            );
            
            if (existingUser) {
                throw new Error('Ya existe una cuenta con este correo electrónico');
            }

            // Create new user
            const newUser = new User(userData);
            console.log('✅ AuthManager: User created:', newUser.getFullName());
            
            this.users.push(newUser);
            const saved = this.saveUsers();
            
            if (!saved) {
                throw new Error('Error al guardar el usuario');
            }

            console.log('✅ AuthManager: User registered successfully');
            return { success: true, user: newUser.toJSON() };
        } catch (error) {
            console.error('❌ AuthManager: Registration error:', error);
            return { success: false, error: error.message };
        }
    }

    async login(email, password, rememberMe = false) {
        try {
            console.log('🔄 AuthManager: Login attempt for:', email);
            
            // ✅ CRITICAL: Always reload users from storage before login
            this.users = this.loadUsers();
            console.log('✅ AuthManager: Reloaded users from storage:', this.users.length);
            
            // Find user by email
            const user = this.users.find(u => 
                u.email.toLowerCase() === email.toLowerCase() && u.isActive
            );

            if (!user) {
                throw new Error('Correo electrónico o contraseña incorrectos');
            }

            // Verify password (in production, this would use proper hashing)
            if (user.password !== password) {
                throw new Error('Correo electrónico o contraseña incorrectos');
            }

            // Update last login
            user.updateLastLogin();
            this.currentUser = user;
            
            this.syncUserRegistrations();
            
            const saved = this.saveUsers();
            if (saved) {
                this.saveSession(user);
                console.log('✅ AuthManager: Login successful for:', user.getFullName());
                return { success: true, user: user.toJSON() };
            } else {
                throw new Error('Error al guardar los datos de sesión');
            }
        } catch (error) {
            console.error('❌ AuthManager: Login error:', error);
            return { success: false, error: error.message };
        }
    }

    logout() {
        this.clearSession();
        this.currentUser = null;
        
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }

    updateUser(userId, updates) {
        try {
            console.log('🔄 AuthManager: Updating user:', userId);
            
            const userIndex = this.users.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                throw new Error('Usuario no encontrado');
            }

            // Validate email if being updated
            if (updates.email && updates.email !== this.users[userIndex].email) {
                if (!validateEmail(updates.email)) {
                    throw new Error('El formato del correo electrónico no es válido');
                }
                
                if (this.users.find(u => u.email.toLowerCase() === updates.email.toLowerCase() && u.id !== userId)) {
                    throw new Error('Ya existe una cuenta con este correo electrónico');
                }
            }

            // Update user data
            Object.assign(this.users[userIndex], updates);
            
            // Update current user if it's the same user
            if (this.currentUser && this.currentUser.id === userId) {
                Object.assign(this.currentUser, updates);
                console.log('✅ AuthManager: Current user object updated');
            }

            const saved = this.saveUsers();
            if (saved) {
                console.log('✅ AuthManager: User update saved successfully');
                return { success: true, user: this.users[userIndex].toJSON() };
            } else {
                throw new Error('Error al guardar los cambios');
            }
        } catch (error) {
            console.error('❌ AuthManager: Update user error:', error);
            return { success: false, error: error.message };
        }
    }

    changePassword(userId, currentPassword, newPassword) {
        try {
            const user = this.users.find(u => u.id === userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // Verify current password
            if (user.password !== currentPassword) {
                throw new Error('La contraseña actual es incorrecta');
            }

            // Validate new password
            if (!validatePassword(newPassword)) {
                throw new Error('La nueva contraseña debe tener al menos 8 caracteres');
            }

            // Update password
            user.password = newPassword;
            this.saveUsers();

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    deleteUser(userId) {
        try {
            const userIndex = this.users.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                throw new Error('Usuario no encontrado');
            }

            // Remove user
            this.users.splice(userIndex, 1);
            this.saveUsers();

            // If deleting current user, logout
            if (this.currentUser && this.currentUser.id === userId) {
                this.logout();
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    requireAuth() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    getCurrentUser() {
        if (this.currentUser) {
            this.syncUserRegistrations();
        }
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getUserById(userId) {
        console.log('🔄 AuthManager: Getting user by ID from storage:', userId);
        
        const userData = UserStorage.getUserById(userId);
        if (userData) {
            console.log(`✅ AuthManager: User found: ${userData.firstName} ${userData.lastName}`);
            return new User(userData);
        } else {
            console.error('❌ AuthManager: User not found in storage:', userId);
            return null;
        }
    }

    getUserByEmail(email) {
        return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    getAllUsers() {
        return this.users.map(user => user.toPublicJSON());
    }

    getActiveUsers() {
        return this.users.filter(u => u.isActive).map(user => user.toPublicJSON());
    }

    getUserStats() {
        return {
            total: this.users.length,
            active: this.users.filter(u => u.isActive).length,
            inactive: this.users.filter(u => !u.isActive).length,
            newThisWeek: this.users.filter(u => u.isNewUser()).length
        };
    }

    // Password utilities
    getPasswordStrength(password) {
        return getPasswordStrength(password);
    }

    // Session utilities
    extendSession() {
        if (this.currentUser) {
            SessionStorage.extendSession();
        }
    }

    getSessionTimeRemaining() {
        const session = SessionStorage.getSession();
        if (!session) return 0;
        
        const elapsed = Date.now() - session.timestamp;
        const remaining = this.sessionTimeout - elapsed;
        return Math.max(0, remaining);
    }

    isSessionExpiringSoon(threshold = 5 * 60 * 1000) { // 5 minutes
        const remaining = this.getSessionTimeRemaining();
        return remaining > 0 && remaining <= threshold;
    }

    registerUserForEvent(eventId) {
        if (!this.currentUser) {
            console.error('❌ AuthManager: No current user for registration');
            return false;
        }

        console.log('🔄 AuthManager: Registering user for event:', eventId);
        console.log('📊 AuthManager: User:', this.currentUser.getFullName(), 'ID:', this.currentUser.id);
        
        const success = this.registrationManager.addRegistration(this.currentUser.id, eventId);
        
        if (success) {
            console.log('✅ AuthManager: Registration successful');
            
            this.syncUserRegistrations();
            
            return true;
        } else {
            console.error('❌ AuthManager: Registration failed');
            return false;
        }
    }

    unregisterUserFromEvent(eventId) {
        if (!this.currentUser) {
            console.error('❌ AuthManager: No current user for unregistration');
            return false;
        }

        console.log('🔄 AuthManager: Unregistering user from event:', eventId);
        console.log('📊 AuthManager: User:', this.currentUser.getFullName(), 'ID:', this.currentUser.id);
        
        const success = this.registrationManager.removeRegistration(this.currentUser.id, eventId);
        
        if (success) {
            console.log('✅ AuthManager: Unregistration successful');
            
            this.syncUserRegistrations();
            
            return true;
        } else {
            console.error('❌ AuthManager: Unregistration failed');
            return false;
        }
    }

    isUserRegisteredForEvent(eventId) {
        if (!this.currentUser) return false;
        
        return this.registrationManager.isUserRegistered(this.currentUser.id, eventId);
    }

    getUserRegistrations() {
        if (!this.currentUser) {
            console.log('ℹ️ AuthManager: No current user, returning empty registrations');
            return [];
        }
        
        console.log('🔄 AuthManager: Getting registrations for user:', this.currentUser.id);
        
        const registrations = this.registrationManager.getUserRegistrations(this.currentUser.id);
        console.log('📊 AuthManager: Found registrations:', registrations.length);
        
        this.currentUser.eventsRegistered = registrations;
        
        return registrations;
    }

    // Legacy methods for compatibility
    markEventAttended(eventId) {
        // This would be implemented in a separate attendance system
        console.log('ℹ️ AuthManager: markEventAttended called for:', eventId);
        return true;
    }

    hasUserAttendedEvent(eventId) {
        // This would be implemented in a separate attendance system
        return false;
    }

    debugCurrentUser() {
        console.log('🔍 AuthManager: DEBUG - Current user state');
        if (this.currentUser) {
            console.log('📊 AuthManager: User:', this.currentUser.getFullName());
            console.log('📊 AuthManager: User ID:', this.currentUser.id);
            
            const registrations = this.getUserRegistrations();
            console.log('📊 AuthManager: Registrations:', registrations.length);
            console.log('📊 AuthManager: Registration IDs:', registrations);
        } else {
            console.log('📊 AuthManager: No current user');
        }
        
        // Debug registration manager
        this.registrationManager.debugRegistrations();
    }
}