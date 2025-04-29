<?php
include 'db_conct.php';

// Check if the user is authenticated and is an admin
session_start();

if (!isset($_SESSION['currentUser']) || !isset($_SESSION['isAdmin']) || !$_SESSION['isAdmin']) {
    header('Content-Type: application/json');
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized. You must be an admin to access this resource.']);
    exit;
}

// Get the requested action
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Handle different actions
switch ($action) {
    case 'list_projects':
        // Get all projects
        $stmt = $conn->prepare("SELECT id, name, category, status, is_featured, file_name, file_type, file_size, created_at, updated_at FROM projects ORDER BY created_at DESC");
        $stmt->execute();
        $result = $stmt->get_result();
        
        $projects = [];
        while ($row = $result->fetch_assoc()) {
            // Convert boolean values
            $row['is_featured'] = (bool)$row['is_featured'];
            $projects[] = $row;
        }
        
        header('Content-Type: application/json');
        echo json_encode(['data' => $projects]);
        $stmt->close();
        break;
        
    case 'delete_project':
        $projectId = isset($_GET['id']) ? intval($_GET['id']) : null;
        
        if (!$projectId) {
            http_response_code(400);
            echo json_encode(['error' => 'Project ID is required']);
            exit;
        }
        
        $stmt = $conn->prepare("DELETE FROM projects WHERE id = ?");
        $stmt->bind_param("i", $projectId);
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Project not found']);
            }
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $stmt->error]);
        }
        
        $stmt->close();
        break;
        
    case 'create_admin':
        // Get POST data
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        $username = isset($data['username']) ? $data['username'] : null;
        $password = isset($data['password']) ? $data['password'] : null;
        
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
        
        // Hash the password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $current_time = date('Y-m-d H:i:s');
        $is_admin = 1; // This is an admin account
        
        // Create the admin user
        $stmt = $conn->prepare("INSERT INTO Users (username, password, is_admin, created_at) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssis", $username, $hashed_password, $is_admin, $current_time);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $stmt->error]);
        }
        
        $stmt->close();
        break;
        
    case 'count_projects':
        // Count all projects
        $stmt = $conn->prepare("SELECT COUNT(*) as count FROM projects");
        $stmt->execute();
        $result = $stmt->get_result();
        $count = $result->fetch_assoc()['count'];
        
        header('Content-Type: application/json');
        echo json_encode(['count' => $count]);
        $stmt->close();
        break;
        
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        break;
}

$conn->close();
?> 