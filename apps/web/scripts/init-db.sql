-- Database initialization script for Xevon AI
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create additional databases for different environments if needed
-- CREATE DATABASE xevon_test;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE xevon_dev TO xevon_user;

-- Create schemas if needed (Prisma will handle table creation)
-- This is mainly for any custom functions or triggers we might need later

-- Example custom function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Log successful initialization
INSERT INTO pg_catalog.pg_settings (name, setting) 
VALUES ('xevon.initialized', 'true') 
ON CONFLICT (name) DO UPDATE SET setting = 'true';