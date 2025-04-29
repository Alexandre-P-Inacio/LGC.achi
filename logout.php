<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log function
function log_message($message) {
    error_log(date('[Y-m-d H:i:s] ') . $message . PHP_EOL, 3, 'logout.log');
}

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Log the logout request
$username = isset($_SESSION['currentUser']) ? $_SESSION['currentUser'] : 'unknown';
log_message("Logout request for user: $username");

// Clear all session variables
$_SESSION = array();

// If using session cookies, delete the session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Destroy the session
session_destroy();

// Send success response
header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
?> 