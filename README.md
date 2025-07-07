# Eventopia

## Descripción
Eventopia es una plataforma web para la gestión y participación en eventos. Permite a los usuarios explorar eventos disponibles, registrarse en ellos, y gestionar su perfil y eventos inscritos.

## Características
- **Exploración de eventos**: Visualización de todos los eventos disponibles con filtros por categoría, ubicación y precio.
- **Gestión de perfil**: Los usuarios pueden crear una cuenta, iniciar sesión y personalizar su perfil.
- **Inscripción a eventos**: Posibilidad de inscribirse y cancelar inscripciones a eventos.
- **Inscripciones personalizadas**: Sistema avanzado de inscripciones con formularios personalizables que incluyen información personal, ubicación, contacto de emergencia, requerimientos especiales y notas adicionales.
- **Gestión de inscripciones**: Panel completo para visualizar y administrar tanto inscripciones regulares como personalizadas con estadísticas detalladas.
- **Panel de control**: Estadísticas sobre eventos disponibles, inscripciones y categorías.
- **Interfaz responsiva**: Diseño adaptable a diferentes dispositivos.
- **Notificaciones**: Sistema de notificaciones para informar al usuario sobre acciones importantes.
- **Modales interactivos**: Uso de modales para edición de perfil, confirmaciones y detalles de inscripciones.
- **Gestión de sesiones**: Autenticación y manejo de sesiones de usuario.
- **Componentes reutilizables**: Estructura modular para facilitar el mantenimiento y la escalabilidad.

## Estructura del proyecto
- `index.html`: Página principal con exploración de eventos y panel de usuario.
- `login.html`: Página de inicio de sesión.
- `register.html`: Página de registro de usuario.
- `profile.html`: Página de perfil de usuario, permite editar datos personales.
- `custom-registration.html`: Página de inscripción personalizada con formularios avanzados.
- `my-registrations.html`: Página para gestionar inscripciones regulares del usuario.
- `my-custom-registrations.html`: Página para gestionar inscripciones personalizadas del usuario.
- `assets/`: Carpeta que contiene los archivos estáticos.
    - `css/`: Estilos CSS globales y específicos.
        - `base.css`, `main.css`: Estilos base y principales.
        - `components/`: Estilos para componentes como botones, formularios, tarjetas, modales, notificaciones, etc.
        - `layout/`: Estilos para la estructura de la página (header, footer, grid).
        - `pages/`: Estilos específicos para páginas como autenticación y perfil.
    - `js/`: Archivos JavaScript.
        - `components/`: Componentes reutilizables como [`AuthManager.js`](assets/js/components/AuthManager.js), [`EventManager.js`](assets/js/components/EventManager.js), [`ModalManager.js`](assets/js/components/ModalManager.js), [`NotificationManager.js`](assets/js/components/NotificationManager.js), [`SidebarManager.js`](assets/js/components/SidebarManager.js), [`UIManager.js`](assets/js/components/UIManager.js), [`User.js`](assets/js/components/User.js), [`RegistrationManager.js`](assets/js/components/RegistrationManager.js).
        - `pages/`: Scripts específicos para cada página.
        - `utils/`: Funciones utilitarias y helpers.
- `.vscode/`: Configuración recomendada para Visual Studio Code.

## Funcionalidades Avanzadas

### Sistema de Inscripciones Personalizadas
Eventopia incluye un sistema completo de inscripciones personalizadas que permite:

- **Formularios dinámicos**: Inscripciones con campos personalizables según el tipo de evento
- **Información detallada**: Recopilación de datos personales, ubicación, contacto de emergencia
- **Requerimientos especiales**: Campo para necesidades específicas (dietas, accesibilidad, etc.)
- **Gestión centralizada**: Panel unificado para administrar todas las inscripciones
- **Estadísticas en tiempo real**: Métricas sobre inscripciones activas, completadas y pendientes
- **Validación avanzada**: Verificación de datos y términos y condiciones

### Optimizaciones de Rendimiento
- **HTML optimizado**: Eliminación de comentarios innecesarios para reducir el tamaño de archivos
- **Código limpio**: Estructura mejorada para mejor mantenibilidad
- **Carga más rápida**: Optimización de recursos para mejor experiencia de usuario

### Gestión de Inscripciones
- **Vista unificada**: Panel que muestra tanto inscripciones regulares como personalizadas
- **Filtros avanzados**: Búsqueda por estado, fecha, tipo de evento
- **Detalles completos**: Modales con información detallada de cada inscripción
- **Acciones rápidas**: Cancelación y modificación de inscripciones

## Instalación y uso

1. Clona el repositorio:
   ```sh
   git clone https://github.com/NAbantoHuaman/EventHUb
   ```
2. Abre `index.html` en tu navegador web

## Contribución
Las contribuciones son bienvenidas. Si encuentras algún error o tienes sugerencias de mejora, por favor abre un issue o envía un pull request.

## Licencia
Este proyecto está bajo la Licencia MIT.





