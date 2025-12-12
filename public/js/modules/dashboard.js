// Dashboard Module
const Dashboard = {
    charts: {
        sales: null,
        distribution: null
    },

    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),

    init() {
        console.log('Inicializando Dashboard...');
        this.setupEventListeners();
        this.loadData();
    },

    setupEventListeners() {
        // Listen to Global Period Filter changes
        window.addEventListener('period-changed', (event) => {
            this.currentMonth = event.detail.month;
            this.currentYear = event.detail.year;
            this.loadData();
        });
    },

    async loadData() {
        try {
            // Get current filter values either from GlobalPeriod (via DOM if possible) or use tracked state
            // If the global select exists, use it as source of truth
            const globalMonth = document.getElementById('global-month');
            const globalYear = document.getElementById('global-year');

            if (globalMonth) this.currentMonth = parseInt(globalMonth.value);
            if (globalYear) this.currentYear = parseInt(globalYear.value);

            const month = this.currentMonth;
            const year = this.currentYear;

            console.log(`Fetching dashboard data for ${month}/${year}`);

            const res = await fetch(`/api/dashboard/stats?month=${month}&year=${year}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!res.ok) {
                let errorMsg = 'Error en API';
                try {
                    const errJson = await res.json();
                    errorMsg = errJson.error || errJson.message || res.statusText;
                } catch (e) {
                    errorMsg = await res.text();
                }
                throw new Error(errorMsg);
            }

            const stats = await res.json();
            console.log('Dashboard Data:', stats);

            this.updateKPIs(stats);
            this.updateCharts(stats);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Show DETAILED error to user for debugging
            if (typeof Toast !== 'undefined') {
                Toast.error('Error: ' + error.message);
            }
        }
    },

    updateKPIs(stats) {
        // Helper to safely update text content
        const updateText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = '$' + parseFloat(value || 0).toLocaleString();
        };

        // Blade IDs: kpi-profit, kpi-sales, kpi-expenses, kpi-returns

        // 1. Sales
        updateText('kpi-sales', stats.monthlySales);

        // 2. Expenses (Using Operating Expenses from API: Payroll + Purchases)
        // Controller sends 'operatingExpenses' which is Payroll + Purchases
        const expenses = parseFloat(stats.operatingExpenses || 0);
        updateText('kpi-expenses', expenses);

        // 3. Returns
        const returns = parseFloat(stats.monthlyReturns || 0);
        updateText('kpi-returns', returns);

        // 4. Profit (Utilidad)
        // We prioritizing the calculated 'profit' from API which handles credit/etc correctly
        const profit = parseFloat(stats.profit || 0);

        const kpiProfit = document.getElementById('kpi-profit');
        if (kpiProfit) {
            // Clear previous content to allow HTML injection
            kpiProfit.innerHTML = '';

            // Main Amount
            const amountSpan = document.createElement('span');
            amountSpan.textContent = '$' + profit.toLocaleString();

            // Color Coding for Amount
            kpiProfit.className = 'font-bold text-3xl'; // Reset base classes
            if (profit < 0) {
                kpiProfit.classList.add('text-red-500');
            } else {
                kpiProfit.classList.add('text-emerald-500');
            }

            kpiProfit.appendChild(amountSpan);

            // Trend Indicator (Comparison with previous month)
            if (stats.profitTrend !== undefined) {
                const trendSpan = document.createElement('span');
                const isPositive = stats.profitIncreased;
                const trendValue = Math.abs(stats.profitTrend);

                trendSpan.className = `ml-3 text-sm font-medium px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`;

                // Arrow Icon + Text
                const arrow = isPositive ? '▲' : '▼';
                trendSpan.textContent = `${arrow} ${trendValue}%`;

                // Tooltip
                trendSpan.title = isPositive ? 'Aumento respecto al mes anterior' : 'Disminución respecto al mes anterior';

                kpiProfit.appendChild(trendSpan);
            }
        }

        // Remove references to non-existent IDs like kpi-inventory, kpi-products to prevent errors
    },

    updateCharts(stats) {
        this.updateSalesChart(stats);
        this.updateReturnsChart(stats);
    },

    updateSalesChart(stats) {
        const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const data = stats.charts.sales; // Array of 12 values

        // Destroy previous chart
        if (this.charts.sales) {
            ChartUtils.destroyChart(this.charts.sales);
        }

        // Create new chart
        this.charts.sales = ChartUtils.createBarChart('sales-chart', labels, data, 'Ventas Mensuales');
    },

    updateReturnsChart(stats) {
        const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const data = stats.charts.returns; // Array of 12 values

        // Destroy previous chart
        if (this.charts.distribution) {
            ChartUtils.destroyChart(this.charts.distribution);
        }

        // Create new chart
        this.charts.distribution = ChartUtils.createBarChart('distribution-chart', labels, data, 'Devoluciones Mensuales');
    },

    render() {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const currentYear = new Date().getFullYear();
        const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p class="text-gray-600 mt-1">Resumen general del negocio</p>
                    </div>
                    
                    <!-- Date Filters -->
                    <div class="flex gap-3">
                        <select id="month-select" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            ${months.map((month, index) =>
            `<option value="${index}" ${index === this.currentMonth ? 'selected' : ''}>${month}</option>`
        ).join('')}
                        </select>
                        
                        <select id="year-select" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            ${years.map(year =>
            `<option value="${year}" ${year === this.currentYear ? 'selected' : ''}>${year}</option>`
        ).join('')}
                        </select>
                    </div>
                </div>
                
                <!-- KPI Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- Inventory Value -->
                    <div class="bg-white rounded-xl shadow-soft p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600 font-medium">Valor Inventario</p>
                                <p id="kpi-inventory" class="text-2xl font-bold text-gray-900 mt-2">$0</p>
                            </div>
                            <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Monthly Sales -->
                    <div class="bg-white rounded-xl shadow-soft p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600 font-medium">Ventas del Mes</p>
                                <p id="kpi-sales" class="text-2xl font-bold text-gray-900 mt-2">$0</p>
                            </div>
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Monthly Payroll -->
                    <div class="bg-white rounded-xl shadow-soft p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600 font-medium">Nómina Mensual</p>
                                <p id="kpi-payroll" class="text-2xl font-bold text-gray-900 mt-2">$0</p>
                            </div>
                            <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Total Products -->
                    <div class="bg-white rounded-xl shadow-soft p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600 font-medium">Productos Únicos</p>
                                <p id="kpi-products" class="text-2xl font-bold text-gray-900 mt-2">0</p>
                            </div>
                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Charts -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Sales Chart -->
                    <div class="bg-white rounded-xl shadow-soft p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Ventas Diarias</h3>
                        <div class="chart-container">
                            <canvas id="sales-chart"></canvas>
                        </div>
                    </div>
                    
                    <!-- Distribution Chart -->
                    <div class="bg-white rounded-xl shadow-soft p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Distribución de Ventas</h3>
                        <div class="chart-container">
                            <canvas id="distribution-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
