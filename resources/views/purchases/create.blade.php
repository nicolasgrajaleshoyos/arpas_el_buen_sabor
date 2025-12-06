@extends('layouts.app')

@section('title', 'Nueva Compra - Arepas el Buen Sabor')

@section('content')
<div class="max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
        <div>
            <h2 class="text-3xl font-bold text-gray-800 dark:text-white">Registrar Compra</h2>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Ingresa los detalles de la nueva factura de compra.</p>
        </div>
        <a href="{{ route('purchases.index') }}" class="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
            <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Volver</span>
        </a>
    </div>

    @if(session('error'))
        <div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
                <strong class="font-bold">Error!</strong>
                <span class="block sm:inline">{{ session('error') }}</span>
            </div>
        </div>
    @endif

    @if ($errors->any())
        <div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl mb-6">
            <ul class="list-disc list-inside space-y-1">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('purchases.store') }}" method="POST" id="purchaseForm" class="space-y-6">
        @csrf

        <!-- General Info Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Información General
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Supplier -->
                <div class="space-y-2">
                    <label for="supplier_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Proveedor</label>
                    <div class="relative">
                        <select name="supplier_id" id="supplier_id" class="w-full pl-10 pr-4 py-3 rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-emerald-500 focus:ring-emerald-500 transition-shadow appearance-none" required>
                            <option value="">Seleccione un proveedor</option>
                            @foreach($suppliers as $supplier)
                                <option value="{{ $supplier->id }}" {{ old('supplier_id') == $supplier->id ? 'selected' : '' }}>{{ $supplier->name }}</option>
                            @endforeach
                        </select>
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                        </div>
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Reference Number -->
                <div class="space-y-2">
                    <label for="reference_number" class="block text-sm font-medium text-gray-700 dark:text-gray-300">No. Referencia / Factura</label>
                    <div class="relative">
                        <input type="text" name="reference_number" id="reference_number" value="{{ old('reference_number') }}" class="w-full pl-10 pr-4 py-3 rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-emerald-500 focus:ring-emerald-500 transition-shadow" placeholder="Ej: FAC-001" required>
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Date -->
                <div class="space-y-2">
                    <label for="purchase_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Compra</label>
                    <div class="relative">
                        <input type="date" name="purchase_date" id="purchase_date" value="{{ old('purchase_date', date('Y-m-d')) }}" class="w-full pl-10 pr-4 py-3 rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-emerald-500 focus:ring-emerald-500 transition-shadow" required>
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Items Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    Items de la Compra
                </h3>
                <button type="button" onclick="addItem()" class="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Agregar Item
                </button>
            </div>

            <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 dark:bg-gray-700/50">
                            <th class="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Materia Prima</th>
                            <th class="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Cantidad</th>
                            <th class="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40">Precio Unitario</th>
                            <th class="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40 text-right">Subtotal</th>
                            <th class="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-700" id="itemsContainer">
                        <!-- Items will be added here -->
                    </tbody>
                    <tfoot>
                        <tr class="bg-emerald-50/50 dark:bg-emerald-900/10">
                            <td colspan="3" class="py-4 px-4 text-right font-bold text-gray-700 dark:text-gray-300">Total Compra:</td>
                            <td class="py-4 px-4 text-right">
                                <span class="text-2xl font-bold text-emerald-600 dark:text-emerald-400" id="grandTotal">$0</span>
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div id="empty-state" class="hidden py-8 text-center text-gray-500 dark:text-gray-400">
                <p>No hay items agregados. Haz clic en "Agregar Item" para comenzar.</p>
            </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-4">
            <a href="{{ route('purchases.index') }}" class="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors shadow-sm">
                Cancelar
            </a>
            <button type="submit" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5">
                Guardar Compra
            </button>
        </div>
    </form>
</div>

