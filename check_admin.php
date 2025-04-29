<?php
include 'db_conct.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log function
function log_message($message) {
    error_log(date('[Y-m-d H:i:s] ') . $message . PHP_EOL, 3, 'admin_check.log');
}

// Start session to access username
session_start();

// Get username from session or request
$username = isset($_SESSION['currentUser']) ? $_SESSION['currentUser'] : 
           (isset($_GET['username']) ? $_GET['username'] : null);

log_message("Admin check for username: " . ($username ?: 'not provided'));

$response = ['admin' => false];

// Hardcoded check for admin user (fallback)
if ($username === 'admin') {
    log_message("Admin check - hardcoded admin user detected");
    $response = ['admin' => true];
} else if ($username) {
    try {
        // Ensure Users table exists
        $tableCheckResult = $conn->query("SHOW TABLES LIKE 'Users'");
        if ($tableCheckResult->num_rows == 0) {
            log_message("Users table doesn't exist");
            // Return false for admin check if table doesn't exist
            echo json_encode($response);
            exit;
        }
        
        // Prepare query to check if user is admin
        $stmt = $conn->prepare("SELECT is_admin FROM Users WHERE username = ?");
        
        if (!$stmt) {
            throw new Exception("Prepare statement error: " . $conn->error);
        }
        
        $stmt->bind_param("s", $username);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute error: " . $stmt->error);
        }
        
        $stmt->bind_result($is_admin);
        
        if ($stmt->fetch()) {
            $response = ['admin' => (bool)$is_admin];
            log_message("Admin check result for $username: " . (bool)$is_admin);
        } else {
            log_message("User not found: $username");
        }
        
        $stmt->close();
    } catch (Exception $e) {
        log_message("Exception: " . $e->getMessage());
        $response = ['admin' => false, 'error' => $e->getMessage()];
    }
} else {
    log_message("No username provided for admin check");
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

$conn->close();
?> 