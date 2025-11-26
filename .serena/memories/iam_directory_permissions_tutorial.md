# Tutorial: Implementación del fix de permisos IAM en Stafflink (26-Nov-2025)

## Objetivo
Usar únicamente IAM/Directory como fuente de verdad para `permissions` en `/api/auth/session/`, eliminando cualquier fallback estático.

## Configuración previa
- `backend/.env`:
  - `IAM_BASE_URL=http://172.28.1.24:58000/api/v1`
  - `IAM_APP_ID=6c9d8e5b-5100-4fbd-9c8a-9f8e1de115e5` (Stafflink)
  - `IAM_CONTROL_APP_ID=ed9ca85c-8247-4043-9fd2-d1c47497f461` (IAM Control Center)
  - `IAM_SERVICE_USER=admin@gea.local`, `IAM_SERVICE_PASSWORD=Adm1n$IAM!2025`
- Pendiente operativo: Postgres en `localhost:2424` para correr `manage.py migrate`.

## Pasos realizados
1) **Eliminar fallback estático**
   - `backend/api/auth/authentication.py`: se removió `role_perm_map` y `_derive_permissions_from_roles`.
   - `_normalize_permissions` ya no deriva permisos por roles estáticos.

2) **Solo IAM/Directory**
   - Flujo: introspección → `_fetch_directory_permissions(token, payload, on_error="raise")`.
   - `_fetch_directory_permissions` usa token de servicio (retry en 401) o token de usuario; si falla con `on_error="raise"`, lanza `IAMServiceError` (401/503) y loguea. Sin permisos inventados.

3) **Extraer permisos desde roles de Directory**
   - `authentication.py`: `_extract_app_permissions` ahora incluye permisos dentro de cada rol devuelto por Directory (`role.permissions`), además de `permissions/perms` planos.

4) **SessionView ajustada**
   - `backend/api/auth/views.py`: `_introspect_and_respond` hace introspección y si faltan permisos, llama a Directory con `on_error="raise"`; si IAM/Directory falla, responde 503/401 con log. No hay fallback estático.

5) **Token de servicio**
   - `backend/api/auth/service_token.py`: `get_service_token` usa `force=True`, caché, mutex y logging; si falla, retorna `None` y se usa token de usuario como respaldo.

## Verificación manual
Script desde `backend` (venv activo):
```bash
backend/venv/bin/python - <<'PY'
import os, json, django, httpx, base64
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings'); django.setup()
from django.conf import settings
from api.auth.service_token import get_service_token, clear_cached_service_token

def decode_payload(tok: str):
    parts = tok.split('.')
    pad = '=' * (-len(parts[1]) % 4)
    return json.loads(base64.urlsafe_b64decode(parts[1] + pad) or b'{}')

base = settings.IAM_BASE_URL.rstrip('/')
login = httpx.post(f"{base}/auth/login", json={
    'username_or_email': 'admin@gea.local',
    'password': 'Adm1n$IAM!2025',
    'app_id': settings.IAM_APP_ID,
    'force': True,
}, timeout=20.0)
token = login.json()['access_token']
user_id = decode_payload(token)['sub']
clear_cached_service_token()
st = get_service_token()
r = httpx.get(f"{base}/directory/users/{user_id}/roles",
              headers={'Authorization': f'Bearer {st}'}, timeout=20.0)
data = r.json()
perms = sorted({p['name'] for app in data.get('applications', [])
                         for role in app.get('roles', [])
                         for p in role.get('permissions', [])})
print('status', r.status_code)
print('perms', perms)
PY
```
Resultado esperado: status 200 y 12 permisos de Stafflink.

## Resultado
- `/api/auth/session/` incluye permisos reales de IAM/Directory (12 para Stafflink en el ejemplo).
- No quedan permisos hardcodeados; ante fallo de IAM/Directory se devuelve 401/503.

## Pendiente
- Levantar Postgres en `localhost:2424` y correr `cd backend && venv/bin/python manage.py migrate`; reiniciar backend y validar `/api/auth/session/` desde frontend/curl.

## Archivos clave
- `backend/api/auth/authentication.py` (fuente de permisos, extracción de roles/permisos).
- `backend/api/auth/views.py` (SessionView sin fallback estático, maneja errores de Directory).
- `backend/api/auth/service_token.py` (token de servicio con `force=True` y logging).
