// Raw Materials Module
const RawMaterials = {
    currentMaterials: [],
    currentTransactions: [],

    init() {
        console.log('Inicializando Materia Prima...');
        this.loadMaterials();
        this.loadTransactions();
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Tab switching
        const tabs = document.querySelectorAll('[data-tab]');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Add material button
        const addBtn = document.getElementById('add-material-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showMaterialModal());
        }

        // Transaction form
        const transactionForm = document.getElementById('transaction-form');
        if (transactionForm) {
            transactionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addTransaction();
            });
        }
    },

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.classList.remove('border-emerald-500', 'text-emerald-600', 'dark:text-emerald-400');
            tab.classList.add('border-transparent', 'text-gray-600', 'dark:text-gray-400');
        });

        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('border-emerald-500', 'text-emerald-600', 'dark:text-emerald-400');
            activeTab.classList.remove('border-transparent', 'text-gray-600', 'dark:text-gray-400');
        }

        // Update content
        document.querySelectorAll('[data-tab-content]').forEach(content => {
            content.classList.add('hidden');
        });

        const activeContent = document.querySelector(`[data-tab-content="${tabName}"]`);
        if (activeContent) {
            activeContent.classList.remove('hidden');
        }
    },

    async loadMaterials() {
        try {
            const response = await fetch('/api/raw-materials');
            const data = await response.json();
            this.currentMaterials = data;
            this.renderMaterialsTable();
            this.loadMaterialOptions();
        } catch (error) {
            console.error('Error loading materials:', error);
            Toast.error('Error al cargar insumos del servidor');
        }
    },

    loadTransactions() {
        this.currentTransactions = Database.getAll('materialTransactions').sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );
        this.renderTransactionsTable();
    },

    loadMaterialOptions() {
        const select = document.getElementById('transaction-material');
        if (!select) return;

        const materials = Database.getAll('rawMaterials');
        select.innerHTML = '<option value="">Selecciona material...</option>' +
            materials.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    },

    renderMaterialsTable() {
        const tbody = document.getElementById('materials-tbody');
        if (!tbody) return;

        tbody.innerHTML = this.currentMaterials.map(material => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${material.name}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${material.supplier?.name || 'Sin proveedor'}</td>
                <td class="px-6 py-4">
                    <span class="badge ${material.stock > material.min_stock ? 'badge-success' : 'badge-warning'}">
                        ${material.stock} ${material.unit}
                    </span>
                </td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${material.min_stock} ${material.unit}</td>
                <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">$${material.price.toLocaleString()}</td>
                <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">$${(material.stock * material.price).toLocaleString()}</td>
                <td class="px-6 py-4">
                    <div class="flex gap-2">
                        <button onclick="RawMaterials.editMaterial(${material.id})" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="RawMaterials.deleteMaterial(${material.id})" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    addTransaction() {
        const materialId = parseInt(document.getElementById('transaction-material').value);
        const type = document.getElementById('transaction-type').value;
        const quantity = parseFloat(document.getElementById('transaction-quantity').value);
        const notes = document.getElementById('transaction-notes').value.trim();

        if (!materialId || !type || !quantity) {
            Toast.error('Completa todos los campos requeridos');
            return;
        }

        const material = Database.getById('rawMaterials', materialId);
        if (!material) {
            Toast.error('Material no encontrado');
            return;
        }

        // Calculate new stock
        let newStock = material.stock;
        if (type === 'Compra') {
            newStock += quantity;
        } else {
            if (quantity > material.stock) {
                Toast.error('Stock insuficiente');
                return;
            }
            newStock -= quantity;
        }

        // Add transaction
        Database.add('materialTransactions', {
            materialId: material.id,
            materialName: material.name,
            type: type,
            quantity: quantity,
            notes: notes,
            date: new Date().toISOString()
        });

        // Update material stock
        Database.update('rawMaterials', materialId, { stock: newStock });

        Toast.success('Transacción registrada exitosamente');

        // Reset form
        document.getElementById('transaction-form').reset();

        // Reload data
        this.loadMaterials();
        this.loadTransactions();
    },

    renderTransactionsTable() {
        const tbody = document.getElementById('transactions-tbody');
        if (!tbody) return;

        const recentTransactions = this.currentTransactions.slice(0, 50);

        tbody.innerHTML = recentTransactions.map(transaction => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${new Date(transaction.date).toLocaleString()}</td>
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${transaction.materialName}</td>
                <td class="px-6 py-4">
                    <span class="badge ${transaction.type === 'Compra' ? 'badge-success' : 'badge-warning'}">
                        ${transaction.type}
                    </span>
                </td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${transaction.quantity}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${transaction.notes || '-'}</td>
                <td class="px-6 py-4">
                    <button onclick="RawMaterials.deleteTransaction(${transaction.id})" class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Eliminar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    showMaterialModal(material = null) {
        this.editingId = material ? material.id : null;
        const modal = document.getElementById('material-modal');
        const form = document.getElementById('material-form');
        const title = document.getElementById('material-modal-title');

        if (!modal || !form || !title) return;

        title.textContent = material ? 'Editar Insumo' : 'Nuevo Insumo';

        if (material) {
            document.getElementById('material-name').value = material.name;
            document.getElementById('material-stock').value = material.stock;
            document.getElementById('material-min-stock').value = material.minStock;
            document.getElementById('material-unit').value = material.unit;
            document.getElementById('material-price').value = material.price;
        } else {
            form.reset();
        }

        modal.classList.remove('hidden');

        form.onsubmit = (e) => {
            e.preventDefault();
            this.saveMaterial();
        };
    },

    closeModal() {
        const modal = document.getElementById('material-modal');
        if (modal) modal.classList.add('hidden');
        this.editingId = null;
    },

    saveMaterial() {
        const name = document.getElementById('material-name').value.trim();
        const stock = parseFloat(document.getElementById('material-stock').value);
        const minStock = parseFloat(document.getElementById('material-min-stock').value);
        const unit = document.getElementById('material-unit').value;
        const price = parseFloat(document.getElementById('material-price').value);

        if (!name || isNaN(stock) || isNaN(minStock) || !unit || isNaN(price)) {
            Toast.error('Por favor completa todos los campos correctamente');
            return;
        }

        const materialData = { name, stock, minStock, unit, price };

        if (this.editingId) {
            Database.update('rawMaterials', this.editingId, materialData);
            Toast.success('Insumo actualizado exitosamente');
        } else {
            Database.add('rawMaterials', materialData);
            Toast.success('Insumo agregado exitosamente');
        }

        this.closeModal();
        this.loadMaterials();
        this.loadMaterialOptions();
    },

    deleteMaterial(id) {
        if (confirm('¿Estás seguro de eliminar este insumo?')) {
            Database.delete('rawMaterials', id);
            Toast.success('Insumo eliminado exitosamente');
            this.loadMaterials();
            this.loadMaterialOptions();
        }
    },

    editMaterial(id) {
        const material = Database.getById('rawMaterials', id);
        if (material) {
            this.showMaterialModal(material);
        }
    },

    deleteTransaction(id) {
        if (!confirm('¿Estás seguro de eliminar esta transacción? Esto revertirá el movimiento de stock.')) {
            return;
        }

        const transaction = Database.getById('materialTransactions', id);
        if (!transaction) {
            Toast.error('Transacción no encontrada');
            return;
        }

        // Revert the stock change
        const material = Database.getById('rawMaterials', transaction.materialId);
        if (material) {
            let newStock = material.stock;

            // Reverse the transaction effect
            if (transaction.type === 'Compra') {
                // If it was a purchase, subtract the quantity
                newStock -= transaction.quantity;
            } else {
                // If it was a usage/output, add the quantity back
                newStock += transaction.quantity;
            }

            // Update material stock
            Database.update('rawMaterials', transaction.materialId, { stock: newStock });
        }

        // Delete the transaction
        Database.delete('materialTransactions', id);
        Toast.success('Transacción eliminada exitosamente');

        // Reload data
        this.loadMaterials();
        this.loadTransactions();
    },

    render() {
        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Materia Prima e Insumos</h1>
                        <p class="text-gray-600 dark:text-gray-400 mt-1">Control de inventario de ingredientes y materiales</p>
                    </div>
                    <button onclick="RawMaterials.showMaterialModal()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Nuevo Insumo
                    </button>
                </div>
                
                <!-- Tabs -->
                <div class="border-b border-gray-200 dark:border-gray-700">
                    <nav class="flex gap-8">
                        <button data-tab="inventory" class="py-4 px-1 border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-medium transition-colors">
                            Inventario
                        </button>
                        <button data-tab="transactions" class="py-4 px-1 border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                            Movimientos
                        </button>
                        <a href="/purchases" class="py-4 px-1 border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                            Compras
                        </a>
                    </nav>
                </div>
                
                <!-- Inventory Tab -->
                <div data-tab-content="inventory">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden transition-colors">
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr>
                                        <th class="text-left">Material</th>
                                        <th class="text-left">Proveedor</th>
                                        <th class="text-left">Stock Actual</th>
                                        <th class="text-left">Stock Mínimo</th>
                                        <th class="text-left">Precio Unitario</th>
                                        <th class="text-left">Total</th>
                                        <th class="text-left">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="materials-tbody">
                                    <!-- Materials will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <!-- Transactions Tab -->
                <div data-tab-content="transactions" class="hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Transaction Form -->
                        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 transition-colors">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Registrar Movimiento</h3>
                            
                            <form id="transaction-form" class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Material</label>
                                    <select id="transaction-material" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                                        <option value="">Selecciona material...</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Movimiento</label>
                                    <select id="transaction-type" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                                        <option value="">Selecciona tipo...</option>
                                        <option value="Producción">Uso en Producción</option>
                                        <option value="Desperdicio">Desperdicio</option>
                                        <option value="Ajuste">Ajuste de Inventario</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cantidad</label>
                                    <input type="number" id="transaction-quantity" min="0" step="0.1" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notas</label>
                                    <textarea id="transaction-notes" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
                                </div>
                                
                                <button type="submit" class="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                                    Registrar Movimiento
                                </button>
                            </form>
                        </div>
                        
                        <!-- Transactions History -->
                        <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 transition-colors">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historial de Movimientos</h3>
                            
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead>
                                        <tr>
                                            <th class="text-left text-sm">Fecha</th>
                                            <th class="text-left text-sm">Material</th>
                                            <th class="text-left text-sm">Tipo</th>
                                            <th class="text-left text-sm">Cantidad</th>
                                            <th class="text-left text-sm">Notas</th>
                                            <th class="text-left text-sm">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody id="transactions-tbody">
                                        <!-- Transactions will be loaded here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Material Modal -->
                <div id="material-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 slide-in transition-colors">
                        <div class="flex items-center justify-between mb-6">
                            <h2 id="material-modal-title" class="text-2xl font-bold text-gray-900 dark:text-white">Nuevo Insumo</h2>
                            <button onclick="RawMaterials.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <form id="material-form" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre del Insumo</label>
                                <input type="text" id="material-name" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock Actual</label>
                                    <input type="number" id="material-stock" step="0.01" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock Mínimo</label>
                                    <input type="number" id="material-min-stock" step="0.01" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unidad</label>
                                    <input type="text" id="material-unit" list="unit-suggestions" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Ej: kg, g, l, ml, unid..." required>
                                    <datalist id="unit-suggestions">
                                        <option value="kg">Kilogramos (kg)</option>
                                        <option value="g">Gramos (g)</option>
                                        <option value="l">Litros (l)</option>
                                        <option value="ml">Mililitros (ml)</option>
                                        <option value="unid">Unidades</option>
                                        <option value="lb">Libras (lb)</option>
                                        <option value="oz">Onzas (oz)</option>
                                        <option value="ton">Toneladas (ton)</option>
                                    </datalist>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Precio Unitario</label>
                                    <input type="number" id="material-price" step="0.01" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                                </div>
                            </div>
                            
                            <div class="flex gap-3 pt-4">
                                <button type="button" onclick="RawMaterials.closeModal()" class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" class="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
};
