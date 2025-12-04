# 🫓 Arepas el Buen Sabor - Sistema de Gestión Empresarial

Sistema completo de gestión empresarial para el negocio de arepas, desarrollado con tecnologías web modernas y diseño limpio con Tailwind CSS.

## 🚀 Características Principales

### 1. **Autenticación y Seguridad**
- Sistema de login con validación de credenciales
- Gestión de sesiones
- Notificaciones Toast para feedback visual

### 2. **Dashboard Interactivo**
- Tarjetas KPI en tiempo real:
  - Valor total del inventario
  - Ventas del mes
  - Nómina mensual
  - Total de productos únicos
- Gráficos interactivos:
  - Ventas diarias (gráfico de barras)
  - Distribución de productos (gráfico circular)
- Filtros por mes y año

### 3. **Gestión de Inventario**
- CRUD completo de productos terminados
- Control de stock con alertas visuales
- Búsqueda y filtrado de productos
- Exportación a CSV

### 4. **Punto de Venta (POS)**
- Interfaz intuitiva para registro de ventas
- Carrito de compras
- Descuento automático de inventario
- Validación de stock disponible
- Historial de ventas

### 5. **Materia Prima e Insumos**
- Inventario de ingredientes
- Registro de compras y uso
- Tipos de movimiento:
  - Compras
  - Uso en producción
  - Venta directa
  - Desperdicio
- Historial completo de transacciones

### 6. **Proveedores**
- Directorio de proveedores
- Información de contacto completa
- Vinculación con productos
- Exportación a CSV

### 7. **Recursos Humanos**
- Gestión de empleados
- Generador automático de nómina mensual
- Historial de pagos
- Cálculo automático de totales

### 8. **Asistente de IA (Gemini)**
- Chat flotante integrado
- Acceso a datos del sistema
- Respuestas contextuales sobre el negocio
- Configuración de API Key

### 9. **PWA (Progressive Web App)**
- Instalable en escritorio y móvil
- Funciona offline
- Icono en el escritorio
- Experiencia de app nativa

## 📋 Requisitos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet (solo para primera carga)
- (Opcional) API Key de Google Gemini para el asistente de IA

## 🔧 Instalación

### Opción 1: Servidor Local Simple

1. Abre una terminal en la carpeta del proyecto
2. Ejecuta un servidor local:

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (npx)
npx serve .

# Con PHP
php -S localhost:8000
```

3. Abre tu navegador en `http://localhost:8000`

### Opción 2: Abrir Directamente

Simplemente abre el archivo `index.html` en tu navegador.

### Opción 3: Instalar como PWA

1. Abre la aplicación en tu navegador
2. Busca el ícono de instalación en la barra de direcciones
3. Haz clic en "Instalar" o "Agregar a pantalla de inicio"

## 👤 Credenciales por Defecto

**Usuario:** `admin`  
**Contraseña:** `admin123`

> ⚠️ **Importante:** Cambia estas credenciales en producción editando el archivo `js/database.js`

## 📱 Uso

### Primera Vez

1. Inicia sesión con las credenciales por defecto
2. Explora el dashboard para ver las métricas generales
3. Revisa los datos de ejemplo precargados
4. Comienza a personalizar con tus propios datos

### Módulos Principales

- **Dashboard:** Vista general del negocio
- **Inventario:** Gestiona productos terminados
- **Ventas:** Registra ventas y consulta historial
- **Materia Prima:** Controla ingredientes e insumos
- **Proveedores:** Administra contactos de proveedores
- **RRHH:** Gestiona empleados y genera nóminas
- **Configuración:** Resetea datos y consulta el manual

### Asistente de IA

1. Haz clic en el botón flotante de chat (esquina inferior derecha)
2. Si es la primera vez, configura tu API Key de Gemini
3. Haz preguntas sobre ventas, inventario, empleados, etc.

**Obtener API Key:**
- Visita [Google AI Studio](https://makersuite.google.com/app/apikey)
- Crea una cuenta si no tienes
- Genera una API Key
- Pégala en la configuración del asistente

## 💾 Base de Datos

### LocalStorage (Frontend)

La aplicación usa LocalStorage del navegador para persistir datos. Los datos se mantienen incluso al cerrar el navegador.

**Tablas:**
- `users` - Usuarios del sistema
- `products` - Productos terminados
- `sales` - Registro de ventas
- `rawMaterials` - Materia prima e insumos
- `materialTransactions` - Movimientos de materia prima
- `suppliers` - Proveedores
- `employees` - Empleados
- `payrolls` - Nóminas generadas

## 📊 Exportación de Datos

Todos los módulos principales permiten exportar datos a CSV:
- Inventario de productos
- Historial de ventas
- Lista de proveedores
- Empleados
- Materia prima

Los archivos se descargan automáticamente con la fecha actual.

## 🎨 Personalización

### Colores

Edita las variables CSS en `styles.css`:

```css
:root {
    --primary-color: #10b981;  /* Verde principal */
    --secondary-color: #3b82f6; /* Azul secundario */
    /* ... más colores */
}
```

### Logo y Nombre

Edita en `app.js` la función `renderMainLayout()` para cambiar el nombre y emoji del negocio.

## 🔄 Resetear Datos

1. Ve a **Configuración**
2. Haz clic en "Resetear Sistema"
3. Confirma la acción
4. El sistema volverá a los datos de fábrica

## 📱 Responsive Design

La aplicación está optimizada para:
- 💻 Escritorio (1920x1080 y superiores)
- 💻 Laptop (1366x768)
- 📱 Tablet (768x1024)
- 📱 Móvil (375x667 y superiores)

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura
- **Tailwind CSS** - Estilos y diseño
- **JavaScript (Vanilla)** - Lógica de negocio
- **Chart.js** - Gráficos interactivos
- **LocalStorage API** - Persistencia de datos
- **Service Workers** - Funcionalidad offline (PWA)
- **Google Gemini AI** - Asistente inteligente

## 📝 Estructura del Proyecto

```
arepaselbuensabor/
├── index.html              # Página principal
├── styles.css              # Estilos personalizados
├── app.js                  # Controlador principal
├── manifest.json           # Configuración PWA
├── service-worker.js       # Service Worker
├── js/
│   ├── database.js         # Capa de datos
│   ├── utils/
│   │   ├── toast.js        # Notificaciones
│   │   ├── charts.js       # Gráficos
│   │   └── export.js       # Exportación CSV
│   └── modules/
│       ├── auth.js         # Autenticación
│       ├── dashboard.js    # Dashboard
│       ├── inventory.js    # Inventario
│       ├── sales.js        # Ventas
│       ├── rawMaterials.js # Materia prima
│       ├── suppliers.js    # Proveedores
│       ├── hr.js           # RRHH
│       └── aiAssistant.js  # Asistente IA
└── icons/                  # Iconos PWA
```

## 🐛 Solución de Problemas

### Los datos no se guardan
- Verifica que LocalStorage esté habilitado en tu navegador
- Revisa la consola del navegador (F12) para errores

### Los gráficos no se muestran
- Asegúrate de tener conexión a internet (para cargar Chart.js)
- Verifica que haya datos en el sistema

### El asistente de IA no responde
- Configura tu API Key de Gemini
- Verifica que la API Key sea válida
- Revisa tu conexión a internet

## 📄 Licencia

Este proyecto fue desarrollado para "Arepas el Buen Sabor". Todos los derechos reservados.

## 👨‍💻 Soporte

Para soporte o consultas, contacta al administrador del sistema.

---

**Versión:** 1.0.0  
**Última actualización:** Diciembre 2024  
**Desarrollado con ❤️ para Arepas el Buen Sabor**
