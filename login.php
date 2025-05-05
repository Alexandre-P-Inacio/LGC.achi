<?php
// Start the session
session_start();

// Include database configuration
require_once 'config.php';

// Check if the user is already logged in
if (isset($_SESSION['username'])) {
    // Redirect to appropriate page - all users go to index.php now
    header("Location: index.php");
    exit;
}

$error_message = "";

// Process login form
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = sanitize_input($conn, $_POST['username']);
    $password = $_POST['password']; // No need to sanitize password before verification
    
    // Basic validation
    if (empty($username) || empty($password)) {
        $error_message = "Please fill in all fields";
    } else {
        // Check user credentials
        $stmt = $conn->prepare("SELECT id, username, password, is_admin FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            
            // Verify password
            if (password_verify($password, $user['password'])) {
                // Password is correct, start a new session
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['is_admin'] = $user['is_admin'];
                
                // Check for redirect parameter
                $redirect = isset($_GET['redirect']) ? $_GET['redirect'] : null;
                
                // Redirect to appropriate page
                if ($redirect) {
                    header("Location: $redirect");
                } else {
                    // Always redirect to index.php, regardless of admin status
                    header("Location: index.php");
                }
                exit;
            } else {
                $error_message = "Incorrect username or password";
            }
        } else {
            $error_message = "Incorrect username or password";
        }
        
        $stmt->close();
    }
}

// Close the database connection
$conn->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Architecture Portfolio</title>
    <link rel="icon" type="image/png" href="assets/LGC LOGO.png">
    <link rel="stylesheet" href="styles.css">
    
    <style>
        .error-message {
            color: #e74c3c;
            margin-top: 10px;
            margin-bottom: 15px;
            padding: 10px;
            background-color: rgba(231, 76, 60, 0.1);
            border-radius: 4px;
            text-align: center;
            display: <?php echo !empty($error_message) ? 'block' : 'none'; ?>;
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
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="auth-box">
            <h2>Login</h2>
            <div id="error-message" class="error-message"><?php echo $error_message; ?></div>
            <?php
            // Display info message if redirect parameter exists
            if (isset($_GET['redirect'])) {
                echo '<div class="info-message" style="color: #3498db; margin-bottom: 15px; text-align: center;">
                    Please log in to access the client dashboard
                </div>';
            }
            ?>
            <form id="loginForm" class="auth-form" method="POST" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"] . (isset($_GET['redirect']) ? '?redirect=' . urlencode($_GET['redirect']) : '')); ?>">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <div class="button-group">
                    <a href="index.php" class="back-button">Back</a>
                    <button type="submit" class="submit-button">Login</button>
                </div>
            </form>
            <p class="auth-link">Don't have an account? <a href="register.php">Register here</a></p>
        </div>
    </div>
</body>
</html> 