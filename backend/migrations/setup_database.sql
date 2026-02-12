-- Quick Database Setup Script
-- Run this in MySQL Workbench or MySQL Command Line Client

-- Create database
CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- Now run the migration files:
-- 1. File -> Open SQL Script -> Select 001_initial_schema.sql
-- 2. Execute the script
-- 3. File -> Open SQL Script -> Select 002_seed_data.sql  
-- 4. Execute the script

-- Verify tables were created
SHOW TABLES;

-- You should see these tables:
-- USERS, BOOKS, SUBSCRIPTIONS, ISSUED_BOOKS, PAYMENTS, REQUESTS, AUDIT_LOGS
