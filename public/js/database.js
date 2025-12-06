// Database Layer - LocalStorage Management
const Database = {
    // Initialize database with default data
    init() {
        console.log('Inicializando base de datos...');

        // Check if database exists
        if (!localStorage.getItem('db_initialized')) {
            this.createDefaultData();
            localStorage.setItem('db_initialized', 'true');
            console.log('Base de datos inicializada con datos por defecto');
        }
    },

    // Create default data
    createDefaultData(includeSampleData = true) {
        // Default admin user - ALWAYS create this
        this.save('users', [{
            id: 1,
            username: 'admin',
            password: 'admin123', // In production, this should be hashed
            email: 'admin@arepas.com',
            role: 'admin',
            createdAt: new Date().toISOString()
        }]);

        // Initialize empty tables
        this.save('products', []);

        // Initialize sales with random data if requested
        this.save('sales', []);

        this.save('rawMaterials', []);
        this.save('materialTransactions', []);
        this.save('suppliers', []);
        this.save('employees', []);
        this.save('payrolls', []);

        // Only add sample data if requested
        if (includeSampleData) {
            // Sample products
            this.save('products', [
                { id: 1, name: 'Arepa de Queso', price: 3500, stock: 50, category: 'Clásicas', createdAt: new Date().toISOString() },
                { id: 2, name: 'Arepa de Huevo', price: 4000, stock: 30, category: 'Clásicas', createdAt: new Date().toISOString() },
                { id: 3, name: 'Arepa de Carne', price: 5500, stock: 25, category: 'Especiales', createdAt: new Date().toISOString() },
                { id: 4, name: 'Arepa de Pollo', price: 5000, stock: 35, category: 'Especiales', createdAt: new Date().toISOString() },
                { id: 5, name: 'Arepa Mixta', price: 6000, stock: 20, category: 'Premium', createdAt: new Date().toISOString() }
            ]);

            // Sample raw materials
            this.save('rawMaterials', [
                { id: 1, name: 'Harina de Maíz', unit: 'kg', stock: 100, minStock: 20, price: 2500, createdAt: new Date().toISOString() },
                { id: 2, name: 'Queso', unit: 'kg', stock: 50, minStock: 10, price: 15000, createdAt: new Date().toISOString() },
                { id: 3, name: 'Huevos', unit: 'unidad', stock: 200, minStock: 50, price: 500, createdAt: new Date().toISOString() },
                { id: 4, name: 'Carne Molida', unit: 'kg', stock: 30, minStock: 5, price: 18000, createdAt: new Date().toISOString() },
                { id: 5, name: 'Pollo', unit: 'kg', stock: 40, minStock: 8, price: 12000, createdAt: new Date().toISOString() }
            ]);

            // Sample suppliers
            this.save('suppliers', [
                {
                    id: 1,
                    name: 'Distribuidora El Maíz',
                    nit: '900123456-7',
                    phone: '3001234567',
                    email: 'contacto@elmaiz.com',
                    address: 'Calle 45 #23-12',
                    products: 'Harina de Maíz',
                    createdAt: new Date().toISOString()
                }
            ]);

            // Sample employees
            this.save('employees', [
                {
                    id: 1,
                    name: 'María González',
                    position: 'Cocinera',
                    salary: 1500000,
                    hireDate: '2023-01-15',
                    phone: '3101234567',
                    email: 'maria@arepas.com',
                    createdAt: new Date().toISOString()
                }
            ]);
        }
    }
    ,



    // Get all records from a table
    getAll(table) {
        const data = localStorage.getItem(table);
        return data ? JSON.parse(data) : [];
    },

    // Get single record by ID
    getById(table, id) {
        const data = this.getAll(table);
        return data.find(item => item.id === id);
    },

    // Save entire table
    save(table, data) {
        localStorage.setItem(table, JSON.stringify(data));
    },

    // Add new record
    add(table, record) {
        const data = this.getAll(table);

        // Generate ID
        const maxId = data.length > 0 ? Math.max(...data.map(item => item.id)) : 0;
        record.id = maxId + 1;
        record.createdAt = new Date().toISOString();

        data.push(record);
        this.save(table, data);

        return record;
    },

    // Update record
    update(table, id, updates) {
        const data = this.getAll(table);
        const index = data.findIndex(item => item.id === id);

        if (index !== -1) {
            data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(table, data);
            return data[index];
        }

        return null;
    },

    // Delete record
    delete(table, id) {
        const data = this.getAll(table);
        const filtered = data.filter(item => item.id !== id);
        this.save(table, filtered);
        return filtered.length < data.length;
    },

    // Query with filter
    query(table, filterFn) {
        const data = this.getAll(table);
        return data.filter(filterFn);
    },

    // Reset database
    reset() {
        const tables = ['users', 'products', 'sales', 'rawMaterials', 'materialTransactions', 'suppliers', 'employees', 'payrolls'];
        tables.forEach(table => localStorage.removeItem(table));
        localStorage.removeItem('db_initialized');
        localStorage.removeItem('session');

        // Re-initialize with clean data (only admin user, no sample data)
        this.createDefaultData(false);
        localStorage.setItem('db_initialized', 'true');
    },

    // Get statistics
    getStats() {
        const products = this.getAll('products');
        const sales = this.getAll('sales');
        const employees = this.getAll('employees');
        const rawMaterials = this.getAll('rawMaterials');

        // Calculate total inventory value
        const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

        // Calculate current month sales
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlySales = sales
            .filter(s => {
                const saleDate = new Date(s.date);
                return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
            })
            .reduce((sum, s) => sum + s.total, 0);

        // Calculate monthly payroll
        const monthlyPayroll = employees.reduce((sum, e) => sum + e.salary, 0);

        return {
            inventoryValue,
            monthlySales,
            monthlyPayroll,
            totalProducts: products.length,
            totalEmployees: employees.length,
            totalSuppliers: this.getAll('suppliers').length,
            lowStockItems: rawMaterials.filter(m => m.stock <= m.minStock).length
        };
    }
};
