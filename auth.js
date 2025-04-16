// Initialize Supabase client
const supabaseUrl = 'https://pwsgmskiamkpzgtlaikm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c2dtc2tpYW1rcHpndGxhaWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzM5NzIsImV4cCI6MjA1OTk0OTk3Mn0.oYGnYIpOUteNha2V1EoyhgxDA1XFfzxTjY8jAbSyLmI';

// Initialize Supabase correctly
let supabase;
try {
    // Check if window.supabase object already exists and is accessible
    if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log('Supabase client initialized via window.supabase');
    } else {
        // Try to access the client constructor in another way
        supabase = window.supabaseClient.createClient(supabaseUrl, supabaseKey);
        console.log('Supabase client initialized via window.supabaseClient');
    }
} catch (error) {
    console.error('Error initializing Supabase:', error);
    
    // If it fails, create a dummy client to avoid fatal errors on the page
    supabase = {
        auth: {
            onAuthStateChange: () => {},
            getUser: () => Promise.resolve({ data: { user: null }, error: null })
        },
        from: (table) => {
            return {
                select: () => {
                    console.error(`Error: Supabase client not properly initialized. Trying to access table ${table}`);
                    return {
                        eq: () => ({
                            eq: () => ({
                                then: (cb) => cb({ data: [], error: null })
                            }),
                            then: (cb) => cb({ data: [], error: null })
                        }),
                        single: () => ({
                            then: (cb) => cb({ data: null, error: null })
                        }),
                        then: (cb) => cb({ data: [], error: null })
                    };
                },
                insert: () => {
                    console.error(`Error: Supabase client not properly initialized. Trying to insert into table ${table}`);
                    return {
                        then: (cb) => cb({ error: new Error('Supabase client not properly initialized') })
                    };
                }
            };
        }
    };
}

// Auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        // Only redirect if we're not already on the home page
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
    }
});

// Register function
async function register(username, password) {
    try {
        console.log('Attempting to register user:', username);
        
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
                userMenu = `<span>Hello, ${username}</span> | <a href="admin.html">Admin Dashboard</a> | <a href="#" id="logout-link">Logout</a>`;
            } else {
                userMenu = `<span>Hello, ${username}</span> | <a href="#client-dashboard" id="nav-dashboard" onclick="showDashboard(); return false;">My Dashboard</a> | <a href="#" id="logout-link">Logout</a>`;
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
});

// Logout function
async function logout() {
    console.log('Starting logout...');
    // Remove user from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    console.log('User removed from localStorage.');
    
    // Update UI - This needs to be done before redirection
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.style.display = 'block';
        console.log('Authentication buttons displayed.');
    }
    
    const userElement = document.getElementById('user-display');
    if (userElement) {
        userElement.remove();
        console.log('User element removed.');
    }
    
    // Redirect to index page
    console.log('Redirecting to index page...');
    window.location.href = 'index.html';
}

// Check if user is admin
async function isAdmin() {
    try {
        const username = localStorage.getItem('currentUser');
        if (!username) return false;
        
        const { data, error } = await supabase
            .from('Users')
            .select('is_admin')
            .eq('username', username)
            .single();
            
        if (error) return false;
        return data?.is_admin || false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Create admin account
async function createAdminAccount(username, password) {
    try {
        // Check if admin already exists
        const { data: existingAdmin, error: checkError } = await supabase
            .from('Users')
            .select('*')
            .eq('is_admin', true);

        if (checkError) {
            console.error('Error checking existing admin:', checkError);
            throw checkError;
        }

        if (existingAdmin && existingAdmin.length > 0) {
            console.log('Admin account already exists');
            return { success: false, error: 'Admin account already exists' };
        }

        // Create admin user
        const { error } = await supabase
            .from('Users')
            .insert([
                { 
                    username: username,
                    password: password,
                    is_admin: true
                }
            ]);

        if (error) {
            console.error('Error creating admin:', error);
            throw error;
        }

        console.log('Admin account created successfully');
        return { success: true };
    } catch (error) {
        console.error('Error during admin creation:', error);
        return { success: false, error: error.message || 'Error creating admin' };
    }
}

