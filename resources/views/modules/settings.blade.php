@extends('layouts.app')

@section('title', 'Configuración - Arepas el Buen Sabor')

@section('content')
<div class="max-w-4xl">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Configuración</h1>
    
    <div class="space-y-6">
        <!-- Apariencia -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6 transition-colors">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">🎨 Apariencia</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-4">Elige el tema de tu preferencia.</p>
            
            <div class="grid grid-cols-2 gap-4">
                <button onclick="setTheme('light')" id="btn-light" class="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 group">
                    <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                    </div>
                    <span class="font-medium text-gray-900 dark:text-white">Modo Claro</span>
                </button>
                
                <button onclick="setTheme('dark')" id="btn-dark" class="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 group">
                    <div class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                        </svg>
                    </div>
                    <span class="font-medium text-gray-900 dark:text-white">Modo Oscuro</span>
                </button>
            </div>
        </div>

        <!-- Manual de Usuario -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6 transition-colors">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">📖 Manual de Usuario</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-4">Aprende a usar todas las funcionalidades del sistema.</p>
            <button onclick="alert('Manual de usuario - Próximamente disponible')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                Ver Manual
            </button>
        </div>
        
        <!-- Reset de Datos -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6 transition-colors">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">⚠️ Resetear Datos</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-4">Elimina todos los datos y restaura la aplicación a valores de fábrica.</p>
            <button onclick="resetData()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                Resetear Sistema
            </button>
        </div>
        
        <!-- Información del Sistema -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6 transition-colors">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">ℹ️ Información</h2>
            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p><strong>Versión:</strong> 2.0.0</p>
                <p><strong>Base de Datos:</strong> MySQL (Laravel)</p>
                <p><strong>Última actualización:</strong> {{ date('d/m/Y') }}</p>
                <p><strong>Desarrollado para:</strong> Arepas el Buen Sabor</p>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    function setTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        updateThemeButtons(theme);
    }

    function updateThemeButtons(theme) {
        const btnLight = document.getElementById('btn-light');
        const btnDark = document.getElementById('btn-dark');
        
        // Reset classes
        const activeClasses = ['border-emerald-500', 'bg-emerald-50', 'dark:bg-gray-700', 'ring-2', 'ring-emerald-500', 'ring-opacity-50'];
        const inactiveClasses = ['border-gray-200', 'dark:border-gray-700', 'hover:bg-gray-50', 'dark:hover:bg-gray-700'];
        
        if (theme === 'dark') {
            btnDark.classList.add(...activeClasses);
            btnDark.classList.remove(...inactiveClasses);
            
            btnLight.classList.remove(...activeClasses);
            btnLight.classList.add(...inactiveClasses);
        } else {
            btnLight.classList.add(...activeClasses);
            btnLight.classList.remove(...inactiveClasses);
            
            btnDark.classList.remove(...activeClasses);
            btnDark.classList.add(...inactiveClasses);
        }
    }

    // Initialize buttons on load
    document.addEventListener('DOMContentLoaded', () => {
        const currentTheme = localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
        updateThemeButtons(currentTheme);
    });

    function resetData() {
        Swal.fire({
            title: '⚠️ Resetear Sistema',
            text: "Esta acción eliminará TODOS los datos y restaurará la aplicación a su estado original. Esta acción no se puede deshacer.",
            icon: 'warning',
            input: 'password',
            inputAttributes: {
                autocapitalize: 'off',
                placeholder: 'Contraseña de administrador'
            },
            showCancelButton: true,
            confirmButtonText: 'Sí, Resetear Todo',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            showLoaderOnConfirm: true,
            preConfirm: (password) => {
                // Get admin user from database
                const users = Database.getAll('users');
                const admin = users.find(u => u.role === 'admin');
                
                // Check if admin exists and password matches
                // Default password is 'admin123' if not changed
                if (!admin || password !== admin.password) {
                    Swal.showValidationMessage('Contraseña incorrecta');
                    return false;
                }
                return true;
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                Database.reset();
                Swal.fire({
                    title: '¡Sistema Reseteado!',
                    text: 'Todos los datos han sido eliminados y restaurados a fábrica.',
                    icon: 'success',
                    confirmButtonColor: '#10b981'
                }).then(() => {
                    window.location.reload();
                });
            }
        });
    }
</script>
@endpush
