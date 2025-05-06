<?php
// Include database configuration and helper functions
require_once 'config.php';
require_once 'functions.php';

// Ensure user is logged in and is an admin
require_login();
require_admin();

// Get all users
$query = "SELECT * FROM users ORDER BY id";
$result = $conn->query($query);
$users = array();

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
}

// Handle user addition
if (isset($_POST['add_user'])) {
    $username = sanitize_input($conn, $_POST['username']);
    $password = $_POST['password'];
    $is_admin = isset($_POST['is_admin']) ? 1 : 0;
    
    // Check if username already exists
    $check_query = "SELECT id FROM users WHERE username = '$username'";
    $check_result = $conn->query($check_query);
    
    if ($check_result && $check_result->num_rows > 0) {
        $error_message = "Username already exists. Please choose a different username.";
    } else {
        // Hash the password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert new user
        $insert_query = "INSERT INTO users (username, password, is_admin, added_by_admin) 
                         VALUES ('$username', '$hashed_password', $is_admin, 1)";
        
        if ($conn->query($insert_query)) {
            $success_message = "User added successfully!";
            
            // Refresh the page to update the user list
            header("Location: admin-users.php");
            exit();
        } else {
            $error_message = "Failed to add user. Please try again. " . $conn->error;
        }
    }
}

// Handle user deletion
if (isset($_POST['delete_user']) && isset($_POST['user_id'])) {
    $user_id = sanitize_input($conn, $_POST['user_id']);
    
    // Don't allow deletion of own account
    if ($user_id == $_SESSION['user_id']) {
        $error_message = "You cannot delete your own account.";
    } else {
        // Delete the user
        $delete_query = "DELETE FROM users WHERE id = $user_id";
        
        if ($conn->query($delete_query)) {
            $success_message = "User deleted successfully!";
            
            // Refresh the page to update the user list
            header("Location: admin-users.php");
            exit();
        } else {
            $error_message = "Failed to delete user. Please try again.";
        }
    }
}

