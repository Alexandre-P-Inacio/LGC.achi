// Initialize Supabase client
const supabaseUrl = 'https://pwsgmskiamkpzgtlaikm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c2dtc2tpYW1rcHpndGxhaWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzM5NzIsImV4cCI6MjA1OTk0OTk3Mn0.oYGnYIpOUteNha2V1EoyhgxDA1XFfzxTjY8jAbSyLmI';

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// === VARIÁVEIS GLOBAIS ===
let currentUser = localStorage.getItem('currentUser');
let currentChatUser = null;
let messageSubscription = null; // Para guardar a subscrição atual
let lastMessageCheck = Date.now(); // Para verificação de polling
let isEditing = null; // Para controlar qual mensagem está sendo editada
let isRefreshing = localStorage.getItem('refreshState') === 'true'; // Para controlar se é um refresh após edição/exclusão

// === AO CARREGAR A PÁGINA ===
document.addEventListener('DOMContentLoaded', async () => {
  if (!currentUser) {
    alert('Utilizador não autenticado.');
    window.location.href = 'login.html';
    return;
  }

  await carregarUtilizadores();
  
  // Configurar a assinatura em tempo real
  configurarAssinaturaTempoReal();
  
  // Configurar um fallback com polling a cada 10 segundos
  startMessagePolling();

  // Evento de envio de mensagem
  const form = document.getElementById('chat-input-form');
  if(form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await enviarMensagem();
    });
  }
  
  // Restaurar o chat anterior se existir
  const lastChatUser = localStorage.getItem('lastChatUser');
  if (lastChatUser) {
    setTimeout(() => selecionarUtilizador(lastChatUser), 300); // Atraso menor para carregamento mais rápido
  }
  
  // Se foi um refresh após edição/exclusão, limpar o estado para futuros carregamentos
  if (isRefreshing) {
    localStorage.removeItem('refreshState');
    // Eliminamos a animação de carregamento
    document.documentElement.classList.add('no-transitions');
    
    // Removemos a classe após um breve período para permitir animações futuras
    setTimeout(() => {
      document.documentElement.classList.remove('no-transitions');
    }, 1000);
  }
});

// === CARREGAR UTILIZADORES ===
async function carregarUtilizadores() {
    const { data: users, error } = await supabaseClient
      .from('Users') // Certifique-se que a tabela 'Users' existe e tem a coluna 'username'
      .select('username');
  
    const lista = document.getElementById('user-list');
    if (!lista) {
        return;
    }
    lista.innerHTML = ''; // Limpar lista antiga
  
    if (error) {
      lista.innerHTML = `<div class="user-item-error">Erro ao carregar utilizadores.</div>`;
      return;
    }

    if (!users || users.length === 0) {
        lista.innerHTML = `<div class="user-item-none">Nenhum utilizador encontrado.</div>`;
        return;
    }

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
}

// === SELECIONAR UTILIZADOR PARA CHAT ===
async function selecionarUtilizador(username) {
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
    const chat = document.getElementById('chat-messages');
    if (!chat) {
        return;
    }
    chat.innerHTML = ''; // Limpar mensagens antigas

    const { data: mensagens, error } = await supabaseClient
        .from('chat_messages')
        .select('*')
        .or(`and(sender.eq.${currentUser},receiver.eq.${currentChatUser}),and(sender.eq.${currentChatUser},receiver.eq.${currentUser})`)
        .order('created_at', { ascending: true });

    if (error) {
        chat.innerHTML = `<p class="chat-error">Erro ao carregar mensagens.</p>`;
        return;
    }

    if (!mensagens || mensagens.length === 0) {
        chat.innerHTML = `<p class="chat-empty">Nenhuma mensagem ainda. Comece a conversar!</p>`;
    } else {
        mensagens.forEach(msg => mostrarMensagem(msg));
    }
    chat.scrollTop = chat.scrollHeight; // Scroll para o fim
}

