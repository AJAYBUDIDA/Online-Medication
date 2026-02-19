-- Create Doctors Table
CREATE TABLE IF NOT EXISTS doctor (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    specialization VARCHAR(255),
    license_number VARCHAR(255),
    hospital_name VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Note: Doctors register via Frontend.
