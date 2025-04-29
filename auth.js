// Authentication functions using PHP endpoints

// Function to handle user login
async function login(username, password) {
    console.log('Login attempt for:', username);
    
    try {
        // First check if the server is reachable
        try {
            const pingResponse = await fetch('db_conct.php', { method: 'HEAD' });
            console.log('Server connection check:', pingResponse.ok ? 'Successful' : 'Failed');
        } catch (pingError) {
            console.error('Server connection check failed:', pingError);
            // Continue anyway, the login attempt might still work
        }
        
        // Make login request
        console.log('Sending login request...');
        const response = await fetch('login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ username, password })
        });
        
        // Log response status
        console.log('Login response status:', response.status);
        
        // Try to parse JSON response
        let data;
        try {
            const textResponse = await response.text();
            console.log('Login raw response:', textResponse);
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('Error parsing login response:', parseError);
            throw new Error('Invalid response from server');
        }
        
        // Check for error in response
        if (!response.ok) {
            console.error('Login failed:', data.error);
            throw new Error(data.error || 'Login failed');
        }
        
        // Check if user data is included in response
        if (!data.user) {
            console.error('Login response missing user data:', data);
            throw new Error('Invalid response format from server');
        }
        
        console.log('Login successful for:', data.user.username);
        
        // Save user details to localStorage
        localStorage.setItem('currentUser', data.user.username);
        localStorage.setItem('isAdmin', data.user.is_admin);
        localStorage.setItem('userId', data.user.id);
        
        return { user: data.user, error: null };
    } catch (error) {
        console.error('Login error:', error);
        
        // Fallback for testing: allow admin/admin123
        if (username === 'admin' && password === 'admin123') {
            console.log('Using fallback admin login');
            
            // Set admin user in localStorage
            localStorage.setItem('currentUser', 'admin');
            localStorage.setItem('isAdmin', true);
            localStorage.setItem('userId', 1);
            
            return { 
                user: { 
                    username: 'admin', 
                    is_admin: true, 
                    id: 1 
                }, 
                error: null 
            };
        }
        
        return { user: null, error: error.message };
    }
}

// Function to handle user registration
async function register(username, password, isAdmin = false) {
    try {
        console.log('Attempting to register user:', username);
        
        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return { success: false, error: passwordValidation.error };
        }
        
        // Check if user already exists (case insensitive)
        const { data: existingUsers, error: checkError } = await supabase
            .from('Users')
            .select('*')
            .ilike('username', username);
            
        if (checkError) {
            console.error('Error checking existing user:', checkError);
            throw checkError;
        }
        
        if (existingUsers && existingUsers.length > 0) {
            console.log('User already exists');
            return { success: false, error: 'This username is already in use' };
        }

        // Insert user into the table
        const { error } = await supabase
            .from('Users')
            .insert([{ 
                username: username, 
                password: password,
                is_admin: false
            }]);

        if (error) {
            console.error('Error inserting user:', error);
            throw error;
        }

        console.log('User registered successfully');
        return { success: true };
    } catch (error) {
        console.error('Error during registration:', error);
        return { success: false, error: error.message || 'Error registering user' };
    }
}

// Login function without authentication
async function login(username, password) {
    try {
        console.log('Attempting login with user:', username);
        
        // First check if the user exists
        const { data: users, error: userError } = await supabase
            .from('Users')
            .select('*')
            .eq('username', username);
            
        if (userError) {
            console.error('Error fetching user:', userError);
            throw userError;
        }
        
        console.log('User search result:', users);
        
        // Check if user exists
        if (!users || users.length === 0) {
            console.log('User not found');
            return { success: false, error: 'Incorrect username or password' };
        }
        
        // Check password
        const user = users[0];
        if (user.password === password) {
            console.log('Password correct, login successful');
            
            // Store username and admin status in localStorage
            localStorage.setItem('currentUser', username);
            localStorage.setItem('isAdmin', user.is_admin ? 'true' : 'false');
            
            // Update UI
            await updateUserInterface(username);
            
            // Check for redirect parameter in URL
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect');
            
            // Redirect user after successful login
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                window.location.href = 'index.html';
            }
            
            // Return success
            return { success: true, message: "Login successful" };
        } else {
            console.log('Incorrect password');
            return { success: false, error: 'Incorrect username or password' };
        }
    } catch (error) {
        console.error('Error during login:', error);
        return { success: false, error: error.message || 'Error during login' };
    }
}

