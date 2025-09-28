// Interfaz de usuario para gestión de pedidos
class OrdersUI {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentFilters = {};
        this.selectedOrderId = null;
        this.init();
    }

    init() {
        this.loadOrders();
        this.setupEventListeners();
        this.generateSampleOrders(); // Para demostración
    }

    setupEventListeners() {
        // Búsqueda en tiempo real
        const searchInput = document.getElementById('search-orders');
        if (searchInput) {
            searchInput.addEventListener('input', 
                Utils.debounce(() => this.searchOrders(), 300)
            );
        }

        // Cerrar modales al hacer clic fuera
        window.addEventListener('click', (event) => {
            const modals = ['order-details-modal', 'update-status-modal', 'stats-modal'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    // Generar pedidos de ejemplo para demostración
    generateSampleOrders() {
        if (orderManager.orders.length === 0) {
            // Crear algunos pedidos de ejemplo
            const sampleOrders = [
                {
                    customerData: {
                        name: "Juan Pérez",
                        email: "juan.perez@email.com",
                        address: "Av. Providencia 1234, Santiago"
                    },
                    items: [
                        { productId: 1, quantity: 1 },
                        { productId: 3, quantity: 2 }
                    ]
                },
                {
                    customerData: {
                        name: "María González",
                        email: "maria.gonzalez@email.com",
                        address: "Las Condes 5678, Santiago"
                    },
                    items: [
                        { productId: 2, quantity: 1 }
                    ]
                },
                {
                    customerData: {
                        name: "Carlos Silva",
                        email: "carlos.silva@email.com",
                        address: "Ñuñoa 9012, Santiago"
                    },
                    items: [
                        { productId: 4, quantity: 3 },
                        { productId: 5, quantity: 1 }
                    ]
                }
            ];

            sampleOrders.forEach((orderData, index) => {
                const cartItems = orderData.items.map(item => {
                    const product = getProductById(item.productId);
                    return {
                        productId: item.productId,
                        product: product,
                        quantity: item.quantity,
                        subtotal: product ? product.price * item.quantity : 0
                    };
                }).filter(item => item.product);

                if (cartItems.length > 0) {
                    const order = orderManager.createOrder(
                        orderData.customerData,
                        cartItems,
                        'credit-card',
                        'STANDARD'
                    );

                    // Actualizar algunos estados para variedad
                    if (index === 1) {
                        orderManager.updateOrderStatus(order.id, 'CONFIRMED');
                        orderManager.updateOrderStatus(order.id, 'PROCESSING');
                    } else if (index === 2) {
                        orderManager.updateOrderStatus(order.id, 'CONFIRMED');
                        orderManager.updateOrderStatus(order.id, 'PROCESSING');
                        orderManager.updateOrderStatus(order.id, 'SHIPPED');
                    }
                }
            });
        }
    }

    // Cargar y mostrar pedidos
    loadOrders() {
        const result = orderManager.getAllOrders(
            this.currentPage, 
            this.itemsPerPage, 
            this.currentFilters
        );

        this.displayOrders(result.orders);
        this.updatePagination(result);
    }

    // Mostrar pedidos en la interfaz
    displayOrders(orders) {
        const container = document.getElementById('orders-list');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-orders">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No se encontraron pedidos</h3>
                    <p>No hay pedidos que coincidan con los filtros seleccionados</p>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-card" onclick="showOrderDetails('${order.id}')">
                <div class="order-header">
                    <div class="order-info">
                        <h3>${order.orderNumber}</h3>
                        <div class="order-meta">
                            <span><i class="fas fa-calendar"></i> ${Utils.formatDate(order.createdAt)}</span>
                            <span><i class="fas fa-user"></i> ${order.customer.name}</span>
                            <span><i class="fas fa-envelope"></i> ${order.customer.email}</span>
                        </div>
                    </div>
                    <div class="order-status status-${order.status.toLowerCase()}">
                        ${orderManager.orderStatuses[order.status]}
                    </div>
                </div>
                
                <div class="order-customer">
                    <h4>Cliente</h4>
                    <p>${order.customer.name} - ${order.customer.email}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${order.customer.address}</p>
                </div>

                <div class="order-items">
                    <h5>Productos (${order.items.length} items)</h5>
                    <div class="order-items-preview">
                        ${order.items.slice(0, 3).map(item => `
                            <span class="item-preview">${item.productName} x${item.quantity}</span>
                        `).join('')}
                        ${order.items.length > 3 ? `<span class="item-preview">+${order.items.length - 3} más</span>` : ''}
                    </div>
                </div>

                <div class="order-total">
                    Total: $${order.totals.total.toFixed(2)}
                </div>
            </div>
        `).join('');
    }

    // Actualizar paginación
    updatePagination(result) {
        const container = document.getElementById('pagination');
        if (!container || result.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, result.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(result.totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        container.innerHTML = `
            <button onclick="ordersUI.goToPage(1)" ${result.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-angle-double-left"></i>
            </button>
            <button onclick="ordersUI.goToPage(${result.currentPage - 1})" ${!result.hasPrevPage ? 'disabled' : ''}>
                <i class="fas fa-angle-left"></i>
            </button>
            
            ${Array.from({length: endPage - startPage + 1}, (_, i) => {
                const pageNum = startPage + i;
                return `<button class="${pageNum === result.currentPage ? 'active' : ''}" 
                               onclick="ordersUI.goToPage(${pageNum})">${pageNum}</button>`;
            }).join('')}
            
            <button onclick="ordersUI.goToPage(${result.currentPage + 1})" ${!result.hasNextPage ? 'disabled' : ''}>
                <i class="fas fa-angle-right"></i>
            </button>
            <button onclick="ordersUI.goToPage(${result.totalPages})" ${result.currentPage === result.totalPages ? 'disabled' : ''}>
                <i class="fas fa-angle-double-right"></i>
            </button>
            
            <div class="pagination-info">
                Mostrando ${(result.currentPage - 1) * this.itemsPerPage + 1} - 
                ${Math.min(result.currentPage * this.itemsPerPage, result.totalOrders)} 
                de ${result.totalOrders} pedidos
            </div>
        `;
    }

    // Ir a página específica
    goToPage(page) {
        this.currentPage = page;
        this.loadOrders();
    }

    // Buscar pedidos
    searchOrders() {
        const searchTerm = document.getElementById('search-orders').value.trim();
        if (searchTerm) {
            const results = orderManager.searchOrders(searchTerm);
            this.displayOrders(results);
            document.getElementById('pagination').innerHTML = '';
        } else {
            this.loadOrders();
        }
    }

    // Filtrar pedidos
    filterOrders() {
        const statusFilter = document.getElementById('status-filter').value;
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;

        this.currentFilters = {};
        
        if (statusFilter) this.currentFilters.status = statusFilter;
        if (dateFrom) this.currentFilters.dateFrom = dateFrom;
        if (dateTo) this.currentFilters.dateTo = dateTo;

        this.currentPage = 1;
        this.loadOrders();
    }

    // Limpiar filtros
    clearFilters() {
        document.getElementById('search-orders').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('date-from').value = '';
        document.getElementById('date-to').value = '';
        
        this.currentFilters = {};
        this.currentPage = 1;
        this.loadOrders();
    }

    // Mostrar detalles del pedido
    showOrderDetails(orderId) {
        const order = orderManager.getOrderById(orderId);
        if (!order) return;

        this.selectedOrderId = orderId;
        
        const modal = document.getElementById('order-details-modal');
        const title = document.getElementById('order-details-title');
        const content = document.getElementById('order-details-content');

        title.textContent = `Pedido ${order.orderNumber}`;
        
        content.innerHTML = `
            <div class="order-details">
                <div class="detail-section">
                    <h4><i class="fas fa-info-circle"></i> Información General</h4>
                    <div class="detail-row">
                        <span class="detail-label">Número de Pedido:</span>
                        <span class="detail-value">${order.orderNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Estado:</span>
                        <span class="detail-value">
                            <span class="order-status status-${order.status.toLowerCase()}">
                                ${orderManager.orderStatuses[order.status]}
                            </span>
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Fecha de Pedido:</span>
                        <span class="detail-value">${Utils.formatDate(order.createdAt)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Última Actualización:</span>
                        <span class="detail-value">${Utils.formatDate(order.updatedAt)}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <h4><i class="fas fa-user"></i> Información del Cliente</h4>
                    <div class="detail-row">
                        <span class="detail-label">Nombre:</span>
                        <span class="detail-value">${order.customer.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${order.customer.email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Dirección:</span>
                        <span class="detail-value">${order.customer.address}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <h4><i class="fas fa-credit-card"></i> Información de Pago</h4>
                    <div class="detail-row">
                        <span class="detail-label">Método:</span>
                        <span class="detail-value">${order.payment.method}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Estado del Pago:</span>
                        <span class="detail-value">${order.payment.status}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">ID Transacción:</span>
                        <span class="detail-value">${order.payment.transactionId}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <h4><i class="fas fa-shipping-fast"></i> Información de Envío</h4>
                    <div class="detail-row">
                        <span class="detail-label">Método:</span>
                        <span class="detail-value">${order.shipping.methodDetails.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Tiempo Estimado:</span>
                        <span class="detail-value">${order.shipping.methodDetails.days}</span>
                    </div>
                    ${order.shipping.trackingNumber ? `
                        <div class="detail-row">
                            <span class="detail-label">Número de Seguimiento:</span>
                            <span class="detail-value">${order.shipping.trackingNumber}</span>
                        </div>
                    ` : ''}
                    <div class="detail-row">
                        <span class="detail-label">Entrega Estimada:</span>
                        <span class="detail-value">${Utils.formatDate(order.shipping.estimatedDelivery)}</span>
                    </div>
                </div>

                <div class="detail-section order-items-detailed">
                    <h4><i class="fas fa-box"></i> Productos</h4>
                    ${order.items.map(item => `
                        <div class="item-row">
                            <div class="item-info">
                                <div class="item-image">${item.productImage}</div>
                                <div class="item-details">
                                    <h5>${item.productName}</h5>
                                    <p>Cantidad: ${item.quantity} x $${item.unitPrice.toFixed(2)}</p>
                                </div>
                            </div>
                            <div class="item-total">$${item.subtotal.toFixed(2)}</div>
                        </div>
                    `).join('')}
                    <div class="item-row">
                        <div class="item-info">
                            <strong>Subtotal:</strong>
                        </div>
                        <div class="item-total"><strong>$${order.totals.subtotal.toFixed(2)}</strong></div>
                    </div>
                    <div class="item-row">
                        <div class="item-info">
                            <strong>Envío:</strong>
                        </div>
                        <div class="item-total"><strong>$${order.totals.shipping.toFixed(2)}</strong></div>
                    </div>
                    <div class="item-row">
                        <div class="item-info">
                            <strong>Total:</strong>
                        </div>
                        <div class="item-total"><strong>$${order.totals.total.toFixed(2)}</strong></div>
                    </div>
                </div>

                <div class="detail-section status-history">
                    <h4><i class="fas fa-history"></i> Historial de Estados</h4>
                    <div class="status-timeline">
                        ${order.statusHistory.map(history => `
                            <div class="timeline-item">
                                <div class="timeline-content">
                                    <div class="timeline-status">${orderManager.orderStatuses[history.status]}</div>
                                    <div class="timeline-date">${Utils.formatDate(history.timestamp)}</div>
                                    ${history.note ? `<div class="timeline-note">${history.note}</div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    // Cerrar detalles del pedido
    closeOrderDetails() {
        document.getElementById('order-details-modal').style.display = 'none';
        this.selectedOrderId = null;
    }

    // Mostrar modal de actualización de estado
    showUpdateStatusModal() {
        if (!this.selectedOrderId) return;

        const order = orderManager.getOrderById(this.selectedOrderId);
        if (!order) return;

        const modal = document.getElementById('update-status-modal');
        const statusSelect = document.getElementById('new-status');
        
        // Limpiar opciones y agregar solo las válidas
        statusSelect.innerHTML = '<option value="">Seleccionar estado...</option>';
        
        const validTransitions = {
            PENDING: ['CONFIRMED', 'CANCELLED'],
            CONFIRMED: ['PROCESSING', 'CANCELLED'],
            PROCESSING: ['SHIPPED', 'CANCELLED'],
            SHIPPED: ['DELIVERED'],
            DELIVERED: [],
            CANCELLED: []
        };

        const validStatuses = validTransitions[order.status] || [];
        validStatuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = orderManager.orderStatuses[status];
            statusSelect.appendChild(option);
        });

        document.getElementById('status-note').value = '';
        modal.style.display = 'block';
    }

    // Cerrar modal de actualización de estado
    closeUpdateStatusModal() {
        document.getElementById('update-status-modal').style.display = 'none';
    }

    // Actualizar estado del pedido
    updateOrderStatus() {
        if (!this.selectedOrderId) return;

        const newStatus = document.getElementById('new-status').value;
        const note = document.getElementById('status-note').value;

        if (!newStatus) {
            cart.showNotification('Selecciona un nuevo estado', 'warning');
            return;
        }

        try {
            orderManager.updateOrderStatus(this.selectedOrderId, newStatus, note);
            cart.showNotification('Estado del pedido actualizado exitosamente', 'success');
            
            this.closeUpdateStatusModal();
            this.showOrderDetails(this.selectedOrderId); // Actualizar detalles
            this.loadOrders(); // Actualizar lista
        } catch (error) {
            cart.showNotification('Error al actualizar estado: ' + error.message, 'error');
        }
    }

    // Mostrar estadísticas
    showOrderStats() {
        const stats = orderManager.getOrderStatistics();
        const modal = document.getElementById('stats-modal');
        const content = document.getElementById('stats-content');

        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.totalOrders}</div>
                    <div class="stat-label">Total Pedidos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">$${stats.totalRevenue.toFixed(2)}</div>
                    <div class="stat-label">Ingresos Totales</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">$${stats.averageOrderValue.toFixed(2)}</div>
                    <div class="stat-label">Valor Promedio</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.ordersByStatus.DELIVERED || 0}</div>
                    <div class="stat-label">Pedidos Entregados</div>
                </div>
            </div>

            <div class="stats-chart">
                <h4>Pedidos por Estado</h4>
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th>Estado</th>
                            <th>Cantidad</th>
                            <th>Porcentaje</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.keys(orderManager.orderStatuses).map(status => {
                            const count = stats.ordersByStatus[status] || 0;
                            const percentage = stats.totalOrders > 0 ? (count / stats.totalOrders * 100).toFixed(1) : 0;
                            return `
                                <tr>
                                    <td>
                                        <span class="order-status status-${status.toLowerCase()}">
                                            ${orderManager.orderStatuses[status]}
                                        </span>
                                    </td>
                                    <td>${count}</td>
                                    <td>${percentage}%</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <div class="stats-chart">
                <h4>Productos Más Vendidos</h4>
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad Vendida</th>
                            <th>Ingresos</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.topProducts.map(product => `
                            <tr>
                                <td>${product.productName}</td>
                                <td>${product.totalQuantity}</td>
                                <td>$${product.totalRevenue.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        modal.style.display = 'block';
    }

    // Cerrar modal de estadísticas
    closeStatsModal() {
        document.getElementById('stats-modal').style.display = 'none';
    }

    // Exportar pedidos
    exportOrders() {
        const result = orderManager.getAllOrders(1, 1000, this.currentFilters);
        orderManager.exportOrdersToCSV(result.orders);
        cart.showNotification('Pedidos exportados exitosamente', 'success');
    }

    // Generar reporte
    generateReport() {
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        
        const report = orderManager.generateOrderReport(dateFrom, dateTo);
        
        // Simular descarga de reporte PDF
        console.log('Generando reporte PDF...', report);
        cart.showNotification('Reporte generado exitosamente', 'success');
        
        this.closeStatsModal();
    }
}

// Funciones globales para la interfaz
function showOrderDetails(orderId) {
    ordersUI.showOrderDetails(orderId);
}

function closeOrderDetails() {
    ordersUI.closeOrderDetails();
}

function showUpdateStatusModal() {
    ordersUI.showUpdateStatusModal();
}

function closeUpdateStatusModal() {
    ordersUI.closeUpdateStatusModal();
}

function updateOrderStatus() {
    ordersUI.updateOrderStatus();
}

function showOrderStats() {
    ordersUI.showOrderStats();
}

function closeStatsModal() {
    ordersUI.closeStatsModal();
}

function searchOrders() {
    ordersUI.searchOrders();
}

function filterOrders() {
    ordersUI.filterOrders();
}

function clearFilters() {
    ordersUI.clearFilters();
}

function exportOrders() {
    ordersUI.exportOrders();
}

function generateReport() {
    ordersUI.generateReport();
}

// Instancia global de la interfaz de pedidos
const ordersUI = new OrdersUI();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // La inicialización ya se hace en el constructor
    console.log('Sistema de gestión de pedidos inicializado');
});
