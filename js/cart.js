// Carrito de compras
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartUI();
    }

    // Agregar producto al carrito
    addItem(productId, quantity = 1) {
        const product = getProductById(productId);
        if (!product) return false;

        // Verificar stock disponible
        if (product.stock < quantity) {
            this.showNotification('Stock insuficiente', 'error');
            return false;
        }

        const existingItem = this.items.find(item => item.productId === productId);
        
        if (existingItem) {
            // Verificar que no exceda el stock
            if (existingItem.quantity + quantity > product.stock) {
                this.showNotification('No hay suficiente stock disponible', 'error');
                return false;
            }
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                productId: productId,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }

        this.saveCart();
        this.updateCartUI();
        this.showNotification(`${product.name} agregado al carrito`, 'success');
        return true;
    }

    // Remover producto del carrito
    removeItem(productId) {
        this.items = this.items.filter(item => item.productId !== productId);
        this.saveCart();
        this.updateCartUI();
        this.showNotification('Producto removido del carrito', 'info');
    }

    // Actualizar cantidad de un producto
    updateQuantity(productId, newQuantity) {
        const product = getProductById(productId);
        if (!product) return false;

        if (newQuantity <= 0) {
            this.removeItem(productId);
            return true;
        }

        if (newQuantity > product.stock) {
            this.showNotification('Cantidad excede el stock disponible', 'error');
            return false;
        }

        const item = this.items.find(item => item.productId === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartUI();
        }
        return true;
    }

    // Vaciar carrito
    clear() {
        this.items = [];
        this.saveCart();
        this.updateCartUI();
        this.showNotification('Carrito vaciado', 'info');
    }

    // Obtener total del carrito
    getTotal() {
        return this.items.reduce((total, item) => {
            const product = getProductById(item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    }

    // Obtener cantidad total de items
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Obtener detalles completos del carrito
    getCartDetails() {
        return this.items.map(item => {
            const product = getProductById(item.productId);
            return {
                ...item,
                product: product,
                subtotal: product ? product.price * item.quantity : 0
            };
        }).filter(item => item.product); // Filtrar productos que ya no existen
    }

    // Guardar carrito en localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    // Actualizar UI del carrito
    updateCartUI() {
        this.updateCartCount();
        this.updateCartModal();
    }

    // Actualizar contador del carrito
    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = this.getTotalItems();
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // Actualizar modal del carrito
    updateCartModal() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        if (!cartItems || !cartTotal) return;

        const cartDetails = this.getCartDetails();
        
        if (cartDetails.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>Tu carrito está vacío</p>
                    <button class="btn-primary" onclick="toggleCart()">Continuar Comprando</button>
                </div>
            `;
            cartTotal.textContent = '0.00';
            return;
        }

        cartItems.innerHTML = cartDetails.map(item => `
            <div class="cart-item" data-product-id="${item.productId}">
                <div class="cart-item-image">${item.product.image}</div>
                <div class="cart-item-info">
                    <h4>${item.product.name}</h4>
                    <p class="cart-item-price">$${item.product.price.toFixed(2)} c/u</p>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn" onclick="cart.updateQuantity(${item.productId}, ${item.quantity - 1})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="cart.updateQuantity(${item.productId}, ${item.quantity + 1})">+</button>
                    <button class="remove-btn" onclick="cart.removeItem(${item.productId})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="cart-item-subtotal">$${item.subtotal.toFixed(2)}</div>
            </div>
        `).join('');

        cartTotal.textContent = this.getTotal().toFixed(2);
    }

    // Mostrar notificaciones
    showNotification(message, type = 'info') {
        // Remover notificación existente
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remover después de 3 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    // Obtener icono para notificación
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    // Validar carrito antes del checkout
    validateCart() {
        const cartDetails = this.getCartDetails();
        const errors = [];

        for (const item of cartDetails) {
            if (item.quantity > item.product.stock) {
                errors.push(`${item.product.name}: Stock insuficiente (disponible: ${item.product.stock})`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Procesar checkout
    processCheckout(customerData, paymentData) {
        const validation = this.validateCart();
        
        if (!validation.isValid) {
            this.showNotification('Error en el carrito: ' + validation.errors.join(', '), 'error');
            return false;
        }

        // Simular procesamiento de pago
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% de éxito
                    // Actualizar stock de productos
                    this.items.forEach(item => {
                        updateProductStock(item.productId, item.quantity);
                    });

                    // Generar número de orden
                    const orderNumber = 'ORD-' + Date.now();
                    
                    // Limpiar carrito
                    this.clear();
                    
                    resolve({
                        success: true,
                        orderNumber: orderNumber,
                        total: this.getTotal()
                    });
                } else {
                    reject({
                        success: false,
                        error: 'Error al procesar el pago. Intente nuevamente.'
                    });
                }
            }, 2000);
        });
    }
}

// Instancia global del carrito
const cart = new ShoppingCart();

// Funciones globales para la interfaz
function addToCart(productId, quantity = 1) {
    cart.addItem(productId, quantity);
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    }
}

function clearCart() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        cart.clear();
    }
}

function proceedToCheckout() {
    if (cart.items.length === 0) {
        cart.showNotification('El carrito está vacío', 'warning');
        return;
    }

    const validation = cart.validateCart();
    if (!validation.isValid) {
        cart.showNotification('Hay problemas con tu carrito: ' + validation.errors.join(', '), 'error');
        return;
    }

    // Cerrar modal del carrito y abrir checkout
    toggleCart();
    openCheckout();
}

function openCheckout() {
    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) {
        checkoutModal.style.display = 'block';
        
        // Mostrar resumen del pedido
        updateCheckoutSummary();
    }
}

function closeCheckout() {
    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) {
        checkoutModal.style.display = 'none';
    }
}

function updateCheckoutSummary() {
    // Agregar resumen del pedido al checkout si no existe
    const checkoutModal = document.getElementById('checkout-modal');
    const modalBody = checkoutModal.querySelector('.modal-body');
    
    if (!modalBody.querySelector('.order-summary')) {
        const summaryHTML = `
            <div class="order-summary">
                <h4>Resumen del Pedido</h4>
                <div class="summary-items">
                    ${cart.getCartDetails().map(item => `
                        <div class="summary-item">
                            <span>${item.product.name} x${item.quantity}</span>
                            <span>$${item.subtotal.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="summary-total">
                    <strong>Total: $${cart.getTotal().toFixed(2)}</strong>
                </div>
            </div>
        `;
        
        modalBody.insertAdjacentHTML('afterbegin', summaryHTML);
    }
}

function processPayment() {
    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);
    
    // Validar formulario
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Obtener datos del formulario
    const customerData = {
        name: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        address: document.getElementById('customer-address').value
    };

    const paymentData = {
        method: document.getElementById('payment-method').value
    };

    // Mostrar loading
    const payButton = document.querySelector('#checkout-modal .btn-primary');
    const originalText = payButton.textContent;
    payButton.textContent = 'Procesando...';
    payButton.disabled = true;

    // Procesar pago
    cart.processCheckout(customerData, paymentData)
        .then(result => {
            cart.showNotification(`¡Pago exitoso! Número de orden: ${result.orderNumber}`, 'success');
            closeCheckout();
            
            // Limpiar formulario
            form.reset();
        })
        .catch(error => {
            cart.showNotification(error.error || 'Error al procesar el pago', 'error');
        })
        .finally(() => {
            payButton.textContent = originalText;
            payButton.disabled = false;
        });
}

// Event listeners para cerrar modales al hacer clic fuera
window.addEventListener('click', function(event) {
    const cartModal = document.getElementById('cart-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    
    if (event.target === cartModal) {
        cartModal.style.display = 'none';
    }
    
    if (event.target === checkoutModal) {
        checkoutModal.style.display = 'none';
    }
});

// Inicializar carrito cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    cart.updateCartUI();
});
