// Initialize Supabase client
const supabaseUrl = 'https://pwsgmskiamkpzgtlaikm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c2dtc2tpYW1rcHpndGxhaWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzM5NzIsImV4cCI6MjA1OTk0OTk3Mn0.oYGnYIpOUteNha2V1EoyhgxDA1XFfzxTjY8jAbSyLmI'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

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
async function register(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Login function
async function login(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Logout function
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Error logging out:', error.message);
    }
}

// Check if user is admin
async function isAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
        
    if (error) return false;
    return data?.is_admin || false;
} 