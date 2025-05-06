<?php
// Start the session
session_start();

// Include database configuration
require_once 'config.php';
require_once 'functions.php';

// Get currently logged in user
$current_user = isset($_SESSION['username']) ? $_SESSION['username'] : null;
$is_admin = isset($_SESSION['is_admin']) ? $_SESSION['is_admin'] : false;

// Handle form submission
$message_sent = false;
$error_message = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $subject = isset($_POST['subject']) ? trim($_POST['subject']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    
    // Basic validation
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        $error_message = "All fields are required.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error_message = "Invalid email format.";
    } else {
        // Process the form (store in database or send email)
        $sql = "INSERT INTO contact_messages (name, email, subject, message, created_at) 
                VALUES (?, ?, ?, ?, NOW())";
        
        $stmt = $conn->prepare($sql);
        if ($stmt) {
            $stmt->bind_param("ssss", $name, $email, $subject, $message);
            if ($stmt->execute()) {
                $message_sent = true;
            } else {
                $error_message = "Error: " . $stmt->error;
            }
            $stmt->close();
        } else {
            $error_message = "Error: " . $conn->error;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://*.azureedge.net https://*.supabase.co https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data: https://*.googleapis.com https://*.gstatic.com; font-src 'self' https://cdnjs.cloudflare.com; connect-src 'self' https://*.supabase.co; frame-src https://www.google.com;">
    <title>Contact - Architecture Portfolio</title>
    <link rel="icon" type="image/png" href="assets/logo(2).png">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
    <script>
        window.supabase = supabase;
    </script>
    <script src="auth.js" defer></script>
    <script src="animation.js" defer></script>
</head>
<body>
    <header>
        <?php include_once 'navigation.php'; ?>
    </header>

    <main>
        <section id="contact-hero" class="contact-hero">
            <div class="hero-content">
                <h1>Contact Us</h1>
                <p>We are ready to transform your ideas into reality</p>
            </div>
        </section>

        <section id="contact-info" class="contact-info">
            <div class="container">
                <div class="contact-grid">
                    <div class="contact-card">
                        <div class="icon">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <h3>Address</h3>
                        <p>Corso Taranto 42/h</p>
                        <p>10154 Turin, Italy</p>
                    </div>
                    <div class="contact-card">
                        <div class="icon">
                            <i class="fas fa-phone"></i>
                        </div>
                        <h3>Phone</h3>
                        <p>+39 011 2768000</p>
                    </div>
                    <div class="contact-card">
                        <div class="icon">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <h3>Email</h3>
                        <p><a href="mailto:info@lgcingegneria.com">info@lgcingegneria.com</a></p>
                    </div>
                    <div class="contact-card">
                        <div class="icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <h3>Office Hours</h3>
                        <p>Monday - Friday: 9am to 6pm</p>
                        <p>Saturday - Sunday: Closed</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="contact-form-section" class="contact-form-section">
            <div class="container">
                <div class="form-map-grid">
                    <div class="form-container">
                        <h2>Send Us a Message</h2>
                        
                        <?php if ($message_sent): ?>
                            <div class="success-message">
                                <i class="fas fa-check-circle"></i>
                                <h3>Message Sent!</h3>
                                <p>Thank you for contacting us. We will get back to you soon.</p>
                            </div>
                        <?php else: ?>
                            <?php if (!empty($error_message)): ?>
                                <div class="error-message">
                                    <i class="fas fa-exclamation-circle"></i>
                                    <p><?php echo htmlspecialchars($error_message); ?></p>
                                </div>
                            <?php endif; ?>
                            
                            <form id="contactForm" class="contact-form" method="post" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>">
                                <div class="form-group">
                                    <label for="name">Name</label>
                                    <input type="text" id="name" name="name" required value="<?php echo isset($_POST['name']) ? htmlspecialchars($_POST['name']) : ''; ?>">
                                </div>
                                <div class="form-group">
                                    <label for="email">Email</label>
                                    <input type="email" id="email" name="email" required value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>">
                                </div>
                                <div class="form-group">
                                    <label for="subject">Subject</label>
                                    <input type="text" id="subject" name="subject" required value="<?php echo isset($_POST['subject']) ? htmlspecialchars($_POST['subject']) : ''; ?>">
                                </div>
                                <div class="form-group">
                                    <label for="message">Message</label>
                                    <textarea id="message" name="message" rows="5" required><?php echo isset($_POST['message']) ? htmlspecialchars($_POST['message']) : ''; ?></textarea>
                                </div>
                                <button type="submit" class="submit-button">Send Message</button>
                            </form>
                        <?php endif; ?>
                    </div>
                    <div class="map-container">
                        <h2>Our Location</h2>
                        <div class="map-toggle-container">
                            <div class="map-toggle">
                                <button id="mapViewBtn" class="active">Map View</button>
                                <button id="streetViewBtn">Street View</button>
                            </div>
                        </div>
                        <div class="map-wrapper">
                            <div id="mapView" class="map active">
                                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d197.57119694096312!2d7.700579806576014!3d45.100910165826136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47886df3fd671cfd%3A0x2f6815d8ab8a9edd!2sCorso%20Taranto%2C%2042%2FH%2C%2010154%20Torino%20TO!5e0!3m2!1spt-PT!2sit!4v1744620271833!5m2!1spt-PT!2sit" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                            </div>
                            <div id="streetView" class="map">
                                <iframe src="https://www.google.com/maps/embed?pb=!4v1744620356308!6m8!1m7!1saTwvakIueORHkqqDVn4TAw!2m2!1d45.10095629142182!2d7.700655777259868!3f213.34021775171985!4f-7.946984449003196!5f0.7820865974627469" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                            </div>
                        </div>
                        <div class="map-info">
                            <div class="map-address">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>Corso Taranto, 42, 10154 Turin, Italy</span>
                            </div>
                            <a href="https://www.google.com/maps/dir//Corso+Taranto,+42,+10154+Torino+TO,+Italia/@45.1009102,7.7005798,19z/data=!4m17!1m7!3m6!1s0x47886df3fd671cfd:0x2f6815d8ab8a9edd!2sCorso+Taranto,+42/H,+10154+Torino+TO!3b1!8m2!3d45.1009102!4d7.7005798!4m8!1m0!1m5!1m1!1s0x47886df3fd671cfd:0x2f6815d8ab8a9edd!2m2!1d7.7005798!2d45.1009102!3e0" target="_blank" class="directions-button">
                                <i class="fas fa-directions"></i> Get Directions
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="footer-content">
            <div class="social-links">
                <a href="https://www.instagram.com/lgcarchi/"><i class="fab fa-instagram"></i></a>
                <a href="https://www.facebook.com/profile.php?id=100094347141527"><i class="fab fa-facebook"></i></a>
                <a href="https://twitter.com/ingegneria_lgc"><i class="fab fa-twitter"></i></a>
            </div>
            <p>&copy; <?php echo date('Y'); ?> Architecture Portfolio. All rights reserved.</p>
        </div>
    </footer>

    <script>
        // Map view toggle functionality
        document.addEventListener('DOMContentLoaded', function() {
            const mapViewBtn = document.getElementById('mapViewBtn');
            const streetViewBtn = document.getElementById('streetViewBtn');
            const mapView = document.getElementById('mapView');
            const streetView = document.getElementById('streetView');
            
            mapViewBtn.addEventListener('click', function() {
                mapViewBtn.classList.add('active');
                streetViewBtn.classList.remove('active');
                mapView.classList.add('active');
                streetView.classList.remove('active');
            });
            
            streetViewBtn.addEventListener('click', function() {
                streetViewBtn.classList.add('active');
                mapViewBtn.classList.remove('active');
                streetView.classList.add('active');
                mapView.classList.remove('active');
            });
        });
    </script>
</body>
</html> 