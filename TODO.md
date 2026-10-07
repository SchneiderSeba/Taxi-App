# TODO y roadmap de Taxi App

> Auditoría realizada el 3 de octubre de 2026 y revisada el 7 de octubre de 2026 contra el proyecto productivo de Supabase. Este documento reemplaza como referencia al antiguo `todolist.txt`.

## Cómo usar este documento

- Las tareas están ordenadas por riesgo e impacto, no solamente por atractivo visual.
- `P0` bloquea un uso productivo seguro; `P1` completa un MVP confiable; `P2` mejora el producto; `P3` prepara crecimiento y escala.
- Estimaciones: `S` (horas), `M` (1-3 días), `L` (4-10 días), `XL` (más de 2 semanas).
- Una tarea se marca como completada solamente cuando cumple sus criterios de aceptación y tiene una prueba reproducible.

## Estado actual confirmado

- [x] La aplicación compila y el chequeo de TypeScript pasa.
- [x] ESLint no informa errores; quedan 3 advertencias.
- [x] El cliente público puede listar conductores y crear solicitudes mediante RPC.
- [x] Los conductores disponen de autenticación, perfil, viajes, gastos y reportes básicos.
- [x] Existen Edge Functions para crear preferencias y recibir webhooks de Mercado Pago.
- [ ] No existe una suite automatizada de pruebas ni un comando `test`.
- [ ] El bundle principal pesa aproximadamente 519 kB minificado y Vite advierte que supera 500 kB.
- [ ] `npm audit --omit=dev` informa 3 vulnerabilidades altas: `react-router-dom`, `react-router` y `ws`.
- [x] Producción tiene la RPC `get_payment_result(text)` con permisos explícitos.
- [x] RLS está activo en todas las tablas públicas, incluidas `UsersProfile` y `usersettings`.
- [x] `anon` no tiene acceso directo a tablas; usa únicamente RPC públicas con campos y operaciones limitados.
- [x] Las cinco tablas usadas por usuarios autenticados conservan grants mínimos y políticas RLS por propietario. Su presencia en GraphQL/Data API es intencional mientras el frontend acceda directamente a ellas.
- [x] Se eliminaron las políticas RLS duplicadas y se añadieron índices a todas las claves foráneas reportadas por Advisors.
- [x] La migración de conciliación y el esquema inicial versionado representan tablas, grants, RLS, políticas, índices y RPC de producción.
- [ ] Existe una función productiva `create-preference-mp-test` que debería revisarse y retirarse.
- [ ] Railway CLI local está desactualizado (`3.14.0`) y este checkout no está vinculado a un proyecto.

## P0 — Seguridad, pagos e integridad del negocio

### P0.1 Cerrar la exposición de datos en Supabase — L

- [ ] Obtener un `db pull`/snapshot del esquema productivo antes de cambiar políticas.
- [x] Inventariar los accesos necesarios para `anon`, `authenticated` y `service_role` por tabla y operación.
- [x] Activar RLS en `UsersProfile` y `usersettings` con políticas por propietario.
- [x] Revocar de `anon` el acceso directo a `Trips`, `Expenses`, `payments`, `UsersProfile`, `usersettings` y `customer_profiles`.
- [x] Limitar `authenticated` por propietario con `(select auth.uid()) = owner_id`/`user_id`.
- [x] Eliminar las políticas anónimas antiguas y duplicadas de `Trips`.
- [x] Mantener una proyección pública mínima de conductores; no exponer email, teléfono ni datos internos.
- [x] Revisar las RPC `SECURITY DEFINER`, usar `search_path = ''`, permisos explícitos y validaciones internas.
- [x] Ejecutar pruebas de autorización como `anon`, conductor propietario, otro conductor y `service_role` contra producción.
- [x] Ejecutar Supabase Advisors después de la migración y dejar cero errores de RLS, políticas duplicadas o claves foráneas sin índice.

**Criterios de aceptación**

- Una persona anónima solamente puede listar campos públicos, solicitar un viaje y consultar su solicitud mediante un token no predecible.
- Un conductor no puede leer ni modificar viajes, pagos, gastos o perfil de otro conductor.
- Las vistas de cliente y conductor continúan funcionando después de revocar los permisos amplios.

### P0.2 Recuperar y asegurar el flujo de pagos — L