// === MOSTRAR MENSAGEM NA UI ===
function mostrarMensagem(msg) {
    const chat = document.getElementById('chat-messages');
    if (!chat) return;

    // Remover a mensagem vazia se existir
    const emptyMsg = chat.querySelector('.chat-empty');
    if(emptyMsg) emptyMsg.remove();

    // Verificar se a mensagem já existe (para evitar duplicação)
    const existingMsg = document.querySelector(`.message[data-message-id="${msg.id}"]`);
    if (existingMsg) {
        // Se a mensagem já existe, apenas atualiza seu conteúdo
        const contentDiv = existingMsg.querySelector('.message-content');
        if (contentDiv) {
            if (msg.is_deleted) {
                existingMsg.classList.add('deleted');
                contentDiv.textContent = 'Esta mensagem foi excluída.';
            } else {
                contentDiv.textContent = msg.content;
                if (msg.is_edited) {
                    // Adicionar indicador de edição se não existir
                    let editedTag = existingMsg.querySelector('.edited-tag');
                    if (!editedTag) {
                        editedTag = document.createElement('span');
                        editedTag.className = 'edited-tag';
                        editedTag.textContent = ' (editado)';
                        existingMsg.querySelector('.message-time').prepend(editedTag);
                    }
                }
            }
        }
        return;
    }

    const div = document.createElement('div');
    // Certifique-se que as classes CSS 'sent' e 'received' existem em chat.css
    div.className = `message ${msg.sender === currentUser ? 'sent' : 'received'}`;
    if (msg.is_deleted) div.classList.add('deleted');
    
    // Adicionar atributos para possível edição/exclusão futura
    div.dataset.messageId = msg.id;
    div.dataset.sender = msg.sender;

    // Sanitizar o conteúdo antes de inserir (MUITO IMPORTANTE para segurança)
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = msg.is_deleted ? 'Esta mensagem foi excluída.' : msg.content; // Usar textContent previne XSS

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    
    // Adicionar indicador de editado se necessário
    if (msg.is_edited && !msg.is_deleted) {
        const editedTag = document.createElement('span');
        editedTag.className = 'edited-tag';
        editedTag.textContent = ' (editado)';
        timeDiv.appendChild(editedTag);
    }
    
    timeDiv.appendChild(document.createTextNode(formatarHora(msg.created_at)));

    div.appendChild(contentDiv);
    div.appendChild(timeDiv);
    
    // Adicionar botões de ação (editar/excluir) apenas para mensagens enviadas pelo usuário atual
    // e que não estejam excluídas
    if (msg.sender === currentUser && !msg.is_deleted) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        
        const editButton = document.createElement('button');
        editButton.className = 'message-action-button edit';
        editButton.innerHTML = '<i class="fas fa-edit"></i> Editar';
        editButton.addEventListener('click', () => startEditingMessage(msg.id));
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'message-action-button delete';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i> Excluir';
        deleteButton.addEventListener('click', () => deleteMessage(msg.id));
        
        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);
        div.appendChild(actionsDiv);
    }
    
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight; // Scroll para o fim
}

// === ENVIAR MENSAGEM ===
async function enviarMensagem() {
    // Obter o conteúdo da mensagem
    const messageInput = document.getElementById('chat-input');
    const content = messageInput.value.trim();
    
    // Verificar se o conteúdo não está vazio e se temos um utilizador selecionado
    if (!content || !currentChatUser) {
        if (!content) {
            messageInput.classList.add('error');
            setTimeout(() => messageInput.classList.remove('error'), 2000);
        }
        if (!currentChatUser) {
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
        
        // Inserir mensagem na base de dados
        const { data, error } = await supabaseClient
            .from('chat_messages')
            .insert(message)
            .select();
            
        if (error) {
            throw error;
        }
        
        // Guardar o utilizador atual no localStorage antes de recarregar
        localStorage.setItem('lastChatUser', currentChatUser);
        
        // Indicar que estamos fazendo um refresh após envio
        localStorage.setItem('refreshState', 'true');
        
        // Recarregar a página
        window.location.reload();
        
    } catch (error) {
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
    const channelName = `chat-messages-${currentUser}`; // Nome do canal com username para evitar conflitos

    // Remover canal anterior se existir
    if (messageSubscription) {
        supabaseClient.removeChannel(messageSubscription);
        messageSubscription = null;
    }

    try {
        messageSubscription = supabaseClient
            .channel(channelName)
            .on(
                'postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'chat_messages',
                    filter: `receiver=eq.${currentUser}`
                },
                (payload) => {
                    handleNewMessage(payload.new);
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    document.dispatchEvent(new CustomEvent('realtime-connected'));
                } else if (status === 'CHANNEL_ERROR') {
                    document.dispatchEvent(new CustomEvent('realtime-error'));
                } else if (status === 'TIMED_OUT') {
                    setTimeout(configurarAssinaturaTempoReal, 5000);
                }
            });
    } catch (error) {
        // Silently handle error
    }
}

// Função para lidar com novas mensagens (tanto de realtime quanto de polling)
function handleNewMessage(msg) {
    // Atualizar a última verificação
    lastMessageCheck = Date.now();
    
    // Salvar o remetente como usuário do chat atual
    localStorage.setItem('lastChatUser', msg.sender);
    
    // Recarregar a página
    setTimeout(() => {
        window.location.reload();
    }, 100);
}

// Implementar um sistema de polling como fallback para realtime
function startMessagePolling() {
    // Verificar novas mensagens a cada 10 segundos
    setInterval(async () => {
        // Não verificar se o usuário estava digitando
        const inputActive = document.activeElement === document.getElementById('chat-input');
        if (inputActive) return;
        
        try {
            // Buscar mensagens recebidas após a última verificação
            const { data, error } = await supabaseClient
                .from('chat_messages')
                .select('*')
                .eq('receiver', currentUser)
                .gt('created_at', new Date(lastMessageCheck).toISOString())
                .order('created_at', { ascending: false })
                .limit(1);
                
            if (error) throw error;
            
            if (data && data.length > 0) {
                handleNewMessage(data[0]);
            }
        } catch (error) {
            // Silently handle error
        }
    }, 10000); // 10 segundos
}

