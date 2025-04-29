<?php
include 'db_conct.php';

// Check if project_id is provided
if (isset($_GET['id'])) {
    $project_id = intval($_GET['id']);
    
    // Prepare query to get project data (excluding file content to reduce response size)
    $stmt = $conn->prepare("SELECT id, name, category, status, is_featured, file_name, file_type, file_size, created_at, updated_at FROM projects WHERE id = ?");
    $stmt->bind_param("i", $project_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        // Convert boolean values from database
        $row['is_featured'] = (bool)$row['is_featured'];
        
        // Return project data as JSON
        header('Content-Type: application/json');
        echo json_encode(['data' => $row]);
    } else {
        // Project not found
        http_response_code(404);
        echo json_encode(['error' => 'Project not found']);
    }
    
    $stmt->close();
} else {
    // No project_id provided
    http_response_code(400);
    echo json_encode(['error' => 'Missing project ID']);
}

$conn->close();
?> 