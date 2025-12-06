@extends('layouts.app')

@section('title', 'Detalle de Compra - Arepas el Buen Sabor')

@section('content')
<div class="max-w-5xl mx-auto">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 mb-6">
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Detalle de Compra</h2>
                <p class="text-gray-600 dark:text-gray-400">Información completa de la compra</p>
            </div>
            <a href="{{ route('purchases.index') }}" class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Volver al historial
            </a>
        </div>
    </div>

    <!-- Purchase Info Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Reference Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border-l-4 border-blue-500">
            <div class="flex items-center gap-3 mb-2">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                    </svg>
                </div>
                <h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Referencia</h3>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ $purchase->reference_number }}</p>
        </div>

        <!-- Date Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border-l-4 border-purple-500">
            <div class="flex items-center gap-3 mb-2">
                <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</h3>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ \Carbon\Carbon::parse($purchase->purchase_date)->format('d/m/Y') }}</p>
        </div>

        <!-- Supplier Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border-l-4 border-orange-500">
            <div class="flex items-center gap-3 mb-2">
                <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                </div>
                <h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proveedor</h3>
            </div>
            <p class="text-xl font-bold text-gray-900 dark:text-white truncate" title="{{ $purchase->supplier->name }}">{{ $purchase->supplier->name }}</p>
        </div>

        <!-- Total Card -->
        <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-soft p-6">
            <div class="flex items-center gap-3 mb-2">
                <div class="p-2 bg-white/20 rounded-lg">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3 class="text-xs font-medium text-white/90 uppercase tracking-wider">Total Compra</h3>
            </div>
            <p class="text-3xl font-bold text-white">${{ number_format($purchase->total_amount, 0, ',', '.') }}</p>
        </div>
    </div>

    <!-- Items Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                Items Comprados
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ count($purchase->items) }} producto(s) en esta compra</p>
        </div>
        
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="bg-gray-50 dark:bg-gray-700/50">
                        <th class="py-4 px-6 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Materia Prima</th>
                        <th class="py-4 px-6 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Cantidad</th>
                        <th class="py-4 px-6 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Precio Unit.</th>
                        <th class="py-4 px-6 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Subtotal</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                    @foreach ($purchase->items as $item)
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td class="py-4 px-6">
                            <div class="flex items-center gap-3">
                                <div class="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                    <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                    </svg>
                                </div>
                                <div>
                                    <p class="font-semibold text-gray-900 dark:text-white">{{ $item->rawMaterial->name }}</p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Unidad: {{ $item->rawMaterial->unit }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="py-4 px-6 text-right">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                {{ number_format($item->quantity, 2) }}
                            </span>
                        </td>
                        <td class="py-4 px-6 text-right font-medium text-gray-900 dark:text-white">
                            ${{ number_format($item->unit_price, 0, ',', '.') }}
                        </td>
                        <td class="py-4 px-6 text-right font-bold text-emerald-600 dark:text-emerald-400">
                            ${{ number_format($item->total_price, 0, ',', '.') }}
                        </td>
                    </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr class="bg-gray-50 dark:bg-gray-700/50 border-t-2 border-gray-200 dark:border-gray-600">
                        <td colspan="3" class="py-5 px-6 text-right">
                            <span class="text-lg font-bold text-gray-900 dark:text-white">Total de la Compra:</span>
                        </td>
                        <td class="py-5 px-6 text-right">
                            <span class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                ${{ number_format($purchase->total_amount, 0, ',', '.') }}
                            </span>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</div>
@endsection
