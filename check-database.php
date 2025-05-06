<?php
// Include database configuration
require_once 'config.php';

// Turn on error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Database Structure Check</h1>";

// Test database connection
echo "<h2>Database Connection Test</h2>";
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    echo "<p>Database connection successful</p>";
    
    // Output database and server info
    echo "<p>Server info: " . $conn->server_info . "</p>";
    echo "<p>Current database: " . ($conn->query("SELECT DATABASE()")->fetch_row()[0] ?? "None") . "</p>";
}

// Check if projects table exists
echo "<h2>Projects Table Check</h2>";
$table_exists = $conn->query("SHOW TABLES LIKE 'projects'");
if ($table_exists->num_rows > 0) {
    echo "<p>Projects table exists</p>";
    
    // Get table structure
    echo "<h3>Table Structure:</h3>";
    $columns = $conn->query("SHOW COLUMNS FROM projects");
    if ($columns) {
        echo "<table border='1'><tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
        while ($column = $columns->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($column['Field']) . "</td>";
            echo "<td>" . htmlspecialchars($column['Type']) . "</td>";
            echo "<td>" . htmlspecialchars($column['Null']) . "</td>";
            echo "<td>" . htmlspecialchars($column['Key']) . "</td>";
            echo "<td>" . htmlspecialchars($column['Default'] ?? "NULL") . "</td>";
            echo "<td>" . htmlspecialchars($column['Extra']) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>Error getting table structure: " . $conn->error . "</p>";
    }
    
    // Count rows in projects table
    $count = $conn->query("SELECT COUNT(*) as total FROM projects");
    if ($count) {
        $total = $count->fetch_assoc()['total'];
        echo "<p>Total projects in database: $total</p>";
        
        // Show sample project if available
        if ($total > 0) {
            echo "<h3>Sample Project Data</h3>";
            $sample = $conn->query("SELECT * FROM projects LIMIT 1");
            if ($sample && $sample->num_rows > 0) {
                $project = $sample->fetch_assoc();
                echo "<table border='1'>";
                foreach ($project as $key => $value) {
                    if ($key == 'file' || $key == 'image') {
                        echo "<tr><td>$key</td><td>" . ($value ? "[BINARY DATA]" : "NULL") . "</td></tr>";
                    } else {
                        echo "<tr><td>$key</td><td>" . htmlspecialchars($value ?? "NULL") . "</td></tr>";
                    }
                }
                echo "</table>";
            }
        }
    }
} else {
    echo "<p>Projects table does not exist</p>";
    
    // Show all tables
    echo "<h3>Available Tables:</h3>";
    $tables = $conn->query("SHOW TABLES");
    if ($tables && $tables->num_rows > 0) {
        echo "<ul>";
        while ($table = $tables->fetch_row()) {
            echo "<li>" . htmlspecialchars($table[0]) . "</li>";
        }
        echo "</ul>";
    } else {
        echo "<p>No tables found in database</p>";
    }
}

// Close database connection
$conn->close(); 