- [ ] Crear y aplicar una migración para `get_payment_result(text)`; actualmente falta en producción.
- [ ] Confirmar que las tablas y funciones de pagos del repositorio coinciden con producción.
- [ ] Validar la firma `x-signature` y el identificador de solicitud de cada webhook de Mercado Pago.
- [ ] Hacer el webhook idempotente por `mp_payment_id` y conservar un historial de cambios de estado.
- [ ] Verificar en servidor monto, moneda, viaje, cliente y conductor; nunca confiar en parámetros del navegador.
- [ ] Exigir un token de pago de un solo uso en lugar de aceptar solamente `trip_id + customer_id`.
- [ ] Aplicar rate limiting a `create-preference-mp` y registrar intentos anómalos.
- [ ] Revisar `verify_jwt = false`: mantenerlo únicamente para el webhook y proteger la creación de preferencias con autenticación propia.
- [ ] Retirar `create-preference-mp-test` de producción después de confirmar que no recibe tráfico.
- [ ] Agregar estados `created`, `pending`, `approved`, `rejected`, `cancelled`, `refunded` y `charged_back`.
- [ ] Añadir reintentos controlados y reconciliación periódica de pagos pendientes.
- [ ] Crear recibo/comprobante y una pantalla de retorno que consulte el estado verificado en servidor.

**Criterios de aceptación**

- Un callback manipulado en `/payment` no puede mostrar un pago aprobado si el webhook/consulta de Mercado Pago no lo confirma.
- Repetir el mismo webhook no duplica pagos ni modifica otro viaje.
- Existe una prueba en sandbox de Mercado Pago para aprobación, rechazo y pago pendiente.

### P0.3 Corregir el modelo de estados y la moneda — M

- [ ] Separar `accepted` de `completed`; hoy `completed` significa “el conductor aceptó”.
- [ ] Definir la máquina de estados: `requested → accepted → driver_en_route → arrived → in_progress → completed`.
- [ ] Definir transiciones alternativas: `rejected`, `cancelled_by_customer`, `cancelled_by_driver`, `no_show`.
- [ ] Impedir transiciones inválidas mediante una RPC/transacción en la base de datos.
- [ ] Registrar cada transición en `trip_status_events` con actor, fecha y motivo.
- [ ] Cobrar y sumar ingresos únicamente cuando corresponda según la política elegida.
- [ ] Elegir una moneda de negocio y usarla en toda la aplicación; hoy la UI dice USD y Mercado Pago envía ARS.
- [ ] Guardar `currency` junto a cada tarifa y pago, usando importes decimales consistentes.

**Criterios de aceptación**

- Aceptar un viaje no lo cuenta como terminado ni como ingreso realizado.
- Cliente y conductor ven el mismo estado y las únicas acciones válidas para ese estado.
- El monto y la moneda mostrados coinciden con los enviados y cobrados por Mercado Pago.

### P0.4 Actualizar dependencias vulnerables — M

- [ ] Actualizar `react-router-dom` y `react-router` al menos a una versión sin los avisos detectados (actualmente 7.9.6; existe 7.18.4).
- [ ] Actualizar la dependencia transitiva `ws` a una versión corregida.
- [ ] Ejecutar `npm audit`, typecheck, lint, build y pruebas E2E después de cada grupo de actualizaciones.
- [ ] Actualizar dependencias dentro de la misma major primero; planificar React 19, Tailwind 4, Vite 8 y TypeScript 7 como migraciones separadas.
- [ ] Configurar Renovate o Dependabot con PRs agrupados y calendario mensual.

**Criterios de aceptación**

- `npm audit --omit=dev` no informa vulnerabilidades altas o críticas.
- Login, navegación, callback OAuth, rutas protegidas y retorno de pago tienen pruebas de regresión.

### P0.5 Eliminar el drift entre migraciones y producción — L

- [ ] Respaldar/exportar el esquema productivo y compararlo con `supabase/migrations`.
- [x] Crear una migración base reproducible que incluya tablas, tipos, constraints, índices, grants, RLS, políticas y RPC.
- [x] Incorporar `usersettings` a las migraciones.
- [x] Añadir la RPC de pagos y los índices que existían solamente en producción.
- [x] Alinear las versiones de los archivos locales con el historial de migraciones registrado en producción.
- [ ] Probar todas las migraciones desde una base vacía y desde el estado productivo actual.
- [ ] Añadir `supabase migration list` y detección de drift al proceso de release.
- [ ] Documentar rollback y respaldo antes de cada migración destructiva.

## P1 — MVP confiable y mantenible

### P1.1 Pruebas automatizadas y CI — L

