<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Sistema de gestión empresarial para Arepas el Buen Sabor">
    <meta name="theme-color" content="#10b981">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Arepas el Buen Sabor - Sistema de Gestión')</title>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        emerald: {
                            50: '#ecfdf5',
                            100: '#d1fae5',
                            200: '#a7f3d0',
                            300: '#6ee7b7',
                            400: '#34d399',
                            500: '#10b981',
                            600: '#059669',
                            700: '#047857',
                            800: '#065f46',
                            900: '#064e3b',
                        }
                    }
                }
            }
        }
    </script>
    <script>
        // Check for saved theme preference or system preference
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    </script>

    <!-- Chart.js para gráficos -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

    <!-- SweetAlert2 para alertas bonitas -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Custom Styles -->
    <link rel="stylesheet" href="{{ asset('styles.css') }}">

    <!-- Favicon -->
    <link rel="icon" type="image/jpeg" href="{{ asset('images/logo.jpeg') }}">

    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        
        .sidebar.active {
            transform: translateX(0) !important;
        }
        
        @media (max-width: 1024px) {
            .sidebar {
                transform: translateX(-100%);
            }
        }

        /* Critical Dark Mode Fixes */
        html.dark th {
            background-color: #1f2937 !important; /* gray-800 */
            color: #fff !important;
            border-color: #374151 !important;
        }
        
        html.dark td {
            color: #e5e7eb !important;
            border-color: #374151 !important;
        }

        html.dark tr:hover {
            background-color: rgba(55, 65, 81, 0.5) !important;
        }
        
        html.dark input, 
        html.dark select, 
        html.dark textarea {
            background-color: #1f2937 !important;
            color: #fff !important;
            border-color: #4b5563 !important;
        }

        html.dark .bg-white {
            background-color: #1f2937 !important;
        }

        html.dark table, 
        html.dark tbody, 
        html.dark tr {
            background-color: transparent !important;
        }

        /* SweetAlert2 Dark Mode - High Specificity */
        html.dark .swal2-container .swal2-popup {
            background-color: #1f2937 !important;
            color: #f9fafb !important;
        }
        
        html.dark .swal2-container .swal2-title,
        html.dark .swal2-container .swal2-html-container,
        html.dark .swal2-container .swal2-content {
            color: #f9fafb !important;
        }
        
        html.dark .swal2-container .swal2-input,
        html.dark .swal2-container .swal2-textarea,
        html.dark .swal2-container .swal2-select {
            background-color: #374151 !important;
            border-color: #4b5563 !important;
            color: white !important;
        }
        
        html.dark .swal2-container .swal2-validation-message {
            background-color: #374151 !important;
            color: #f9fafb !important;
        }
        
        html.dark .swal2-container .swal2-timer-progress-bar {
            background-color: rgba(255, 255, 255, 0.5) !important;
        }
        
        html.dark .swal2-container .swal2-close:hover {
            color: #9ca3af !important;
        }
    </style>
</head>

