@extends('layouts.app')

@section('title', 'Compras - Arepas el Buen Sabor')

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Compras</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Gestión de compras de insumos generales</p>
        </div>
        <a href="{{ route('purchases.create') }}" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nueva Compra
        </a>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8">
            <a href="{{ route('raw-materials') }}" class="py-4 px-1 border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                Inventario
            </a>
            <a href="{{ route('raw-materials') }}#movimientos" class="py-4 px-1 border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                Salidas
            </a>
            <a href="{{ route('purchases.index') }}" class="py-4 px-1 border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-medium transition-colors">
                Compras
            </a>
        </nav>
    </div>

    <!-- Content -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 transition-colors">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historial de Compras</h3>
        
        <!-- Search and Filter -->
        <div class="mb-6">
            <form action="{{ route('purchases.index') }}" method="GET" class="flex flex-col sm:flex-row gap-4">
                <div class="flex-1">
                    <input type="text" name="search" value="{{ request('search') }}" placeholder="Buscar por referencia, proveedor o producto..." class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-emerald-500 focus:ring-emerald-500">
                </div>
                <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <input type="date" name="date_from" value="{{ request('date_from') }}" class="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-emerald-500 focus:ring-emerald-500" placeholder="Desde">
                    <input type="date" name="date_to" value="{{ request('date_to') }}" class="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-emerald-500 focus:ring-emerald-500" placeholder="Hasta">
                </div>
                <div class="w-full sm:w-48">
                    <select name="year" onchange="this.form.submit()" class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-emerald-500 focus:ring-emerald-500">
                        <option value="">Todos los años</option>
                        @foreach($years as $year)
                            <option value="{{ $year }}" {{ request('year') == $year ? 'selected' : '' }}>{{ $year }}</option>
                        @endforeach
                    </select>
                </div>
                <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 whitespace-nowrap">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    Buscar
                </button>
            </form>
            
            @if(request('search') || request('year') || request('date_from') || request('date_to'))
            <div class="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <span class="text-gray-700 dark:text-gray-300">Total filtrado:</span>
                    <span class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 ml-2">${{ number_format($purchases->sum('total_amount'), 0, ',', '.') }}</span>
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                    @if(request('search'))
                        Búsqueda: "{{ request('search') }}"
                    @endif
                    @if(request('search') && request('year'))
                        |
                    @endif
                    @if(request('year'))
                        Año: {{ request('year') }}
                    @endif
                    @if(request('date_from'))
                         @if(request('search') || request('year')) | @endif Desde: {{ request('date_from') }}
                    @endif
                    @if(request('date_to'))
                         @if(request('search') || request('year') || request('date_from')) | @endif Hasta: {{ request('date_to') }}
                    @endif
                    <a href="{{ route('purchases.index') }}" class="ml-2 text-red-500 hover:text-red-700 font-medium hover:underline">Limpiar filtros</a>
                </div>
            </div>
            @endif
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <th class="py-4 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                        <th class="py-4 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Referencia</th>
                        <th class="py-4 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proveedor</th>
                        <th class="py-4 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Productos</th>
                        <th class="py-4 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Total</th>
                        <th class="py-4 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                    @forelse ($purchases as $purchase)
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group">
                        <td class="py-4 px-4 text-gray-800 dark:text-gray-200">
                            <div class="flex items-center gap-2">
                                <span class="p-1.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                </span>
                                {{ \Carbon\Carbon::parse($purchase->purchase_date)->format('d/m/Y') }}
                            </div>
                        </td>
                        <td class="py-4 px-4 text-gray-800 dark:text-gray-200 font-medium">
                            <span class="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ $purchase->reference_number }}</span>
                        </td>
                        <td class="py-4 px-4 text-gray-800 dark:text-gray-200">{{ $purchase->supplier->name }}</td>
                        <td class="py-4 px-4 text-center">
                            <div class="flex flex-col items-center justify-center gap-1">
                                @foreach($purchase->items->take(2) as $item)
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                        {{ $item->rawMaterial->name }}
                                        <span class="ml-1 text-gray-500 text-[10px]">({{ $item->quantity }})</span>
                                    </span>
                                @endforeach
                                @if($purchase->items->count() > 2)
                                    <span class="text-xs text-gray-500 dark:text-gray-400">+{{ $purchase->items->count() - 2 }} más</span>
                                @endif
                            </div>
                        </td>
                        <td class="py-4 px-4 text-emerald-600 dark:text-emerald-400 font-bold text-right text-lg">${{ number_format($purchase->total_amount, 0, ',', '.') }}</td>
                        <td class="py-4 px-4 text-center">
                            <a href="{{ route('purchases.show', $purchase) }}" class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors" title="Ver Detalle">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                            </a>
                            <form action="{{ route('purchases.destroy', $purchase) }}" method="POST" class="inline-block" onsubmit="return confirmDelete(event, this)">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors" title="Eliminar">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
                            </form>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="py-12 text-center">
                            <div class="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                    </svg>
                                </div>
                                <p class="text-lg font-medium">No se encontraron compras</p>
                                <p class="text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
                            </div>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
                @if($purchases->count() > 0)
                <tfoot class="border-t border-gray-200 dark:border-gray-700">
                    <tr class="bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20">
                        <td colspan="4" class="py-6 px-6 text-right">
                            <span class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Total Acumulado</span>
                            <span class="text-gray-900 dark:text-white font-bold text-lg">TOTAL GENERAL</span>
                        </td>
                        <td class="py-6 px-4 text-right">
                            <span class="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                                ${{ number_format($purchases->sum('total_amount'), 0, ',', '.') }}
                            </span>
                        </td>
                        <td class="py-6 px-4"></td>
                    </tr>
                </tfoot>
                @endif
            </table>
        </div>

        <!-- Pagination -->
        <div class="mt-6">
            {{ $purchases->links() }}
        </div>
    </div>
</div>
@section('scripts')
<script>
    function confirmDelete(event, form) {
        event.preventDefault();
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminará la compra y se revertirá el stock de los productos. Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                form.submit();
            }
        })
    }
</script>
@endsection
@endsection

@push('scripts')
<script>
    // Auto-submit when search input is cleared
    document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.querySelector('input[name="search"]');
        const searchForm = searchInput?.closest('form');
        
        if (searchInput && searchForm) {
            searchInput.addEventListener('input', function() {
                // If the input is empty and there was a previous search, submit the form
                if (this.value === '' && '{{ request("search") }}' !== '') {
                    searchForm.submit();
                }
            });
        }

        // Listen for Global Period Change
        window.addEventListener('period-changed', function(e) {
            const { month, year } = e.detail;
            const url = new URL(window.location.href);
            url.searchParams.set('month', month);
            url.searchParams.set('year', year);
            window.location.href = url.toString();
        });
    });
</script>
@endpush
