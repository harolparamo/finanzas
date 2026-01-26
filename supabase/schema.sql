-- ============================================
-- CONTROL DE GASTOS - ESQUEMA SQL PARA SUPABASE
-- ============================================
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================

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
