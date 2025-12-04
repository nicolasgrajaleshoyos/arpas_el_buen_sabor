// Suppliers Module
const Suppliers = {
    currentSuppliers: [],
    editingId: null,

    init() {
        console.log('Inicializando Proveedores...');
        this.loadSuppliers();
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Add supplier button
        const addBtn = document.getElementById('add-supplier-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showSupplierModal());
        }

        // Export button
        const exportBtn = document.getElementById('export-suppliers-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => ExportUtils.exportSuppliers());
        }
    },

    loadSuppliers() {
        this.currentSuppliers = Database.getAll('suppliers');
        this.renderSuppliers();
    },

    renderSuppliers() {
        const container = document.getElementById('suppliers-container');
        if (!container) return;

        if (this.currentSuppliers.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <p>No hay proveedores registrados</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.currentSuppliers.map(supplier => `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 card-hover transition-colors">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${supplier.name}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">NIT: ${supplier.nit}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="Suppliers.editSupplier(${supplier.id})" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="Suppliers.deleteSupplier(${supplier.id})" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="space-y-2 text-sm">
                    <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        ${supplier.phone}
                    </div>
                    <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        ${supplier.email}
                    </div>
                    <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        ${supplier.address}
                    </div>
                </div>
                
                <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Productos:</p>
                    <p class="text-sm text-gray-700 dark:text-gray-300">${supplier.products}</p>
                </div>
            </div>
        `).join('');
    },

    showSupplierModal(supplier = null) {
        this.editingId = supplier ? supplier.id : null;

        const modal = document.getElementById('supplier-modal');
        const form = document.getElementById('supplier-form');
        const title = document.getElementById('supplier-modal-title');

        title.textContent = supplier ? 'Editar Proveedor' : 'Nuevo Proveedor';

        if (supplier) {
            document.getElementById('supplier-name').value = supplier.name;
            document.getElementById('supplier-nit').value = supplier.nit;
            document.getElementById('supplier-phone').value = supplier.phone;
            document.getElementById('supplier-email').value = supplier.email;
            document.getElementById('supplier-address').value = supplier.address;
            document.getElementById('supplier-products').value = supplier.products;
        } else {
            form.reset();
        }

        modal.classList.remove('hidden');

        form.onsubmit = (e) => {
            e.preventDefault();
            this.saveSupplier();
        };
    },

    closeModal() {
        document.getElementById('supplier-modal').classList.add('hidden');
        this.editingId = null;
    },

    saveSupplier() {
        const supplierData = {
            name: document.getElementById('supplier-name').value.trim(),
            nit: document.getElementById('supplier-nit').value.trim(),
            phone: document.getElementById('supplier-phone').value.trim(),
            email: document.getElementById('supplier-email').value.trim(),
            address: document.getElementById('supplier-address').value.trim(),
            products: document.getElementById('supplier-products').value.trim()
        };

        if (!supplierData.name || !supplierData.nit) {
            Toast.error('Nombre y NIT son requeridos');
            return;
        }

        if (this.editingId) {
            Database.update('suppliers', this.editingId, supplierData);
            Toast.success('Proveedor actualizado exitosamente');
        } else {
            Database.add('suppliers', supplierData);
            Toast.success('Proveedor agregado exitosamente');
        }

        this.closeModal();
        this.loadSuppliers();
    },

    editSupplier(id) {
        const supplier = Database.getById('suppliers', id);
        if (supplier) {
            this.showSupplierModal(supplier);
        }
    },

    deleteSupplier(id) {
        if (confirm('¿Estás seguro de eliminar este proveedor?')) {
            Database.delete('suppliers', id);
            Toast.success('Proveedor eliminado exitosamente');
            this.loadSuppliers();
        }
    },

    render() {
        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Proveedores</h1>
                        <p class="text-gray-600 dark:text-gray-400 mt-1">Directorio de proveedores y contactos</p>
                    </div>
                    
                    <div class="flex gap-3">
                        <button id="export-suppliers-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Exportar CSV
                        </button>
                        <button id="add-supplier-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Nuevo Proveedor
                        </button>
                    </div>
                </div>
                
                <!-- Suppliers Grid -->
                <div id="suppliers-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Suppliers will be loaded here -->
                </div>
            </div>
            
            <!-- Supplier Modal -->
            <div id="supplier-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 slide-in transition-colors">
                    <div class="flex items-center justify-between mb-6">
                        <h2 id="supplier-modal-title" class="text-2xl font-bold text-gray-900 dark:text-white">Nuevo Proveedor</h2>
                        <button onclick="Suppliers.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="supplier-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
                            <input type="text" id="supplier-name" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">NIT</label>
                            <input type="text" id="supplier-nit" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
                            <input type="tel" id="supplier-phone" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                            <input type="email" id="supplier-email" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dirección</label>
                            <input type="text" id="supplier-address" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Productos que Suministra</label>
                            <textarea id="supplier-products" rows="2" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
                        </div>
                        
                        <div class="flex gap-3 pt-4">
                            <button type="button" onclick="Suppliers.closeModal()" class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" class="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
};
