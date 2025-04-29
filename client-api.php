<?php
include 'db_conct.php';

// Get the requested action
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Handle different actions
switch ($action) {
    case 'list_projects':
        // Get filter parameters
        $category = isset($_GET['category']) ? $_GET['category'] : null;
        $search = isset($_GET['search']) ? $_GET['search'] : null;
        
        // Build query
        $query = "SELECT id, name, category, status, is_featured, file_name, file_type, file_size, created_at, updated_at FROM projects WHERE 1=1";
        $params = [];
        $types = "";
        
        // Add filters
        if ($category && $category !== 'all') {
            $query .= " AND category = ?";
            $params[] = $category;
            $types .= "s";
        }
        
        if ($search) {
            $query .= " AND (name LIKE ? OR category LIKE ?)";
            $searchParam = "%" . $search . "%";
            $params[] = $searchParam;
            $params[] = $searchParam;
            $types .= "ss";
        }
        
        // Add order by
        $query .= " ORDER BY created_at DESC";
        
        // Prepare and execute statement
        $stmt = $conn->prepare($query);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        // Fetch all projects
        $projects = [];
        while ($row = $result->fetch_assoc()) {
            // Convert boolean values
            $row['is_featured'] = (bool)$row['is_featured'];
            $projects[] = $row;
        }
        
        // Return projects as JSON
        header('Content-Type: application/json');
        echo json_encode(['data' => $projects]);
        $stmt->close();
        break;
        
    case 'get_user_info':
        $username = isset($_GET['username']) ? $_GET['username'] : 
                   (isset($_SESSION['currentUser']) ? $_SESSION['currentUser'] : null);
        
        if (!$username) {
            http_response_code(400);
            echo json_encode(['error' => 'Username is required']);
            exit;
        }
        
        $stmt = $conn->prepare("SELECT id, username, is_admin FROM Users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            // Convert boolean values
            $row['is_admin'] = (bool)$row['is_admin'];
            
            // Return user data
            header('Content-Type: application/json');
            echo json_encode(['data' => $row]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
        }
        
        $stmt->close();
        break;
        
    case 'featured_projects':
        // Get featured projects
        $stmt = $conn->prepare("SELECT id, name, category, status, is_featured, file_name, file_type, file_size, created_at, updated_at FROM projects WHERE is_featured = 1 ORDER BY created_at DESC LIMIT 6");
        $stmt->execute();
        $result = $stmt->get_result();
        
        // Fetch featured projects
        $projects = [];
        while ($row = $result->fetch_assoc()) {
            // Convert boolean values
            $row['is_featured'] = (bool)$row['is_featured'];
            $projects[] = $row;
        }
        
        // Return projects as JSON
        header('Content-Type: application/json');
        echo json_encode(['data' => $projects]);
        $stmt->close();
        break;
        
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        break;
}

$conn->close();
?> 