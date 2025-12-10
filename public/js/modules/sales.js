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

        // History filters
        const historySearch = document.getElementById('history-search');
        if (historySearch) {
            historySearch.addEventListener('input', () => this.renderSalesTable());
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
                <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    $${item.total.toLocaleString()}
                </td>
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
        totalElement.className = `text-3xl font-bold text-emerald-600 dark:text-emerald-400`;

        completeSaleBtn.disabled = false;
        completeSaleBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        completeSaleBtn.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Completar Venta
        `;
        completeSaleBtn.className = `w-full px-4 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2`;
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
                        date: new Date().toISOString(),
                        status: 'completed',
                        returnedAt: null
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

    returnSale(saleId) {
        // NOTE: This is for returning from HISTORY (still needed in Sales history context usually? 
        // User request: "que esto em salga es devoluciones que compras solo este para compras y en devoluciobes solo este en devoluciones".
        // This likely means he wants the ABILITY TO RETURN items to be in the Returns module too?
        // Or does he just mean the "Mode" to create NEW returns (which are correction returns)?
        // If I remove `returnSale` from here, the user cannot return a specific past sale easily. 
        // However, the user said "compras solo este para compras" (purchases only for purchases).
        // Returning a past purchase IS a purchase lifecycle event.
        // BUT, the context is "Modo Devolución" (The button at the top).
        // I will KEEP `returnSale` (return w/ button on row) for now as it makes sense in history. 
        // I will ONLY remove the "Modo Devolución" (Create generic return) from the top.

        const sale = Database.getById('sales', saleId);
        if (!sale) return;

        if (sale.status === 'returned') {
            this.showAlert('info', 'Ya devuelto', 'Esta venta ya ha sido marcada como devuelta.');
            return;
        }

        this.showConfirmAlert(
            '¿Realizar Devolución?',
            `Producto: ${sale.productName}<br>Total a devolver: $${sale.total.toLocaleString()}`,
            'Sí, Devolver',
            'Cancelar',
            'warning'
        ).then((result) => {
            if (result.isConfirmed) {
                // NOTE: User specified returned products are NOT reused (waste).
                // DO NOT restore stock.

                // Mark sale as returned instead of deleting
                Database.update('sales', saleId, {
                    status: 'returned',
                    returnedAt: new Date().toISOString()
                });

                this.showAlert('success', 'Devolución Exitosa', 'El producto ha sido regresado al inventario');
                this.loadSales();
                this.loadProductOptions(); // Refresh stock display
            }
        });
    },

    deleteSale(saleId) {
        const sale = Database.getById('sales', saleId);
        if (!sale) return;

        this.showConfirmAlert(
            '¿Eliminar Venta?',
            `Esta acción es irreversible y restaurará el stock.<br>Producto: ${sale.productName}`,
            'Sí, Eliminar',
            'Cancelar',
            'error'
        ).then((result) => {
            if (result.isConfirmed) {
                // Restore stock
                const product = Database.getById('products', sale.productId);
                if (product) {
                    Database.update('products', product.id, {
                        stock: product.stock + sale.quantity
                    });
                }

                // Delete sale
                Database.delete('sales', saleId);

                this.showAlert('success', 'Venta Eliminada', 'La venta ha sido eliminada y el stock restaurado');
                this.loadSales();
                this.loadProductOptions(); // Refresh stock display
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
        // EXCLUDE returned sales from the main list as per user request
        this.currentSales = Database.getAll('sales')
            .filter(s => s.status !== 'returned')
            .sort((a, b) => new Date(b.date) - new Date(a.date));
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

        // Filter Logic
        let filteredSales = this.currentSales;
        const searchInput = document.getElementById('history-search');

        if (searchInput && searchInput.value) {
            const term = searchInput.value.toLowerCase();
            filteredSales = filteredSales.filter(s =>
                s.productName.toLowerCase().includes(term)
            );
        }

        // Apply slice only if NO filter is active, to show history context
        const isFiltering = (searchInput && searchInput.value);
        const displaySales = isFiltering ? filteredSales.slice(0, 100) : filteredSales.slice(0, 30);

        // Calculate and Show/Hide Filter Stats
        const statsContainer = document.getElementById('history-stats-container');
        const countEl = document.getElementById('history-stats-count');
        const moneyEl = document.getElementById('history-stats-money');

        if (statsContainer && countEl && moneyEl) {
            if (isFiltering) {
                const totalQty = filteredSales.reduce((sum, s) => sum + s.quantity, 0);
                const totalMoney = filteredSales.reduce((sum, s) => sum + s.total, 0);

                countEl.textContent = totalQty;
                moneyEl.textContent = '$' + totalMoney.toLocaleString();
                statsContainer.classList.remove('hidden');
                statsContainer.classList.add('flex');
            } else {
                statsContainer.classList.add('hidden');
                statsContainer.classList.remove('flex');
            }
        }

        if (displaySales.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-8 text-gray-400">
                        No se encontraron resultados
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = displaySales.map(sale => {
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

            // Since we filter out returns, all are valid sales
            const rowClass = 'border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors';

            return `
                <tr class="${rowClass}">
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
                <td class="px-4 py-3 text-center flex justify-center gap-2">
                    <button onclick="Sales.returnSale(${sale.id})" class="p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors" title="Devolver">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                        </svg>
                    </button>
                    <button onclick="Sales.deleteSale(${sale.id})" class="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Eliminar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </td>
            </tr>
    `;
        }).join('');
    },

    render() {
        const stats = Database.getStats();
        const allSales = Database.getAll('sales');
        const today = new Date();

        // Filter for today
        const todaySalesData = allSales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate.toDateString() === today.toDateString();
        });

        // Valid sales (not returned)
        const validSales = todaySalesData.filter(s => s.status !== 'returned');
        const todayCount = validSales.length;
        const todayTotal = validSales.reduce((sum, s) => sum + s.total, 0);

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">💰 Punto de Venta</h1>
                        <p class="text-gray-600 dark:text-gray-400 mt-1">Registra ventas y gestiona el inventario automáticamente</p>
                    </div>
                    
                    <!-- Quick Stats -->
                    <div class="flex gap-4 flex-wrap">
                        <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl px-6 py-3 shadow-lg flex-1 md:flex-none">
                            <div class="text-xs font-medium opacity-90">Ventas Hoy</div>
                            <div class="text-2xl font-bold">${todayCount}</div>
                        </div>
                        <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl px-6 py-3 shadow-lg flex-1 md:flex-none">
                            <div class="text-xs font-medium opacity-90">Total Hoy</div>
                            <div class="text-2xl font-bold">$${todayTotal.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
                
                <!-- POS Section -->
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
                        <!-- Return Mode Button REMOVED -->
                        
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
                                    <!-- Cart Items -->
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

                <!-- Sales History -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-100 dark:border-gray-700 transition-colors">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="font-semibold text-gray-900 dark:text-white">Historial de Ventas</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Últimos movimientos registrados</p>
                            </div>
                        </div>

                        <!-- Filters -->
                        <div class="flex flex-col md:flex-row gap-3">
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </span>
                                <input type="text" id="history-search" placeholder="Buscar producto..."
                                    class="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none w-full md:w-64">
                            </div>
                        </div>
                        </div>
                        
                        <!-- Search Stats (Hidden by default) -->
                        <div id="history-stats-container" class="hidden items-center gap-6 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg border border-purple-100 dark:border-purple-800 animate-fade-in">
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Cant. Total:</span>
                                <span id="history-stats-count" class="text-lg font-bold text-gray-900 dark:text-white">0</span>
                            </div>
                            <div class="h-4 w-px bg-purple-200 dark:bg-purple-700"></div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Total Dinero:</span>
                                <span id="history-stats-money" class="text-lg font-bold text-emerald-600 dark:text-emerald-400">$0</span>
                            </div>
                        </div>
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
