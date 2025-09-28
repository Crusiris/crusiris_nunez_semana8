# TiendaWeb - Aplicación de Comercio Electrónico

## Descripción

TiendaWeb es una aplicación de comercio electrónico moderna que permite a los usuarios buscar y filtrar productos, agregarlos a su carrito de compras, realizar pagos en línea de manera segura y recibir notificaciones sobre promociones y descuentos.

## 🚀 Características Principales

### ✅ Funcionalidades Implementadas

- **Catálogo de Productos**
  - Visualización de productos con imágenes, precios y descripciones
  - Sistema de búsqueda en tiempo real
  - Filtros por categoría y rango de precios
  - Detalles completos de productos
  - Sistema de calificaciones con estrellas

- **Carrito de Compras**
  - Agregar/remover productos
  - Actualizar cantidades
  - Cálculo automático de totales
  - Persistencia en localStorage
  - Validación de stock disponible

- **Sistema de Pagos**
  - Múltiples métodos de pago (Tarjeta, PayPal, Transferencia)
  - Formulario de checkout seguro
  - Validación de datos de cliente
  - Simulación de procesamiento de pagos

- **Gestión de Pedidos** 📦
  - Creación automática de pedidos
  - Seguimiento de estados (Pendiente, Confirmado, Procesando, Enviado, Entregado, Cancelado)
  - Historial completo de cambios de estado
  - Números de seguimiento para envíos
  - Notificaciones por email (simuladas)
  - Interfaz de administración de pedidos
  - Estadísticas y reportes
  - Exportación de datos a CSV

- **Notificaciones y Promociones**
  - Sistema de notificaciones push
  - Ofertas especiales por tiempo limitado
  - Notificaciones in-app
  - Promociones según horarios (empresarial, fin de semana)

- **Analytics y Seguimiento**
  - Seguimiento de eventos (vistas de producto, compras, búsquedas)
  - Métricas de sesión
  - Análisis de comportamiento del usuario

## 📁 Estructura del Proyecto

```
tarea 8/
├── index.html              # Página principal de la tienda
├── orders.html             # Panel de gestión de pedidos
├── css/
│   ├── styles.css          # Estilos principales
│   └── orders.css          # Estilos específicos para pedidos
├── js/
│   ├── products.js         # Lógica de productos y catálogo
│   ├── cart.js             # Sistema de carrito de compras
│   ├── orders.js           # Gestión de pedidos (NUEVA FUNCIONALIDAD)
│   ├── orders-ui.js        # Interfaz de usuario para pedidos
│   └── main.js             # Funciones principales y utilidades
└── README.md              # Documentación del proyecto
```

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Estilos**: CSS Grid, Flexbox, Animaciones CSS
- **Persistencia**: LocalStorage para datos del cliente
- **Iconos**: Font Awesome 6.0
- **Responsive**: Mobile-first design

## 🚀 Instalación y Uso

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/tiendaweb.git
   cd tiendaweb
   ```

2. **Abrir en el navegador**
   - Abrir `index.html` en un navegador web moderno
   - Para la gestión de pedidos, navegar a `orders.html`

3. **Servidor local (recomendado)**
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Node.js (http-server)
   npx http-server
   ```

## 📦 Nueva Funcionalidad: Gestión de Pedidos

### Características de la Gestión de Pedidos

#### 🎯 Funcionalidades Principales

1. **Creación de Pedidos**
   - Conversión automática del carrito a pedido
   - Asignación de número de orden único
   - Captura de información del cliente
   - Cálculo de totales incluyendo envío

2. **Estados del Pedido**
   - **Pendiente**: Pedido creado, esperando confirmación
   - **Confirmado**: Pedido confirmado por el cliente
   - **Procesando**: Pedido en preparación
   - **Enviado**: Pedido despachado con número de seguimiento
   - **Entregado**: Pedido entregado al cliente
   - **Cancelado**: Pedido cancelado

3. **Seguimiento Completo**
   - Historial detallado de cambios de estado
   - Timestamps de cada transición
   - Notas adicionales para cada cambio
   - Números de seguimiento para envíos

