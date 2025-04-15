// Global variables
let currentUser;
let currentChatUser = null;
let messageSubscription = null;
let editingMessageId = null;

// Check if user is logged in
document.addEventListener('DOMContentLoaded', async function() {
    currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Create chat messages table if it doesn't exist
    await ensureChatTablesExist();
    
    // Load user list
    await loadUsers();
    
    // Set up event listeners
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Send button
    document.getElementById('send-button').addEventListener('click', sendMessage);
    
    // Enter key in input
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // User search
    document.getElementById('search-button').addEventListener('click', searchUsers);
    document.getElementById('user-search').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchUsers();
        }
    });
}

// Update the messages UI
function updateMessagesUI(messages) {
    const messagesElement = document.getElementById('chat-messages');
    
    if (!messages || messages.length === 0) {
        messagesElement.innerHTML = `
            <div class="no-messages">
                <p>Nenhuma mensagem ainda. Comece a conversar!</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="messages-container">';
    let currentDate = null;
    let previousSender = null;
    
    messages.forEach((message, index) => {
        const isSent = message.sender === currentUser;
        const messageClass = isSent ? 'sent' : 'received';
        const isDeleted = message.content === '[MENSAGEM APAGADA]';
        const isEdited = message.content.includes('[EDITADO]: ');
        
        // Format date for messages
        const messageDate = new Date(message.created_at);
        const formattedDate = messageDate.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Check if we need to show date separator
        if (currentDate !== formattedDate) {
            html += `<div class="date-separator"><span>${formattedDate}</span></div>`;
            currentDate = formattedDate;
            previousSender = null; // Reset previous sender when date changes
        }
        
        // Check if this is a new message group
        const isNewGroup = previousSender !== message.sender;
        const groupClass = isNewGroup ? 'message-group-start' : '';
        
        // Format time
        const time = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Determine if this is the last message in a group
        const isLastInGroup = index === messages.length - 1 || 
                            messages[index + 1].sender !== message.sender;
        
        const lastGroupClass = isLastInGroup ? 'message-group-end' : '';
        const deletedClass = isDeleted ? 'message-deleted' : '';
        
        // Only allow editing and deleting of sent messages that are not deleted
        const actionButtons = isSent && !isDeleted ? `
            <div class="message-actions">
                <button class="message-action-btn edit-btn" onclick="startEditingMessage('${message.id}', '${isEdited ? escape(message.content.replace('[EDITADO]: ', '')) : escape(message.content)}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="message-action-btn delete-btn" onclick="deleteMessage('${message.id}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        ` : '';
        
        // Message content 
        let messageContent = message.content;
        let editedIndicator = '';
        
        if (isEdited) {
            messageContent = message.content.replace('[EDITADO]: ', '');
            editedIndicator = '<span class="message-edited">editado</span>';
        }
        
        html += `
            <div class="message ${messageClass} ${groupClass} ${lastGroupClass} ${deletedClass}" data-message-id="${message.id}">
                <div class="message-avatar">${message.sender.charAt(0).toUpperCase()}</div>
                ${actionButtons}
                <div class="message-bubble">
                    ${!isSent ? `<div class="message-sender">${message.sender}</div>` : ''}
                    <div class="message-content">${messageContent}</div>
                    <div class="message-time">
                        ${time} ${editedIndicator}
                    </div>
                </div>
            </div>
        `;
        
        previousSender = message.sender;
    });
    
    html += '</div>';
    messagesElement.innerHTML = html;
    
    // Scroll to bottom
    messagesElement.scrollTop = messagesElement.scrollHeight;
}

// Start editing a message
function startEditingMessage(messageId, content) {
    // Store the message ID being edited
    editingMessageId = messageId;
    
    // Get the message element
    const messageElement = document.querySelector(`.message[data-message-id="${messageId}"]`);
    
    // Add editing class
    messageElement.classList.add('message-editing');
    
    // Replace content with input field
    const contentElement = messageElement.querySelector('.message-content');
    
    // Decode escaped content
    const decodedContent = unescape(content);
    
    contentElement.innerHTML = `
        <textarea class="message-edit-input">${decodedContent}</textarea>
        <div class="message-edit-buttons">
            <button class="message-edit-save" onclick="saveMessageEdit('${messageId}')">
                <i class="fas fa-check"></i> Salvar
            </button>
            <button class="message-edit-cancel" onclick="cancelMessageEdit('${messageId}')">
                <i class="fas fa-times"></i> Cancelar
            </button>
        </div>
    `;
    
    // Focus the input field
    const textarea = contentElement.querySelector('textarea');
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
}

