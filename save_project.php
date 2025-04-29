<?php
include 'db_conct.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log function
function log_message($message) {
    error_log(date('[Y-m-d H:i:s] ') . $message . PHP_EOL, 3, 'project_save.log');
}

// Function to generate UUID
function generate_uuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

// Start logging
log_message("Request received: " . $_SERVER['REQUEST_METHOD']);

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
    
    // Extract project data
    $projectId = isset($data['id']) ? $data['id'] : null;
    $name = isset($data['name']) ? $data['name'] : null;
    $category = isset($data['category']) ? $data['category'] : null;
    $status = isset($data['status']) ? $data['status'] : null;
    $isFeatured = isset($data['is_featured']) ? ($data['is_featured'] ? 1 : 0) : 0;
    $currentTime = date('Y-m-d H:i:s');
    
    log_message("Extracted data - ID: $projectId, Name: $name, Category: $category, Status: $status, Featured: $isFeatured");
    
    if (!$name || !$category) {
        log_message("Missing required fields: name or category");
        http_response_code(400);
        echo json_encode(['error' => 'Name and category are required']);
        exit;
    }
    
    if ($projectId) {
        // Update existing project
        log_message("Updating existing project: $projectId");
        
        $stmt = $conn->prepare("UPDATE projects SET name = ?, category = ?, status = ?, is_featured = ?, updated_at = ? WHERE id = ?");
        
        if (!$stmt) {
            log_message("Prepare error: " . $conn->error);
            http_response_code(500);
            echo json_encode(['error' => 'Database prepare error: ' . $conn->error]);
            exit;
        }
        
        $stmt->bind_param("sssiss", $name, $category, $status, $isFeatured, $currentTime, $projectId);
        
        if ($stmt->execute()) {
            log_message("Project updated successfully: $projectId");
            echo json_encode([
                'data' => [
                    'id' => $projectId,
                    'name' => $name,
                    'category' => $category,
                    'status' => $status,
                    'is_featured' => (bool)$isFeatured,
                    'updated_at' => $currentTime
                ]
            ]);
        } else {
            log_message("Update error: " . $stmt->error);
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $stmt->error]);
        }
    } else {
        // Create new project with UUID
        $uuid = generate_uuid();
        log_message("Creating new project with UUID: $uuid");
        
        $createdAt = $currentTime;
        $visibility = 'public'; // Default visibility
        
        $stmt = $conn->prepare("INSERT INTO projects (id, name, category, status, is_featured, created_at, updated_at, visibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        
        if (!$stmt) {
            log_message("Prepare error: " . $conn->error);
            http_response_code(500);
            echo json_encode(['error' => 'Database prepare error: ' . $conn->error]);
            exit;
        }
        
        $stmt->bind_param("ssssssss", $uuid, $name, $category, $status, $isFeatured, $createdAt, $currentTime, $visibility);
        
        if ($stmt->execute()) {
            log_message("New project created successfully: $uuid");
            echo json_encode([
                'data' => [
                    [
                        'id' => $uuid,
                        'name' => $name,
                        'category' => $category,
                        'status' => $status,
                        'is_featured' => (bool)$isFeatured,
                        'created_at' => $createdAt,
                        'updated_at' => $currentTime,
                        'visibility' => $visibility
                    ]
                ]
            ]);
        } else {
            log_message("Insert error: " . $stmt->error);
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $stmt->error]);
        }
    }
    
    $stmt->close();
} else {
    log_message("Method not allowed: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

$conn->close();
?> 