// Initialize Supabase client
const supabaseUrl = 'https://pwsgmskiamkpzgtlaikm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c2dtc2tpYW1rcHpndGxhaWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzM5NzIsImV4cCI6MjA1OTk0OTk3Mn0.oYGnYIpOUteNha2V1EoyhgxDA1XFfzxTjY8jAbSyLmI';

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// === VARIÁVEIS GLOBAIS ===
let currentUser = localStorage.getItem('currentUser');
let currentChatUser = null;
let messageSubscription = null; // Para guardar a subscrição atual

// === AO CARREGAR A PÁGINA ===
document.addEventListener('DOMContentLoaded', async () => {
  if (!currentUser) {
    alert('Utilizador não autenticado.');
    window.location.href = 'login.html';
    return;
  }

  console.log(`Utilizador logado: ${currentUser}`);
  await carregarUtilizadores();
  configurarAssinaturaTempoReal(); // Configurar a assinatura de tempo real

  // Evento de envio de mensagem
  const form = document.getElementById('chat-input-form');
  if(form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await enviarMensagem();
    });
  } else {
      console.error("Elemento 'chat-input-form' não encontrado.");
  }
  
  // Restaurar o chat anterior se existir
  const lastChatUser = localStorage.getItem('lastChatUser');
  if (lastChatUser) {
    console.log(`Restaurando chat com: ${lastChatUser}`);
    setTimeout(() => selecionarUtilizador(lastChatUser), 500); // Pequeno atraso para garantir que a lista de usuários já foi carregada
  }
});

// === CARREGAR UTILIZADORES ===
async function carregarUtilizadores() {
    console.log("A carregar utilizadores...");
    const { data: users, error } = await supabaseClient
      .from('Users') // Certifique-se que a tabela 'Users' existe e tem a coluna 'username'
      .select('username');
  
    const lista = document.getElementById('user-list');
    if (!lista) {
        console.error("Elemento 'user-list' não encontrado.");
        return;
    }
    lista.innerHTML = ''; // Limpar lista antiga
  
    if (error) {
      console.error("Erro ao carregar utilizadores:", error);
      lista.innerHTML = `<div class="user-item-error">Erro ao carregar utilizadores.</div>`;
      return;
    }

    if (!users || users.length === 0) {
        lista.innerHTML = `<div class="user-item-none">Nenhum utilizador encontrado.</div>`;
        return;
    }
  
    console.log(`Utilizadores carregados: ${users.length}`);
    // Filtrar o utilizador atual e mostrar os outros
    users.filter(u => u.username !== currentUser).forEach(user => {
      const div = document.createElement('div');
      div.className = 'user-item';
      div.dataset.username = user.username;
      // Adicionar o avatar e nome
      div.innerHTML = `
          <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
          <div class="user-info">
              <span class="user-name">${user.username}</span>
              <span class="last-message-placeholder" id="last-msg-${user.username}"></span>
          </div>
      `;
      div.addEventListener('click', () => selecionarUtilizador(user.username));
      lista.appendChild(div);
    });
    // TODO: Opcionalmente, carregar a última mensagem para cada utilizador aqui
}

// === SELECIONAR UTILIZADOR PARA CHAT ===
async function selecionarUtilizador(username) {
    console.log(`A selecionar utilizador: ${username}`);
    if (currentChatUser === username) return; // Não fazer nada se já está selecionado

    currentChatUser = username;

    // Atualizar UI
    document.querySelectorAll('.user-item').forEach(item => item.classList.remove('active'));
    const userItem = document.querySelector(`.user-item[data-username="${username}"]`);
    if (userItem) userItem.classList.add('active');

    const chatHeader = document.getElementById('chat-header');
    if (chatHeader) chatHeader.textContent = `Chat com ${username}`;
    
    const messagesDiv = document.getElementById('chat-messages');
    if (messagesDiv) messagesDiv.innerHTML = '<p>Carregando mensagens...</p>'; // Feedback de carregamento
    
    const inputArea = document.querySelector('.chat-input-area');
    if (inputArea) inputArea.style.display = 'flex'; // Mostrar área de input
    
    await carregarMensagens();
}

