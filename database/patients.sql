-- Create Patients Table
CREATE TABLE IF NOT EXISTS patient (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    age INT,
    medical_history TEXT,
    allergies TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Note: Patients register via Frontend, seeded data is optional.
