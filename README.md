# Cygnus

Cygnus es una plataforma interna para administrar dispositivos conectados desde un único panel web. El repositorio agrupa un backend Express que expone la API y un frontend React que consume esos servicios y ofrece la interfaz para los usuarios.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Instalación

Ejecutá las instalaciones desde la raíz del proyecto para preparar cada paquete:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

## Ejecución en desarrollo

### Backend

```bash
npm run dev --prefix backend
```

El servidor queda disponible en `http://localhost:4000` y recarga automáticamente al detectar cambios en TypeScript. Podés ajustar el puerto seteando la variable de entorno `PORT`.

### Frontend

```bash
npm run dev --prefix frontend
```

La interfaz se sirve en `http://localhost:5173`. El comando utiliza Vite y habilita recarga en caliente.

### Ambos servicios a la vez

Si preferís levantar todo con un único comando, ejecutá:

```bash
npm run dev
```

El script invoca ambos servidores con `concurrently` para que corran en paralelo.

## Estructura

- `backend/`: API REST escrita en TypeScript con Express, configurada con CORS, logging y rutas de autenticación.
- `frontend/`: Aplicación React + Vite que consume la API y ofrece el panel de control.
- `docs/`: Guías para agentes Codex y notas de trabajo.

## Formato y verificación

- Formateo: `npm run format` ejecuta Prettier sobre todo el proyecto.
- Builds individuales: `npm run build --prefix backend` y `npm run build --prefix frontend`.
- Testing del backend: `npm run test --prefix backend` ejecuta Vitest (cuando haya pruebas). Actualmente no hay tests para el frontend.

## Variables de entorno

El backend lee las variables desde un archivo `.env` o del entorno del sistema. Al menos considerá:

- `PORT`: Puerto HTTP para la API (por defecto `4000`).

Agregá variables adicionales según las integraciones que habilites y documentalas en este archivo cuando corresponda.
