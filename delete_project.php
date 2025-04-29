<?php
include 'db_conct.php';

// Check if request is POST or DELETE
if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Get project ID from request
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // For DELETE requests, parse the URL path
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $pathSegments = explode('/', $path);
        $projectId = end($pathSegments);
    } else {
        // For POST requests, get from POST data or query string
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        $projectId = isset($data['id']) ? intval($data['id']) : 
                   (isset($_POST['id']) ? intval($_POST['id']) : 
                   (isset($_GET['id']) ? intval($_GET['id']) : null));
    }
    
    if (!$projectId) {
        http_response_code(400);
        echo json_encode(['error' => 'Project ID is required']);
        exit;
    }
    
    // Delete the project
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
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

$conn->close();
?> 