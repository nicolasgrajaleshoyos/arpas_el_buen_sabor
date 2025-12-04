// Export Utilities - CSV Generation
const ExportUtils = {
    // Convert array of objects to CSV
    toCSV(data, filename = 'export.csv') {
        if (!data || data.length === 0) {
            Toast.warning('No hay datos para exportar');
            return;
        }

        // Get headers from first object
        const headers = Object.keys(data[0]);

        // Create CSV content
        let csv = headers.join(',') + '\n';

        data.forEach(row => {
            const values = headers.map(header => {
                let value = row[header];

                // Handle special characters and commas
                if (typeof value === 'string') {
                    value = value.replace(/"/g, '""');
                    if (value.includes(',') || value.includes('\n') || value.includes('"')) {
                        value = `"${value}"`;
                    }
                }

                return value;
            });

            csv += values.join(',') + '\n';
        });

        // Download file
        this.downloadFile(csv, filename, 'text/csv');
        Toast.success('Archivo exportado exitosamente');
    },

    // Download file
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    },

    // Export products
    exportProducts() {
        const products = Database.getAll('products');
        this.toCSV(products, `inventario_${this.getDateString()}.csv`);
    },

    // Export sales
    exportSales() {
        const sales = Database.getAll('sales');
        this.toCSV(sales, `ventas_${this.getDateString()}.csv`);
    },

    // Export suppliers
    exportSuppliers() {
        const suppliers = Database.getAll('suppliers');
        this.toCSV(suppliers, `proveedores_${this.getDateString()}.csv`);
    },

    // Export employees
    exportEmployees() {
        const employees = Database.getAll('employees');
        this.toCSV(employees, `empleados_${this.getDateString()}.csv`);
    },

    // Export raw materials
    exportRawMaterials() {
        const materials = Database.getAll('rawMaterials');
        this.toCSV(materials, `materia_prima_${this.getDateString()}.csv`);
    },

    // Get formatted date string
    getDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }
};
