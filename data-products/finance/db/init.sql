CREATE TABLE IF NOT EXISTS property_financials (
    property_id VARCHAR(50) PRIMARY KEY,
    annual_revenue NUMERIC(15,2) NOT NULL,
    operating_cost NUMERIC(15,2) NOT NULL,
    net_operating_income NUMERIC(15,2) NOT NULL
);

INSERT INTO property_financials (
    property_id,
    annual_revenue,
    operating_cost,
    net_operating_income
)
VALUES
    ('P1001', 2500000.00, 900000.00, 1600000.00),
    ('P1002', 3200000.00, 1400000.00, 1800000.00)
ON CONFLICT (property_id) DO NOTHING;
