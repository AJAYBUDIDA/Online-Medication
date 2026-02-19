-- Create Pharmacists Table
CREATE TABLE IF NOT EXISTS pharmacist (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    pharmacy_name VARCHAR(255),
    license_number VARCHAR(255),
    gst_number VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Note: Pharmacists register via Frontend.
