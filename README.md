# 🚖 Taxi App

Taxi App es una aplicación completa desarrollada para ayudar a conductores de taxi a gestionar su trabajo diario y conectar con clientes de forma directa.  
Incluye dos interfaces: una para **conductores** (con autenticación) y otra para **clientes** (sin registro), permitiendo solicitar viajes, gestionar ganancias y controlar gastos operativos.

---

## 🌐 Pruébalo en vivo: [Taxi App](https://taxi-app-production.up.railway.app/)


## 📌 Características principales

### Para Conductores (Autenticados)
- ✨ **Autenticación con Google OAuth** - Inicio de sesión rápido y seguro
- 🚕 **Gestión completa de viajes** - Registro, aceptación y cancelación de viajes
- 💰 **Control de ingresos en tiempo real** - Seguimiento de ganancias por viaje
- 📉 **Registro de gastos operativos** - Combustible, mantenimiento, peajes, etc.
- 📊 **Dashboard con estadísticas** - Resumen visual de ganancias netas vs. gastos
- 🧾 **Historial completo de operaciones** - Todas tus transacciones organizadas
- 👤 **Perfil personalizable** - Avatar, modelo de auto, patente, disponibilidad
- 🔔 **Actualizaciones en tiempo real** - Supabase Realtime para nuevas solicitudes
- 📱 **Diseño responsive** - Optimizado para móviles, tablets y desktop

### Para Clientes (Sin Registro)
- 🔍 **Exploración de conductores disponibles** - Lista completa con información detallada
- 🚗 **Solicitud de viajes sin registro** - Sistema anónimo con customer ID único
- 📍 **Seguimiento de solicitud en tiempo real** - Ver estado: pendiente/aceptado/cancelado
- 💵 **Ver precio del viaje aprobado** - Transparencia total en el costo
- 🌙 **Modo oscuro** - Interfaz adaptable para cualquier hora del día
- 🔒 **Privacidad garantizada** - Sin necesidad de crear cuenta

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|-----------|-----|
| **React 18 + Vite** | Interfaz de usuario moderna y rápida |
| **TypeScript** | Tipado estricto para mejor mantenimiento |
| **React Router DOM** | Navegación entre vistas |
| **Tailwind CSS** | Diseño responsive y modo oscuro |
| **Supabase Auth** | Google OAuth y Magic Link |
| **Supabase Database (PostgreSQL)** | Base de datos relacional con RLS |
| **Supabase Realtime** | Actualizaciones en tiempo real (WebSockets) |
| **Lucide React** | Iconos modernos y optimizados |

---

## 📂 Estructura del proyecto

```
src/
├── components/
│   ├── Layout.tsx              # Header con navegación y dark mode
│   ├── Login.tsx               # Autenticación con Google OAuth
│   ├── TripsView.tsx           # Dashboard de viajes del conductor
│   ├── TripCard.tsx            # Card individual de viaje
│   ├── ProfileView.tsx         # Gestión de perfil y configuración
│   ├── ProfileCard.tsx         # Visualización de datos del conductor
│   ├── CostumerView.tsx        # Interfaz pública para clientes
│   ├── AddTripModal.tsx        # Modal para agregar viajes
│   ├── EarningsReport.tsx      # Reporte de ganancias
│   └── ExpenseTracker.tsx      # Seguimiento de gastos
├── supabase/
│   └── client.js               # Configuración de Supabase
├── types/
│   └── index.ts                # Definiciones de tipos TypeScript
└── main.tsx                    # Punto de entrada de la app
```


---

## 🔐 Autenticación y Seguridad

### Para Conductores
Taxi App utiliza **Supabase Auth** con las siguientes opciones:

- **Google OAuth** - Inicio de sesión con cuenta de Google (principal)
- **Magic Link (email)** - Link de acceso directo sin contraseña

Cada conductor tiene un perfil único con:
- Nombre completo (obtenido de Google)
- Avatar/foto de perfil
- Modelo y patente del vehículo
- Estado de disponibilidad (disponible/no disponible)

### Para Clientes
- **Sin registro necesario** - Sistema anónimo con customer ID único
- **Persistencia local** - ID almacenado en localStorage del navegador
- **Compatibilidad con privacidad** - Fallback para navegadores con restricciones (ej: Brave)

### Seguridad de Datos
- **Row Level Security (RLS)** - Cada conductor solo ve su información
- **Políticas de acceso** - Protección a nivel de base de datos
- **Realtime con filtros** - Actualizaciones solo de datos autorizados

---

## 🧮 Funcionalidades técnicas destacadas

### Sistema de Viajes
- **Estados de viaje**: `pending` (pendiente), `completed` (aceptado), `cancelled` (cancelado)
- **Asociación conductor-cliente**: Cada viaje vincula `owner_id` (conductor) con `customer_id` (cliente)
- **Edición de precio**: Los conductores pueden establecer el precio al aceptar un viaje