4. **Panel de Administración**
   - Lista paginada de todos los pedidos
   - Filtros por estado, fecha y cliente
   - Búsqueda por número de orden o cliente
   - Vista detallada de cada pedido
   - Actualización manual de estados

5. **Estadísticas y Reportes**
   - Total de pedidos e ingresos
   - Distribución por estados
   - Productos más vendidos
   - Valor promedio de pedido
   - Exportación a CSV

#### 💻 Uso del Sistema de Pedidos

**Para Clientes:**
1. Agregar productos al carrito
2. Proceder al checkout
3. Completar información de envío y pago
4. Confirmar el pedido
5. Recibir número de orden para seguimiento

**Para Administradores:**
1. Acceder a `orders.html`
2. Ver lista de pedidos con filtros
3. Hacer clic en un pedido para ver detalles
4. Actualizar estado según progreso real
5. Generar reportes y estadísticas

### 🔧 API del Sistema de Pedidos

#### Clase OrderManager

```javascript
// Crear nuevo pedido
const order = orderManager.createOrder(customerData, cartItems, paymentMethod);

// Actualizar estado
orderManager.updateOrderStatus(orderId, 'SHIPPED', 'Enviado con DHL');

// Obtener pedidos
const orders = orderManager.getAllOrders(page, limit, filters);

// Buscar pedidos
const results = orderManager.searchOrders('ORD-123');

// Estadísticas
const stats = orderManager.getOrderStatistics(dateFrom, dateTo);
```

#### Eventos y Notificaciones

```javascript
// Escuchar cambios de estado
orderManager.on('statusChange', (order, newStatus) => {
    console.log(`Pedido ${order.orderNumber} cambió a ${newStatus}`);
});

// Notificaciones automáticas
orderNotifications.scheduleOrderReminders();
```

## 🎨 Diseño y UX

### Características de Diseño

- **Responsive Design**: Adaptable a todos los dispositivos
- **Animaciones Suaves**: Transiciones CSS para mejor experiencia
- **Colores Consistentes**: Paleta de colores profesional
- **Iconografía Clara**: Font Awesome para iconos intuitivos
- **Loading States**: Indicadores de carga para operaciones

### Elementos de UI

- **Cards**: Para productos y pedidos
- **Modales**: Para detalles y formularios
- **Notificaciones**: Sistema de toast notifications
- **Filtros**: Controles de búsqueda y filtrado
- **Paginación**: Navegación entre páginas de resultados

## 🔒 Consideraciones de Seguridad

- Validación de entrada en frontend
- Sanitización de datos de usuario
- Simulación segura de pagos
- Protección contra XSS básica
- Validación de stock antes de compra

## 📱 Compatibilidad

- **Navegadores**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Dispositivos**: Desktop, Tablet, Mobile
- **Resoluciones**: 320px - 1920px+

## 🚧 Próximas Funcionalidades

- [ ] Sistema de usuarios y autenticación
- [ ] Integración con pasarelas de pago reales
- [ ] API backend para persistencia
- [ ] Sistema de reviews y comentarios
- [ ] Integración con servicios de envío
- [ ] Notificaciones push reales
- [ ] Panel de administración completo
- [ ] Sistema de cupones y descuentos

## 👥 Contribución

Este proyecto está diseñado para trabajo colaborativo en GitHub:

1. **Fork** del repositorio
2. **Crear rama** para nueva funcionalidad
3. **Desarrollar** con commits descriptivos
4. **Pull Request** con descripción detallada
5. **Code Review** entre colaboradores
6. **Merge** después de aprobación

### Buenas Prácticas Implementadas

- Commits atómicos y descriptivos
- Ramas por funcionalidad
- Code review antes de merge
- Documentación actualizada
- Issues para tracking de bugs/features

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

## 📞 Contacto

Para preguntas o sugerencias sobre el proyecto:
- Crear un **Issue** en GitHub
- Enviar **Pull Request** con mejoras
- Contactar al equipo de desarrollo

---

**TiendaWeb** - Desarrollado con ❤️ por el equipo de Programación Web II
