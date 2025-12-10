// Raw Materials Module
const RawMaterials = {
    currentMaterials: [],
    currentTransactions: [],
    filteredTransactions: [],
    currentSuppliers: [],
    selectedMaterials: [],

    init() {
        console.log('Inicializando Materia Prima...');
        this.loadMaterials();
        this.loadTransactions();
        this.loadSuppliers();
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

        // Filter inputs
        const filterMaterial = document.getElementById('filter-material');
        const filterType = document.getElementById('filter-type');
        if (filterMaterial) {
            filterMaterial.addEventListener('input', () => this.applyFilters());
        }
        if (filterType) {
            filterType.addEventListener('change', () => this.applyFilters());
        }

        // Supplier selection change
        const supplierSelect = document.getElementById('material-supplier');
        if (supplierSelect) {
            supplierSelect.addEventListener('change', (e) => this.updateProductSuggestions(e.target.value));
        }

        // Transaction material selection change
        const transactionMaterialSelect = document.getElementById('transaction-material');
        if (transactionMaterialSelect) {
            transactionMaterialSelect.addEventListener('change', (e) => this.updateTransactionUnits(e.target.value));
        }
    },

    updateTransactionUnits(materialId) {
        const material = this.currentMaterials.find(m => m.id == materialId);
        const unitToggleContainer = document.getElementById('transaction-unit-toggle');
        const unitLabel = document.getElementById('transaction-unit-label');

        if (!unitToggleContainer || !unitLabel) return;

        if (material && material.packaging_unit && material.quantity_per_package > 0) {
            // Show toggle
            unitToggleContainer.classList.remove('hidden');

            // Set labels
            document.getElementById('unit-base-label').textContent = material.unit || 'Unidad';
            document.getElementById('unit-package-label').textContent = material.packaging_unit;

            // Default to base unit
            document.getElementById('use-package-unit').checked = false;
            unitLabel.textContent = `Cantidad (${material.unit})`;
        } else {
            // Hide toggle
            unitToggleContainer.classList.add('hidden');
            document.getElementById('use-package-unit').checked = false;
            unitLabel.textContent = material ? `Cantidad (${material.unit})` : 'Cantidad';
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

            // Refresh transaction totals in case prices changed or race condition occurred
            if (this.currentTransactions) {
                this.applyFilters();
            }
        } catch (error) {
            console.error('Error loading materials:', error);
            Toast.error('Error al cargar insumos del servidor');
        }
    },

    async loadTransactions() {
        try {
            const response = await fetch('/api/material-transactions');
            const data = await response.json();

            // Transform API response to match expected format
            this.currentTransactions = data.map(t => ({
                id: t.id,
                materialId: t.raw_material_id,
                materialName: t.material_name || t.raw_material?.name || 'Desconocido',
                type: t.type,
                quantity: parseFloat(t.quantity),
                notes: t.notes || '',
                date: t.transaction_date || t.created_at
            }));

            this.applyFilters();
        } catch (error) {
            console.error('Error loading transactions:', error);
            Toast.error('Error al cargar transacciones del servidor');
            this.currentTransactions = [];
            this.applyFilters();
        }
    },

    applyFilters() {
        const materialFilter = document.getElementById('filter-material')?.value.toLowerCase() || '';
        const typeFilter = document.getElementById('filter-type')?.value || '';

        this.filteredTransactions = this.currentTransactions.filter(transaction => {
            // Exclude purchases - only show outputs (Producción, Desperdicio, Ajuste)
            if (transaction.type === 'Compra') {
                return false;
            }

            const matchesMaterial = !materialFilter || transaction.materialName.toLowerCase().includes(materialFilter);
            const matchesType = !typeFilter || transaction.type === typeFilter;
            return matchesMaterial && matchesType;
        });

        this.renderTransactionsTable();
        this.updateTransactionTotal();
    },

    updateTransactionTotal() {
        const totalElement = document.getElementById('transactions-total');
        if (!totalElement) return;

        // Calculate total based on filtered transactions
        // For each transaction, we need to get the material price and multiply by quantity
        let totalMoney = 0;
        let totalQuantity = 0;

        this.filteredTransactions.forEach(transaction => {
            // Use this.currentMaterials which is populated in loadMaterials()
            const material = (this.currentMaterials || []).find(m => m.id == transaction.materialId);
            if (material) {
                totalMoney += transaction.quantity * material.price;
            }
            totalQuantity += transaction.quantity;
        });

        // Format: "Cant: 5 | Total: $25,000"
        totalElement.innerHTML = `<span class="mr-4 text-gray-600 dark:text-gray-400">Cant: <span class="font-bold text-gray-900 dark:text-white">${totalQuantity.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></span> <span>Total: $${totalMoney.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>`;
    },

    async loadSuppliers() {
        try {
            const response = await fetch('/api/suppliers');
            const data = await response.json();
            this.currentSuppliers = data;
        } catch (error) {
            console.error('Error loading suppliers:', error);
            Toast.error('Error al cargar proveedores del servidor');
        }
    },

    loadMaterialOptions() {
        const select = document.getElementById('transaction-material');
        if (!select) return;

        select.innerHTML = '<option value="">Selecciona material...</option>' +
            this.currentMaterials.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    },

    updateProductSuggestions(supplierId) {
        let uniqueProducts = [];

        if (supplierId) {
            const supplier = this.currentSuppliers.find(s => s.id == supplierId);
            if (supplier && supplier.products) {
                const products = supplier.products.split(/[\n,]+/).map(p => p.trim()).filter(p => p);
                // Remove duplicates
                uniqueProducts = [...new Set(products)];
            }
        }

        // Store current suggestions for filtering later
        this.currentSuggestions = uniqueProducts;
        this.renderSuggestionsDropdown(uniqueProducts);
    },

    renderSuggestionsDropdown(products) {
        const dropdown = document.getElementById('product-suggestions-dropdown');
        if (!dropdown) return;

        if (products.length === 0) {
            dropdown.classList.add('hidden');
            return;
        }

        dropdown.innerHTML = products.map(product => `
            <div onclick="RawMaterials.selectSuggestion('${product.replace(/'/g, "\\'")}')" 
                 class="px-4 py-2 hover:bg-emerald-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 transition-colors border-b last:border-0 border-gray-100 dark:border-gray-700">
                ${product}
            </div>
        `).join('');
    },

    selectSuggestion(name) {
        this.addMaterialItem(name);
        const input = document.getElementById('material-name');
        const dropdown = document.getElementById('product-suggestions-dropdown');
        if (input) {
            input.value = '';
            input.focus();
        }
        if (dropdown) dropdown.classList.add('hidden');

        // Reset suggestions to full list if we have a supplier selected
        const supplierSelect = document.getElementById('material-supplier');
        if (supplierSelect && supplierSelect.value) {
            this.updateProductSuggestions(supplierSelect.value);
        }
    },

    filterSuggestions(query) {
        const dropdown = document.getElementById('product-suggestions-dropdown');
        if (!dropdown) return;

        if (!query) {
            // If no query but we have a supplier, show all their products
            if (this.currentSuggestions && this.currentSuggestions.length > 0) {
                this.renderSuggestionsDropdown(this.currentSuggestions);
                dropdown.classList.remove('hidden');
            } else {
                dropdown.classList.add('hidden');
            }
            return;
        }

        const filtered = (this.currentSuggestions || []).filter(p => p.toLowerCase().includes(query.toLowerCase()));

        if (filtered.length > 0) {
            this.renderSuggestionsDropdown(filtered);
            dropdown.classList.remove('hidden');
        } else {
            dropdown.classList.add('hidden');
        }
    },

    renderMaterialItems() {
        const container = document.getElementById('material-items-container');
        if (!container) return;

        container.innerHTML = this.selectedMaterials.map((item, index) => `
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600 relative animate-fade-in group">
                <button type="button" onclick="RawMaterials.removeMaterialItem(${index})" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
                
                <h4 class="font-medium text-gray-900 dark:text-white mb-3 pr-8 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    ${item.name}
                </h4>
                
                <div class="grid grid-cols-2 gap-3">
                     <!-- Stock & Min Stock -->
                    <div>
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Stock</label>
                        <input type="number" step="0.01" value="${item.stock || ''}" 
                            onchange="RawMaterials.updateMaterialItem(${index}, 'stock', this.value)"
                            class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-1 focus:ring-emerald-500" placeholder="0">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Min Stock</label>
                        <input type="number" step="0.01" value="${item.min_stock || ''}" 
                            onchange="RawMaterials.updateMaterialItem(${index}, 'min_stock', this.value)"
                            class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-1 focus:ring-emerald-500" placeholder="0">
                    </div>

                    <!-- Unit & Price -->
                    <div>
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Unidad</label>
                        <input type="text" value="${item.unit || ''}" 
                            onchange="RawMaterials.updateMaterialItem(${index}, 'unit', this.value)"
                            list="unit-suggestions"
                            class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-1 focus:ring-emerald-500" placeholder="kg, unid...">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Precio</label>
                        <input type="number" step="0.01" value="${item.price || ''}" 
                            onchange="RawMaterials.updateMaterialItem(${index}, 'price', this.value)"
                            class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-1 focus:ring-emerald-500" placeholder="$0.00">
                    </div>
                </div>
                
                 <!-- Packaging Info (Optional) -->
                 <div class="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div>
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Presentación (Ej: Caja, Bulto)</label>
                        <input type="text" value="${item.packaging_unit || ''}" 
                            onchange="RawMaterials.updateMaterialItem(${index}, 'packaging_unit', this.value)"
                            class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-1 focus:ring-emerald-500" placeholder="Ej: Caja">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Contenido (en unidad base)</label>
                        <input type="number" step="0.01" value="${item.quantity_per_package || ''}" 
                            onchange="RawMaterials.updateMaterialItem(${index}, 'quantity_per_package', this.value)"
                            class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-1 focus:ring-emerald-500" placeholder="0">
                        <p class="text-[10px] text-gray-400 mt-0.5">Ej: 500 para 500g</p>
                    </div>
                </div>
                
                 <!-- Stock from Packages Helper -->
                 <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cantidad de Empaques Iniciales (Calcula Stock)</label>
                    <div class="flex gap-3 items-center">
                        <input type="number" step="0.01" 
                            onchange="RawMaterials.updateStockFromPackages(${index}, this.value)"
                            class="w-32 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-1 focus:ring-emerald-500" placeholder="0">
                        <span class="text-xs text-gray-500 dark:text-gray-400">= <span id="calc-stock-display-${index}">${item.stock || 0}</span> ${item.unit || ''}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    addMaterialItem(name) {
        name = name.trim();
        // Check if already exists
        if (name && !this.selectedMaterials.some(m => m.name === name)) {
            this.selectedMaterials.push({
                name: name,
                stock: 0,
                min_stock: 0,
                unit: '',
                price: 0,
                packaging_unit: '',
                quantity_per_package: 0
            });
            this.renderMaterialItems();
        }
    },

    updateMaterialItem(index, field, value) {
        if (this.selectedMaterials[index]) {
            this.selectedMaterials[index][field] = value;

            // Update calc display if unit changed
            if (field === 'unit') {
                const display = document.getElementById(`calc-stock-display-${index}`);
                if (display && display.nextSibling) {
                    display.nextSibling.textContent = ' ' + value;
                }
            }
        }
    },

    updateStockFromPackages(index, value) {
        const item = this.selectedMaterials[index];
        if (!item) return;

        const packages = parseFloat(value) || 0;
        const qtyPerPackage = parseFloat(item.quantity_per_package) || 0;

        if (qtyPerPackage > 0) {
            const totalStock = packages * qtyPerPackage;

            // Update data
            item.stock = totalStock;

            // Update Stock input UI (find the stock input for this index)
            // The stock input is the first input in the grid, but let's be safe: all inputs trigger updateMaterialItem
            // We can re-render, but that loses focus. Better to just find the input.
            // Since we generate HTML as string, we can't easily grab refs. 
            // We'll rely on querySelector. The structure is consistent.

            // Re-render is safest for sync, but let's try to find inputs.
            const container = document.getElementById('material-items-container');
            if (container) {
                // Find the inputs. 
                // Stock input is the first one in the "grid-cols-2" div.
                const inputs = container.querySelectorAll('input');
                // We have: delete btn, h4, then grid with stock, min_stock, unit, price...
                // Based on layout: 
                // Input 0: Stock
                // Input 1: Min Stock
                // Input 2: Unit
                // Input 3: Price
                // Input 4: Packaging Unit
                // Input 5: Qty per Package
                // Input 6: Stock from Packages (this one)

                // Let's iterate and find the one with onchange="...updateMaterialItem(..., 'stock'..."
                inputs.forEach(input => {
                    const onchange = input.getAttribute('onchange');
                    if (onchange && onchange.includes(`updateMaterialItem(${index}, 'stock'`)) {
                        input.value = totalStock;
                    }
                });

                // Update display
                const display = document.getElementById(`calc-stock-display-${index}`);
                if (display) display.textContent = totalStock;
            }
        } else {
            Toast.info('Define primero el "Contenido por Empaque"');
        }
    },

    removeMaterialItem(index) {
        this.selectedMaterials.splice(index, 1);
        this.renderMaterialItems();
    },

    renderMaterialsTable() {
        const tbody = document.getElementById('materials-tbody');
        if (!tbody) return;

        tbody.innerHTML = this.currentMaterials.map(material => {
            // Calculate total value
            // If unit is grams (g) or ml, and price is per kg/L (standard), divide stock by 1000
            let totalValue = material.stock * material.price;
            const unit = (material.unit || '').toLowerCase();

            // For display purposes, if unit is g/ml, we typically want to show Price Per Kg/L
            let displayPrice = material.price;
            if (['g', 'gr', 'gramo', 'gramos', 'ml', 'mililitro', 'mililitros'].includes(unit)) {
                // Price is stored per gram, but we want to show per Kg
                displayPrice = material.price * 1000;
                // Total is Stock(g) * Price(per g) -> matches simply stock * price
                // No need to divide stock by 1000 since price is per gram
            }

            return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${material.name}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${material.supplier?.name || 'Sin proveedor'}</td>
                <td class="px-6 py-4">
                    <span class="badge ${material.stock > material.min_stock ? 'badge-success' : 'badge-warning'}">
                        ${material.stock} ${material.unit}
                    </span>
                    ${material.quantity_per_package && material.quantity_per_package > 0 ? `
                        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ${Math.floor(material.stock / material.quantity_per_package)} ${material.packaging_unit || 'Unid. Empaque'}
                            ${material.stock % material.quantity_per_package > 0 ? ` y ${parseFloat((material.stock % material.quantity_per_package).toFixed(2))} ${material.unit}` : ''}
                        </div>
                    ` : ''}
                </td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${material.min_stock} ${material.unit}</td>
                <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">$${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                <td class="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
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
        `}).join('');
    },

    async addTransaction() {
        const materialId = parseInt(document.getElementById('transaction-material').value);
        const type = document.getElementById('transaction-type').value;
        let quantity = parseFloat(document.getElementById('transaction-quantity').value);
        const notes = document.getElementById('transaction-notes').value.trim();
        const usePackageUnit = document.getElementById('use-package-unit')?.checked;

        if (!materialId || !type || !quantity) {
            Toast.error('Completa todos los campos requeridos');
            return;
        }

        const material = this.currentMaterials.find(m => m.id === materialId);
        if (!material) {
            Toast.error('Material no encontrado');
            return;
        }

        // Convert if using package unit
        if (usePackageUnit && material.packaging_unit && material.quantity_per_package > 0) {
            quantity = quantity * material.quantity_per_package;
        }

        // Check if there's enough stock
        if (quantity > material.stock) {
            Toast.error(`Stock insuficiente. Disponible: ${material.stock} ${material.unit}`);
            return;
        }

        try {
            // Create transaction via API (API will also update stock)
            const response = await fetch('/api/material-transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    raw_material_id: materialId,
                    type: type,
                    quantity: quantity,
                    notes: notes
                })
            });

            const data = await response.json();

            if (data.success) {
                Toast.success('Transacción registrada exitosamente');

                // Reset form
                document.getElementById('transaction-form').reset();

                // Reload data
                this.loadMaterials();
                this.loadTransactions();
            } else {
                Toast.error(data.message || 'Error al registrar transacción');
            }
        } catch (error) {
            console.error('Error adding transaction:', error);
            Toast.error('Error al registrar transacción en el servidor');
        }
    },

    renderTransactionsTable() {
        const tbody = document.getElementById('transactions-tbody');
        if (!tbody) return;

        const transactionsToShow = this.filteredTransactions.slice(0, 50);

        if (transactionsToShow.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-8 text-gray-500 dark:text-gray-400">
                        No se encontraron transacciones
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = transactionsToShow.map(transaction => `
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
        const supplierSelect = document.getElementById('material-supplier');

        if (!modal || !form || !title) return;

        title.textContent = material ? 'Editar Insumo' : 'Nuevo Insumo';

        // Populate suppliers dropdown
        if (supplierSelect) {
            supplierSelect.innerHTML = '<option value="">-- Selecciona un proveedor --</option>' +
                this.currentSuppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        }

        if (material) {
            if (supplierSelect && material.supplier_id) {
                supplierSelect.value = material.supplier_id;
                this.updateProductSuggestions(material.supplier_id);
            } else {
                this.updateProductSuggestions(null);
            }
            // In edit mode, we only deal with one material
            this.selectedMaterials = [{
                name: material.name,
                stock: material.stock,
                min_stock: material.min_stock,
                unit: material.unit,
                price: material.price,
                packaging_unit: material.packaging_unit,
                quantity_per_package: material.quantity_per_package
            }];
            document.getElementById('material-name').value = '';
        } else {
            form.reset();
            this.selectedMaterials = [];
            this.updateProductSuggestions(null);
        }

        this.renderMaterialItems();

        // Handle Enter key on name input
        const nameInput = document.getElementById('material-name');
        if (nameInput) {
            nameInput.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addMaterialItem(nameInput.value);
                    nameInput.value = '';
                }
            };

            // Show suggestions on focus
            nameInput.onfocus = () => {
                this.filterSuggestions(nameInput.value);
            };

            // Filter on input
            nameInput.oninput = (e) => {
                this.filterSuggestions(e.target.value);
            };
        }

        // Hide on click outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('product-suggestions-dropdown');
            const input = document.getElementById('material-name');
            if (dropdown && input && !dropdown.contains(e.target) && !input.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

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

    async saveMaterial() {
        // If user typed something but didn't press enter, add it to list
        const nameInput = document.getElementById('material-name');
        if (nameInput && nameInput.value.trim()) {
            this.addMaterialItem(nameInput.value);
            nameInput.value = '';
        }

        if (this.selectedMaterials.length === 0) {
            Toast.error('Debes agregar al menos un insumo');
            return;
        }

        const supplierId = document.getElementById('material-supplier')?.value || null;

        // Validate all items
        for (const item of this.selectedMaterials) {
            if (!item.unit) {
                Toast.error(`La unidad es requerida para: ${item.name}`);
                return;
            }
        }

        try {
            // Process all materials
            let successCount = 0;
            let errors = [];

            for (const item of this.selectedMaterials) {
                const materialData = {
                    name: item.name,
                    stock: parseFloat(item.stock) || 0,
                    min_stock: parseFloat(item.min_stock) || 0,
                    unit: item.unit,
                    price: parseFloat(item.price) || 0,
                    packaging_unit: item.packaging_unit || null,
                    quantity_per_package: parseFloat(item.quantity_per_package) || 0,
                    supplier_id: supplierId || null
                };

                let response;
                // If editing and we have exactly one material which matches the editing ID...
                // But simplified: Batch create always POSTs. Update logic is complex with list.
                // Assuming "Edit" mode only allows editing the ONE material loaded.

                if (this.editingId && this.selectedMaterials.length === 1) {
                    response = await fetch(`/api/raw-materials/${this.editingId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                        },
                        body: JSON.stringify(materialData)
                    });
                } else {
                    // Create new
                    response = await fetch('/api/raw-materials', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                        },
                        body: JSON.stringify(materialData)
                    });
                }

                const data = await response.json();
                if (data.success) {
                    successCount++;
                } else {
                    errors.push(`${item.name}: ${data.message}`);
                }
            }

            if (successCount > 0) {
                Toast.success(`${successCount} insumo(s) guardado(s) exitosamente`);
                if (errors.length > 0) {
                    console.error('Errors:', errors);
                    Toast.warning(`Algunos insumos no se guardaron: ${errors.join(', ')}`);
                }
                this.closeModal();
                this.loadMaterials();
                this.loadMaterialOptions();
            } else {
                Toast.error(`Error: ${errors.join(', ')}`);
            }

        } catch (error) {
            console.error('Error saving materials:', error);
            Toast.error('Error de conexión al guardar');
        }
    },

    async deleteMaterial(id) {
        if (!confirm('¿Estás seguro de eliminar este insumo?')) {
            return;
        }

        try {
            const response = await fetch(`/api/raw-materials/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            const data = await response.json();

            if (data.success) {
                Toast.success('Insumo eliminado exitosamente');
                this.loadMaterials();
                this.loadMaterialOptions();
            } else {
                Toast.error(data.message || 'Error al eliminar insumo');
            }
        } catch (error) {
            console.error('Error deleting material:', error);
            Toast.error('Error al eliminar insumo del servidor');
        }
    },

    editMaterial(id) {
        const material = this.currentMaterials.find(m => m.id === id);
        if (material) {
            this.showMaterialModal(material);
        }
    },

    async deleteTransaction(id) {
        if (!confirm('¿Estás seguro de eliminar esta transacción? Esto revertirá el movimiento de stock.')) {
            return;
        }

        try {
            const response = await fetch(`/api/material-transactions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            const data = await response.json();

            if (data.success) {
                Toast.success('Transacción eliminada exitosamente');

                // Reload data
                this.loadMaterials();
                this.loadTransactions();
            } else {
                Toast.error(data.message || 'Error al eliminar transacción');
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            Toast.error('Error al eliminar transacción del servidor');
        }
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
                            Salidas
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
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Registrar Salida</h3>
                            
                            <form id="transaction-form" class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Material</label>
                                    <select id="transaction-material" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                                        <option value="">Selecciona material...</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Salida</label>
                                    <input type="text" id="transaction-type" list="transaction-types" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Selecciona o escribe..." required>
                                    <datalist id="transaction-types">
                                        <option value="Uso en Producción">
                                        <option value="Desperdicio">
                                        <option value="Ajuste de Inventario">
                                    </datalist>
                                </div>
                                
                                <div>
                                    <div class="flex justify-between items-center mb-2">
                                        <label id="transaction-unit-label" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad</label>
                                        
                                        <!-- Unit Toggle -->
                                        <div id="transaction-unit-toggle" class="hidden flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                            <label class="cursor-pointer px-2 py-1 text-xs rounded-md transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-gray-600 has-[:checked]:shadow-sm">
                                                <input type="radio" name="unit_type" value="base" class="hidden" checked onclick="document.getElementById('unit-package-label').parentElement.classList.remove('bg-white', 'dark:bg-gray-600', 'shadow-sm'); this.parentElement.classList.add('bg-white', 'dark:bg-gray-600', 'shadow-sm'); document.getElementById('use-package-unit').checked = false; document.getElementById('transaction-unit-label').textContent = 'Cantidad (' + document.getElementById('unit-base-label').textContent + ')';">
                                                <span id="unit-base-label">Unidad</span>
                                            </label>
                                            <label class="cursor-pointer px-2 py-1 text-xs rounded-md transition-all">
                                                <input type="radio" name="unit_type" value="package" class="hidden" id="use-package-unit" onclick="document.getElementById('unit-base-label').parentElement.classList.remove('bg-white', 'dark:bg-gray-600', 'shadow-sm'); this.parentElement.classList.add('bg-white', 'dark:bg-gray-600', 'shadow-sm'); document.getElementById('transaction-unit-label').textContent = 'Cantidad (' + document.getElementById('unit-package-label').textContent + ')';">
                                                <span id="unit-package-label">Caja</span>
                                            </label>
                                        </div>
                                    </div>
                                    <input type="number" id="transaction-quantity" min="0" step="0.01" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notas</label>
                                    <textarea id="transaction-notes" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
                                </div>
                                
                                <button type="submit" class="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                                    Registrar Salida
                                </button>
                            </form>
                        </div>
                        
                        <!-- Transactions History -->
                        <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 transition-colors">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Historial de Salidas</h3>
                                <div class="flex items-center gap-2">
                                    <span class="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                                    <span id="transactions-total" class="text-xl font-bold text-emerald-600 dark:text-emerald-400">$0</span>
                                </div>
                            </div>
                            
                            <!-- Filter Bar -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buscar Material</label>
                                    <input type="text" id="filter-material" placeholder="Nombre del material..." class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Salida</label>
                                    <input type="text" id="filter-type" list="filter-types" placeholder="Todos los tipos" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                    <datalist id="filter-types">
                                        <option value="Uso en Producción">
                                        <option value="Desperdicio">
                                        <option value="Ajuste de Inventario">
                                    </datalist>
                                </div>
                            </div>
                            
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
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seleccionar Proveedor (Opcional)</label>
                                <select id="material-supplier" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                    <option value="">-- Selecciona un proveedor --</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre del Insumo(s)</label>
                                <div class="space-y-4">
                                    <div class="relative">
                                        <input type="text" id="material-name" autocomplete="off" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Escribe o selecciona producto...">
                                        
                                        <!-- Custom Dropdown -->
                                        <div id="product-suggestions-dropdown" class="hidden absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                                            <!-- Suggestions will be injected here -->
                                        </div>
                                    </div>
                                    
                                    <!-- Items Container -->
                                    <div id="material-items-container" class="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        <!-- Items will be generated here -->
                                        <div class="text-center py-4 text-gray-500 dark:text-gray-400 text-sm italic bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                            Agrega insumos desde el campo superior
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Hidden datalist for units to be reused in dynamic inputs -->
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
