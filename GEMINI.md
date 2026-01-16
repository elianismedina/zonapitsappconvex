# Contexto del Proyecto: ZonaPitsExpoClerk

Este archivo sirve como guía de contexto para el asistente de IA (Gemini) sobre la arquitectura, tecnologías y convenciones utilizadas en este proyecto.

## 1. Stack Tecnológico Principal

- **Framework:** React Native con Expo (SDK 54+).
- **Lenguaje:** TypeScript.
- **Backend / Base de Datos:** [Convex](https://convex.dev/) (Backend-as-a-Service).
- **Autenticación:** [Clerk](https://clerk.com/) (integrado con Expo y Convex).
- **UI Framework:** [Gluestack UI v2](https://gluestack.io/) (componentes estilizados y accesibles).
- **Estilos:** [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS para React Native).
- **Navegación:** Expo Router (basado en archivos).
- **Gestión de Paquetes:** npm.

## 2. Infraestructura y Despliegue

- **Builds:** EAS Build (Expo Application Services).
  - Se utiliza `expo-dev-client` para Development Builds.
- **Actualizaciones:** EAS Update (actualizaciones OTA).
- **Configuración:**
  - `app.json` / `app.config.js`: Configuración de Expo.
  - `eas.json`: Configuración de perfiles de construcción (development, preview, production).

## 3. Estructura del Proyecto

- **/app**: Rutas de la aplicación (Expo Router).
  - `(auth)`: Grupo de rutas protegidas o relacionadas con autenticación.
  - `(public)`: Rutas públicas.
  - `(tabs)`: Navegación por pestañas principal.
  - `_layout.tsx`: Layouts raíz y anidados.
- **/components**: Componentes de React reutilizables.
  - `/ui`: Componentes de Gluestack UI.
- **/convex**: Funciones de backend (queries, mutations, actions) y esquema de base de datos (`schema.ts`).
- **/assets**: Imágenes, fuentes y vectores.
- **/constants**: Constantes globales (colores, temas).
- **/hooks**: Hooks personalizados (ej. `useColorScheme`).

## 4. Convenciones y Patrones

- **Componentes UI:** Preferir el uso de componentes de Gluestack UI (`/components/ui`) sobre componentes nativos crudos (`View`, `Text`) para mantener consistencia visual.
- **Iconos:** Se utiliza `lucide-react-native` (a menudo integrados en Gluestack) o `@expo/vector-icons`.
- **Autenticación:**
  - El estado de autenticación se gestiona mediante Clerk (`useAuth`, `useUser`).
  - Convex se integra con Clerk para asegurar las consultas a la base de datos.
- **Backend Calls:**
  - Usar hooks de Convex (`useQuery`, `useMutation`) para interactuar con la base de datos.
  - Definir nuevas funciones en la carpeta `/convex` y regenerar tipos si es necesario (`npx convex dev`).

## 5. Comandos Comunes

- `npx expo start`: Iniciar el servidor de desarrollo.
- `npx convex dev`: Iniciar el servidor de desarrollo de Convex (sincronización de funciones).
- `eas build --profile development --platform android`: Crear una build de desarrollo para Android.
- `eas update`: Publicar una actualización OTA.

## 6. Notas Adicionales para la IA

- Al generar código UI, utiliza las clases de utilidad de Tailwind (vía NativeWind) o las propiedades de estilo de Gluestack UI según corresponda.
- Al modificar el esquema de datos, recuerda que se debe editar `convex/schema.ts`.
- Ten en cuenta que el enrutamiento es basado en archivos dentro de la carpeta `app`.
