# 🚖 Taxi App

Taxi App es una aplicación desarrollada para ayudar a conductores de taxi a gestionar y organizar su trabajo diario.  
Permite registrar viajes, controlar ganancias, llevar seguimiento de gastos y visualizar estadísticas para tener una gestión clara y eficiente.

---

## Pruebalo en este link : [Taxi App](https://taxi-app-production.up.railway.app/profile)


## 📌 Características principales

- ✨ **Inicio de sesión con Magic Link (OAuth)**
- 🚕 **Registro de viajes realizados**
- 💰 **Control de ingresos por viaje**
- 📉 **Registro de gastos operativos (combustible, mantenimiento, peajes, etc.)**
- 📊 **Resumen visual de ganancias vs. gastos**
- 🧾 **Historial completo de operaciones**

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|-----------|-----|
| **React + Vite** | Interfaz de usuario |
| **React Router DOM** | Navegación de rutas |
| **Supabase Auth** | Autenticación con Magic Link (OAuth) |
| **Supabase Database (PostgreSQL)** | Persistencia de datos |
| **TypeScript** | Tipado estricto y mantenimiento |

---

## 📂 Estructura del proyecto

src/
├─ components/
├─ pages/
├─ hooks/
├─ context/
├─ types/
└─ services/


---

## 🔐 Autenticación

Taxi App utiliza **Supabase Auth** para permitir a los conductores acceder mediante:

- Magic Link (email)
- OAuth (Google) - Proximamente

Esto permite un acceso rápido y seguro sin contraseñas.

---

## 🧮 Funcionalidades internas

- Cada viaje registrado queda asociado al usuario mediante su `UUID`.
- Los datos se protegen con **Row Level Security (RLS)** para que cada conductor **solo vea su información**.
- Las estadísticas se calculan dinámicamente según la actividad del usuario.

---

## 🚧 Estado del proyecto

> En desarrollo — nuevas funcionalidades y mejoras se implementarán en próximas versiones.

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

VITE_SUPABASE_URL=https://xxxx.supabase.co

VITE_SUPABASE_ANON_KEY=xxxxx


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

- Notificaciones push  
- Modo offline  
- Exportación de reportes PDF  
- Dashboard avanzado con gráficos  

---

### Gracias por utilizar **Taxi App**  
Hecha para facilitar el trabajo de quienes mantienen nuestras ciudades en movimiento.
