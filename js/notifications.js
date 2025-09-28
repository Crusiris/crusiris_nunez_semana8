// Sistema de Notificaciones por Email y Seguimiento de Envíos
class NotificationSystem {
    constructor() {
        this.emailTemplates = {
            orderConfirmation: {
                subject: '✅ Confirmación de Pedido #{orderNumber}',
                template: this.getOrderConfirmationTemplate()
            },
            orderShipped: {
                subject: '📦 Tu pedido #{orderNumber} ha sido enviado',
                template: this.getShippedTemplate()
            },
            orderDelivered: {
                subject: '🎉 Pedido #{orderNumber} entregado exitosamente',
                template: this.getDeliveredTemplate()
            },
            promotions: {
                subject: '🎁 Ofertas especiales solo para ti',
                template: this.getPromotionTemplate()
            }
        };
        
        this.notificationQueue = [];
        this.deliveryProviders = {
            'DHL': {
                name: 'DHL Express',
                trackingUrl: 'https://www.dhl.com/tracking?id={trackingNumber}',
                apiEndpoint: 'https://api.dhl.com/track/{trackingNumber}'
            },
            'FEDEX': {
                name: 'FedEx',
                trackingUrl: 'https://www.fedex.com/tracking?id={trackingNumber}',
                apiEndpoint: 'https://api.fedex.com/track/{trackingNumber}'
            },
            'CHILEXPRESS': {
                name: 'Chilexpress',
                trackingUrl: 'https://www.chilexpress.cl/seguimiento?id={trackingNumber}',
                apiEndpoint: 'https://api.chilexpress.cl/track/{trackingNumber}'
            }
        };
    }