<body class="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Main Layout -->
    <div class="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <!-- Sidebar -->
        <aside id="sidebar" class="sidebar fixed lg:static w-64 h-full bg-white dark:bg-gray-800 shadow-lg flex flex-col z-30 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 border-r border-gray-200 dark:border-gray-700">
            <!-- Logo -->
            <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <img src="{{ asset('images/logo.jpeg') }}" alt="Logo" class="w-12 h-12 rounded-full object-cover">
                <div>
                    <h1 class="text-xl font-bold text-emerald-600 dark:text-emerald-500 leading-tight">Arepas</h1>
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">El Buen Sabor</p>
                </div>
            </div>
            
            <!-- Navigation -->
            <nav class="flex-1 p-4 overflow-y-auto">
                <ul class="space-y-2">
                    <li>
                        <a href="{{ route('dashboard') }}" class="nav-item flex items-center gap-3 px-4 py-3 rounded-lg {{ request()->routeIs('dashboard') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-emerald-400' }} transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                            <span class="font-medium">Dashboard</span>
                        </a>
                    </li>
                    <li>
                        <a href="{{ route('inventory') }}" class="nav-item flex items-center gap-3 px-4 py-3 rounded-lg {{ request()->routeIs('inventory') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-emerald-400' }} transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                            <span class="font-medium">Inventario</span>
                        </a>
                    </li>
                    <li>
                        <a href="{{ route('sales') }}" class="nav-item flex items-center gap-3 px-4 py-3 rounded-lg {{ request()->routeIs('sales') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-emerald-400' }} transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="font-medium">Ventas</span>
                        </a>
                    </li>
                    <li>
                        <a href="{{ route('returns') }}" class="nav-item flex items-center gap-3 px-4 py-3 rounded-lg {{ request()->routeIs('returns') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-emerald-400' }} transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"></path>
                            </svg>
                            <span class="font-medium">Devoluciones</span>
                        </a>
                    </li>
                    <li>
                        <a href="{{ route('raw-materials') }}" class="nav-item flex items-center gap-3 px-4 py-3 rounded-lg {{ request()->routeIs('raw-materials') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-emerald-400' }} transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                            <span class="font-medium">Materia Prima</span>
                        </a>
                    </li>
                    <li>
                        <a href="{{ route('suppliers') }}" class="nav-item flex items-center gap-3 px-4 py-3 rounded-lg {{ request()->routeIs('suppliers') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-emerald-400' }} transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            <span class="font-medium">Proveedores</span>
                        </a>
                    </li>
                    <li>
                        <a href="{{ route('hr') }}" class="nav-item flex items-center gap-3 px-4 py-3 rounded-lg {{ request()->routeIs('hr') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-emerald-400' }} transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                            <span class="font-medium">Recursos Humanos</span>
                        </a>
                    </li>
                    <li>
                        <a href="{{ route('settings') }}" class="nav-item flex items-center gap-3 px-4 py-3 rounded-lg {{ request()->routeIs('settings') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-emerald-400' }} transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span class="font-medium">Configuración</span>
                        </a>
                    </li>
                </ul>
            </nav>

            <!-- User Profile & Logout -->
            <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                        A
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">Admin</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Administrador</p>
                    </div>
                </div>
                <button onclick="logout()" class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 transition-all text-sm font-medium">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Cerrar Sesión
                </button>
            </div>
        </aside>
        
        <!-- Main Content -->
        <main class="flex-1 flex flex-col overflow-hidden lg:ml-0">
             <!-- Mobile Header -->
             <div class="lg:hidden bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between z-20 transition-colors">
                <div class="flex items-center gap-2">
                    <img src="{{ asset('images/logo.jpeg') }}" alt="Logo" class="w-8 h-8 rounded-full object-cover">
                    <h1 class="text-xl font-bold text-emerald-600 dark:text-emerald-500">Arepas</h1>
                </div>
                <button id="mobile-menu-btn" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>

            <!-- GLOBAL PERIOD FILTER BAR -->
            <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 transition-colors shadow-sm">
                <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span class="font-medium text-sm hidden md:inline">Filtrar por Periodo:</span>
                </div>
                
                <div class="flex items-center gap-3 w-full md:w-auto">
                    <select id="global-month" class="flex-1 md:w-40 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <option value="0">Enero</option>
                        <option value="1">Febrero</option>
                        <option value="2">Marzo</option>
                        <option value="3">Abril</option>
                        <option value="4">Mayo</option>
                        <option value="5">Junio</option>
                        <option value="6">Julio</option>
                        <option value="7">Agosto</option>
                        <option value="8">Septiembre</option>
                        <option value="9">Octubre</option>
                        <option value="10">Noviembre</option>
                        <option value="11">Diciembre</option>
                    </select>
                    
                    <select id="global-year" class="flex-1 md:w-32 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <!-- Years populated by JS -->
                    </select>

                    <button id="reset-period-btn" class="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" title="Ir al Mes Actual">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Content Area (Scrollable) -->
            <div class="flex-1 overflow-y-auto p-4 md:p-6" id="main-scroll-container">
                @yield('content')
            </div>
        </main>
    </div>

    <!-- Toast Container -->
    <div id="toast-container" class="fixed top-4 right-4 z-50 space-y-2"></div>

    <!-- Scripts -->
    <script src="{{ asset('js/utils/toast.js') }}"></script>
    <script src="{{ asset('js/utils/charts.js') }}"></script>
    <script src="{{ asset('js/utils/export.js') }}"></script>
    <script src="{{ asset('js/database.js') }}"></script>
    
    <script>
        // Mobile menu toggle
        document.getElementById('mobile-menu-btn')?.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('active');
            }
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            const sidebar = document.getElementById('sidebar');
            const menuBtn = document.getElementById('mobile-menu-btn');
            
            if (sidebar && sidebar.classList.contains('active')) {
                if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });

        // Global Period Management
        const GlobalPeriod = {
            currentDate: new Date(),
            
            init() {
                this.monthSelect = document.getElementById('global-month');
                this.yearSelect = document.getElementById('global-year');
                
                if (!this.monthSelect || !this.yearSelect) return;

                this.populateYears();
                this.loadSavedPeriod();
                this.setupListeners();
            },

            populateYears() {
                const currentYear = new Date().getFullYear();
                const startYear = 2024; // Project start
                const endYear = 2035; // Extended range per user request 

                this.yearSelect.innerHTML = '';
                for (let y = startYear; y <= endYear; y++) {
                    const option = document.createElement('option');
                    option.value = y;
                    option.textContent = y;
                    this.yearSelect.appendChild(option);
                }
            },

            loadSavedPeriod() {
                // Default to current month/year if not saved
                const storedMonth = localStorage.getItem('global_month');
                const storedYear = localStorage.getItem('global_year');

                if (storedMonth !== null && storedYear !== null) {
                    this.monthSelect.value = storedMonth;
                    this.yearSelect.value = storedYear;
                } else {
                    this.resetToCurrent();
                }
            },

            resetToCurrent() {
                this.monthSelect.value = this.currentDate.getMonth();
                this.yearSelect.value = this.currentDate.getFullYear();
                this.saveAndNotify();
            },

            setupListeners() {
                this.monthSelect.addEventListener('change', () => this.saveAndNotify());
                this.yearSelect.addEventListener('change', () => this.saveAndNotify());
                
                document.getElementById('reset-period-btn')?.addEventListener('click', () => {
                   this.resetToCurrent(); 
                   Toast.info('Restaurado al periodo actual');
                });
            },

            saveAndNotify() {
                const month = parseInt(this.monthSelect.value);
                const year = parseInt(this.yearSelect.value);

                localStorage.setItem('global_month', month);
                localStorage.setItem('global_year', year);

                // Dispatch Custom Event for Modules
                const event = new CustomEvent('period-changed', {
                    detail: { month, year }
                });
                window.dispatchEvent(event);
            },
            
            // Helper for modules to check if a date is in range
            isDateInPeriod(dateString) { // Supports ISO date string or Date object
                const date = new Date(dateString);
                const selectedMonth = parseInt(this.monthSelect.value);
                const selectedYear = parseInt(this.yearSelect.value);
                
                return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
            }
        };

        // Initialize on Load
        document.addEventListener('DOMContentLoaded', () => {
            GlobalPeriod.init();
        });


        function logout() {
            Swal.fire({
                title: '¿Cerrar Sesión?',
                text: "¿Estás seguro que deseas salir del sistema?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Sí, Salir',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Clear session data
                    localStorage.removeItem('session');
                    
                    // Show success message
                    Toast.success('Sesión cerrada exitosamente');
                    
                    // Redirect to login
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1000);
                }
            });
        }
    </script>

    @stack('scripts')
</body>

</html>
