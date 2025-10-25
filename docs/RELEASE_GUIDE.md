# Guía de Releases y Despliegues

Este documento resume los pasos necesarios para generar artefactos productivos de Cygnus (backend, frontend web, app Android y desktop Windows) partiendo del metarepo. Ejecutá los comandos desde la raíz salvo que se especifique lo contrario.

## 1. Preparación general

- Node.js >= 20 y npm >= 10.
- Instalar dependencias por módulo:
  ```bash
  npm install
  npm install --prefix code/backend/api
  npm install --prefix code/frontend/web
  npm install --prefix code/frontend/android
  npm install --prefix code/frontend/windows
  ```
- Variables de entorno:
  - Backend (`code/backend/api/.env.example`): `PORT`, `LOG_LEVEL`, `CORS_ALLOWED_ORIGINS`, `BGH_TIMEOUT_MS`.
  - Frontend (`code/frontend/web/.env.example`): `VITE_API_BASE_URL` (vacío en dev), `VITE_DEV_API_PROXY`.
  - Producción (`code/frontend/web/.env.production`): `VITE_API_BASE_URL=https://<backend-publico>`.
- Builds de verificación:
  ```bash
  npm run build:backend
  npm run build:web
  ```

## 2. Backend (Railway)

1. Subí los cambios al repositorio.
2. En Railway creá un servicio nuevo:
   - Root directory: `/code/backend/api`
   - Build command: `npm install && npm run build`
   - Start command: `npm run start`
   - Runtime: Node 20
3. Variables de entorno: `PORT`, `CORS_ALLOWED_ORIGINS`, `BGH_TIMEOUT_MS` (opcional) y cualquier secreto adicional que necesites.
4. Validá el despliegue:
   ```bash
   curl https://<servicio>.up.railway.app/api/ping
   ```

### Monorepo en Railway

- Railway acepta monorepos especificando el subdirectorio (`/code/backend/api`). Con `railway.json` podés usar `"rootPath": "code/backend/api"`.

## 3. Frontend Web (Vercel)

1. Confirmá `code/frontend/web/.env.production` con la URL pública del backend.
2. Build opcional local:
   ```bash
   npm run build:web
   ```
3. En Vercel:
   - Root directory: `/code/frontend/web`
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
4. Definí `VITE_API_BASE_URL` (y otros env vars necesarios) en los entornos Production/Preview.

## 4. App Android (Capacitor)

1. Preparación por estación:
   ```bash
   npm install --prefix code/frontend/android
   npm run add:android
   ```
2. Construir assets y sincronizar:
   ```bash
   npm run build:android
   ```
   Esto ejecuta `npm run build:native --prefix code/frontend/web` y copia los assets al proyecto Android mediante `cap sync`.
3. Abrir Android Studio:
   ```bash
   npm run open:android --prefix code/frontend/android
   ```
4. En Android Studio generá el bundle (`Build > Generate Signed Bundle/APK`). Los artefactos se guardan en `code/frontend/android/android/app/build/outputs/`.

**Notas**
- Para apuntar a otro backend sin rebuild, actualizá `code/frontend/android/android/app/src/main/assets/capacitor.config.json`.
- Para backend HTTP en LAN exportá `CAP_SERVER_URL=http://<ip>:<port>` antes de `npm run build:android`.

## 5. App Desktop (Electron + electron-builder)

1. Instalá dependencias:
   ```bash
   npm install --prefix code/frontend/windows
   ```
2. Generá el instalador:
   ```bash
   npm run pack:windows
   ```
   El instalador queda en `code/frontend/windows/dist/`.
3. Requisitos en Windows:
   - Ejecutar la terminal como administrador o activar “Developer Mode” para permitir symlinks.
   - Si aparece `A required privilege is not held by the client`, eliminá `C:\Users\<usuario>\AppData\Local\electron-builder\Cache\winCodeSign` y reintentá.
4. Desarrollo local:
   ```bash
   npm run dev --prefix code/frontend/windows
   ```

## 6. Secuencia para una release

1. Builds:
   ```bash
   npm run build:backend
   npm run build:web
   npm run build:android
   npm run pack:windows
   ```
2. Desplegá backend (Railway) y frontend (Vercel).
3. Generá APK/AAB y `.exe`.
4. Taggea:
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```
5. Publicá release en GitHub con enlaces/artefactos y notas de QA manual.

## 7. Troubleshooting rápido

| Problema | Solución |
|----------|----------|
| `A required privilege is not held by the client` en `npm run pack:windows` | Habilitar Developer Mode o ejecutar la consola como admin; limpiar caché `winCodeSign`. |
| Pantalla en blanco en Electron | Ejecutar `npm run build:native --prefix code/frontend/web` antes de empaquetar y verificar `code/frontend/web/.env.production`. |
| `npm exec cap …` no encuentra binario | Utilizar los scripts del módulo Android (`npm run cap:*` en `code/frontend/android`). |
| Assets servidos desde `/` en build nativa | Asegurarse de correr `npm run build:native --prefix code/frontend/web`. |
| CORS bloqueado | Incluir todos los orígenes en `CORS_ALLOWED_ORIGINS` (`https://<dominio-vercel>,capacitor://localhost`, etc.). |

Actualizá la guía cada vez que cambien scripts o proveedores.