- [ ] Añadir Vitest + Testing Library para lógica y componentes críticos.
- [ ] Añadir Playwright para los recorridos principales.
- [ ] Añadir pgTAP o pruebas SQL para RLS, grants, RPC y transiciones de estado.
- [ ] Crear fixtures deterministas de conductor, cliente, viaje y pago sandbox.
- [ ] Añadir GitHub Actions: `npm ci`, typecheck, lint, tests, build, audit y validación de migraciones.
- [ ] Bloquear merge cuando falle seguridad, tipos, pruebas o build.

**Recorridos E2E mínimos**

- [ ] Login por Google/magic link y restauración de sesión.
- [ ] Alta automática de perfil y edición de vehículo/disponibilidad.
- [ ] Cliente lista un conductor, solicita viaje y recupera la solicitud al recargar.
- [ ] Conductor acepta/rechaza y el cliente recibe el estado.
- [ ] Viaje completo, pago sandbox, webhook y comprobante.
- [ ] Aislamiento entre dos conductores y entre dos clientes.
- [ ] Estados vacíos, red caída, Supabase caído y respuestas lentas.
- [ ] Navegación móvil, teclado y lector de pantalla.

### P1.2 Realtime real y sincronización consistente — M

- [ ] Sustituir el polling de clientes cada 10/30 segundos por Realtime o Broadcast autorizado.
- [ ] Actualizar solamente la fila afectada en vez de volver a descargar todos los viajes ante cada evento.
- [ ] Usar canales únicos por conductor/cliente y eliminarlos correctamente al desmontar.
- [ ] Añadir reconexión, indicador de conexión y fallback de polling con backoff.
- [ ] Evitar envíos y actualizaciones duplicadas ante doble clic o reconexión.
- [ ] Ordenar consultas por fecha y paginar historiales.

### P1.3 Ciclo de reserva completo — L

- [ ] Permitir al cliente cancelar mientras el viaje aún lo admita.
- [ ] Permitir al conductor rechazar indicando un motivo opcional.
- [ ] Evitar que dos conductores acepten el mismo viaje o que un conductor tome reservas incompatibles.
- [ ] Marcar al conductor ocupado automáticamente al aceptar/iniciar un viaje.
- [ ] Definir expiración de solicitudes y liberar reservas abandonadas.
- [ ] Añadir fecha/hora real como `timestamptz`; no guardar horarios como texto libre.
- [ ] Guardar zona horaria, notas, número de pasajeros y necesidades de accesibilidad.
- [ ] Mostrar historial completo al cliente, no solamente la última solicitud.
- [ ] Proporcionar código de viaje corto para soporte sin exponer IDs internos.

### P1.4 Identidad del cliente y protección contra abuso — L

- [ ] Reemplazar el UUID en `localStorage` como única credencial por un token opaco firmado y rotatorio.
- [ ] Ofrecer cuenta opcional por OTP para conservar historial entre dispositivos.
- [ ] Añadir límites por IP/dispositivo/conductor y ventana temporal a `request_trip`.
- [ ] Añadir CAPTCHA solamente después de comportamiento sospechoso.
- [ ] Validar teléfono, nombre, coordenadas, longitud y contenido tanto en cliente como servidor.
- [ ] Añadir consentimiento de privacidad y política de retención de PII.
- [ ] Ocultar el teléfono del conductor hasta que el viaje sea aceptado y definir un canal de contacto seguro.

### P1.5 Arquitectura del frontend — L

- [x] Separar por funcionalidades: `auth`, `drivers`, `trips`, `payments`, `profile`, `expenses` y `shared`.
- [x] Crear una capa de servicios/repositorios para Supabase; evitar consultas repartidas por componentes y `App.tsx`.
- [x] Centralizar mutaciones de viajes; `TripCard` y `App` actualmente actualizan el mismo estado dos veces.
- [x] Generar tipos TypeScript desde Supabase y eliminar casts manuales de respuestas RPC.
- [x] Validar datos externos con esquemas en los límites de la aplicación.
- [x] Añadir un estado `authInitializing` para evitar flashes y redirecciones antes de restaurar la sesión.
- [x] Reemplazar redirects OAuth hardcodeados por una variable/función basada en entorno y allowlist.
- [x] Versionar el esquema de `localStorage` y manejar JSON corrupto en `settings`.
- [x] Persistir ajustes del conductor en la base o eliminar `usersettings`; hoy solo viven en el navegador.
- [x] Unificar errores, loaders, reintentos, toasts y confirmaciones; eliminar `alert()` y logs de depuración.
- [x] Añadir un Error Boundary global y una página 404.
- [x] Renombrar `CostumerView` a `CustomerView` y corregir `/costumer` en el README.
- [x] Retirar código duplicado/obsoleto: `NewTripForm.tsx`, `src/create-preference-mp.js` y `src/mp-webhook.js` si se confirma que no se importan.
- [x] Mover hooks y contextos a archivos separados para resolver las advertencias de Fast Refresh.
- [x] Corregir la dependencia faltante del `useEffect` en `NewTripForm.tsx` o retirar el componente.

