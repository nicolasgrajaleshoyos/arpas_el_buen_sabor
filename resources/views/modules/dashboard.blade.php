@extends('layouts.app')

@section('title', 'Dashboard - Arepas el Buen Sabor')

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Resumen general del negocio</p>
        </div>
        <!-- Global Filter is now in the main layout, so we don't need local filters here -->
    </div>
    
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Net Profit (Utilidad) -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 card-hover transition-colors border-l-4 border-emerald-500">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Utilidad Neta</p>
                    <p id="kpi-profit" class="text-2xl font-bold text-gray-900 dark:text-white mt-2">$0</p>
                </div>
                <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            </div>
        </div>
        
        <!-- Total Sales -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 card-hover transition-colors border-l-4 border-blue-500">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Ventas Totales</p>
                    <p id="kpi-sales" class="text-2xl font-bold text-gray-900 dark:text-white mt-2">$0</p>
                </div>
                <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                </div>
            </div>
        </div>
        
        <!-- Expenses (Gastos) -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 card-hover transition-colors border-l-4 border-amber-500">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Gastos Operativos</p>
                    <p id="kpi-expenses" class="text-2xl font-bold text-gray-900 dark:text-white mt-2">$0</p>
                    <p class="text-xs text-gray-400 mt-1">Nómina + Insumos</p>
                </div>
                <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            </div>
        </div>
        
        <!-- Returns (Mermas) -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 card-hover transition-colors border-l-4 border-red-500">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Mermas / Devoluciones</p>
                    <p id="kpi-returns" class="text-2xl font-bold text-gray-900 dark:text-white mt-2">$0</p>
                </div>
                <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sales Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 transition-colors">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ventas por Mes (Año Actual)</h3>
            <div class="chart-container">
                <canvas id="sales-chart"></canvas>
            </div>
        </div>
        
        <!-- Returns Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 transition-colors">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Devoluciones por Mes</h3>
            <div class="chart-container">
                <canvas id="distribution-chart"></canvas>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/modules/dashboard.js') }}?v=4.2"></script>
<script>
    // Initialize Dashboard module
    document.addEventListener('DOMContentLoaded', function() {
        Dashboard.init();
    });
</script>
@endpush
