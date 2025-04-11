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
async function register(username, password) {
    try {
        // Inserir o usuário na tabela sem autenticação
        const { error } = await supabase
            .from('Users') // Certifique-se de que o nome da tabela está correto
            .insert([{ username: username, password: password }]); // Armazene a senha de forma segura!

        if (error) throw error;

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Função para login sem autenticação
async function login() {
    // Lógica para permitir acesso sem autenticação
    const result = { success: true, message: "Login bem-sucedido sem autenticação." };

    // Exibir pop-up de sucesso
    if (result.success) {
        alert(result.message);
    }

    return result;
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
        .from('Users')
        .select('is_admin')
        .eq('id', user.id)
        .single();
        
    if (error) return false;
    return data?.is_admin || false;
}

// Função para criar um novo usuário
async function createUser(email, password) {
    // Lógica para inserir um novo usuário na tabela
    const query = 'INSERT INTO users (email, password) VALUES ($1, $2)';
    await db.query(query, [email, password]);
}

// Função para autenticar um usuário sem e-mail
async function authenticate(username, password) {
    try {
        // Lógica para autenticar um usuário
        const { data, error } = await supabase
            .from('Users')
            .select('*')
            .eq('username', username)
            .eq('password', password); // Armazene a senha de forma segura!

        if (error) throw error;

        return data.length > 0; // Retorna true se o usuário existir
    } catch (error) {
        return { success: false, error: error.message };
    }
}

