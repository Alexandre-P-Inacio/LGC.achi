<?php
// Include database connection
require_once 'db_conct.php';

// Set headers to allow cross-origin requests and specify JSON content
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Get raw input data
$data = json_decode(file_get_contents("php://input"));

// Log the received data
error_log("Registration attempt: " . json_encode($data));

// Check if data is complete
if (!isset($data->username) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing username or password"]);
    exit;
}

// Sanitize input data
$username = mysqli_real_escape_string($conn, $data->username);
$password = password_hash($data->password, PASSWORD_DEFAULT); // Hash the password
$isAdmin = isset($data->is_admin) && $data->is_admin ? 1 : 0;

// Check if username already exists
$checkQuery = "SELECT id FROM users WHERE username = ?";
$stmt = $conn->prepare($checkQuery);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    http_response_code(409); // Conflict
    echo json_encode(["error" => "Username already exists"]);
    $stmt->close();
    exit;
}
$stmt->close();

// Prepare SQL query for user insertion
$query = "INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)";
$stmt = $conn->prepare($query);
$stmt->bind_param("ssi", $username, $password, $isAdmin);

// Execute query
if ($stmt->execute()) {
    $userId = $stmt->insert_id;
    $stmt->close();
    
    // Return success response
    http_response_code(201); // Created
    echo json_encode([
        "message" => "User registered successfully",
        "user" => [
            "id" => $userId,
            "username" => $username,
            "is_admin" => (bool)$isAdmin
        ]
    ]);
} else {
    // Return error response
    http_response_code(500);
    echo json_encode([
        "error" => "Registration failed: " . $stmt->error
    ]);
    error_log("Registration error: " . $stmt->error);
    $stmt->close();
}

// Close database connection
$conn->close();
?> 