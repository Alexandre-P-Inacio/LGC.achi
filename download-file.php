<?php
// Include database configuration and helper functions
require_once 'config.php';
require_once 'functions.php';

// Ensure user is logged in
if (!is_logged_in()) {
    header('Location: login.php');
    exit();
}

// Check if project ID is provided
if (!isset($_GET['id'])) {
    header('Location: portfolios.php');
    exit();
}

$project_id = sanitize_input($conn, $_GET['id']);

// Get project details
$project = get_project($project_id);

// If project not found, redirect back to portfolios page
if (!$project) {
    header('Location: portfolios.php');
    exit();
}

// Get file data
$file_data = $project['file'];

// If no file data, redirect back to portfolios page
if (empty($file_data)) {
    header('Location: portfolios.php');
    exit();
}

// Try to detect file type
$file_type = 'application/octet-stream'; // Default type
$file_ext = 'bin';

if (isset($project['file_name'])) {
    $file_ext = strtolower(pathinfo($project['file_name'], PATHINFO_EXTENSION));
    
    switch ($file_ext) {
        case 'pdf':
            $file_type = 'application/pdf';
            break;
        case 'jpg':
        case 'jpeg':
            $file_type = 'image/jpeg';
            break;
        case 'png':
            $file_type = 'image/png';
            break;
        case 'gif':
            $file_type = 'image/gif';
            break;
    }
} else {
    // First check for PDF signature in the first few bytes
    // PDF files start with "%PDF-" signature
    $pdf_signature = "%PDF-";
    
    if (strlen($file_data) > 5 && substr($file_data, 0, 5) === $pdf_signature) {
        $file_type = 'application/pdf';
        $file_ext = 'pdf';
    } else {
        // Use finfo as a secondary method
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime_type = $finfo->buffer($file_data);
        
        if (strpos($mime_type, 'pdf') !== false) {
            $file_type = 'application/pdf';
            $file_ext = 'pdf';
        } else if (strpos($mime_type, 'jpeg') !== false || strpos($mime_type, 'jpg') !== false) {
            $file_type = 'image/jpeg';
            $file_ext = 'jpg';
        } else if (strpos($mime_type, 'png') !== false) {
            $file_type = 'image/png';
            $file_ext = 'png';
        } else if (strpos($mime_type, 'gif') !== false) {
            $file_type = 'image/gif';
            $file_ext = 'gif';
        }
    }
}

// Prepare filename
$filename = isset($project['file_name']) ? $project['file_name'] : sanitize_input($conn, $project['name']) . '.' . $file_ext;

// Set headers for download
header('Content-Type: ' . $file_type);
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Length: ' . strlen($file_data));
header('Cache-Control: no-cache, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Output file data
echo $file_data;
exit(); 