    // Enviar notificación de confirmación de pedido
    async sendOrderConfirmation(order) {
        try {
            const emailData = {
                to: order.customer.email,
                subject: this.emailTemplates.orderConfirmation.subject.replace('{orderNumber}', order.orderNumber),
                html: this.generateOrderConfirmationEmail(order),
                type: 'orderConfirmation'
            };

            await this.sendEmail(emailData);
            this.logNotification('ORDER_CONFIRMATION', order.id, order.customer.email);
            
            return {
                success: true,
                message: 'Confirmación enviada exitosamente'
            };
        } catch (error) {
            console.error('Error enviando confirmación:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Enviar notificación de envío
    async sendShippingNotification(order, trackingNumber, provider = 'DHL') {
        try {
            const emailData = {
                to: order.customer.email,
                subject: this.emailTemplates.orderShipped.subject.replace('{orderNumber}', order.orderNumber),
                html: this.generateShippingEmail(order, trackingNumber, provider),
                type: 'orderShipped'
            };

            await this.sendEmail(emailData);
            this.logNotification('SHIPPING_NOTIFICATION', order.id, order.customer.email, {
                trackingNumber,
                provider
            });

            return {
                success: true,
                message: 'Notificación de envío enviada'
            };
        } catch (error) {
            console.error('Error enviando notificación de envío:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Enviar notificación de entrega
    async sendDeliveryConfirmation(order) {
        try {
            const emailData = {
                to: order.customer.email,
                subject: this.emailTemplates.orderDelivered.subject.replace('{orderNumber}', order.orderNumber),
                html: this.generateDeliveryEmail(order),
                type: 'orderDelivered'
            };

            await this.sendEmail(emailData);
            this.logNotification('DELIVERY_CONFIRMATION', order.id, order.customer.email);

            return {
                success: true,
                message: 'Confirmación de entrega enviada'
            };
        } catch (error) {
            console.error('Error enviando confirmación de entrega:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Seguimiento de paquete
    async trackPackage(trackingNumber, provider = 'DHL') {
        try {
            // Simular respuesta de API de seguimiento
            const mockTrackingData = this.generateMockTrackingData(trackingNumber, provider);
            
            // En una implementación real, aquí harías la llamada a la API del proveedor
            // const response = await fetch(this.deliveryProviders[provider].apiEndpoint.replace('{trackingNumber}', trackingNumber));
            
            return {
                success: true,
                trackingNumber,
                provider: this.deliveryProviders[provider].name,
                status: mockTrackingData.status,
                location: mockTrackingData.location,
                estimatedDelivery: mockTrackingData.estimatedDelivery,
                history: mockTrackingData.history,
                trackingUrl: this.deliveryProviders[provider].trackingUrl.replace('{trackingNumber}', trackingNumber)
            };
        } catch (error) {
            return {
                success: false,
                error: 'Error al consultar el seguimiento'
            };
        }
    }

    // Generar datos de seguimiento simulados
    generateMockTrackingData(trackingNumber, provider) {
        const statuses = ['En tránsito', 'En centro de distribución', 'En reparto', 'Entregado'];
        const locations = ['Santiago Centro', 'Las Condes', 'Providencia', 'Ñuñoa'];
        
        const currentStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const currentLocation = locations[Math.floor(Math.random() * locations.length)];
        
        const history = [
            {
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'Paquete recibido',
                location: 'Centro de distribución Santiago',
                description: 'El paquete ha sido recibido en nuestras instalaciones'
            },
            {
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'En tránsito',
                location: 'En camino a ' + currentLocation,
                description: 'El paquete está en camino hacia su destino'
            },
            {
                date: new Date().toISOString(),
                status: currentStatus,
                location: currentLocation,
                description: `Estado actual: ${currentStatus}`
            }
        ];

        return {
            status: currentStatus,
            location: currentLocation,
            estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString(),
            history: history
        };
    }

    // Simulación de envío de email
    async sendEmail(emailData) {
        return new Promise((resolve, reject) => {
            // Simular delay de envío
            setTimeout(() => {
                if (Math.random() > 0.05) { // 95% éxito
                    console.log(`📧 Email enviado a ${emailData.to}:`);
                    console.log(`Asunto: ${emailData.subject}`);
                    console.log(`Tipo: ${emailData.type}`);
                    resolve({ messageId: 'msg_' + Date.now() });
                } else {
                    reject(new Error('Error simulado de envío'));
                }
            }, 1000);
        });
    }

    // Generar email de confirmación de pedido
    generateOrderConfirmationEmail(order) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">¡Gracias por tu pedido!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 18px;">Pedido #${order.orderNumber}</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-top: 0;">Detalles del Pedido</h2>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #667eea; margin-top: 0;">Información de Envío</h3>
                        <p><strong>Nombre:</strong> ${order.customer.name}</p>
                        <p><strong>Dirección:</strong> ${order.customer.address}</p>
                        <p><strong>Método de Envío:</strong> ${order.shipping.methodDetails.name}</p>
                        <p><strong>Tiempo Estimado:</strong> ${order.shipping.methodDetails.days}</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #667eea; margin-top: 0;">Productos</h3>
                        ${order.items.map(item => `
                            <div style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between;">
                                <span>${item.productName} x${item.quantity}</span>
                                <span><strong>$${item.subtotal.toFixed(2)}</strong></span>
                            </div>
                        `).join('')}
                        <div style="padding: 15px 0; font-size: 18px; font-weight: bold; text-align: right; border-top: 2px solid #667eea; margin-top: 10px;">
                            Total: $${order.totals.total.toFixed(2)}
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="color: #666;">Te enviaremos actualizaciones sobre el estado de tu pedido.</p>
                        <a href="#" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">
                            Seguir mi Pedido
                        </a>
                    </div>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
                    <p>¿Tienes preguntas? Contáctanos en soporte@tiendaweb.com</p>
                    <p>© 2024 TiendaWeb. Todos los derechos reservados.</p>
                </div>
            </div>
        `;
    }

    // Generar email de envío
    generateShippingEmail(order, trackingNumber, provider) {
        const providerInfo = this.deliveryProviders[provider];
        const trackingUrl = providerInfo.trackingUrl.replace('{trackingNumber}', trackingNumber);
        
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">📦 ¡Tu pedido está en camino!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 18px;">Pedido #${order.orderNumber}</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <h2 style="color: #333; margin-top: 0;">Información de Seguimiento</h2>
                        <div style="background: #e6fffa; padding: 15px; border-radius: 6px; margin: 15px 0;">
                            <p style="margin: 5px 0;"><strong>Transportista:</strong> ${providerInfo.name}</p>
                            <p style="margin: 5px 0;"><strong>Número de Seguimiento:</strong></p>
                            <p style="font-family: monospace; font-size: 18px; font-weight: bold; color: #38a169; margin: 10px 0;">${trackingNumber}</p>
                        </div>
                        
                        <a href="${trackingUrl}" target="_blank" style="background: #38a169; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
                            Seguir mi Paquete
                        </a>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #667eea; margin-top: 0;">Dirección de Entrega</h3>
                        <p>${order.customer.name}</p>
                        <p>${order.customer.address}</p>
                        <p><strong>Tiempo Estimado:</strong> ${order.shipping.methodDetails.days}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="color: #666;">Recibirás una notificación cuando tu pedido sea entregado.</p>
                    </div>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
                    <p>¿Problemas con tu envío? Contáctanos en soporte@tiendaweb.com</p>
                    <p>© 2024 TiendaWeb. Todos los derechos reservados.</p>
                </div>
            </div>
        `;
    }

    // Generar email de entrega
    generateDeliveryEmail(order) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">🎉 ¡Pedido Entregado!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 18px;">Pedido #${order.orderNumber}</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <div style="text-align: center; margin: 30px 0;">
                        <h2 style="color: #333;">¡Gracias por elegir TiendaWeb!</h2>
                        <p style="font-size: 16px; color: #666;">Tu pedido ha sido entregado exitosamente.</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #667eea; margin-top: 0;">¿Cómo estuvo tu experiencia?</h3>
                            <p>Nos encantaría conocer tu opinión sobre los productos y el servicio.</p>
                            <a href="#" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px;">
                                Dejar Reseña
                            </a>
                        </div>
                        
                        <div style="background: #e6fffa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #38a169; margin-top: 0;">¡Descuento Especial!</h3>
                            <p>Como agradecimiento, tienes un <strong>15% de descuento</strong> en tu próxima compra.</p>
                            <p style="font-family: monospace; font-size: 18px; font-weight: bold; color: #38a169;">CLIENTE15</p>
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
                    <p>¿Necesitas ayuda? Contáctanos en soporte@tiendaweb.com</p>
                    <p>© 2024 TiendaWeb. Todos los derechos reservados.</p>
                </div>
            </div>
        `;
    }

    // Registrar notificación en el log
    logNotification(type, orderId, email, metadata = {}) {
        const logEntry = {
            id: Utils.generateId(),
            type: type,
            orderId: orderId,
            email: email,
            timestamp: new Date().toISOString(),
            metadata: metadata,
            status: 'SENT'
        };

        // Guardar en localStorage para persistencia
        const notifications = JSON.parse(localStorage.getItem('notificationLog')) || [];
        notifications.push(logEntry);
        localStorage.setItem('notificationLog', JSON.stringify(notifications));

        console.log('Notificación registrada:', logEntry);
    }

    // Obtener historial de notificaciones
    getNotificationHistory(orderId = null) {
        const notifications = JSON.parse(localStorage.getItem('notificationLog')) || [];
        
        if (orderId) {
            return notifications.filter(notification => notification.orderId === orderId);
        }
        
        return notifications;
    }

    // Programar notificaciones automáticas
    scheduleAutomaticNotifications() {
        // Verificar pedidos que necesitan notificaciones cada 5 minutos
        setInterval(() => {
            this.checkPendingNotifications();
        }, 5 * 60 * 1000);
    }

    // Verificar notificaciones pendientes
    checkPendingNotifications() {
        const orders = orderManager.orders;
        
        orders.forEach(order => {
            const notifications = this.getNotificationHistory(order.id);
            const hasConfirmation = notifications.some(n => n.type === 'ORDER_CONFIRMATION');
            const hasShipping = notifications.some(n => n.type === 'SHIPPING_NOTIFICATION');
            const hasDelivery = notifications.some(n => n.type === 'DELIVERY_CONFIRMATION');

            // Enviar confirmación si no se ha enviado
            if (!hasConfirmation && order.status === 'CONFIRMED') {
                this.sendOrderConfirmation(order);
            }

            // Enviar notificación de envío si no se ha enviado
            if (!hasShipping && order.status === 'SHIPPED' && order.shipping.trackingNumber) {
                this.sendShippingNotification(order, order.shipping.trackingNumber);
            }

            // Enviar confirmación de entrega si no se ha enviado
            if (!hasDelivery && order.status === 'DELIVERED') {
                this.sendDeliveryConfirmation(order);
            }
        });
    }

    // Templates base
    getOrderConfirmationTemplate() {
        return 'orderConfirmation';
    }

    getShippedTemplate() {
        return 'orderShipped';
    }

    getDeliveredTemplate() {
        return 'orderDelivered';
    }

    getPromotionTemplate() {
        return 'promotions';
    }
}

// Instancia global del sistema de notificaciones
const notificationSystem = new NotificationSystem();

// Integración con el sistema de pedidos existente
if (typeof orderManager !== 'undefined') {
    // Sobrescribir métodos del OrderManager para incluir notificaciones
    const originalUpdateOrderStatus = orderManager.updateOrderStatus.bind(orderManager);
    
    orderManager.updateOrderStatus = function(orderId, newStatus, note = '') {
        const result = originalUpdateOrderStatus(orderId, newStatus, note);
        
        // Enviar notificaciones automáticas según el nuevo estado
        const order = this.getOrderById(orderId);
        if (order) {
            switch (newStatus) {
                case 'CONFIRMED':
                    notificationSystem.sendOrderConfirmation(order);
                    break;
                case 'SHIPPED':
                    if (order.shipping.trackingNumber) {
                        notificationSystem.sendShippingNotification(order, order.shipping.trackingNumber);
                    }
                    break;
                case 'DELIVERED':
                    notificationSystem.sendDeliveryConfirmation(order);
                    break;
            }
        }
        
        return result;
    };
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotificationSystem };
}