// Handle user update
if (isset($_POST['update_user']) && isset($_POST['user_id'])) {
    $user_id = sanitize_input($conn, $_POST['user_id']);
    $is_admin = isset($_POST['is_admin']) ? 1 : 0;
    $new_password = isset($_POST['new_password']) ? $_POST['new_password'] : '';
    
    // Don't allow removing admin privileges from own account
    if ($user_id == $_SESSION['user_id'] && $is_admin == 0) {
        $error_message = "You cannot remove admin privileges from your own account.";
    } else {
        // Start building the update query
        $update_query = "UPDATE users SET is_admin = $is_admin";
        
        // If a new password was provided, add it to the update query
        if (!empty($new_password)) {
            $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
            $update_query .= ", password = '$hashed_password'";
        }
        
        // Finish the query
        $update_query .= " WHERE id = $user_id";
        
        if ($conn->query($update_query)) {
            $success_message = "User updated successfully!";
            
            // Refresh the page to update the user list
            header("Location: admin-users.php");
            exit();
        } else {
            $error_message = "Failed to update user. Please try again.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Management - LGC Architecture</title>
    <link rel="stylesheet" href="css/admin-style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        .password-field {
            position: relative;
        }
        
        .password-toggle {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: #999;
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
        }
        
        .modal-content {
            background-color: white;
            width: 90%;
            max-width: 600px;
            margin: 50px auto;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .modal-header {
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h3 {
            margin: 0;
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .close {
            font-size: 24px;
            cursor: pointer;
        }
        
        .checkbox-label {
            display: flex;
            align-items: center;
            cursor: pointer;
        }
        
        .checkbox-label input[type="checkbox"] {
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
            <div class="logo">
                <h2>LGC.achi</h2>
                <p>Admin Panel</p>
            </div>
            <nav class="nav-menu">
                <ul>
                    <li><a href="admin.php"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
                    <li class="active"><a href="admin-users.php"><i class="fas fa-users"></i> Manage Users</a></li>
                    <li><a href="admin-add-project.php"><i class="fas fa-plus-circle"></i> Add Project</a></li>
                    <li><a href="index.php" target="_blank"><i class="fas fa-home"></i> View Site</a></li>
                    <li><a href="logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                </ul>
            </nav>
        </aside>

        <!-- Main Content Area -->
        <main class="main-content">
            <header class="top-header">
                <div class="search-container">
                    <form action="admin-users.php" method="GET">
                        <input type="text" name="search" placeholder="Search users..." value="<?php echo isset($_GET['search']) ? htmlspecialchars($_GET['search']) : ''; ?>">
                        <button type="submit"><i class="fas fa-search"></i></button>
                    </form>
                </div>
                <div class="user-profile">
                    <span><?php echo htmlspecialchars($_SESSION['username']); ?></span>
                </div>
            </header>

            <!-- User Management -->
            <section class="project-management">
                <div class="section-header">
                    <h2>User Management</h2>
                    <button class="btn-add" data-toggle="modal" data-target="add-user-modal"><i class="fas fa-plus"></i> Add User</button>
                </div>

                <?php if (isset($success_message)): ?>
                    <div class="alert success">
                        <?php echo $success_message; ?>
                    </div>
                <?php endif; ?>

                <?php if (isset($error_message)): ?>
                    <div class="alert error">
                        <?php echo $error_message; ?>
                    </div>
                <?php endif; ?>

                <!-- Users Table -->
                <div class="table-container">
                    <table class="projects-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Added By Admin</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (count($users) > 0): ?>
                                <?php foreach ($users as $user): ?>
                                    <tr>
                                        <td><?php echo $user['id']; ?></td>
                                        <td><?php echo htmlspecialchars($user['username']); ?></td>
                                        <td>
                                            <span class="user-role <?php echo $user['is_admin'] ? 'admin' : ''; ?>">
                                                <?php echo $user['is_admin'] ? 'Administrator' : 'Regular User'; ?>
                                            </span>
                                        </td>
                                        <td><?php echo $user['added_by_admin'] ? 'Yes' : 'No'; ?></td>
                                        <td class="actions">
                                            <button class="btn-edit" data-user-id="<?php echo $user['id']; ?>" data-username="<?php echo htmlspecialchars($user['username']); ?>" data-is-admin="<?php echo $user['is_admin']; ?>" title="Edit User">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <?php if ($user['id'] != $_SESSION['user_id']): ?>
                                                <form action="admin-users.php" method="POST" class="delete-form" onsubmit="return confirm('Are you sure you want to delete this user? This action cannot be undone.');">
                                                    <input type="hidden" name="user_id" value="<?php echo $user['id']; ?>">
                                                    <button type="submit" name="delete_user" class="btn-delete" title="Delete User">
                                                        <i class="fas fa-trash-alt"></i>
                                                    </button>
                                                </form>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="5" class="no-results">No users found.</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    </div>

    <!-- Add User Modal -->
    <div id="add-user-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New User</h3>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <form action="admin-users.php" method="POST">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <div class="password-field">
                            <input type="password" id="password" name="password" class="form-control" required>
                            <button type="button" class="password-toggle"><i class="fas fa-eye"></i></button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" name="is_admin"> Admin User
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                        <button type="submit" name="add_user" class="btn btn-primary">Add User</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Edit User Modal -->
    <div id="edit-user-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit User</h3>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <form action="admin-users.php" method="POST">
                    <input type="hidden" id="edit_user_id" name="user_id">
                    <div class="form-group">
                        <label for="edit_username">Username</label>
                        <input type="text" id="edit_username" class="form-control" readonly>
                    </div>
                    <div class="form-group">
                        <label for="edit_password">Password</label>
                        <div class="password-field">
                            <input type="password" id="edit_password" name="new_password" class="form-control" placeholder="••••••••  (Enter new password to change)">
                            <button type="button" class="password-toggle"><i class="fas fa-eye"></i></button>
                        </div>
                        <small class="form-text text-muted">Current password is encrypted. Enter a new one to change it.</small>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="edit_is_admin" name="is_admin"> Admin User
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                        <button type="submit" name="update_user" class="btn btn-primary">Update User</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="js/admin.js"></script>
    <script>
        // Edit user modal - Defined in global scope to be accessible from HTML onclick handlers
        function openEditModal(userId, username, isAdmin) {
            document.getElementById('edit_user_id').value = userId;
            document.getElementById('edit_username').value = username;
            document.getElementById('edit_is_admin').checked = isAdmin === 1;
            // Clear password field when opening modal
            document.getElementById('edit_password').value = '';
            document.getElementById('edit-user-modal').style.display = 'block';
        }

        // Wait for the DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', function() {
            // Modal functionality
            const modals = document.querySelectorAll('.modal');
            const modalTriggers = document.querySelectorAll('[data-toggle="modal"]');
            const modalClosers = document.querySelectorAll('.close, [data-dismiss="modal"]');
            
            // Open modal on trigger click (Add User button)
            modalTriggers.forEach(trigger => {
                trigger.addEventListener('click', function() {
                    const target = this.getAttribute('data-target');
                    document.getElementById(target).style.display = 'block';
                });
            });
            
            // Close modal on X or Cancel click
            modalClosers.forEach(closer => {
                closer.addEventListener('click', function() {
                    const modal = this.closest('.modal');
                    modal.style.display = 'none';
                });
            });
            
            // Close modal when clicking outside
            window.addEventListener('click', function(event) {
                modals.forEach(modal => {
                    if (event.target === modal) {
                        modal.style.display = 'none';
                    }
                });
            });

            // Add toggle functionality to password fields
            const passwordToggles = document.querySelectorAll('.password-toggle');
            passwordToggles.forEach(toggle => {
                toggle.addEventListener('click', function() {
                    const passwordField = this.parentElement.querySelector('input');
                    if (passwordField.type === 'password') {
                        passwordField.type = 'text';
                        this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                    } else {
                        passwordField.type = 'password';
                        this.innerHTML = '<i class="fas fa-eye"></i>';
                    }
                });
            });

            // Add direct event listeners to edit buttons
            const editButtons = document.querySelectorAll('.btn-edit');
            editButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const userId = this.getAttribute('data-user-id');
                    const username = this.getAttribute('data-username');
                    const isAdmin = this.getAttribute('data-is-admin') === '1';
                    openEditModal(userId, username, isAdmin);
                });
            });
        });
    </script>
</body>
</html> 