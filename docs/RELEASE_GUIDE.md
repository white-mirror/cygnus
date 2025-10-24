# Guía de Releases y Despliegues

Este documento resume los pasos necesarios para generar artefactos productivos de Cygnus (backend, frontend web, app Android y desktop Windows) partiendo del monorepo. Todos los comandos deben ejecutarse desde la raíz del repositorio salvo que se indique lo contrario.

## 1. Preparación general

- Node.js >= 20 y npm >= 10 instalados.
- `npm install`, `npm install --prefix backend`, `npm install --prefix frontend` y `npm install --prefix desktop` ejecutados al menos una vez por estación.
- Variables de entorno definidas:
  - Backend (`backend/.env.example`): `PORT`, `LOG_LEVEL`, `CORS_ALLOWED_ORIGINS`, `BGH_EMAIL`, `BGH_PASSWORD`, `BGH_TIMEOUT_MS`.
  - Frontend (`frontend/.env.example`): `VITE_API_BASE_URL` (vacío para desarrollo) y `VITE_DEV_API_PROXY`.
  - Producción (`frontend/.env.production`): `VITE_API_BASE_URL=https://<backend-publico>`.
- Ejecutar los builds verificativos:
  ```bash
  npm run build --prefix backend
  npm run build --prefix frontend
  ```

## 2. Backend (Railway)

1. Subí los cambios a GitHub.
2. En Railway crea un nuevo servicio desde el repositorio principal.
   - Directorio (Root directory): `/backend`.
   - Build command: `npm install && npm run build`.
   - Start command: `npm run start`.
   - Runtime sugerido: Node 20.
3. Configurá las variables de entorno del servicio:
   - `PORT=4000` (o el puerto que prefieras).
   - `CORS_ALLOWED_ORIGINS` con la lista de orígenes permitidos (`https://<dominio-vercel>`, `capacitor://localhost`, `http://localhost:5173`).
   - Credenciales BGH y cualquier secreto adicional.
4. Desplegá y validá la salud:
   ```bash
   curl https://<servicio>.up.railway.app/api/ping
   ```

### Monorepo en Railway

- Railway permite monorepos siempre que selecciones el subdirectorio correcto (`/backend`). Si usás `railway.json`, podés definir `"rootPath": "backend"`.
- Las instalaciones se hacen por servicio, por lo que no es necesario separar repositorios.

## 3. Frontend Web (Vercel)

1. Asegurate de tener `frontend/.env.production` apuntando al backend de Railway.
2. Ejecutá el build localmente si querés validar:
   ```bash
   npm run build --prefix frontend
   ```
3. En Vercel:
   - Importá el mismo repositorio.
   - Directorio raíz: `/frontend`.
   - Framework: “Vite”.
   - Build command: `npm run build`.
   - Output directory: `dist`.
   - Alias de producción: por ejemplo `cygnus-frontend`.
4. Configurá las variables de entorno (`VITE_API_BASE_URL`, opcionalmente `NODE_OPTIONS=--max_old_space_size=3072` si necesitás más memoria en builds grandes).
5. Desplegá y verificá que la aplicación utilice el backend remoto.

### Monorepo en Vercel

- Vercel permite especificar el directorio raíz (`Project Settings → General → Root Directory`). No es necesario extraer el frontend a otro repo.
- Si querés evitar que el directorio `/backend` dispare builds, podés definir un “Ignored Build Step” como `cd .. && npm run lint --if-present`. No suele ser necesario.

## 4. App Android (Capacitor)

1. Preparativos únicos por estación:
   ```bash
   npm install --prefix frontend
   npm run cap:add --prefix frontend -- android
   ```
2. Generar artefacto nativo (cada release):
   ```bash
   npm run build:android --prefix frontend
   ```
   Este comando ejecuta `npm run build:native --prefix frontend` (que produce assets con `base: "./"`) y luego sincroniza con Capacitor.
3. Abrir en Android Studio:
   ```bash
   npm run open:android --prefix frontend
   ```
4. Dentro de Android Studio:
   - Configurá la firma (`Build > Generate Signed Bundle/APK`) y generá `.aab` o `.apk`.
   - Los artefactos quedan en `frontend/android/app/build/outputs/`.

### Notas importantes

- Si necesitás apuntar a un backend distinto sin rebuild, actualizá `frontend/android/app/src/main/assets/capacitor.config.json`.
- Para pruebas en LAN sin HTTPS, podés exportar `CAP_SERVER_URL=http://<ip>:<port>` antes de correr `npm run build:android`.
- Verificá los permisos del dispositivo/emulador para tráfico http (Android 9+ requiere `network_security_config` si usás HTTP plano).

## 5. App Desktop (Electron + electron-builder)

1. Instalá dependencias (una vez por estación):
   ```bash
   npm install --prefix desktop
   ```
2. Generá el instalador de Windows:
   ```bash
   npm run pack --prefix desktop
   ```
   - El script compila el frontend en modo `native` y ejecuta `electron-builder`.
   - El instalador queda en `desktop/dist/`.
3. Requisitos en Windows:
   - Ejecutar la terminal como administrador **o** activar “Developer Mode” (Settings → Privacy & Security → For developers) para permitir symlinks.
   - Si aparece el error `A required privilege is not held by the client`, borrá `C:\Users\<usuario>\AppData\Local\electron-builder\Cache\winCodeSign` y reintentá.
4. Para desarrollo local:
   ```bash
   npm run dev --prefix desktop
   ```
   Esto reconstruye el frontend y abre la app Electron apuntando al build nativo más reciente.

## 6. Secuencia para un release completo

1. Verificar builds:
   ```bash
   npm run build --prefix backend
   npm run build --prefix frontend
   npm run build:android --prefix frontend   # genera assets y sync
   npm run pack --prefix desktop             # generar instalador
   ```
2. Desplegar backend en Railway (pasos sección 2).
3. Desplegar frontend en Vercel (sección 3).
4. Generar APK/AAB firmado desde Android Studio.
5. Generar instalador Windows (`desktop/dist/...`).
6. Etiquetar release en Git:
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```
7. Publicar release en GitHub adjuntando:
   - URL de backend y frontend.
   - APK/AAB y `.exe`.
   - Notas de cambios y pasos de verificación manual.

## 7. Troubleshooting rápido

| Problema | Solución |
|----------|----------|
| `A required privilege is not held by the client` en `npm run pack --prefix desktop` | Activar Developer Mode o ejecutar terminal como admin; borrar caché `winCodeSign`. |
| Pantalla en blanco en Electron | Asegurarse de usar `npm run build:native --prefix frontend` antes de empaquetar; verificar `frontend/.env.production`. |
| `npm exec cap …` no encuentra binario | Utilizar los scripts `npm run cap:*` definidos en `frontend/package.json`, que llaman al CLI directamente desde `node_modules`. |
| Vite sirve assets desde `/` en native build | Confirmar que se ejecutó `npm run build:native --prefix frontend`; este comando fuerza `base: "./"`. |
| CORS falla para Vercel/Capacitor | Incluir los dominios en `CORS_ALLOWED_ORIGINS` separados por comas (`https://<dominio-vercel>,capacitor://localhost`). |

---

Actualizá este documento cada vez que se agregue un nuevo target de despliegue o cambien los scripts. Si algún proveedor modifica requisitos (por ejemplo, límites de Railway o Vercel), aclaralo en secciones específicas.
