<?php
// Include database configuration
require_once 'config.php';

// Session management - only start session if one is not already active
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
function is_logged_in() {
    return isset($_SESSION['username']);
}

// Check if the logged-in user is an admin
function is_admin() {
    global $conn;
    
    if (!is_logged_in()) {
        return false;
    }
    
    $username = sanitize_input($conn, $_SESSION['username']);
    $query = "SELECT is_admin FROM users WHERE username = '$username'";
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        $user = $result->fetch_assoc();
        return $user['is_admin'] == 1;
    }
    
    return false;
}

// Redirect if not logged in
function require_login() {
    if (!is_logged_in()) {
        header("Location: login.php");
        exit();
    }
}

// Redirect if not admin
function require_admin() {
    if (!is_logged_in()) {
        header("Location: login.php");
        exit();
    }
    
    if (!is_admin()) {
        header("Location: index.php");
        exit();
    }
}

// Get count of projects
function get_projects_count() {
    global $conn;
    
    $query = "SELECT COUNT(*) as total FROM projects";
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['total'];
    }
    
    return 0;
}

// Get count of completed projects
function get_completed_projects_count() {
    global $conn;
    
    $query = "SELECT COUNT(*) as total FROM projects WHERE status = 'completed' OR status = 'Completed'";
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['total'];
    }
    
    return 0;
}

// Get count of in-progress projects
function get_in_progress_projects_count() {
    global $conn;
    
    $query = "SELECT COUNT(*) as total FROM projects WHERE status = 'in_progress' OR status = 'In Progress' OR status IS NULL";
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['total'];
    }
    
    return 0;
}

// Get count of incomplete projects
function get_incomplete_projects_count() {
    global $conn;
    
    $query = "SELECT COUNT(*) as total FROM projects WHERE status = 'incompleted' OR status = 'Incompleted'";
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['total'];
    }
    
    return 0;
}

// Get projects with pagination
function get_projects($page = 1, $items_per_page = 10, $search = '', $status_filter = 'all') {
    global $conn;
    
    // Calculate offset
    $offset = ($page - 1) * $items_per_page;
    
    // Base query
    $query = "SELECT * FROM projects WHERE 1=1";
    
    // Add search condition if provided
    if (!empty($search)) {
        $search = sanitize_input($conn, $search);
        $query .= " AND name LIKE '%$search%'";
    }
    
    // Add status filter if not 'all'
    if ($status_filter !== 'all') {
        if ($status_filter === 'completed') {
            $query .= " AND (status = 'completed' OR status = 'Completed')";
        } elseif ($status_filter === 'in_progress') {
            $query .= " AND (status = 'in_progress' OR status = 'In Progress' OR status IS NULL)";
        } elseif ($status_filter === 'incompleted') {
            $query .= " AND (status = 'incompleted' OR status = 'Incompleted')";
        }
    }
    
    // Order by most recent first
    $query .= " ORDER BY created_at DESC";
    
    // Add pagination
    $query .= " LIMIT $items_per_page OFFSET $offset";
    
    // Execute query
    $result = $conn->query($query);
    $projects = array();
    
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $projects[] = $row;
        }
    }
    
    return $projects;
}

// Get total number of projects (for pagination)
function get_total_projects_count($search = '', $status_filter = 'all') {
    global $conn;
    
    // Base query
    $query = "SELECT COUNT(*) as total FROM projects WHERE 1=1";
    
    // Add search condition if provided
    if (!empty($search)) {
        $search = sanitize_input($conn, $search);
        $query .= " AND name LIKE '%$search%'";
    }
    
    // Add status filter if not 'all'
    if ($status_filter !== 'all') {
        if ($status_filter === 'completed') {
            $query .= " AND (status = 'completed' OR status = 'Completed')";
        } elseif ($status_filter === 'in_progress') {
            $query .= " AND (status = 'in_progress' OR status = 'In Progress' OR status IS NULL)";
        } elseif ($status_filter === 'incompleted') {
            $query .= " AND (status = 'incompleted' OR status = 'Incompleted')";
        }
    }
    
    // Execute query
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['total'];
    }
    
    return 0;
}

// Get a single project by ID
function get_project($id) {
    global $conn;
    
    $id = sanitize_input($conn, $id);
    $query = "SELECT * FROM projects WHERE id = '$id'";
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        return $result->fetch_assoc();
    }
    
    return null;
}

// Delete a project
function delete_project($id) {
    global $conn;
    
    $id = sanitize_input($conn, $id);
    
    // First delete any project shares
    $query = "DELETE FROM project_shares WHERE project_id = '$id'";
    $conn->query($query);
    
    // Then delete the project
    $query = "DELETE FROM projects WHERE id = '$id'";
    $result = $conn->query($query);
    
    return $result;
}

// Toggle featured status
function toggle_featured_status($id, $featured) {
    global $conn;
    
    $id = sanitize_input($conn, $id);
    $featured = $featured ? 1 : 0;
    
    $query = "UPDATE projects SET is_featured = $featured, updated_at = NOW() WHERE id = '$id'";
    $result = $conn->query($query);
    
    return $result;
}

// Get users for sharing
function get_users() {
    global $conn;
    
    $query = "SELECT id, username, is_admin FROM users ORDER BY username";
    $result = $conn->query($query);
    $users = array();
    
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
    }
    
    return $users;
}

// Get project shares
function get_project_shares($project_id) {
    global $conn;
    
    $project_id = sanitize_input($conn, $project_id);
    $query = "SELECT ps.id, ps.user_id, ps.shared_at, ps.shared_by, 
              u1.username as user_username, u2.username as shared_by_username 
              FROM project_shares ps 
              LEFT JOIN users u1 ON ps.user_id = u1.id
              LEFT JOIN users u2 ON ps.shared_by = u2.id
              WHERE ps.project_id = '$project_id'
              ORDER BY ps.shared_at DESC";
              
    $result = $conn->query($query);
    $shares = array();
    
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $shares[] = $row;
        }
    }
    
    return $shares;
}

// Share a project
function share_project($project_id, $user_id, $shared_by) {
    global $conn;
    
    $project_id = sanitize_input($conn, $project_id);
    $user_id = sanitize_input($conn, $user_id);
    $shared_by = sanitize_input($conn, $shared_by);
    
    // First check if the share already exists
    $query = "SELECT id FROM project_shares WHERE project_id = '$project_id' AND user_id = $user_id";
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        // Share already exists
        return false;
    }
    
    // Create the share
    $query = "INSERT INTO project_shares (project_id, user_id, shared_by, shared_at) 
              VALUES ('$project_id', $user_id, $shared_by, NOW())";
    $result = $conn->query($query);
    
    return $result;
}

// Remove a project share
function remove_project_share($share_id) {
    global $conn;
    
    $share_id = sanitize_input($conn, $share_id);
    $query = "DELETE FROM project_shares WHERE id = $share_id";
    $result = $conn->query($query);
    
    return $result;
}

// Generate a UUID for new projects
function generate_uuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

// Format file size
function format_file_size($bytes) {
    if ($bytes === 0) return '0 Bytes';
    $k = 1024;
    $sizes = ['Bytes', 'KB', 'MB', 'GB'];
    $i = floor(log($bytes) / log($k));
    return round($bytes / pow($k, $i), 1) . ' ' . $sizes[$i];
}

// Helper function to get file extension from name
function get_file_extension($filename) {
    return strtolower(pathinfo($filename, PATHINFO_EXTENSION));
}

// Helper function to format date
function format_date($date) {
    return date('M j, Y', strtotime($date));
}
?> 