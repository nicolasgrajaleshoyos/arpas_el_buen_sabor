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
                    <td colspan="5" class="text-center py-8 text-gray-500 dark:text-gray-400">
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
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${item.productName}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${item.quantity}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">$${item.unitPrice.toLocaleString()}</td>
                <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">$${item.total.toLocaleString()}</td>
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
            this.showAlert('error', 'Carrito Vacío', 'Agrega productos al carrito antes de completar la venta');
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + item.total, 0);

        this.showConfirmAlert(
            '¿Confirmar Venta?',
            `Total: $${total.toLocaleString()}<br>Productos: ${this.cart.length}`,
            'Sí, Completar Venta',
            'Cancelar'
        ).then((result) => {
            if (result.isConfirmed) {
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

                this.showAlert('success', '¡Venta Exitosa!', `Total: $${total.toLocaleString()}`);

                // Clear cart
                this.cart = [];
                this.renderCart();

                // Reload data
                this.loadSales();
                this.loadProductOptions();
            }
        });
    },

    deleteSale(saleId) {
        const sale = Database.getById('sales', saleId);
        if (!sale) return;

        this.showConfirmAlert(
            '¿Eliminar Venta?',
            `Producto: ${sale.productName}<br>Total: $${sale.total.toLocaleString()}`,
            'Sí, Eliminar',
            'Cancelar',
            'warning'
        ).then((result) => {
            if (result.isConfirmed) {
                // Restore stock
                const product = Database.getById('products', sale.productId);
                if (product) {
                    Database.update('products', sale.productId, {
                        stock: product.stock + sale.quantity
                    });
                }

                // Delete sale
                Database.delete('sales', saleId);

                this.showAlert('success', 'Venta Eliminada', 'El stock ha sido restaurado');
                this.loadSales();
                this.loadProductOptions();
            }
        });
    },

    showAlert(icon, title, text) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: icon,
                title: title,
                html: text,
                confirmButtonColor: '#10b981',
                confirmButtonText: 'Entendido'
            });
        } else {
            // Fallback to Toast
            if (icon === 'success') Toast.success(title);
            else if (icon === 'error') Toast.error(title);
            else Toast.info(title);
        }
    },

    showConfirmAlert(title, html, confirmText, cancelText, icon = 'question') {
        if (typeof Swal !== 'undefined') {
            return Swal.fire({
                title: title,
                html: html,
                icon: icon,
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#ef4444',
                confirmButtonText: confirmText,
                cancelButtonText: cancelText
            });
        } else {
            // Fallback to confirm
            return Promise.resolve({ isConfirmed: confirm(title) });
        }
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
                    <td colspan="5" class="text-center py-16 text-gray-400 dark:text-gray-500">
                        <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        <p class="text-sm">No hay ventas registradas</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Show last 30 sales
        const recentSales = this.currentSales.slice(0, 30);

        tbody.innerHTML = recentSales.map(sale => {
            const date = new Date(sale.date);
            const formattedDate = date.toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'short'
            });
            const formattedTime = date.toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            return `
            <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-4 py-3">
                    <div class="text-xs text-gray-900 dark:text-white">${formattedDate}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">${formattedTime}</div>
                </td>
                <td class="px-4 py-3">
                    <div class="text-sm text-gray-900 dark:text-white">${sale.productName}</div>
                </td>
                <td class="px-4 py-3 text-center">
                    <span class="text-sm font-medium text-blue-600 dark:text-blue-400">${sale.quantity}</span>
                </td>
                <td class="px-4 py-3 text-right">
                    <div class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">$${sale.total.toLocaleString()}</div>
                </td>
                <td class="px-4 py-3 text-center">
                    <button onclick="Sales.deleteSale(${sale.id})" class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `}).join('');
    },

    render() {
        const stats = Database.getStats();
        const todaySales = Database.getAll('sales').filter(s => {
            const saleDate = new Date(s.date);
            const today = new Date();
            return saleDate.toDateString() === today.toDateString();
        });
        const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
        const todayCount = todaySales.length;

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">💰 Punto de Venta</h1>
                        <p class="text-gray-600 dark:text-gray-400 mt-1">Registra ventas y gestiona el inventario automáticamente</p>
                    </div>
                    
                    <!-- Quick Stats -->
                    <div class="flex gap-4">
                        <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl px-6 py-3 shadow-lg">
                            <div class="text-xs font-medium opacity-90">Ventas Hoy</div>
                            <div class="text-2xl font-bold">${todayCount}</div>
                        </div>
                        <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl px-6 py-3 shadow-lg">
                            <div class="text-xs font-medium opacity-90">Total Hoy</div>
                            <div class="text-2xl font-bold">$${todayTotal.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
                
                <!-- POS Section - Full Width -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Product Selection -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-100 dark:border-gray-700 transition-colors">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                            </div>
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Agregar Producto</h2>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Producto</label>
                                <select id="sale-product" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                    <option value="">Selecciona un producto...</option>
                                </select>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cantidad</label>
                                    <input type="number" id="sale-quantity" min="1" placeholder="0" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Precio Unitario</label>
                                    <input type="number" id="sale-price" readonly class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                </div>
                            </div>
                            
                            <button id="add-to-cart-btn" class="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Agregar al Carrito
                            </button>
                        </div>
                    </div>
                    
                    <!-- Cart -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-100 dark:border-gray-700 transition-colors">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Carrito de Venta</h2>
                        </div>
                        
                        <div class="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <table class="w-full">
                                <thead class="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">Producto</th>
                                        <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">Cant.</th>
                                        <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">Precio</th>
                                        <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">Total</th>
                                        <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody id="cart-tbody">
                                    <tr>
                                        <td colspan="5" class="text-center py-8 text-gray-500">
                                            <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                            </svg>
                                            El carrito está vacío
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                                <span id="cart-total" class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">$0</span>
                            </div>
                            
                            <button id="complete-sale-btn" disabled class="w-full px-4 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg opacity-50 cursor-not-allowed disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Completar Venta
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Sales History - Full Width at Bottom -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-100 dark:border-gray-700 transition-colors">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                        </div>
                        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Historial de Ventas</h2>
                        <span class="ml-auto text-sm text-gray-500 dark:text-gray-400">Últimas 30 ventas</span>
                    </div>
                    
                    <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table class="w-full">
                            <thead class="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">Fecha</th>
                                    <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">Producto</th>
                                    <th class="text-center text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">Cant.</th>
                                    <th class="text-right text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">Total</th>
                                    <th class="text-center text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody id="sales-tbody">
                                <!-- Sales will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
};
