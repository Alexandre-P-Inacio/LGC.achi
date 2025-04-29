<?php
include 'db_conct.php'; // Database connection

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log function to help debug
function logError($message) {
    error_log(date('[Y-m-d H:i:s] ') . $message . PHP_EOL, 3, 'file_upload_errors.log');
}

// Start with logging the request
logError("File upload request received: " . json_encode($_POST));
logError("Files data: " . json_encode($_FILES));

// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get project data
    $project_id = isset($_POST['project_id']) ? $_POST['project_id'] : null;
    $project_name = isset($_POST['project_name']) ? $_POST['project_name'] : null;
    
    logError("Project ID: " . $project_id . ", Project Name: " . $project_name);
    
    // Check if file is uploaded
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['file'];
        $fileName = $conn->real_escape_string($file['name']);
        $fileType = $conn->real_escape_string($file['type']);
        $fileSize = $file['size'];
        $fileTmpPath = $file['tmp_name'];
        
        logError("File details - Name: $fileName, Type: $fileType, Size: $fileSize");
        
        // Check file size against PHP limits
        $maxFileSize = ini_get('upload_max_filesize');
        logError("Max allowed file size: $maxFileSize");
        
        if ($fileSize > 0) {
            try {
                // Read file content
                $fileContent = file_get_contents($fileTmpPath);
                
                if ($fileContent === false) {
                    logError("Failed to read file content from: $fileTmpPath");
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to read file content']);
                    exit;
                }
                
                // Begin transaction
                $conn->begin_transaction();
                
                // Prepare statement based on whether we're updating or inserting
                if ($project_id) {
                    logError("Updating existing project $project_id with file");
                    
                    // Update existing project
                    $stmt = $conn->prepare("UPDATE projects SET file = ?, file_name = ?, file_type = ?, file_size = ? WHERE id = ?");
                    
                    if (!$stmt) {
                        logError("Prepare statement error: " . $conn->error);
                        throw new Exception("Prepare statement error: " . $conn->error);
                    }
                    
                    // Use 'b' for BLOB data
                    $null = NULL; // Required for binding BLOB
                    $stmt->bind_param("sssii", $null, $fileName, $fileType, $fileSize, $project_id);
                    
                    // Bind the BLOB separately
                    $stmt->send_long_data(0, $fileContent);
                } else {
                    logError("Inserting new project with file");
                    
                    // For new projects, make sure ID is a UUID
                    $project_id = uniqid('', true);
                    
                    // Insert new project with file
                    $stmt = $conn->prepare("INSERT INTO projects (id, name, file, file_name, file_type, file_size) VALUES (?, ?, ?, ?, ?, ?)");
                    
                    if (!$stmt) {
                        logError("Prepare statement error: " . $conn->error);
                        throw new Exception("Prepare statement error: " . $conn->error);
                    }
                    
                    $null = NULL; // Required for binding BLOB
                    $stmt->bind_param("ssbssi", $project_id, $project_name, $null, $fileName, $fileType, $fileSize);
                    
                    // Bind the BLOB separately
                    $stmt->send_long_data(2, $fileContent);
                }
                
                if ($stmt->execute()) {
                    // Commit transaction
                    $conn->commit();
                    
                    logError("File saved successfully for project ID: $project_id");
                    
                    // Return success response
                    echo json_encode([
                        'success' => true,
                        'message' => 'File uploaded successfully',
                        'project_id' => $project_id,
                        'file_name' => $fileName,
                        'file_size' => $fileSize
                    ]);
                } else {
                    // Rollback transaction
                    $conn->rollback();
                    
                    logError("Database error during execute: " . $stmt->error);
                    http_response_code(500);
                    echo json_encode(['error' => 'Database error: ' . $stmt->error]);
                }
                
                $stmt->close();
                
            } catch (Exception $e) {
                // Rollback transaction if active
                if ($conn->ping()) {
                    $conn->rollback();
                }
                
                logError("Exception occurred: " . $e->getMessage());
                http_response_code(500);
                echo json_encode(['error' => 'Database exception: ' . $e->getMessage()]);
            }
        } else {
            logError("File size is zero or negative");
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file size: ' . $fileSize]);
        }
    } else {
        // Handle error when no file is uploaded
        $error = isset($_FILES['file']) ? 'Error code: ' . $_FILES['file']['error'] : 'No file uploaded';
        logError("File upload error: " . $error);
        http_response_code(400);
        echo json_encode(['error' => 'File upload error: ' . $error]);
    }
} else {
    logError("Method not allowed: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

$conn->close();
?> 