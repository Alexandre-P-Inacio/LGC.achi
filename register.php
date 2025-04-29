<?php
include 'db_conct.php';

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON data from request
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        exit;
    }
    
    // Extract registration data
    $username = isset($data['username']) ? $data['username'] : null;
    $password = isset($data['password']) ? $data['password'] : null;
    $is_admin = isset($data['is_admin']) ? (bool)$data['is_admin'] : false;
    
    if (!$username || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password are required']);
        exit;
    }
    
    // Check if username already exists
    $check_stmt = $conn->prepare("SELECT id FROM Users WHERE username = ?");
    $check_stmt->bind_param("s", $username);
    $check_stmt->execute();
    $check_stmt->store_result();
    
    if ($check_stmt->num_rows > 0) {
        http_response_code(409); // Conflict
        echo json_encode(['error' => 'Username already exists']);
        $check_stmt->close();
        exit;
    }
    
    $check_stmt->close();
    
    // Hash the password for security
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $current_time = date('Y-m-d H:i:s');
    
    // Prepare statement to insert user
    $stmt = $conn->prepare("INSERT INTO Users (username, password, is_admin, created_at) VALUES (?, ?, ?, ?)");
    $is_admin_int = $is_admin ? 1 : 0;
    $stmt->bind_param("ssis", $username, $hashed_password, $is_admin_int, $current_time);
    
    if ($stmt->execute()) {
        $user_id = $stmt->insert_id;
        
        // Set session data for automatic login
        $_SESSION['currentUser'] = $username;
        $_SESSION['userId'] = $user_id;
        $_SESSION['isAdmin'] = $is_admin;
        
        // Return user data
        echo json_encode([
            'user' => [
                'id' => $user_id,
                'username' => $username,
                'is_admin' => $is_admin
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $stmt->error]);
    }
    
    $stmt->close();
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

$conn->close();
?> 