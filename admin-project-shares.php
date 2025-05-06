<?php
// Include database configuration and helper functions
require_once 'config.php';
require_once 'functions.php';

// Ensure user is logged in and is an admin
require_login();
require_admin();

// Check if project ID is provided
if (!isset($_GET['id'])) {
    header("Location: admin.php");
    exit();
}

$project_id = sanitize_input($conn, $_GET['id']);

// Get project details
$project = get_project($project_id);

// If project not found, redirect to admin dashboard
if (!$project) {
    header("Location: admin.php");
    exit();
}

// Get all users for sharing
$users = get_users();

// Get current shares for this project
$shares = get_project_shares($project_id);

// Handle adding new share
if (isset($_POST['add_share']) && isset($_POST['user_id'])) {
    $user_id = sanitize_input($conn, $_POST['user_id']);
    $shared_by = $_SESSION['user_id'];
    
    // Check if user exists
    $valid_user = false;
    foreach ($users as $user) {
        if ($user['id'] == $user_id) {
            $valid_user = true;
            break;
        }
    }
    
    if (!$valid_user) {
        $error_message = "Invalid user selected.";
    } else {
        // Share the project
        if (share_project($project_id, $user_id, $shared_by)) {
            $success_message = "Project shared successfully!";
            
            // Refresh shares list
            $shares = get_project_shares($project_id);
        } else {
            $error_message = "Failed to share project. It may already be shared with this user.";
        }
    }
}

// Handle removing share
if (isset($_POST['remove_share']) && isset($_POST['share_id'])) {
    $share_id = sanitize_input($conn, $_POST['share_id']);
    
    // Remove the share
    if (remove_project_share($share_id)) {
        $success_message = "Share removed successfully!";
        
        // Refresh shares list
        $shares = get_project_shares($project_id);
    } else {
        $error_message = "Failed to remove share.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Project Shares - LGC Architecture</title>
    <link rel="stylesheet" href="css/admin-style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        .project-info {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .project-info h3 {
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 24px;
        }
        
        .project-info .details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .project-info .detail-item {
            margin-bottom: 10px;
        }
        
        .project-info .detail-label {
            font-weight: 600;
            color: #666;
            margin-bottom: 5px;
            display: block;
        }
        
        .project-info .detail-value {
            font-size: 16px;
        }
        
        .shares-section {
            margin-top: 20px;
        }
        
        .sharing-form {
            background-color: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: var(--shadow);
        }
        
        .sharing-form .form-group {
            margin-bottom: 0;
        }
        
        .sharing-form .form-actions {
            margin-top: 0;
            margin-left: 15px;
        }
        
        .sharing-form-container {
            display: flex;
            align-items: flex-end;
        }
        
        .share-item {
            display: flex;
            align-items: center;
            background-color: white;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: var(--shadow);
            transition: var(--transition);
        }
        
        .share-item:hover {
            transform: translateY(-2px);
        }
        
        .user-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #f1f2f6;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-right: 15px;
        }
        
        .user-avatar span {
            font-size: 20px;
            font-weight: 700;
            color: var(--secondary-color);
        }
        
        .share-details {
            flex: 1;
        }
        
        .username {
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .share-info {
            font-size: 13px;
            color: #666;
            display: flex;
            gap: 15px;
        }
        
        .share-actions form {
            display: inline;
        }
        
        .no-shares {
            background-color: white;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            font-style: italic;
            color: #999;
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
                    <li><a href="admin-users.php"><i class="fas fa-users"></i> Manage Users</a></li>
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
                    <!-- No search needed on this page -->
                </div>
                <div class="user-profile">
                    <span><?php echo htmlspecialchars($_SESSION['username']); ?></span>
                </div>
            </header>

            <!-- Project Sharing Section -->
            <section class="project-management">
                <div class="section-header">
                    <h2>Manage Project Shares</h2>
                    <a href="admin.php" class="btn-secondary btn"><i class="fas fa-arrow-left"></i> Back to Dashboard</a>
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

                <!-- Project Information -->
                <div class="project-info">
                    <h3><?php echo htmlspecialchars($project['name']); ?></h3>
                    <div class="details">
                        <div class="detail-item">
                            <span class="detail-label">Category</span>
                            <span class="detail-value"><?php echo htmlspecialchars($project['category'] ?? 'N/A'); ?></span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status</span>
                            <span class="detail-value"><?php echo htmlspecialchars($project['status'] ?? 'In Progress'); ?></span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Created</span>
                            <span class="detail-value"><?php echo format_date($project['created_at']); ?></span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Visibility</span>
                            <span class="detail-value"><?php echo htmlspecialchars($project['visibility'] ?? 'Public'); ?></span>
                        </div>
                    </div>
                </div>

                <!-- Sharing Form -->
                <div class="sharing-form">
                    <h3>Share with User</h3>
                    <form action="admin-project-shares.php?id=<?php echo $project_id; ?>" method="POST">
                        <div class="sharing-form-container">
                            <div class="form-group">
                                <label for="user_id">Select User</label>
                                <select id="user_id" name="user_id" class="form-control" required>
                                    <option value="">Select a user to share with</option>
                                    <?php foreach ($users as $user): ?>
                                        <option value="<?php echo $user['id']; ?>"><?php echo htmlspecialchars($user['username']); ?> <?php echo $user['is_admin'] ? '(Admin)' : ''; ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="submit" name="add_share" class="btn btn-primary">Share Project</button>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Current Shares List -->
                <div class="shares-section">
                    <h3>Current Shares</h3>
                    
                    <?php if (count($shares) > 0): ?>
                        <?php foreach ($shares as $share): ?>
                            <div class="share-item">
                                <div class="user-avatar">
                                    <span><?php echo strtoupper(substr($share['user_username'], 0, 1)); ?></span>
                                </div>
                                <div class="share-details">
                                    <div class="username"><?php echo htmlspecialchars($share['user_username']); ?></div>
                                    <div class="share-info">
                                        <span><i class="fas fa-user-plus"></i> Shared by <?php echo htmlspecialchars($share['shared_by_username']); ?></span>
                                        <span><i class="fas fa-calendar-alt"></i> Shared on <?php echo format_date($share['shared_at']); ?></span>
                                    </div>
                                </div>
                                <div class="share-actions">
                                    <form action="admin-project-shares.php?id=<?php echo $project_id; ?>" method="POST" onsubmit="return confirm('Are you sure you want to remove this share?');">
                                        <input type="hidden" name="share_id" value="<?php echo $share['id']; ?>">
                                        <button type="submit" name="remove_share" class="btn-delete" title="Remove Share">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="no-shares">
                            <p>This project is not shared with any users yet.</p>
                        </div>
                    <?php endif; ?>
                </div>
            </section>
        </main>
    </div>

    <script src="js/admin.js"></script>
</body>
</html> 