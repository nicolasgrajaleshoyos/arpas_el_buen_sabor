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
        
        <!-- Date Filters -->
        <div class="flex gap-3">
            <select id="month-select" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                @foreach(['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] as $index => $month)
                    <option value="{{ $index }}" {{ $index == date('n') - 1 ? 'selected' : '' }}>{{ $month }}</option>
                @endforeach
            </select>
            
            <select id="year-select" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                @for($year = 2023; $year <= 2050; $year++)
                    <option value="{{ $year }}" {{ $year == date('Y') ? 'selected' : '' }}>{{ $year }}</option>
                @endfor
            </select>
        </div>
    </div>
    
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Inventory Value -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 card-hover transition-colors">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Valor Inventario</p>
                    <p id="kpi-inventory" class="text-2xl font-bold text-gray-900 dark:text-white mt-2">$0</p>
                </div>
                <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                </div>
            </div>
        </div>
        
        <!-- Monthly Sales -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 card-hover transition-colors">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Ventas del Mes</p>
                    <p id="kpi-sales" class="text-2xl font-bold text-gray-900 dark:text-white mt-2">$0</p>
                </div>
                <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            </div>
        </div>
        
        <!-- Monthly Payroll -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 card-hover transition-colors">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Nómina Mensual</p>
                    <p id="kpi-payroll" class="text-2xl font-bold text-gray-900 dark:text-white mt-2">$0</p>
                </div>
                <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                </div>
            </div>
        </div>
        
        <!-- Total Products -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 card-hover transition-colors">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Productos Únicos</p>
                    <p id="kpi-products" class="text-2xl font-bold text-gray-900 dark:text-white mt-2">0</p>
                </div>
                <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sales Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 transition-colors">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ventas Diarias</h3>
            <div class="chart-container">
                <canvas id="sales-chart"></canvas>
            </div>
        </div>
        
        <!-- Distribution Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 transition-colors">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución de Ventas</h3>
            <div class="chart-container">
                <canvas id="distribution-chart"></canvas>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/modules/dashboard.js') }}"></script>
<script>
    // Initialize Dashboard module
    document.addEventListener('DOMContentLoaded', function() {
        Dashboard.init();
    });
</script>
@endpush
