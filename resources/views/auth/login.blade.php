<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - Arepas el Buen Sabor</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- SweetAlert2 para alertas bonitas -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
        // Check for saved theme preference or system preference
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    </script>
    <style>
        body { font-family: 'Outfit', sans-serif; }
        .glass {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
        }
        .bg-pattern {
            background-color: #f59e0b;
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b45309' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
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
<body class="bg-pattern h-screen flex items-center justify-center p-4">
    <div class="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        <!-- Left Side: Branding -->
        <div class="md:w-1/2 bg-yellow-500 p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div class="absolute inset-0 bg-yellow-600 opacity-50"></div>
            <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div class="absolute -top-24 -right-24 w-64 h-64 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            
            <div class="relative z-10">
                <div class="flex items-center gap-3 mb-8">
                    <img src="{{ asset('images/logo.jpeg') }}" alt="Logo" class="w-12 h-12 rounded-full border-2 border-white/20 shadow-lg">
                    <span class="text-xl font-bold tracking-wide text-white drop-shadow-md">Arepas El Buen Sabor</span>
                </div>
                
                <h2 class="text-4xl font-bold mb-6 leading-tight text-white drop-shadow-sm">Gestión Empresarial Inteligente</h2>
                <p class="text-yellow-50 text-lg leading-relaxed font-medium">Administra tu negocio de manera eficiente, controla tu inventario y potencia tus ventas con nuestra plataforma integral.</p>
            </div>

            <div class="relative z-10 mt-12">
                <div class="flex items-center gap-4 text-sm text-yellow-100 font-medium">
                    <div class="flex -space-x-2">
                        <div class="w-8 h-8 rounded-full bg-yellow-400 border-2 border-yellow-600 flex items-center justify-center text-xs text-yellow-900 font-bold">A</div>
                        <div class="w-8 h-8 rounded-full bg-yellow-300 border-2 border-yellow-600 flex items-center justify-center text-xs text-yellow-900 font-bold">B</div>
                        <div class="w-8 h-8 rounded-full bg-yellow-200 border-2 border-yellow-600 flex items-center justify-center text-xs text-yellow-900 font-bold">C</div>
                    </div>
                    <span>Usado por el equipo administrativo</span>
                </div>
            </div>
        </div>

        <!-- Right Side: Login Form -->
        <div class="md:w-1/2 p-12 bg-white flex flex-col justify-center">
            <div class="mb-8 text-center md:text-left">
                <h3 class="text-3xl font-bold text-gray-900 mb-2">Bienvenido de nuevo</h3>
                <p class="text-gray-500">Ingresa tus credenciales para acceder al panel.</p>
            </div>

            <form id="login-form" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <input type="text" id="username" class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-gray-50 focus:bg-white" placeholder="Ej: admin" required>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <input type="password" id="password" class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-gray-50 focus:bg-white" placeholder="••••••••" required>
                    </div>
                </div>

                <div class="flex items-center justify-between text-sm">
                    <label class="flex items-center text-gray-600 cursor-pointer">
                        <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500">
                        <span class="ml-2">Recordarme</span>
                    </label>
                </div>
                
                <button type="submit" class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-yellow-500/30 transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                    <span>Ingresar al Sistema</span>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </form>
            

        </div>
    </div>

    <script src="{{ asset('js/database.js') }}"></script>
    <script>
        // Initialize DB if needed
        Database.init();

        document.getElementById('login-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Simple validation against local database
            const users = Database.getAll('users');
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                // Save session
                localStorage.setItem('session', JSON.stringify({
                    userId: user.id,
                    username: user.username,
                    role: user.role,
                    loginTime: new Date().toISOString()
                }));
                
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true
                });

                Toast.fire({
                    icon: 'success',
                    title: '¡Bienvenido de nuevo!'
                }).then(() => {
                    window.location.href = '/dashboard';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso Denegado',
                    text: 'Usuario o contraseña incorrectos',
                    confirmButtonColor: '#eab308',
                    confirmButtonColor: '#eab308',
                    // background: '#fff', // Removed hardcoded white background
                    customClass: {
                        popup: 'rounded-xl'
                    }
                });
            }
        });
    </script>
</body>
</html>
