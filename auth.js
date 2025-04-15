// Initialize Supabase client
const supabaseUrl = 'https://pwsgmskiamkpzgtlaikm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c2dtc2tpYW1rcHpndGxhaWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzM5NzIsImV4cCI6MjA1OTk0OTk3Mn0.oYGnYIpOUteNha2V1EoyhgxDA1XFfzxTjY8jAbSyLmI';

// Inicializar Supabase corretamente
let supabase;
try {
    // Verifica se o objeto window.supabase já existe e é acessível
    if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log('Cliente Supabase inicializado via window.supabase');
    } else {
        // Tenta acessar o construtor do cliente de outra forma
        supabase = window.supabaseClient.createClient(supabaseUrl, supabaseKey);
        console.log('Cliente Supabase inicializado via window.supabaseClient');
    }
} catch (error) {
    console.error('Erro ao inicializar Supabase:', error);
    
    // Se falhar, cria um cliente fictício para evitar erros fatais na página
    supabase = {
        auth: {
            onAuthStateChange: () => {},
            getUser: () => Promise.resolve({ data: { user: null }, error: null })
        },
        from: (table) => {
            return {
                select: () => {
                    console.error(`Erro: Cliente Supabase não inicializado corretamente. Tentando acessar tabela ${table}`);
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
                    console.error(`Erro: Cliente Supabase não inicializado corretamente. Tentando inserir na tabela ${table}`);
                    return {
                        then: (cb) => cb({ error: new Error('Cliente Supabase não inicializado corretamente') })
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
        console.log('Tentando registrar usuário:', username);
        
        // Verificar se o usuário já existe
        const { data: existingUsers, error: checkError } = await supabase
            .from('Users')
            .select('*')
            .eq('username', username);
            
        if (checkError) {
            console.error('Erro ao verificar usuário existente:', checkError);
            throw checkError;
        }
        
        if (existingUsers && existingUsers.length > 0) {
            console.log('Usuário já existe');
            return { success: false, error: 'Este nome de usuário já está em uso' };
        }

        // Inserir o usuário na tabela
        const { error } = await supabase
            .from('Users')
            .insert([{ 
                username: username, 
                password: password,
                is_admin: false
            }]);

        if (error) {
            console.error('Erro ao inserir usuário:', error);
            throw error;
        }

        console.log('Usuário registrado com sucesso');
        return { success: true };
    } catch (error) {
        console.error('Erro durante o registro:', error);
        return { success: false, error: error.message || 'Erro ao registrar usuário' };
    }
}

// Função para login sem autenticação
async function login(username, password) {
    try {
        console.log('Tentando login com usuário:', username);
        
        // Verificar primeiro se o usuário existe
        const { data: users, error: userError } = await supabase
            .from('Users')
            .select('*')
            .eq('username', username);
            
        if (userError) {
            console.error('Erro ao buscar usuário:', userError);
            throw userError;
        }
        
        console.log('Resultado da busca de usuário:', users);
        
        // Verificar se o usuário existe
        if (!users || users.length === 0) {
            console.log('Usuário não encontrado');
            return { success: false, error: 'Usuário ou senha incorretos' };
        }
        
        // Verificar a senha
        const user = users[0];
        if (user.password === password) {
            console.log('Senha correta, login bem-sucedido');
            
            // Armazenar o nome do usuário no localStorage
            localStorage.setItem('currentUser', username);
            
            // Atualizar a UI
            await updateUserInterface(username);
            
            // Retornar sucesso
            return { success: true, message: "Login bem-sucedido" };
        } else {
            console.log('Senha incorreta');
            return { success: false, error: 'Usuário ou senha incorretos' };
        }
    } catch (error) {
        console.error('Erro durante o login:', error);
        return { success: false, error: error.message || 'Erro ao fazer login' };
    }
}

// Função para atualizar a interface do usuário
async function updateUserInterface(username) {
    try {
        // Ocultar os botões de autenticação
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.style.display = 'none';
        }
        
        // Verificar se o usuário é admin
        const { data, error } = await supabase
            .from('Users')
            .select('is_admin')
            .eq('username', username)
            .single();

        // Criar um elemento para mostrar o nome do usuário
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            // Verificar se já existe um elemento para o usuário
            let userElement = document.getElementById('user-display');
            
            // Se não existir, criar um novo
            if (!userElement) {
                userElement = document.createElement('li');
                userElement.id = 'user-display';
                userElement.className = 'user-display';
                navLinks.appendChild(userElement);
            }
            
            // Add admin dashboard link if user is admin
            const adminLink = (data && data.is_admin) ? `<a href="admin.html">Admin Dashboard</a> | ` : '';
            
            // Definir o conteúdo do elemento
            userElement.innerHTML = `<span>Olá, ${username}</span> | ${adminLink}<a href="#" id="logout-link">Sair</a>`;
            
            // Adicionar evento de logout
            document.getElementById('logout-link').addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    } catch (error) {
        console.error('Erro ao atualizar interface:', error);
    }
}

// Verificar se o usuário já está logado ao carregar a página
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
    console.log('Iniciando logout...');
    // Remover o usuário do localStorage
    localStorage.removeItem('currentUser');
    console.log('Usuário removido do localStorage.');
    
    // Atualizar a UI - Isso precisa ser feito antes do redirecionamento
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.style.display = 'block';
        console.log('Botões de autenticação exibidos.');
    }
    
    const userElement = document.getElementById('user-display');
    if (userElement) {
        userElement.remove();
        console.log('Elemento de usuário removido.');
    }
    
    // Redirecionar para a página de index
    console.log('Redirecionando para a página de index...');
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
        console.error('Erro ao verificar admin:', error);
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
            console.error('Erro ao verificar admin existente:', checkError);
            throw checkError;
        }

        if (existingAdmin && existingAdmin.length > 0) {
            console.log('Conta admin já existe');
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
            console.error('Erro ao criar admin:', error);
            throw error;
        }

        console.log('Conta admin criada com sucesso');
        return { success: true };
    } catch (error) {
        console.error('Erro durante criação do admin:', error);
        return { success: false, error: error.message || 'Erro ao criar admin' };
    }
}