### Actualizaciones en Tiempo Real
- **Supabase Realtime** para notificaciones instantáneas:
  - Conductores reciben nuevas solicitudes sin recargar
  - Clientes ven cambios de estado automáticamente
  - Lista de conductores se actualiza al cambiar disponibilidad
- **Optimización de costos**: Realtime en lugar de polling constante

### Gestión de Datos
- **Perfiles de usuario** automáticamente creados al primer login
- **Captura de metadata de Google**: nombre completo y avatar
- **Actualización inteligente**: Perfiles existentes se completan con datos faltantes
- **Estadísticas dinámicas**: Ganancias, gastos y balance calculados en tiempo real

### Experiencia Responsive
- **Mobile-first design** con Tailwind CSS
- **Touch targets** de 44px mínimo para accesibilidad
- **Breakpoints**: móvil (320px+), tablet (640px+), desktop (1024px+)
- **Dark mode** completo en toda la aplicación

---

## 🚧 Estado del proyecto

✅ **Versión 2.0 - Completada**  
Incluye sistema completo de conductores y clientes, autenticación OAuth, actualizaciones en tiempo real y diseño responsive.

> Próximas mejoras y optimizaciones se implementarán en futuras versiones.

---

## 📦 Instalación

1. Clonar el repositorio:
```
git clone https://github.com/usuario/taxi-app.git

cd taxi-app
```

2. Instalar dependencias:
```
npm i
```

3. Crear archivo `.env` con las claves de Supabase:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
```

4. Configurar Google OAuth en Supabase:
   - Ir a Authentication > Providers > Google
   - Configurar Client ID y Client Secret
   - Agregar redirect URL autorizada

5. Crear las tablas en Supabase:

```sql
-- Tabla de perfiles de usuario
CREATE TABLE UsersProfile (
  id SERIAL PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) UNIQUE,
  username TEXT,
  displayName TEXT,
  email TEXT,
  phone TEXT,
  carModel TEXT,
  carPlate TEXT,
  pictureUrl TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de viajes
CREATE TABLE Trips (
  id SERIAL PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id),
  customer_id TEXT,
  name TEXT,
  pickup TEXT,
  destination TEXT,
  passenger_phone TEXT,
  preferred_time TEXT,
  price DECIMAL,
  done TEXT CHECK (done IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE UsersProfile ENABLE ROW LEVEL SECURITY;
ALTER TABLE Trips ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view their own profile" ON UsersProfile
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can update their own profile" ON UsersProfile
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can view their own trips" ON Trips
  FOR SELECT USING (auth.uid() = owner_id);
```

6. Ejecutar en desarrollo:
```bash
npm run dev
```


---

## 🤝 Contribuciones

Las contribuciones son bienvenidas.  
Abrí un issue o PR si tenés ideas, correcciones o nuevas funcionalidades.

---

## 📄 Licencia

Este proyecto está bajo licencia MIT.  
Podés usarlo, modificarlo y distribuirlo libremente.

---

## 🚀 Próximas mejoras

- 📧 **Notificaciones push** - Alertas para conductores cuando llegan solicitudes
- 🔌 **Integracios con MercadoPago** - Permite pagar a los Drivers con mercado pago
- 📈 **Dashboard avanzado con gráficos** - Visualización de tendencias y estadísticas
- 🗺️ **Integración con mapas** - Google Maps para rutas y distancias
- ⭐ **Sistema de calificaciones** - Rating de conductores por clientes
- 💬 **Chat en tiempo real** - Comunicación directa conductor-cliente
- 📱 **PWA (Progressive Web App)** - Instalación como app nativa

---

## 🎯 Casos de Uso

### Conductor
1. Inicia sesión con Google
2. Configura su disponibilidad y datos del vehículo
3. Recibe solicitudes de viajes en tiempo real
4. Acepta/rechaza viajes y establece precio
5. Registra gastos operativos
6. Visualiza ganancias netas del día/mes

### Cliente
1. Abre la app sin registrarse
2. Explora conductores disponibles
3. Solicita un viaje con pickup y destino
4. Recibe confirmación con precio
5. Puede ver el estado en tiempo real

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si deseas colaborar:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo licencia MIT.  
Puedes usarlo, modificarlo y distribuirlo libremente.

---

## 📧 Contacto

**Desarrollador**: Schneider Sebastian  
**GitHub**: [@SchneiderSeba](https://github.com/SchneiderSeba)  
**Link del Proyecto**: [https://github.com/SchneiderSeba/Taxi-App](https://github.com/SchneiderSeba/Taxi-App)

---

### 💚 Gracias por utilizar **Taxi App**  
Hecha con dedicación para facilitar el trabajo de quienes mantienen nuestras ciudades en movimiento.

**⭐ Si te gusta el proyecto, no olvides dejar una estrella en GitHub!**
