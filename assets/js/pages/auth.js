// Authentication Pages JavaScript - Redesigned
import { AuthManager } from '../components/AuthManager.js';
import { NotificationManager } from '../components/NotificationManager.js';
import { getPasswordStrength } from '../utils/helpers.js';

class AuthPageManager {
    constructor() {
        this.authManager = new AuthManager();
        this.notificationManager = new NotificationManager();
        this.init();
    }

    init() {
        this.checkRedirection();
        this.setupEventListeners();
        this.setupPasswordStrength();
    }

    checkRedirection() {
        const currentPage = window.location.pathname;
        const isAuthPage = currentPage.includes('login.html') || currentPage.includes('register.html');
        
        if (this.authManager.currentUser && isAuthPage) {
            // User is logged in, redirect to main app
            window.location.href = 'index.html';
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            
            // Password toggle
            const togglePassword = document.getElementById('toggle-password');
            if (togglePassword) {
                togglePassword.addEventListener('click', () => this.togglePasswordVisibility('password'));
            }
        }
        
        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
            
            // Password toggles
            const togglePassword = document.getElementById('toggle-password');
            const toggleConfirmPassword = document.getElementById('toggle-confirm-password');
            
            if (togglePassword) {
                togglePassword.addEventListener('click', () => this.togglePasswordVisibility('password'));
            }
            if (toggleConfirmPassword) {
                toggleConfirmPassword.addEventListener('click', () => this.togglePasswordVisibility('confirmPassword'));
            }
        }
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', () => this.updatePasswordStrength());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = formData.get('remember-me') === 'on';
        
        console.log('🔄 AuthPageManager: Login attempt for:', email);
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        this.setButtonLoading(submitBtn, true);
        
        try {
            const result = await this.authManager.login(email, password, rememberMe);
            
            console.log('📊 AuthPageManager: Login result:', result.success);
            
            if (result.success) {
                this.notificationManager.success(
                    `¡Bienvenido de vuelta, ${result.user.firstName}!`
                );
                
                // Redirect to main app
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                this.notificationManager.error(result.error);
            }
        } catch (error) {
            console.error('❌ AuthPageManager: Login error:', error);
            this.notificationManager.error('Error al iniciar sesión');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password')
        };
        
        const confirmPassword = formData.get('confirmPassword');
        
        console.log('🔄 AuthPageManager: Registration attempt for:', userData.email);
        
        // Validate passwords match
        if (userData.password !== confirmPassword) {
            this.notificationManager.error('Las contraseñas no coinciden');
            return;
        }
        
        // Validate terms acceptance
        const termsCheckbox = document.getElementById('terms');
        if (!termsCheckbox || !termsCheckbox.checked) {
            this.notificationManager.error('Debes aceptar los términos y condiciones');
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        this.setButtonLoading(submitBtn, true);
        
        try {
            const result = await this.authManager.register(userData);
            
            console.log('📊 AuthPageManager: Registration result:', result.success);
            
            if (result.success) {
                this.notificationManager.success(
                    '¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.'
                );
                
                // Redirect to login
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                this.notificationManager.error(result.error);
            }
        } catch (error) {
            console.error('❌ AuthPageManager: Registration error:', error);
            this.notificationManager.error('Error al crear la cuenta');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        let button;
        
        // Corregir la selección del botón
        if (inputId === 'password') {
            button = document.getElementById('toggle-password');
        } else if (inputId === 'confirmPassword') {
            button = document.getElementById('toggle-confirm-password');
        }
        
        if (!input || !button) return;
        
        if (input.type === 'password') {
            input.type = 'text';
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
            `;
        } else {
            input.type = 'password';
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            `;
        }
    }

    updatePasswordStrength() {
        const passwordInput = document.getElementById('password');
        const strengthFill = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');
        
        if (!passwordInput || !strengthFill || !strengthText) return;
        
        const strength = getPasswordStrength(passwordInput.value);
        
        strengthFill.className = `strength-fill ${strength.class}`;
        strengthText.textContent = strength.text;
    }

    setButtonLoading(button, loading) {
        if (!button) return;
        
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');
        
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
            if (btnText) btnText.style.opacity = '0';
            if (btnLoader) btnLoader.style.display = 'block';
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            if (btnText) btnText.style.opacity = '1';
            if (btnLoader) btnLoader.style.display = 'none';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authPageManager = new AuthPageManager();
});