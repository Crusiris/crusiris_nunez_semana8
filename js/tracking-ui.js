// Interfaz de usuario para seguimiento y notificaciones
class TrackingUI {
    constructor() {
        this.currentTrackingData = null;
        this.init();
    }

    init() {
        this.loadRecentOrders();
        this.setupEventListeners();
        this.initializeNotificationSystem();
    }

    setupEventListeners() {
        // Enter key en búsqueda
        const trackingInput = document.getElementById('tracking-input');
        if (trackingInput) {
            trackingInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.trackOrder();
                }
            });
        }

        // Cerrar modales al hacer clic fuera
        window.addEventListener('click', (event) => {
            const modals = [
                'tracking-details-modal', 
                'notification-history-modal', 
                'email-preview-modal'
            ];
            
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    initializeNotificationSystem() {
        // Programar verificaciones automáticas
        notificationSystem.scheduleAutomaticNotifications();
        
        // Mostrar estadísticas de notificaciones
        this.updateNotificationStats();
    }

    // Buscar pedido o número de seguimiento
    trackOrder() {
        const input = document.getElementById('tracking-input');
        const query = input.value.trim();
        
        if (!query) {
            cart.showNotification('Por favor ingresa un número de pedido o seguimiento', 'warning');
            return;
        }

        // Mostrar loading
        this.showTrackingLoading();

        // Buscar en pedidos existentes
        const order = this.findOrder(query);
        
        if (order) {
            this.displayOrderTracking(order);
        } else {
            // Simular búsqueda por número de seguimiento
            this.simulateTrackingSearch(query);
        }
    }

    // Buscar pedido por número de orden o seguimiento
    findOrder(query) {
        const upperQuery = query.toUpperCase();
        
        // Buscar por número de orden
        let order = orderManager.orders.find(o => 
            o.orderNumber.toUpperCase() === upperQuery
        );
        
        // Buscar por número de seguimiento
        if (!order) {
            order = orderManager.orders.find(o => 
                o.shipping.trackingNumber && 
                o.shipping.trackingNumber.toUpperCase() === upperQuery
            );
        }
        
        return order;
    }

    // Simular búsqueda de seguimiento externo
    async simulateTrackingSearch(trackingNumber) {
        try {
            const trackingData = await notificationSystem.trackPackage(trackingNumber);
            
            if (trackingData.success) {
                this.displayExternalTracking(trackingData);
            } else {
                this.showNoResults();
            }
        } catch (error) {
            this.showTrackingError();
        }
    }

    // Mostrar loading durante búsqueda
    showTrackingLoading() {
        const resultsDiv = document.getElementById('tracking-results');
        resultsDiv.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner"></i>
                <p>Buscando información de seguimiento...</p>
            </div>
        `;
        resultsDiv.style.display = 'block';
    }

    // Mostrar seguimiento de pedido interno
    displayOrderTracking(order) {
        const resultsDiv = document.getElementById('tracking-results');
        
        resultsDiv.innerHTML = `
            <div class="tracking-info">
                <div class="info-section">
                    <h3><i class="fas fa-package"></i> Información del Pedido</h3>
                    <p><strong>Número de Pedido:</strong> ${order.orderNumber}</p>
                    <p><strong>Estado:</strong> 
                        <span class="status-badge status-${order.status.toLowerCase()}">
                            ${orderManager.orderStatuses[order.status]}
                        </span>
                    </p>
                    <p><strong>Fecha de Pedido:</strong> ${Utils.formatDate(order.createdAt)}</p>
                    <p><strong>Total:</strong> $${order.totals.total.toFixed(2)}</p>
                </div>
                
                <div class="info-section">
                    <h3><i class="fas fa-truck"></i> Información de Envío</h3>
                    <p><strong>Método:</strong> ${order.shipping.methodDetails.name}</p>
                    ${order.shipping.trackingNumber ? `
                        <p><strong>Número de Seguimiento:</strong></p>
                        <div class="tracking-number">${order.shipping.trackingNumber}</div>
                    ` : '<p><em>Número de seguimiento no disponible aún</em></p>'}
                    <p><strong>Dirección:</strong> ${order.customer.address}</p>
                    <p><strong>Entrega Estimada:</strong> ${Utils.formatDate(order.shipping.estimatedDelivery)}</p>
                </div>
            </div>
            
            <div class="tracking-timeline">
                <h3><i class="fas fa-route"></i> Historial del Pedido</h3>
                ${this.generateOrderTimeline(order)}
            </div>
            
            <div style="text-align: center; margin-top: 2rem;">
                <button class="btn-primary" onclick="trackingUI.showDetailedTracking('${order.id}')">
                    <i class="fas fa-eye"></i> Ver Detalles Completos
                </button>
                ${order.shipping.trackingNumber ? `
                    <button class="btn-secondary" onclick="trackingUI.trackExternal('${order.shipping.trackingNumber}')" style="margin-left: 1rem;">
                        <i class="fas fa-external-link-alt"></i> Seguimiento Externo
                    </button>
                ` : ''}
            </div>
        `;
        
        resultsDiv.style.display = 'block';
        this.currentTrackingData = { type: 'order', data: order };
    }

    // Mostrar seguimiento externo
    displayExternalTracking(trackingData) {
        const resultsDiv = document.getElementById('tracking-results');
        
        resultsDiv.innerHTML = `
            <div class="tracking-info">
                <div class="info-section">
                    <h3><i class="fas fa-truck"></i> Información de Envío</h3>
                    <p><strong>Transportista:</strong> ${trackingData.provider}</p>
                    <p><strong>Número de Seguimiento:</strong></p>
                    <div class="tracking-number">${trackingData.trackingNumber}</div>
                    <p><strong>Estado Actual:</strong> 
                        <span class="status-badge status-in-transit">
                            ${trackingData.status}
                        </span>
                    </p>
                    <p><strong>Ubicación:</strong> ${trackingData.location}</p>
                    <p><strong>Entrega Estimada:</strong> ${trackingData.estimatedDelivery}</p>
                </div>
                
                <div class="info-section">
                    <h3><i class="fas fa-link"></i> Enlaces Útiles</h3>
                    <p><a href="${trackingData.trackingUrl}" target="_blank" class="btn-secondary">
                        <i class="fas fa-external-link-alt"></i> Ver en ${trackingData.provider}
                    </a></p>
                    <p><button class="btn-secondary" onclick="trackingUI.refreshExternalTracking()">
                        <i class="fas fa-sync"></i> Actualizar Estado
                    </button></p>
                </div>
            </div>
            
            <div class="tracking-timeline">
                <h3><i class="fas fa-route"></i> Historial de Envío</h3>
                ${this.generateExternalTimeline(trackingData.history)}
            </div>
        `;
        
        resultsDiv.style.display = 'block';
        this.currentTrackingData = { type: 'external', data: trackingData };
    }

    // Generar timeline de pedido
    generateOrderTimeline(order) {
        return order.statusHistory.map((history, index) => `
            <div class="timeline-item ${index === order.statusHistory.length - 1 ? 'active' : ''}">
                <div class="timeline-content">
                    <div class="timeline-date">${Utils.formatDate(history.timestamp)}</div>
                    <div class="timeline-status">${orderManager.orderStatuses[history.status]}</div>
                    ${history.note ? `<div class="timeline-description">${history.note}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Generar timeline externo
    generateExternalTimeline(history) {
        return history.map((item, index) => `
            <div class="timeline-item ${index === history.length - 1 ? 'active' : ''}">
                <div class="timeline-content">
                    <div class="timeline-date">${Utils.formatDate(item.date)}</div>
                    <div class="timeline-status">${item.status}</div>
                    <div class="timeline-location">${item.location}</div>
                    <div class="timeline-description">${item.description}</div>
                </div>
            </div>
        `).join('');
    }

    // Mostrar cuando no se encuentran resultados
    showNoResults() {
        const resultsDiv = document.getElementById('tracking-results');
        resultsDiv.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #718096;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; color: #cbd5e0;"></i>
                <h3>No se encontró información</h3>
                <p>No pudimos encontrar un pedido o seguimiento con ese número.</p>
                <p>Verifica que el número sea correcto e intenta nuevamente.</p>
            </div>
        `;
        resultsDiv.style.display = 'block';
    }

    // Mostrar error de seguimiento
    showTrackingError() {
        const resultsDiv = document.getElementById('tracking-results');
        resultsDiv.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #e53e3e;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>Error de Conexión</h3>
                <p>No pudimos conectar con el servicio de seguimiento.</p>
                <button class="btn-primary" onclick="trackingUI.trackOrder()" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Intentar Nuevamente
                </button>
            </div>
        `;
        resultsDiv.style.display = 'block';
    }

    // Cargar pedidos recientes para seguimiento rápido
    loadRecentOrders() {
        const container = document.getElementById('recent-orders');
        if (!container) return;

        const recentOrders = orderManager.orders
            .slice(-6) // Últimos 6 pedidos
            .reverse();

        if (recentOrders.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #718096; grid-column: 1 / -1;">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; color: #cbd5e0;"></i>
                    <p>No hay pedidos recientes</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentOrders.map(order => `
            <div class="order-quick-card" onclick="trackingUI.quickTrackOrder('${order.id}')">
                <div class="order-quick-header">
                    <span class="order-number">${order.orderNumber}</span>
                    <span class="quick-status status-${order.status.toLowerCase()}">
                        ${orderManager.orderStatuses[order.status]}
                    </span>
                </div>
                <div class="order-quick-info">
                    <i class="fas fa-calendar"></i> ${Utils.formatDate(order.createdAt)}
                </div>
                <div class="order-quick-info">
                    <i class="fas fa-dollar-sign"></i> Total: $${order.totals.total.toFixed(2)}
                </div>
                <button class="track-button">
                    <i class="fas fa-search"></i> Rastrear Pedido
                </button>
            </div>
        `).join('');
    }

    // Seguimiento rápido desde pedidos recientes
    quickTrackOrder(orderId) {
        const order = orderManager.getOrderById(orderId);
        if (order) {
            document.getElementById('tracking-input').value = order.orderNumber;
            this.displayOrderTracking(order);
            
            // Scroll a resultados
            document.getElementById('tracking-results').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Enviar notificación demo
    async sendDemoNotification() {
        const type = document.getElementById('notification-type').value;
        const email = document.getElementById('demo-email').value;

        if (!Utils.validateEmail(email)) {
            cart.showNotification('Por favor ingresa un email válido', 'warning');
            return;
        }

        // Crear orden demo para la notificación
        const demoOrder = this.createDemoOrder(email);

        try {
            let result;
            switch (type) {
                case 'confirmation':
                    result = await notificationSystem.sendOrderConfirmation(demoOrder);
                    break;
                case 'shipped':
                    result = await notificationSystem.sendShippingNotification(demoOrder, 'TRK123456789');
                    break;
                case 'delivered':
                    result = await notificationSystem.sendDeliveryConfirmation(demoOrder);
                    break;
            }

            if (result.success) {
                cart.showNotification('Notificación demo enviada exitosamente', 'success');
                this.showEmailPreview(type, demoOrder);
            } else {
                cart.showNotification('Error enviando notificación: ' + result.error, 'error');
            }
        } catch (error) {
            cart.showNotification('Error enviando notificación', 'error');
        }
    }

    // Crear pedido demo para notificaciones
    createDemoOrder(email) {
        return {
            id: 'demo_' + Date.now(),
            orderNumber: 'ORD-DEMO123',
            customer: {
                name: 'Cliente Demo',
                email: email,
                address: 'Av. Demo 123, Santiago, Chile'
            },
            items: [
                {
                    productId: 1,
                    productName: 'Producto Demo',
                    productImage: '📱',
                    quantity: 1,
                    unitPrice: 99.99,
                    subtotal: 99.99
                }
            ],
            totals: {
                subtotal: 99.99,
                shipping: 5.99,
                total: 105.98
            },
            shipping: {
                methodDetails: {
                    name: 'Envío Estándar',
                    days: '3-5 días'
                },
                trackingNumber: 'TRK123456789',
                estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            createdAt: new Date().toISOString(),
            status: 'CONFIRMED'
        };
    }

    // Mostrar vista previa del email
    showEmailPreview(type, order) {
        const modal = document.getElementById('email-preview-modal');
        const content = document.getElementById('email-preview-content');

        let emailHtml = '';
        switch (type) {
            case 'confirmation':
                emailHtml = notificationSystem.generateOrderConfirmationEmail(order);
                break;
            case 'shipped':
                emailHtml = notificationSystem.generateShippingEmail(order, 'TRK123456789', 'DHL');
                break;
            case 'delivered':
                emailHtml = notificationSystem.generateDeliveryEmail(order);
                break;
        }

        content.innerHTML = `
            <div class="email-preview">
                <div style="background: #f4f4f4; padding: 1rem; border-bottom: 1px solid #ddd;">
                    <strong>Vista previa del email enviado</strong>
                </div>
                <div style="padding: 1rem; background: white; max-height: 500px; overflow-y: auto;">
                    ${emailHtml}
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    // Mostrar historial de notificaciones
    showNotificationHistory() {
        const modal = document.getElementById('notification-history-modal');
        const content = document.getElementById('notification-history-content');
        
        const history = notificationSystem.getNotificationHistory();
        
        if (history.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #718096;">
                    <i class="fas fa-bell-slash" style="font-size: 3rem; margin-bottom: 1rem; color: #cbd5e0;"></i>
                    <h3>No hay notificaciones</h3>
                    <p>Aún no se han enviado notificaciones.</p>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div class="notification-history-list">
                    ${history.reverse().map(notification => `
                        <div class="notification-item">
                            <div class="notification-header">
                                <span class="notification-type">
                                    ${this.getNotificationTypeLabel(notification.type)}
                                </span>
                                <span class="notification-date">
                                    ${Utils.formatDate(notification.timestamp)}
                                </span>
                            </div>
                            <div class="notification-details">
                                <strong>Para:</strong> ${notification.email}<br>
                                <strong>Pedido:</strong> ${notification.orderId}<br>
                                <strong>Estado:</strong> ${notification.status}
                                ${notification.metadata.trackingNumber ? 
                                    `<br><strong>Seguimiento:</strong> ${notification.metadata.trackingNumber}` : ''
                                }
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        modal.style.display = 'block';
    }

    // Obtener etiqueta legible para tipo de notificación
    getNotificationTypeLabel(type) {
        const labels = {
            ORDER_CONFIRMATION: 'Confirmación de Pedido',
            SHIPPING_NOTIFICATION: 'Envío Confirmado',
            DELIVERY_CONFIRMATION: 'Pedido Entregado'
        };
        return labels[type] || type;
    }

    // Actualizar estadísticas de notificaciones
    updateNotificationStats() {
        const history = notificationSystem.getNotificationHistory();
        console.log(`📊 Estadísticas de Notificaciones:`);
        console.log(`Total enviadas: ${history.length}`);
        console.log(`Confirmaciones: ${history.filter(n => n.type === 'ORDER_CONFIRMATION').length}`);
        console.log(`Notif. de envío: ${history.filter(n => n.type === 'SHIPPING_NOTIFICATION').length}`);
        console.log(`Confirmaciones entrega: ${history.filter(n => n.type === 'DELIVERY_CONFIRMATION').length}`);
    }

    // Limpiar historial de notificaciones
    clearNotificationHistory() {
        if (confirm('¿Estás seguro de que quieres limpiar todo el historial de notificaciones?')) {
            localStorage.removeItem('notificationLog');
            cart.showNotification('Historial de notificaciones limpiado', 'info');
            this.closeNotificationHistoryModal();
        }
    }

    // Cerrar modales
    closeTrackingModal() {
        document.getElementById('tracking-details-modal').style.display = 'none';
    }

    closeNotificationHistoryModal() {
        document.getElementById('notification-history-modal').style.display = 'none';
    }

    closeEmailPreviewModal() {
        document.getElementById('email-preview-modal').style.display = 'none';
    }

    // Actualizar seguimiento
    refreshTracking() {
        if (this.currentTrackingData) {
            if (this.currentTrackingData.type === 'order') {
                this.displayOrderTracking(this.currentTrackingData.data);
            } else {
                this.refreshExternalTracking();
            }
        }
    }

    // Actualizar seguimiento externo
    async refreshExternalTracking() {
        if (this.currentTrackingData && this.currentTrackingData.type === 'external') {
            const trackingNumber = this.currentTrackingData.data.trackingNumber;
            cart.showNotification('Actualizando información de seguimiento...', 'info');
            
            try {
                const trackingData = await notificationSystem.trackPackage(trackingNumber);
                if (trackingData.success) {
                    this.displayExternalTracking(trackingData);
                    cart.showNotification('Información actualizada', 'success');
                }
            } catch (error) {
                cart.showNotification('Error al actualizar seguimiento', 'error');
            }
        }
    }

    // Seguimiento externo directo
    async trackExternal(trackingNumber) {
        try {
            const trackingData = await notificationSystem.trackPackage(trackingNumber);
            if (trackingData.success) {
                this.displayExternalTracking(trackingData);
            }
        } catch (error) {
            cart.showNotification('Error al consultar seguimiento externo', 'error');
        }
    }
}

// Funciones globales para la interfaz
function trackOrder() {
    trackingUI.trackOrder();
}

function sendDemoNotification() {
    trackingUI.sendDemoNotification();
}

function showNotificationHistory() {
    trackingUI.showNotificationHistory();
}

function closeTrackingModal() {
    trackingUI.closeTrackingModal();
}

function closeNotificationHistoryModal() {
    trackingUI.closeNotificationHistoryModal();
}

function closeEmailPreviewModal() {
    trackingUI.closeEmailPreviewModal();
}

function refreshTracking() {
    trackingUI.refreshTracking();
}

function clearNotificationHistory() {
    trackingUI.clearNotificationHistory();
}

// Instancia global de la interfaz de seguimiento
const trackingUI = new TrackingUI();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de seguimiento y notificaciones inicializado');
});
