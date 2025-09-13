-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'engineer', 'manager', 'viewer');
CREATE TYPE batch_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
CREATE TYPE test_result AS ENUM ('pass', 'fail', 'warning', 'n/a');
CREATE TYPE report_type AS ENUM ('daily', 'weekly', 'monthly', 'batch', 'custom');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role DEFAULT 'viewer',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Devices table
CREATE TABLE public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_code TEXT UNIQUE NOT NULL,
    device_name TEXT NOT NULL,
    specifications JSONB NOT NULL DEFAULT '{}',
    certification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test batches table
CREATE TABLE public.test_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_number TEXT UNIQUE NOT NULL,
    device_model TEXT NOT NULL,
    manufacturer TEXT,
    production_date DATE,
    test_date DATE NOT NULL DEFAULT CURRENT_DATE,
    operator_id UUID REFERENCES public.profiles(id),
    status batch_status DEFAULT 'pending',
    total_tests INTEGER DEFAULT 0,
    passed_tests INTEGER DEFAULT 0,
    failed_tests INTEGER DEFAULT 0,
    pass_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test data table
CREATE TABLE public.test_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES public.test_batches(id) ON DELETE CASCADE,
    test_item TEXT NOT NULL,
    test_value DECIMAL(10,4) NOT NULL,
    unit TEXT NOT NULL,
    standard_value DECIMAL(10,4),
    deviation DECIMAL(10,4),
    result test_result NOT NULL DEFAULT 'n/a',
    test_conditions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type report_type NOT NULL,
    batch_id UUID REFERENCES public.test_batches(id) ON DELETE SET NULL,
    date_range JSONB,
    generated_by UUID REFERENCES public.profiles(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_url TEXT,
    status TEXT DEFAULT 'generating',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('error', 'warning', 'info')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    batch_id UUID REFERENCES public.test_batches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_test_batches_status ON public.test_batches(status);
CREATE INDEX idx_test_batches_operator ON public.test_batches(operator_id);
CREATE INDEX idx_test_batches_date ON public.test_batches(test_date);
CREATE INDEX idx_test_data_batch ON public.test_data(batch_id);
CREATE INDEX idx_test_data_result ON public.test_data(result);
CREATE INDEX idx_alerts_user ON public.alerts(user_id);
CREATE INDEX idx_alerts_read ON public.alerts(read);

-- Create views for analytics
CREATE OR REPLACE VIEW public.batch_statistics AS
SELECT
    tb.id,
    tb.batch_number,
    tb.device_model,
    tb.manufacturer,
    tb.test_date,
    tb.status,
    COUNT(td.id) as total_tests,
    COUNT(CASE WHEN td.result = 'pass' THEN 1 END) as passed_tests,
    COUNT(CASE WHEN td.result = 'fail' THEN 1 END) as failed_tests,
    CASE 
        WHEN COUNT(td.id) > 0 
        THEN ROUND(COUNT(CASE WHEN td.result = 'pass' THEN 1 END)::DECIMAL / COUNT(td.id) * 100, 2)
        ELSE 0
    END as pass_rate,
    p.name as operator_name
FROM public.test_batches tb
LEFT JOIN public.test_data td ON tb.id = td.batch_id
LEFT JOIN public.profiles p ON tb.operator_id = p.id
GROUP BY tb.id, p.name;

-- Create functions for triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update batch statistics
CREATE OR REPLACE FUNCTION update_batch_statistics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.test_batches
    SET 
        total_tests = (SELECT COUNT(*) FROM public.test_data WHERE batch_id = NEW.batch_id),
        passed_tests = (SELECT COUNT(*) FROM public.test_data WHERE batch_id = NEW.batch_id AND result = 'pass'),
        failed_tests = (SELECT COUNT(*) FROM public.test_data WHERE batch_id = NEW.batch_id AND result = 'fail'),
        pass_rate = CASE 
            WHEN (SELECT COUNT(*) FROM public.test_data WHERE batch_id = NEW.batch_id) > 0
            THEN ROUND((SELECT COUNT(*) FROM public.test_data WHERE batch_id = NEW.batch_id AND result = 'pass')::DECIMAL / 
                      (SELECT COUNT(*) FROM public.test_data WHERE batch_id = NEW.batch_id) * 100, 2)
            ELSE 0
        END,
        updated_at = NOW()
    WHERE id = NEW.batch_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON public.devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_test_batches_updated_at BEFORE UPDATE ON public.test_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_batch_stats_on_test_data_change
    AFTER INSERT OR UPDATE OR DELETE ON public.test_data
    FOR EACH ROW EXECUTE FUNCTION update_batch_statistics();

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can view all profiles but only update their own
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Devices: Viewable by all, editable by admin and engineer
CREATE POLICY "Devices are viewable by authenticated users" ON public.devices
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Devices are editable by admin and engineer" ON public.devices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'engineer')
        )
    );

-- Test batches: Viewable by all, editable by creator, admin, and engineer
CREATE POLICY "Test batches are viewable by authenticated users" ON public.test_batches
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Test batches are editable by authorized users" ON public.test_batches
    FOR ALL USING (
        auth.uid() = operator_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'engineer')
        )
    );

-- Test data: Same as test batches
CREATE POLICY "Test data are viewable by authenticated users" ON public.test_data
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Test data are editable by authorized users" ON public.test_data
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.test_batches tb
            WHERE tb.id = test_data.batch_id
            AND (
                tb.operator_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('admin', 'engineer')
                )
            )
        )
    );

-- Reports: Viewable by all, creatable by all authenticated users
CREATE POLICY "Reports are viewable by authenticated users" ON public.reports
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Reports are creatable by authenticated users" ON public.reports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Alerts: Users can only see their own alerts
CREATE POLICY "Users can view own alerts" ON public.alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create alerts for users" ON public.alerts
    FOR INSERT WITH CHECK (true);

-- Insert default data for testing
INSERT INTO public.profiles (id, email, name, role) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@example.com', '系统管理员', 'admin'),
    ('00000000-0000-0000-0000-000000000002', 'engineer@example.com', '测试工程师', 'engineer'),
    ('00000000-0000-0000-0000-000000000003', 'manager@example.com', '质量主管', 'manager')
ON CONFLICT (id) DO NOTHING;