<?php
// Make sure there is no output before our JSON
error_reporting(E_ERROR);
ini_set('display_errors', 0);

// Start the session
session_start();

// Include database configuration
require_once 'config.php';
require_once 'functions.php';

// Set content type to JSON
header('Content-Type: application/json');

// Handle CORS if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Initialize projects array
$projects = [];

try {
    // Check if the database connection is successful
    if (!$conn || $conn->connect_error) {
        throw new Exception("Database connection failed: " . ($conn ? $conn->connect_error : "Connection not established"));
    }
    
    // Get category filter from query string
    $category = isset($_GET['category']) ? sanitize_input($conn, $_GET['category']) : 'all';
    
    // Verify the projects table exists
    $table_check = $conn->query("SHOW TABLES LIKE 'projects'");
    if (!$table_check || $table_check->num_rows === 0) {
        throw new Exception("Projects table does not exist in the database");
    }
    
    // Simple query to avoid prepared statement complexity
    if ($category != 'all') {
        $category = $conn->real_escape_string($category);
        $query = "SELECT * FROM projects WHERE category = '$category' ORDER BY created_at DESC";
    } else {
        $query = "SELECT * FROM projects ORDER BY created_at DESC";
    }
    
    // Execute query
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    // Fetch all projects
    while ($row = $result->fetch_assoc()) {
        // Create a clean project object with only the essential fields
        $project = [
            'id' => $row['id'] ?? null,
            'name' => $row['name'] ?? 'Untitled Project',
            'category' => $row['category'] ?? '',
            'has_file' => false
        ];
        
        // Add optional fields if they exist
        if (isset($row['description'])) $project['description'] = $row['description'];
        if (isset($row['status'])) $project['status'] = $row['status'];
        if (isset($row['created_at'])) $project['created_at'] = $row['created_at'];
        
        // Check if there's a file
        if (isset($row['file']) && $row['file'] !== null && strlen($row['file']) > 0) {
            $project['has_file'] = true;
        }
        
        // Process image data if it exists
        if (isset($row['image']) && $row['image'] !== null) {
            // Handle binary image data
            if (is_string($row['image']) && strlen($row['image']) > 0) {
                $project['image_data'] = base64_encode($row['image']);
            }
        }
        
        // Add to projects array
        $projects[] = $project;
    }
    
} catch (Exception $e) {
    // Log error to server log
    error_log("Error in fetch-projects.php: " . $e->getMessage());
    
    // Return error as JSON
    echo json_encode(['error' => $e->getMessage()]);
    exit();
}

// Return projects as valid JSON
echo json_encode($projects, JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_INVALID_UTF8_SUBSTITUTE); 