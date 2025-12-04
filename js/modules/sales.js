// Sales Module
const Sales = {
    cart: [],
    currentSales: [],

    init() {
        console.log('Inicializando Ventas...');
        this.loadSales();
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Product selector
        const productSelect = document.getElementById('sale-product');
        if (productSelect) {
            this.loadProductOptions();

            productSelect.addEventListener('change', () => {
                const productId = parseInt(productSelect.value);
                if (productId) {
                    const product = Database.getById('products', productId);
                    if (product) {
                        document.getElementById('sale-price').value = product.price;
                        document.getElementById('sale-quantity').value = 1;
                        document.getElementById('sale-quantity').max = product.stock;
                    }
                }
            });
        }

        // Add to cart button
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.addToCart());
        }

        // Complete sale button
        const completeSaleBtn = document.getElementById('complete-sale-btn');
        if (completeSaleBtn) {
            completeSaleBtn.addEventListener('click', () => this.completeSale());
        }
    },

    loadProductOptions() {
        const select = document.getElementById('sale-product');
        if (!select) return;

        const products = Database.getAll('products').filter(p => p.stock > 0);

        select.innerHTML = '<option value="">Selecciona un producto...</option>' +
            products.map(p => `<option value="${p.id}">${p.name} (Stock: ${p.stock})</option>`).join('');
    },

    addToCart() {
        const productId = parseInt(document.getElementById('sale-product').value);
        const quantity = parseInt(document.getElementById('sale-quantity').value);

        if (!productId || !quantity) {
            Toast.error('Selecciona un producto y cantidad');
            return;
        }

        const product = Database.getById('products', productId);

        if (!product) {
            Toast.error('Producto no encontrado');
            return;
        }

        if (quantity > product.stock) {
            Toast.error(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles`);
            return;
        }

        // Check if product already in cart
        const existingItem = this.cart.find(item => item.productId === productId);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.stock) {
                Toast.error(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles`);
                return;
            }
            existingItem.quantity = newQuantity;
            existingItem.total = existingItem.quantity * existingItem.unitPrice;
        } else {
            this.cart.push({
                productId: product.id,
                productName: product.name,
                quantity: quantity,
                unitPrice: product.price,
                total: quantity * product.price
            });
        }

        Toast.success('Producto agregado al carrito');
        this.renderCart();

        // Reset form
        document.getElementById('sale-product').value = '';
        document.getElementById('sale-quantity').value = '';
        document.getElementById('sale-price').value = '';
    },

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.renderCart();
        Toast.info('Producto removido del carrito');
    },

    renderCart() {
        const tbody = document.getElementById('cart-tbody');
        const totalElement = document.getElementById('cart-total');
        const completeSaleBtn = document.getElementById('complete-sale-btn');

        if (!tbody) return;

        if (this.cart.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-8 text-gray-500">
                        El carrito está vacío
                    </td>
                </tr>
            `;
            totalElement.textContent = '$0';
            completeSaleBtn.disabled = true;
            completeSaleBtn.classList.add('opacity-50', 'cursor-not-allowed');
            return;
        }

        tbody.innerHTML = this.cart.map((item, index) => `
            <tr>
                <td class="px-6 py-4 font-medium text-gray-900">${item.productName}</td>
                <td class="px-6 py-4 text-gray-600">${item.quantity}</td>
                <td class="px-6 py-4 text-gray-600">$${item.unitPrice.toLocaleString()}</td>
                <td class="px-6 py-4 font-semibold text-gray-900">$${item.total.toLocaleString()}</td>
                <td class="px-6 py-4">
                    <button onclick="Sales.removeFromCart(${index})" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `).join('');

        const total = this.cart.reduce((sum, item) => sum + item.total, 0);
        totalElement.textContent = '$' + total.toLocaleString();

        completeSaleBtn.disabled = false;
        completeSaleBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    },

    completeSale() {
        if (this.cart.length === 0) {
            Toast.error('El carrito está vacío');
            return;
        }

        if (!confirm('¿Confirmar venta?')) {
            return;
        }

        // Process each item in cart
        this.cart.forEach(item => {
            // Add sale record
            Database.add('sales', {
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
                date: new Date().toISOString()
            });

            // Update product stock
            const product = Database.getById('products', item.productId);
            if (product) {
                Database.update('products', item.productId, {
                    stock: product.stock - item.quantity
                });
            }
        });

        Toast.success('Venta completada exitosamente');

        // Clear cart
        this.cart = [];
        this.renderCart();

        // Reload data
        this.loadSales();
        this.loadProductOptions();
    },

    loadSales() {
        this.currentSales = Database.getAll('sales').sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );
        this.renderSalesTable();
    },

    renderSalesTable() {
        const tbody = document.getElementById('sales-tbody');
        if (!tbody) return;

        if (this.currentSales.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-8 text-gray-500">
                        No hay ventas registradas
                    </td>
                </tr>
            `;
            return;
        }

        // Show last 20 sales
        const recentSales = this.currentSales.slice(0, 20);

        tbody.innerHTML = recentSales.map(sale => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 text-gray-600">${new Date(sale.date).toLocaleString()}</td>
                <td class="px-6 py-4 font-medium text-gray-900">${sale.productName}</td>
                <td class="px-6 py-4 text-gray-600">${sale.quantity}</td>
                <td class="px-6 py-4 text-gray-600">$${sale.unitPrice.toLocaleString()}</td>
                <td class="px-6 py-4 font-semibold text-emerald-600">$${sale.total.toLocaleString()}</td>
            </tr>
        `).join('');
    },

    render() {
        return `
            <div class="space-y-6">
                <!-- Header -->
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Punto de Venta</h1>
                    <p class="text-gray-600 mt-1">Registra ventas y gestiona el inventario automáticamente</p>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- POS Section -->
                    <div class="space-y-6">
                        <!-- Product Selection -->
                        <div class="bg-white rounded-xl shadow-soft p-6">
                            <h2 class="text-xl font-semibold text-gray-900 mb-4">Agregar Producto</h2>
                            
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Producto</label>
                                    <select id="sale-product" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                        <option value="">Selecciona un producto...</option>
                                    </select>
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                                        <input type="number" id="sale-quantity" min="1" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Precio</label>
                                        <input type="number" id="sale-price" readonly class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                    </div>
                                </div>
                                
                                <button id="add-to-cart-btn" class="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    Agregar al Carrito
                                </button>
                            </div>
                        </div>
                        
                        <!-- Cart -->
                        <div class="bg-white rounded-xl shadow-soft p-6">
                            <h2 class="text-xl font-semibold text-gray-900 mb-4">Carrito de Venta</h2>
                            
                            <div class="overflow-x-auto mb-4">
                                <table class="w-full">
                                    <thead>
                                        <tr>
                                            <th class="text-left text-sm">Producto</th>
                                            <th class="text-left text-sm">Cant.</th>
                                            <th class="text-left text-sm">Precio</th>
                                            <th class="text-left text-sm">Total</th>
                                            <th class="text-left text-sm"></th>
                                        </tr>
                                    </thead>
                                    <tbody id="cart-tbody">
                                        <tr>
                                            <td colspan="5" class="text-center py-8 text-gray-500">
                                                El carrito está vacío
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="border-t pt-4">
                                <div class="flex justify-between items-center mb-4">
                                    <span class="text-lg font-semibold text-gray-900">Total:</span>
                                    <span id="cart-total" class="text-2xl font-bold text-emerald-600">$0</span>
                                </div>
                                
                                <button id="complete-sale-btn" disabled class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors opacity-50 cursor-not-allowed">
                                    Completar Venta
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sales History -->
                    <div class="bg-white rounded-xl shadow-soft p-6">
                        <h2 class="text-xl font-semibold text-gray-900 mb-4">Historial de Ventas</h2>
                        
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr>
                                        <th class="text-left text-sm">Fecha</th>
                                        <th class="text-left text-sm">Producto</th>
                                        <th class="text-left text-sm">Cant.</th>
                                        <th class="text-left text-sm">Precio</th>
                                        <th class="text-left text-sm">Total</th>
                                    </tr>
                                </thead>
                                <tbody id="sales-tbody">
                                    <!-- Sales will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
