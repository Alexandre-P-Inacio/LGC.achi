<?php
// Database connection details for XAMPP
$servername = "localhost";
$username = "root";  // Default XAMPP username
$password = "";      // Default XAMPP password (empty)
$dbname = "lgc_db";  // Your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    // Log connection error
    error_log("Database connection failed: " . $conn->connect_error);
    
    // Return error response if accessed directly
    if (!defined('INCLUDED_FROM_OTHER_FILE')) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
        exit;
    }
    
    die("Connection failed: " . $conn->connect_error);
}

// If this file is accessed directly, return success status for connection check
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'success', 'message' => 'Database connected successfully']);
    exit;
}

// Set character set to UTF-8
$conn->set_charset("utf8mb4");

// Define max allowed packet size - important for BLOB uploads
ini_set('memory_limit', '256M'); // Increase PHP memory limit for handling large files
ini_set('post_max_size', '64M'); // Increase post max size
ini_set('upload_max_filesize', '64M'); // Increase upload max filesize

// Configure mysqli to handle larger packets for BLOBs
$conn->query("SET max_allowed_packet=67108864"); // 64MB in bytes

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', 'db_errors.log');

// Log function
function db_log($message) {
    error_log(date('[Y-m-d H:i:s] ') . $message . PHP_EOL, 3, 'db_errors.log');
}

// Criar diretório de uploads se não existir
if (!file_exists('uploads')) {
    mkdir('uploads', 0755, true);
}

// Iniciar sessão
session_start();
?> 