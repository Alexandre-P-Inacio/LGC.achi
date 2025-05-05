<?php
// Database setup script
require_once 'config.php';

// Create users table
$users_table = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

// Create projects table
$projects_table = "CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    image_data LONGTEXT,
    file_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

// Create notifications table
$notifications_table = "CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_username VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_username) REFERENCES users(username) ON DELETE CASCADE
)";

// Execute the SQL queries to create tables
try {
    $conn->query($users_table);
    $conn->query($projects_table);
    $conn->query($notifications_table);
    
    echo "Database tables created successfully!";
    
    // Create a default admin user if it doesn't exist
    $check_admin = $conn->query("SELECT * FROM users WHERE username='admin'");
    
    if ($check_admin->num_rows == 0) {
        // Create default admin account (admin/admin123)
        $default_password = password_hash('admin123', PASSWORD_DEFAULT);
        $insert_admin = $conn->query("INSERT INTO users (username, password, is_admin) VALUES ('admin', '$default_password', true)");
        
        if ($insert_admin) {
            echo "<br>Default admin user created (username: admin, password: admin123)";
        }
    }
    
} catch (Exception $e) {
    echo "Error creating tables: " . $e->getMessage();
}

$conn->close();
?> 