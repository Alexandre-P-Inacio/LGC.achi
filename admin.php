<?php
// Include database configuration and helper functions
require_once 'config.php';
require_once 'functions.php';

// Ensure user is logged in and is an admin
require_login();
require_admin();

// Get dashboard stats
$total_projects = get_projects_count();
$completed_projects = get_completed_projects_count();
$in_progress_projects = get_in_progress_projects_count();
$incomplete_projects = get_incomplete_projects_count();

// Handle pagination
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$items_per_page = isset($_GET['items_per_page']) ? intval($_GET['items_per_page']) : 10;

// Handle search
$search = isset($_GET['search']) ? $_GET['search'] : '';

// Handle status filter
$status_filter = isset($_GET['status']) ? $_GET['status'] : 'all';

// Get projects for the current page
$projects = get_projects($page, $items_per_page, $search, $status_filter);

// Get total projects count for pagination
$total_count = get_total_projects_count($search, $status_filter);
$total_pages = ceil($total_count / $items_per_page);

// Handle project deletion
if (isset($_POST['delete_project']) && isset($_POST['project_id'])) {
    $project_id = sanitize_input($conn, $_POST['project_id']);
    
    if (delete_project($project_id)) {
        $success_message = "Project deleted successfully!";
    } else {
        $error_message = "Failed to delete project. Please try again.";
    }
    
    // Refresh the page to update the project list
    header("Location: admin.php");
    exit();
}