@push('scripts')
<script>
    const allRawMaterials = @json($rawMaterials);
    let availableMaterials = [];
    let itemCount = 0;

    document.getElementById('supplier_id').addEventListener('change', function() {
        const supplierId = this.value;
        const itemsContainer = document.getElementById('itemsContainer');
        
        // Clear existing items
        itemsContainer.innerHTML = '';
        itemCount = 0;
        document.getElementById('grandTotal').textContent = '$0';
        checkEmptyState();

        if (supplierId) {
            // Filter materials for this supplier
            availableMaterials = allRawMaterials.filter(m => m.supplier_id == supplierId);
            
            if (availableMaterials.length === 0) {
                // Optional: Show message if no materials found for this supplier
                // alert('Este proveedor no tiene productos asignados.');
            } else {
                // Add first empty row
                addItem();
            }
        } else {
            availableMaterials = [];
        }
    });

    function addItem() {
        const supplierId = document.getElementById('supplier_id').value;
        if (!supplierId) {
            alert('Por favor seleccione un proveedor primero');
            return;
        }

        if (availableMaterials.length === 0) {
            alert('Este proveedor no tiene productos registrados para comprar.');
            return;
        }

        const container = document.getElementById('itemsContainer');
        const index = itemCount++;
        
        const row = document.createElement('tr');
        row.id = `item-${index}`;
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group';
        row.innerHTML = `
            <td class="py-3 px-4">
                <select name="items[${index}][raw_material_id]" class="w-full rounded-lg border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-emerald-500 focus:ring-emerald-500 text-sm py-2" required onchange="updatePrice(${index})">
                    <option value="">Seleccione...</option>
                    ${availableMaterials.map(m => `<option value="${m.id}" data-price="${m.price}">${m.name} (${m.unit})</option>`).join('')}
                </select>
            </td>
            <td class="py-3 px-4">
                <input type="number" name="items[${index}][quantity]" step="0.01" min="0.01" class="w-full rounded-lg border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-emerald-500 focus:ring-emerald-500 text-sm py-2" placeholder="0.00" required oninput="calculateRowTotal(${index})">
            </td>
            <td class="py-3 px-4">
                <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input type="number" name="items[${index}][unit_price]" step="0.01" min="0" class="w-full pl-7 rounded-lg border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-emerald-500 focus:ring-emerald-500 text-sm py-2" placeholder="0" required oninput="calculateRowTotal(${index})">
                </div>
            </td>
            <td class="py-3 px-4 text-right font-semibold text-gray-800 dark:text-gray-200" id="subtotal-${index}">
                $0
            </td>
            <td class="py-3 px-4 text-center">
                <button type="button" onclick="removeItem(${index})" class="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </td>
        `;
        container.appendChild(row);
        checkEmptyState();
    }

    function removeItem(index) {
        const row = document.getElementById(`item-${index}`);
        if (row) {
            row.remove();
            calculateGrandTotal();
            checkEmptyState();
        }
    }

    function checkEmptyState() {
        const container = document.getElementById('itemsContainer');
        const emptyState = document.getElementById('empty-state');
        if (container.children.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }
    }

    function updatePrice(index) {
        // Optional: Pre-fill price from raw material default price
        const select = document.querySelector(`select[name="items[${index}][raw_material_id]"]`);
        const price = select.options[select.selectedIndex].dataset.price;
        if (price) {
             document.querySelector(`input[name="items[${index}][unit_price]"]`).value = price;
             calculateRowTotal(index);
        }
    }

    function calculateRowTotal(index) {
        const qtyInput = document.querySelector(`input[name="items[${index}][quantity]"]`);
        const priceInput = document.querySelector(`input[name="items[${index}][unit_price]"]`);
        const subtotalEl = document.getElementById(`subtotal-${index}`);

        const qty = parseFloat(qtyInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const total = qty * price;

        subtotalEl.textContent = '$' + total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        
        calculateGrandTotal();
    }

    function calculateGrandTotal() {
        let total = 0;
        const rows = document.querySelectorAll('#itemsContainer tr');
        rows.forEach(row => {
            const index = row.id.split('-')[1];
            const qty = parseFloat(document.querySelector(`input[name="items[${index}][quantity]"]`).value) || 0;
            const price = parseFloat(document.querySelector(`input[name="items[${index}][unit_price]"]`).value) || 0;
            total += qty * price;
        });

        document.getElementById('grandTotal').textContent = '$' + total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        // Don't add item initially, wait for supplier selection
        checkEmptyState();
    });
</script>
@endpush
@endsection
