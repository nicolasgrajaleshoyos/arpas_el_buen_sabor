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
            generateBtn.addEventListener('click', () => this.openPayrollModal());
        }
    },

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('[data-hr-tab]').forEach(tab => {
            tab.classList.remove('border-emerald-500', 'text-emerald-600', 'dark:text-emerald-400');
            tab.classList.add('border-transparent', 'text-gray-600', 'dark:text-gray-400');
        });

        const activeTab = document.querySelector(`[data-hr-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('border-emerald-500', 'text-emerald-600', 'dark:text-emerald-400');
            activeTab.classList.remove('border-transparent', 'text-gray-600', 'dark:text-gray-400');
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
                        <span class="text-gray-600 dark:text-gray-400">Salario:</span>
                        <span class="font-semibold text-gray-900 dark:text-white">$${employee.salary.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-400">Fecha de Ingreso:</span>
                        <span class="text-gray-900 dark:text-white">${new Date(employee.hireDate).toLocaleDateString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-400">Teléfono:</span>
                        <span class="text-gray-900 dark:text-white">${employee.phone}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    openPayrollModal(payrollId = null) {
        const employees = Database.getAll('employees');
        if (employees.length === 0) {
            Toast.error('No hay empleados registrados');
            return;
        }

        this.editingPayrollId = payrollId;
        const modal = document.getElementById('payroll-modal');
        const tbody = document.getElementById('payroll-generation-tbody');
        const monthSpan = document.getElementById('payroll-month');
        const title = document.querySelector('#payroll-modal h2');

        let payrollToEdit = null;
        if (payrollId) {
            payrollToEdit = Database.getById('payrolls', payrollId);
            if (title) title.textContent = 'Editar Nómina';
        } else {
            if (title) title.textContent = 'Generar Nómina';
        }

        const now = payrollToEdit ? new Date(payrollToEdit.date) : new Date();
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        if (monthSpan) monthSpan.textContent = `${months[now.getMonth()]} ${now.getFullYear()}`;

        tbody.innerHTML = employees.map(emp => {
            let bonus = 0;
            let deduction = 0;
            let currentSalary = emp.salary;
            let currentName = emp.name;

            if (payrollToEdit) {
                const empData = payrollToEdit.employees.find(e => e.id === emp.id);
                if (empData) {
                    bonus = empData.bonus || 0;
                    deduction = empData.deduction || 0;
                    currentSalary = empData.baseSalary || emp.salary;
                    currentName = empData.name || emp.name;
                }
            }

            return `
            <tr data-employee-id="${emp.id}">
                <td class="px-4 py-3">
                    <input type="text" class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium name-input" value="${currentName}">
                </td>
                <td class="px-4 py-3">
                    <input type="number" class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right salary-input" value="${currentSalary}" min="0" onchange="HR.updatePayrollTotals()">
                </td>
                <td class="px-4 py-3">
                    <input type="number" class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right bonus-input" value="${bonus}" min="0" onchange="HR.updatePayrollTotals()">
                </td>
                <td class="px-4 py-3">
                    <input type="number" class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right deduction-input" value="${deduction}" min="0" onchange="HR.updatePayrollTotals()">
                </td>
                <td class="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 total-cell">
                    $${(currentSalary + bonus - deduction).toLocaleString()}
                </td>
            </tr>
            `;
        }).join('');

        this.updatePayrollTotals();
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

    savePayroll() {
        const now = new Date();
        let month = now.getMonth();
        let year = now.getFullYear();
        let date = now.toISOString();

        if (this.editingPayrollId) {
            const existing = Database.getById('payrolls', this.editingPayrollId);
            if (existing) {
                month = existing.month;
                year = existing.year;
                date = existing.date;
            }
        } else {
            const existingPayroll = this.currentPayrolls.find(p => {
                const pDate = new Date(p.date);
                return pDate.getMonth() === month && pDate.getFullYear() === year;
            });

            if (existingPayroll) {
                if (!confirm('Ya existe una nómina para este mes. ¿Deseas sobrescribirla?')) {
                    return;
                }
                Database.delete('payrolls', existingPayroll.id);
            }
        }

        const rows = document.querySelectorAll('#payroll-generation-tbody tr');
        const employeesData = [];
        let totalPayroll = 0;

        rows.forEach(row => {
            const id = parseInt(row.dataset.employeeId);
            const emp = Database.getById('employees', id);
            const name = row.querySelector('.name-input').value.trim() || emp.name;
            const salary = parseFloat(row.querySelector('.salary-input').value) || 0;
            const bonus = parseFloat(row.querySelector('.bonus-input').value) || 0;
            const deduction = parseFloat(row.querySelector('.deduction-input').value) || 0;
            const total = salary + bonus - deduction;

            employeesData.push({
                id: emp.id,
                name: name,
                position: emp.position,
                baseSalary: salary,
                bonus: bonus,
                deduction: deduction,
                total: total
            });

            totalPayroll += total;
        });

        const payroll = {
            month: month,
            year: year,
            employees: employeesData,
            total: totalPayroll,
            date: date
        };

        if (this.editingPayrollId) {
            Database.update('payrolls', this.editingPayrollId, payroll);
            Toast.success('Nómina actualizada exitosamente');
        } else {
            Database.add('payrolls', payroll);
            Toast.success('Nómina guardada exitosamente');
        }

        document.getElementById('payroll-modal').classList.add('hidden');
        this.editingPayrollId = null;
        this.loadPayrolls();
    },

    viewPayrollDetails(id) {
        const payroll = Database.getById('payrolls', id);
        if (!payroll) return;

        const modal = document.getElementById('payroll-details-modal');
        const tbody = document.getElementById('payroll-details-tbody');
        const title = document.getElementById('payroll-details-title');
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        title.textContent = `Nómina ${months[payroll.month]} ${payroll.year}`;

        tbody.innerHTML = payroll.employees.map(emp => `
            <tr class="border-b border-gray-100 dark:border-gray-700">
                <td class="px-4 py-3 text-gray-900 dark:text-white">${emp.name}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400">$${emp.baseSalary.toLocaleString()}</td>
                <td class="px-4 py-3 text-green-600 dark:text-green-400">+$${(emp.bonus || 0).toLocaleString()}</td>
                <td class="px-4 py-3 text-red-600 dark:text-red-400">-$${(emp.deduction || 0).toLocaleString()}</td>
                <td class="px-4 py-3 font-bold text-gray-900 dark:text-white">$${emp.total.toLocaleString()}</td>
            </tr>
        `).join('');

        // Add total row
        tbody.innerHTML += `
            <tr class="bg-gray-50 dark:bg-gray-700/50 font-bold">
                <td colspan="4" class="px-4 py-3 text-right text-gray-900 dark:text-white">TOTAL PAGADO:</td>
                <td class="px-4 py-3 text-emerald-600 dark:text-emerald-400">$${payroll.total.toLocaleString()}</td>
            </tr>
        `;

        modal.classList.remove('hidden');
    },

    deletePayroll(id) {
        if (confirm('¿Estás seguro de eliminar esta nómina? Esta acción no se puede deshacer.')) {
            Database.delete('payrolls', id);
            Toast.success('Nómina eliminada exitosamente');
            this.loadPayrolls();
        }
    },

    renderPayrolls() {
        const tbody = document.getElementById('payrolls-tbody');
        if (!tbody) return;

        if (this.currentPayrolls.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-8 text-gray-500 dark:text-gray-400">
                        No hay nóminas generadas
                    </td>
                </tr>
            `;
            return;
        }

        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        tbody.innerHTML = this.currentPayrolls.map(payroll => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${months[payroll.month]} ${payroll.year}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${payroll.employees.length} empleados</td>
                <td class="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">$${payroll.total.toLocaleString()}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${new Date(payroll.date).toLocaleDateString()}</td>
                <td class="px-6 py-4">
                    <div class="flex gap-2">
                        <button onclick="HR.editPayroll(${payroll.id})" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="HR.viewPayrollDetails(${payroll.id})" class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Ver Detalles">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                        <button onclick="HR.deletePayroll(${payroll.id})" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Update Summary Cards
        this.updatePayrollSummary();
    },

    editPayroll(id) {
        Swal.fire({
            title: 'Contraseña de Administrador',
            input: 'password',
            inputAttributes: {
                autocapitalize: 'off',
                placeholder: 'Ingrese contraseña'
            },
            showCancelButton: true,
            confirmButtonText: 'Editar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            showLoaderOnConfirm: true,
            preConfirm: (password) => {
                // For demo purposes, password is 'admin' or '1234'
                // In production, this should check against a secure store
                if (password === 'admin' || password === '1234') {
                    return true;
                } else {
                    Swal.showValidationMessage('Contraseña incorrecta');
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                this.openPayrollModal(id);
            }
        });
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
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Recursos Humanos</h1>
                    <p class="text-gray-600 dark:text-gray-400 mt-1">Gestión de empleados y nómina</p>
                </div>
                
                <!-- Tabs -->
                <div class="border-b border-gray-200 dark:border-gray-700">
                    <nav class="flex gap-8">
                        <button data-hr-tab="employees" class="py-4 px-1 border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-medium transition-colors">
                            Empleados
                        </button>
                        <button data-hr-tab="payroll" class="py-4 px-1 border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-soft transition-colors">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Pagado (Año Actual)</h3>
                <p id="total-paid-year" class="text-2xl font-bold text-gray-900 dark:text-white">$0</p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-soft transition-colors">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Acciones Rápidas</h3>
                        <p class="text-xs text-gray-400">Generar nueva nómina</p>
                    </div>
                    <button id="generate-payroll-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Generar Nómina
                    </button>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden transition-colors">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr>
                            <th class="text-left">Período</th>
                            <th class="text-left">Empleados</th>
                            <th class="text-left">Total</th>
                            <th class="text-left">Fecha de Generación</th>
                            <th class="text-left">Acciones</th>
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
            </div>

            <!-- Payroll Generation Modal -->
            <div id="payroll-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full p-6 slide-in transition-colors max-h-[90vh] overflow-y-auto">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Generar Nómina</h2>
                            <p id="payroll-month" class="text-emerald-600 dark:text-emerald-400 font-medium"></p>
                        </div>
                        <button onclick="document.getElementById('payroll-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <div class="overflow-x-auto mb-6">
                        <table class="w-full">
                            <thead>
                                <tr class="bg-gray-50 dark:bg-gray-700/50">
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Empleado</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Salario Base</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 w-32">Bonos</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 w-32">Deducciones</th>
                                    <th class="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Total</th>
                                </tr>
                            </thead>
                            <tbody id="payroll-generation-tbody" class="divide-y divide-gray-100 dark:divide-gray-700">
                                <!-- Rows generated by JS -->
                            </tbody>
                            <tfoot>
                                <tr class="bg-gray-50 dark:bg-gray-700/50 font-bold">
                                    <td colspan="4" class="px-4 py-3 text-right text-gray-900 dark:text-white">TOTAL A PAGAR:</td>
                                    <td id="payroll-grand-total" class="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">$0</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div class="flex justify-end gap-3">
                        <button onclick="document.getElementById('payroll-modal').classList.add('hidden')" class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
                            Cancelar
                        </button>
                        <button onclick="HR.savePayroll()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                            Guardar y Generar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Payroll Details Modal -->
            <div id="payroll-details-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full p-6 slide-in transition-colors max-h-[90vh] overflow-y-auto">
                    <div class="flex items-center justify-between mb-6">
                        <h2 id="payroll-details-title" class="text-2xl font-bold text-gray-900 dark:text-white">Detalles de Nómina</h2>
                        <button onclick="document.getElementById('payroll-details-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="bg-gray-50 dark:bg-gray-700/50">
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Empleado</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Base</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Bonos</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Deducciones</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Neto</th>
                                </tr>
                            </thead>
                            <tbody id="payroll-details-tbody" class="divide-y divide-gray-100 dark:divide-gray-700">
                                <!-- Details generated by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Employee Modal -->
    <div id="employee-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 slide-in transition-colors">
            <div class="flex items-center justify-between mb-6">
                <h2 id="employee-modal-title" class="text-2xl font-bold text-gray-900 dark:text-white">Nuevo Empleado</h2>
                <button onclick="HR.closeEmployeeModal()" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
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

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Salario</label>
                    <input type="number" id="employee-salary" min="0" step="1000" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Ingreso</label>
                    <input type="date" id="employee-hire-date" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
                    <input type="tel" id="employee-phone" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input type="email" id="employee-email" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                </div>

                <div class="flex gap-3 pt-4">
                    <button type="button" onclick="HR.closeEmployeeModal()" class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
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
    },

    updatePayrollSummary() {
        const currentYear = new Date().getFullYear();
        const totalYear = this.currentPayrolls
            .filter(p => p.year === currentYear)
            .reduce((sum, p) => sum + p.total, 0);

        const summaryElement = document.getElementById('total-paid-year');
        if (summaryElement) {
            summaryElement.textContent = `$${totalYear.toLocaleString()} `;
        }
    }
};
