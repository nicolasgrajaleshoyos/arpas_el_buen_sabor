
const Returns = {
    returns: [],
    cart: [],
    products: [],

    init() {
        this.loadReturns();
        this.setupEventListeners();
        this.loadProductOptions();
    },

    setupEventListeners() {
        setTimeout(() => {
            const searchInput = document.getElementById('returns-search');
            if (searchInput) {
                searchInput.addEventListener('input', () => this.renderTable());
            }

            const historySearchInput = document.getElementById('returns-history-search');
            if (historySearchInput) {
                historySearchInput.addEventListener('input', () => this.renderHistoryTable());
            }

            const historyProductFilter = document.getElementById('returns-history-product-filter');
            if (historyProductFilter) {
                historyProductFilter.addEventListener('change', () => this.renderHistoryTable());
            }

            const productSelect = document.getElementById('return-product');
            if (productSelect) {
                productSelect.addEventListener('change', () => {
                    const productId = parseInt(productSelect.value);
                    if (productId) {
                        const product = this.products.find(p => p.id === productId);
                        if (product) {
                            document.getElementById('return-price').value = product.price;
                            document.getElementById('return-quantity').value = 1;
                        }
                    }
                });
            }

            const addToCartBtn = document.getElementById('add-to-return-cart-btn');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', () => this.addToCart());
            }

            const processReturnBtn = document.getElementById('process-return-btn');
            if (processReturnBtn) {
                processReturnBtn.addEventListener('click', () => this.processReturns());
            }

            window.addEventListener('period-changed', (e) => {
                this.loadReturns();
            });

        }, 100);
    },

    async loadProductOptions() {
        try {
            const res = await fetch('/api/products');
            this.products = await res.json();

            const select = document.getElementById('return-product');
            const historyFilter = document.getElementById('returns-history-product-filter');

            const options = '<option value="">Selecciona un producto...</option>' +
                this.products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

            if (select) select.innerHTML = options;

            if (historyFilter) {
                historyFilter.innerHTML = '<option value="">Todos los productos</option>' +
                    this.products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    },

    addToCart() {
        const productId = parseInt(document.getElementById('return-product').value);
        const quantity = parseInt(document.getElementById('return-quantity').value);

        if (!productId || !quantity) {
            this.showAlert('error', 'Error', 'Selecciona un producto y cantidad');
            return;
        }

        const product = this.products.find(p => p.id === productId);

        if (!product) {
            this.showAlert('error', 'Error', 'Producto no encontrado');
            return;
        }

        const existingItem = this.cart.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.total = existingItem.quantity * existingItem.unitPrice;
        } else {
            this.cart.push({
                productId: product.id,
                productName: product.name,
                quantity: quantity,
                quantity: quantity,
                unitPrice: product.price,
                description: document.getElementById('return-description').value,
                total: quantity * product.price
            });
        }

        this.showAlert('success', 'Agregado', 'Producto agregado a la devolución');
        this.renderReturnCart();

        document.getElementById('return-product').value = '';
        document.getElementById('return-quantity').value = '';
        document.getElementById('return-product').value = '';
        document.getElementById('return-quantity').value = '';
        document.getElementById('return-price').value = '';
        document.getElementById('return-description').value = '';
    },

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.renderReturnCart();
        this.showAlert('info', 'Removido', 'Producto removido de la devolución');
    },

    renderReturnCart() {
        const tbody = document.getElementById('return-cart-tbody');
        const totalElement = document.getElementById('return-cart-total');
        const processBtn = document.getElementById('process-return-btn');

        if (!tbody) return;

        if (this.cart.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-8 text-gray-500 dark:text-gray-400">
                        La lista de devoluciones está vacía
                    </td>
                </tr>
            `;
            totalElement.textContent = '$0';
            if (processBtn) {
                processBtn.disabled = true;
                processBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
            return;
        }

        tbody.innerHTML = this.cart.map((item, index) => `
            <tr class="bg-red-50 dark:bg-red-900/10">
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${item.productName}</td>
                <td class="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 italic max-w-[100px] truncate" title="${item.description || ''}">${item.description || '-'}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${item.quantity}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">$${parseFloat(item.unitPrice).toLocaleString()}</td>
                <td class="px-6 py-4 font-semibold text-red-600 dark:text-red-400">
                    $${item.total.toLocaleString()}
                </td>
                <td class="px-6 py-4">
                    <button onclick="Returns.removeFromCart(${index})" class="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `).join('');

        const total = this.cart.reduce((sum, item) => sum + item.total, 0);
        totalElement.textContent = '$' + total.toLocaleString();

        if (processBtn) {
            processBtn.disabled = false;
            processBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    },

    processReturns() {
        if (this.cart.length === 0) {
            this.showAlert('error', 'Vacío', 'Agrega productos antes de procesar');
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + item.total, 0);

        this.showConfirmAlert(
            '¿Procesar Devolución?',
            `Se registrarán ${this.cart.length} productos como devueltos.<br>Total: $${total.toLocaleString()}`,
            'Sí, Procesar',
            'Cancelar'
        ).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    for (const item of this.cart) {
                        const response = await fetch('/api/sales', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                            },
                            body: JSON.stringify({
                                productId: item.productId,
                                productName: item.productName,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice,
                                total: item.total,
                                date: this.getAdjustedDate(),
                                status: 'returned',
                                total: item.total,
                                description: item.description,
                                date: this.getAdjustedDate(),
                                status: 'returned',
                                returnedAt: this.getAdjustedDate()
                            })
                        });

                        if (!response.ok) {
                            const data = await response.json();
                            throw new Error(data.message || 'Error al guardar');
                        }

                    }

                    this.showAlert('success', 'Éxito', 'Devolución procesada correctamente');
                    this.cart = [];
                    this.renderReturnCart();
                    this.loadReturns();
                } catch (error) {
                    console.error('Error processing returns:', error);
                    this.showAlert('error', 'Error', error.message || 'Hubo un error al procesar la devolución');
                }
            }
        });
    },

    async loadReturns() {
        try {
            const res = await fetch('/api/sales');
            const allSales = await res.json();

            let returns = allSales.filter(sale => sale.status === 'returned');

            if (typeof GlobalPeriod !== 'undefined') {
                returns = returns.filter(s => {
                    const date = new Date(s.returned_at || s.returnedAt || s.sale_date || s.date);
                    return GlobalPeriod.isDateInPeriod(date);
                });

                const header = document.querySelector('h1.text-3xl');
                if (header && header.textContent.includes('Devoluciones')) {
                    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                    const m = parseInt(document.getElementById('global-month').value);
                    const y = parseInt(document.getElementById('global-year').value);
                    header.innerHTML = `🛑 Devoluciones <span class="text-lg font-normal text-gray-500">(${months[m]} ${y})</span>`;
                }
            }

            this.returns = returns.sort((a, b) => new Date(b.returned_at || b.date) - new Date(a.returned_at || a.date));

            this.renderTable();
            this.renderHistoryTable();
            this.updateStats();
        } catch (error) {
            console.error('Error loading returns:', error);
        }
    },

    deleteReturn(id) {
        this.showConfirmAlert(
            '¿Eliminar Devolución?',
            'Esta acción eliminará el registro de la devolución. Esto podría afectar tus estadísticas.',
            'Sí, Eliminar',
            'Cancelar',
            'warning'
        ).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await fetch(`/api/sales/${id}`, {
                        method: 'DELETE',
                        headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }
                    });
                    this.showAlert('success', 'Eliminado', 'Registro de devolución eliminado');
                    this.loadReturns();
                } catch (error) {
                    console.error(error);
                    this.showAlert('error', 'Error', 'No se pudo eliminar el registro');
                }
            }
        });
    },

    deleteProductReturns(productName) {
        const returnsToDelete = this.returns.filter(r => r.productName === productName);

        if (returnsToDelete.length === 0) return;

        this.showConfirmAlert(
            '¿Eliminar TODAS las devoluciones?',
            `Estás a punto de eliminar <b>${returnsToDelete.length} registros</b> de devolución para el producto: <br><b>${productName}</b><br><br>Esta acción es irreversible.`,
            'Sí, Eliminar Todo',
            'Cancelar',
            'error'
        ).then(async (result) => {
            if (result.isConfirmed) {
                let deletedCount = 0;
                for (const item of returnsToDelete) {
                    await fetch(`/api/sales/${item.id}`, {
                        method: 'DELETE',
                        headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }
                    });
                    deletedCount++;
                }

                this.showAlert('success', 'Eliminado', `${deletedCount} registros eliminados correctamente.`);
                this.loadReturns();
            }
        });
    },

    updateStats() {
        const totalReturnsValue = this.returns.reduce((sum, item) => sum + parseFloat(item.total), 0);
        const totalQty = this.returns.reduce((sum, item) => sum + item.quantity, 0);
        const totalTransactions = this.returns.length;

        const valueEl = document.getElementById('returns-total-value');
        const qtyEl = document.getElementById('returns-total-qty');

        if (valueEl) valueEl.textContent = '$' + totalReturnsValue.toLocaleString();
        if (qtyEl) qtyEl.innerHTML = `${totalQty} <span class="text-sm font-normal text-gray-500">(${totalTransactions} tx)</span>`;
    },

    getAggregatedReturns() {
        const aggregated = {};
        this.returns.forEach(sale => {
            const pName = sale.product_name || sale.productName; // Handle both
            if (!aggregated[pName]) {
                aggregated[pName] = {
                    name: pName,
                    quantity: 0,
                    total: 0,
                    count: 0
                };
            }
            aggregated[pName].quantity += sale.quantity;
            aggregated[pName].total += parseFloat(sale.total);
            aggregated[pName].count += 1;
        });
        return Object.values(aggregated);
    },

    renderTable() {
        const tbody = document.getElementById('returns-tbody');
        if (!tbody) return;

        let data = this.getAggregatedReturns();
        const searchInput = document.getElementById('returns-search');
        if (searchInput && searchInput.value) {
            const term = searchInput.value.toLowerCase();
            data = data.filter(item => item.name.toLowerCase().includes(term));
        }

        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-8 text-gray-400 dark:text-gray-500">
                        No hay devoluciones registradas
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.map(item => `
            <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">${item.name}</div>
                </td>
                <td class="px-6 py-4 text-center">
                    <div class="text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 py-1 px-3 rounded-full inline-block">
                        ${item.quantity}
                    </div>
                </td>
                <td class="px-6 py-4 text-center">
                    <div class="text-sm text-gray-600 dark:text-gray-400">${item.count}</div>
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="text-sm font-bold text-gray-900 dark:text-white">$${item.total.toLocaleString()}</div>
                </td>
                <td class="px-6 py-4 text-center">
                    <button onclick="Returns.deleteProductReturns('${item.name}')" class="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Eliminar todo">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    showAlert(icon, title, text) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: icon,
                title: title,
                html: text,
                confirmButtonColor: icon === 'error' ? '#ef4444' : '#10b981',
                confirmButtonText: 'Entendido'
            });
        } else {
            console.log(title, text);
        }
    },

    showConfirmAlert(title, html, confirmText, cancelText, icon = 'question') {
        if (typeof Swal !== 'undefined') {
            return Swal.fire({
                title: title,
                html: html,
                icon: icon,
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#gray',
                confirmButtonText: confirmText,
                cancelButtonText: cancelText
            });
        } else {
            return Promise.resolve({ isConfirmed: confirm(title) });
        }
    },

    render() {
        const totalReturnsValue = 0;
        const totalQty = 0;
        const totalTransactions = 0;
        return `
            <div class="space-y-6 animate-fade-in">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">🛑 Devoluciones</h1>
                        <p class="text-gray-600 dark:text-gray-400 mt-1">Gestión y reporte de productos devueltos (Mermas)</p>
                    </div>
                </div>

                <!-- Stats Cards -->
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl px-6 py-4 shadow-lg">
                        <div class="text-sm font-medium opacity-90">Total Valor Devoluciones</div>
                        <div id="returns-total-value" class="text-3xl font-bold mt-1">$${totalReturnsValue.toLocaleString()}</div>
                    </div>
                     <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-6 py-4 shadow-sm">
                        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Productos Devueltos</div>
                        <div id="returns-total-qty" class="text-3xl font-bold mt-1 text-gray-900 dark:text-white">${totalQty} <span class="text-sm font-normal text-gray-500">(${totalTransactions} tx)</span></div>
                    </div>
                </div>

                <!-- NEW: Return Entry Form & Cart -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Product Selection -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-100 dark:border-gray-700 transition-colors">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                            </div>
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Registrar Devolución (Merma)</h2>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Producto a Devolver</label>
                                <select id="return-product" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                    <option value="">Selecciona un producto...</option>
                                    <!-- Options loaded by JS -->
                                </select>
                            </div>
                            
                            <div class="grid grid-cols-12 gap-4">
                                <div class="col-span-3">
                                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Cantidad</label>
                                    <input type="number" id="return-quantity" min="1" placeholder="0" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                </div>
                                
                                <div class="col-span-3">
                                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Precio</label>
                                    <input type="number" id="return-price" readonly class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                </div>
                                
                                <div class="col-span-6">
                                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción (Opcional)</label>
                                    <input type="text" id="return-description" placeholder="Motivo..." class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                </div>
                            </div>
                            
                            <button id="add-to-return-cart-btn" class="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Agregar a Devolución
                            </button>
                        </div>
                    </div>
                    
                    <!-- Return Cart -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-100 dark:border-gray-700 transition-colors">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Lista de Devolución</h2>
                        </div>
                        
                        <div class="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <table class="w-full">
                                <thead class="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">Producto</th>
                                        <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">Desc.</th>
                                        <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">Cant.</th>
                                        <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">Precio</th>
                                        <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">Total</th>
                                        <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody id="return-cart-tbody">
                                    <!-- Cart Items -->
                                    <tr>
                                        <td colspan="6" class="text-center py-8 text-gray-500">
                                            La lista de devoluciones está vacía
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="text-lg font-semibold text-gray-900 dark:text-white">Total Devolución:</span>
                                <span id="return-cart-total" class="text-3xl font-bold text-red-600 dark:text-red-400">$0</span>
                            </div>
                            
                            <button id="process-return-btn" disabled class="w-full px-4 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg opacity-50 cursor-not-allowed disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                                Procesar Devolución
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Aggregated Returns Table Section -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-100 dark:border-gray-700 transition-colors">
                    <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Detalle por Producto (Resumen)
                        </h2>

                        <!-- Search -->
                        <div class="relative w-full md:w-64">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </span>
                            <input type="text" id="returns-search" placeholder="Buscar producto..."
                                class="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none w-full shadow-sm">
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-4 uppercase tracking-wider">Producto</th>
                                    <th class="text-center text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-4 uppercase tracking-wider">Cant. Devuelta</th>
                                    <th class="text-center text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-4 uppercase tracking-wider"># Transacciones</th>
                                    <th class="text-right text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-4 uppercase tracking-wider">Valor Total</th>
                                    <th class="text-center text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-4 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="returns-tbody" class="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                <!-- Data populated by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Detailed History Table Section -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-100 dark:border-gray-700 transition-colors mt-6">
                    <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Historial de Transacciones (Detallado)
                        </h2>

                        <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            <!-- Product Filter -->
                            <div class="relative w-full md:w-48">
                                <select id="returns-history-product-filter" class="w-full pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none shadow-sm appearance-none">
                                    <option value="">Todos los productos</option>
                                    <!-- Populated by JS -->
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>

                            <!-- History Search -->
                            <div class="relative w-full md:w-64">
                                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </span>
                                <input type="text" id="returns-history-search" placeholder="Buscar descripción..."
                                    class="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none w-full shadow-sm">
                            </div>
                        </div>

                        <!-- Search Stats (Hidden by default) -->
                        <div id="returns-history-stats-container" class="hidden items-center gap-6 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg border border-red-100 dark:border-red-800 animate-fade-in mt-3 md:mt-0">
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Cant. Total:</span>
                                <span id="returns-history-stats-count" class="text-lg font-bold text-gray-900 dark:text-white">0</span>
                            </div>
                            <div class="h-4 w-px bg-red-200 dark:bg-red-700"></div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Total Dinero:</span>
                                <span id="returns-history-stats-money" class="text-lg font-bold text-gray-900 dark:text-white">$0</span>
                            </div>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-4 uppercase tracking-wider">Fecha</th>
                                    <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-4 uppercase tracking-wider">Producto</th>
                                    <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-4 uppercase tracking-wider">Descripción</th>
                                    <th class="text-center text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-4 uppercase tracking-wider">Cant.</th>
                                    <th class="text-right text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-4 uppercase tracking-wider">Total</th>
                                    <th class="text-center text-xs font-semibold text-gray-600 dark:text-gray-300 px-6 py-4 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="returns-history-tbody" class="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                <!-- Data populated by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    getAdjustedDate() {
        let date = new Date();
        const yearSelect = document.getElementById('global-year');
        const monthSelect = document.getElementById('global-month');
        if (monthSelect && yearSelect) {
            const selectedMonth = parseInt(monthSelect.value);
            const selectedYear = parseInt(yearSelect.value);
            if (date.getMonth() !== selectedMonth || date.getFullYear() !== selectedYear) {
                date.setFullYear(selectedYear);
                date.setMonth(selectedMonth);
            }
        }
        return date.toISOString();
    },

    renderHistoryTable() {
        const tbody = document.getElementById('returns-history-tbody');
        if (!tbody) return;

        const searchInput = document.getElementById('returns-history-search');
        const productFilter = document.getElementById('returns-history-product-filter');

        let filteredReturns = this.returns || [];

        // Get filter values
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedProductId = productFilter ? productFilter.value : '';

        // Apply filters
        if (searchTerm || selectedProductId) {
            filteredReturns = filteredReturns.filter(txn => {
                // 1. Text Search (Product Name OR Description)
                const productName = (txn.product_name || txn.productName || '').toLowerCase();
                const description = (txn.description || '').toLowerCase();

                const matchesSearch = !searchTerm ||
                    description.includes(searchTerm);

                // 2. Product Dropdown (Specific Product ID)
                // We compare loose equality (==) because DOM values are strings, IDs might be ints
                const matchesProduct = !selectedProductId ||
                    (txn.product_id == selectedProductId) ||
                    (txn.productId == selectedProductId);

                return matchesSearch && matchesProduct;
            });
        }

        // Update Stats
        const totalQtyEl = document.getElementById('returns-history-stats-count');
        const totalMoneyEl = document.getElementById('returns-history-stats-money');
        const statsContainer = document.getElementById('returns-history-stats-container');

        if (totalQtyEl && totalMoneyEl && statsContainer) {
            if (searchTerm || selectedProductId) {
                const totalQty = filteredReturns.reduce((sum, txn) => sum + (parseFloat(txn.quantity) || 0), 0);
                const totalMoney = filteredReturns.reduce((sum, txn) => sum + (parseFloat(txn.total) || 0), 0);

                totalQtyEl.textContent = totalQty;
                totalMoneyEl.textContent = `$${totalMoney.toLocaleString()} `;
                statsContainer.classList.remove('hidden');
                statsContainer.classList.add('flex');
            } else {
                statsContainer.classList.add('hidden');
                statsContainer.classList.remove('flex');
            }
        }

        // Render Table Rows
        if (filteredReturns.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-8 text-gray-500">
                        No se encontraron transacciones coinciden con los filtros.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredReturns.map(txn => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div>${this.formatDate(txn.created_at || txn.date)}</div>
                    <div class="text-xs text-gray-400">${this.formatTime(txn.created_at || txn.date)}</div>
                </td>
                 <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm font-medium text-gray-900 dark:text-white">${txn.product_name || txn.productName}</span>
                </td>
                 <td class="px-6 py-4">
                    <span class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs block" title="${txn.description || '-'}">
                        ${txn.description || '-'}
                    </span>
                 </td>
                 <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        ${txn.quantity}
                    </span>
                </td>
                 <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                    $${parseFloat(txn.total).toLocaleString()}
                </td>
                 <td class="px-6 py-4 whitespace-nowrap text-center">
                     <button class="text-red-600 hover:text-red-900 dark:hover:text-red-400 transition-colors bg-red-50 dark:bg-red-900/20 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                     </button>
                 </td>
            </tr>
        `).join('');
    },

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(date);
    },

    formatTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: 'numeric', hour12: true }).format(date);
    }
};