// === CARREGAR MENSAGENS ===
async function carregarMensagens() {
    if (!currentChatUser) return;
    console.log(`A carregar mensagens para: ${currentChatUser}`);
    const chat = document.getElementById('chat-messages');
    if (!chat) {
        console.error("Elemento 'chat-messages' não encontrado.");
        return;
    }
    chat.innerHTML = ''; // Limpar mensagens antigas

    const { data: mensagens, error } = await supabaseClient
        .from('chat_messages')
        .select('*')
        .or(`and(sender.eq.${currentUser},receiver.eq.${currentChatUser}),and(sender.eq.${currentChatUser},receiver.eq.${currentUser})`)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Erro ao carregar mensagens:", error);
        chat.innerHTML = `<p class="chat-error">Erro ao carregar mensagens.</p>`;
        return;
    }

    if (!mensagens || mensagens.length === 0) {
        chat.innerHTML = `<p class="chat-empty">Nenhuma mensagem ainda. Comece a conversar!</p>`;
    } else {
        mensagens.forEach(msg => mostrarMensagem(msg));
    }
    chat.scrollTop = chat.scrollHeight; // Scroll para o fim
    
    // Marcar mensagens como lidas (opcional, requer coluna 'read')
    // await marcarMensagensComoLidas(currentChatUser);
}

// === MOSTRAR MENSAGEM NA UI ===
function mostrarMensagem(msg) {
    const chat = document.getElementById('chat-messages');
    if (!chat) return;

    // Remover a mensagem vazia se existir
    const emptyMsg = chat.querySelector('.chat-empty');
    if(emptyMsg) emptyMsg.remove();

    const div = document.createElement('div');
    // Certifique-se que as classes CSS 'sent' e 'received' existem em chat.css
    div.className = `message ${msg.sender === currentUser ? 'sent' : 'received'}`;
    // Adicionar atributos para possível edição/exclusão futura
    div.dataset.messageId = msg.id;
    div.dataset.sender = msg.sender;

    // Sanitizar o conteúdo antes de inserir (MUITO IMPORTANTE para segurança)
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = msg.content; // Usar textContent previne XSS

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = formatarHora(msg.created_at);

    div.appendChild(contentDiv);
    div.appendChild(timeDiv);
    chat.appendChild(div);
}

// === ENVIAR MENSAGEM ===
async function enviarMensagem() {
    // Obter o conteúdo da mensagem
    const messageInput = document.getElementById('chat-input');
    const content = messageInput.value.trim();
    
    // Verificar se o conteúdo não está vazio e se temos um utilizador selecionado
    if (!content || !currentChatUser) {
        if (!content) {
            console.warn('⚠️ Mensagem vazia!');
            messageInput.classList.add('error');
            setTimeout(() => messageInput.classList.remove('error'), 2000);
        }
        if (!currentChatUser) {
            console.warn('⚠️ Nenhum utilizador selecionado para chat!');
            document.getElementById('user-list').classList.add('pulse-error');
            setTimeout(() => document.getElementById('user-list').classList.remove('pulse-error'), 2000);
        }
        return;
    }
    
    // Limpar o input e definir estado de envio
    messageInput.value = '';
    messageInput.disabled = true;
    document.getElementById('send-button').disabled = true;
    
    try {
        // Criar o objeto da mensagem
        const message = {
            sender: currentUser,
            receiver: currentChatUser,
            content: content,
            created_at: new Date().toISOString(),
            read: false,
            is_edited: false,
            is_deleted: false
        };
        
        console.log('📤 A enviar mensagem:', message);
        
        // Inserir mensagem na base de dados
        const { data, error } = await supabaseClient
            .from('chat_messages')
            .insert(message)
            .select();
            
        if (error) {
            throw error;
        }
        
        console.log('✅ Mensagem enviada com sucesso:', data);
        
        // Guardar o utilizador atual no localStorage antes de recarregar
        localStorage.setItem('lastChatUser', currentChatUser);
        
        // Recarregar a página
        window.location.reload();
        
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        messageInput.disabled = false;
        document.getElementById('send-button').disabled = false;
        
        // Mostrar erro ao utilizador
        const errorToast = document.createElement('div');
        errorToast.className = 'error-toast';
        errorToast.innerText = 'Erro ao enviar mensagem. Tente novamente.';
        document.body.appendChild(errorToast);
        
        setTimeout(() => {
            errorToast.classList.add('show');
            setTimeout(() => {
                errorToast.classList.remove('show');
                setTimeout(() => errorToast.remove(), 300);
            }, 3000);
        }, 100);
    }
}

