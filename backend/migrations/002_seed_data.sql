-- Library Management System - Seed Data
-- Sample data for development and testing

-- Insert Admin User (password: admin123)
-- Hash generated using bcrypt with salt rounds 10
INSERT INTO USERS (full_name, email, phone, role, password_hash, batch, status) VALUES
('Admin User', 'admin@library.com', '9876543210', 'ADMIN', '$2b$10$rKZLvXZWJxKH5L.5YJ5YXO5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5Yq', NULL, 'ACTIVE');

-- Insert Sample Members (password: member123)
INSERT INTO USERS (full_name, email, phone, role, password_hash, batch, status) VALUES
('Rahul Sharma', 'rahul@example.com', '9876543211', 'MEMBER', '$2b$10$rKZLvXZWJxKH5L.5YJ5YXO5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5Yq', 'MORNING', 'ACTIVE'),
('Priya Patel', 'priya@example.com', '9876543212', 'MEMBER', '$2b$10$rKZLvXZWJxKH5L.5YJ5YXO5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5Yq', 'EVENING', 'ACTIVE'),
('Amit Kumar', 'amit@example.com', '9876543213', 'MEMBER', '$2b$10$rKZLvXZWJxKH5L.5YJ5YXO5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5Yq', 'MORNING', 'ACTIVE'),
('Sneha Reddy', 'sneha@example.com', '9876543214', 'MEMBER', '$2b$10$rKZLvXZWJxKH5L.5YJ5YXO5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5Yq', 'EVENING', 'ACTIVE');

