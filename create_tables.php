<?php
include 'db_conct.php';

// SQL to create the projects table if it doesn't exist
$sql = "CREATE TABLE IF NOT EXISTS projects (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NULL,
    status VARCHAR(100) NULL,
    is_featured TINYINT(1) DEFAULT 0,
    file LONGBLOB NULL,
    file_name VARCHAR(255) NULL,
    file_type VARCHAR(255) NULL,
    file_size INT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL
)";

if ($conn->query($sql) === TRUE) {
    echo "Table 'projects' created or already exists.";
} else {
    echo "Error creating table: " . $conn->error;
}

// SQL to create the Users table if it doesn't exist
$sql = "CREATE TABLE IF NOT EXISTS Users (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin TINYINT(1) DEFAULT 0,
    created_at DATETIME NULL
)";

if ($conn->query($sql) === TRUE) {
    echo "Table 'Users' created or already exists.";
} else {
    echo "Error creating table: " . $conn->error;
}

$conn->close();
echo "Tables check completed.";
?> 