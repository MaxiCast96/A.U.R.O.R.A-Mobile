# Proyecto A.U.R.O.R.A - Mobile

![Logo del proyecto](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeSP1tTjjpFSC_UfBfzaTO3R2i_Z_cIxbnIARcPaZlnBNPUHzQa58ogB3wfKNc7MwRynU&usqp=CAU)

## Descripción del Proyecto
**Advanced Unified Retail & Optical Resource Administration (A.U.R.O.R.A) - Mobile** es la aplicación móvil administrativa complementaria al sistema web de **Óptica Inteligente**. Esta aplicación está diseñada para proporcionar a los administradores y empleados una herramienta móvil eficiente para gestionar operaciones clave desde cualquier lugar.

El sistema está desarrollado utilizando **React Native** con **Expo**, garantizando una experiencia nativa en dispositivos iOS y Android con un código base unificado.

## Características Principales
- 📱 **Aplicación Nativa**: Compatible con iOS y Android
- 🏢 **Gestión Administrativa**: Control total de operaciones desde móvil
- 👥 **Gestión de Clientes**: Registro y administración de clientes
- 📅 **Gestión de Citas**: Programación y seguimiento de citas
- 🕶️ **Catálogo de Productos**: Administración de lentes y accesorios
- 📊 **Dashboard Móvil**: Estadísticas y gráficas optimizadas para móvil
- 🔐 **Autenticación Segura**: Login y gestión de sesiones
- 📸 **Carga de Imágenes**: Subida de fotos de productos y perfiles
- 🎨 **Diseño Adaptativo**: Interfaz optimizada para diferentes tamaños de pantalla
- ⚡ **Rendimiento Optimizado**: Navegación fluida y carga rápida

## Tecnologías Utilizadas

### Framework Principal
- **React Native**: Framework para desarrollo de aplicaciones móviles nativas
- **Expo**: Plataforma y herramientas para desarrollo React Native
- **React**: Librería base (v19.0.0)

### Navegación
- **@react-navigation/native**: Navegación principal para React Native
- **@react-navigation/native-stack**: Navegación en pila
- **@react-navigation/bottom-tabs**: Navegación con pestañas inferiores
- **react-native-screens**: Optimización de rendimiento de pantallas
- **react-native-safe-area-context**: Manejo de áreas seguras

### UI y Diseño
- **@expo/vector-icons**: Iconos vectoriales para Expo
- **react-native-vector-icons**: Biblioteca adicional de iconos
- **expo-linear-gradient**: Gradientes lineales
- **react-native-linear-gradient**: Gradientes nativos adicionales
- **react-native-svg**: Soporte para gráficos SVG

### Funcionalidades Específicas
- **axios**: Cliente HTTP para peticiones al backend
- **@react-native-async-storage/async-storage**: Almacenamiento local persistente
- **expo-image-picker**: Selección y captura de imágenes
- **react-native-chart-kit**: Gráficas y visualizaciones de datos
- **expo-status-bar**: Control de la barra de estado

### Herramientas de Desarrollo
- **@babel/core**: Transpilador de JavaScript
- **Expo CLI**: Herramientas de línea de comandos para desarrollo

## Estructura del Proyecto

```
A.U.R.O.R.A-MOBILE/
├── .expo/                  # Configuración de Expo
├── assets/                 # Recursos estáticos (imágenes, iconos, fuentes)
├── node_modules/           # Dependencias del proyecto
├── src/
│   ├── assets/            # Recursos específicos del código fuente
│   ├── components/        # Componentes reutilizables
│   │   ├── Citas/        # Componentes para gestión de citas
│   │   ├── Home/         # Componentes del dashboard principal
│   │   ├── Login/        # Componentes de autenticación
│   │   ├── Profile/      # Componentes de perfil de usuario
│   │   ├── Button.js     # Botón reutilizable
│   │   ├── Card.js       # Tarjeta reutilizable
│   │   ├── CodeInput.js  # Input de código personalizado
│   │   ├── FloatingTabBar.js  # Barra de navegación flotante
│   │   └── Modal.js      # Modal reutilizable
│   ├── context/          # Context providers para estado global
│   ├── hooks/            # Custom hooks
│   ├── navigation/       # Configuración de navegación
│   └── screens/          # Pantallas principales de la aplicación
├── .gitignore            # Archivos ignorados por Git
├── App.js               # Componente principal de la aplicación
├── app.json             # Configuración de Expo
├── index.js             # Punto de entrada de la aplicación
├── package-lock.json    # Lock file de dependencias
├── package.json         # Dependencias y scripts del proyecto
└── README.md           # Documentación del proyecto
```

