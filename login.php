<?php
include 'db_conct.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log function
function log_message($message) {
    error_log(date('[Y-m-d H:i:s] ') . $message . PHP_EOL, 3, 'login_errors.log');
}

// Start logging
log_message("Login request received: " . $_SERVER['REQUEST_METHOD']);

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON data from request
    $json = file_get_contents('php://input');
    log_message("Received data: " . $json);
    
    $data = json_decode($json, true);
    
    if (!$data) {
        log_message("Invalid JSON data");
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        exit;
    }
    
    // Extract login data
    $username = isset($data['username']) ? $data['username'] : null;
    $password = isset($data['password']) ? $data['password'] : null;
    
    log_message("Login attempt for username: $username");
    
    if (!$username || !$password) {
        log_message("Missing required fields");
        http_response_code(400);
        echo json_encode(['error' => 'Username and password are required']);
        exit;
    }
    
    try {
        // Check if the Users table exists
        $tableCheckResult = $conn->query("SHOW TABLES LIKE 'Users'");
        if ($tableCheckResult->num_rows == 0) {
            log_message("Users table doesn't exist - creating default admin user");
            
            // Create the Users table if it doesn't exist
            $createTable = "CREATE TABLE IF NOT EXISTS Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                is_admin TINYINT(1) DEFAULT 0,
                added_by_admin TINYINT(1) DEFAULT 0
            )";
            
            if (!$conn->query($createTable)) {
                throw new Exception("Failed to create Users table: " . $conn->error);
            }
            
            // Create default admin user
            $adminUsername = 'admin';
            $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
            $isAdmin = 1;
            
            $insertAdmin = $conn->prepare("INSERT INTO Users (username, password, is_admin) VALUES (?, ?, ?)");
            $insertAdmin->bind_param("ssi", $adminUsername, $adminPassword, $isAdmin);
            
            if (!$insertAdmin->execute()) {
                throw new Exception("Failed to create admin user: " . $insertAdmin->error);
            }
            
            $insertAdmin->close();
            log_message("Default admin user created");
        }
        
        // Prepare query to check credentials
        $stmt = $conn->prepare("SELECT id, username, password, is_admin FROM Users WHERE username = ?");
        
        if (!$stmt) {
            throw new Exception("Prepare statement error: " . $conn->error);
        }
        
        $stmt->bind_param("s", $username);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute error: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        log_message("Query executed, found rows: " . $result->num_rows);
        
        if ($user = $result->fetch_assoc()) {
            // For security logging, don't log the actual password
            log_message("User found: " . $user['username'] . ", Admin: " . $user['is_admin']);
            
            // Allow both hashed passwords and plain text passwords (for testing)
            $passwordMatches = password_verify($password, $user['password']) || $password === $user['password'];
            
            if ($passwordMatches) {
                // Set session data
                $_SESSION['currentUser'] = $user['username'];
                $_SESSION['userId'] = $user['id'];
                $_SESSION['isAdmin'] = (bool)$user['is_admin'];
                
                log_message("Login successful for user: " . $user['username']);
                
                // Return user data
                echo json_encode([
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'is_admin' => (bool)$user['is_admin']
                    ]
                ]);
            } else {
                // Invalid password
                log_message("Password mismatch for user: " . $user['username']);
                http_response_code(401);
                echo json_encode(['error' => 'Invalid username or password']);
            }
        } else {
            // Special case: Try to login with admin/admin123 if no user found and db is empty
            if ($username === 'admin' && $password === 'admin123') {
                log_message("Using default admin credentials");
                
                // Set session data for admin
                $_SESSION['currentUser'] = 'admin';
                $_SESSION['userId'] = 1;
                $_SESSION['isAdmin'] = true;
                
                // Return admin user data
                echo json_encode([
                    'user' => [
                        'id' => 1,
                        'username' => 'admin',
                        'is_admin' => true
                    ]
                ]);
                exit;
            }
            
            // User not found
            log_message("User not found: $username");
            http_response_code(401);
            echo json_encode(['error' => 'Invalid username or password']);
        }
        
        $stmt->close();
    } catch (Exception $e) {
        log_message("Exception: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
} else {
    log_message("Method not allowed: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

$conn->close();
?> 