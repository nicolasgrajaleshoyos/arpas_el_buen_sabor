// Human Resources Module
const HR = {
    currentEmployees: [],
    currentPayrolls: [],

    init() {
        console.log('Inicializando Recursos Humanos...');
        this.loadEmployees();
        this.loadPayrolls();
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Tab switching
        const tabs = document.querySelectorAll('[data-hr-tab]');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-hr-tab');
                this.switchTab(tabName);
            });
        });

        // Add employee button
        const addBtn = document.getElementById('add-employee-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showEmployeeModal());
        }

        // Generate payroll button
        const generateBtn = document.getElementById('generate-payroll-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generatePayroll());
        }
    },

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('[data-hr-tab]').forEach(tab => {
            tab.classList.remove('border-emerald-500', 'text-emerald-600');
            tab.classList.add('border-transparent', 'text-gray-600');
        });

        const activeTab = document.querySelector(`[data-hr-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('border-emerald-500', 'text-emerald-600');
            activeTab.classList.remove('border-transparent', 'text-gray-600');
        }

        // Update content
        document.querySelectorAll('[data-hr-tab-content]').forEach(content => {
            content.classList.add('hidden');
        });

        const activeContent = document.querySelector(`[data-hr-tab-content="${tabName}"]`);
        if (activeContent) {
            activeContent.classList.remove('hidden');
        }
    },

    loadEmployees() {
        this.currentEmployees = Database.getAll('employees');
        this.renderEmployees();
    },

    loadPayrolls() {
        this.currentPayrolls = Database.getAll('payrolls').sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );
        this.renderPayrolls();
    },

    renderEmployees() {
        const container = document.getElementById('employees-container');
        if (!container) return;

        container.innerHTML = this.currentEmployees.map(employee => `
            <div class="bg-white rounded-xl shadow-soft p-6 card-hover">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span class="text-emerald-600 font-semibold text-lg">${employee.name.charAt(0)}</span>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">${employee.name}</h3>
                            <p class="text-sm text-gray-600">${employee.position}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="HR.editEmployee(${employee.id})" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="HR.deleteEmployee(${employee.id})" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Salario:</span>
                        <span class="font-semibold text-gray-900">$${employee.salary.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Fecha de Ingreso:</span>
                        <span class="text-gray-900">${new Date(employee.hireDate).toLocaleDateString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Teléfono:</span>
                        <span class="text-gray-900">${employee.phone}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    generatePayroll() {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        // Check if payroll already exists for this month
        const existingPayroll = this.currentPayrolls.find(p => {
            const pDate = new Date(p.date);
            return pDate.getMonth() === month && pDate.getFullYear() === year;
        });

        if (existingPayroll) {
            if (!confirm('Ya existe una nómina para este mes. ¿Deseas generar una nueva?')) {
                return;
            }
        }

        const employees = Database.getAll('employees');
        const total = employees.reduce((sum, e) => sum + e.salary, 0);

        const payroll = {
            month: month,
            year: year,
            employees: employees.map(e => ({
                id: e.id,
                name: e.name,
                position: e.position,
                salary: e.salary
            })),
            total: total,
            date: now.toISOString()
        };

        Database.add('payrolls', payroll);
        Toast.success('Nómina generada exitosamente');

        this.loadPayrolls();
    },

    renderPayrolls() {
        const tbody = document.getElementById('payrolls-tbody');
        if (!tbody) return;

        if (this.currentPayrolls.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-8 text-gray-500">
                        No hay nóminas generadas
                    </td>
                </tr>
            `;
            return;
        }

        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        tbody.innerHTML = this.currentPayrolls.map(payroll => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900">${months[payroll.month]} ${payroll.year}</td>
                <td class="px-6 py-4 text-gray-600">${payroll.employees.length} empleados</td>
                <td class="px-6 py-4 font-semibold text-emerald-600">$${payroll.total.toLocaleString()}</td>
                <td class="px-6 py-4 text-gray-600">${new Date(payroll.date).toLocaleDateString()}</td>
            </tr>
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
            document.getElementById('employee-hire-date').value = employee.hireDate;
            document.getElementById('employee-phone').value = employee.phone;
            document.getElementById('employee-email').value = employee.email;
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

    saveEmployee(id) {
        const employeeData = {
            name: document.getElementById('employee-name').value.trim(),
            position: document.getElementById('employee-position').value.trim(),
            salary: parseFloat(document.getElementById('employee-salary').value),
            hireDate: document.getElementById('employee-hire-date').value,
            phone: document.getElementById('employee-phone').value.trim(),
            email: document.getElementById('employee-email').value.trim()
        };

        if (!employeeData.name || !employeeData.position || !employeeData.salary) {
            Toast.error('Completa los campos requeridos');
            return;
        }

        if (id) {
            Database.update('employees', id, employeeData);
            Toast.success('Empleado actualizado exitosamente');
        } else {
            Database.add('employees', employeeData);
            Toast.success('Empleado agregado exitosamente');
        }

        this.closeEmployeeModal();
        this.loadEmployees();
    },

    editEmployee(id) {
        const employee = Database.getById('employees', id);
        if (employee) {
            this.showEmployeeModal(employee);
        }
    },

    deleteEmployee(id) {
        if (confirm('¿Estás seguro de eliminar este empleado?')) {
            Database.delete('employees', id);
            Toast.success('Empleado eliminado exitosamente');
            this.loadEmployees();
        }
    },

    render() {
        return `
            <div class="space-y-6">
                <!-- Header -->
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Recursos Humanos</h1>
                    <p class="text-gray-600 mt-1">Gestión de empleados y nómina</p>
                </div>
                
                <!-- Tabs -->
                <div class="border-b border-gray-200">
                    <nav class="flex gap-8">
                        <button data-hr-tab="employees" class="py-4 px-1 border-b-2 border-emerald-500 text-emerald-600 font-medium">
                            Empleados
                        </button>
                        <button data-hr-tab="payroll" class="py-4 px-1 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium">
                            Nómina
                        </button>
                    </nav>
                </div>
                
                <!-- Employees Tab -->
                <div data-hr-tab-content="employees">
                    <div class="mb-6">
                        <button id="add-employee-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Nuevo Empleado
                        </button>
                    </div>
                    
                    <div id="employees-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Employees will be loaded here -->
                    </div>
                </div>
                
                <!-- Payroll Tab -->
                <div data-hr-tab-content="payroll" class="hidden">
                    <div class="mb-6">
                        <button id="generate-payroll-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Generar Nómina del Mes
                        </button>
                    </div>
                    
                    <div class="bg-white rounded-xl shadow-soft overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr>
                                        <th class="text-left">Período</th>
                                        <th class="text-left">Empleados</th>
                                        <th class="text-left">Total</th>
                                        <th class="text-left">Fecha de Generación</th>
                                    </tr>
                                </thead>
                                <tbody id="payrolls-tbody">
                                    <!-- Payrolls will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Employee Modal -->
            <div id="employee-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 slide-in">
                    <div class="flex items-center justify-between mb-6">
                        <h2 id="employee-modal-title" class="text-2xl font-bold text-gray-900">Nuevo Empleado</h2>
                        <button onclick="HR.closeEmployeeModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="employee-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                            <input type="text" id="employee-name" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                            <input type="text" id="employee-position" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Salario</label>
                            <input type="number" id="employee-salary" min="0" step="1000" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Ingreso</label>
                            <input type="date" id="employee-hire-date" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                            <input type="tel" id="employee-phone" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" id="employee-email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        </div>
                        
                        <div class="flex gap-3 pt-4">
                            <button type="button" onclick="HR.closeEmployeeModal()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
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
