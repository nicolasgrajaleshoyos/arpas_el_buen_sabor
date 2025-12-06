@extends('layouts.app')

@section('title', 'Herramienta de Migración de Datos')

@section('content')
<div class="max-w-4xl mx-auto">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Herramienta de Migración de Datos</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
            Esta herramienta inspecciona su almacenamiento local (localStorage) y envía los datos directamente a la base de datos del servidor.
        </p>

        <!-- Status Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <h3 class="font-semibold text-blue-800 dark:text-blue-300 mb-2">Proveedores Encontrados</h3>
                <p id="suppliers-count" class="text-3xl font-bold text-blue-600 dark:text-blue-400">0</p>
            </div>
            <div class="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800">
                <h3 class="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Productos Encontrados</h3>
                <p id="materials-count" class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">0</p>
            </div>
        </div>

        <!-- Data Preview -->
        <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Vista Previa de Datos (Primeros 5 registros)</h3>
            <div class="overflow-x-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-xs text-gray-600 dark:text-gray-300 h-64 overflow-y-auto" id="data-preview">
                Cargando datos...
            </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-4">
            <button onclick="startMigration()" id="migrate-btn" class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                ENVIAR DATOS AL SERVIDOR
            </button>
            
            <div id="migration-log" class="hidden mt-4 p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-lg h-48 overflow-y-auto">
                <div class="border-b border-gray-700 pb-2 mb-2 text-gray-400">Log de Migración:</div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
    let localSuppliers = [];
    let localMaterials = [];

    document.addEventListener('DOMContentLoaded', () => {
        loadLocalData();
    });

    function loadLocalData() {
        try {
            // Read directly from localStorage
            const suppliersRaw = localStorage.getItem('suppliers');
            const materialsRaw = localStorage.getItem('rawMaterials');

            localSuppliers = suppliersRaw ? JSON.parse(suppliersRaw) : [];
            localMaterials = materialsRaw ? JSON.parse(materialsRaw) : [];

            // Update Counts
            document.getElementById('suppliers-count').textContent = localSuppliers.length;
            document.getElementById('materials-count').textContent = localMaterials.length;

            // Update Preview
            const preview = {
                suppliers: localSuppliers.slice(0, 5),
                rawMaterials: localMaterials.slice(0, 5)
            };
            document.getElementById('data-preview').textContent = JSON.stringify(preview, null, 2);

        } catch (e) {
            console.error(e);
            document.getElementById('data-preview').textContent = 'Error leyendo localStorage: ' + e.message;
        }
    }

    async function startMigration() {
        const btn = document.getElementById('migrate-btn');
        const log = document.getElementById('migration-log');
        
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
        log.classList.remove('hidden');
        
        logMessage('Iniciando proceso de migración...');
        logMessage(`Preparando ${localSuppliers.length} proveedores y ${localMaterials.length} productos...`);

        try {
            const payload = {
                suppliers: localSuppliers,
                rawMaterials: localMaterials
            };

            logMessage('Enviando datos al servidor...');

            const response = await fetch('/migrate-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(payload)
            });

            logMessage(`Respuesta HTTP: ${response.status} ${response.statusText}`);

            const result = await response.json();
            
            if (result.success) {
                logMessage('✅ ÉXITO: ' + result.message);
                Swal.fire({
                    title: '¡Migración Exitosa!',
                    text: result.message,
                    icon: 'success',
                    confirmButtonText: 'Ir a Registrar Compra',
                    confirmButtonColor: '#10b981'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/purchases/create';
                    }
                });
            } else {
                logMessage('❌ ERROR: ' + result.message);
                alert('Error: ' + result.message);
            }

        } catch (error) {
            logMessage('❌ ERROR CRÍTICO: ' + error.message);
            console.error(error);
        } finally {
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    function logMessage(msg) {
        const log = document.getElementById('migration-log');
        const entry = document.createElement('div');
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }
</script>
@endpush
@endsection
