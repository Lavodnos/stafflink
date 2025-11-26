# Plan de vistas (secuencia) con identidad GEA

Orden de implementación
1) Dashboard (hub) post-login: navegación a módulos, coherente con identidad GEA.
2) Campañas (CRUD): lista + crear/editar (permiso campaigns.manage).
3) Blacklist (CRUD): lista + crear/editar/eliminar (permiso blacklist.manage).
4) Links: lista por campaña/estado, crear/editar, expire/revoke/activate (permiso links.manage/close), mostrar URL pública /apply/:slug.
5) Candidatos BO: lista con filtros; detalle con tabs (Datos – manage, Documentos/Proceso – process, Contrato – contract).
6) Público `/apply/:slug`: landing + formulario (implementado); integrar con identidad GEA y flujos posteriores. 
7) Exportes (opcional): vista de descargas (exports.download).

Identidad visual GEA
- Colores: brand-blue #0B1658 (primario), gradientes verde (#004021→#7A9A32), rojo-naranja (#5A1D32→#E96F36), gris #8785AB, blanco.
- Tipografía: Futura Std (Light/Book/Medium), fallback Montserrat; tamaños 1.25 rem cuerpo, títulos 1.5–4.5 rem.
- Componentes base (Tailwind + @apply): btn primario gradiente verde, secundario borde azul, cards, inputs, pills.

Stack/frontend
- React + Tailwind, estructura FSD: app/pages/features/entities/shared.
- Estado: React Query para API; Context/Zustand para sesión/permissions.
- Guardas: RequireAuth + RequirePermission con permisos simplificados (campaigns.*, blacklist.*, links.*, candidates.*, exports.download).

Próximo paso
- Construir Dashboard/hub con identidad GEA y enlaces a Campañas/Blacklist/Links/Candidatos; luego avanzar al CRUD de Campañas.
