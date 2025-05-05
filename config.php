<?php
// Database connection configuration
$host = 'localhost';         // Database host (usually localhost for XAMPP)
$dbname = 'lgcarchdatabase';  // Database name (as shown in the screenshot)
$username = 'root';          // Default XAMPP username
$password = '';              // Default XAMPP password (empty)
$port = 3306;                // Default MySQL port

// Create database connection
try {
    $conn = new mysqli($host, $username, $password, $dbname, $port);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Set character set
    $conn->set_charset("utf8mb4");
} catch (Exception $e) {
    // Log error (in production, you would log this to a file)
    error_log("Database connection error: " . $e->getMessage());
    
    // For development, you might want to see the error
    // Comment this out in production
    die("Database connection failed: " . $e->getMessage());
}

// Function to sanitize user input to prevent SQL injection
function sanitize_input($conn, $data) {
    return $conn->real_escape_string(trim($data));
}
?> 