### P1.6 Experiencia de errores y recuperación — M

- [ ] Mostrar mensajes accionables y un botón de reintento para conductores, viajes, mapas y pagos.
- [ ] Cancelar requests obsoletos con `AbortController` al cambiar de vista o búsqueda.
- [ ] Deshabilitar acciones mientras se procesan y usar claves de idempotencia.
- [ ] Distinguir error de red, sesión expirada, permisos, validación y servicio externo.
- [ ] Mantener borradores del formulario de viaje sin conservar PII más tiempo del necesario.
- [ ] Añadir estados offline y recuperación automática al volver la conexión.

### P1.7 Observabilidad y operación — M

- [ ] Añadir monitoreo de errores del frontend y Edge Functions con scrub de PII.
- [ ] Usar logs estructurados con `request_id`, `trip_id`, función, duración y resultado.
- [ ] Configurar alertas para errores de Auth, Data API, Realtime, Edge Functions y webhooks.
- [ ] Añadir healthcheck y smoke test posterior a cada deploy.
- [ ] Configurar staging separado con proyecto Supabase y credenciales de Mercado Pago sandbox.
- [ ] Fijar una versión de Node compatible; Supabase anunció que sus clientes dejan Node 20 y requieren Node 22+.
- [ ] Actualizar Railway CLI, vincular el checkout y documentar proyecto, entorno y servicio.
- [ ] Añadir configuración Railway versionada, dominio, healthcheck y estrategia de rollback.
- [ ] Reemplazar `vite preview` como servidor productivo por hosting estático/CDN o un servidor estático endurecido.
- [ ] Configurar backups, prueba de restauración y runbook para Supabase/Railway/Mercado Pago.

## P2 — Funcionalidades de producto

### P2.1 Mapa, ruta y estimación — XL

- [ ] Guardar coordenadas normalizadas además del texto de origen/destino.
- [ ] Mostrar ruta, distancia y tiempo estimado antes de solicitar.
- [ ] Añadir ubicación actual con consentimiento explícito y alternativa manual.
- [ ] Calcular tarifa estimada por bajada de bandera, distancia, tiempo, demanda y extras.
- [ ] Permitir que el conductor confirme o ajuste la tarifa dentro de reglas configurables.
- [ ] Mostrar ETA del conductor después de aceptar.
- [ ] Cargar Google Maps/Places solo cuando se abre el formulario o mapa para reducir bundle y consumo de API.
- [ ] Restringir la API key de Google por dominio y API habilitada; crear cuotas y alertas.

### P2.2 Disponibilidad y despacho — XL

- [ ] Añadir posición aproximada y última actualización del conductor disponible.
- [ ] Buscar por cercanía, vehículo, accesibilidad, capacidad, rating y rango de precio.
- [ ] Ofrecer solicitud directa a un conductor o despacho automático al mejor candidato.
- [ ] Implementar timeout de aceptación y oferta al siguiente conductor.
- [ ] Añadir agenda y franjas de disponibilidad para viajes futuros.
- [ ] Evitar mostrar como disponible a un conductor desconectado o con ubicación obsoleta.

### P2.3 Notificaciones y comunicación — L

- [ ] Notificaciones web push/PWA para nueva solicitud y cambios de estado.
- [ ] Email/SMS opcional para confirmación, llegada y recibo.
- [ ] Chat limitado al viaje o mensajes rápidos predefinidos.
- [ ] Enmascarar teléfonos o habilitar contacto solamente durante el viaje.
- [ ] Preferencias de notificación y horario silencioso.

### P2.4 Confianza, seguridad y calidad — XL

- [ ] Verificación administrativa del conductor, licencia, vehículo y seguro.
- [ ] Badge de perfil verificado con fecha de expiración documental.
- [ ] Ratings bidireccionales después de viajes completados.
- [ ] Moderación, reportes, bloqueo y apelaciones.
- [ ] Botón de emergencia, compartir viaje y contactos de confianza, sujeto a revisión legal local.
- [ ] Historial de auditoría para cambios sensibles y accesos administrativos.

