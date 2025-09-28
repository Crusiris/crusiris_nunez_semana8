// Base de datos simulada de productos
const productsDatabase = [
    {
        id: 1,
        name: "Smartphone Galaxy Pro",
        description: "Último modelo con cámara de 108MP y 5G",
        price: 899.99,
        category: "electronica",
        image: "📱",
        stock: 25,
        rating: 4.8,
        features: ["5G", "108MP", "128GB", "6.7 pulgadas"]
    },
    {
        id: 2,
        name: "Laptop Gaming Ultra",
        description: "Procesador Intel i7, RTX 4060, 16GB RAM",
        price: 1299.99,
        category: "electronica",
        image: "💻",
        stock: 15,
        rating: 4.9,
        features: ["Intel i7", "RTX 4060", "16GB RAM", "512GB SSD"]
    },
    {
        id: 3,
        name: "Auriculares Inalámbricos",
        description: "Cancelación de ruido activa, 30h batería",
        price: 199.99,
        category: "electronica",
        image: "🎧",
        stock: 50,
        rating: 4.7,
        features: ["Noise Cancelling", "30h batería", "Bluetooth 5.0"]
    },
    {
        id: 4,
        name: "Camiseta Premium",
        description: "100% algodón orgánico, corte moderno",
        price: 29.99,
        category: "ropa",
        image: "👕",
        stock: 100,
        rating: 4.5,
        features: ["Algodón orgánico", "Corte slim", "Varios colores"]
    },
    {
        id: 5,
        name: "Zapatillas Running",
        description: "Tecnología de amortiguación avanzada",
        price: 129.99,
        category: "deportes",
        image: "👟",
        stock: 35,
        rating: 4.6,
        features: ["Amortiguación", "Transpirables", "Ligeras"]
    },
    {
        id: 6,
        name: "Cafetera Automática",
        description: "Molinillo integrado, 12 tazas",
        price: 249.99,
        category: "hogar",
        image: "☕",
        stock: 20,
        rating: 4.4,
        features: ["Molinillo integrado", "12 tazas", "Programable"]
    },
    {
        id: 7,
        name: "Smart TV 65 pulgadas",
        description: "4K Ultra HD, HDR, Smart OS",
        price: 799.99,
        category: "electronica",
        image: "📺",
        stock: 12,
        rating: 4.8,
        features: ["4K Ultra HD", "HDR", "Smart OS", "65 pulgadas"]
    },
    {
        id: 8,
        name: "Reloj Deportivo",
        description: "GPS, monitor cardíaco, resistente al agua",
        price: 299.99,
        category: "deportes",
        image: "⌚",
        stock: 30,
        rating: 4.7,
        features: ["GPS", "Monitor cardíaco", "Resistente agua", "7 días batería"]
    }
];

// Variables globales
let allProducts = [...productsDatabase];
let filteredProducts = [...productsDatabase];
let currentSearchTerm = '';

// Función para inicializar los productos
function initializeProducts() {
    displayProducts(allProducts);
    setupEventListeners();
}

// Configurar event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchProducts, 300));
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    if (priceFilter) {
        priceFilter.addEventListener('change', filterProducts);
    }
}

