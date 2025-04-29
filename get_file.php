<?php
include 'db_conct.php'; // Assuming this is the file with the database connection code

// Check if project_id is provided
if (isset($_GET['project_id'])) {
    $project_id = intval($_GET['project_id']);
    
    // Prepare and execute query
    $stmt = $conn->prepare("SELECT file, file_name, file_type, file_size FROM projects WHERE id = ?");
    $stmt->bind_param("i", $project_id);
    $stmt->execute();
    $stmt->store_result();
    
    if ($stmt->num_rows > 0) {
        $stmt->bind_result($fileContent, $fileName, $fileType, $fileSize);
        $stmt->fetch();
        
        // Set appropriate headers for file download
        header("Content-Type: $fileType");
        header("Content-Disposition: inline; filename=\"$fileName\"");
        header("Content-Length: $fileSize");
        header("Cache-Control: no-cache, must-revalidate");
        header("Pragma: no-cache");
        header("Expires: 0");
        
        // Output file content
        echo $fileContent;
    } else {
        // File not found
        http_response_code(404);
        echo "File not found";
    }
    
    $stmt->close();
} else {
    // No project_id provided
    http_response_code(400);
    echo "Missing project ID";
}

$conn->close();
?> 