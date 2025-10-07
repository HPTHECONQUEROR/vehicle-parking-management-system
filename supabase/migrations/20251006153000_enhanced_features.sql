-- Enhanced Vehicle Parking System - Database Updates

-- Add new fields to vehicles table
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS flat_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS purpose VARCHAR(100) DEFAULT 'visitor';

-- Update vehicle_logs to track additional information
ALTER TABLE public.vehicle_logs 
ADD COLUMN IF NOT EXISTS purpose VARCHAR(100),
ADD COLUMN IF NOT EXISTS flat_number VARCHAR(50);

-- Create index for faster queries on new fields
CREATE INDEX IF NOT EXISTS idx_vehicles_flat_number ON public.vehicles(flat_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_purpose ON public.vehicles(purpose);
CREATE INDEX IF NOT EXISTS idx_vehicle_logs_purpose ON public.vehicle_logs(purpose);
CREATE INDEX IF NOT EXISTS idx_vehicle_logs_flat_number ON public.vehicle_logs(flat_number);

-- Create purpose enum type
CREATE TYPE public.visit_purpose AS ENUM ('resident', 'visitor', 'delivery', 'service', 'maintenance', 'other');

-- Update purpose column to use enum
ALTER TABLE public.vehicles 
ALTER COLUMN purpose TYPE public.visit_purpose USING purpose::public.visit_purpose;

ALTER TABLE public.vehicle_logs 
ALTER COLUMN purpose TYPE public.visit_purpose USING purpose::public.visit_purpose;
