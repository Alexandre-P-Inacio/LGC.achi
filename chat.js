// Configuração do Supabase
const supabaseUrl = 'https://pwsgmskiamkpzgtlaikm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c2dtc2tpYW1rcHpndGxhaWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzM5NzIsImV4cCI6MjA1OTk0OTk3Mn0.oYGnYIpOUteNha2V1EoyhgxDA1XFfzxTjY8jAbSyLmI';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Variáveis globais
let currentUser = localStorage.getItem('currentUser');
let currentChatUser = null;
let subscription = null;

// Quando a página carrega
document.addEventListener('DOMContentLoaded', async () => {
  if (!currentUser) {
    alert('Utilizador não autenticado.');
    window.location.href = 'login.html';
    return;
  }

  await carregarUtilizadores();

  document.getElementById('chat-input-form').addEventListener('submit', (e) => {
    e.preventDefault();
    enviarMensagem();
  });
});

// Carrega a lista de utilizadores
async function carregarUtilizadores() {
  const { data: users, error } = await supabaseClient
    .from('Users')
    .select('username');

  const lista = document.getElementById('user-list');
  lista.innerHTML = '';

  if (error) {
    lista.innerHTML = `<p>Erro: ${error.message}</p>`;
    return;
  }

  users
    .filter(u => u.username !== currentUser)
    .forEach(user => {
      const div = document.createElement('div');
      div.className = 'user-item';
      div.dataset.username = user.username;
      div.innerHTML = `<span class="user-name">${user.username}</span>`;
      div.addEventListener('click', () => selecionarUtilizador(user.username));
      lista.appendChild(div);
    });
}

// Selecionar um utilizador e iniciar o chat
async function selecionarUtilizador(username) {
  currentChatUser = username;
  document.getElementById('chat-header').textContent = `Chat com ${username}`;
  document.getElementById('chat-messages').innerHTML = '';
  document.getElementById('chat-input').value = '';
  document.getElementById('chat-input').focus();

  await carregarMensagens();

  if (subscription) {
    supabaseClient.removeChannel(subscription);
    subscription = null;
  }

  subscription = supabaseClient
    .channel(`chat-realtime-${currentUser}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
    }, payload => {
      const msg = payload.new;
      if (
        (msg.sender === currentUser && msg.receiver === currentChatUser) ||
        (msg.sender === currentChatUser && msg.receiver === currentUser)
      ) {
        mostrarMensagem(msg);
      }
    })
    .subscribe(status => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Subscrição em tempo real ativa!');
      }
    });
}

// Carregar as mensagens da conversa
async function carregarMensagens() {
  const { data: mensagens, error } = await supabaseClient
    .from('chat_messages')
    .select('*')
    .or(`and(sender.eq.${currentUser},receiver.eq.${currentChatUser}),and(sender.eq.${currentChatUser},receiver.eq.${currentUser})`)
    .order('created_at', { ascending: true });

  const chat = document.getElementById('chat-messages');
  chat.innerHTML = '';

  if (error) {
    chat.innerHTML = `<p>Erro ao carregar mensagens.</p>`;
    return;
  }

  mensagens.forEach(msg => mostrarMensagem(msg));
  chat.scrollTop = chat.scrollHeight;
}

// Mostrar uma mensagem na interface
function mostrarMensagem(msg) {
  const chat = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `message ${msg.sender === currentUser ? 'sent' : 'received'}`;
  div.innerHTML = `
    <div class="message-content">${msg.content}</div>
    <div class="message-time">${formatarHora(msg.created_at)}</div>
  `;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// Enviar uma nova mensagem
async function enviarMensagem() {
  const input = document.getElementById('chat-input');
  const texto = input.value.trim();
  if (!texto || !currentChatUser) return;

  input.value = '';

  const { error } = await supabaseClient
    .from('chat_messages')
    .insert({
      sender: currentUser,
      receiver: currentChatUser,
      content: texto,
      read: false
    });

  if (error) {
    alert('Erro ao enviar mensagem: ' + error.message);
  }
}

// Formatar hora (ex: 14:35)
function formatarHora(timestamp) {
  const hora = new Date(timestamp);
  return hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
