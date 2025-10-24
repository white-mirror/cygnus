# Cygnus

Cygnus es una plataforma interna para administrar dispositivos conectados desde un único panel web. El repositorio agrupa un backend Express que expone la API y un frontend React que consume esos servicios y ofrece la interfaz para los usuarios.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Instalación

Ejecuciones iniciales desde la raíz del proyecto para preparar cada módulo:

```bash
npm install
npm install --prefix codebase/backend-api
npm install --prefix codebase/frontend-web
npm install --prefix codebase/frontend-android
npm install --prefix codebase/frontend-windows
```

## Ejecución en desarrollo

### Backend

```bash
npm run dev:backend
```

El servidor queda disponible en `http://localhost:4000` y recarga automáticamente al detectar cambios en TypeScript. Podés ajustar el puerto seteando la variable de entorno `PORT`.

### Frontend

```bash
npm run dev:web
```

La interfaz se sirve en `http://localhost:5173`. El comando utiliza Vite y habilita recarga en caliente.

### Ambos servicios a la vez

Si preferís levantar todo con un único comando, ejecutá:

```bash
npm run dev
```

El script invoca ambos servidores con `concurrently` para que corran en paralelo.

## Estructura

- `codebase/backend-api/`: API REST escrita en TypeScript con Express.
- `codebase/frontend-web/`: Aplicación React + Vite que sirve como base web.
- `codebase/frontend-android/`: Proyecto Capacitor que empaqueta la web para Android.
- `codebase/frontend-windows/`: Proyecto Electron que empaqueta la web para Windows.
- `docs/`: Guías para agentes Codex y notas de trabajo.

## Formato y verificación

- Formateo: `npm run format` ejecuta Prettier sobre todo el proyecto.
- Builds individuales: `npm run build:backend`, `npm run build:web`, `npm run build:android` y `npm run pack:windows`.
- Testing del backend: `npm run test --prefix codebase/backend-api` ejecuta Vitest (cuando haya pruebas).

## Variables de entorno

El backend lee las variables desde un archivo `.env` o del entorno del sistema. Al menos considerá:

- `PORT`: Puerto HTTP para la API (por defecto `4000`).
- `LOG_LEVEL`: Nivel de logging para Pino (por defecto `info`).
- `CORS_ALLOWED_ORIGINS`: Lista separada por comas con los orígenes permitidos (por ejemplo `https://cygnus-frontend.vercel.app,capacitor://localhost`).
- `BGH_EMAIL` y `BGH_PASSWORD`: Credenciales para autenticarse contra la API de BGH.
- `BGH_TIMEOUT_MS`: Timeout opcional (en milisegundos) para requests al servicio de BGH.

En el frontend creá un archivo `.env` basado en `.env.example` con:

- `VITE_API_BASE_URL`: URL base de la API (dejalo vacío en desarrollo para usar el proxy local).
- `VITE_DEV_API_PROXY`: URL del backend local durante el desarrollo (por defecto `http://localhost:4000`).

Para la compilación productiva podés duplicar `.env.production.example` y completar el endpoint público del backend (por ejemplo el de Railway).

## Despliegue

### Backend en Railway

1. Asegurate de tener el build listo:
   ```bash
   npm run build:backend
   ```
2. Subí los cambios a GitHub y, desde la UI de Railway, creá un nuevo servicio seleccionando el repositorio.
3. Configurá el directorio raíz como `/codebase/backend-api` y los comandos:
   - Build: `npm install && npm run build`
   - Start: `npm run start`
4. Definí las variables de entorno (`PORT`, `CORS_ALLOWED_ORIGINS`, `BGH_EMAIL`, `BGH_PASSWORD`, etc.).
5. Desplegá y verificá con:
   ```bash
   curl https://<tu-servicio>.up.railway.app/api/ping
   ```

### Frontend en Vercel

1. Generá los assets:
   ```bash
   npm run build:web
   ```
2. En Vercel importá el repositorio y seleccioná `/codebase/frontend-web` como directorio raíz.
3. Configurá el framework como “Vite”, comando de build `npm run build` y carpeta de salida `dist`.
4. Cargá las variables de entorno (`VITE_API_BASE_URL` apuntando al dominio de Railway).
5. Desplegá y probá la aplicación (ejemplo `https://cygnus-frontend.vercel.app`) corroborando que las llamadas a `/api/*` usen el backend remoto.

### App Android (Capacitor)

1. Instalá dependencias (solo la primera vez):
   ```bash
   npm install --prefix codebase/frontend-android
   ```
2. Agregá la plataforma Android (una sola vez):
   ```bash
   npm run add:android
   ```
3. Compilá el frontend y sincronizá Capacitor:
   ```bash
   npm run build:android
   ```
   El comando compila Vite y ejecuta `npm run cap:sync -- android`, generando/actualizando el proyecto nativo.
4. Abrí el proyecto en Android Studio:
   ```bash
   npm run open:android --prefix codebase/frontend-android
   ```
5. Configurá la firma y creá el artefacto (`Build > Generate Signed Bundle / APK`). Los archivos quedarán bajo `codebase/frontend-android/android/app/build/outputs/`.

Opcional: si necesitás apuntar a un backend distinto sin regenerar el build, actualizá `codebase/frontend-android/android/app/src/main/assets/capacitor.config.json`.

### App de escritorio (Electron)

1. Instalá las dependencias de la carpeta `codebase/frontend-windows` (solo una vez):
   ```bash
   npm install --prefix codebase/frontend-windows
   ```
2. Generá la build web y empaquetá para Windows:
   ```bash
   npm run pack:windows
   ```
   El instalador (`.exe`) se guarda en `codebase/frontend-windows/dist/`. Si el proceso falla con el mensaje `A required privilege is not held by the client`, habilitá el **Developer Mode** de Windows (`Settings → Privacy & Security → For developers`) o abrí la terminal como administrador para permitir la creación de symlinks.
3. Para desarrollo local podés usar:
   ```bash
   npm run dev --prefix codebase/frontend-windows
   ```
   Esto reconstruye el frontend y abre la app en modo escritorio.

Agregá variables adicionales según las integraciones que habilites y documentalas en este archivo cuando corresponda.
