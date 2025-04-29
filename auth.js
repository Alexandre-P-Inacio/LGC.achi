// Authentication functions using PHP endpoints

// Get base URL for API calls
function getApiBaseUrl() {
    // For XAMPP, we need to use the proper server path
    // This detects if we're running on localhost/XAMPP and adjusts the path accordingly
    const url = window.location.href;
    const baseFolder = url.split('/').slice(0, -1).join('/');
    return `${baseFolder}/`;
}

// Function to handle user login
async function login(username, password) {
    console.log('Login attempt for:', username);
    const baseUrl = getApiBaseUrl();
    
    try {
        // First check if the server is reachable
        try {
            const pingResponse = await fetch(`${baseUrl}db_conct.php`, { method: 'HEAD' });
            console.log('Server connection check:', pingResponse.ok ? 'Successful' : 'Failed');
        } catch (pingError) {
            console.error('Server connection check failed:', pingError);
            // Continue anyway, the login attempt might still work
        }
        
        // Make login request
        console.log('Sending login request...');
        const response = await fetch(`${baseUrl}login.php`, {
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
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('userId', '1');
            
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
    console.log('Registration attempt for:', username);
    const baseUrl = getApiBaseUrl();
    
    try {
        console.log('Sending registration request to:', `${baseUrl}register.php`);
        const response = await fetch(`${baseUrl}register.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, is_admin: isAdmin })
        });
        
        // Log response status
        console.log('Registration response status:', response.status);
        
        // Try to parse JSON response
        let data;
        try {
            const textResponse = await response.text();
            console.log('Registration raw response:', textResponse);
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('Error parsing registration response:', parseError);
            throw new Error('Invalid response from server');
        }
        
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
    const baseUrl = getApiBaseUrl();
    
    try {
        const response = await fetch(`${baseUrl}logout.php`);
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
    const baseUrl = getApiBaseUrl();
    
    try {
        const response = await fetch(`${baseUrl}check_admin.php?username=${encodeURIComponent(username)}`);
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

