// AI Assistant Module (Gemini Integration)
const AIAssistant = {
    isOpen: false,
    messages: [],
    apiKey: null,

    init() {
        console.log('Inicializando Asistente IA...');
        this.loadApiKey();
        this.renderWidget();
        this.setupEventListeners();
    },

    loadApiKey() {
        this.apiKey = localStorage.getItem('gemini_api_key');
    },

    saveApiKey(key) {
        localStorage.setItem('gemini_api_key', key);
        this.apiKey = key;
    },

    setupEventListeners() {
        // Toggle chat button
        const toggleBtn = document.getElementById('ai-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleChat());
        }

        // Send message form
        const form = document.getElementById('ai-chat-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }

        // API key form
        const apiKeyForm = document.getElementById('api-key-form');
        if (apiKeyForm) {
            apiKeyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const key = document.getElementById('api-key-input').value.trim();
                if (key) {
                    this.saveApiKey(key);
                    Toast.success('API Key guardada exitosamente');
                    this.renderWidget();
                }
            });
        }
    },

    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = document.getElementById('ai-chat-window');
        const toggleBtn = document.getElementById('ai-toggle-btn');

        if (this.isOpen) {
            chatWindow.classList.remove('hidden');
            toggleBtn.innerHTML = `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            `;
        } else {
            chatWindow.classList.add('hidden');
            toggleBtn.innerHTML = `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
            `;
        }
    },

    async sendMessage() {
        const input = document.getElementById('ai-message-input');
        const message = input.value.trim();

        if (!message) return;

        if (!this.apiKey) {
            Toast.error('Por favor configura tu API Key de Gemini primero');
            return;
        }

        // Add user message
        this.addMessage('user', message);
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get business context
            const context = this.getBusinessContext();

            // Call Gemini API (simplified - would need actual implementation)
            const response = await this.callGeminiAPI(message, context);

            // Add AI response
            this.hideTypingIndicator();
            this.addMessage('assistant', response);
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('assistant', 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor verifica tu API Key.');
            console.error('Error calling Gemini API:', error);
        }
    },

    getBusinessContext() {
        const stats = Database.getStats();
        const products = Database.getAll('products');
        const sales = Database.getAll('sales');
        const employees = Database.getAll('employees');

        return {
            stats,
            totalProducts: products.length,
            totalSales: sales.length,
            totalEmployees: employees.length,
            products: products.map(p => ({ name: p.name, stock: p.stock, price: p.price })),
            recentSales: sales.slice(0, 10)
        };
    },

    async callGeminiAPI(message, context) {
        // This is a placeholder - actual implementation would call Gemini API
        // For now, return a simulated response

        const contextPrompt = `Eres un asistente virtual para "Arepas el Buen Sabor", un negocio de arepas. 
        Tienes acceso a la siguiente información del negocio:
        - Valor total del inventario: $${context.stats.inventoryValue.toLocaleString()}
        - Ventas del mes: $${context.stats.monthlySales.toLocaleString()}
        - Total empleados: ${context.totalEmployees}
        - Productos registrados: ${context.totalProducts}
        
        Responde de manera útil y profesional a la siguiente pregunta del usuario:
        ${message}`;

        // Simulated response (in production, this would call the actual Gemini API)
        return `Gracias por tu pregunta. Para usar completamente el asistente de IA, necesitas configurar tu API Key de Gemini. 
        
        Sin embargo, puedo ayudarte con información básica:
        - Tienes ${context.totalProducts} productos registrados
        - Ventas del mes: $${context.stats.monthlySales.toLocaleString()}
        - ${context.totalEmployees} empleados activos
        
        Para habilitar respuestas completas con IA, por favor configura tu API Key de Gemini en el botón de configuración.`;
    },

    addMessage(role, content) {
        this.messages.push({ role, content, timestamp: new Date() });
        this.renderMessages();
    },

    renderMessages() {
        const container = document.getElementById('ai-messages');
        if (!container) return;

        container.innerHTML = this.messages.map(msg => `
            <div class="flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}">
                <div class="max-w-[80%] ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'} rounded-lg px-4 py-2">
                    <p class="text-sm">${msg.content}</p>
                    <p class="text-xs mt-1 ${msg.role === 'user' ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'}">
                        ${msg.timestamp.toLocaleTimeString()}
                    </p>
                </div>
            </div>
        `).join('');

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    },

    showTypingIndicator() {
        const container = document.getElementById('ai-messages');
        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.className = 'flex justify-start';
        indicator.innerHTML = `
            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                <div class="flex gap-1">
                    <div class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;
        container.appendChild(indicator);
        container.scrollTop = container.scrollHeight;
    },

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    },

    renderWidget() {
        const container = document.getElementById('ai-assistant-widget');
        if (!container) return;

        container.innerHTML = `
            <!-- Chat Window -->
            <div id="ai-chat-window" class="hidden fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col z-40 transition-colors">
                <!-- Header -->
                <div class="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-4 rounded-t-xl">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <span class="text-2xl">🤖</span>
                            </div>
                            <div>
                                <h3 class="font-semibold">Asistente IA</h3>
                                <p class="text-xs text-emerald-100">Gemini AI</p>
                            </div>
                        </div>
                        ${!this.apiKey ? `
                        <button onclick="AIAssistant.showApiKeyModal()" class="p-2 hover:bg-emerald-700 rounded-lg transition-colors" title="Configurar API Key">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                        </button>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Messages -->
                <div id="ai-messages" class="flex-1 overflow-y-auto p-4 space-y-3">
                    ${this.messages.length === 0 ? `
                    <div class="text-center text-gray-500 dark:text-gray-400 mt-8">
                        <p class="mb-2">👋 ¡Hola! Soy tu asistente virtual.</p>
                        <p class="text-sm">Pregúntame sobre ventas, inventario, empleados o cualquier aspecto del negocio.</p>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Input -->
                <div class="border-t border-gray-200 dark:border-gray-700 p-4">
                    <form id="ai-chat-form" class="flex gap-2">
                        <input 
                            type="text" 
                            id="ai-message-input" 
                            placeholder="Escribe tu mensaje..."
                            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                        <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
            
            <!-- Toggle Button -->
            <button 
                id="ai-toggle-btn" 
                class="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50 hover:scale-110"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
            </button>
        `;

        this.setupEventListeners();
        this.renderMessages();
    },

    showApiKeyModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 transition-colors">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Configurar API Key de Gemini</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Para usar el asistente de IA, necesitas una API Key de Google Gemini.</p>
                
                <form id="api-key-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Key</label>
                        <input 
                            type="text" 
                            id="api-key-input" 
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Ingresa tu API Key"
                        >
                    </div>
                    
                    <div class="flex gap-3">
                        <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" class="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">
                            Guardar
                        </button>
                    </div>
                </form>
                
                <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p class="text-xs text-blue-800 dark:text-blue-300">
                        💡 Obtén tu API Key en: <a href="https://makersuite.google.com/app/apikey" target="_blank" class="underline">Google AI Studio</a>
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const form = modal.querySelector('#api-key-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const key = modal.querySelector('#api-key-input').value.trim();
            if (key) {
                this.saveApiKey(key);
                Toast.success('API Key guardada exitosamente');
                modal.remove();
                this.renderWidget();
            }
        });
    }
};
