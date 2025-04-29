<?php
include 'db_conct.php';

// Get query parameters for filtering
$category = isset($_GET['category']) ? $_GET['category'] : null;
$status = isset($_GET['status']) ? $_GET['status'] : null;
$is_featured = isset($_GET['is_featured']) ? (int)$_GET['is_featured'] : null;
$search = isset($_GET['search']) ? $_GET['search'] : null;

// Build the base query
$query = "SELECT id, name, category, status, is_featured, file_name, file_type, file_size, created_at, updated_at 
          FROM projects 
          WHERE 1=1";
$params = [];
$types = "";

// Add filters if provided
if ($category) {
    $query .= " AND category = ?";
    $params[] = $category;
    $types .= "s";
}

if ($status) {
    $query .= " AND status = ?";
    $params[] = $status;
    $types .= "s";
}

if ($is_featured !== null) {
    $query .= " AND is_featured = ?";
    $params[] = $is_featured;
    $types .= "i";
}

if ($search) {
    $query .= " AND (name LIKE ? OR category LIKE ? OR status LIKE ?)";
    $searchTerm = "%$search%";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $types .= "sss";
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
$conn->close();
?> 