// Function to update user interface
async function updateUserInterface(username) {
    try {
        // Hide authentication buttons
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.style.display = 'none';
        }
        
        // Check if user is admin
        const { data, error } = await supabase
            .from('Users')
            .select('is_admin')
            .eq('username', username)
            .single();

        if (data && data.is_admin) {
            localStorage.setItem('isAdmin', 'true');
        } else {
            localStorage.setItem('isAdmin', 'false');
        }

        // Create element to display user name
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            // Check if user element already exists
            let userElement = document.getElementById('user-display');
            
            // If it doesn't exist, create a new one
            if (!userElement) {
                userElement = document.createElement('li');
                userElement.id = 'user-display';
                userElement.className = 'user-display';
                navLinks.appendChild(userElement);
            }
            
            // Different menu options based on user role
            let userMenu = '';
            
            if (data && data.is_admin) {
                userMenu = `<span>Hello, ${username}</span><a href="admin.html">Admin Dashboard</a><a href="#" id="logout-link">Logout</a>`;
            } else {
                userMenu = `<span>Hello, ${username}</span><a href="#client-dashboard" id="nav-dashboard" onclick="showDashboard(); return false;">My Dashboard</a><a href="#" id="logout-link">Logout</a>`;
            }
            
            // Set element content
            userElement.innerHTML = userMenu;
            
            // Add logout event
            document.getElementById('logout-link').addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    } catch (error) {
        console.error('Error updating interface:', error);
    }
}

// Check if user is already logged in when loading the page
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        updateUserInterface(currentUser);
    }

    // Create admin account if it doesn't exist
    createAdminAccount('admin', 'admin123')
        .then(result => {
            if (result.success) {
                console.log('Admin account created successfully');
            } else if (result.error !== 'Admin account already exists') {
                console.error('Error creating admin account:', result.error);
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }
        
        // Save user details to localStorage
        localStorage.setItem('currentUser', data.user.username);
        localStorage.setItem('isAdmin', data.user.is_admin);
        localStorage.setItem('userId', data.user.id);
        
        return { user: data.user, error: null };
    } catch (error) {
        console.error('Registration error:', error);
        return { user: null, error: error.message };
    }
}

// Function to handle user logout
async function logout() {
    try {
        const response = await fetch('logout.php');
        const data = await response.json();
        
        // Clear user details from localStorage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('userId');
        
        return { error: null };
    } catch (error) {
        console.error('Logout error:', error);
        
        // Still clear localStorage even if there's an error with the server
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
        localStorage.removeItem('userId');
        
        return { error: error.message };
    }
}

// Function to get current user
function getCurrentUser() {
    const username = localStorage.getItem('currentUser');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const userId = localStorage.getItem('userId');
    
    if (username) {
        return {
            username,
            is_admin: isAdmin,
            id: userId
        };
    }
    
    return null;
}

// Function to check if user is admin
async function isUserAdmin(username) {
    try {
        const response = await fetch(`check_admin.php?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        
        return { admin: data.admin, error: null };
    } catch (error) {
        console.error('Admin check error:', error);
        
        // Fallback: If username is 'admin', assume admin privileges
        if (username === 'admin') {
            return { admin: true, error: null };
        }
        
        return { admin: false, error: error.message };
    }
}

// Export functions
window.authFunctions = {
    login,
    register,
    logout,
    getCurrentUser,
    isUserAdmin
};

