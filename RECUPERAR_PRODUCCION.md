# Recuperación de producción

El frontend de Railway sigue activo, pero el proyecto Supabase anterior
(`lzxlnqeokbzytnjgglte.supabase.co`) ya no resuelve por DNS. Autenticación,
base de datos, Realtime y las Edge Functions dependían de ese proyecto.

## 1. Crear un proyecto Supabase nuevo

1. Crear un proyecto en Supabase.
2. Abrir **SQL Editor** y ejecutar
   `supabase/migrations/202609230001_initial_schema.sql`.
3. Guardar la URL del proyecto y la clave pública `anon`.

Si no existe un backup del proyecto anterior, sus usuarios y datos no se
pueden recuperar desde este repositorio.

## 2. Configurar autenticación

En Supabase, habilitar Google y agregar estas URLs:

- Site URL: `https://taxi-app-production.up.railway.app`
- Redirect URL: `https://taxi-app-production.up.railway.app/login`
- Desarrollo: `http://localhost:5173/login`

También se puede mantener habilitado el acceso por Magic Link.

## 3. Desplegar las funciones

Con Supabase CLI autenticado y vinculado al proyecto nuevo:

```bash
supabase link --project-ref NUEVO_PROJECT_REF
supabase secrets set MP_ACCESS_TOKEN=... APP_URL=https://taxi-app-production.up.railway.app
supabase functions deploy create-preference-mp
supabase functions deploy mp-webhook
```

Las funciones usan automáticamente `SUPABASE_URL` y
`SUPABASE_SERVICE_ROLE_KEY`. No exponer esas variables en Vite ni Railway.

## 4. Actualizar Railway

Configurar estas variables en el servicio del frontend y volver a desplegar:

```text
VITE_PUBLIC_SUPABASE_URL=https://NUEVO_PROJECT_REF.supabase.co
VITE_PUBLIC_SUPABASE_KEY=NUEVA_ANON_KEY
VITE_PUBLIC_MERCADO_PAGO_KEY=PUBLIC_KEY
VITE_PUBLIC_GOOGLEMAP_KEY=GOOGLE_MAPS_KEY
```

Vite inserta estas variables durante el build: reiniciar el contenedor no es
suficiente; Railway debe ejecutar un despliegue nuevo.

## 5. Configuración externa

- Google Maps: habilitar Maps JavaScript API y Places API; restringir la clave
  al dominio de Railway y a localhost para desarrollo.
- Mercado Pago: usar credenciales del mismo entorno (prueba o producción) y
  registrar la URL de webhook que muestra la función desplegada.
- Railway: verificar que el comando de build sea `npm run build` y que el
  servicio sirva `npm run start`.

## 6. Validación mínima

1. Abrir `/customer` y comprobar que aparecen conductores disponibles.
2. Entrar con Google y completar el perfil del conductor.
3. Solicitar un viaje desde otro navegador.
4. Aceptarlo y asignar precio desde la cuenta del conductor.
5. Iniciar un pago de prueba y comprobar la fila creada en `payments`.