-- Insert Sample Books
INSERT INTO BOOKS (title, author, isbn, genre, publisher, publication_year, total_copies, available_copies, description, cover_image_url) VALUES
('The Alchemist', 'Paulo Coelho', '9780062315007', 'Fiction', 'HarperOne', 1988, 5, 5, 'A magical tale about following your dreams', 'https://images.example.com/alchemist.jpg'),
('Atomic Habits', 'James Clear', '9780735211292', 'Self-Help', 'Avery', 2018, 3, 3, 'An easy and proven way to build good habits', 'https://images.example.com/atomic-habits.jpg'),
('The Lean Startup', 'Eric Ries', '9780307887894', 'Business', 'Crown Business', 2011, 4, 4, 'How constant innovation creates radically successful businesses', 'https://images.example.com/lean-startup.jpg'),
('Sapiens', 'Yuval Noah Harari', '9780062316097', 'History', 'Harper', 2015, 3, 3, 'A brief history of humankind', 'https://images.example.com/sapiens.jpg'),
('Clean Code', 'Robert C. Martin', '9780132350884', 'Technology', 'Prentice Hall', 2008, 5, 5, 'A handbook of agile software craftsmanship', 'https://images.example.com/clean-code.jpg'),
('The Psychology of Money', 'Morgan Housel', '9780857197689', 'Finance', 'Harriman House', 2020, 4, 4, 'Timeless lessons on wealth, greed, and happiness', 'https://images.example.com/psychology-money.jpg'),
('Educated', 'Tara Westover', '9780399590504', 'Biography', 'Random House', 2018, 3, 3, 'A memoir about education and self-invention', 'https://images.example.com/educated.jpg'),
('The 7 Habits of Highly Effective People', 'Stephen Covey', '9781982137274', 'Self-Help', 'Simon & Schuster', 1989, 5, 5, 'Powerful lessons in personal change', 'https://images.example.com/7-habits.jpg'),
('Thinking, Fast and Slow', 'Daniel Kahneman', '9780374533557', 'Psychology', 'Farrar, Straus and Giroux', 2011, 3, 3, 'The two systems that drive the way we think', 'https://images.example.com/thinking-fast-slow.jpg'),
('The Subtle Art of Not Giving a F*ck', 'Mark Manson', '9780062457714', 'Self-Help', 'HarperOne', 2016, 4, 4, 'A counterintuitive approach to living a good life', 'https://images.example.com/subtle-art.jpg'),
('1984', 'George Orwell', '9780451524935', 'Fiction', 'Signet Classic', 1949, 5, 5, 'A dystopian social science fiction novel', 'https://images.example.com/1984.jpg'),
('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'Fiction', 'Harper Perennial', 1960, 4, 4, 'A gripping tale of racial injustice and childhood innocence', 'https://images.example.com/mockingbird.jpg'),
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Fiction', 'Scribner', 1925, 3, 3, 'A portrait of the Jazz Age in all its decadence', 'https://images.example.com/gatsby.jpg'),
('Rich Dad Poor Dad', 'Robert Kiyosaki', '9781612680194', 'Finance', 'Plata Publishing', 1997, 5, 5, 'What the rich teach their kids about money', 'https://images.example.com/rich-dad.jpg'),
('The Power of Now', 'Eckhart Tolle', '9781577314806', 'Spirituality', 'New World Library', 1997, 3, 3, 'A guide to spiritual enlightenment', 'https://images.example.com/power-now.jpg');

-- Insert Sample Subscriptions
INSERT INTO SUBSCRIPTIONS (user_id, start_date, end_date, amount, status) VALUES
(2, '2026-01-01', '2026-03-31', 500.00, 'ACTIVE'),
(3, '2026-02-01', '2026-04-30', 500.00, 'ACTIVE'),
(4, '2025-12-01', '2026-02-28', 500.00, 'ACTIVE'),
(5, '2026-01-15', '2026-04-14', 500.00, 'ACTIVE');

-- Insert Sample Issued Books
INSERT INTO ISSUED_BOOKS (user_id, book_id, issue_date, due_date, status) VALUES
(2, 1, '2026-02-01', '2026-02-15', 'ISSUED'),
(2, 5, '2026-02-05', '2026-02-19', 'ISSUED'),
(3, 2, '2026-02-08', '2026-02-22', 'ISSUED'),
(4, 3, '2026-01-25', '2026-02-08', 'OVERDUE'),
(5, 6, '2026-02-10', '2026-02-24', 'ISSUED');

-- Update available copies for issued books
UPDATE BOOKS SET available_copies = available_copies - 1 WHERE book_id IN (1, 2, 3, 5, 6);

-- Insert Sample Payments
INSERT INTO PAYMENTS (user_id, amount, type, method, status, admin_processed_by) VALUES
(2, 500.00, 'SUBSCRIPTION', 'RAZORPAY', 'COMPLETED', NULL),
(3, 500.00, 'SUBSCRIPTION', 'CASH', 'COMPLETED', 1),
(4, 500.00, 'SUBSCRIPTION', 'RAZORPAY', 'COMPLETED', NULL),
(5, 500.00, 'SUBSCRIPTION', 'CASH', 'COMPLETED', 1);

-- Insert Sample Requests
INSERT INTO REQUESTS (user_id, type, subject, description, status) VALUES
(2, 'BOOK_REQUEST', 'Request for "The Midnight Library"', 'Please add "The Midnight Library" by Matt Haig to the collection.', 'PENDING'),
(3, 'SUBSCRIPTION_EXTENSION', 'Extend subscription by 1 month', 'I would like to extend my subscription for one more month.', 'PENDING'),
(4, 'PENALTY_WAIVER', 'Waive penalty for late return', 'I was sick and could not return the book on time. Please waive the penalty.', 'APPROVED');

-- Insert Sample Audit Logs
INSERT INTO AUDIT_LOGS (action, entity_type, entity_id, performed_by, ip_address, details) VALUES
('USER_LOGIN', 'USER', 1, 1, '192.168.1.1', '{"role": "ADMIN"}'),
('BOOK_ISSUED', 'ISSUED_BOOKS', 1, 2, '192.168.1.2', '{"book_id": 1, "user_id": 2}'),
('PAYMENT_COMPLETED', 'PAYMENT', 1, 2, '192.168.1.2', '{"amount": 500.00, "method": "RAZORPAY"}'),
('USER_LOGIN', 'USER', 2, 2, '192.168.1.2', '{"role": "MEMBER"}'),
('BOOK_ISSUED', 'ISSUED_BOOKS', 2, 2, '192.168.1.2', '{"book_id": 5, "user_id": 2}');
