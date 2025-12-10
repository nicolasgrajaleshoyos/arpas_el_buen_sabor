// Dashboard Module
const Dashboard = {
    charts: {
        sales: null,
        distribution: null
    },

    init() {
        console.log('Inicializando Dashboard...');
        this.setupEventListeners();
        this.loadData();
    },

    setupEventListeners() {
        // Listen for Global Period changes
        window.addEventListener('period-changed', (e) => {
            this.loadData();
        });
    },

    async loadData() {
        try {
            // Fetch all data in parallel
            const [salesRes, employeesRes, payrollsRes] = await Promise.all([
                fetch('/api/sales'),
                fetch('/api/employees'),
                fetch('/api/payrolls')
            ]);

            const sales = await salesRes.json();
            const employees = await employeesRes.json();
            const payrolls = await payrollsRes.json();

            // Store for local usage if needed, or just pass to update functions
            this.salesData = sales;
            this.employeesData = employees;
            this.payrollsData = payrolls;

            this.updateKPIs();
            this.updateCharts();

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Fallback to local storage if API fails? Or just show error?
            // For now, let's try to load from DB.js as fallback or mixed? 
            // Better to stick to API if we committed to it.
        }
    },

    updateKPIs() {
        const allSales = this.salesData || [];
        const allPayrolls = this.payrollsData || [];

        // Filter Data by Global Period
        let filteredSales = allSales;
        let filteredPayrolls = allPayrolls;

        if (typeof GlobalPeriod !== 'undefined') {
            filteredSales = allSales.filter(s => {
                const date = new Date(s.sale_date || s.date); // Handle different field names
                return GlobalPeriod.isDateInPeriod(date);
            });

            filteredPayrolls = allPayrolls.filter(p => {
                // Payrolls might have month/year fields directly
                const m = parseInt(document.getElementById('global-month').value);
                const y = parseInt(document.getElementById('global-year').value);
                return p.month == m && p.year == y;
            });
        }

        // 1. Calculate Total Sales (Revenue)
        // Valid sales: status != 'returned'
        const validSales = filteredSales.filter(s => s.status !== 'returned');
        const revenue = validSales.reduce((sum, s) => sum + parseFloat(s.total), 0);

        // 2. Calculate Returns (Losses)
        const returns = filteredSales.filter(s => s.status === 'returned');
        const returnLoss = returns.reduce((sum, s) => sum + parseFloat(s.total), 0);

        // 3. Operating Expenses = Payroll + Returns (approx)
        const payrollCost = filteredPayrolls.reduce((sum, p) => sum + parseFloat(p.total), 0);
        const totalExpenses = payrollCost + returnLoss;

        // 4. Net Profit
        const netProfit = revenue - totalExpenses;

        // Update DOM
        this.setKPI('kpi-sales', revenue);
        this.setKPI('kpi-expenses', totalExpenses);
        this.setKPI('kpi-profit', netProfit);
        this.setKPI('kpi-returns', returnLoss);

        // Color profit
        const profitEl = document.getElementById('kpi-profit');
        if (profitEl) {
            profitEl.className = `text-2xl font-bold mt-2 ${netProfit >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600'}`;
        }
    },

    setKPI(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = '$' + value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    },

    updateCharts() {
        this.updateSalesChart();
        this.updateReturnsChart();
    },

    getMonthlyData(type = 'sales') {
        const year = parseInt(document.getElementById('global-year').value);
        const data = new Array(12).fill(0);

        // Fetch all relevant data
        // Fetch all relevant data
        const allItems = this.salesData || [];

        allItems.forEach(item => {
            const date = new Date(item.sale_date || item.date);
            if (date.getFullYear() === year) {
                const month = date.getMonth(); // 0-11

                if (type === 'sales' && item.status !== 'returned') {
                    data[month] += parseFloat(item.total);
                } else if (type === 'returns' && item.status === 'returned') {
                    data[month] += parseFloat(item.total);
                }
            }
        });

        return data;
    },

    updateSalesChart() {
        const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const data = this.getMonthlyData('sales');

        if (this.charts.sales) ChartUtils.destroyChart(this.charts.sales);
        this.charts.sales = ChartUtils.createBarChart('sales-chart', labels, data, 'Ventas del Año');
    },

    updateReturnsChart() {
        const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const data = this.getMonthlyData('returns');

        // We can reusecreateBarChart but maybe with a red color theme?
        // ChartUtils doesn't accept color param yet, but let's try or modify ChartUtils later if needed.
        // For now, standard green is fine or I can just use distribution chart ID for this if I replace it.
        // User asked for "Returns per Month", replacing Distribution? Or "add"?
        // The layout has 2 slots. Let's replace "Distribution" with "Returns Trend" as requested contextually.
        // I need to rename the canvas ID in render() or just use 'distribution-chart' ID but render a bar chart.

        if (this.charts.distribution) ChartUtils.destroyChart(this.charts.distribution);
        // Using createBarChart for returns too
        this.charts.distribution = ChartUtils.createBarChart('distribution-chart', labels, data, 'Devoluciones del Año');

        // Hack to change color if possible after creation, or just accept green for now.
        // To make it red, I should ideally update ChartUtils or manually create chart here.
        if (this.charts.distribution && this.charts.distribution.data.datasets[0]) {
            this.charts.distribution.data.datasets[0].backgroundColor = 'rgba(239, 68, 68, 0.8)'; // Red
            this.charts.distribution.data.datasets[0].borderColor = 'rgba(239, 68, 68, 1)';
            this.charts.distribution.update();
        }
    }
};