// === CONFIGURAR ASSINATURA DE TEMPO REAL ===
function configurarAssinaturaTempoReal() {
    const channelName = 'chat-messages-realtime'; // Nome do canal
    console.log(`📡 A configurar subscrição Supabase no canal: ${channelName}`);

    // Remover canal anterior se existir
    if (messageSubscription) {
        supabaseClient.removeChannel(messageSubscription);
        messageSubscription = null;
        console.log("Canal anterior removido.");
    }

    messageSubscription = supabaseClient
        .channel(channelName)
        .on(
            'postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'chat_messages',
                // Escutar por mensagens ONDE o receiver é o utilizador atual
                filter: `receiver=eq.${currentUser}`
            },
            payload => {
                console.log('📩 Nova mensagem RECEBIDA:', payload.new);
                const msg = payload.new;
                
                // Salvar o remetente como usuário do chat atual antes de recarregar
                if (currentChatUser !== msg.sender) {
                    localStorage.setItem('lastChatUser', msg.sender);
                }
                
                // Recarregar a página para mostrar a nova mensagem
                console.log("Recarregando página para mostrar nova mensagem de: " + msg.sender);
                window.location.reload();
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                // Escutar por mensagens ONDE o sender é o utilizador atual
                filter: `sender=eq.${currentUser}`
            },
            payload => {
                console.log('📤 Nova mensagem ENVIADA:', payload.new);
                // Não precisamos fazer nada aqui, pois já recarregamos a página ao enviar a mensagem
            }
        )
        // TODO: Adicionar listeners para UPDATE (edição/leitura) e DELETE se necessário
        .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Conectado ao canal de tempo real!');
            } else if (status === 'CHANNEL_ERROR') {
                console.error('❌ Erro no canal:', err);
            } else if (status === 'TIMED_OUT') {
                console.warn('⏱️ Timeout na conexão.');
            } else if (status === 'CLOSED') {
                console.log(' Canal fechado.');
            }
        });
}

// === FORMATAR HORA ===
function formatarHora(timestamp) {
    if (!timestamp) return '';
    try {
        const data = new Date(timestamp);
        // Formato HH:MM
        return data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    } catch(e) {
        console.error("Erro ao formatar hora:", timestamp, e);
        return '--:--';
    }
}

// === FUNÇÕES ADICIONAIS (Opcional) ===
/*
async function marcarMensagensComoLidas(otherUser) {
    if (!otherUser) return;
    console.log(`Marcando mensagens de ${otherUser} como lidas.`);
    const { error } = await supabaseClient
        .from('chat_messages')
        .update({ read: true })
        .eq('receiver', currentUser)
        .eq('sender', otherUser)
        .eq('read', false);
    if (error) {
        console.error("Erro ao marcar mensagens como lidas:", error);
    }
}
*/

/*
function addNewMessageIndicator(senderUsername) {
    const userItem = document.querySelector(`.user-item[data-username="${senderUsername}"]`);
    if (userItem && !userItem.classList.contains('active')) {
        let indicator = userItem.querySelector('.unread-indicator');
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'unread-indicator';
            indicator.textContent = '1';
            userItem.querySelector('.user-info').appendChild(indicator);
        } else {
            indicator.textContent = parseInt(indicator.textContent || '0') + 1;
        }
    }
}
*/

/*
function playNotificationSound() {
    // Implementar reprodução de som
}
*/

/*
function updateLastMessagePreview(otherUser, content) {
    const lastMsgSpan = document.getElementById(`last-msg-${otherUser}`);
    if (lastMsgSpan) {
        lastMsgSpan.textContent = content.substring(0, 20) + (content.length > 20 ? '...' : '');
    }
}
*/
