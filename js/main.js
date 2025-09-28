// Archivo principal para funcionalidades generales
class TiendaWebApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeNotifications();
        this.checkForPromotions();
    }

    setupEventListeners() {
        // Scroll suave para navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(link.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        // Efecto parallax en hero
        window.addEventListener('scroll', this.handleScroll.bind(this));

        // Lazy loading para imágenes
        this.setupLazyLoading();
    }

    handleScroll() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });

        // Mostrar/ocultar botón de scroll to top
        this.toggleScrollTopButton();
    }

    toggleScrollTopButton() {
        let scrollTopBtn = document.getElementById('scroll-top-btn');
        
        if (!scrollTopBtn) {
            scrollTopBtn = document.createElement('button');
            scrollTopBtn.id = 'scroll-top-btn';
            scrollTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            scrollTopBtn.className = 'scroll-top-btn';
            scrollTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
            document.body.appendChild(scrollTopBtn);
        }

        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    initializeNotifications() {
        // Sistema de notificaciones push simulado
        this.requestNotificationPermission();
    }

    async requestNotificationPermission() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notificaciones habilitadas');
                // Programar notificaciones de ofertas
                this.schedulePromotionNotifications();
            }
        }
    }

    schedulePromotionNotifications() {
        // Simular notificación de oferta después de 30 segundos
        setTimeout(() => {
            this.showPromotionNotification({
                title: '🎉 ¡Oferta especial!',
                message: '20% de descuento en electrónicos. ¡Solo por hoy!',
                discount: 20,
                category: 'electronica'
            });
        }, 30000);
    }

    showPromotionNotification(promotion) {
        if (Notification.permission === 'granted') {
            new Notification(promotion.title, {
                body: promotion.message,
                icon: 'https://via.placeholder.com/64x64/667eea/ffffff?text=TW',
                badge: 'https://via.placeholder.com/32x32/667eea/ffffff?text=!',
                tag: 'promotion'
            });
        }

        // También mostrar notificación in-app
        this.showInAppPromotion(promotion);
    }

    showInAppPromotion(promotion) {
        const promoBar = document.createElement('div');
        promoBar.className = 'promotion-bar';
        promoBar.innerHTML = `
            <div class="promotion-content">
                <span class="promotion-text">${promotion.title} ${promotion.message}</span>
                <button class="btn-promo" onclick="app.applyPromotion('${promotion.category}', ${promotion.discount})">
                    Ver Ofertas
                </button>
                <button class="promotion-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.insertBefore(promoBar, document.body.firstChild);

        // Auto-remover después de 10 segundos
        setTimeout(() => {
            if (promoBar.parentElement) {
                promoBar.remove();
            }
        }, 10000);
    }

    applyPromotion(category, discount) {
        // Filtrar productos por categoría
        document.getElementById('category-filter').value = category;
        filterProducts();

        // Scroll a productos
        scrollToProducts();

        // Mostrar mensaje de descuento aplicado
        cart.showNotification(`¡${discount}% de descuento aplicado en ${category}!`, 'success');

        // Remover barra de promoción
        const promoBar = document.querySelector('.promotion-bar');
        if (promoBar) promoBar.remove();
    }

    checkForPromotions() {
        // Verificar si hay promociones activas
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();

        // Promoción de lunes a viernes de 9-17h
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour <= 17) {
            setTimeout(() => {
                this.showPromotionNotification({
                    title: '💼 Oferta empresarial',
                    message: 'Descuentos especiales en horario laboral',
                    discount: 15,
                    category: 'electronica'
                });
            }, 5000);
        }

        // Promoción de fin de semana
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            setTimeout(() => {
                this.showPromotionNotification({
                    title: '🎉 Weekend Sale',
                    message: '¡Ofertas especiales de fin de semana!',
                    discount: 25,
                    category: 'ropa'
                });
            }, 8000);
        }
    }
}

// Sistema de Analytics simulado
class Analytics {
    constructor() {
        this.events = [];
        this.sessionStart = Date.now();
    }

    track(event, data = {}) {
        const eventData = {
            event: event,
            timestamp: Date.now(),
            sessionTime: Date.now() - this.sessionStart,
            url: window.location.href,
            userAgent: navigator.userAgent,
            ...data
        };

        this.events.push(eventData);
        console.log('Analytics Event:', eventData);

        // Simular envío a servidor
        this.sendToServer(eventData);
    }

    sendToServer(eventData) {
        // Simular API call
        setTimeout(() => {
            console.log('Event sent to analytics server:', eventData);
        }, 100);
    }

    trackProductView(productId) {
        const product = getProductById(productId);
        this.track('product_view', {
            productId: productId,
            productName: product?.name,
            productCategory: product?.category,
            productPrice: product?.price
        });
    }

    trackAddToCart(productId, quantity) {
        const product = getProductById(productId);
        this.track('add_to_cart', {
            productId: productId,
            productName: product?.name,
            productCategory: product?.category,
            productPrice: product?.price,
            quantity: quantity,
            cartValue: cart.getTotal()
        });
    }

    trackPurchase(orderData) {
        this.track('purchase', {
            orderNumber: orderData.orderNumber,
            orderValue: orderData.total,
            itemCount: cart.getTotalItems(),
            paymentMethod: orderData.paymentMethod
        });
    }

    trackSearch(searchTerm, resultCount) {
        this.track('search', {
            searchTerm: searchTerm,
            resultCount: resultCount
        });
    }

    getSessionSummary() {
        return {
            sessionDuration: Date.now() - this.sessionStart,
            totalEvents: this.events.length,
            events: this.events
        };
    }
}

// Utilidades generales
const Utils = {
    // Formatear precio
    formatPrice(price) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(price);
    },

    // Validar email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Generar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Formatear fecha
    formatDate(date) {
        return new Intl.DateTimeFormat('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
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
    },

    // Capitalizar primera letra
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // Truncar texto
    truncate(str, length) {
        return str.length > length ? str.substring(0, length) + '...' : str;
    }
};

// Sistema de Wishlist
class Wishlist {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('wishlist')) || [];
    }

    add(productId) {
        if (!this.items.includes(productId)) {
            this.items.push(productId);
            this.save();
            cart.showNotification('Producto agregado a favoritos', 'success');
        }
    }

    remove(productId) {
        this.items = this.items.filter(id => id !== productId);
        this.save();
        cart.showNotification('Producto removido de favoritos', 'info');
    }

    toggle(productId) {
        if (this.items.includes(productId)) {
            this.remove(productId);
        } else {
            this.add(productId);
        }
    }

    isInWishlist(productId) {
        return this.items.includes(productId);
    }

    getItems() {
        return this.items.map(id => getProductById(id)).filter(Boolean);
    }

    save() {
        localStorage.setItem('wishlist', JSON.stringify(this.items));
    }
}

// Instancias globales
const app = new TiendaWebApp();
const analytics = new Analytics();
const wishlist = new Wishlist();

// Override de funciones existentes para incluir analytics
const originalAddToCart = window.addToCart;
window.addToCart = function(productId, quantity = 1) {
    const result = originalAddToCart(productId, quantity);
    if (result) {
        analytics.trackAddToCart(productId, quantity);
    }
    return result;
};

const originalViewProductDetails = window.viewProductDetails;
window.viewProductDetails = function(productId) {
    analytics.trackProductView(productId);
    return originalViewProductDetails(productId);
};

// Event listeners para analytics
document.addEventListener('DOMContentLoaded', function() {
    // Track page load
    analytics.track('page_load');

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', Utils.throttle(() => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            if (scrollPercent === 25 || scrollPercent === 50 || scrollPercent === 75 || scrollPercent === 100) {
                analytics.track('scroll_depth', { depth: scrollPercent });
            }
        }
    }, 1000));

    // Track time on page
    window.addEventListener('beforeunload', () => {
        const summary = analytics.getSessionSummary();
        console.log('Session Summary:', summary);
    });
});

// Funciones globales adicionales
window.toggleWishlist = function(productId) {
    wishlist.toggle(productId);
};

window.scrollToProducts = function() {
    const productsSection = document.getElementById('productos');
    if (productsSection) {
        productsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
};
