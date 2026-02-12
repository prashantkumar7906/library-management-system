-- ==========================================
-- Library Management System - Complete Setup
-- Run this entire file in Railway MySQL Query
-- ==========================================

-- Drop existing tables (if any)
DROP TABLE IF EXISTS AUDIT_LOGS;
DROP TABLE IF EXISTS REQUESTS;
DROP TABLE IF EXISTS PAYMENTS;
DROP TABLE IF EXISTS ISSUED_BOOKS;
DROP TABLE IF EXISTS SUBSCRIPTIONS;
DROP TABLE IF EXISTS BOOKS;
DROP TABLE IF EXISTS USERS;
DROP TABLE IF EXISTS SYSTEM_SETTINGS;

-- ==========================================
-- CREATE TABLES
-- ==========================================

-- USERS Table
CREATE TABLE USERS (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    role ENUM('ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    password_hash VARCHAR(255) NOT NULL,
    batch ENUM('MORNING', 'EVENING') DEFAULT NULL,
    time_slot VARCHAR(50) DEFAULT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BOOKS Table
CREATE TABLE BOOKS (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    genre VARCHAR(50),
    publisher VARCHAR(100),
    publication_year YEAR,
    total_copies INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    description TEXT,
    cover_image_url VARCHAR(500),
    status ENUM('ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_author (author),
    INDEX idx_isbn (isbn),
    INDEX idx_genre (genre),
    INDEX idx_availability (available_copies),
    CONSTRAINT chk_copies CHECK (available_copies >= 0 AND available_copies <= total_copies)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SUBSCRIPTIONS Table
CREATE TABLE SUBSCRIPTIONS (
    sub_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    stacked_from INT DEFAULT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('ACTIVE', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (stacked_from) REFERENCES SUBSCRIPTIONS(sub_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ISSUED_BOOKS Table
CREATE TABLE ISSUED_BOOKS (
    issue_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE DEFAULT NULL,
    penalty_amount DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('ISSUED', 'RETURNED', 'OVERDUE') NOT NULL DEFAULT 'ISSUED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES BOOKS(book_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_book_id (book_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PAYMENTS Table
CREATE TABLE PAYMENTS (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('SUBSCRIPTION', 'PENALTY') NOT NULL,
    method ENUM('CASH', 'RAZORPAY') NOT NULL,
    razorpay_order_id VARCHAR(100) DEFAULT NULL,
    razorpay_payment_id VARCHAR(100) DEFAULT NULL,
    razorpay_signature VARCHAR(255) DEFAULT NULL,
    admin_processed_by INT DEFAULT NULL,
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_processed_by) REFERENCES USERS(user_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_method (method),
    INDEX idx_status (status),
    INDEX idx_razorpay_order (razorpay_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- REQUESTS Table
CREATE TABLE REQUESTS (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    type ENUM('BOOK_REQUEST', 'SUBSCRIPTION_EXTENSION', 'PENALTY_WAIVER', 'MEMBERSHIP_REGISTRATION', 'BATCH_CHANGE', 'OTHER') NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    details JSON DEFAULT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    admin_response TEXT DEFAULT NULL,
    admin_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES USERS(user_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AUDIT_LOGS Table
CREATE TABLE AUDIT_LOGS (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    performed_by INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES USERS(user_id) ON DELETE CASCADE,
    INDEX idx_performed_by (performed_by),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SYSTEM_SETTINGS Table
CREATE TABLE SYSTEM_SETTINGS (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- INSERT SEED DATA
-- ==========================================

-- Admin User (email: libadmin@library.com, password: admin123)
INSERT INTO USERS (full_name, email, phone, role, password_hash, batch, status) VALUES
('Library Admin', 'libadmin@library.com', '9876543210', 'ADMIN', '$2b$10$K9YX8qLFqZ9YJ5X8qLFqZ.YJ5X8qLFqZOYJ5X8qLFqZOYJ5X8qLFq', NULL, 'ACTIVE');

-- Sample Member (email: member@library.com, password: member123)
INSERT INTO USERS (full_name, email, phone, role, password_hash, batch, status) VALUES
('Rahul Sharma', 'member@library.com', '9876543211', 'MEMBER', '$2b$10$K9YX8qLFqZ9YJ5X8qLFqZ.YJ5X8qLFqZOYJ5X8qLFqZOYJ5X8qLFq', 'MORNING', 'ACTIVE');

-- Sample Books
INSERT INTO BOOKS (title, author, isbn, genre, publisher, publication_year, total_copies, available_copies, description) VALUES
('The Alchemist', 'Paulo Coelho', '9780062315007', 'Fiction', 'HarperOne', 1988, 5, 5, 'A magical tale about following your dreams'),
('Atomic Habits', 'James Clear', '9780735211292', 'Self-Help', 'Avery', 2018, 3, 3, 'An easy and proven way to build good habits'),
('The Lean Startup', 'Eric Ries', '9780307887894', 'Business', 'Crown Business', 2011, 4, 4, 'How constant innovation creates radically successful businesses'),
('Sapiens', 'Yuval Noah Harari', '9780062316097', 'History', 'Harper', 2015, 3, 3, 'A brief history of humankind'),
('Clean Code', 'Robert C. Martin', '9780132350884', 'Technology', 'Prentice Hall', 2008, 5, 5, 'A handbook of agile software craftsmanship'),
('The Psychology of Money', 'Morgan Housel', '9780857197689', 'Finance', 'Harriman House', 2020, 4, 4, 'Timeless lessons on wealth, greed, and happiness'),
('Educated', 'Tara Westover', '9780399590504', 'Biography', 'Random House', 2018, 3, 3, 'A memoir about education and self-invention'),
('1984', 'George Orwell', '9780451524935', 'Fiction', 'Signet Classic', 1949, 5, 5, 'A dystopian social science fiction novel');

-- ==========================================
-- DONE! Your database is ready.
-- ==========================================
