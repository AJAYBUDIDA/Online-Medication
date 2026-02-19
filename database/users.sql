-- Create Users Table if not exists
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'pharmacist', 'admin') NOT NULL
);

-- Insert Default Admin (Password: admin123)
-- Change password hash if using BCrypt in production
INSERT INTO users (name, email, password, role) 
VALUES ('System Admin', 'admin@medtracker.com', '$2a$10$D9t5t.5/7L.3.5.5.5.5.5.5.5.5.5.5', 'admin')
ON DUPLICATE KEY UPDATE email=email;
