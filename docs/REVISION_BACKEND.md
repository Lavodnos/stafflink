# Revision backend

## Resumen
El backend es Django + DRF con integracion IAM y un dominio `api.v1.recruitment`. La base es solida, pero hay riesgos de seguridad y limpieza del repo que conviene corregir antes de escalar o desplegar.

## Hallazgos prioritarios
- Seguridad y secretos: `backend/.env` tiene credenciales reales (usuario, password, app id). Ese archivo debe salir del repo y vivir solo como `.env` local; mantener solo `backend/.env.example` con valores ficticios.
- Permisos por headers: `backend/api/v1/recruitment/permissions.py` acepta `X-Stafflink-Permissions`, y `backend/api/v1/recruitment/request_context.py` acepta `X-Stafflink-User-*`. En produccion eso permitiria suplantar permisos/usuario si llega desde un cliente. Deberia limitarse a `DEBUG` o eliminarse.
- Auth con cookie sin CSRF explicito: `api.auth.authentication.IAMCookieAuthentication` acepta cookie y `STAFFLINK_ACCESS_TOKEN_COOKIE_SAMESITE=Lax`. Con cookies, es buena practica agregar proteccion CSRF o revisar `SameSite=Strict`/doble submit segun necesidad.
- Permisos globales DRF: `REST_FRAMEWORK.DEFAULT_PERMISSION_CLASSES` esta en `[]`. Cualquier view nueva sin `permission_classes` queda abierta. Definir un default (p. ej. `IsAuthenticated`) reduce errores futuros.
- Tests y dependencias: `backend/tests/test_v1/...` importa `pytest`, pero `backend/requirements.txt` no lo incluye. Con `python manage.py test` esto puede fallar si pytest no esta instalado.
- Paginacion no aplicada: existe `backend/api/v1/recruitment/pagination.py` pero no se referencia en viewsets ni en `REST_FRAMEWORK`.
- Artefactos en repo: hay `backend/**/__pycache__`, `backend/db.sqlite3`, `backend/node_modules/`, `backend/venv/` y `backend/package-lock.json`. Deberian eliminarse del git y mantenerse ignorados.
- Storage S3 incompleto: `backend/integrations/storage/s3.py` es placeholder; si `STAFFLINK_STORAGE_BACKEND=s3` se rompe en runtime. Agregar guardas o implementar el cliente.

## Recomendaciones rapidas
- Sacar `.env` reales del repo y rotar credenciales expuestas.
- Bloquear headers de permisos/usuario en produccion (feature flag o `DEBUG`).
- Definir permisos DRF por defecto y aplicar paginacion en listados.
- Limpiar artefactos (pyc, node_modules, venv, db.sqlite3) y asegurar `.gitignore`.

## Mejoras sugeridas (investigacion, core)
Fuera de alcance: autenticacion/login (API externa).

- Seguir el checklist de despliegue de Django para endurecer settings de produccion (DEBUG, ALLOWED_HOSTS, SECURE_*).
- Activar paginacion por defecto en DRF (`DEFAULT_PAGINATION_CLASS`, `PAGE_SIZE`) o en cada viewset.
- Definir logging estructurado en `LOGGING` y niveles por entorno (dev vs prod).
- Formalizar manejo de static/media (`STATIC_ROOT`, `MEDIA_ROOT`, `collectstatic`) para despliegues.
- Unificar el runner de tests (o agregar `pytest-django`, o remover marcas pytest si no se usa).

Fuentes consultadas:
- https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/
- https://docs.djangoproject.com/en/5.2/topics/logging/
- https://docs.djangoproject.com/en/5.2/howto/static-files/deployment/
- https://www.django-rest-framework.org/api-guide/pagination/
- https://pytest-django.readthedocs.io/en/latest/
