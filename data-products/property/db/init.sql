CREATE TABLE IF NOT EXISTS properties (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL,
  occupancy_rate NUMERIC(5,2) NOT NULL CHECK (occupancy_rate BETWEEN 0 AND 100),
  revenue NUMERIC(14,2) NOT NULL CHECK (revenue >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO properties (id, name, type, occupancy_rate, revenue, updated_at)
VALUES
  ('P1001', 'Marina Residence', 'Residential', 96.50, 1250000.00, NOW()),
  ('P1002', 'Central Business Tower', 'Commercial', 91.20, 2840000.00, NOW()),
  ('P1003', 'Harbour Retail Centre', 'Retail', 88.40, 1980000.00, NOW())
ON CONFLICT (id) DO NOTHING;