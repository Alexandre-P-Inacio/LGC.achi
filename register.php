<?php
// Start the session
session_start();

// Include database configuration
require_once 'config.php';

// Check if the user is already logged in
if (isset($_SESSION['username'])) {
    // Redirect all users to index.php regardless of admin status
    header("Location: index.php");
    exit;
}

$error_message = "";
$registration_success = false;

// Process registration form
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = sanitize_input($conn, $_POST['username']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirmPassword'];
    
    // Basic validation
    if (empty($username) || empty($password) || empty($confirm_password)) {
        $error_message = "Please fill in all fields";
    } else if ($password !== $confirm_password) {
        $error_message = "Passwords do not match";
    } else if (strlen($password) < 8) {
        $error_message = "Password must be at least 8 characters long";
    } else if (!preg_match('/[A-Z]/', $password)) {
        $error_message = "Password must contain at least one uppercase letter";
    } else if (!preg_match('/[a-z]/', $password)) {
        $error_message = "Password must contain at least one lowercase letter";
    } else if (!preg_match('/[0-9]/', $password)) {
        $error_message = "Password must contain at least one number";
    } else if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $password)) {
        $error_message = "Password must contain at least one special character";
    } else {
        // Check if username already exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $error_message = "Username already exists. Please choose a different username.";
        } else {
            // Hash the password
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            
            // Insert new user
            $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
            $stmt->bind_param("ss", $username, $hashed_password);
            
            if ($stmt->execute()) {
                $registration_success = true;
            } else {
                $error_message = "Error creating account: " . $conn->error;
            }
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
    <title>Register - Architecture Portfolio</title>
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
        
        .success-message {
            color: #27ae60;
            margin-top: 10px;
            margin-bottom: 15px;
            padding: 10px;
            background-color: rgba(39, 174, 96, 0.1);
            border-radius: 4px;
            text-align: center;
            display: <?php echo $registration_success ? 'block' : 'none'; ?>;
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
            <h2>Register</h2>
            <div id="error-message" class="error-message"><?php echo $error_message; ?></div>
            <?php if ($registration_success): ?>
            <div class="success-message">
                Registration successful! <a href="login.php">Click here to login</a> with your new account.
            </div>
            <?php else: ?>
            <form id="registerForm" class="auth-form" method="POST" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" required>
                </div>
                <div class="button-group">
                    <a href="index.php" class="back-button">Back</a>
                    <button type="submit" class="submit-button">Register</button>
                </div>
            </form>
            <?php endif; ?>
            <p class="auth-link">Already have an account? <a href="login.php">Login here</a></p>
        </div>
    </div>
</body>
</html> 