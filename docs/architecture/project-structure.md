# Reestructuración del proyecto

Este documento resume la nueva organización del repositorio tras la reestructuración de Cygnus. El objetivo es tener un monorepo coherente donde cada superficie (API, web, escritorio) convive bajo un esquema de workspaces de npm que facilita los comandos compartidos y el versionado.

## Workspaces

El `package.json` de la raíz ahora declara los workspaces `backend`, `frontend` y `desktop`. Gracias a esto se pueden instalar dependencias desde la raíz y ejecutar scripts en cascada:

- `npm install` resuelve las dependencias de todos los paquetes.
- `npm run build` ejecuta el build disponible en cada workspace.
- `npm run build:backend`, `npm run build:frontend` y `npm run build:desktop` permiten invocar builds individuales sin cambiar de directorio.

## Estructura de carpetas

```
/
├── backend/      # API Express con TypeScript y Vitest
├── frontend/     # Interfaz React + Vite (modo web y modo nativo)
├── desktop/      # Cliente de escritorio basado en Electron que reutiliza el build nativo del frontend
├── docs/         # Documentación para agentes Codex y notas de trabajo
└── package.json  # Configuración común del monorepo y scripts orquestadores
```

### Backend (`backend/`)
- Código fuente en `src/` con entrada en `src/index.ts`.
- Compilación con `npm run build --workspace backend` que genera `dist/`.

### Frontend (`frontend/`)
- Entradas en `src/main.tsx` y build web con Vite.
- `npm run build --workspace frontend` compila la versión web; el modo nativo se dispara desde el workspace de escritorio.

### Escritorio (`desktop/`)
- Scripts que orquestan la compilación del frontend en modo nativo y ejecutan Electron.
- Nuevo script `npm run build --workspace desktop` para generar los assets nativos sin empaquetar.

## Próximos pasos

- Centralizar configuración compartida (por ejemplo ESLint) usando workspaces.
- Añadir pipelines de CI que aprovechen los comandos centralizados (`npm run build`).
- Documentar dependencias específicas de cada superficie dentro de `docs/`.
