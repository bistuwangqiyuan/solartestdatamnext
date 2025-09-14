-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    WITH stats AS (
        SELECT
            COUNT(DISTINCT tb.id) as total_batches,
            COUNT(td.id) as total_tests,
            COALESCE(AVG(tb.pass_rate), 0) as overall_pass_rate,
            COUNT(DISTINCT CASE WHEN tb.test_date = CURRENT_DATE THEN td.id END) as today_tests,
            COUNT(DISTINCT CASE WHEN tb.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN tb.id END) as weekly_batches,
            COUNT(DISTINCT CASE WHEN tb.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN tb.id END) as monthly_batches
        FROM test_batches tb
        LEFT JOIN test_data td ON tb.id = td.batch_id
    ),
    growth AS (
        SELECT
            CASE 
                WHEN last_week.count > 0 
                THEN ((this_week.count - last_week.count)::DECIMAL / last_week.count * 100)
                ELSE 0
            END as weekly_growth,
            CASE 
                WHEN last_month.count > 0 
                THEN ((this_month.count - last_month.count)::DECIMAL / last_month.count * 100)
                ELSE 0
            END as monthly_growth
        FROM
            (SELECT COUNT(*) as count FROM test_batches WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') this_week,
            (SELECT COUNT(*) as count FROM test_batches WHERE created_at >= CURRENT_DATE - INTERVAL '14 days' AND created_at < CURRENT_DATE - INTERVAL '7 days') last_week,
            (SELECT COUNT(*) as count FROM test_batches WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') this_month,
            (SELECT COUNT(*) as count FROM test_batches WHERE created_at >= CURRENT_DATE - INTERVAL '60 days' AND created_at < CURRENT_DATE - INTERVAL '30 days') last_month
    ),
    active_users AS (
        SELECT COUNT(DISTINCT operator_id) as active_users
        FROM test_batches
        WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
    ),
    pending_reports AS (
        SELECT COUNT(*) as pending_reports
        FROM reports
        WHERE status = 'generating'
    )
    SELECT json_build_object(
        'totalBatches', stats.total_batches,
        'totalTests', stats.total_tests,
        'overallPassRate', ROUND(stats.overall_pass_rate, 2),
        'todayTests', stats.today_tests,
        'weeklyGrowth', ROUND(growth.weekly_growth, 2),
        'monthlyGrowth', ROUND(growth.monthly_growth, 2),
        'activeUsers', active_users.active_users,
        'pendingReports', pending_reports.pending_reports
    ) INTO result
    FROM stats, growth, active_users, pending_reports;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get test trends
CREATE OR REPLACE FUNCTION get_test_trends(days INTEGER DEFAULT 30)
RETURNS TABLE(
    date DATE,
    test_count INTEGER,
    pass_rate DECIMAL,
    batch_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.date,
        COALESCE(COUNT(DISTINCT td.id), 0)::INTEGER as test_count,
        COALESCE(AVG(CASE WHEN td.result = 'pass' THEN 100 ELSE 0 END), 0)::DECIMAL as pass_rate,
        COALESCE(COUNT(DISTINCT tb.id), 0)::INTEGER as batch_count
    FROM generate_series(
        CURRENT_DATE - INTERVAL '1 day' * (days - 1),
        CURRENT_DATE,
        INTERVAL '1 day'
    ) d(date)
    LEFT JOIN test_batches tb ON tb.test_date = d.date
    LEFT JOIN test_data td ON td.batch_id = tb.id
    GROUP BY d.date
    ORDER BY d.date;
END;
$$ LANGUAGE plpgsql;

-- Function to get device distribution
CREATE OR REPLACE FUNCTION get_device_distribution()
RETURNS TABLE(
    device_model TEXT,
    test_count INTEGER,
    batch_count INTEGER,
    avg_pass_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tb.device_model,
        COUNT(td.id)::INTEGER as test_count,
        COUNT(DISTINCT tb.id)::INTEGER as batch_count,
        COALESCE(AVG(tb.pass_rate), 0)::DECIMAL as avg_pass_rate
    FROM test_batches tb
    LEFT JOIN test_data td ON tb.id = td.batch_id
    GROUP BY tb.device_model
    ORDER BY test_count DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Function to get operator performance
CREATE OR REPLACE FUNCTION get_operator_performance()
RETURNS TABLE(
    operator_id UUID,
    operator_name TEXT,
    test_count INTEGER,
    batch_count INTEGER,
    avg_pass_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as operator_id,
        p.name as operator_name,
        COUNT(td.id)::INTEGER as test_count,
        COUNT(DISTINCT tb.id)::INTEGER as batch_count,
        COALESCE(AVG(tb.pass_rate), 0)::DECIMAL as avg_pass_rate
    FROM profiles p
    INNER JOIN test_batches tb ON tb.operator_id = p.id
    LEFT JOIN test_data td ON tb.id = td.batch_id
    WHERE tb.created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY p.id, p.name
    ORDER BY avg_pass_rate DESC, test_count DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Function to create alert
CREATE OR REPLACE FUNCTION create_alert(
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_batch_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO alerts (type, title, message, batch_id, user_id)
    VALUES (p_type, p_title, p_message, p_batch_id, p_user_id)
    RETURNING id INTO alert_id;
    
    RETURN alert_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create alerts for low pass rates
CREATE OR REPLACE FUNCTION check_pass_rate_alert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.pass_rate < 90 AND NEW.status = 'completed' THEN
        PERFORM create_alert(
            'warning',
            '低合格率警告',
            FORMAT('批次 %s 的合格率为 %s%%，低于90%%的标准', NEW.batch_number, NEW.pass_rate),
            NEW.id,
            NEW.operator_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER batch_pass_rate_alert
    AFTER UPDATE ON test_batches
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed')
    EXECUTE FUNCTION check_pass_rate_alert();

-- Trigger to create alerts for consecutive failures
CREATE OR REPLACE FUNCTION check_consecutive_failures()
RETURNS TRIGGER AS $$
DECLARE
    consecutive_failures INTEGER;
    device_model TEXT;
BEGIN
    IF NEW.result = 'fail' THEN
        -- Check for consecutive failures
        SELECT COUNT(*), tb.device_model INTO consecutive_failures, device_model
        FROM test_data td
        INNER JOIN test_batches tb ON td.batch_id = tb.id
        WHERE tb.device_model = (
            SELECT device_model FROM test_batches WHERE id = NEW.batch_id
        )
        AND td.test_item = NEW.test_item
        AND td.result = 'fail'
        AND td.created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
        GROUP BY tb.device_model;
        
        IF consecutive_failures >= 3 THEN
            PERFORM create_alert(
                'error',
                '连续失败警告',
                FORMAT('设备 %s 的测试项 %s 连续失败 %s 次', device_model, NEW.test_item, consecutive_failures),
                NEW.batch_id
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER test_consecutive_failures_alert
    AFTER INSERT ON test_data
    FOR EACH ROW
    WHEN (NEW.result = 'fail')
    EXECUTE FUNCTION check_consecutive_failures();