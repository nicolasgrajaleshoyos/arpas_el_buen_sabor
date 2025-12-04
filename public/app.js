// Main Application Controller - Optimized for Speed
const App = {
    currentView: 'dashboard',
    layoutLoaded: false,

    init() {
        console.log('Inicializando Arepas el Buen Sabor...');

        // Initialize database
        Database.init();

        // Load layout once
        this.loadLayout();

        // Load dashboard
        this.loadView('dashboard');

        // Setup event listeners
        this.setupEventListeners();
    },

    loadLayout() {
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = this.renderMainLayout();
        this.layoutLoaded = true;

        // Initialize AI Assistant once
        AIAssistant.init();
    },

    setupEventListeners() {
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-view]')) {
                e.preventDefault();
                const view = e.target.getAttribute('data-view');
                this.loadView(view);
            }
        });

        // Mobile menu toggle
        document.addEventListener('click', (e) => {
            if (e.target.matches('#mobile-menu-btn') || e.target.closest('#mobile-menu-btn')) {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    sidebar.classList.toggle('active');
                }
            }
        });
    },

    loadView(viewName) {
        console.log('Cargando vista:', viewName);
        this.currentView = viewName;

        const contentArea = document.getElementById('main-content');
        if (!contentArea) {
            console.error('Content area not found');
            return;
        }

        try {
            // Load specific view content
            switch (viewName) {
                case 'dashboard':
                    contentArea.innerHTML = Dashboard.render();
                    setTimeout(() => Dashboard.init(), 0);
                    break;
                case 'inventory':
                    contentArea.innerHTML = Inventory.render();
                    setTimeout(() => Inventory.init(), 0);
                    break;
                case 'sales':
                    contentArea.innerHTML = Sales.render();
                    setTimeout(() => Sales.init(), 0);
                    break;
                case 'rawMaterials':
                    contentArea.innerHTML = RawMaterials.render();
                    setTimeout(() => RawMaterials.init(), 0);
                    break;
                case 'suppliers':
                    contentArea.innerHTML = Suppliers.render();
                    setTimeout(() => Suppliers.init(), 0);
                    break;
                case 'hr':
                    contentArea.innerHTML = HR.render();
                    setTimeout(() => HR.init(), 0);
                    break;
                case 'settings':
                    contentArea.innerHTML = this.renderSettings();
                    break;
                default:
                    contentArea.innerHTML = Dashboard.render();
                    setTimeout(() => Dashboard.init(), 0);
            }

            // Update active menu item
            this.updateActiveMenuItem(viewName);

            // Close mobile menu if open
            const sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }

            // Scroll to top
            contentArea.scrollTop = 0;

        } catch (error) {
            console.error('Error cargando vista:', error);
            Toast.error('Error al cargar la vista');
        }
    },

    renderMainLayout() {
        return `
            <!-- Main Layout -->
            <div class="flex h-screen bg-gray-50">
                <!-- Sidebar -->
                <aside id="sidebar" class="sidebar fixed lg:static w-64 h-full bg-white shadow-lg flex flex-col z-30 transform -translate-x-full lg:translate-x-0 transition-transform duration-300">
                    <!-- Logo -->
                    <div class="p-6 border-b border-gray-200">
                        <h1 class="text-2xl font-bold text-emerald-600">🫓 Arepas</h1>
                        <p class="text-sm text-gray-600">El Buen Sabor</p>
                    </div>
                    
                    <!-- Navigation -->
                    <nav class="flex-1 p-4 overflow-y-auto">
                        <ul class="space-y-2">
                            <li>
                                <a href="#" data-view="dashboard" class="nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                                    </svg>
                                    <span class="font-medium">Dashboard</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" data-view="inventory" class="nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                    </svg>
                                    <span class="font-medium">Inventario</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" data-view="sales" class="nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                    <span class="font-medium">Ventas</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" data-view="rawMaterials" class="nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                    </svg>
                                    <span class="font-medium">Materia Prima</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" data-view="suppliers" class="nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                    <span class="font-medium">Proveedores</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" data-view="hr" class="nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                    </svg>
                                    <span class="font-medium">Recursos Humanos</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" data-view="settings" class="nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    <span class="font-medium">Configuración</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </aside>
                
                <!-- Main Content -->
                <main class="flex-1 overflow-y-auto lg:ml-0">
                    <!-- Mobile Header -->
                    <div class="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-20">
                        <h1 class="text-xl font-bold text-emerald-600">🫓 Arepas</h1>
                        <button id="mobile-menu-btn" class="p-2 rounded-lg hover:bg-gray-100">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Content Area -->
                    <div id="main-content" class="p-4 md:p-6">
                        <!-- Dynamic content loads here -->
                    </div>
                </main>
            </div>
            
            <!-- AI Assistant Widget -->
            <div id="ai-assistant-widget"></div>
        `;
    },

    renderSettings() {
        return `
            <div class="max-w-4xl">
                <h1 class="text-3xl font-bold text-gray-900 mb-6">Configuración</h1>
                
                <div class="space-y-6">
                    <!-- Manual de Usuario -->
                    <div class="bg-white rounded-lg shadow-soft p-6">
                        <h2 class="text-xl font-semibold text-gray-900 mb-4">📖 Manual de Usuario</h2>
                        <p class="text-gray-600 mb-4">Aprende a usar todas las funcionalidades del sistema.</p>
                        <button class="btn-primary" onclick="App.showUserManual()">Ver Manual</button>
                    </div>
                    
                    <!-- Reset de Datos -->
                    <div class="bg-white rounded-lg shadow-soft p-6">
                        <h2 class="text-xl font-semibold text-gray-900 mb-4">⚠️ Resetear Datos</h2>
                        <p class="text-gray-600 mb-4">Elimina todos los datos y restaura la aplicación a valores de fábrica.</p>
                        <button class="btn-danger" onclick="App.resetData()">Resetear Sistema</button>
                    </div>
                    
                    <!-- Información del Sistema -->
                    <div class="bg-white rounded-lg shadow-soft p-6">
                        <h2 class="text-xl font-semibold text-gray-900 mb-4">ℹ️ Información</h2>
                        <div class="space-y-2 text-sm">
                            <p><strong>Versión:</strong> 2.0.0</p>
                            <p><strong>Base de Datos:</strong> MySQL (Laravel)</p>
                            <p><strong>Última actualización:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><strong>Desarrollado para:</strong> Arepas el Buen Sabor</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    updateActiveMenuItem(viewName) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('bg-emerald-50', 'text-emerald-600');
            item.classList.add('text-gray-700');
        });

        const activeItem = document.querySelector(`[data-view="${viewName}"]`);
        if (activeItem) {
            activeItem.classList.add('bg-emerald-50', 'text-emerald-600');
            activeItem.classList.remove('text-gray-700');
        }
    },

    showUserManual() {
        alert('Manual de usuario - Próximamente disponible');
    },

    resetData() {
        if (confirm('⚠️ ADVERTENCIA: Esto eliminará TODOS los datos del sistema. ¿Estás seguro?')) {
            if (confirm('Esta acción no se puede deshacer. ¿Confirmas?')) {
                Database.reset();
                Toast.success('Sistema reseteado exitosamente');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
