# Sistema de Diseño Inmutable - Queryclin

Este documento define los elementos visuales sagrados que garantizan la identidad de marca y la experiencia de usuario (UX) del sistema. **PROHIBIDO** realizar cambios en estos elementos sin una solicitud explícita del usuario que mencione específicamente el componente.

## 1. Logotipo Principal
- **Nombre**: Queryclin
- **Composición**: 
    - `Query`: Fuente 'Inter' (o sans-serif), peso **Black (900)**, color `var(--accent-clinical)` (#2563eb).
    - `clin`: Fuente 'Inter', peso **Medium (500)**, color `var(--text-primary)`.
- **Efecto**: `tracking-tighter` (-0.05em).
- **Justificación**: El contraste de pesos entre "Query" (el motor) y "clin" (el dominio) es la base de la identidad visual.

## 2. Indicador NachuS
- **Texto**: NachuS
- **Tratamiento**: Cada letra debe conservar su color específico de la paleta Google (Multicolor).
    - **N**: #4285F4 (Azul)
    - **a**: #EA4335 (Rojo)
    - **c**: #FBBC05 (Amarillo)
    - **h**: #4285F4 (Azul)
    - **u**: #34A853 (Verde)
    - **S**: #EA4335 (Rojo)
- **Justificación**: Representa la herencia tecnológica y la agilidad del motor de búsqueda.

## 3. Paleta de Colores Clinical Premium
- **Acento**: `#2563eb` (Blue 600) para acciones primarias.
- **Fondo**: `#f8fafc` (Slate 50) para evitar deslumbramientos.
- **Superficie**: `#ffffff` con bordes suaves `#e2e8f0`.
- **Modo Oscuro**: Fondo `#0f172a` (Slate 950) con acentos en `#3b82f6`.

## 4. Estructura de Tabla de Constantes
- **Layout**: 4 columnas equitativas.
- **Estilo**: Fondo suave `bg-blue-50/30`, bordes definidos, etiquetas en negrita.
- **Ubicación**: Siempre integrada en la subcategoría de **CONSTANTES** para HCE-OBS.

## 5. Regla de Oro (Drift Prevention)
Si una actualización de funcionalidad (ej. añadir un botón) requiere modificar el `GlobalHeader`, el desarrollador debe asegurarse de que los elementos 1 y 2 permanezcan **exactamente iguales** en su CSS y estructura HTML.
