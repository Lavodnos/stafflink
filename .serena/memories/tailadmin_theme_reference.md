Hallazgos del repo TailAdmin (free-nextjs-admin-dashboard, Next.js + Tailwind v4) en PRUEBA/free-nextjs-admin-dashboard-main:

- Theming en `src/app/globals.css`:
  - Define tokens extensos en `@theme` (tipos, breakpoints, grises, brand, estados, sombras). Usa `@custom-variant dark (&:is(.dark *));` para activar variantes con clase `.dark` en `<html>`.
  - Base: body aplica font Outfit, bg-gray-50; compatibilidad border-color para Tailwind v4.
  - Utilities custom: `menu-item*`, `menu-dropdown*`, `no-scrollbar`, `custom-scrollbar`, overrides para 3rd-party (apexcharts, flatpickr), etc.

- Theme toggle/context:
  - `src/context/ThemeContext.tsx`: Theme = 'light' | 'dark'; lee `localStorage.theme` (default light), añade/quita `.dark` en document.documentElement, persiste en localStorage; toggle alterna entre light/dark. No considera `prefers-color-scheme` ni modo system.

- Uso en componentes/layout:
  - Layouts (AppHeader/AppSidebar) y muchos componentes usan `dark:` en clases (bg-gray-900, text-white/90, bordes gray-800, etc.). Sidebar usa variantes de logo light/dark. Componentes comunes usan tokens/vars de grises/brand.
  - Cards/tables: bg-white + dark:bg-white/[0.03]; border-gray-200 + dark:border-gray-800.

- Licencia: MIT (archivo LICENSE en repo).

Puntos clave a reutilizar:
- Patrón de theming con `.dark` + tokens @theme y color vars; utilidades de scroll/menu.
- Contexto simple para toggle (localStorage) si se quiere copiar el enfoque (adaptar a prefers-color-scheme si se mejora).

Ruta en disco: `/mnt/c/PROYECTOS _DOCKER/PRUEBA/free-nextjs-admin-dashboard-main/`.