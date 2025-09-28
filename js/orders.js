// Sistema de Gestión de Pedidos
class OrderManager {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.orderStatuses = {
            PENDING: 'Pendiente',
            CONFIRMED: 'Confirmado',
            PROCESSING: 'Procesando',
            SHIPPED: 'Enviado',
            DELIVERED: 'Entregado',
            CANCELLED: 'Cancelado'
        };
        this.shippingMethods = {
            STANDARD: { name: 'Envío Estándar', price: 5.99, days: '3-5 días' },
            EXPRESS: { name: 'Envío Express', price: 12.99, days: '1-2 días' },
            OVERNIGHT: { name: 'Envío Nocturno', price: 24.99, days: '24 horas' }
        };
    }

    // Crear nuevo pedido
    createOrder(customerData, cartItems, paymentMethod, shippingMethod = 'STANDARD') {
        const orderId = this.generateOrderId();
        const order = {
            id: orderId,
            orderNumber: `ORD-${orderId}`,
            customer: {
                name: customerData.name,
                email: customerData.email,
                phone: customerData.phone || '',
                address: customerData.address
            },
            items: cartItems.map(item => ({
                productId: item.productId,
                productName: item.product.name,
                productImage: item.product.image,
                quantity: item.quantity,
                unitPrice: item.product.price,
                subtotal: item.subtotal
            })),
            totals: {
                subtotal: cartItems.reduce((sum, item) => sum + item.subtotal, 0),
                shipping: this.shippingMethods[shippingMethod].price,
                tax: 0, // Se podría calcular según la región
                total: 0
            },
            payment: {
                method: paymentMethod,
                status: 'PENDING',
                transactionId: this.generateTransactionId()
            },
            shipping: {
                method: shippingMethod,
                methodDetails: this.shippingMethods[shippingMethod],
                address: customerData.address,
                trackingNumber: null,
                estimatedDelivery: this.calculateEstimatedDelivery(shippingMethod)
            },
            status: 'PENDING',
            statusHistory: [{
                status: 'PENDING',
                timestamp: new Date().toISOString(),
                note: 'Pedido creado'
            }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Calcular total final
        order.totals.total = order.totals.subtotal + order.totals.shipping + order.totals.tax;

        this.orders.push(order);
        this.saveOrders();

        // Enviar confirmación por email (simulado)
        this.sendOrderConfirmation(order);

        return order;
    }

    // Generar ID único para pedido
    generateOrderId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    // Generar ID de transacción
    generateTransactionId() {
        return 'TXN-' + Date.now().toString(36).toUpperCase() + '-' + 
               Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    // Calcular fecha estimada de entrega
    calculateEstimatedDelivery(shippingMethod) {
        const now = new Date();
        const daysToAdd = {
            STANDARD: 5,
            EXPRESS: 2,
            OVERNIGHT: 1
        };

        const deliveryDate = new Date(now);
        deliveryDate.setDate(now.getDate() + daysToAdd[shippingMethod]);
        
        return deliveryDate.toISOString();
    }

    // Actualizar estado del pedido
    updateOrderStatus(orderId, newStatus, note = '') {
        const order = this.getOrderById(orderId);
        if (!order) {
            throw new Error('Pedido no encontrado');
        }

        // Validar transición de estado
        if (!this.isValidStatusTransition(order.status, newStatus)) {
            throw new Error(`Transición de estado inválida: ${order.status} -> ${newStatus}`);
        }

        order.status = newStatus;
        order.updatedAt = new Date().toISOString();

        // Agregar al historial
        order.statusHistory.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: note
        });

        // Acciones específicas según el estado
        this.handleStatusChange(order, newStatus);

        this.saveOrders();
        return order;
    }

    // Validar transiciones de estado
    isValidStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            PENDING: ['CONFIRMED', 'CANCELLED'],
            CONFIRMED: ['PROCESSING', 'CANCELLED'],
            PROCESSING: ['SHIPPED', 'CANCELLED'],
            SHIPPED: ['DELIVERED'],
            DELIVERED: [],
            CANCELLED: []
        };

        return validTransitions[currentStatus]?.includes(newStatus) || false;
    }

    // Manejar cambios de estado
    handleStatusChange(order, newStatus) {
        switch (newStatus) {
            case 'CONFIRMED':
                this.sendOrderConfirmation(order);
                break;
            case 'SHIPPED':
                order.shipping.trackingNumber = this.generateTrackingNumber();
                this.sendShippingNotification(order);
                break;
            case 'DELIVERED':
                this.sendDeliveryConfirmation(order);
                break;
            case 'CANCELLED':
                this.handleOrderCancellation(order);
                break;
        }
    }

    // Generar número de seguimiento
    generateTrackingNumber() {
        return 'TRK' + Date.now().toString().slice(-8) + 
               Math.random().toString(36).substr(2, 4).toUpperCase();
    }

    // Obtener pedido por ID
    getOrderById(orderId) {
        return this.orders.find(order => order.id === orderId);
    }

    // Obtener pedidos por email de cliente
    getOrdersByCustomer(email) {
        return this.orders.filter(order => 
            order.customer.email.toLowerCase() === email.toLowerCase()
        );
    }

    // Obtener pedidos por estado
    getOrdersByStatus(status) {
        return this.orders.filter(order => order.status === status);
    }

    // Obtener todos los pedidos con paginación
    getAllOrders(page = 1, limit = 10, filters = {}) {
        let filteredOrders = [...this.orders];

        // Aplicar filtros
        if (filters.status) {
            filteredOrders = filteredOrders.filter(order => order.status === filters.status);
        }
        
        if (filters.dateFrom) {
            filteredOrders = filteredOrders.filter(order => 
                new Date(order.createdAt) >= new Date(filters.dateFrom)
            );
        }
        
        if (filters.dateTo) {
            filteredOrders = filteredOrders.filter(order => 
                new Date(order.createdAt) <= new Date(filters.dateTo)
            );
        }

        if (filters.customerEmail) {
            filteredOrders = filteredOrders.filter(order => 
                order.customer.email.toLowerCase().includes(filters.customerEmail.toLowerCase())
            );
        }

        // Ordenar por fecha de creación (más recientes primero)
        filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Paginación
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

        return {
            orders: paginatedOrders,
            totalOrders: filteredOrders.length,
            totalPages: Math.ceil(filteredOrders.length / limit),
            currentPage: page,
            hasNextPage: endIndex < filteredOrders.length,
            hasPrevPage: page > 1
        };
    }

    // Cancelar pedido
    cancelOrder(orderId, reason = '') {
        const order = this.getOrderById(orderId);
        if (!order) {
            throw new Error('Pedido no encontrado');
        }

        if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
            throw new Error('No se puede cancelar el pedido en su estado actual');
        }

        return this.updateOrderStatus(orderId, 'CANCELLED', `Cancelado: ${reason}`);
    }

    // Manejar cancelación de pedido
    handleOrderCancellation(order) {
        // Restaurar stock de productos (simulado)
        order.items.forEach(item => {
            const product = getProductById(item.productId);
            if (product) {
                product.stock += item.quantity;
            }
        });

        // Procesar reembolso (simulado)
        this.processRefund(order);
    }

    // Procesar reembolso
    processRefund(order) {
        console.log(`Procesando reembolso de $${order.totals.total} para pedido ${order.orderNumber}`);
        // Aquí se integraría con la pasarela de pago para procesar el reembolso
    }

    // Buscar pedidos
    searchOrders(query) {
        const searchTerm = query.toLowerCase();
        return this.orders.filter(order => 
            order.orderNumber.toLowerCase().includes(searchTerm) ||
            order.customer.name.toLowerCase().includes(searchTerm) ||
            order.customer.email.toLowerCase().includes(searchTerm) ||
            order.items.some(item => item.productName.toLowerCase().includes(searchTerm))
        );
    }

    // Obtener estadísticas de pedidos
    getOrderStatistics(dateFrom, dateTo) {
        let ordersInPeriod = this.orders;

        if (dateFrom) {
            ordersInPeriod = ordersInPeriod.filter(order => 
                new Date(order.createdAt) >= new Date(dateFrom)
            );
        }

        if (dateTo) {
            ordersInPeriod = ordersInPeriod.filter(order => 
                new Date(order.createdAt) <= new Date(dateTo)
            );
        }

        const stats = {
            totalOrders: ordersInPeriod.length,
            totalRevenue: ordersInPeriod.reduce((sum, order) => sum + order.totals.total, 0),
            averageOrderValue: 0,
            ordersByStatus: {},
            topProducts: this.getTopProducts(ordersInPeriod),
            orderTrends: this.getOrderTrends(ordersInPeriod)
        };

        // Calcular valor promedio de pedido
        stats.averageOrderValue = stats.totalOrders > 0 ? 
            stats.totalRevenue / stats.totalOrders : 0;

        // Contar pedidos por estado
        Object.keys(this.orderStatuses).forEach(status => {
            stats.ordersByStatus[status] = ordersInPeriod.filter(
                order => order.status === status
            ).length;
        });

        return stats;
    }

    // Obtener productos más vendidos
    getTopProducts(orders, limit = 5) {
        const productSales = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = {
                        productId: item.productId,
                        productName: item.productName,
                        totalQuantity: 0,
                        totalRevenue: 0
                    };
                }
                productSales[item.productId].totalQuantity += item.quantity;
                productSales[item.productId].totalRevenue += item.subtotal;
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, limit);
    }

    // Obtener tendencias de pedidos
    getOrderTrends(orders) {
        const trends = {};
        
        orders.forEach(order => {
            const date = new Date(order.createdAt).toDateString();
            if (!trends[date]) {
                trends[date] = { orders: 0, revenue: 0 };
            }
            trends[date].orders++;
            trends[date].revenue += order.totals.total;
        });

        return Object.keys(trends)
            .sort()
            .map(date => ({
                date,
                orders: trends[date].orders,
                revenue: trends[date].revenue
            }));
    }

    // Enviar confirmación de pedido (simulado)
    sendOrderConfirmation(order) {
        console.log(`Enviando confirmación de pedido a ${order.customer.email}`);
        console.log(`Pedido: ${order.orderNumber}`);
        console.log(`Total: $${order.totals.total}`);
        
        // Simular envío de email
        this.simulateEmailSend('order_confirmation', order);
    }

    // Enviar notificación de envío (simulado)
    sendShippingNotification(order) {
        console.log(`Enviando notificación de envío a ${order.customer.email}`);
        console.log(`Número de seguimiento: ${order.shipping.trackingNumber}`);
        
        this.simulateEmailSend('shipping_notification', order);
    }

    // Enviar confirmación de entrega (simulado)
    sendDeliveryConfirmation(order) {
        console.log(`Enviando confirmación de entrega a ${order.customer.email}`);
        
        this.simulateEmailSend('delivery_confirmation', order);
    }

    // Simular envío de emails
    simulateEmailSend(type, order) {
        // En una implementación real, aquí se integraría con un servicio de email
        setTimeout(() => {
            console.log(`Email ${type} enviado exitosamente para pedido ${order.orderNumber}`);
        }, 1000);
    }

    // Guardar pedidos en localStorage
    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    // Exportar pedidos a CSV
    exportOrdersToCSV(orders = this.orders) {
        const headers = [
            'Número de Pedido',
            'Fecha',
            'Cliente',
            'Email',
            'Estado',
            'Total',
            'Método de Pago',
            'Método de Envío'
        ];

        const csvContent = [
            headers.join(','),
            ...orders.map(order => [
                order.orderNumber,
                new Date(order.createdAt).toLocaleDateString(),
                order.customer.name,
                order.customer.email,
                this.orderStatuses[order.status],
                order.totals.total,
                order.payment.method,
                order.shipping.methodDetails.name
            ].join(','))
        ].join('\n');

        // Crear y descargar archivo
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pedidos_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Generar reporte de pedidos
    generateOrderReport(dateFrom, dateTo) {
        const stats = this.getOrderStatistics(dateFrom, dateTo);
        const ordersInPeriod = this.getAllOrders(1, 1000, { dateFrom, dateTo }).orders;

        return {
            period: {
                from: dateFrom,
                to: dateTo
            },
            summary: stats,
            orders: ordersInPeriod,
            generatedAt: new Date().toISOString()
        };
    }
}

// Sistema de notificaciones para pedidos
class OrderNotifications {
    constructor(orderManager) {
        this.orderManager = orderManager;
        this.setupNotifications();
    }

    setupNotifications() {
        // Configurar notificaciones automáticas
        this.scheduleOrderReminders();
    }

    scheduleOrderReminders() {
        setInterval(() => {
            this.checkPendingOrders();
        }, 60000); // Verificar cada minuto
    }

    checkPendingOrders() {
        const pendingOrders = this.orderManager.getOrdersByStatus('PENDING');
        const oldPendingOrders = pendingOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            const hoursSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60);
            return hoursSinceOrder > 1; // Pedidos pendientes por más de 1 hora
        });

        oldPendingOrders.forEach(order => {
            console.log(`Recordatorio: Pedido ${order.orderNumber} lleva más de 1 hora pendiente`);
        });
    }
}

// Instancia global del gestor de pedidos
const orderManager = new OrderManager();
const orderNotifications = new OrderNotifications(orderManager);

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OrderManager, OrderNotifications };
}
