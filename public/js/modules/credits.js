const Credits = {
    // State
    products: [],
    cart: [],
    credits: [],
    currentStats: {
        totalPending: 0,
        totalPaid: 0
    },

    // Initialize
    init() {
        this.loadProducts();
        this.loadCredits();
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Search filters
        document.getElementById('credit-search')?.addEventListener('input', (e) => {
            this.renderCreditsTable(e.target.value);
        });

        // Add to cart
        document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
            this.addToCart();
        });

        // Create Credit
        document.getElementById('create-credit-btn')?.addEventListener('click', () => {
            this.createCredit();
        });
    },

    // Loads
    async loadProducts() {
        try {
            const res = await fetch('/api/products');
            this.products = await res.json();
            this.renderProductOptions();
        } catch (error) {
            console.error('Error loading products:', error);
        }
    },

    async loadCredits() {
        try {
            const res = await fetch('/api/credits');
            this.credits = await res.json();
            this.renderCreditsTable();
            this.updateGlobalStats();
        } catch (error) {
            console.error('Error loading credits:', error);
        }
    },

    // Renders
    renderProductOptions() {
        const select = document.getElementById('credit-product');
        if (!select) return;

        select.innerHTML = '<option value="">Selecciona un producto...</option>' +
            this.products.map(p => `
                <option value="${p.id}" data-price="${p.price}" data-stock="${p.stock}">
                    ${p.name} - $${parseFloat(p.price).toLocaleString()} (Stock: ${p.stock})
                </option>
            `).join('');

        // Auto-update price on selection
        select.addEventListener('change', (e) => {
            const option = e.target.selectedOptions[0];
            const priceInput = document.getElementById('credit-price');
            if (priceInput && option) {
                priceInput.value = option.dataset.price || '';
            }
        });
    },

    render() {
        return `
            <div class="space-y-6 animate-fade-in">
                <!-- Header -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">💳 Gestión de Créditos</h1>
                        <p class="text-gray-600 dark:text-gray-400 mt-1">Administra ventas a crédito y abonos</p>
                    </div>
                </div>

                <!-- Global Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div class="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total Deuda Global</div>
                        <div id="global-stat-total" class="text-2xl font-bold text-gray-900 dark:text-white mt-1">$0</div>
                    </div>
                    <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
                        <div class="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Saldo Pendiente</div>
                        <div id="global-stat-pending" class="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">$0</div>
                    </div>
                    <div class="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                        <div class="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Recaudado</div>
                        <div id="global-stat-paid" class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">$0</div>
                    </div>
                     <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                        <div class="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Créditos Activos</div>
                        <div id="global-stat-count" class="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</div>
                    </div>
                </div>

                <!-- Create Credit Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Form -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-100 dark:border-gray-700">
                        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                             <span class="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                             </span>
                            Nuevo Crédito
                        </h2>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cliente / Empresa</label>
                                <input type="text" id="client-name" placeholder="Nombre del deudor..." class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            </div>

                            <div class="h-px bg-gray-100 dark:bg-gray-700 my-4"></div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Producto</label>
                                <select id="credit-product" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                    <option>Cargando...</option>
                                </select>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cantidad</label>
                                    <input type="number" id="credit-quantity" min="1" value="1" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Precio</label>
                                    <input type="number" id="credit-price" readonly class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 cursor-not-allowed">
                                </div>
                            </div>

                            <button id="add-to-cart-btn" class="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors flex justify-center items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                                Agregar al Pedido
                            </button>
                        </div>
                    </div>

                    <!-- Cart -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Resumen del Crédito</h2>
                        
                        <div class="flex-1 overflow-y-auto min-h-[200px] mb-4 border border-gray-100 dark:border-gray-700 rounded-lg">
                            <table class="w-full text-sm text-left">
                                <thead class="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                    <tr>
                                        <th class="px-4 py-2">Producto</th>
                                        <th class="px-4 py-2">Cant.</th>
                                        <th class="px-4 py-2 text-right">Total</th>
                                        <th class="px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody id="credit-cart-tbody">
                                    <!-- Cart Items -->
                                    <tr><td colspan="4" class="text-center py-8 text-gray-400">Sin items agregados</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="border-t border-gray-100 dark:border-gray-700 pt-4">
                            <div class="flex justify-between items-center mb-4">
                                <span class="text-lg font-semibold text-gray-900 dark:text-white">Total a Deber:</span>
                                <span id="cart-total" class="text-2xl font-bold text-red-600 dark:text-red-400">$0</span>
                            </div>
                            <button id="create-credit-btn" disabled class="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                Registrar Crédito
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Credits List -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 class="text-lg font-bold text-gray-900 dark:text-white">Historial de Deudores</h2>
                        <div class="relative w-full md:w-64">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </span>
                            <input type="text" id="credit-search" placeholder="Buscar cliente o producto..." class="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>

                    <!-- Stats Bar (Hidden by default, shown on filter) -->
                    <div id="filter-stats" class="hidden bg-blue-50 dark:bg-blue-900/20 px-6 py-3 border-b border-blue-100 dark:border-blue-800 flex flex-wrap gap-6 text-sm">
                        <div class="flex items-center gap-2">
                            <span class="font-semibold text-blue-700 dark:text-blue-300">Total Deuda Filtrada:</span>
                            <span id="stat-filtered-total" class="font-bold text-gray-900 dark:text-white">$0</span>
                        </div>
                        <div class="flex items-center gap-2">
                             <span class="font-semibold text-red-600 dark:text-red-400">Saldo Pendiente:</span>
                            <span id="stat-filtered-pending" class="font-bold text-gray-900 dark:text-white">$0</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="font-semibold text-gray-600 dark:text-gray-400">Items:</span>
                            <span id="stat-filtered-items" class="font-bold text-gray-900 dark:text-white">0</span>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">
                                <tr>
                                    <th class="px-6 py-4">Cliente / Empresa</th>
                                    <th class="px-6 py-4">Fecha</th>
                                    <th class="px-6 py-4 text-right">Total Deuda</th>
                                    <th class="px-6 py-4 text-right">Abonado</th>
                                    <th class="px-6 py-4 text-right">Restante</th>
                                    <th class="px-6 py-4 text-center">Estado</th>
                                    <th class="px-6 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="credits-tbody" class="divide-y divide-gray-100 dark:divide-gray-700">
                                <tr><td colspan="7" class="text-center py-10 text-gray-400">Cargando créditos...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    // Logic Methods
    updateGlobalStats() {
        if (!this.credits) return;
        const stats = this.credits.reduce((acc, c) => {
            acc.total += parseFloat(c.total_amount);
            acc.paid += parseFloat(c.paid_amount);
            if (c.status !== 'paid') acc.activeCount++;
            return acc;
        }, { total: 0, paid: 0, activeCount: 0 });

        const pending = stats.total - stats.paid;

        const totalEl = document.getElementById('global-stat-total');
        const pendingEl = document.getElementById('global-stat-pending');
        const paidEl = document.getElementById('global-stat-paid');
        const countEl = document.getElementById('global-stat-count');

        if (totalEl) totalEl.textContent = '$' + stats.total.toLocaleString();
        if (pendingEl) pendingEl.textContent = '$' + pending.toLocaleString();
        if (paidEl) paidEl.textContent = '$' + stats.paid.toLocaleString();
        if (countEl) countEl.textContent = stats.activeCount;
    },

    addToCart() {
        const productSelect = document.getElementById('credit-product');
        const quantityInput = document.getElementById('credit-quantity');
        const priceInput = document.getElementById('credit-price');

        if (!productSelect.value) return Swal.fire('Error', 'Selecciona un producto', 'warning');

        const productId = parseInt(productSelect.value);
        const productName = productSelect.options[productSelect.selectedIndex].text.split(' - ')[0];
        const quantity = parseInt(quantityInput.value);
        const unitPrice = parseFloat(priceInput.value);

        // Stock Check
        const currentStock = parseInt(productSelect.options[productSelect.selectedIndex].dataset.stock);
        if (quantity > currentStock) return Swal.fire('Stock Insuficiente', `Solo hay ${currentStock} disponibles`, 'error');

        this.cart.push({
            productId,
            productName,
            quantity,
            unitPrice,
            total: quantity * unitPrice
        });

        this.renderCart();
    },

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.renderCart();
    },

    renderCart() {
        const tbody = document.getElementById('credit-cart-tbody');
        const totalEl = document.getElementById('cart-total');
        const btn = document.getElementById('create-credit-btn');

        if (this.cart.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-gray-400">Sin items agregados</td></tr>';
            totalEl.textContent = '$0';
            btn.disabled = true;
            return;
        }

        let total = 0;
        tbody.innerHTML = this.cart.map((item, i) => {
            total += item.total;
            return `
                <tr class="border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <td class="px-4 py-3 text-gray-900 dark:text-white font-medium">${item.productName}</td>
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-400">${item.quantity}</td>
                    <td class="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">$${item.total.toLocaleString()}</td>
                    <td class="px-4 py-3 text-right">
                        <button onclick="Credits.removeFromCart(${i})" class="text-red-500 hover:text-red-700">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        totalEl.textContent = '$' + total.toLocaleString();
        btn.disabled = false;
    },

    async createCredit() {
        const clientName = document.getElementById('client-name').value.trim();
        if (!clientName) return Swal.fire('Falta información', 'Ingresa el nombre del Cliente o Empresa', 'warning');

        try {
            const response = await fetch('/api/credits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    client_name: clientName,
                    items: this.cart.map(i => ({
                        product_id: i.productId,
                        quantity: i.quantity,
                        unit_price: i.unitPrice
                    }))
                })
            });

            if (!response.ok) throw new Error('Error al crear crédito');

            Swal.fire({
                icon: 'success',
                title: 'Crédito Creado',
                text: 'El inventario ha sido actualizado y la deuda registrada.'
            });

            // Reset
            this.cart = [];
            document.getElementById('client-name').value = '';
            this.renderCart();
            this.loadCredits(); // Refresh list
            this.loadProducts(); // Refresh stock

        } catch (error) {
            Swal.fire('Error', 'No se pudo registrar el crédito', 'error');
            console.error(error);
        }
    },

    renderCreditsTable(searchTerm = '') {
        const tbody = document.getElementById('credits-tbody');
        const statsBar = document.getElementById('filter-stats');

        let filtered = this.credits;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                c.client_name.toLowerCase().includes(term) ||
                c.items.some(i => i.product_name.toLowerCase().includes(term))
            );

            // Show stats when filtering
            statsBar.classList.remove('hidden');

            // Calculate Stats
            const totalDebt = filtered.reduce((sum, c) => sum + parseFloat(c.total_amount), 0);
            const totalPending = filtered.reduce((sum, c) => sum + (parseFloat(c.total_amount) - parseFloat(c.paid_amount)), 0);

            // Calculate item count for specific product search or total items
            // If searching for product "Arepa", count only "Arepa" items. Otherwise count all items in filtered credits.
            let itemCount = 0;
            filtered.forEach(c => {
                c.items.forEach(i => {
                    if (i.product_name.toLowerCase().includes(term)) {
                        itemCount += i.quantity;
                    } else if (c.client_name.toLowerCase().includes(term)) { // If matched by client, count all items? User asked "cantidad de producto"
                        itemCount += i.quantity;
                    }
                });
            });

            document.getElementById('stat-filtered-total').textContent = '$' + totalDebt.toLocaleString();
            document.getElementById('stat-filtered-pending').textContent = '$' + totalPending.toLocaleString();
            document.getElementById('stat-filtered-items').textContent = itemCount;

        } else {
            statsBar.classList.add('hidden');
        }


        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-10 text-gray-400">No se encontraron registros</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(c => {
            const total = parseFloat(c.total_amount);
            const paid = parseFloat(c.paid_amount);
            const pending = total - paid;
            const progress = (paid / total) * 100;
            const isPaid = c.status === 'paid';

            return `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                    <td class="px-6 py-4">
                        <div class="font-semibold text-gray-900 dark:text-white">${c.client_name}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">${c.items.length} productos</div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        ${new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                        $${total.toLocaleString()}
                    </td>
                    <td class="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                        $${paid.toLocaleString()}
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="font-bold ${pending > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}">
                            $${pending.toLocaleString()}
                        </div>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPaid ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }">
                            ${isPaid ? 'Pagado' : 'Pendiente'}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <div class="flex justify-center gap-2">
                            ${!isPaid ? `
                            <button onclick="Credits.openPaymentModal(${c.id}, ${pending})" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg tooltip" title="Abonar">
                                💰
                            </button>
                            ` : ''}
                            <button onclick="Credits.showDetails(${c.id})" class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Ver Detalle">
                                👁️
                            </button>
                             <button onclick="Credits.confirmDelete(${c.id})" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openPaymentModal(id, pendingAmount) {
        Swal.fire({
            title: 'Registrar Abono',
            html: `
                <div class="mb-4">
                    <p class="text-sm text-gray-500 mb-2">Saldo Pendiente: <b>$${pendingAmount.toLocaleString()}</b></p>
                    <input type="number" id="payment-amount" class="swal2-input" placeholder="Monto a abonar" max="${pendingAmount}">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Registrar Pago',
            preConfirm: () => {
                const amount = Swal.getPopup().querySelector('#payment-amount').value;
                if (!amount || amount <= 0) Swal.showValidationMessage('Ingresa un monto válido');
                if (parseFloat(amount) > pendingAmount) Swal.showValidationMessage('El monto excede la deuda');
                return { amount: amount };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                this.submitPayment(id, result.value.amount);
            }
        });
    },

    async submitPayment(id, amount) {
        try {
            const res = await fetch(`/api/credits/${id}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ amount: amount, date: new Date().toISOString().split('T')[0] })
            });

            if (!res.ok) throw new Error('Error en pago');

            Swal.fire('Abono Exitoso', 'El pago ha sido registrado', 'success');
            this.loadCredits();
            this.updateGlobalStats();
        } catch (error) {
            Swal.fire('Error', 'No se pudo registrar el pago', 'error');
        }
    },

    showDetails(id) {
        const credit = this.credits.find(c => c.id === id);
        if (!credit) return;

        const itemsHtml = credit.items.map(i => `
            <div class="flex justify-between text-sm py-1 border-b dark:border-gray-700">
                <span>${i.quantity}x ${i.product_name}</span>
                <span>$${parseFloat(i.total).toLocaleString()}</span>
            </div>
        `).join('');

        const paymentsHtml = credit.payments.length ? credit.payments.map(p => `
            <div class="flex justify-between text-sm py-1 border-b dark:border-gray-700 text-emerald-600">
                <span>${new Date(p.payment_date).toLocaleDateString()}</span>
                <span>+$${parseFloat(p.amount).toLocaleString()}</span>
            </div>
        `).join('') : '<p class="text-sm text-gray-400 italic">Sin abonos registrados</p>';

        Swal.fire({
            title: `Detalle: ${credit.client_name}`,
            html: `
                <div class="text-left">
                    <h3 class="font-bold text-gray-700 dark:text-gray-300 mt-2">Productos</h3>
                    <div class="mb-4 max-h-40 overflow-y-auto">${itemsHtml}</div>
                    
                    <h3 class="font-bold text-gray-700 dark:text-gray-300 mt-2">Historial de Pagos</h3>
                    <div class="mb-4 max-h-40 overflow-y-auto">${paymentsHtml}</div>
                </div>
            `,
            width: '600px'
        });
    },

    confirmDelete(id) {
        Swal.fire({
            title: '¿Eliminar Crédito?',
            text: "Esta acción restaurará el stock de los productos. ¡No se puede deshacer!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.deleteCredit(id);
            }
        });
    },

    async deleteCredit(id) {
        try {
            const res = await fetch(`/api/credits/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) throw new Error('Error al eliminar');

            Swal.fire(
                'Eliminado',
                'El crédito ha sido eliminado y el stock restaurado.',
                'success'
            );

            this.loadCredits();
            this.updateGlobalStats();
            this.loadProducts(); // Refresh stock

        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo eliminar el crédito', 'error');
        }
    }
};

window.Credits = Credits;
