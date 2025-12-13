
// Sales Module
const Sales = {
    cart: [],
    currentSales: [],

    init() {
        console.log('Inicializando Ventas (API)...');
        this.loadSales();
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Product selector
        const productSelect = document.getElementById('sale-product');
        if (productSelect) {
            this.loadProductOptions();

            productSelect.addEventListener('change', async () => {
                const productId = parseInt(productSelect.value);
                if (productId) {
                    try {
                        const res = await fetch('/api/products');
                        const products = await res.json();
                        const product = products.find(p => p.id === productId);

                        if (product) {
                            document.getElementById('sale-price').value = product.price;
                            document.getElementById('sale-quantity').value = 1;
                            document.getElementById('sale-quantity').max = product.stock;
                            this.currentProduct = product;
                        }
                    } catch (e) { console.error(e); }
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

        // Global Period Filter Listener
        window.addEventListener('period-changed', (e) => {
            this.loadSales();
        });
    },

    async loadProductOptions() {
        const select = document.getElementById('sale-product');
        if (!select) return;

        try {
            const res = await fetch('/api/products');
            const products = await res.json();
            const available = products.filter(p => p.stock > 0);

            select.innerHTML = '<option value="">Selecciona un producto...</option>' +
                available.map(p => `<option value="${p.id}">${p.name} (Stock: ${p.stock})</option>`).join('');

        } catch (error) {
            console.error('Error loading products:', error);
            Toast.error('Error cargando productos');
        }
    },

    addToCart() {
        const productId = parseInt(document.getElementById('sale-product').value);
        const quantity = parseInt(document.getElementById('sale-quantity').value);

        if (!productId || !quantity) {
            Toast.error('Selecciona un producto y cantidad');
            return;
        }

        const product = this.currentProduct;

        if (!product || product.id !== productId) {
            Toast.error('Error de validación del producto');
            return;
        }

        if (quantity > product.stock) {
            Toast.error(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles`);
            return;
        }

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
                unitPrice: parseFloat(product.price),
                description: document.getElementById('sale-description').value,
                total: quantity * parseFloat(product.price)
            });
        }

        Toast.success('Producto agregado al carrito');
        this.renderCart();

        document.getElementById('sale-product').value = '';
        document.getElementById('sale-quantity').value = '';
        document.getElementById('sale-quantity').value = '';
        document.getElementById('sale-price').value = '';
        document.getElementById('sale-description').value = '';
        this.currentProduct = null;
    },

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.renderCart();
        Toast.info('Producto removido del carrito');
    },

    renderCart() {
        const tbody = document.getElementById('cart-tbody');
        const totalElement = document.getElementById('cart-total');
        let completeSaleBtn = document.getElementById('complete-sale-btn');

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

        // Add Payment Method Inputs
        const paymentContainer = document.getElementById('payment-method-container');
        if (!paymentContainer && tbody.parentElement.parentElement) {
            const container = document.createElement('div');
            container.id = 'payment-method-container';
            container.className = 'mt-4 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3';
            container.innerHTML = `
                <div class="flex flex-col gap-3">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Método de Pago (Total: $${total.toLocaleString()})</label>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Efectivo</label>
                            <input type="number" id="payment-cash" value="${total}" min="0" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white">
                        </div>
                        <div>
                            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Transferencia</label>
                            <input type="number" id="payment-transfer" value="0" min="0" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white">
                        </div>
                    </div>
                </div>
             `;
            // Insert before the button container
            completeSaleBtn.parentElement.insertBefore(container, completeSaleBtn);
        } else if (paymentContainer) {
            // Update values if already exists (smart update)
            const cashInput = document.getElementById('payment-cash');
            const transferInput = document.getElementById('payment-transfer');
            if (cashInput && transferInput) {
                // Reset to default specific logic: if total changed, reset to full cash?
                // Or keep ratio? For simplicity, we can verify if they sum up. If not, reset to full cash.
                // Let's just update the label total hint.
                const label = paymentContainer.querySelector('label');
                if (label) label.textContent = `Método de Pago (Total: $${total.toLocaleString()})`;

                // Simple logic: if new total != old total, reset default.
                const currentSum = parseFloat(cashInput.value || 0) + parseFloat(transferInput.value || 0);
                if (currentSum !== total) {
                    cashInput.value = total;
                    transferInput.value = 0;
                }
            }
        }

        completeSaleBtn.disabled = false;
        completeSaleBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        completeSaleBtn.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Completar Venta
        `;
        completeSaleBtn.className = `w-full px-4 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-4`;
    },

    completeSale() {
        if (this.cart.length === 0) {
            this.showAlert('error', 'Carrito Vacío', 'Agrega productos al carrito antes de completar la venta');
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + item.total, 0);

        const cashInput = document.getElementById('payment-cash');
        const transferInput = document.getElementById('payment-transfer');

        const cashAmount = parseFloat(cashInput ? cashInput.value : total) || 0;
        const transferAmount = parseFloat(transferInput ? transferInput.value : 0) || 0;

        if (Math.abs((cashAmount + transferAmount) - total) > 0.01) {
            this.showAlert('error', 'Montos Incorrectos', `La suma de efectivo y transferencia ($${(cashAmount + transferAmount).toLocaleString()}) debe ser igual al total ($${total.toLocaleString()})`);
            return;
        }

        let method = 'cash';
        if (transferAmount > 0 && cashAmount === 0) method = 'transfer';
        else if (transferAmount > 0 && cashAmount > 0) method = 'combined';

        this.showConfirmAlert(
            '¿Confirmar Venta?',
            `Total: $${total.toLocaleString()}<br>Efectivo: $${cashAmount.toLocaleString()}<br>Transferencia: $${transferAmount.toLocaleString()}`,
            'Sí, Completar Venta',
            'Cancelar'
        ).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Use a single timestamp for all items in this transaction to allow grouping
                    const saleDate = document.getElementById('sale-date')?.value || this.getAdjustedDate();

                    for (const item of this.cart) {
                        await fetch('/api/sales', {
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
                                description: item.description,
                                // Calculate proportional split
                                cashAmount: (item.total / total) * cashAmount,
                                transferAmount: (item.total / total) * transferAmount,
                                paymentMethod: method,
                                date: saleDate,
                                status: 'completed'
                            })
                        });
                    }

                    this.showAlert('success', '¡Venta Exitosa!', `Total: $${total.toLocaleString()}`);

                    this.cart = [];
                    this.renderCart();
                    this.loadSales();
                    this.loadProductOptions();

                } catch (error) {
                    console.error('Error completing sale:', error);
                    this.showAlert('error', 'Error', 'Hubo un problema procesando la venta');
                }
            }
        });
    },

    returnSale(saleIds) {
        // Support both single ID and array of IDs
        const ids = Array.isArray(saleIds) ? saleIds : [saleIds];
        const sales = this.currentSales.filter(s => ids.includes(s.id));

        if (sales.length === 0) return;

        // Check if any is already returned
        if (sales.some(s => s.status === 'returned')) {
            this.showAlert('info', 'Ya devuelto', 'Uno o más productos ya han sido marcados como devueltos.');
            return;
        }

        // Build HTML for inputs
        const inputsHtml = sales.map(s => `
            <div class="mb-4 text-left p-3 border rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
                <label class="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    ${s.product_name || s.productName}
                </label>
                <div class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span>Vendido: ${s.quantity}</span>
                    <span>$${parseFloat(s.unit_price).toLocaleString()} c/u</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Devolver:</span>
                    <input type="number" id="return-qty-${s.id}" 
                        class="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        min="0" max="${s.quantity}" value="0" placeholder="0">
                </div>
            </div>
        `).join('');

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Devolución de Productos',
                html: `
                    <div class="max-h-[60vh] overflow-y-auto px-1">
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 text-left">Ingrese la cantidad a devolver para cada producto:</p>
                        ${inputsHtml}
                    </div>
                `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#ef4444',
                confirmButtonText: 'Confirmar Devolución',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    const returns = [];
                    for (const s of sales) {
                        const input = Swal.getPopup().querySelector(`#return-qty-${s.id}`);
                        const qty = parseInt(input.value) || 0;
                        if (qty > 0) {
                            if (qty > s.quantity) {
                                Swal.showValidationMessage(`La cantidad para ${s.product_name || s.productName} excede lo vendido`);
                                return false;
                            }
                            returns.push({ id: s.id, qty });
                        }
                    }

                    if (returns.length === 0) {
                        Swal.showValidationMessage('Debe ingresar al menos una cantidad mayor a 0');
                        return false;
                    }
                    return returns;
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const itemsToReturn = result.value;

                        for (const item of itemsToReturn) {
                            const res = await fetch(`/api/sales/${item.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                                },
                                body: JSON.stringify({
                                    status: 'returned',
                                    returned_at: this.getAdjustedDate(),
                                    return_quantity: item.qty
                                })
                            });

                            if (!res.ok) throw new Error('Failed to return item');
                        }

                        this.showAlert('success', 'Devolución Exitosa', 'Inventario actualizado correctamente');
                        this.loadSales();
                    } catch (error) {
                        console.error('Error returning sale:', error);
                        this.showAlert('error', 'Error', 'No se pudo procesar la devolución');
                    }
                }
            });
        } else {
            // Fallback if Swal not loaded (unlikely)
            if (confirm("¿Desea devolver toda la transacción? (Versión simple sin Swal)")) {
                // Fallback implementation logic...
            }
        }
    },

    deleteSale(saleIds) {
        // Support both single ID and array of IDs
        const ids = Array.isArray(saleIds) ? saleIds : [saleIds];
        const sales = this.currentSales.filter(s => ids.includes(s.id));

        if (sales.length === 0) return;

        const productNames = sales.map(s => s.product_name || s.productName).join(', ');

        this.showConfirmAlert(
            '¿Eliminar Venta?',
            `Esta acción es irreversible.<br>Se eliminarán ${ids.length} registro(s).<br>Productos: ${productNames}`,
            'Sí, Eliminar Todo',
            'Cancelar',
            'error'
        ).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    for (const id of ids) {
                        await fetch(`/api/sales/${id}`, {
                            method: 'DELETE',
                            headers: {
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                            }
                        });
                    }

                    this.showAlert('success', 'Venta Eliminada', 'La transacción ha sido eliminada');
                    this.loadSales();

                } catch (error) {
                    console.error('Error deleting sale:', error);
                    this.showAlert('error', 'Error', 'No se pudo eliminar la venta completa');
                }
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
            return Promise.resolve({ isConfirmed: confirm(title) });
        }
    },

    showPaymentDetails(saleIdOrIds) {
        let sales = [];
        if (Array.isArray(saleIdOrIds)) {
            sales = this.currentSales.filter(s => saleIdOrIds.includes(s.id));
        } else {
            const sale = this.currentSales.find(s => s.id === saleIdOrIds);
            if (sale) sales = [sale];
        }

        if (sales.length === 0) return;

        const cash = sales.reduce((sum, s) => sum + parseFloat(s.cash_amount || 0), 0);
        const transfer = sales.reduce((sum, s) => sum + parseFloat(s.transfer_amount || 0), 0);
        const total = cash + transfer;

        const productsHtml = sales.map(s => `
            <div class="flex justify-between text-sm">
                <span class="text-gray-700 dark:text-gray-300">
                    ${s.product_name || s.productName} 
                    <span class="text-xs text-gray-500">x${s.quantity}</span>
                </span>
                <span class="font-medium text-gray-900 dark:text-white">$${parseFloat(s.total).toLocaleString()}</span>
            </div>
        `).join('');

        this.showAlert('info', 'Detalle de Pago (Transacción)', `
            <div class="space-y-3 text-left">
                <div class="border-b pb-2 mb-2 space-y-1">
                    <div class="text-xs font-semibold text-gray-500 uppercase">Productos</div>
                    ${productsHtml}
                </div>
                <div class="flex justify-between border-b pb-2">
                    <span class="text-gray-600">Efectivo:</span>
                    <span class="font-bold text-gray-900 dark:text-white">$${cash.toLocaleString()}</span>
                </div>
                <div class="flex justify-between border-b pb-2">
                    <span class="text-gray-600">Transferencia:</span>
                    <span class="font-bold text-gray-900 dark:text-white">$${transfer.toLocaleString()}</span>
                </div>
                <div class="flex justify-between pt-1">
                    <span class="text-gray-900 font-semibold">Total:</span>
                    <span class="font-bold text-emerald-600">$${total.toLocaleString()}</span>
                </div>
            </div>
        `);
    },

    async loadSales() {
        try {
            const res = await fetch('/api/sales');
            let allSales = await res.json();

            allSales = allSales.filter(s => s.status !== 'returned');

            // Apply Global Period Filter
            if (typeof GlobalPeriod !== 'undefined') {
                allSales = allSales.filter(s => GlobalPeriod.isDateInPeriod(s.sale_date || s.date));
            }

            this.currentSales = allSales.sort((a, b) => new Date(b.sale_date || b.date) - new Date(a.sale_date || a.date));
            this.renderSalesTable();
            this.updateHeaderStats();
        } catch (error) {
            console.error('Error loading sales:', error);
        }
    },

    updateHeaderStats() {
        const countEl = document.getElementById('header-stats-count');
        const totalEl = document.getElementById('header-stats-total');

        if (!countEl || !totalEl) return;

        const validSales = (this.currentSales || []).filter(s => s.status !== 'returned');

        // Count unique transactions based on date/grouping
        const uniqueTransactions = new Set(validSales.map(s => s.sale_date || s.date));
        const count = uniqueTransactions.size;

        const total = validSales.reduce((sum, s) => sum + parseFloat(s.total), 0);
        const totalCash = validSales.reduce((sum, s) => sum + parseFloat(s.cash_amount || (s.payment_method !== 'transfer' ? s.total : 0)), 0);
        const totalTransfer = validSales.reduce((sum, s) => sum + parseFloat(s.transfer_amount || (s.payment_method === 'transfer' ? s.total : 0)), 0);

        countEl.textContent = count;
        totalEl.textContent = '$' + total.toLocaleString();

        const cashEl = document.getElementById('header-stats-cash');
        const transferEl = document.getElementById('header-stats-transfer');
        if (cashEl) cashEl.textContent = '$' + totalCash.toLocaleString();
        if (transferEl) transferEl.textContent = '$' + totalTransfer.toLocaleString();

        if (typeof GlobalPeriod !== 'undefined') {
            const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            const m = parseInt(document.getElementById('global-month').value);
            const y = parseInt(document.getElementById('global-year').value);
            const label = `${months[m]} ${y}`;

            const countLabel = countEl.previousElementSibling;
            if (countLabel) countLabel.textContent = `Ventas (${label})`;

            const totalLabel = totalEl.previousElementSibling;
            if (totalLabel) totalLabel.textContent = `Total (${label})`;
        }
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

        let filteredSales = this.currentSales;
        const searchInput = document.getElementById('history-search');

        if (searchInput && searchInput.value) {
            const term = searchInput.value.toLowerCase();
            filteredSales = filteredSales.filter(s =>
                (s.product_name || s.productName).toLowerCase().includes(term) ||
                (s.description || '').toLowerCase().includes(term)
            );
        }

        const isFiltering = (searchInput && searchInput.value);
        const displaySales = isFiltering ? filteredSales.slice(0, 100) : filteredSales.slice(0, 30);

        const statsContainer = document.getElementById('history-stats-container');
        const countEl = document.getElementById('history-stats-count');
        const moneyEl = document.getElementById('history-stats-money');

        if (statsContainer && countEl && moneyEl) {
            if (isFiltering) {
                // Group transactions by date for correct counting
                const uniqueTransactions = new Set(filteredSales.map(s => s.sale_date || s.date));
                const totalCount = uniqueTransactions.size;
                const totalMoney = filteredSales.reduce((sum, s) => sum + parseFloat(s.total), 0);

                // Calculate split stats based on unique transactions
                // Note: Payments are per item, so amounts are correct, but counts need grouping
                const cashTransactions = new Set(
                    filteredSales
                        .filter(s => parseFloat(s.cash_amount || (s.payment_method !== 'transfer' ? s.total : 0)) > 0)
                        .map(s => s.sale_date || s.date)
                );

                const transferTransactions = new Set(
                    filteredSales
                        .filter(s => parseFloat(s.transfer_amount || (s.payment_method === 'transfer' ? s.total : 0)) > 0)
                        .map(s => s.sale_date || s.date)
                );

                // Amounts (sum of all items)
                const cashAmount = filteredSales.reduce((sum, s) => sum + parseFloat(s.cash_amount || (s.payment_method !== 'transfer' ? s.total : 0)), 0);
                const transferAmount = filteredSales.reduce((sum, s) => sum + parseFloat(s.transfer_amount || (s.payment_method === 'transfer' ? s.total : 0)), 0);

                countEl.textContent = totalCount;
                moneyEl.textContent = '$' + totalMoney.toLocaleString();

                const cashEl = document.getElementById('history-stats-cash');
                const cashCountEl = document.getElementById('history-stats-cash-count');
                const transferEl = document.getElementById('history-stats-transfer');
                const transferCountEl = document.getElementById('history-stats-transfer-count');

                if (cashEl) cashEl.textContent = '$' + cashAmount.toLocaleString();
                if (cashCountEl) cashCountEl.textContent = cashTransactions.size;
                if (transferEl) transferEl.textContent = '$' + transferAmount.toLocaleString();
                if (transferCountEl) transferCountEl.textContent = transferTransactions.size;

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

        // Group sales by identical timestamp (sale_date)
        const groupedSales = {};
        displaySales.forEach(sale => {
            const dateKey = sale.sale_date || sale.date;
            if (!groupedSales[dateKey]) {
                groupedSales[dateKey] = {
                    date: dateKey,
                    items: [],
                    total: 0,
                    quantity: 0,
                    payment_method: sale.payment_method, // Assume same for transaction
                    ids: []
                };
            }
            groupedSales[dateKey].items.push(sale);
            groupedSales[dateKey].total += parseFloat(sale.total);
            groupedSales[dateKey].quantity += parseInt(sale.quantity);
            groupedSales[dateKey].ids.push(sale.id);
        });

        // Convert groups object to array and sort descending by date
        const sortedGroups = Object.values(groupedSales).sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedGroups.map(group => {
            const date = new Date(group.date);
            const formattedDate = date.toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'short'
            });
            const formattedTime = date.toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            // Build product list summary
            const productSummary = group.items.map(item =>
                `<div>• ${item.product_name || item.productName} <span class="text-xs text-gray-400">x${item.quantity}</span></div>`
            ).join('');

            // Combine descriptions
            const uniqueDescriptions = [...new Set(group.items.map(i => i.description).filter(d => d))];
            const descriptionHtml = uniqueDescriptions.length > 0
                ? uniqueDescriptions.join('; ')
                : '-';

            const rowClass = 'border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors';
            const idsString = JSON.stringify(group.ids).replace(/"/g, '&quot;'); // Escape for attribute

            return `
                <tr class="${rowClass}">
                <td class="px-4 py-3 align-top">
                    <div class="text-xs text-gray-900 dark:text-white font-medium">${formattedDate}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">${formattedTime}</div>
                </td>
                <td class="px-4 py-3 align-top">
                     <div class="text-sm text-gray-900 dark:text-white space-y-0.5">${productSummary}</div>
                </td>
                <td class="px-4 py-3 align-top">
                    <div class="text-xs text-gray-500 dark:text-gray-400 italic truncate max-w-[150px]" title="${descriptionHtml}">${descriptionHtml}</div>
                </td>
                <td class="px-4 py-3 align-top">
                    <div class="flex flex-col">
                        <span class="text-xs font-medium px-2 py-0.5 rounded-full w-fit ${group.payment_method === 'cash' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    group.payment_method === 'transfer' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                }">
                            ${group.payment_method === 'cash' ? 'Efectivo' : (group.payment_method === 'transfer' ? 'Transf.' : 'Mixto')}
                        </span>
                        ${group.payment_method === 'combined' ? `
                             <span class="text-[10px] text-blue-500 hover:text-blue-700 cursor-pointer underline mt-0.5" onclick="Sales.showPaymentDetails(${idsString})">Ver detalle</span>
                        ` : ''}
                    </div>
                </td>
                <td class="px-4 py-3 text-center align-top">
                    <span class="text-sm font-medium text-blue-600 dark:text-blue-400">${group.quantity}</span>
                </td>
                <td class="px-4 py-3 text-right align-top">
                    <div class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">$${group.total.toLocaleString()}</div>
                </td>
                <td class="px-4 py-3 text-center align-top flex justify-center gap-2">
                    <button onclick="Sales.returnSale(${idsString})" class="p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors" title="Devolver Transacción">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                        </svg>
                    </button>
                    <button onclick="Sales.deleteSale(${idsString})" class="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Eliminar Transacción">
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
        const allSales = this.currentSales || [];
        let periodLabel = "del Periodo";
        if (typeof GlobalPeriod !== 'undefined') {
            const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            const m = parseInt(document.getElementById('global-month').value);
            const y = parseInt(document.getElementById('global-year').value);
            periodLabel = `${months[m]} ${y}`;
        }
        const validSales = allSales.filter(s => s.status !== 'returned');
        const periodCount = validSales.length;
        const periodTotal = validSales.reduce((sum, s) => sum + parseFloat(s.total), 0);

        return `
            <div class="space-y-6 animate-fade-in">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">💰 Punto de Venta</h1>
                        <p class="text-gray-600 dark:text-gray-400 mt-1">Registra ventas y gestiona el inventario automáticamente</p>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                        <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl px-4 py-3 shadow-lg">
                            <div class="text-xs font-medium opacity-90">Ventas (${periodLabel})</div>
                            <div id="header-stats-count" class="text-xl font-bold">${periodCount}</div>
                        </div>
                        <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl px-4 py-3 shadow-lg">
                            <div class="text-xs font-medium opacity-90">Total (${periodLabel})</div>
                            <div id="header-stats-total" class="text-xl font-bold">$${periodTotal.toLocaleString()}</div>
                        </div>
                        <div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl px-4 py-3 shadow-sm">
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400">Efectivo</div>
                            <div id="header-stats-cash" class="text-xl font-bold">$0</div>
                        </div>
                        <div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl px-4 py-3 shadow-sm">
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400">Transf.</div>
                            <div id="header-stats-transfer" class="text-xl font-bold">$0</div>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Venta</label>
                                <input type="datetime-local" id="sale-date" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción (Opcional)</label>
                                <textarea id="sale-description" rows="2" placeholder="Notas adicionales..." class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
                            </div>
                            
                            <button id="add-to-cart-btn" class="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Agregar al Carrito
                            </button>
                        </div>
                    </div>
                    
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
                        
                    <div id="history-stats-container" class="hidden flex-wrap items-center gap-6 bg-purple-50 dark:bg-purple-900/20 px-4 py-3 rounded-lg border border-purple-100 dark:border-purple-800 animate-fade-in">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Total:</span>
                            <span id="history-stats-money" class="text-lg font-bold text-emerald-600 dark:text-emerald-400">$0</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">(<span id="history-stats-count">0</span> tx)</span>
                        </div>
                        <div class="h-4 w-px bg-purple-200 dark:bg-purple-700 hidden md:block"></div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Efectivo:</span>
                            <span id="history-stats-cash" class="text-lg font-bold text-gray-900 dark:text-white">$0</span>
                             <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">(<span id="history-stats-cash-count">0</span> tx)</span>
                        </div>
                        <div class="h-4 w-px bg-purple-200 dark:bg-purple-700 hidden md:block"></div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Transf:</span>
                            <span id="history-stats-transfer" class="text-lg font-bold text-gray-900 dark:text-white">$0</span>
                             <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">(<span id="history-stats-transfer-count">0</span> tx)</span>
                        </div>
                    </div>

                    <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table class="w-full">
                            <thead class="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">Fecha</th>
                                    <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">Producto</th>
                                    <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">Descripción</th>
                                    <th class="text-left text-xs font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">Pago</th>
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
    },
    getAdjustedDate() {
        let date = new Date();
        const monthSelect = document.getElementById('global-month');
        const yearSelect = document.getElementById('global-year');
        if (monthSelect && yearSelect) {
            const selectedMonth = parseInt(monthSelect.value);
            const selectedYear = parseInt(yearSelect.value);
            if (date.getMonth() !== selectedMonth || date.getFullYear() !== selectedYear) {
                date.setFullYear(selectedYear);
                date.setMonth(selectedMonth);
            }
        }
        return date.toISOString();
    }
};