// === FORMATAR HORA ===
function formatarHora(timestamp) {
    if (!timestamp) return '';
    try {
        const data = new Date(timestamp);
        // Formato HH:MM
        return data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    } catch(e) {
        return '--:--';
    }
}

// === INICIAR EDIÇÃO DE MENSAGEM ===
function startEditingMessage(messageId) {
    // Se já estiver editando outra mensagem, cancela a edição
    if (isEditing) {
        cancelEditing();
    }
    
    isEditing = messageId;
    const messageElement = document.querySelector(`.message[data-message-id="${messageId}"]`);
    if (!messageElement) return;
    
    // Adicionar classe de edição
    messageElement.classList.add('editing');
    
    // Obter o conteúdo atual da mensagem
    const contentDiv = messageElement.querySelector('.message-content');
    const currentContent = contentDiv.textContent;
    
    // Criar o input para edição
    const editContainer = document.createElement('div');
    editContainer.className = 'edit-container';
    
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.value = currentContent;
    
    const editActions = document.createElement('div');
    editActions.className = 'edit-actions';
    
    const saveButton = document.createElement('button');
    saveButton.className = 'edit-button';
    saveButton.textContent = 'Salvar';
    saveButton.addEventListener('click', () => saveMessageEdit(messageId, editInput.value));
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-button';
    cancelButton.textContent = 'Cancelar';
    cancelButton.addEventListener('click', cancelEditing);
    
    editActions.appendChild(cancelButton);
    editActions.appendChild(saveButton);
    
    editContainer.appendChild(editInput);
    editContainer.appendChild(editActions);
    
    // Substituir o conteúdo pelo formulário de edição
    contentDiv.innerHTML = '';
    contentDiv.appendChild(editContainer);
    
    // Focar no input
    editInput.focus();
    
    // Permitir salvar com Enter
    editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveMessageEdit(messageId, editInput.value);
        }
    });
}

// === CANCELAR EDIÇÃO DE MENSAGEM ===
function cancelEditing() {
    if (!isEditing) return;
    
    const messageElement = document.querySelector(`.message[data-message-id="${isEditing}"]`);
    if (!messageElement) return;
    
    // Recarregar mensagens para restaurar o estado original
    messageElement.classList.remove('editing');
    isEditing = null;
    carregarMensagens();
}

// === SALVAR EDIÇÃO DE MENSAGEM ===
async function saveMessageEdit(messageId, newContent) {
    if (!newContent.trim()) {
        // Não permitir conteúdo vazio
        return;
    }
    
    try {
        // Atualizar a mensagem no banco de dados
        const { error } = await supabaseClient
            .from('chat_messages')
            .update({ 
                content: newContent,
                is_edited: true
            })
            .eq('id', messageId)
            .eq('sender', currentUser); // Garantir que só o próprio usuário pode editar suas mensagens
        
        if (error) throw error;
        
        // Limpar o estado de edição
        isEditing = null;
        
        // Guardar o utilizador atual no localStorage antes de recarregar
        localStorage.setItem('lastChatUser', currentChatUser);
        
        // Indicar que estamos fazendo um refresh após edição
        localStorage.setItem('refreshState', 'true');
        
        // Recarregar a página para mostrar as mudanças
        window.location.reload();
        
    } catch (error) {
        // Mostrar erro ao usuário
        const errorToast = document.createElement('div');
        errorToast.className = 'error-toast';
        errorToast.innerText = 'Erro ao editar mensagem. Tente novamente.';
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

// === EXCLUIR MENSAGEM ===
async function deleteMessage(messageId) {
    // Confirmar antes de excluir
    if (!confirm('Tem certeza que deseja excluir esta mensagem?')) {
        return;
    }
    
    try {
        // Marcar a mensagem como excluída no banco de dados
        const { error } = await supabaseClient
            .from('chat_messages')
            .update({ is_deleted: true })
            .eq('id', messageId)
            .eq('sender', currentUser); // Garantir que só o próprio usuário pode excluir suas mensagens
        
        if (error) throw error;
        
        // Guardar o utilizador atual no localStorage antes de recarregar
        localStorage.setItem('lastChatUser', currentChatUser);
        
        // Indicar que estamos fazendo um refresh após exclusão
        localStorage.setItem('refreshState', 'true');
        
        // Recarregar a página para mostrar as mudanças
        window.location.reload();
        
    } catch (error) {
        // Mostrar erro ao usuário
        const errorToast = document.createElement('div');
        errorToast.className = 'error-toast';
        errorToast.innerText = 'Erro ao excluir mensagem. Tente novamente.';
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
