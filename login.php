<?php
// Include database configuration
require_once 'config.php';
require_once 'functions.php';

// Start the session
session_start();

// Check if already logged in
if (isset($_SESSION['username'])) {
    // Redirect to appropriate page
    if (is_admin()) {
        header("Location: admin.php");
    } else {
        header("Location: index.php");
    }
    exit();
}

// Handle login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = sanitize_input($conn, $_POST['username']);
    $password = $_POST['password'];
    $error = null;
    
    // Validate input
    if (empty($username) || empty($password)) {
        $error = "Username and password are required.";
    } else {
        // Check if user exists
        $query = "SELECT * FROM users WHERE username = '$username'";
        $result = $conn->query($query);
        
        if ($result && $result->num_rows > 0) {
            $user = $result->fetch_assoc();
            
            // Verify password
            if (password_verify($password, $user['password'])) {
                // Set session variables
                $_SESSION['username'] = $user['username'];
                $_SESSION['user_id'] = $user['id'];
                
                // Redirect to appropriate page
                if ($user['is_admin'] == 1) {
                    header("Location: admin.php");
                } else {
                    header("Location: index.php");
                }
                exit();
            } else {
                $error = "Invalid username or password.";
            }
        } else {
            $error = "Invalid username or password.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - LGC Architecture</title>
    <link rel="stylesheet" href="css/admin-style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="login-logo">
                <h1>LGC.achi</h1>
                <p>Architecture Project Management</p>
            </div>
            
            <?php if (isset($error)): ?>
                <div class="alert error">
                    <?php echo $error; ?>
                </div>
            <?php endif; ?>
            
            <form class="login-form" method="POST" action="login.php">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" class="form-control" placeholder="Enter your username" value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="password-field">
                        <input type="password" id="password" name="password" required>
                        <button type="button" class="password-toggle"><i class="fas fa-eye"></i></button>
                    </div>
                </div>
                <div class="button-group">
                    <a href="index.php" class="back-button">Back</a>
                    <button type="submit" class="submit-button">Login</button>
                </div>
                
                <button type="submit" class="btn-login">Log In</button>
            </form>
            
            <div class="login-footer">
                <p>Don't have an account? Contact the administrator.</p>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const loginForm = document.getElementById('loginForm');
            const errorMessage = document.getElementById('error-message');
            
            // Check for redirect parameter and display a message
            <?php if (!empty($redirectUrl)): ?>
            const infoMessage = document.createElement('div');
            infoMessage.className = 'info-message';
            infoMessage.textContent = 'Please log in to access the client dashboard';
            infoMessage.style.color = '#3498db';
            infoMessage.style.marginBottom = '15px';
            infoMessage.style.textAlign = 'center';
            loginForm.insertBefore(infoMessage, loginForm.firstChild);
            <?php endif; ?>
            
            // Password toggle functionality
            const passwordToggle = document.querySelector('.password-toggle');
            if (passwordToggle) {
                passwordToggle.addEventListener('click', function() {
                    const passwordField = this.parentElement.querySelector('input');
                    if (passwordField.type === 'password') {
                        passwordField.type = 'text';
                        this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                    } else {
                        passwordField.type = 'password';
                        this.innerHTML = '<i class="fas fa-eye"></i>';
                    }
                });
            }
        });
    </script>
</body>
</html> 