## Nomenclatura del Proyecto

### Convenciones de Nomenclatura

#### Archivos y Componentes
- **PascalCase**: Componentes React Native, pantallas
- **camelCase**: Variables, funciones, métodos, propiedades
- **kebab-case**: Nombres de archivos de configuración
- **UPPER_SNAKE_CASE**: Constantes globales

#### Pantallas y Navegación
- **Pantallas**: PascalCase (LoginScreen, ClientsScreen, DashboardScreen)
- **Navegadores**: PascalCase (AuthNavigator, TabNavigator)
- **Rutas**: camelCase (clientsList, appointmentDetail)

## Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- npm o yarn
- Expo CLI (`npm install -g @expo/cli`)
- Dispositivo físico con Expo Go o emulador
- Conexión al backend de A.U.R.O.R.A Web

### Configuración del Proyecto

1. **Clonar el repositorio**:
```bash
git clone [URL_DEL_REPOSITORIO]
cd A.U.R.O.R.A-Mobile
```

2. **Instalar dependencias**:
```bash
npm install
```

4. **Ejecutar la aplicación**:

**Desarrollo general**:
```bash
npm start
# o
expo start
```

**Android**:
```bash
npm run android
# o
expo start --android
```

**iOS**:
```bash
npm run ios
# o
expo start --ios
```

**Web (desarrollo)**:
```bash
npm run web
# o
expo start --web
```

## Funcionalidades Implementadas

### ✅ Autenticación y Autorización
- Login para empleados y administradores
- Gestión de sesiones con AsyncStorage
- Rutas protegidas por roles
- Logout seguro con limpieza de datos

### ✅ Panel Administrativo Móvil
- Dashboard con estadísticas en tiempo real
- Gráficas optimizadas para móvil
- Navegación intuitiva con tabs
- Información resumida y accesible

### ✅ Gestión de Clientes
- Lista de clientes con búsqueda
- Registro de nuevos clientes
- Edición de información
- Visualización de historial

### ✅ Gestión de Citas
- Calendario de citas
- Programación desde móvil
- Estados de citas (pendiente, confirmada, completada)
- Notificaciones y recordatorios

### ✅ Catálogo de Productos
- Visualización de lentes y accesorios
- Gestión de inventario básico
- Carga de imágenes de productos
- Categorización y marcas

### ✅ Características Técnicas
- Navegación fluida entre pantallas
- Carga optimizada de imágenes
- Manejo de estados de carga
- Gestión de errores y conectividad
- Diseño responsive para diferentes dispositivos

## Scripts Disponibles

```bash
npm start        # Iniciar Expo development server
npm run android  # Ejecutar en Android
npm run ios      # Ejecutar en iOS
npm run web      # Ejecutar en navegador web
```

## Construcción para Producción

### Android (APK/AAB)
```bash
expo build:android
# o para AAB
expo build:android -t app-bundle
```

### iOS (IPA)
```bash
expo build:ios
```

## Conexión con Backend
La aplicación móvil se conecta al mismo backend que la versión web de A.U.R.O.R.A, utilizando:
- **API REST**: Comunicación con axios
- **Autenticación JWT**: Tokens almacenados de forma segura
- **Subida de imágenes**: Integración con Cloudinary
- **Sincronización**: Datos en tiempo real con el sistema web

## Características de Rendimiento
- **Lazy Loading**: Carga diferida de componentes
- **Optimización de imágenes**: Compresión automática
- **Caché inteligente**: AsyncStorage para datos frecuentes
- **Navegación optimizada**: React Navigation con screens optimizadas

## Integrantes del equipo:
- Jhonatan Josué Valle Gamboa - Coordinador
- Guillermo Rodrigo Chávez Mejía - Subcoordinador
- Fernando Ariel Morales Rodriguez - Secretario
- Luis Fernando Navarró Alemán - Tesorero
- Kevin Josue Alvarado Hernandez - Vocal

---

**Nota**: Esta aplicación móvil está diseñada para complementar el sistema web A.U.R.O.R.A, proporcionando funcionalidades administrativas clave en un formato móvil optimizado para el personal de Óptica Inteligente.