// Save message edit
async function saveMessageEdit(messageId) {
    // Get the new content
    const messageElement = document.querySelector(`.message[data-message-id="${messageId}"]`);
    const textarea = messageElement.querySelector('.message-edit-input');
    const newContent = textarea.value.trim();
    
    if (!newContent) {
        alert('A mensagem não pode estar vazia.');
        return;
    }
    
    try {
        // Update the message in the database
        const { error } = await supabase
            .from('chat_messages')
            .update({
                content: '[EDITADO]: ' + newContent
            })
            .eq('id', messageId);
            
        if (error) {
            console.error('Erro ao atualizar a mensagem:', error);
            alert('Erro ao atualizar a mensagem.');
            return;
        }
        
        // Reset editing state
        editingMessageId = null;
        
        // Reload messages to show the updated content
        if (currentChatUser) {
            loadMessages(currentChatUser);
        }
    } catch (error) {
        console.error('Erro em saveMessageEdit:', error);
        alert('Erro ao salvar as alterações.');
    }
}

// Cancel message edit
function cancelMessageEdit(messageId) {
    // Reset editing state
    editingMessageId = null;
    
    // Reload messages to revert changes
    if (currentChatUser) {
        loadMessages(currentChatUser);
    }
}

// Delete message
async function deleteMessage(messageId) {
    // Ask for confirmation
    if (!confirm('Tem certeza que deseja excluir esta mensagem?')) {
        return;
    }
    
    try {
        // Mark the message as deleted in the database
        const { error } = await supabase
            .from('chat_messages')
            .update({
                content: '[MENSAGEM APAGADA]'
            })
            .eq('id', messageId);
            
        if (error) {
            console.error('Erro ao excluir a mensagem:', error);
            alert('Erro ao excluir a mensagem.');
            return;
        }
        
        // Reload messages to show the updated state
        if (currentChatUser) {
            loadMessages(currentChatUser);
        }
    } catch (error) {
        console.error('Erro em deleteMessage:', error);
        alert('Erro ao excluir a mensagem.');
    }
}

// Ensure that the chat tables exist with required fields
async function ensureChatTablesExist() {
    try {
        console.log("Verificando se a tabela chat_messages existe...");
        
        // Try to query the table to see if it exists
        const { error } = await supabase
            .from('chat_messages')
            .select('id')
            .limit(1);
            
        if (error) {
            console.error("Erro ao verificar a tabela chat_messages:", error);
            
            // Show an error message
            alert("A tabela de chat não existe. Por favor, crie uma tabela 'chat_messages' no Supabase com as colunas: id, sender, receiver, content, created_at, read.");
            
            // Disable chat functionality
            document.getElementById('chat-messages').innerHTML = `
                <div class="error-message" style="text-align: center; padding: 2rem;">
                    <h3>Tabela de chat não encontrada</h3>
                    <p>O administrador precisa criar a tabela 'chat_messages' no banco de dados.</p>
                    <p>Colunas necessárias:</p>
                    <ul style="list-style-type: none; padding: 0;">
                        <li>id (int4, primary key)</li>
                        <li>sender (text, not null)</li>
                        <li>receiver (text, not null)</li>
                        <li>content (text, not null)</li>
                        <li>created_at (timestamptz, default: now())</li>
                        <li>read (boolean, default: false)</li>
                    </ul>
                </div>
            `;
            
            // Hide chat input
            document.getElementById('chat-input-container').style.display = 'none';
            
            return false;
        }
        
        console.log("Tabela chat_messages existe");
        return true;
    } catch (error) {
        console.error("Erro em ensureChatTablesExist:", error);
        return false;
    }
}

// Load users for chat with last message preview
async function loadUsers() {
    try {
        // Get all users
        const { data: users, error } = await supabase
            .from('Users')
            .select('username')
            .neq('username', currentUser);
            
        if (error) {
            console.error('Erro ao carregar usuários:', error);
            document.getElementById('user-list').innerHTML = `
                <div class="error-message">
                    Erro ao carregar usuários: ${error.message}
                </div>
            `;
            return;
        }
        
        // Get last messages for each user
        const enhancedUsers = await Promise.all(users.map(async (user) => {
            try {
                // Get the last message between current user and this user
                const { data: messages, error: msgError } = await supabase
                    .from('chat_messages')
                    .select('*')
                    .or(`and(sender.eq.${currentUser},receiver.eq.${user.username}),and(sender.eq.${user.username},receiver.eq.${currentUser})`)
                    .order('created_at', { ascending: false })
                    .limit(1);
                
                let lastMessage = null;
                let lastMessageTime = null;
                
                if (!msgError && messages && messages.length > 0) {
                    lastMessage = messages[0].content === '[MENSAGEM APAGADA]' ? 'Mensagem apagada' : messages[0].content.replace('[EDITADO]: ', '');
                    lastMessageTime = new Date(messages[0].created_at);
                }
                
                return {
                    ...user,
                    lastMessage: lastMessage,
                    lastMessageTime: lastMessageTime
                };
            } catch (err) {
                console.error(`Erro ao obter última mensagem para o usuário ${user.username}:`, err);
                return user;
            }
        }));
        
        // Sort users by last message time (most recent first)
        enhancedUsers.sort((a, b) => {
            if (!a.lastMessageTime) return 1;
            if (!b.lastMessageTime) return -1;
            return b.lastMessageTime - a.lastMessageTime;
        });
        
        // Update user list
        updateUserList(enhancedUsers);
    } catch (error) {
        console.error('Erro em loadUsers:', error);
    }
}

