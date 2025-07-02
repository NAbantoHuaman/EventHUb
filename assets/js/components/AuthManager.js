// Gestor de Autenticación 
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
            console.log('🔄 AuthManager: Cargando usuarios desde almacenamiento:', usersData.length);
            return usersData.map(userData => new User(userData));
        } catch (error) {
            console.error('❌ AuthManager: Error al cargar usuarios:', error);
            return [];
        }
    }

    saveUsers() {
        try {
            const usersData = this.users.map(user => user.toJSON());
            console.log('🔄 AuthManager: Guardando usuarios en almacenamiento:', usersData.length);
            return UserStorage.setUsers(usersData);
        } catch (error) {
            console.error('❌ AuthManager: Error al guardar usuarios:', error);
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
            console.error('❌ AuthManager: Error al guardar la sesión:', error);
            return false;
        }
    }

    checkSession() {
        try {
            const session = SessionStorage.getSession();
            if (session && SessionStorage.isSessionValid(this.sessionTimeout)) {
                console.log('🔄 AuthManager: Sesión válida encontrada para el usuario:', session.userId);
                
                this.users = this.loadUsers();
                const user = this.users.find(u => u.id === session.userId);
                
                if (user && user.isActive) {
                    this.currentUser = user;
                    console.log('✅ AuthManager: Usuario restaurado desde la sesión:', user.getFullName());
                    
                    this.syncUserRegistrations();
                    
                    return true;
                } else {
                    console.error('❌ AuthManager: Usuario no encontrado o inactivo');
                }
            } else {
                console.log('ℹ️ AuthManager: No se encontró una sesión válida');
            }
            
            // Sesión expirada o inválida
            this.clearSession();
            return false;
        } catch (error) {
            console.error('❌ AuthManager: Error al verificar la sesión:', error);
            this.clearSession();
            return false;
        }
    }

    syncUserRegistrations() {
        if (!this.currentUser) return;
        
        console.log('🔄 AuthManager: Sincronizando registros de usuario...');
        
        // Obtener registros desde RegistrationManager
        const registrations = this.registrationManager.getUserRegistrations(this.currentUser.id);
        console.log('📊 AuthManager: Registros encontrados en RegistrationManager:', registrations.length);
        
        // Guardar en el objeto usuario para compatibilidad
        this.currentUser.eventsRegistered = registrations;
        
        console.log('✅ AuthManager: Registros de usuario sincronizados');
    }

    clearSession() {
        SessionStorage.clearSession();
        this.currentUser = null;
    }

    setupSessionTimeout() {
        // Extender sesión en actividad del usuario
        const extendSession = () => {
            if (this.currentUser) {
                SessionStorage.extendSession();
            }
        };

        // Escuchar actividad del usuario
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
            document.addEventListener(event, extendSession, { passive: true });
        });
    }

    async register(userData) {
        try {
            console.log('🔄 AuthManager: Registrando usuario:', userData.email);
            
            // Validar datos del usuario
            const validation = User.validateUserData(userData);
            if (!validation.isValid) {
                throw new Error(validation.errors[0]);
            }

            // Verificar si el correo ya existe
            const existingUser = this.users.find(user => 
                user.email.toLowerCase() === userData.email.toLowerCase()
            );
            
            if (existingUser) {
                throw new Error('Ya existe una cuenta con este correo electrónico');
            }

            // Crear nuevo usuario
            const newUser = new User(userData);
            console.log('✅ AuthManager: Usuario creado:', newUser.getFullName());
            
            this.users.push(newUser);
            const saved = this.saveUsers();
            
            if (!saved) {
                throw new Error('Error al guardar el usuario');
            }

            console.log('✅ AuthManager: Usuario registrado exitosamente');
            return { success: true, user: newUser.toJSON() };
        } catch (error) {
            console.error('❌ AuthManager: Error en el registro:', error);
            return { success: false, error: error.message };
        }
    }

    async login(email, password, rememberMe = false) {
        try {
            console.log('🔄 AuthManager: Intento de inicio de sesión para:', email);
            
            // ✅ CRÍTICO: Siempre recargar usuarios desde almacenamiento antes de iniciar sesión
            this.users = this.loadUsers();
            console.log('✅ AuthManager: Usuarios recargados desde almacenamiento:', this.users.length);
            
            // Buscar usuario por correo
            const user = this.users.find(u => 
                u.email.toLowerCase() === email.toLowerCase() && u.isActive
            );

            if (!user) {
                throw new Error('Correo electrónico o contraseña incorrectos');
            }

            // Verificar contraseña (en producción, esto usaría hash adecuado)
            if (user.password !== password) {
                throw new Error('Correo electrónico o contraseña incorrectos');
            }

            // Actualizar último acceso
            user.updateLastLogin();
            this.currentUser = user;
            
            this.syncUserRegistrations();
            
            const saved = this.saveUsers();
            if (saved) {
                this.saveSession(user);
                console.log('✅ AuthManager: Inicio de sesión exitoso para:', user.getFullName());
                return { success: true, user: user.toJSON() };
            } else {
                throw new Error('Error al guardar los datos de sesión');
            }
        } catch (error) {
            console.error('❌ AuthManager: Error en inicio de sesión:', error);
            return { success: false, error: error.message };
        }
    }

    logout() {
        this.clearSession();
        this.currentUser = null;
        
        // Redirigir a la página de login si no está ya ahí
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }

    updateUser(userId, updates) {
        try {
            console.log('🔄 AuthManager: Actualizando usuario:', userId);
            
            const userIndex = this.users.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                throw new Error('Usuario no encontrado');
            }

            // Validar correo si se está actualizando
            if (updates.email && updates.email !== this.users[userIndex].email) {
                if (!validateEmail(updates.email)) {
                    throw new Error('El formato del correo electrónico no es válido');
                }
                
                if (this.users.find(u => u.email.toLowerCase() === updates.email.toLowerCase() && u.id !== userId)) {
                    throw new Error('Ya existe una cuenta con este correo electrónico');
                }
            }

            // Actualizar datos del usuario
            Object.assign(this.users[userIndex], updates);
            
            // Actualizar usuario actual si es el mismo
            if (this.currentUser && this.currentUser.id === userId) {
                Object.assign(this.currentUser, updates);
                console.log('✅ AuthManager: Objeto usuario actual actualizado');
            }

            const saved = this.saveUsers();
            if (saved) {
                console.log('✅ AuthManager: Cambios de usuario guardados exitosamente');
                return { success: true, user: this.users[userIndex].toJSON() };
            } else {
                throw new Error('Error al guardar los cambios');
            }
        } catch (error) {
            console.error('❌ AuthManager: Error al actualizar usuario:', error);
            return { success: false, error: error.message };
        }
    }

    changePassword(userId, currentPassword, newPassword) {
        try {
            const user = this.users.find(u => u.id === userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // Verificar contraseña actual
            if (user.password !== currentPassword) {
                throw new Error('La contraseña actual es incorrecta');
            }

            // Validar nueva contraseña
            if (!validatePassword(newPassword)) {
                throw new Error('La nueva contraseña debe tener al menos 8 caracteres');
            }

            // Actualizar contraseña
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

            // Eliminar usuario
            this.users.splice(userIndex, 1);
            this.saveUsers();

            // Si se elimina el usuario actual, cerrar sesión
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
        console.log('🔄 AuthManager: Obteniendo usuario por ID desde almacenamiento:', userId);
        
        const userData = UserStorage.getUserById(userId);
        if (userData) {
            console.log(`✅ AuthManager: Usuario encontrado: ${userData.firstName} ${userData.lastName}`);
            return new User(userData);
        } else {
            console.error('❌ AuthManager: Usuario no encontrado en almacenamiento:', userId);
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

    // Utilidades de contraseña
    getPasswordStrength(password) {
        return getPasswordStrength(password);
    }

    // Utilidades de sesión
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

    isSessionExpiringSoon(threshold = 5 * 60 * 1000) { // 5 minutos
        const remaining = this.getSessionTimeRemaining();
        return remaining > 0 && remaining <= threshold;
    }

    registerUserForEvent(eventId) {
        if (!this.currentUser) {
            console.error('❌ AuthManager: No hay usuario actual para el registro');
            return false;
        }

        console.log('🔄 AuthManager: Registrando usuario para evento:', eventId);
        console.log('📊 AuthManager: Usuario:', this.currentUser.getFullName(), 'ID:', this.currentUser.id);
        
        const success = this.registrationManager.addRegistration(this.currentUser.id, eventId);
        
        if (success) {
            console.log('✅ AuthManager: Registro exitoso');
            
            this.syncUserRegistrations();
            
            return true;
        } else {
            console.error('❌ AuthManager: Falló el registro');
            return false;
        }
    }

    unregisterUserFromEvent(eventId) {
        if (!this.currentUser) {
            console.error('❌ AuthManager: No hay usuario actual para cancelar registro');
            return false;
        }

        console.log('🔄 AuthManager: Cancelando registro de usuario para evento:', eventId);
        console.log('📊 AuthManager: Usuario:', this.currentUser.getFullName(), 'ID:', this.currentUser.id);
        
        const success = this.registrationManager.removeRegistration(this.currentUser.id, eventId);
        
        if (success) {
            console.log('✅ AuthManager: Cancelación de registro exitosa');
            
            this.syncUserRegistrations();
            
            return true;
        } else {
            console.error('❌ AuthManager: Falló la cancelación de registro');
            return false;
        }
    }

    isUserRegisteredForEvent(eventId) {
        if (!this.currentUser) return false;
        
        return this.registrationManager.isUserRegistered(this.currentUser.id, eventId);
    }

    getUserRegistrations() {
        if (!this.currentUser) {
            console.log('ℹ️ AuthManager: No hay usuario actual, devolviendo registros vacíos');
            return [];
        }
        
        console.log('🔄 AuthManager: Obteniendo registros para usuario:', this.currentUser.id);
        
        const registrations = this.registrationManager.getUserRegistrations(this.currentUser.id);
        console.log('📊 AuthManager: Registros encontrados:', registrations.length);
        
        this.currentUser.eventsRegistered = registrations;
        
        return registrations;
    }

    // Métodos heredados para compatibilidad
    markEventAttended(eventId) {
        // Esto se implementaría en un sistema de asistencia separado
        console.log('ℹ️ AuthManager: markEventAttended llamado para:', eventId);
        return true;
    }

    hasUserAttendedEvent(eventId) {
        // Esto se implementaría en un sistema de asistencia separado
        return false;
    }

    debugCurrentUser() {
        console.log('🔍 AuthManager: DEPURAR - Estado actual del usuario');
        if (this.currentUser) {
            console.log('📊 AuthManager: Usuario:', this.currentUser.getFullName());
            console.log('📊 AuthManager: ID de usuario:', this.currentUser.id);
            
            const registrations = this.getUserRegistrations();
            console.log('📊 AuthManager: Registros:', registrations.length);
            console.log('📊 AuthManager: IDs de registro:', registrations);
        } else {
            console.log('📊 AuthManager: No hay usuario actual');
        }
        
        // Depurar gestor de registros
        this.registrationManager.debugRegistrations();
    }
}