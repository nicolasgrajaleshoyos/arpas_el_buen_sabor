// Inventory Module
const Inventory = {
    currentProducts: [],
    editingId: null,

    init() {
        console.log('Inicializando Inventario...');
        this.loadProducts();
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Add product button
        const addBtn = document.getElementById('add-product-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showProductModal());
        }

        // Export button
        const exportBtn = document.getElementById('export-inventory-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => ExportUtils.exportProducts());
        }

        // Search
        const searchInput = document.getElementById('search-products');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterProducts(e.target.value));
        }
    },

    loadProducts() {
        this.currentProducts = Database.getAll('products');
        this.renderProductsTable();
    },

    filterProducts(searchTerm) {
        const filtered = Database.getAll('products').filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.currentProducts = filtered;
        this.renderProductsTable();
    },

    renderProductsTable() {
        const tbody = document.getElementById('products-tbody');
        if (!tbody) return;

        if (this.currentProducts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-8 text-gray-500 dark:text-gray-400">
                        No hay productos registrados
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.currentProducts.map(product => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-6 py-4">
                    <div class="font-medium text-gray-900 dark:text-white">${product.name}</div>
                </td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${product.category}</td>
                <td class="px-6 py-4">
                    <span class="badge ${product.stock > 10 ? 'badge-success' : product.stock > 5 ? 'badge-warning' : 'badge-danger'}">
                        ${product.stock} unidades
                    </span>
                </td>
                <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">$${product.price.toLocaleString()}</td>
                <td class="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">$${(product.stock * product.price).toLocaleString()}</td>
                <td class="px-6 py-4">
                    <div class="flex gap-2">
                        <button onclick="Inventory.editProduct(${product.id})" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="Inventory.deleteProduct(${product.id})" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    showProductModal(product = null) {
        this.editingId = product ? product.id : null;

        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');
        const title = document.getElementById('modal-title');

        title.textContent = product ? 'Editar Producto' : 'Nuevo Producto';

        if (product) {
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-stock').value = product.stock;
        } else {
            form.reset();
        }

        modal.classList.remove('hidden');

        // Setup form submit
        form.onsubmit = (e) => {
            e.preventDefault();
            this.saveProduct();
        };
    },

    closeModal() {
        document.getElementById('product-modal').classList.add('hidden');
        this.editingId = null;
    },

    saveProduct() {
        const name = document.getElementById('product-name').value.trim();
        const category = document.getElementById('product-category').value.trim();
        const price = parseFloat(document.getElementById('product-price').value);
        const stock = parseInt(document.getElementById('product-stock').value);

        if (!name || !category || !price || !stock) {
            Toast.error('Por favor completa todos los campos');
            return;
        }

        const productData = { name, category, price, stock };

        if (this.editingId) {
            Database.update('products', this.editingId, productData);
            Toast.success('Producto actualizado exitosamente');
        } else {
            Database.add('products', productData);
            Toast.success('Producto agregado exitosamente');
        }

        this.closeModal();
        this.loadProducts();
    },

    editProduct(id) {
        const product = Database.getById('products', id);
        if (product) {
            this.showProductModal(product);
        }
    },

    deleteProduct(id) {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            Database.delete('products', id);
            Toast.success('Producto eliminado exitosamente');
            this.loadProducts();
        }
    },

    render() {
        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Inventario de Productos</h1>
                        <p class="text-gray-600 dark:text-gray-400 mt-1">Gestión de productos terminados</p>
                    </div>
                    
                    <div class="flex gap-3">
                        <button id="export-inventory-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Exportar CSV
                        </button>
                        <button id="add-product-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Nuevo Producto
                        </button>
                    </div>
                </div>
                
                <!-- Search -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4 transition-colors">
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        <input 
                            type="text" 
                            id="search-products" 
                            class="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Buscar productos por nombre o categoría..."
                        >
                    </div>
                </div>
                
                <!-- Products Table -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden transition-colors">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr>
                                    <th class="text-left">Producto</th>
                                    <th class="text-left">Categoría</th>
                                    <th class="text-left">Stock</th>
                                    <th class="text-left">Precio</th>
                                    <th class="text-left">Valor Total</th>
                                    <th class="text-left">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="products-tbody">
                                <!-- Products will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Product Modal -->
            <div id="product-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 slide-in transition-colors">
                    <div class="flex items-center justify-between mb-6">
                        <h2 id="modal-title" class="text-2xl font-bold text-gray-900 dark:text-white">Nuevo Producto</h2>
                        <button onclick="Inventory.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="product-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre del Producto</label>
                            <input type="text" id="product-name" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoría</label>
                            <input type="text" id="product-category" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Precio</label>
                            <input type="number" id="product-price" min="0" step="100" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock</label>
                            <input type="number" id="product-stock" min="0" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                        </div>
                        
                        <div class="flex gap-3 pt-4">
                            <button type="button" onclick="Inventory.closeModal()" class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
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
