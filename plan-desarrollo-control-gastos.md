# Plan de Desarrollo: App Control de Gastos Mensual

## 📋 Índice

1. [Visión General del Proyecto](#visión-general-del-proyecto)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Esquema de Base de Datos](#esquema-de-base-de-datos)
5. [Sistema de Autenticación](#sistema-de-autenticación)
6. [Estructura del Proyecto](#estructura-del-proyecto)
7. [Componentes y Páginas](#componentes-y-páginas)
8. [API y Endpoints](#api-y-endpoints)
9. [Diseño UI/UX](#diseño-uiux)
10. [Configuración de Despliegue](#configuración-de-despliegue)
11. [Variables de Entorno](#variables-de-entorno)

---

## Visión General del Proyecto

### Descripción
Aplicación web de control de gastos personales mensuales que permite a los usuarios gestionar sus finanzas de manera visual e intuitiva. El sistema permite registrar ingresos, gastos categorizados, tarjetas de crédito, presupuestos y metas de ahorro.

### Funcionalidades Principales
- Sistema de autenticación (registro/login)
- CRUD completo de gastos e ingresos
- Dashboard con gráficas interactivas
- Gestión de tarjetas de crédito
- Sistema de presupuestos por categoría
- Metas de ahorro con seguimiento
- Consolidado mensual/anual
- Filtros y búsquedas avanzadas

### Categorías de Gastos por Defecto
1. Domicilios
2. Mercado
3. Créditos
4. Tools
5. Streaming
6. Entretenimiento
7. Hogar
8. Familia
9. Salud
10. Viajes
11. Tarjetas (grupo especial)

---

## Stack Tecnológico

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Estilos:** Tailwind CSS 3.4
- **Componentes UI:** shadcn/ui
- **Gráficas:** Recharts
- **Iconos:** Lucide React
- **Formularios:** React Hook Form + Zod
- **Estado Global:** Zustand
- **Fechas:** date-fns

### Backend
- **API:** Next.js API Routes (Route Handlers)
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **ORM:** Supabase Client (SDK)

### DevOps
- **Control de Versiones:** Git + GitHub
- **Hosting:** VPS con Dokploy
- **CI/CD:** GitHub Actions

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Next.js Frontend (App Router)           │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │    │
│  │  │ Dashboard│ │ Gastos   │ │ Ingresos │ │ Metas  │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │    │
│  │  │ Tarjetas │ │Presupuest│ │Consolidado│            │    │
│  │  └──────────┘ └──────────┘ └──────────┘            │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /api/auth/*  │  /api/expenses/*  │  /api/income/*   │   │
│  │  /api/cards/* │  /api/budgets/*   │  /api/goals/*    │   │
│  │  /api/categories/*  │  /api/summary/*                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       SUPABASE                               │
│  ┌─────────────────┐  ┌─────────────────────────────────┐   │
│  │  Supabase Auth  │  │        PostgreSQL Database       │   │
│  │  ───────────────│  │  ┌───────┐ ┌─────────┐ ┌──────┐ │   │
│  │  • Email/Pass   │  │  │users  │ │expenses │ │income│ │   │
│  │  • Magic Link   │  │  └───────┘ └─────────┘ └──────┘ │   │
│  │  • OAuth        │  │  ┌───────┐ ┌─────────┐ ┌──────┐ │   │
│  └─────────────────┘  │  │cards  │ │budgets  │ │goals │ │   │
│                       │  └───────┘ └─────────┘ └──────┘ │   │
│                       └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Esquema de Base de Datos

### SQL Completo para Supabase

```sql
-- ============================================
-- EXTENSIONES NECESARIAS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: profiles (Perfil de usuario)
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    currency TEXT DEFAULT 'COP',
    timezone TEXT DEFAULT 'America/Bogota',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TABLA: categories (Categorías de gastos)
-- ============================================
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'folder',
    color TEXT DEFAULT '#6366f1',
    is_default BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_categories_user ON public.categories(user_id);

-- RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own categories" ON public.categories
    FOR ALL USING (auth.uid() = user_id);

-- Función para crear categorías por defecto
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.categories (user_id, name, icon, color, is_default, sort_order) VALUES
        (NEW.id, 'Domicilios', 'home', '#ef4444', TRUE, 1),
        (NEW.id, 'Mercado', 'shopping-cart', '#f97316', TRUE, 2),
        (NEW.id, 'Créditos', 'credit-card', '#eab308', TRUE, 3),
        (NEW.id, 'Tools', 'wrench', '#84cc16', TRUE, 4),
        (NEW.id, 'Streaming', 'tv', '#22c55e', TRUE, 5),
        (NEW.id, 'Entretenimiento', 'gamepad-2', '#14b8a6', TRUE, 6),
        (NEW.id, 'Hogar', 'house', '#06b6d4', TRUE, 7),
        (NEW.id, 'Familia', 'users', '#3b82f6', TRUE, 8),
        (NEW.id, 'Salud', 'heart-pulse', '#8b5cf6', TRUE, 9),
        (NEW.id, 'Viajes', 'plane', '#ec4899', TRUE, 10);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_categories
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.create_default_categories();

-- ============================================
-- TABLA: credit_cards (Tarjetas de crédito)
-- ============================================
CREATE TABLE public.credit_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    last_four_digits TEXT,
    bank_name TEXT,
    credit_limit DECIMAL(15,2) DEFAULT 0,
    cut_off_day INTEGER CHECK (cut_off_day >= 1 AND cut_off_day <= 31),
    payment_day INTEGER CHECK (payment_day >= 1 AND payment_day <= 31),
    color TEXT DEFAULT '#6366f1',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_credit_cards_user ON public.credit_cards(user_id);
CREATE INDEX idx_credit_cards_active ON public.credit_cards(user_id, is_active);

-- RLS
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own credit cards" ON public.credit_cards
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLA: expenses (Gastos)
-- ============================================
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card')),
    expense_date DATE NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    notes TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_expenses_user ON public.expenses(user_id);
CREATE INDEX idx_expenses_category ON public.expenses(category_id);
CREATE INDEX idx_expenses_card ON public.expenses(credit_card_id);
CREATE INDEX idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX idx_expenses_month_year ON public.expenses(user_id, year, month);
CREATE INDEX idx_expenses_payment ON public.expenses(user_id, payment_method);

-- RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own expenses" ON public.expenses
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLA: income (Ingresos)
-- ============================================
CREATE TABLE public.income (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    income_date DATE NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    source TEXT,
    notes TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_income_user ON public.income(user_id);
CREATE INDEX idx_income_date ON public.income(income_date);
CREATE INDEX idx_income_month_year ON public.income(user_id, year, month);

-- RLS
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own income" ON public.income
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLA: budgets (Presupuestos)
-- ============================================
CREATE TABLE public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category_id, month, year)
);

-- Índices
CREATE INDEX idx_budgets_user ON public.budgets(user_id);
CREATE INDEX idx_budgets_category ON public.budgets(category_id);
CREATE INDEX idx_budgets_month_year ON public.budgets(user_id, year, month);

-- RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own budgets" ON public.budgets
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLA: goals (Metas de ahorro)
-- ============================================
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(15,2) DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE,
    color TEXT DEFAULT '#22c55e',
    icon TEXT DEFAULT 'target',
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_goals_user ON public.goals(user_id);
CREATE INDEX idx_goals_completed ON public.goals(user_id, is_completed);

-- RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals" ON public.goals
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TABLA: goal_contributions (Aportes a metas)
-- ============================================
CREATE TABLE public.goal_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    contribution_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_goal_contributions_user ON public.goal_contributions(user_id);
CREATE INDEX idx_goal_contributions_goal ON public.goal_contributions(goal_id);
CREATE INDEX idx_goal_contributions_date ON public.goal_contributions(contribution_date);

-- RLS
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goal contributions" ON public.goal_contributions
    FOR ALL USING (auth.uid() = user_id);

-- Trigger para actualizar current_amount en goals
CREATE OR REPLACE FUNCTION public.update_goal_current_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.goals 
        SET current_amount = current_amount + NEW.amount,
            updated_at = NOW(),
            is_completed = CASE 
                WHEN current_amount + NEW.amount >= target_amount THEN TRUE 
                ELSE FALSE 
            END,
            completed_at = CASE 
                WHEN current_amount + NEW.amount >= target_amount THEN NOW() 
                ELSE NULL 
            END
        WHERE id = NEW.goal_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.goals 
        SET current_amount = current_amount - OLD.amount,
            updated_at = NOW(),
            is_completed = FALSE,
            completed_at = NULL
        WHERE id = OLD.goal_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.goals 
        SET current_amount = current_amount - OLD.amount + NEW.amount,
            updated_at = NOW(),
            is_completed = CASE 
                WHEN current_amount - OLD.amount + NEW.amount >= target_amount THEN TRUE 
                ELSE FALSE 
            END,
            completed_at = CASE 
                WHEN current_amount - OLD.amount + NEW.amount >= target_amount THEN NOW() 
                ELSE NULL 
            END
        WHERE id = NEW.goal_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_goal_contribution_change
    AFTER INSERT OR UPDATE OR DELETE ON public.goal_contributions
    FOR EACH ROW EXECUTE FUNCTION public.update_goal_current_amount();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Resumen mensual de gastos por categoría
CREATE OR REPLACE VIEW public.monthly_expenses_summary AS
SELECT 
    e.user_id,
    e.year,
    e.month,
    e.category_id,
    c.name as category_name,
    c.color as category_color,
    c.icon as category_icon,
    SUM(e.amount) as total_amount,
    COUNT(*) as transaction_count,
    COALESCE(b.amount, 0) as budget_amount,
    COALESCE(b.amount, 0) - SUM(e.amount) as remaining_budget
FROM public.expenses e
LEFT JOIN public.categories c ON e.category_id = c.id
LEFT JOIN public.budgets b ON b.category_id = e.category_id 
    AND b.month = e.month 
    AND b.year = e.year
GROUP BY e.user_id, e.year, e.month, e.category_id, c.name, c.color, c.icon, b.amount;

-- Vista: Resumen mensual de tarjetas de crédito
CREATE OR REPLACE VIEW public.monthly_card_summary AS
SELECT 
    e.user_id,
    e.year,
    e.month,
    e.credit_card_id,
    cc.name as card_name,
    cc.color as card_color,
    cc.cut_off_day,
    cc.payment_day,
    cc.credit_limit,
    SUM(e.amount) as total_charged,
    cc.credit_limit - SUM(e.amount) as available_credit
FROM public.expenses e
JOIN public.credit_cards cc ON e.credit_card_id = cc.id
WHERE e.payment_method = 'card'
GROUP BY e.user_id, e.year, e.month, e.credit_card_id, cc.name, cc.color, 
         cc.cut_off_day, cc.payment_day, cc.credit_limit;

-- Vista: Consolidado mensual
CREATE OR REPLACE VIEW public.monthly_consolidated AS
SELECT 
    p.id as user_id,
    y.year,
    m.month,
    COALESCE(inc.total_income, 0) as total_income,
    COALESCE(exp.total_expenses, 0) as total_expenses,
    COALESCE(inc.total_income, 0) - COALESCE(exp.total_expenses, 0) as balance,
    COALESCE(card.total_card_expenses, 0) as total_card_expenses,
    COALESCE(cash.total_cash_expenses, 0) as total_cash_expenses,
    COALESCE(bud.total_budget, 0) as total_budget,
    COALESCE(bud.total_budget, 0) - COALESCE(exp.total_expenses, 0) as budget_remaining
FROM public.profiles p
CROSS JOIN (SELECT generate_series(2020, 2030) as year) y
CROSS JOIN (SELECT generate_series(1, 12) as month) m
LEFT JOIN (
    SELECT user_id, year, month, SUM(amount) as total_income
    FROM public.income GROUP BY user_id, year, month
) inc ON p.id = inc.user_id AND y.year = inc.year AND m.month = inc.month
LEFT JOIN (
    SELECT user_id, year, month, SUM(amount) as total_expenses
    FROM public.expenses GROUP BY user_id, year, month
) exp ON p.id = exp.user_id AND y.year = exp.year AND m.month = exp.month
LEFT JOIN (
    SELECT user_id, year, month, SUM(amount) as total_card_expenses
    FROM public.expenses WHERE payment_method = 'card'
    GROUP BY user_id, year, month
) card ON p.id = card.user_id AND y.year = card.year AND m.month = card.month
LEFT JOIN (
    SELECT user_id, year, month, SUM(amount) as total_cash_expenses
    FROM public.expenses WHERE payment_method = 'cash'
    GROUP BY user_id, year, month
) cash ON p.id = cash.user_id AND y.year = cash.year AND m.month = cash.month
LEFT JOIN (
    SELECT user_id, year, month, SUM(amount) as total_budget
    FROM public.budgets GROUP BY user_id, year, month
) bud ON p.id = bud.user_id AND y.year = bud.year AND m.month = bud.month;

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función: Obtener balance del mes
CREATE OR REPLACE FUNCTION public.get_monthly_balance(
    p_user_id UUID,
    p_year INTEGER,
    p_month INTEGER
)
RETURNS TABLE (
    total_income DECIMAL,
    total_expenses DECIMAL,
    balance DECIMAL,
    total_budget DECIMAL,
    budget_remaining DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(i.amount), 0)::DECIMAL as total_income,
        COALESCE((SELECT SUM(e.amount) FROM public.expenses e 
                  WHERE e.user_id = p_user_id AND e.year = p_year AND e.month = p_month), 0)::DECIMAL as total_expenses,
        (COALESCE(SUM(i.amount), 0) - COALESCE((SELECT SUM(e.amount) FROM public.expenses e 
                  WHERE e.user_id = p_user_id AND e.year = p_year AND e.month = p_month), 0))::DECIMAL as balance,
        COALESCE((SELECT SUM(b.amount) FROM public.budgets b 
                  WHERE b.user_id = p_user_id AND b.year = p_year AND b.month = p_month), 0)::DECIMAL as total_budget,
        (COALESCE((SELECT SUM(b.amount) FROM public.budgets b 
                  WHERE b.user_id = p_user_id AND b.year = p_year AND b.month = p_month), 0) -
         COALESCE((SELECT SUM(e.amount) FROM public.expenses e 
                  WHERE e.user_id = p_user_id AND e.year = p_year AND e.month = p_month), 0))::DECIMAL as budget_remaining
    FROM public.income i
    WHERE i.user_id = p_user_id AND i.year = p_year AND i.month = p_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ACTUALIZAR TIMESTAMPS AUTOMÁTICAMENTE
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON public.credit_cards
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_income_updated_at BEFORE UPDATE ON public.income
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

---

## Sistema de Autenticación

### Configuración de Supabase Auth

El sistema utilizará Supabase Auth con las siguientes opciones:

#### Métodos de Autenticación
1. **Email/Password** - Método principal
2. **Magic Link** - Opcional para recuperación
3. **OAuth** (opcional futuro) - Google, GitHub

#### Flujo de Autenticación

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Registro   │────▶│  Verificar   │────▶│   Crear      │
│   Usuario    │     │    Email     │     │   Perfil     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Dashboard  │◀────│   Session    │◀────│  Categorías  │
│              │     │   Activa     │     │  Por Defecto │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Middleware de Autenticación

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Rutas protegidas
  const protectedRoutes = ['/dashboard', '/expenses', '/income', '/cards', '/goals', '/budgets', '/reports']
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // Rutas de auth
  const authRoutes = ['/login', '/register', '/forgot-password']
  const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)']
}
```

---

## Estructura del Proyecto

```
expense-tracker/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD con GitHub Actions
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── expenses/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── income/
│   │   │   │   └── page.tsx
│   │   │   ├── cards/
│   │   │   │   └── page.tsx
│   │   │   ├── budgets/
│   │   │   │   └── page.tsx
│   │   │   ├── goals/
│   │   │   │   └── page.tsx
│   │   │   ├── reports/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── callback/
│   │   │   │       └── route.ts
│   │   │   ├── expenses/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── income/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── categories/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── cards/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── budgets/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── goals/
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── contributions/
│   │   │   │       └── route.ts
│   │   │   └── summary/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Landing page
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── alert.tsx
│   │   │   └── form.tsx
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── footer.tsx
│   │   ├── dashboard/
│   │   │   ├── summary-cards.tsx
│   │   │   ├── expense-chart.tsx
│   │   │   ├── income-chart.tsx
│   │   │   ├── category-breakdown.tsx
│   │   │   ├── recent-transactions.tsx
│   │   │   ├── budget-progress.tsx
│   │   │   └── goals-progress.tsx
│   │   ├── expenses/
│   │   │   ├── expense-form.tsx
│   │   │   ├── expense-list.tsx
│   │   │   ├── expense-item.tsx
│   │   │   ├── expense-filters.tsx
│   │   │   └── category-selector.tsx
│   │   ├── income/
│   │   │   ├── income-form.tsx
│   │   │   ├── income-list.tsx
│   │   │   └── income-item.tsx
│   │   ├── cards/
│   │   │   ├── card-form.tsx
│   │   │   ├── card-list.tsx
│   │   │   ├── card-item.tsx
│   │   │   └── card-summary.tsx
│   │   ├── budgets/
│   │   │   ├── budget-form.tsx
│   │   │   ├── budget-list.tsx
│   │   │   └── budget-progress-bar.tsx
│   │   ├── goals/
│   │   │   ├── goal-form.tsx
│   │   │   ├── goal-list.tsx
│   │   │   ├── goal-item.tsx
│   │   │   ├── goal-progress.tsx
│   │   │   └── contribution-form.tsx
│   │   ├── reports/
│   │   │   ├── monthly-summary.tsx
│   │   │   ├── yearly-comparison.tsx
│   │   │   └── export-options.tsx
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── forgot-password-form.tsx
│   │   └── shared/
│   │       ├── date-picker.tsx
│   │       ├── month-year-picker.tsx
│   │       ├── currency-input.tsx
│   │       ├── loading-spinner.tsx
│   │       ├── empty-state.tsx
│   │       ├── confirm-dialog.tsx
│   │       └── error-boundary.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Cliente para el navegador
│   │   │   ├── server.ts           # Cliente para el servidor
│   │   │   └── admin.ts            # Cliente admin
│   │   ├── utils.ts                # Utilidades generales
│   │   ├── formatters.ts           # Formateo de números/fechas
│   │   └── validators.ts           # Validaciones con Zod
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-expenses.ts
│   │   ├── use-income.ts
│   │   ├── use-cards.ts
│   │   ├── use-budgets.ts
│   │   ├── use-goals.ts
│   │   ├── use-categories.ts
│   │   ├── use-summary.ts
│   │   └── use-filters.ts
│   ├── store/
│   │   ├── auth-store.ts
│   │   ├── filter-store.ts
│   │   └── ui-store.ts
│   ├── types/
│   │   ├── database.ts             # Tipos generados por Supabase
│   │   ├── expense.ts
│   │   ├── income.ts
│   │   ├── card.ts
│   │   ├── budget.ts
│   │   ├── goal.ts
│   │   └── category.ts
│   └── constants/
│       ├── categories.ts
│       └── routes.ts
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── seed.sql
│   └── config.toml
├── .env.local.example
├── .env.production.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── middleware.ts
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Componentes y Páginas

### Páginas Principales

#### 1. Landing Page (`/`)
- Hero section con CTA
- Features destacadas
- Testimonios (opcional)
- Botones de Login/Registro

#### 2. Dashboard (`/dashboard`)
- Cards de resumen (Ingresos, Gastos, Balance, Presupuesto)
- Gráfica de gastos por categoría (Pie Chart)
- Gráfica de evolución mensual (Line Chart)
- Transacciones recientes
- Progreso de presupuestos
- Progreso de metas

#### 3. Gastos (`/expenses`)
- Tabla con todos los gastos
- Filtros por: categoría, método de pago, fecha, tarjeta
- Formulario para agregar/editar gasto
- Agrupación por categoría con totales
- Indicador de presupuesto por categoría

#### 4. Ingresos (`/income`)
- Lista de ingresos del mes
- Formulario para agregar/editar ingreso
- Total de ingresos del mes

#### 5. Tarjetas (`/cards`)
- Lista de tarjetas de crédito
- Formulario para agregar/editar tarjeta
- Resumen de gastos por tarjeta
- Fechas de corte y pago

#### 6. Presupuestos (`/budgets`)
- Lista de presupuestos por categoría
- Barra de progreso por categoría
- Formulario para asignar presupuesto
- Alertas de presupuesto excedido

#### 7. Metas (`/goals`)
- Lista de metas de ahorro
- Progreso de cada meta
- Formulario para agregar meta
- Formulario para agregar aporte a meta
- Historial de aportes

#### 8. Consolidado/Reportes (`/reports`)
- Selector de mes/año
- Resumen completo del período
- Comparativa con meses anteriores
- Exportar datos (CSV/PDF)

### Componentes Clave

#### ExpenseForm
```typescript
interface ExpenseFormProps {
  expense?: Expense;
  categories: Category[];
  creditCards: CreditCard[];
  currentMonth: number;
  currentYear: number;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
}

interface ExpenseFormData {
  name: string;
  amount: number;
  category_id: string;
  payment_method: 'cash' | 'card';
  credit_card_id?: string;
  expense_date: Date;
  notes?: string;
}
```

#### SummaryCards
```typescript
interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  totalBudget: number;
  budgetRemaining: number;
}
```

#### BudgetProgressBar
```typescript
interface BudgetProgressBarProps {
  categoryName: string;
  categoryColor: string;
  spent: number;
  budget: number;
  showPercentage?: boolean;
}
```

---

## API y Endpoints

### Expenses API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/expenses` | Listar gastos (con filtros) |
| POST | `/api/expenses` | Crear gasto |
| GET | `/api/expenses/[id]` | Obtener gasto |
| PUT | `/api/expenses/[id]` | Actualizar gasto |
| DELETE | `/api/expenses/[id]` | Eliminar gasto |

### Income API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/income` | Listar ingresos |
| POST | `/api/income` | Crear ingreso |
| GET | `/api/income/[id]` | Obtener ingreso |
| PUT | `/api/income/[id]` | Actualizar ingreso |
| DELETE | `/api/income/[id]` | Eliminar ingreso |

### Categories API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categories` | Listar categorías |
| POST | `/api/categories` | Crear categoría |
| PUT | `/api/categories/[id]` | Actualizar categoría |
| DELETE | `/api/categories/[id]` | Eliminar categoría |

### Credit Cards API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/cards` | Listar tarjetas |
| POST | `/api/cards` | Crear tarjeta |
| PUT | `/api/cards/[id]` | Actualizar tarjeta |
| DELETE | `/api/cards/[id]` | Eliminar tarjeta |

### Budgets API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/budgets` | Listar presupuestos |
| POST | `/api/budgets` | Crear/actualizar presupuesto |
| DELETE | `/api/budgets/[id]` | Eliminar presupuesto |

### Goals API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/goals` | Listar metas |
| POST | `/api/goals` | Crear meta |
| PUT | `/api/goals/[id]` | Actualizar meta |
| DELETE | `/api/goals/[id]` | Eliminar meta |
| POST | `/api/goals/contributions` | Agregar aporte |

### Summary API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/summary?month=X&year=Y` | Obtener consolidado mensual |

### Parámetros de Filtro Comunes

```typescript
interface FilterParams {
  month?: number;
  year?: number;
  category_id?: string;
  payment_method?: 'cash' | 'card';
  credit_card_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

---

## Diseño UI/UX

### Paleta de Colores

```css
:root {
  /* Colores principales */
  --primary: #6366f1;        /* Indigo */
  --primary-dark: #4f46e5;
  --secondary: #ec4899;      /* Pink */
  
  /* Estados */
  --success: #22c55e;        /* Verde - positivo */
  --warning: #f59e0b;        /* Amarillo - precaución */
  --danger: #ef4444;         /* Rojo - negativo/excedido */
  --info: #3b82f6;           /* Azul - información */
  
  /* Neutrales */
  --background: #f8fafc;
  --surface: #ffffff;
  --border: #e2e8f0;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  
  /* Dark mode */
  --dark-background: #0f172a;
  --dark-surface: #1e293b;
  --dark-border: #334155;
  --dark-text-primary: #f1f5f9;
  --dark-text-secondary: #94a3b8;
}
```

### Tipografía

```css
/* Font family */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

### Layout Responsive

```
Desktop (lg+):
┌────────────────────────────────────────────────────┐
│ Header (Logo, User Menu)                           │
├──────────┬─────────────────────────────────────────┤
│          │                                         │
│ Sidebar  │            Main Content                 │
│ (Fixed)  │                                         │
│          │                                         │
│          │                                         │
└──────────┴─────────────────────────────────────────┘

Mobile (sm):
┌─────────────────────┐
│ Header + Menu       │
├─────────────────────┤
│                     │
│   Main Content      │
│                     │
│                     │
├─────────────────────┤
│ Bottom Navigation   │
└─────────────────────┘
```

---

## Configuración de Despliegue

### Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Instalar dependencias
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
        - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: unless-stopped
```

### GitHub Actions (CI/CD)

```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Dokploy
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /path/to/app
            git pull origin main
            docker-compose build
            docker-compose up -d
```

### Configuración Dokploy

1. Crear aplicación en Dokploy
2. Conectar repositorio de GitHub
3. Configurar variables de entorno
4. Configurar dominio/SSL
5. Habilitar auto-deploy

---

## Variables de Entorno

### .env.local (Desarrollo)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Control de Gastos

# Opcional
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### .env.production

```env
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App
NEXT_PUBLIC_APP_URL=https://miapp.com
NEXT_PUBLIC_APP_NAME=Control de Gastos

# Opcional
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## Configuración Next.js

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ['xxxxx.supabase.co'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

---

## Dependencias del Proyecto

```json
{
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/auth-helpers-nextjs": "^0.9.0",
    "@supabase/ssr": "^0.1.0",
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.309.0",
    "recharts": "^2.10.0",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "zustand": "^4.4.0",
    "date-fns": "^3.2.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "@radix-ui/react-popover": "^1.0.0",
    "@radix-ui/react-slot": "^1.0.0",
    "sonner": "^1.3.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0",
    "supabase": "^1.131.0"
  }
}
```

---

## Consideraciones Adicionales

### Seguridad
- Implementar RLS (Row Level Security) en todas las tablas
- Validar todos los inputs con Zod
- Sanitizar datos antes de guardar
- Usar HTTPS en producción
- Implementar rate limiting

### Performance
- Usar React Server Components donde sea posible
- Implementar paginación en listas largas
- Cachear datos con React Query o SWR
- Optimizar imágenes con next/image
- Lazy loading de componentes pesados

### Accesibilidad
- Usar etiquetas semánticas HTML
- Implementar navegación por teclado
- Proveer textos alternativos
- Mantener contraste adecuado
- Soportar lectores de pantalla

### Internacionalización (Futuro)
- Preparar estructura para i18n
- Formateo de números según locale
- Soporte para múltiples monedas

---

## Fases de Desarrollo Sugeridas

### Fase 1: MVP (2-3 semanas)
- [ ] Setup del proyecto
- [ ] Sistema de autenticación
- [ ] CRUD de gastos e ingresos
- [ ] Dashboard básico
- [ ] Categorías por defecto

### Fase 2: Core Features (2-3 semanas)
- [ ] Gestión de tarjetas de crédito
- [ ] Sistema de presupuestos
- [ ] Filtros y búsquedas
- [ ] Gráficas interactivas

### Fase 3: Features Avanzadas (2-3 semanas)
- [ ] Sistema de metas
- [ ] Consolidado mensual
- [ ] Reportes y exportación
- [ ] Configuración de usuario

### Fase 4: Polish y Deploy (1-2 semanas)
- [ ] Optimización de performance
- [ ] Testing
- [ ] Documentación
- [ ] Despliegue en producción

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Start producción
npm run start

# Lint
npm run lint

# Generar tipos de Supabase
npx supabase gen types typescript --project-id your-project-id > src/types/database.ts

# Docker
docker-compose build
docker-compose up -d
docker-compose logs -f
```

---

*Documento generado para ser utilizado con Google Antigravity IDE*
*Versión: 1.0*
*Última actualización: Enero 2025*
