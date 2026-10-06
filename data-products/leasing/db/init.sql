CREATE TABLE IF NOT EXISTS leases (
  id VARCHAR(20) PRIMARY KEY,
  property_id VARCHAR(20) NOT NULL,
  tenant_name VARCHAR(200) NOT NULL,
  monthly_rent NUMERIC(14,2) NOT NULL CHECK (monthly_rent >= 0),
  status VARCHAR(30) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leases_property_id ON leases(property_id);

INSERT INTO leases (id, property_id, tenant_name, monthly_rent, status, start_date, end_date, updated_at)
VALUES
  ('L2001', 'P1001', 'Apex Consulting', 5200.00, 'ACTIVE', '2026-01-01', '2027-12-31', NOW()),
  ('L2002', 'P1001', 'Northstar Trading', 6100.00, 'ACTIVE', '2026-03-01', '2028-02-29', NOW()),
  ('L2003', 'P1002', 'Orion Technologies', 18000.00, 'ACTIVE', '2025-07-01', '2028-06-30', NOW()),
  ('L2004', 'P1003', 'Harbour Foods', 12500.00, 'ACTIVE', '2026-02-01', '2029-01-31', NOW())
ON CONFLICT (id) DO NOTHING;
