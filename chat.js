// Supabase config
const supabaseUrl = 'https://pwsgmskiamkpzgtlaikm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c2dtc2tpYW1rcHpndGxhaWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzM5NzIsImV4cCI6MjA1OTk0OTk3Mn0.oYGnYIpOUteNha2V1EoyhgxDA1XFfzxTjY8jAbSyLmI';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Variáveis globais
let currentUser = localStorage.getItem('currentUser');
let currentChatUser = null;
let subscription = null;

// Ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
  if (!currentUser) {
    alert("Utilizador não autenticado.");
    window.location.href = 'login.html';
    return;
  }

  await loadUsers();

  // Eventos
  document.getElementById('send-button').addEventListener('click', sendMessage);
  document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  document.getElementById('search-button').addEventListener('click', loadUsers);
});

// Carregar lista de utilizadores
async function loadUsers() {
  const { data: users, error } = await supabaseClient
    .from('Users')
    .select('username');

  const container = document.getElementById('user-list');
  container.innerHTML = '';

  if (error) {
    console.error("Erro ao carregar utilizadores:", error.message);
    container.innerHTML = `<p>Erro: ${error.message}</p>`;
    return;
  }

  if (!users || users.length === 0) {
    container.innerHTML = `<p>Nenhum utilizador encontrado.</p>`;
    return;
  }

  users
    .filter(u => u.username !== currentUser)
    .forEach(user => {
      const div = document.createElement('div');
      div.className = 'user-item';
      div.dataset.username = user.username;
      div.innerHTML = `
        <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
        <div class="user-info">
          <span class="user-name">${user.username}</span>
          <div class="last-message">Clique para conversar</div>
        </div>
      `;
      div.addEventListener('click', () => selectUser(user.username));
      container.appendChild(div);
    });
}

// Selecionar utilizador para conversar
async function selectUser(username) {
  currentChatUser = username;
  document.getElementById('chat-header').innerHTML = `<h2>Chat com ${username}</h2>`;
  document.getElementById('chat-input-container').style.display = 'flex';

  await loadMessages();

  if (subscription) {
    supabaseClient.removeChannel(subscription);
  }

  // Subscrição em tempo real
  subscription = supabaseClient
    .channel('chat-messages-channel')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages'
    }, (payload) => {
      const msg = payload.new;
      if (
        (msg.sender === currentUser && msg.receiver === currentChatUser) ||
        (msg.sender === currentChatUser && msg.receiver === currentUser)
      ) {
        appendMessage(msg);
      }
    })
    .subscribe();
}

// Carregar mensagens entre utilizadores
async function loadMessages() {
  const { data: messages, error } = await supabaseClient
    .from('chat_messages')
    .select('*')
    .or(`and(sender.eq.${currentUser},receiver.eq.${currentChatUser}),and(sender.eq.${currentChatUser},receiver.eq.${currentUser})`)
    .order('created_at', { ascending: true });

  const chat = document.getElementById('chat-messages');
  chat.innerHTML = '';

  if (error) {
    console.error("Erro ao carregar mensagens:", error.message);
    chat.innerHTML = `<p>Erro ao carregar mensagens.</p>`;
    return;
  }

  if (!messages || messages.length === 0) {
    chat.innerHTML = `<p>Sem mensagens ainda. Começa a conversar!</p>`;
    return;
  }

  messages.forEach(msg => appendMessage(msg));
  chat.scrollTop = chat.scrollHeight;
}

// Adicionar mensagem na UI
function appendMessage(msg) {
  const chat = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `message ${msg.sender === currentUser ? 'sent' : 'received'}`;
  div.innerHTML = `
    <div class="message-avatar">${msg.sender.charAt(0).toUpperCase()}</div>
    <div class="message-bubble">
      ${msg.sender !== currentUser ? `<div class="message-sender">${msg.sender}</div>` : ''}
      <div class="message-content">${msg.content}</div>
      <div class="message-time">${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    </div>
  `;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// Enviar mensagem
async function sendMessage() {
  const input = document.getElementById('chat-input');
  const content = input.value.trim();
  if (!content || !currentChatUser) return;

  input.value = '';

  const { error } = await supabaseClient
    .from('chat_messages')
    .insert({
      sender: currentUser,
      receiver: currentChatUser,
      content,
      read: false
    });

  if (error) {
    console.error("Erro ao enviar mensagem:", error.message);
    alert("Erro ao enviar mensagem.");
  }
}