// Función debounce para optimizar búsqueda
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Mostrar productos en el DOM
function displayProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `
            <div class="no-products">
                <h3>No se encontraron productos</h3>
                <p>Intenta con otros términos de búsqueda o filtros</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                ${product.image}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-features">
                    ${product.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
                <div class="product-rating">
                    ${generateStars(product.rating)}
                    <span class="rating-value">(${product.rating})</span>
                </div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-stock ${product.stock < 10 ? 'low-stock' : ''}">
                    ${product.stock < 10 ? '¡Últimas unidades!' : `${product.stock} disponibles`}
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                    </button>
                    <button class="btn-view-details" onclick="viewProductDetails(${product.id})">
                        Ver Detalles
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Generar estrellas para rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Función de búsqueda
function searchProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    currentSearchTerm = searchTerm;
    
    if (searchTerm === '') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.features.some(feature => feature.toLowerCase().includes(searchTerm))
        );
    }
    
    applyFilters();
}

// Función de filtrado
function filterProducts() {
    const categoryFilter = document.getElementById('category-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    
    let filtered = currentSearchTerm ? 
        allProducts.filter(product => 
            product.name.toLowerCase().includes(currentSearchTerm) ||
            product.description.toLowerCase().includes(currentSearchTerm) ||
            product.category.toLowerCase().includes(currentSearchTerm) ||
            product.features.some(feature => feature.toLowerCase().includes(currentSearchTerm))
        ) : [...allProducts];
    
    // Filtro por categoría
    if (categoryFilter) {
        filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    // Filtro por precio
    if (priceFilter) {
        filtered = filtered.filter(product => {
            const price = product.price;
            switch (priceFilter) {
                case '0-50':
                    return price <= 50;
                case '50-100':
                    return price > 50 && price <= 100;
                case '100-200':
                    return price > 100 && price <= 200;
                case '200+':
                    return price > 200;
                default:
                    return true;
            }
        });
    }
    
    filteredProducts = filtered;
    displayProducts(filteredProducts);
}

// Aplicar filtros sin modificar la búsqueda actual
function applyFilters() {
    const categoryFilter = document.getElementById('category-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    
    let filtered = [...filteredProducts];
    
    // Filtro por categoría
    if (categoryFilter) {
        filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    // Filtro por precio
    if (priceFilter) {
        filtered = filtered.filter(product => {
            const price = product.price;
            switch (priceFilter) {
                case '0-50':
                    return price <= 50;
                case '50-100':
                    return price > 50 && price <= 100;
                case '100-200':
                    return price > 100 && price <= 200;
                case '200+':
                    return price > 200;
                default:
                    return true;
            }
        });
    }
    
    displayProducts(filtered);
}

// Obtener producto por ID
function getProductById(id) {
    return allProducts.find(product => product.id === id);
}

// Ver detalles del producto
function viewProductDetails(productId) {
    const product = getProductById(productId);
    if (!product) return;
    
    // Crear modal de detalles del producto
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'product-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${product.name}</h3>
                <span class="close" onclick="closeProductDetails()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="product-details">
                    <div class="product-image-large">${product.image}</div>
                    <div class="product-info-detailed">
                        <p class="product-description">${product.description}</p>
                        <div class="product-rating">
                            ${generateStars(product.rating)}
                            <span class="rating-value">(${product.rating}/5)</span>
                        </div>
                        <div class="product-features-detailed">
                            <h4>Características:</h4>
                            <ul>
                                ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="product-price-large">$${product.price.toFixed(2)}</div>
                        <div class="product-stock">
                            Stock disponible: ${product.stock} unidades
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeProductDetails()">Cerrar</button>
                <button class="btn-primary" onclick="addToCart(${product.id}); closeProductDetails();" ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Cerrar modal de detalles
function closeProductDetails() {
    const modal = document.getElementById('product-details-modal');
    if (modal) {
        modal.remove();
    }
}

// Función para scroll suave a productos
function scrollToProducts() {
    const productsSection = document.getElementById('productos');
    if (productsSection) {
        productsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Función para actualizar stock después de compra
function updateProductStock(productId, quantity) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        product.stock -= quantity;
        // Actualizar la visualización si el producto está visible
        displayProducts(filteredProducts);
    }
}

// Función para obtener productos con bajo stock
function getLowStockProducts() {
    return allProducts.filter(product => product.stock < 10);
}

// Función para obtener productos por categoría
function getProductsByCategory(category) {
    return allProducts.filter(product => product.category === category);
}

// Función para obtener productos ordenados por rating
function getTopRatedProducts(limit = 5) {
    return [...allProducts]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeProducts);