### P2.5 Finanzas del conductor — L

- [ ] Categorías personalizables, edición y eliminación de gastos.
- [ ] Gastos recurrentes y adjuntos/fotos de comprobantes.
- [ ] Ingresos por efectivo, tarjeta y Mercado Pago con conciliación.
- [ ] Reportes por día, semana, mes, vehículo y método de pago.
- [ ] Exportación CSV/PDF para contabilidad.
- [ ] Objetivos de ingresos, costo por kilómetro y rentabilidad real.
- [ ] Sustituir cálculos dispersos en el cliente por consultas agregadas/RPC verificables.

### P2.6 Cliente y soporte — L

- [ ] Favoritos y repetición de viajes habituales.
- [ ] Direcciones guardadas para clientes registrados.
- [ ] Propinas y selección de método de pago.
- [ ] Factura/recibo descargable.
- [ ] Centro de ayuda, preguntas frecuentes y apertura de incidencias vinculadas al viaje.
- [ ] Panel de soporte con búsqueda por código de viaje, pago y conductor.

### P2.7 Administración — XL

- [ ] Roles `driver`, `support` y `admin` en `app_metadata`, nunca en metadata editable por el usuario.
- [ ] Panel para aprobar conductores, revisar documentos y suspender cuentas.
- [ ] Gestión de viajes, disputas, reembolsos y pagos sin acceso directo indiscriminado a tablas.
- [ ] Métricas: solicitudes, aceptación, cancelación, tiempo de respuesta, viajes completados y volumen de pagos.
- [ ] Feature flags para desplegar pagos, despacho y notificaciones gradualmente.

## P3 — Calidad, accesibilidad y crecimiento

### P3.1 Rendimiento — M

- [ ] Dividir el bundle por rutas con `React.lazy`/imports dinámicos.
- [ ] Separar Google Maps, Mercado Pago, reportes y fondo WebGL del bundle inicial.
- [ ] Medir Core Web Vitals y establecer presupuestos de JS, CSS e imágenes.
- [ ] Optimizar y alojar avatares en Supabase Storage con tamaños y formatos limitados.
- [ ] Reemplazar recargas completas de colecciones por actualización incremental y caché.
- [x] Añadir índices para todas las claves foráneas y consultas reales reportadas por Advisors.
- [ ] Paginar viajes, pagos y gastos; virtualizar solamente cuando el volumen lo justifique.

### P3.2 Accesibilidad — M

- [ ] Añadir `role="dialog"`, `aria-modal`, título accesible, foco inicial, focus trap y cierre con Escape a modales.
- [ ] Restaurar el foco al botón que abrió cada modal.
- [ ] Proporcionar regiones `aria-live` para errores y cambios de estado.
- [ ] Verificar contraste del glassmorphism en claro/oscuro y con fondo animado.
- [ ] Respetar `prefers-reduced-motion` y ofrecer fondo estático.
- [ ] Evitar depender solamente de color para estado/disponibilidad.
- [ ] Ejecutar axe y pruebas manuales con teclado y lector de pantalla.

### P3.3 Diseño y experiencia — M

- [ ] Crear tokens compartidos de color, espaciado, radios, sombras y superficies.
- [ ] Extraer Button, Card, Modal, Badge, Input, EmptyState, Skeleton y Toast reutilizables.
- [ ] Unificar tema entre login, cliente, conductor y pago; persistir preferencia y respetar el sistema.
- [ ] Añadir skeletons sin cambios bruscos de layout.
- [ ] Diseñar estados vacíos útiles con próxima acción.
- [ ] Mejorar tablas/gráficos de ganancias con etiquetas, tooltips y comparación temporal.
- [ ] Revisar responsive en 320, 375, 768, 1024 y 1440 px.

### P3.4 Internacionalización y localización — M

- [ ] Extraer todos los textos a recursos de idioma.
- [ ] Soportar al menos español e inglés.
- [ ] Formatear fecha, hora, moneda, teléfono y unidades según locale.
- [ ] Definir explícitamente país, zona horaria y moneda por conductor/operación.
- [ ] Evitar nombres de estado internos en la interfaz.

### P3.5 PWA y resiliencia — L

- [ ] Añadir manifest, iconos, service worker y experiencia instalable.
- [ ] Cachear solamente shell y recursos públicos; nunca respuestas privadas sensibles.
- [ ] Permitir consultar el último estado conocido sin conexión con una advertencia clara.
- [ ] Encolar únicamente acciones seguras e idempotentes para reintento.
- [ ] Probar actualización de service worker y rollback sin dejar clientes en versiones incompatibles.

