
// Human Resources Module - Backend Integrated
const HR = {
    currentEmployees: [],
    currentPayrolls: [],
    currentAdvances: [],

    init() {
        console.log('Inicializando Recursos Humanos (Backend Mode)...');
        this.setupEventListeners();
        this.loadEmployees();
        this.loadPayrolls();
        this.loadAdvances();
    },

    setupEventListeners() {
        // Tab switching
        // Note: Event listeners for tabs must be delegated or re-attached after render if render overwrites DOM.
        // Since render() is called once, we can attach here, but need to make sure DOM exists.
        // The init() is called AFTER render(), so this is fine.

        const mainContainer = document.getElementById('hr-content');
        if (!mainContainer) return;

        mainContainer.addEventListener('click', (e) => {
            // Tab Clicking
            const tabBtn = e.target.closest('[data-hr-tab]');
            if (tabBtn) {
                const tabName = tabBtn.getAttribute('data-hr-tab');
                this.switchTab(tabName);
            }
        });

        // Add employee button logic moved to HTML onclick or attached here if ID exists
        const addBtn = document.getElementById('add-employee-btn');
        if (addBtn) addBtn.onclick = () => this.showEmployeeModal();

        // Generate payroll button
        const generateBtn = document.getElementById('generate-payroll-btn');
        if (generateBtn) generateBtn.onclick = () => this.openPayrollModal();

        // Modal closers
        // We can use onclick in HTML for simplicity or attach here. HTML onclick is already used in existing code patterns.

        // Advance Form
        const advanceForm = document.getElementById('advance-form');
        if (advanceForm) {
            advanceForm.onsubmit = (e) => {
                e.preventDefault();
                this.saveAdvance();
            };
        }

        // Global Period Filter Listener
        window.addEventListener('period-changed', (e) => {
            this.renderPayrolls(e.detail.month, e.detail.year);
            this.updatePayrollSummary();
            this.renderAdvances(e.detail.month, e.detail.year);
        });
    },

    getHeaders() {
        const token = document.querySelector('meta[name="csrf-token"]');
        return {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token ? token.getAttribute('content') : ''
        };
    },

    switchTab(tabName) {
        document.querySelectorAll('[data-hr-tab]').forEach(tab => {
            tab.classList.remove('border-emerald-500', 'text-emerald-600', 'dark:text-emerald-400', 'bg-emerald-50', 'dark:bg-emerald-900/10');
            tab.classList.add('border-transparent', 'text-gray-600', 'dark:text-gray-400', 'hover:text-gray-700', 'dark:hover:text-gray-300');
        });

        const activeTab = document.querySelector(`[data-hr-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('border-emerald-500', 'text-emerald-600', 'dark:text-emerald-400', 'bg-emerald-50', 'dark:bg-emerald-900/10');
            activeTab.classList.remove('border-transparent', 'text-gray-600', 'dark:text-gray-400', 'hover:text-gray-700', 'dark:hover:text-gray-300');
        }

        document.querySelectorAll('[data-hr-tab-content]').forEach(content => {
            content.classList.add('hidden');
        });

        const activeContent = document.querySelector(`[data-hr-tab-content="${tabName}"]`);
        if (activeContent) activeContent.classList.remove('hidden');
    },

    // --- RENDER MAIN STRUCTURE ---
    render() {
        return `
            <div class="space-y-6 animate-fade-in">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Recursos Humanos</h1>
                        <p class="text-gray-600 dark:text-gray-400 mt-1">Gestión de empleados, nómina y adelantos</p>
                    </div>
                     <div class="flex gap-3">
                        <button id="add-employee-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                            </svg>
                            Nuevo Empleado
                        </button>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <div class="border-b border-gray-200 dark:border-gray-700">
                    <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                        <button data-hr-tab="employees" class="border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm rounded-t-lg transition-all flex items-center gap-2">
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            Empleados
                        </button>
                         <button data-hr-tab="payroll" class="border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm rounded-t-lg transition-all flex items-center gap-2">
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Nómina
                        </button>
                        <button data-hr-tab="advances" class="border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm rounded-t-lg transition-all flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            Adelantos
                        </button>
                    </nav>
                </div>

                <!-- Content Sections -->
                
                <!-- 1. Employees Tab -->
                <div data-hr-tab-content="employees" class="space-y-6">
                    <div id="employees-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Employees loaded here -->
                    </div>
                </div>

                <!-- 2. Payroll Tab -->
                <div data-hr-tab-content="payroll" class="hidden space-y-6">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-soft transition-colors border border-gray-100 dark:border-gray-700">
                            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Pagado (Año Actual)</h3>
                            <p id="total-paid-year" class="text-3xl font-bold text-gray-900 dark:text-white">$0</p>
                        </div>
                        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-soft transition-colors border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                            <div class="flex justify-between items-center">
                                <div>
                                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Acciones Rápidas</h3>
                                    <p class="text-xs text-gray-400">Generar nueva nómina para el mes actual</p>
                                </div>
                                <button id="generate-payroll-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                                    </svg>
                                    Generar Nómina
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden transition-colors border border-gray-100 dark:border-gray-700">
                         <div class="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 class="font-semibold text-gray-900 dark:text-white">Historial de Nóminas</h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Período</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Empleados</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total Pagado</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Fecha Generación</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="payrolls-tbody" class="divide-y divide-gray-100 dark:divide-gray-700">
                                    <!-- Payrolls will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- 3. Advances Tab -->
                <div data-hr-tab-content="advances" class="hidden space-y-6">
                    <div class="flex justify-end mb-4">
                        <button onclick="HR.showAdvanceModal()" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Solicitar Adelanto
                        </button>
                    </div>

                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden transition-colors border border-gray-100 dark:border-gray-700">
                         <div class="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 class="font-semibold text-gray-900 dark:text-white">Adelantos y Préstamos</h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Empleado</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monto</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Motivo</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="advances-tbody" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    <!-- Advances will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>

             <!-- Employee Modal -->
            <div id="employee-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 slide-in transition-colors">
                    <div class="flex items-center justify-between mb-6">
                        <h2 id="employee-modal-title" class="text-2xl font-bold text-gray-900 dark:text-white">Nuevo Empleado</h2>
                        <button onclick="HR.closeEmployeeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <form id="employee-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre Completo</label>
                            <input type="text" id="employee-name" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                        </div>
                         <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cargo</label>
                            <input type="text" id="employee-position" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                        </div>
                         <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Salario Base</label>
                                <input type="number" id="employee-salary" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
                                <input type="tel" id="employee-phone" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            </div>
                        </div>
                        <div>
                             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                             <input type="email" id="employee-email" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        </div>
                        <div>
                             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha Contratación</label>
                             <input type="date" id="employee-hire-date" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        </div>
                        <div class="flex gap-3 pt-4">
                            <button type="button" onclick="HR.closeEmployeeModal()" class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">Cancelar</button>
                            <button type="submit" class="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Advance Modal -->
            <div id="advance-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 slide-in transition-colors">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Solicitar Adelanto</h2>
                        <button onclick="document.getElementById('advance-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <form id="advance-form" class="space-y-4">
                        <div>
                             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Empleado</label>
                             <select id="advance-employee" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required></select>
                        </div>
                        <div>
                             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monto Solicitado</label>
                             <input type="number" id="advance-amount" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                        </div>
                        <div>
                             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha Solicitud</label>
                             <input type="date" id="advance-date" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                        </div>
                         <div>
                             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Motivo</label>
                             <textarea id="advance-reason" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
                        </div>
                         <div class="flex gap-3 pt-4">
                            <button type="button" onclick="document.getElementById('advance-modal').classList.add('hidden')" class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">Cancelar</button>
                            <button type="submit" class="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">Solicitar</button>
                        </div>
                    </form>
                </div>
            </div>

             <!-- Payroll Generation Modal -->
            <div id="payroll-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full p-6 slide-in transition-colors overflow-hidden flex flex-col max-h-[90vh]">
                     <div class="flex items-center justify-between mb-6">
                        <div>
                             <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Generar Nómina</h2>
                             <div class="flex items-center gap-4 mt-1">
                                <p class="text-sm text-gray-500 dark:text-gray-400">Periodo: <span id="payroll-month" class="font-medium text-gray-900 dark:text-white"></span></p>
                                <input type="date" id="payroll-date" class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500">
                             </div>
                        </div>
                        <button onclick="document.getElementById('payroll-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    
                    <div class="overflow-auto flex-1 mb-6 border rounded-lg border-gray-200 dark:border-gray-700">
                        <table class="w-full">
                             <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                <tr>
                                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Empleado</th>
                                    <th class="px-4 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 w-32">Salario Base</th>
                                    <th class="px-4 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 w-32">Bonificaciones</th>
                                    <th class="px-4 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 w-32">Deducciones</th>
                                    <th class="px-4 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 w-32">Total a Pagar</th>
                                </tr>
                            </thead>
                             <tbody id="payroll-generation-tbody" class="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                <!-- Dynamic rows -->
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div>
                             <span class="text-sm text-gray-500 dark:text-gray-400">Total Nómina:</span>
                             <span id="payroll-grand-total" class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 ml-2">$0</span>
                        </div>
                         <div class="flex gap-3">
                            <button onclick="document.getElementById('payroll-modal').classList.add('hidden')" class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">Cancelar</button>
                            <button onclick="HR.savePayroll()" class="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-lg shadow-emerald-600/20">Generar y Guardar</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Payroll Details Modal -->
             <div id="payroll-details-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full p-6 slide-in transition-colors">
                     <div class="flex items-center justify-between mb-6">
                        <h2 id="payroll-details-title" class="text-2xl font-bold text-gray-900 dark:text-white">Detalles de Nómina</h2>
                         <button onclick="document.getElementById('payroll-details-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table class="w-full">
                            <thead class="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Empleado</th>
                                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Base</th>
                                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Bonos</th>
                                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Deducciones</th>
                                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Total</th>
                                </tr>
                            </thead>
                            <tbody id="payroll-details-tbody" class="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                <!-- Details here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    // --- EMPLOYEES ---

    async loadEmployees() {
        try {
            const response = await fetch('/api/employees');
            this.currentEmployees = await response.json();
            this.renderEmployees();
        } catch (error) {
            console.error('Error loading employees:', error);
            Toast.error('Error al cargar empleados');
        }
    },

    renderEmployees() {
        const container = document.getElementById('employees-container');
        if (!container) return;

        container.innerHTML = this.currentEmployees.map(employee => `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 card-hover transition-colors">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <span class="text-emerald-600 dark:text-emerald-400 font-semibold text-lg">${employee.name.charAt(0)}</span>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${employee.name}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">${employee.position}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="HR.editEmployee(${employee.id})" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button onclick="HR.deleteEmployee(${employee.id})" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
                
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-400">Salario:</span>
                        <span class="font-semibold text-gray-900 dark:text-white">$${parseFloat(employee.salary).toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-400">Teléfono:</span>
                        <span class="text-gray-900 dark:text-white">${employee.phone || '-'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    showEmployeeModal(employee = null) {
        const modal = document.getElementById('employee-modal');
        const form = document.getElementById('employee-form');
        const title = document.getElementById('employee-modal-title');
        title.textContent = employee ? 'Editar Empleado' : 'Nuevo Empleado';

        if (employee) {
            document.getElementById('employee-name').value = employee.name;
            document.getElementById('employee-position').value = employee.position;
            document.getElementById('employee-salary').value = employee.salary;
            document.getElementById('employee-hire-date').value = employee.hire_date || '';
            document.getElementById('employee-phone').value = employee.phone || '';
            document.getElementById('employee-email').value = employee.email || '';
        } else {
            form.reset();
        }

        modal.classList.remove('hidden');

        form.onsubmit = (e) => {
            e.preventDefault();
            this.saveEmployee(employee ? employee.id : null);
        };
    },

    closeEmployeeModal() {
        document.getElementById('employee-modal').classList.add('hidden');
    },

    async saveEmployee(id) {
        const data = {
            name: document.getElementById('employee-name').value.trim(),
            position: document.getElementById('employee-position').value.trim(),
            salary: parseFloat(document.getElementById('employee-salary').value),
            hire_date: document.getElementById('employee-hire-date').value || null,
            phone: document.getElementById('employee-phone').value.trim(),
            email: document.getElementById('employee-email').value.trim()
        };

        try {
            const url = id ? `/api/employees/${id}` : '/api/employees';
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Error saving');

            Toast.success('Empleado guardado exitosamente');
            this.closeEmployeeModal();
            this.loadEmployees();
        } catch (error) {
            console.error(error);
            Toast.error('Error al guardar empleado');
        }
    },

    editEmployee(id) {
        const employee = this.currentEmployees.find(e => e.id === id);
        if (employee) this.showEmployeeModal(employee);
    },

    async deleteEmployee(id) {
        if (!confirm('¿Eliminar este empleado?')) return;
        try {
            await fetch(`/api/employees/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            Toast.success('Empleado eliminado');
            this.loadEmployees();
        } catch (error) {
            Toast.error('Error al eliminar');
        }
    },

    // --- ADVANCES ---

    async loadAdvances() {
        try {
            const response = await fetch('/api/employee-advances');
            this.currentAdvances = await response.json();
            this.renderAdvances();
        } catch (error) {
            console.error('Error loading advances:', error);
        }
    },

    renderAdvances(filterMonth = null, filterYear = null) {
        const tbody = document.getElementById('advances-tbody');
        if (!tbody) return;

        // If no filter arguments, try to read from DOM
        if (filterMonth === null || filterYear === null) {
            filterMonth = document.getElementById('global-month')?.value;
            filterYear = document.getElementById('global-year')?.value;
        }

        let displayAdvances = this.currentAdvances;
        if (filterMonth !== undefined && filterYear !== undefined && filterMonth !== "" && filterYear !== "") {
            const m = parseInt(filterMonth);
            const y = parseInt(filterYear);
            displayAdvances = this.currentAdvances.filter(adv => {
                if (!adv.request_date) return false;
                // request_date format: YYYY-MM-DD
                const [advYear, advMonth] = adv.request_date.split('-').map(Number);
                // advMonth is 1-indexed, m is 0-indexed
                return (advMonth - 1) === m && advYear === y;
            });
        }

        if (displayAdvances.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500">No hay adelantos para este periodo</td></tr>`;
            return;
        }

        tbody.innerHTML = displayAdvances.map(adv => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="px-6 py-4 text-gray-900 dark:text-white">${adv.employee ? adv.employee.name : 'Desconocido'}</td>
                <td class="px-6 py-4 text-emerald-600 font-medium">$${parseFloat(adv.amount).toLocaleString()}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${new Date(adv.request_date).toLocaleDateString()}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${adv.reason || '-'}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full ${adv.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                adv.status === 'deducted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }">
                        ${adv.status === 'pending' ? 'Pendiente' : adv.status === 'deducted' ? 'Descontado' : 'Cancelado'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        ${adv.status === 'pending' ? `
                        <button onclick="HR.cancelAdvance(${adv.id})" class="text-amber-600 hover:text-amber-800 text-sm font-medium">Cancelar</button>
                        ` : ''}
                        <button onclick="HR.deleteAdvance(${adv.id})" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Registro">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    showAdvanceModal() {
        if (this.currentEmployees.length === 0) {
            Toast.error('No hay empleados para solicitar adelantos');
            return;
        }

        const select = document.getElementById('advance-employee');
        select.innerHTML = this.currentEmployees.map(e => `<option value="${e.id}">${e.name}</option>`).join('');

        const form = document.getElementById('advance-form');
        form.reset();

        // Init date to today
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('advance-date').value = now.toISOString().slice(0, 10);

        document.getElementById('advance-modal').classList.remove('hidden');
    },

    async saveAdvance() {
        const data = {
            employee_id: document.getElementById('advance-employee').value,
            amount: parseFloat(document.getElementById('advance-amount').value),
            reason: document.getElementById('advance-reason').value,
            request_date: document.getElementById('advance-date').value,
            status: 'pending'
        };

        try {
            const response = await fetch('/api/employee-advances', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Error saving');

            Toast.success('Adelanto registrado');
            document.getElementById('advance-modal').classList.add('hidden');
            this.loadAdvances();
        } catch (error) {
            Toast.error('Error al guardar adelanto');
        }
    },

    async cancelAdvance(id) {
        if (!confirm('¿Cancelar este adelanto?')) return;
        try {
            await fetch(`/api/employee-advances/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ status: 'cancelled' })
            });
            Toast.success('Adelanto cancelado');
            this.loadAdvances();
        } catch (error) {
            Toast.error('Error al cancelar');
        }
    },

    async deleteAdvance(id) {
        if (!confirm('¿Estás seguro de eliminar este registro permanentemente?')) return;
        try {
            await fetch(`/api/employee-advances/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            Toast.success('Registro eliminado');
            this.loadAdvances();
        } catch (error) {
            console.error(error);
            Toast.error('Error al eliminar registro');
        }
    },

    // --- PAYROLLS ---

    async openPayrollModal(payrollId = null) {
        if (this.currentEmployees.length === 0) {
            Toast.error('No hay empleados registrados');
            return;
        }

        // Fetch pending advances for ALL employees
        let pendingAdvances = [];
        try {
            const advResponse = await fetch('/api/employee-advances?status=pending');
            pendingAdvances = await advResponse.json();
        } catch (e) { console.error(e); }

        const modal = document.getElementById('payroll-modal');
        const tbody = document.getElementById('payroll-generation-tbody');
        const monthSpan = document.getElementById('payroll-month');
        const dateInput = document.getElementById('payroll-date');

        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        // Helper to update period text
        // Store pending advances globally for re-rendering
        this.pendingAdvances = pendingAdvances;

        const renderPayrollRows = (dateString) => {
            // Parse selected date
            const [y, m, d] = dateString.split('-').map(Number);
            // dateString is YYYY-MM-DD. m is 1-indexed.

            tbody.innerHTML = this.currentEmployees.map(emp => {
                // Filter advances: Must be pending (already filtered by API) and belong to this employee
                const employeeAdvances = this.pendingAdvances.filter(a => a.employee_id === emp.id);

                const totalAdvance = employeeAdvances.reduce((sum, a) => sum + parseFloat(a.amount), 0);
                const deductionStyle = totalAdvance > 0 ? "border-amber-500 bg-amber-50" : "border-gray-300 dark:border-gray-600";

                return `
                <tr data-employee-id="${emp.id}" data-advances='${JSON.stringify(employeeAdvances)}'>
                    <td class="px-4 py-3">
                        <span class="block text-sm font-medium text-gray-900 dark:text-white">${emp.name}</span>
                        <span class="text-xs text-gray-500">${emp.position}</span>
                    </td>
                    <td class="px-4 py-3">
                        <input type="number" class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right salary-input" value="${emp.salary}" readonly>
                    </td>
                    <td class="px-4 py-3">
                        <input type="number" class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right bonus-input" value="0" min="0" onchange="HR.updatePayrollTotals()">
                    </td>
                    <td class="px-4 py-3">
                        <input type="number" class="w-full px-2 py-1 border ${deductionStyle} rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right deduction-input" value="${totalAdvance}" min="0" onchange="HR.updatePayrollTotals()">
                        ${totalAdvance > 0 ? `<div class="text-xs text-amber-600 mt-1">Adelanto pendiente</div>` : ''}
                    </td>
                    <td class="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 total-cell">
                        $${(parseFloat(emp.salary) - totalAdvance).toLocaleString()}
                    </td>
                </tr>
                `;
            }).join('');

            this.updatePayrollTotals();
        };

        const updatePeriodText = (dateString) => {
            if (!dateString) return;
            const [y, m, d] = dateString.split('-').map(Number);
            const date = new Date(y, m - 1, d);
            if (monthSpan) monthSpan.textContent = `${months[date.getMonth()]} ${date.getFullYear()}`;

            // Re-render rows when date changes logic
            renderPayrollRows(dateString);
        };

        if (dateInput) {
            // Set default date to NOW if empty
            const now = new Date();
            // Adjust to local timezone for default value
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            const dateStr = now.toISOString().split('T')[0];

            if (!dateInput.value) {
                dateInput.value = dateStr;
            }

            dateInput.onchange = (e) => updatePeriodText(e.target.value);
            // Trigger update immediately
            updatePeriodText(dateInput.value);
        } else {
            // Fallback if no input found (shouldn't happen based on known HTML)
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            renderPayrollRows(now.toISOString().split('T')[0]);
        }

        modal.classList.remove('hidden');
    },

    updatePayrollTotals() {
        const rows = document.querySelectorAll('#payroll-generation-tbody tr');
        let grandTotal = 0;

        rows.forEach(row => {
            const salary = parseFloat(row.querySelector('.salary-input').value) || 0;
            const bonus = parseFloat(row.querySelector('.bonus-input').value) || 0;
            const deduction = parseFloat(row.querySelector('.deduction-input').value) || 0;
            const total = salary + bonus - deduction;

            row.querySelector('.total-cell').textContent = `$${total.toLocaleString()}`;
            grandTotal += total;
        });

        const grandTotalEl = document.getElementById('payroll-grand-total');
        if (grandTotalEl) grandTotalEl.textContent = `$${grandTotal.toLocaleString()}`;
    },

    async savePayroll() {
        if (!confirm('¿Generar nómina? Esto aplicará los descuentos de adelantos.')) return;

        const rows = document.querySelectorAll('#payroll-generation-tbody tr');
        const employeesData = [];
        let totalPayroll = 0;

        rows.forEach(row => {
            const id = parseInt(row.dataset.employeeId);
            const emp = this.currentEmployees.find(e => e.id === id);
            const salary = parseFloat(row.querySelector('.salary-input').value) || 0;
            const bonus = parseFloat(row.querySelector('.bonus-input').value) || 0;
            const deduction = parseFloat(row.querySelector('.deduction-input').value) || 0;
            const total = salary + bonus - deduction;

            // Determine which advances are being paid off
            let deductedAdvanceIds = [];

            // Use stored pending advances instead of dataset for reliability
            if (this.pendingAdvances) {
                const employeeAdvances = this.pendingAdvances.filter(a => a.employee_id === emp.id);
                const totalAdvanceAmount = employeeAdvances.reduce((s, a) => s + parseFloat(a.amount), 0);

                // If deduction covers the total advance amount (allowing for small float diff)
                // e.g., if deduction is 100 and total is 100.00001
                if (employeeAdvances.length > 0 && deduction >= (totalAdvanceAmount - 0.01)) {
                    deductedAdvanceIds = employeeAdvances.map(a => a.id);
                }
            }

            employeesData.push({
                id: emp.id,
                name: emp.name,
                baseSalary: salary,
                bonus: bonus,
                deduction: deduction,
                total: total,
                deducted_advance_ids: deductedAdvanceIds
            });
            totalPayroll += total;
        });

        const dateInput = document.getElementById('payroll-date');
        const selectedDateStr = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
        const [sYear, sMonth, sDay] = selectedDateStr.split('-').map(Number);
        const selectedDate = new Date(sYear, sMonth - 1, sDay);

        const payrollData = {
            month: selectedDate.getMonth(),
            year: selectedDate.getFullYear(),
            employees: employeesData,
            total: totalPayroll,
            generated_date: selectedDateStr
        };

        try {
            // Save Payroll
            const response = await fetch('/api/payrolls', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payrollData)
            });

            if (!response.ok) throw new Error('Error saving payroll');

            Toast.success(this.currentEditingId ? 'Nómina actualizada' : 'Nómina generada exitosamente');
            document.getElementById('payroll-modal').classList.add('hidden');
            this.currentEditingId = null;
            this.loadPayrolls();
            this.loadAdvances();
        } catch (error) {
            console.error(error);
            Toast.error('Error al guardar nómina');
        }
    },

    viewPayrollDetails(id) {
        const payroll = this.currentPayrolls.find(p => p.id === id);
        if (!payroll) return;

        const modal = document.getElementById('payroll-details-modal');
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        document.getElementById('payroll-details-title').textContent = `Nómina ${months[payroll.month]} ${payroll.year}`;

        document.getElementById('payroll-details-tbody').innerHTML = payroll.employees.map(emp => `
            <tr class="border-b border-gray-100 dark:border-gray-700">
                <td class="px-4 py-3 text-gray-900 dark:text-white">${emp.name}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400">$${emp.baseSalary.toLocaleString()}</td>
                <td class="px-4 py-3 text-green-600 dark:text-green-400">+$${(emp.bonus || 0).toLocaleString()}</td>
                <td class="px-4 py-3 text-red-600 dark:text-red-400">-$${(emp.deduction || 0).toLocaleString()}</td>
                <td class="px-4 py-3 font-bold text-gray-900 dark:text-white">$${emp.total.toLocaleString()}</td>
            </tr>
        `).join('');

        modal.classList.remove('hidden');
    },

    updatePayrollSummary() {
        let year = new Date().getFullYear();
        const globalYearInput = document.getElementById('global-year');

        if (globalYearInput && globalYearInput.value) {
            year = parseInt(globalYearInput.value);
        }

        const totalYear = this.currentPayrolls
            .filter(p => p.year === year)
            .reduce((sum, p) => sum + parseFloat(p.total), 0);

        const el = document.getElementById('total-paid-year');
        if (el) {
            el.textContent = `$${totalYear.toLocaleString()}`;

            // Update label to reflect selected year
            const labelEl = el.previousElementSibling;
            if (labelEl && labelEl.tagName === 'H3') {
                labelEl.textContent = `Total Pagado (${year})`;
            }
        }
    },

    loadPayrolls() {
        fetch('/api/payrolls')
            .then(r => r.json())
            .then(data => {
                this.currentPayrolls = data;
                // Initial render with current filter
                const m = document.getElementById('global-month')?.value;
                const y = document.getElementById('global-year')?.value;
                this.renderPayrolls(m, y);
                this.updatePayrollSummary();
            });
    },

    async deletePayroll(id) {
        if (!confirm('¿Eliminar este registro de nómina? Esta acción no se puede deshacer.')) return;
        try {
            const response = await fetch(`/api/payrolls/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok) throw new Error('Error deleting');

            Toast.success('Nómina eliminada');
            this.loadPayrolls();
        } catch (error) {
            console.error(error);
            Toast.error('Error al eliminar nómina');
        }
    },

    editPayroll(id) {
        this.openPayrollModal(id);
    },

    renderPayrolls(filterMonth = null, filterYear = null) {
        const tbody = document.getElementById('payrolls-tbody');
        if (!tbody) return;

        // If no filter arguments, try to read from DOM
        if (filterMonth === null || filterYear === null) {
            filterMonth = document.getElementById('global-month')?.value;
            filterYear = document.getElementById('global-year')?.value;
        }

        // Apply Filter if values exist
        let displayPayrolls = this.currentPayrolls;
        if (filterMonth !== undefined && filterYear !== undefined) {
            const m = parseInt(filterMonth);
            const y = parseInt(filterYear);
            displayPayrolls = this.currentPayrolls.filter(p => p.month === m && p.year === y);
        }

        if (displayPayrolls.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">No hay nóminas para este periodo</td></tr>`;
            return;
        }

        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        tbody.innerHTML = displayPayrolls.map(payroll => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${months[payroll.month]} ${payroll.year}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${payroll.employees.length} empleados</td>
                <td class="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">$${parseFloat(payroll.total).toLocaleString()}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${new Date(payroll.generated_date || payroll.created_at).toLocaleDateString()}</td>
                <td class="px-6 py-4 flex items-center gap-1">
                     <button onclick="HR.viewPayrollDetails(${payroll.id})" class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Ver Detalles">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                     </button>
                     <button onclick="HR.editPayroll(${payroll.id})" class="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Editar Nómina">
                           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                     </button>
                     <button onclick="HR.deletePayroll(${payroll.id})" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Nómina">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                     </button>
                </td>
            </tr>
        `).join('');
    }
};
