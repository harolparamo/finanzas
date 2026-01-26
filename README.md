# Control de Gastos Personales

Aplicación web para gestionar tus finanzas personales mensuales. Construida con Next.js 14, Tailwind CSS, shadcn/ui, y Supabase.

![Dashboard Preview](preview.png)

## ✨ Características

- 📊 **Dashboard interactivo** con gráficas y resúmenes
- 💰 **Control de gastos** por categoría
- 💵 **Registro de ingresos** con fuentes
- 💳 **Gestión de tarjetas** de crédito
- 🎯 **Metas de ahorro** con seguimiento de progreso
- 📈 **Presupuestos** por categoría con alertas
- 📱 **Diseño responsive** (móvil y desktop)

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+ instalado
- npm o yarn

### Instalación

1. **Instalar dependencias:**
   ```bash
   cd c:\Users\user\finanzas
   npm install
   ```

2. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador:**
   ```
   http://localhost:3000
   ```

## 🔧 Configuración

### Modo Mock (Predeterminado)

La aplicación viene configurada con datos de prueba. No necesitas una conexión a Supabase para probarla.

### Conectar Supabase (Producción)

1. Crea un proyecto en [Supabase](https://supabase.com)

2. Ejecuta el SQL en `supabase/schema.sql` en el SQL Editor de Supabase

3. Copia `.env.example` a `.env.local` y configura tus credenciales:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   NEXT_PUBLIC_USE_MOCK_DATA=false
   ```

4. Reinicia el servidor de desarrollo

## 📁 Estructura del Proyecto

```
finanzas/
├── src/
│   ├── app/                    # Páginas (App Router)
│   │   ├── (auth)/             # Autenticación
│   │   ├── (dashboard)/        # Dashboard y módulos
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # Componentes base
│   │   ├── layout/             # Sidebar, Header
│   │   └── dashboard/          # Widgets del dashboard
│   ├── lib/                    # Utilidades
│   ├── store/                  # Estado (Zustand)
│   └── types/                  # TypeScript
├── supabase/
│   └── schema.sql              # SQL para Supabase
├── tailwind.config.ts
└── package.json
```

## 🎨 Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Estilos:** Tailwind CSS
- **Componentes:** shadcn/ui + Radix UI
- **Gráficas:** Recharts
- **Estado:** Zustand
- **Validación:** Zod + React Hook Form
- **Base de datos:** Supabase (PostgreSQL)

## 📝 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Iniciar producción
npm run lint     # Ejecutar ESLint
```

## 💱 Configuración Regional

- **Moneda:** COP (Peso Colombiano)
- **Formato de fecha:** DD/MM/YYYY
- **Zona horaria:** America/Bogota

## 📄 Licencia

MIT
