<?php
// Include database configuration and helper functions
require_once 'config.php';
require_once 'functions.php';

// Ensure user is logged in
if (!is_logged_in()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

// Check if project ID is provided
if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Project ID is required']);
    exit();
}

$project_id = sanitize_input($conn, $_GET['id']);

// Get project details
$project = get_project($project_id);

// If project not found, return error
if (!$project) {
    http_response_code(404);
    echo json_encode(['error' => 'Project not found']);
    exit();
}

// Get file data
$file_data = $project['file'];
$file_type = null;

// If no file data, return error
if (empty($file_data)) {
    http_response_code(404);
    echo json_encode(['error' => 'No file available']);
    exit();
}

// Try to detect file type
if (isset($project['file_name'])) {
    $file_ext = strtolower(pathinfo($project['file_name'], PATHINFO_EXTENSION));
    
    switch ($file_ext) {
        case 'pdf':
            $file_type = 'pdf';
            break;
        case 'jpg':
        case 'jpeg':
            $file_type = 'jpeg';
            break;
        case 'png':
            $file_type = 'png';
            break;
        case 'gif':
            $file_type = 'gif';
            break;
        default:
            $file_type = 'unknown';
    }
} else {
    // First check for PDF signature in the first few bytes
    // PDF files start with "%PDF-" signature
    $pdf_signature = "%PDF-";
    
    if (strlen($file_data) > 5 && substr($file_data, 0, 5) === $pdf_signature) {
        $file_type = 'pdf';
    } else {
        // Use finfo as a secondary method
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime_type = $finfo->buffer($file_data);
        
        if (strpos($mime_type, 'pdf') !== false) {
            $file_type = 'pdf';
        } else if (strpos($mime_type, 'jpeg') !== false || strpos($mime_type, 'jpg') !== false) {
            $file_type = 'jpeg';
        } else if (strpos($mime_type, 'png') !== false) {
            $file_type = 'png';
        } else if (strpos($mime_type, 'gif') !== false) {
            $file_type = 'gif';
        } else {
            $file_type = 'unknown';
        }
    }
}

// Calculate file size
$file_size = format_file_size(strlen($file_data));

// Return the file data as JSON
header('Content-Type: application/json');
echo json_encode([
    'file' => base64_encode($file_data),
    'file_type' => $file_type,
    'file_name' => $project['file_name'] ?? 'file.' . $file_type,
    'file_size' => $file_size
]); 