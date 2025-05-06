<?php
// Include database configuration
require_once 'config.php';
require_once 'functions.php';

// Start the session if not already active
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

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
                $_SESSION['is_admin'] = ($user['is_admin'] == 1); // Store admin status in session
                
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

// Check for redirect parameter
$redirectUrl = isset($_GET['redirect']) ? $_GET['redirect'] : '';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Architecture Portfolio</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        .error-message {
            color: #e74c3c;
            margin-top: 10px;
            margin-bottom: 15px;
            padding: 10px;
            background-color: rgba(231, 76, 60, 0.1);
            border-radius: 4px;
            text-align: center;
        }
        
        .button-group {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }
        
        .back-button {
            background-color: #7f8c8d;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
            text-decoration: none;
            display: inline-block;
            text-align: center;
        }
        
        .back-button:hover {
            background-color: #95a5a6;
        }
        
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
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="auth-box">
            <h2>Login</h2>
            <div id="error-message" class="error-message" style="<?php echo isset($error) ? 'display: block;' : 'display: none;'; ?>">
                <?php echo isset($error) ? $error : ''; ?>
            </div>
            <form id="loginForm" class="auth-form" method="POST" action="login.php<?php echo !empty($redirectUrl) ? '?redirect='.htmlspecialchars($redirectUrl) : ''; ?>">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>">
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
            </form>
            <p class="auth-link">Don't have an account? <a href="register.php">Register here</a></p>
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