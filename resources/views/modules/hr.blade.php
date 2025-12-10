@extends('layouts.app')

@section('title', 'Recursos Humanos - Arepas el Buen Sabor')

@section('content')
<div id="hr-content">
    <!-- This content is dynamically loaded by HR.render() from js/modules/hr.js -->
    <!-- The following HTML is an example of what HR.render() might produce,
         or it's intended to be directly placed here if HR.render() is not used
         to generate the main structure.
         Given the instruction, this content is being added to the document. -->

    <!-- Advances Tab -->
    <div data-hr-tab-content="advances" class="hidden">
        <div class="mb-6">
            <button onclick="HR.showAdvanceModal()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Solicitar Adelanto
            </button>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden transition-colors">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="bg-gray-50 dark:bg-gray-700/50">
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

<!-- Advance Modal -->
<div id="advance-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 slide-in transition-colors">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Nuevo Adelanto</h2>
            <button onclick="document.getElementById('advance-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>

        <form id="advance-form" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Empleado</label>
                <select id="advance-employee" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                    <!-- Options loaded by JS -->
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monto</label>
                <input type="number" id="advance-amount" min="1" step="1000" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
            </div>

</div>

<!-- Payroll Generation Modal -->
@endsection

@push('scripts')
<script src="{{ asset('js/modules/hr.js') }}?v=1.1"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('hr-content').innerHTML = HR.render();
        HR.init();
    });
</script>
@endpush
