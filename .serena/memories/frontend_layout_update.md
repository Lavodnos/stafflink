Implementado layout consistente (Header, Sidebar, Footer, Shell) siguiendo identidad GEA:
- Nuevos componentes en `frontend/src/components/layout/`: `Sidebar` (nav lateral con permisos), `Header` (título/subtítulo/acciones con fondo degradado), `Footer` (© año y links), `Shell` (estructura min-h-screen con sidebar, header opcional, main centrado y footer).
- App envuelve rutas privadas en `Shell` + `Header`; ruta pública /apply/:slug se mantiene fuera.
- Sidebar con items Dashboard, Campañas, Links, Candidatos, Blacklist respetando permisos; estilo gradiente GEA.
- Paleta y estilos existentes se reutilizan (Tailwind tokens `gea-*`).

Archivos tocados:
- `frontend/src/components/layout/{Sidebar,Header,Footer,Shell}.tsx`
- `frontend/src/App.tsx`

Pendiente: Responsive drawer para mobile (actualmente sidebar sólo en lg+). Si se requiere, agregar toggle con estado y overlay.