// Update the user list in the sidebar
function updateUserList(users) {
    const userListElement = document.getElementById('user-list');
    
    if (!users || users.length === 0) {
        userListElement.innerHTML = `
            <div class="no-users">
                <p>Nenhum usuário encontrado</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    users.forEach(user => {
        // Format last message time
        let timeString = '';
        if (user.lastMessageTime) {
            const now = new Date();
            const messageDate = user.lastMessageTime;
            
            if (now.toDateString() === messageDate.toDateString()) {
                // Today - show time
                timeString = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (now.getTime() - messageDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
                // Less than a week ago - show day name
                const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                timeString = days[messageDate.getDay()];
            } else {
                // More than a week ago - show date
                timeString = messageDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
            }
        }
        
        // Truncate long messages
        const lastMessagePreview = user.lastMessage ? 
            (user.lastMessage.length > 30 ? user.lastMessage.substring(0, 27) + '...' : user.lastMessage) : 
            'Clique para iniciar um chat';
        
        html += `
            <div class="user-item" data-username="${user.username}">
                <div class="user-avatar">
                    ${user.username.charAt(0).toUpperCase()}
                </div>
                <div class="user-info">
                    <div class="user-name-time">
                        <span class="user-name">${user.username}</span>
                        ${timeString ? `<span class="last-message-time">${timeString}</span>` : ''}
                    </div>
                    <div class="last-message">${lastMessagePreview}</div>
                </div>
            </div>
        `;
    });
    
    userListElement.innerHTML = html;
    
    // Add click event for each user
    document.querySelectorAll('.user-item').forEach(item => {
        item.addEventListener('click', function() {
            const username = this.dataset.username;
            selectUser(username);
        });
    });
}

// Select a user to chat with
function selectUser(username) {
    // Remove active class from all users
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected user
    const userItem = document.querySelector(`.user-item[data-username="${username}"]`);
    if (userItem) {
        userItem.classList.add('active');
    }
    
    // Store current chat user
    currentChatUser = username;
    
    // Update chat header
    document.getElementById('chat-header').innerHTML = `
        <h2>Chat com ${username}</h2>
    `;
    
    // Show chat input
    document.getElementById('chat-input-container').style.display = 'flex';
    
    // Load messages for this chat
    loadMessages(username);
    
    // Set up real-time updates for this chat
    setupMessagesSubscription(username);
}

// Search users
async function searchUsers() {
    const searchTerm = document.getElementById('user-search').value.trim().toLowerCase();
    
    if (!searchTerm) {
        // If empty, load all users
        await loadUsers();
        return;
    }
    
    try {
        const { data: users, error } = await supabase
            .from('Users')
            .select('username')
            .neq('username', currentUser)
            .ilike('username', `%${searchTerm}%`);
            
        if (error) {
            console.error('Erro ao buscar usuários:', error);
            return;
        }
        
        // Update user list with search results
        updateUserList(users);
    } catch (error) {
        console.error('Erro em searchUsers:', error);
    }
}

// Load messages for the selected chat
async function loadMessages(otherUser) {
    const messagesElement = document.getElementById('chat-messages');
    messagesElement.innerHTML = `
        <div class="loading-messages">
            <i class="fas fa-spinner fa-spin"></i> Carregando mensagens...
        </div>
    `;
    
    try {
        // Get messages where current user is either sender or receiver and other user is the opposite
        const { data: messages, error } = await supabase
            .from('chat_messages')
            .select('*')
            .or(`sender.eq.${currentUser},sender.eq.${otherUser}`)
            .or(`receiver.eq.${currentUser},receiver.eq.${otherUser}`)
            .order('created_at', { ascending: true });
            
        if (error) {
            console.error('Erro ao carregar mensagens:', error);
            messagesElement.innerHTML = `
                <div class="error-message">
                    <p>Não foi possível carregar as mensagens. Tente novamente.</p>
                    <button onclick="loadMessages('${otherUser}')" class="retry-button">
                        <i class="fas fa-redo"></i> Tentar novamente
                    </button>
                </div>
            `;
            return;
        }
        
        // Filter messages to only show those between these two users
        const filteredMessages = messages.filter(message => 
            (message.sender === currentUser && message.receiver === otherUser) ||
            (message.sender === otherUser && message.receiver === currentUser)
        );
        
        // Mark messages as read
        const unreadMessages = filteredMessages.filter(message => 
            message.sender === otherUser && 
            message.receiver === currentUser && 
            !message.read
        );
        
        if (unreadMessages.length > 0) {
            // Update messages to mark them as read
            const unreadIds = unreadMessages.map(msg => msg.id);
            
            // Update supabase data
            const { error: updateError } = await supabase
                .from('chat_messages')
                .update({ read: true })
                .in('id', unreadIds);
                
            if (updateError) {
                console.error('Erro ao marcar mensagens como lidas:', updateError);
            }
        }
        
        updateMessagesUI(filteredMessages);
        
        // After loading messages, also refresh the user list
        // to update the last message previews
        await loadUsers();
    } catch (error) {
        console.error('Erro em loadMessages:', error);
        messagesElement.innerHTML = `
            <div class="error-message">
                <p>Ocorreu um erro ao carregar as mensagens.</p>
                <button onclick="loadMessages('${otherUser}')" class="retry-button">
                    <i class="fas fa-redo"></i> Tentar novamente
                </button>
            </div>
        `;
    }
}

// Set up real-time updates for messages
function setupMessagesSubscription(otherUser) {
    // Unsubscribe from previous subscription if any
    if (messageSubscription) {
        messageSubscription.unsubscribe();
    }
    
    // Subscribe to new messages for this chat
    messageSubscription = supabase
        .channel('public:chat_messages')
        .on('postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'chat_messages' 
            },
            (payload) => {
                // Check if the message is relevant to this chat
                const message = payload.new;
                if ((message.sender === currentUser && message.receiver === otherUser) ||
                    (message.sender === otherUser && message.receiver === currentUser)) {
                    // When a new relevant message is inserted, reload all messages
                    loadMessages(otherUser);
                }
            }
        )
        .subscribe();
}

// Send a message
async function sendMessage() {
    if (!currentChatUser) return;
    
    const inputElement = document.getElementById('chat-input');
    const messageContent = inputElement.value.trim();
    
    if (!messageContent) return;
    
    // Clear input
    inputElement.value = '';
    
    // Create a temporary message ID to track this message
    const tempId = Date.now().toString();
    
    // Add message to UI immediately with "sending" state
    const messagesElement = document.getElementById('chat-messages');
    const tempMessageElement = document.createElement('div');
    tempMessageElement.classList.add('message', 'sent', 'message-sending');
    tempMessageElement.setAttribute('data-temp-id', tempId);
    
    tempMessageElement.innerHTML = `
        <div class="message-bubble">
            <div class="message-content">${messageContent}</div>
            <div class="message-time">Enviando...</div>
        </div>
        <div class="message-status"><i class="fas fa-circle-notch fa-spin"></i></div>
    `;
    messagesElement.appendChild(tempMessageElement);
    
    // Scroll to bottom
    messagesElement.scrollTop = messagesElement.scrollHeight;
    
    try {
        // Insert message into database
        const { data, error } = await supabase
            .from('chat_messages')
            .insert([
                {
                    sender: currentUser,
                    receiver: currentChatUser,
                    content: messageContent,
                    read: false
                }
            ])
            .select();
            
        if (error) {
            console.error('Erro ao enviar mensagem:', error);
            
            // Update UI to show error
            tempMessageElement.classList.remove('message-sending');
            tempMessageElement.classList.add('message-error');
            tempMessageElement.querySelector('.message-time').textContent = 'Erro ao enviar';
            tempMessageElement.querySelector('.message-status').innerHTML = '<i class="fas fa-exclamation-circle"></i>';
            
            // Add retry button
            const retryButton = document.createElement('button');
            retryButton.classList.add('message-retry-button');
            retryButton.innerHTML = '<i class="fas fa-redo"></i>';
            retryButton.addEventListener('click', () => {
                // Remove the failed message
                tempMessageElement.remove();
                
                // Put the message text back in the input field
                inputElement.value = messageContent;
                inputElement.focus();
            });
            
            tempMessageElement.querySelector('.message-bubble').appendChild(retryButton);
            return;
        }
        
        // Message was sent successfully, remove the temporary message
        // (it will be added back with the correct data via the subscription)
        loadMessages(currentChatUser);
    } catch (error) {
        console.error('Erro em sendMessage:', error);
        
        // Update UI to show error
        tempMessageElement.classList.remove('message-sending');
        tempMessageElement.classList.add('message-error');
        tempMessageElement.querySelector('.message-time').textContent = 'Erro ao enviar';
        tempMessageElement.querySelector('.message-status').innerHTML = '<i class="fas fa-exclamation-circle"></i>';
    }
}