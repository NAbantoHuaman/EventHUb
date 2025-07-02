// UI Manager Component 
import { createElement, addClass, removeClass, toggleClass } from '../utils/helpers.js';
import { formatDate, formatPrice } from '../utils/helpers.js';

export class UIManager {
    constructor() {
        this.activeModal = null;
        this.activeTab = 'all';
    }

    createEventCard(event, isRegistered = false) {
        console.log(`🎨 UIManager: Creating card for event "${event.name}" (${event.id})`);
        console.log(`📊 UIManager: isRegistered parameter: ${isRegistered}`);
        
        const isPast = new Date(event.date) <= new Date();
        const isFull = event.registered >= event.capacity;
        const progressPercentage = (event.registered / event.capacity) * 100;

        console.log(`📊 UIManager: Event state - isPast: ${isPast}, isFull: ${isFull}, isRegistered: ${isRegistered}`);

        let statusBadge;
        if (isPast) {
            statusBadge = '<span class="badge badge-past">Finalizado</span>';
        } else if (isFull) {
            statusBadge = '<span class="badge badge-full">Lleno</span>';
        } else if (isRegistered) {
            statusBadge = '<span class="badge badge-registered">✓ Inscrito</span>';
            console.log(`✅ UIManager: Event ${event.id} will show REGISTERED badge`);
        } else {
            statusBadge = '<span class="badge badge-available">Disponible</span>';
            console.log(`📊 UIManager: Event ${event.id} will show AVAILABLE badge`);
        }

        let actionButtons = '';
        if (isPast) {
            actionButtons = `
                <button class="btn btn-secondary" disabled>
                    Evento finalizado
                </button>
            `;
        } else if (isFull) {
            actionButtons = `
                <button class="btn btn-secondary" disabled>
                    Evento lleno
                </button>
            `;
        } else if (isRegistered) {
            actionButtons = `
                <button class="btn btn-danger" onclick="unregisterFromEvent('${event.id}')">
                    Cancelar inscripción
                </button>
            `;
            console.log(`✅ UIManager: Event ${event.id} will show UNREGISTER button`);
        } else {
            actionButtons = `
                <button class="btn btn-secondary" onclick="registerForEvent('${event.id}')">
                    Inscribirse
                </button>
            `;
            console.log(`📊 UIManager: Event ${event.id} will show REGISTER button`);
        }

        const cardHtml = `
            <article class="event-card" data-event-id="${event.id}">
                <div class="event-image-container">
                    <img src="${event.image}" alt="${event.name}" class="event-image" loading="lazy">
                    <div class="event-badges">
                        <span class="badge badge-category">${event.category}</span>
                        ${statusBadge}
                    </div>
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.name}</h3>
                    <p class="event-description">${event.description}</p>
                    <div class="event-details">
                        <div class="event-detail event-detail-date">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            ${formatDate(event.date)}
                        </div>
                        <div class="event-detail event-detail-location">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            ${event.location}
                        </div>
                        <div class="event-detail event-detail-organizer">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            ${event.organizer}
                        </div>
                        <div class="event-detail event-detail-capacity">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            ${event.registered}/${event.capacity} inscritos
                        </div>
                    </div>
                    <div class="event-meta">
                        <div class="event-price">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="1" x2="12" y2="23"/>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                            ${formatPrice(event.price)}
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-primary" onclick="openEventModal('${event.id}')">
                            Ver detalles
                        </button>
                        ${actionButtons}
                    </div>
                </div>
            </article>
        `;

        console.log(`✅ UIManager: Card created for event ${event.id} with registration state: ${isRegistered}`);
        return cardHtml;
    }

    // Tab Management
    switchTab(tabName) {
        this.activeTab = tabName;
        
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });
        
        return tabName;
    }

    // Filter UI Updates
    updateFilterOptions(categories, locations) {
        this.updateCategoryFilter(categories);
        this.updateLocationFilter(locations);
    }

    updateCategoryFilter(categories) {
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="all">Todas las categorías</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        }
    }

    updateLocationFilter(locations) {
        const locationFilter = document.getElementById('location-filter');
        if (locationFilter) {
            locationFilter.innerHTML = '<option value="all">Todas las ubicaciones</option>';
            locations.forEach(location => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                locationFilter.appendChild(option);
            });
        }
    }

    // Stats Updates
    updateStats(stats) {
        this.updateElement('total-events', stats.total);
        this.updateElement('available-events', stats.available);
        this.updateElement('categories-count', stats.categories);
    }

    // Enhanced count updates with animation
    updateCounts(allCount, registeredCount, filteredCount) {
        console.log('📊 UIManager: Updating counts:', { allCount, registeredCount, filteredCount });
        
        // Update tab counts with animation
        this.animateCountUpdate('all-count', allCount);
        this.animateCountUpdate('registered-count', registeredCount);
        
        // Update events found count
        this.updateElement('events-found', `${filteredCount} eventos encontrados`);
    }

    // Animate count updates
    animateCountUpdate(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const currentValue = parseInt(element.textContent) || 0;
        
        // Only animate if value changed
        if (currentValue !== newValue) {
            console.log(`🎬 UIManager: Animating ${elementId} from ${currentValue} to ${newValue}`);
            
            // Add pulse animation
            element.style.transform = 'scale(1.2)';
            element.style.transition = 'transform 0.2s ease, color 0.2s ease';
            element.style.color = 'var(--primary-600)';
            
            setTimeout(() => {
                element.textContent = newValue;
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 100);
            
            setTimeout(() => {
                element.style.transition = '';
            }, 300);
        } else {
            element.textContent = newValue;
        }
    }

    // Utility Methods
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    showElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'block';
        }
    }

    hideElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    }

    toggleElement(id, show) {
        if (show) {
            this.showElement(id);
        } else {
            this.hideElement(id);
        }
    }

    // Loading States
    setButtonLoading(button, loading) {
        if (!button) return;
        
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    // Empty States
    showEmptyState(container, title, message, showButton = false) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="no-events">
                <svg class="no-events-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <h3>${title}</h3>
                <p>${message}</p>
                ${showButton ? '<button id="show-all-events" class="btn btn-primary">Ver todos los eventos</button>' : ''}
            </div>
        `;
    }

    // Animation Helpers
    fadeIn(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    fadeOut(element, duration = 300) {
        if (!element) return;
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(1 - (progress / duration), 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }

    slideIn(element, direction = 'left', duration = 300) {
        if (!element) return;
        
        const transforms = {
            left: 'translateX(-100%)',
            right: 'translateX(100%)',
            up: 'translateY(-100%)',
            down: 'translateY(100%)'
        };
        
        element.style.transform = transforms[direction];
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);
            
            element.style.transform = `${transforms[direction].replace('100%', `${100 - (percentage * 100)}%`)}`;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.transform = '';
            }
        };
        
        requestAnimationFrame(animate);
    }
}