// Handle toggling featured status
if (isset($_POST['toggle_featured']) && isset($_POST['project_id'])) {
    $project_id = sanitize_input($conn, $_POST['project_id']);
    $featured = isset($_POST['featured']) ? (int)$_POST['featured'] : 0;
    
    if (toggle_featured_status($project_id, $featured)) {
        $success_message = "Project featured status updated successfully!";
    } else {
        $error_message = "Failed to update featured status. Please try again.";
    }
    
    // Refresh the page to update the project list
    header("Location: admin.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - LGC Architecture</title>
    <link rel="stylesheet" href="css/admin-style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
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
                    <li class="active"><a href="admin.php"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
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
                    <form action="admin.php" method="GET">
                        <input type="text" name="search" placeholder="Search projects..." value="<?php echo htmlspecialchars($search); ?>">
                        <button type="submit"><i class="fas fa-search"></i></button>
                    </form>
                </div>
                <div class="user-profile">
                    <span><?php echo htmlspecialchars($_SESSION['username']); ?></span>
                </div>
            </header>

            <!-- Dashboard Statistics -->
            <section class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-icon blue">
                        <i class="fas fa-project-diagram"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Total Projects</h3>
                        <p><?php echo $total_projects; ?></p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Completed</h3>
                        <p><?php echo $completed_projects; ?></p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange">
                        <i class="fas fa-spinner"></i>
                    </div>
                    <div class="stat-info">
                        <h3>In Progress</h3>
                        <p><?php echo $in_progress_projects; ?></p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Incomplete</h3>
                        <p><?php echo $incomplete_projects; ?></p>
                    </div>
                </div>
            </section>

            <!-- Project Management -->
            <section class="project-management">
                <div class="section-header">
                    <h2>Project Management</h2>
                    <div class="actions">
                        <div class="filter-dropdown">
                            <form action="admin.php" method="GET" id="statusFilterForm">
                                <select name="status" id="statusFilter" onchange="document.getElementById('statusFilterForm').submit();">
                                    <option value="all" <?php echo $status_filter == 'all' ? 'selected' : ''; ?>>All Projects</option>
                                    <option value="completed" <?php echo $status_filter == 'completed' ? 'selected' : ''; ?>>Completed</option>
                                    <option value="in_progress" <?php echo $status_filter == 'in_progress' ? 'selected' : ''; ?>>In Progress</option>
                                    <option value="incompleted" <?php echo $status_filter == 'incompleted' ? 'selected' : ''; ?>>Incomplete</option>
                                </select>
                                <?php if(!empty($search)): ?>
                                    <input type="hidden" name="search" value="<?php echo htmlspecialchars($search); ?>">
                                <?php endif; ?>
                            </form>
                        </div>
                        <a href="admin-add-project.php" class="btn-add"><i class="fas fa-plus"></i> Add Project</a>
                    </div>
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

                <!-- Projects Table -->
                <div class="table-container">
                    <table class="projects-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Last Updated</th>
                                <th>Featured</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (count($projects) > 0): ?>
                                <?php foreach ($projects as $project): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($project['name']); ?></td>
                                        <td><?php echo htmlspecialchars($project['category'] ?? 'N/A'); ?></td>
                                        <td>
                                            <span class="status-badge <?php echo strtolower($project['status'] ?? 'in_progress'); ?>">
                                                <?php 
                                                    $status = $project['status'] ?? 'In Progress';
                                                    $icon = '';
                                                    
                                                    if (strtolower($status) == 'completed' || strtolower($status) == 'complete') {
                                                        $icon = '<i class="fas fa-check-circle"></i> ';
                                                    } elseif (strtolower($status) == 'in_progress' || strtolower($status) == 'in progress') {
                                                        $icon = '<i class="fas fa-spinner fa-spin"></i> ';
                                                    } elseif (strtolower($status) == 'incompleted' || strtolower($status) == 'incomplete') {
                                                        $icon = '<i class="fas fa-times-circle"></i> ';
                                                    }
                                                    
                                                    echo $icon . htmlspecialchars($status);
                                                ?>
                                            </span>
                                        </td>
                                        <td><?php echo format_date($project['created_at']); ?></td>
                                        <td><?php echo format_date($project['updated_at']); ?></td>
                                        <td>
                                            <form action="admin.php" method="POST">
                                                <input type="hidden" name="project_id" value="<?php echo $project['id']; ?>">
                                                <input type="hidden" name="featured" value="<?php echo $project['is_featured'] ? '0' : '1'; ?>">
                                                <button type="submit" name="toggle_featured" class="featured-toggle <?php echo $project['is_featured'] ? 'active' : ''; ?>">
                                                    <i class="fas fa-star"></i>
                                                </button>
                                            </form>
                                        </td>
                                        <td class="actions">
                                            <a href="admin-edit-project.php?id=<?php echo $project['id']; ?>" class="btn-edit" title="Edit Project">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <a href="view-file.php?id=<?php echo $project['id']; ?>" class="btn-view" title="View File">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="admin-project-shares.php?id=<?php echo $project['id']; ?>" class="btn-share" title="Manage Shares">
                                                <i class="fas fa-share-alt"></i>
                                            </a>
                                            <form action="admin.php" method="POST" class="delete-form" onsubmit="return confirm('Are you sure you want to delete this project?');">
                                                <input type="hidden" name="project_id" value="<?php echo $project['id']; ?>">
                                                <button type="submit" name="delete_project" class="btn-delete" title="Delete Project">
                                                    <i class="fas fa-trash-alt"></i>
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="7" class="no-results">No projects found.</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <?php if ($total_pages > 1): ?>
                    <div class="pagination">
                        <?php if ($page > 1): ?>
                            <a href="?page=1<?php echo !empty($search) ? '&search=' . urlencode($search) : ''; ?><?php echo $status_filter != 'all' ? '&status=' . urlencode($status_filter) : ''; ?>" class="page-link first">
                                <i class="fas fa-angle-double-left"></i>
                            </a>
                            <a href="?page=<?php echo $page - 1; ?><?php echo !empty($search) ? '&search=' . urlencode($search) : ''; ?><?php echo $status_filter != 'all' ? '&status=' . urlencode($status_filter) : ''; ?>" class="page-link prev">
                                <i class="fas fa-angle-left"></i>
                            </a>
                        <?php endif; ?>

                        <span class="page-info">Page <?php echo $page; ?> of <?php echo $total_pages; ?></span>

                        <?php if ($page < $total_pages): ?>
                            <a href="?page=<?php echo $page + 1; ?><?php echo !empty($search) ? '&search=' . urlencode($search) : ''; ?><?php echo $status_filter != 'all' ? '&status=' . urlencode($status_filter) : ''; ?>" class="page-link next">
                                <i class="fas fa-angle-right"></i>
                            </a>
                            <a href="?page=<?php echo $total_pages; ?><?php echo !empty($search) ? '&search=' . urlencode($search) : ''; ?><?php echo $status_filter != 'all' ? '&status=' . urlencode($status_filter) : ''; ?>" class="page-link last">
                                <i class="fas fa-angle-double-right"></i>
                            </a>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            </section>
        </main>
    </div>

    <script src="js/admin.js"></script>
</body>
</html> 