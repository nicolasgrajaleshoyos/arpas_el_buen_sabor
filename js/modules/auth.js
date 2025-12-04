// Authentication Module
const Auth = {
    init() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    },

    handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Validate inputs
        if (!username || !password) {
            Toast.error('Por favor ingresa usuario y contraseña');
            return;
        }

        // Get users from database
        const users = Database.getAll('users');
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            // Create session
            const session = {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            };

            localStorage.setItem('session', JSON.stringify(session));

            Toast.success('¡Bienvenido ' + user.username + '!');

            // Redirect to dashboard
            setTimeout(() => {
                App.currentUser = session.user;
                App.loadView('dashboard');
            }, 500);
        } else {
            Toast.error('Usuario o contraseña incorrectos');

            // Shake animation for error
            const form = document.getElementById('login-form');
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 500);
        }
    },

    renderLoginView() {
        return `
            <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
                <div class="w-full max-w-md">
                    <!-- Logo and Title -->
                    <div class="text-center mb-8">
                        <div class="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
                            <span class="text-6xl">🫓</span>
                        </div>
                        <h1 class="text-4xl font-bold text-gray-900 mb-2">Arepas el Buen Sabor</h1>
                        <p class="text-gray-600">Sistema de Gestión Empresarial</p>
                    </div>
                    
                    <!-- Login Card -->
                    <div class="bg-white rounded-2xl shadow-xl p-8">
                        <h2 class="text-2xl font-semibold text-gray-900 mb-6 text-center">Iniciar Sesión</h2>
                        
                        <form id="login-form" class="space-y-5">
                            <!-- Username -->
                            <div>
                                <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                                    Usuario
                                </label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                    </div>
                                    <input 
                                        type="text" 
                                        id="username" 
                                        class="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        placeholder="Ingresa tu usuario"
                                        autocomplete="username"
                                    >
                                </div>
                            </div>
                            
                            <!-- Password -->
                            <div>
                                <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                                    Contraseña
                                </label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                        </svg>
                                    </div>
                                    <input 
                                        type="password" 
                                        id="password" 
                                        class="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        placeholder="Ingresa tu contraseña"
                                        autocomplete="current-password"
                                    >
                                </div>
                            </div>
                            
                            <!-- Submit Button -->
                            <button 
                                type="submit" 
                                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                            >
                                Ingresar
                            </button>
                        </form>
                        
                        <!-- Demo Credentials -->
                        <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p class="text-sm text-blue-800 font-medium mb-2">🔑 Credenciales de prueba:</p>
                            <p class="text-sm text-blue-700">Usuario: <code class="bg-blue-100 px-2 py-1 rounded">admin</code></p>
                            <p class="text-sm text-blue-700">Contraseña: <code class="bg-blue-100 px-2 py-1 rounded">admin123</code></p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="text-center mt-6 text-sm text-gray-600">
                        <p>© 2024 Arepas el Buen Sabor. Todos los derechos reservados.</p>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                    20%, 40%, 60%, 80% { transform: translateX(10px); }
                }
                
                .shake {
                    animation: shake 0.5s;
                }
            </style>
        `;
    }
};