### P3.6 Documentación y experiencia de desarrollo — M

- [ ] Actualizar README: ruta `/customer`, arquitectura real, migraciones, Edge Functions y setup local.
- [ ] Documentar variables por entorno y cuáles son públicas o secretas.
- [ ] Añadir `CONTRIBUTING.md`, convención de commits y plantilla de PR.
- [ ] Documentar el dominio de estados, pagos, RLS y diagramas de secuencia.
- [ ] Añadir seed seguro para desarrollo y datos ficticios.
- [ ] Añadir ADRs para decisiones importantes: identidad anónima, pagos, Realtime y hosting.
- [ ] Eliminar la etiqueta “Completado” del README hasta cumplir el MVP y sus pruebas.

## Modelo de datos propuesto

Antes de crear más pantallas, conviene estabilizar estas entidades:

- `profiles`: identidad pública/privada del usuario y rol.
- `vehicles`: vehículo, patente, capacidad, atributos y verificación.
- `driver_availability`: estado operativo, ubicación aproximada y vencimiento.
- `trips`: cliente, conductor, origen/destino, coordenadas, horario, tarifa, moneda y estado actual.
- `trip_status_events`: historial inmutable de transiciones y actor.
- `payments`: intento, proveedor, importe, moneda, estado e idempotencia.
- `payment_events`: eventos verificados del proveedor para auditoría.
- `expenses`: categoría, importe, moneda, fecha, recurrencia y comprobante.
- `driver_settings`: costos y preferencias persistentes por conductor.
- `reviews`: rating, comentario, autor, receptor y moderación.
- `notifications`: canal, estado de entrega, plantilla y referencia al viaje.

## Orden recomendado de ejecución

### Fase 1 — Estabilización (1-2 semanas)

1. Actualizar dependencias vulnerables.
2. Restaurar `get_payment_result` y retirar la función de prueba.
3. Conciliar migraciones con producción.
4. Corregir RLS/grants y probar aislamiento.
5. Validar firma e idempotencia de pagos.

### Fase 2 — MVP confiable (2-4 semanas)

1. Implementar la máquina de estados y moneda única.
2. Añadir pruebas SQL, unitarias y E2E con CI.
3. Centralizar datos/mutaciones y mejorar errores.
4. Implementar Realtime seguro y cancelación/expiración.
5. Añadir staging, monitoreo y smoke tests.

### Fase 3 — Producto competitivo (4-8 semanas)

1. Coordenadas, rutas, ETA y tarifa estimada.
2. Notificaciones y comunicación segura.
3. Historial, recibos, ratings y reportes financieros.
4. Verificación de conductores y panel administrativo mínimo.

### Fase 4 — Escala y pulido

1. PWA, offline controlado e internacionalización.
2. Optimización de bundle, consultas y costos.
3. Feature flags, analytics de negocio y automatización operativa.

## Definición de terminado para cualquier tarea

- [ ] Incluye manejo de carga, error, vacío, reintento y doble envío.
- [ ] Respeta autorización y minimiza PII.
- [ ] Tiene prueba automatizada proporcional al riesgo.
- [ ] Pasa typecheck, lint, tests y build.
- [ ] Tiene migración versionada cuando cambia datos.
- [ ] Fue comprobada en staging y luego con smoke test en producción.
- [ ] Incluye monitoreo, rollback y documentación cuando afecta operación.

## Referencias técnicas consultadas

- [Supabase — Securing your API](https://supabase.com/docs/guides/api/securing-your-api): grants y RLS son capas complementarias; ambas deben aplicarse a objetos expuestos por Data API.
- [Supabase — Tables not exposed automatically](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically): la exposición automática de nuevas tablas se elimina para todos los proyectos el 30 de octubre de 2026; los grants deben ser explícitos.
- [Supabase — Dropping Node.js 20 support](https://supabase.com/changelog/45715-deprecation-notice-dropping-support-for-node-js-20): conviene fijar Node.js 22 o superior.
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security): patrones actuales para políticas y optimización de `auth.uid()`.
- [Supabase — Database Linter](https://supabase.com/docs/guides/database/database-linter): explicación y remediación de los avisos detectados por Advisors.
- La auditoría de Supabase del proyecto fue consultada directamente el 7 de octubre de 2026 después de aplicar la migración de conciliación.
- El estado de dependencias se obtuvo con `npm outdated` y `npm audit --omit=dev` el 3 de octubre de 2026.
