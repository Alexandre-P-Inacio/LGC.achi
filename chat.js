// Initialize Supabase client
const supabaseUrl = 'https://pwsgmskiamkpzgtlaikm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c2dtc2tpYW1rcHpndGxhaWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzM5NzIsImV4cCI6MjA1OTk0OTk3Mn0.oYGnYIpOUteNha2V1EoyhgxDA1XFfzxTjY8jAbSyLmI';

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// === GLOBAL VARIABLES ===
let currentUser = localStorage.getItem('currentUser');
let currentChatUser = null;
let messageSubscription = null; // To store the current subscription
let lastMessageCheck = Date.now(); // For polling verification
let isEditing = null; // To control which message is being edited
let isRefreshing = localStorage.getItem('refreshState') === 'true'; // To control if refreshing after edit/delete

// === ON PAGE LOAD ===
document.addEventListener('DOMContentLoaded', async () => {
  if (!currentUser) {
    alert('User not authenticated.');
    window.location.href = 'login.html';
    return;
  }

  await loadUsers();
  
  // Set up real-time subscription
  setupRealTimeSubscription();
  
  // Set up a fallback with polling every 10 seconds
  startMessagePolling();

  // Message send event
  const form = document.getElementById('chat-input-form');
  if(form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await sendMessage();
    });
  }
  
  // Restore previous chat if it exists
  const lastChatUser = localStorage.getItem('lastChatUser');
  if (lastChatUser) {
    setTimeout(() => selectUser(lastChatUser), 300); // Shorter delay for faster loading
  }
  
  // If it was a refresh after edit/delete, clear the state for future loads
  if (isRefreshing) {
    localStorage.removeItem('refreshState');
    // Remove the loading animation
    document.documentElement.classList.add('no-transitions');
    
    // Remove the class after a brief period to allow future animations
    setTimeout(() => {
      document.documentElement.classList.remove('no-transitions');
    }, 1000);
  }
  
  // Listen for storage events to detect unread message updates from other tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'unreadMessagesUpdated') {
      // If on chat page, no need to update since we're already showing messages
      if (document.getElementById('chat-notification-dot') && 
        typeof checkUnreadMessages === 'function') {
        checkUnreadMessages();
      }
    }
  });
});

// === LOAD USERS ===
async function loadUsers() {
    const { data: users, error } = await supabaseClient
      .from('Users') // Make sure the 'Users' table exists and has the 'username' column
      .select('username');
  
    const list = document.getElementById('user-list');
    if (!list) {
        return;
    }
    list.innerHTML = ''; // Clear old list
  
    if (error) {
      list.innerHTML = `<div class="user-item-error">Error loading users.</div>`;
      return;
    }

    if (!users || users.length === 0) {
        list.innerHTML = `<div class="user-item-none">No users found.</div>`;
        return;
    }

    // Add a system notifications item at the top
    const systemDiv = document.createElement('div');
    systemDiv.className = 'user-item system-user';
    systemDiv.dataset.username = 'system';
    systemDiv.innerHTML = `
        <div class="user-avatar system-avatar"><i class="fas fa-bell"></i></div>
        <div class="user-info">
            <span class="user-name">Notifications</span>
            <span class="last-message-placeholder">System updates</span>
        </div>
    `;
    systemDiv.addEventListener('click', () => selectUser('system'));
    list.appendChild(systemDiv);

    // Check for unread system notifications
    checkForUnreadNotifications();

    // Filter the current user and show others
    users.filter(u => u.username !== currentUser).forEach(user => {
      const div = document.createElement('div');
      div.className = 'user-item';
      div.dataset.username = user.username;
      // Add avatar and name
      div.innerHTML = `
          <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
          <div class="user-info">
              <span class="user-name">${user.username}</span>
              <span class="last-message-placeholder" id="last-msg-${user.username}"></span>
          </div>
      `;
      div.addEventListener('click', () => selectUser(user.username));
      list.appendChild(div);
    });
}

// Check for unread system notifications
async function checkForUnreadNotifications() {
    if (!currentUser) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('chat_messages')
            .select('id')
            .eq('receiver', currentUser)
            .eq('sender', 'system')
            .eq('read', false)
            .limit(1);
            
        if (error) {
            console.error('Error checking for unread notifications:', error);
            return;
        }
        
        // If we have unread notifications, add the notification indicator
        if (data && data.length > 0) {
            const systemUserItem = document.querySelector('.system-user');
            if (systemUserItem) {
                systemUserItem.classList.add('has-notifications');
            }
        }
    } catch (e) {
        console.error('Exception checking for unread notifications:', e);
    }
}

// === SELECT USER FOR CHAT ===
async function selectUser(username) {
    if (currentChatUser === username) return; // Do nothing if already selected

    currentChatUser = username;

    // Update UI
    document.querySelectorAll('.user-item').forEach(item => item.classList.remove('active'));
    const userItem = document.querySelector(`.user-item[data-username="${username}"]`);
    if (userItem) {
        userItem.classList.add('active');
        
        // Remove notification indicator if it's the system user
        if (username === 'system') {
            userItem.classList.remove('has-notifications');
        }
    }

    const chatHeader = document.getElementById('chat-header');
    if (chatHeader) {
        if (username === 'system') {
            chatHeader.textContent = 'System Notifications';
        } else {
            chatHeader.textContent = `Chat with ${username}`;
        }
    }
    
    const messagesDiv = document.getElementById('chat-messages');
    if (messagesDiv) messagesDiv.innerHTML = '<p>Loading messages...</p>'; // Loading feedback
    
    const inputArea = document.querySelector('.chat-input-area');
    if (inputArea) {
        // Hide input area for system notifications, show for regular chats
        inputArea.style.display = username === 'system' ? 'none' : 'flex';
    }
    
    await loadMessages();
    
    // Store last selected user unless it's system
    if (username !== 'system') {
        localStorage.setItem('lastChatUser', username);
    }
}

// === LOAD MESSAGES ===
async function loadMessages() {
    if (!currentChatUser) return;
    const chat = document.getElementById('chat-messages');
    if (!chat) {
        return;
    }
    chat.innerHTML = ''; // Clear old messages

    // Define query based on whether we're viewing system notifications or regular chat
    let query;
    if (currentChatUser === 'system') {
        // Load only system notifications for the current user
        query = supabaseClient
            .from('chat_messages')
            .select('*')
            .eq('receiver', currentUser)
            .eq('sender', 'system')
            .order('created_at', { ascending: true });
    } else {
        // Load regular chat messages between users
        query = supabaseClient
            .from('chat_messages')
            .select('*')
            .or(`and(sender.eq.${currentUser},receiver.eq.${currentChatUser}),and(sender.eq.${currentChatUser},receiver.eq.${currentUser})`)
            .order('created_at', { ascending: true });
    }

    const { data: messages, error } = await query;

    if (error) {
        chat.innerHTML = `<p class="chat-error">Error loading messages.</p>`;
        console.error("Error loading messages:", error);
        return;
    }

    if (!messages || messages.length === 0) {
        if (currentChatUser === 'system') {
            chat.innerHTML = `<p class="chat-empty">No notifications yet.</p>`;
        } else {
            chat.innerHTML = `<p class="chat-empty">No messages yet. Start a conversation!</p>`;
        }
    } else {
        // Mark system notifications as read when viewed
        if (currentChatUser === 'system') {
            const unreadIds = messages.filter(msg => !msg.read).map(msg => msg.id);
            
            if (unreadIds.length > 0) {
                // Update read status
                supabaseClient
                    .from('chat_messages')
                    .update({ read: true })
                    .in('id', unreadIds)
                    .then(result => {
                        if (result.error) {
                            console.error("Error marking notifications as read:", result.error);
                        } else {
                            console.log(`${unreadIds.length} notifications marked as read`);
                            // Remove notification indicator
                            const systemUserItem = document.querySelector('.system-user');
                            if (systemUserItem) {
                                systemUserItem.classList.remove('has-notifications');
                            }
                            // Update navigation notification indicator
                            updateNavigationNotification();
                        }
                    });
            }
        } else {
            // Mark messages from current chat user as read
            const unreadIds = messages
                .filter(msg => !msg.read && msg.sender === currentChatUser && msg.receiver === currentUser)
                .map(msg => msg.id);
                
            if (unreadIds.length > 0) {
                // Update read status
                supabaseClient
                    .from('chat_messages')
                    .update({ read: true })
                    .in('id', unreadIds)
                    .then(result => {
                        if (result.error) {
                            console.error("Error marking messages as read:", result.error);
                        } else {
                            console.log(`${unreadIds.length} messages marked as read`);
                            // Update navigation notification indicator
                            updateNavigationNotification();
                        }
                    });
            }
        }
        
        messages.forEach(msg => showMessage(msg));
    }
    chat.scrollTop = chat.scrollHeight; // Scroll to the end
}

// === SHOW MESSAGE IN UI ===
function showMessage(msg) {
    const chat = document.getElementById('chat-messages');
    if (!chat) return;

    // Remove empty message if it exists
    const emptyMsg = chat.querySelector('.chat-empty');
    if(emptyMsg) emptyMsg.remove();

    // Check if message already exists (to avoid duplication)
    const existingMsg = document.querySelector(`.message[data-message-id="${msg.id}"]`);
    if (existingMsg) {
        // If message already exists, just update its content
        const contentDiv = existingMsg.querySelector('.message-content');
        if (contentDiv) {
            if (msg.is_deleted) {
                existingMsg.classList.add('deleted');
                contentDiv.textContent = 'This message was deleted.';
            } else {
                contentDiv.textContent = msg.content;
                if (msg.is_edited) {
                    // Add edited indicator if it doesn't exist
                    let editedTag = existingMsg.querySelector('.edited-tag');
                    if (!editedTag) {
                        editedTag = document.createElement('span');
                        editedTag.className = 'edited-tag';
                        editedTag.textContent = ' (edited)';
                        existingMsg.querySelector('.message-time').prepend(editedTag);
                    }
                }
            }
        }
        return;
    }

    const div = document.createElement('div');
    // Check if it's a system notification (sender is 'system')
    const isSystemNotification = msg.sender === 'system';
    
    // Make sure the CSS classes 'sent' and 'received' exist in chat.css
    if (isSystemNotification) {
        div.className = 'message system-notification';
        // If it has a project ID, add a specific class
        if (msg.project_id) {
            div.classList.add('project-notification');
        }
    } else {
        div.className = `message ${msg.sender === currentUser ? 'sent' : 'received'}`;
        if (msg.is_deleted) div.classList.add('deleted');
    }
    
    // Add attributes for possible future edit/delete
    div.dataset.messageId = msg.id;
    div.dataset.sender = msg.sender;

    // Sanitize content before inserting (VERY IMPORTANT for security)
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = msg.is_deleted ? 'This message was deleted.' : msg.content; // Using textContent prevents XSS

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    
    // Add edited indicator if necessary
    if (msg.is_edited && !msg.is_deleted) {
        const editedTag = document.createElement('span');
        editedTag.className = 'edited-tag';
        editedTag.textContent = ' (edited)';
        timeDiv.appendChild(editedTag);
    }
    
    timeDiv.appendChild(document.createTextNode(formatTime(msg.created_at)));

    div.appendChild(contentDiv);
    div.appendChild(timeDiv);
    
    // Add action buttons for project notifications
    if (isSystemNotification && msg.project_id) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'notification-actions';
        
        const viewButton = document.createElement('a');
        viewButton.className = 'notification-action-button';
        viewButton.href = `client-dashboard.html?project=${msg.project_id}`;
        viewButton.innerHTML = '<i class="fas fa-eye"></i> Ver Projeto';
        
        actionsDiv.appendChild(viewButton);
        div.appendChild(actionsDiv);
    }
    
    // Add action buttons (edit/delete) only for messages sent by the current user
    // and that aren't deleted or system notifications
    if (msg.sender === currentUser && !msg.is_deleted && !isSystemNotification) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        
        const editButton = document.createElement('button');
        editButton.className = 'message-action-button edit';
        editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editButton.addEventListener('click', () => startEditingMessage(msg.id));
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'message-action-button delete';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteButton.addEventListener('click', () => deleteMessage(msg.id));
        
        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);
        div.appendChild(actionsDiv);
    }
    
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight; // Scroll to the end
}

// === SEND MESSAGE ===
async function sendMessage() {
    // Get message content
    const messageInput = document.getElementById('chat-input');
    const content = messageInput.value.trim();
    
    // Check if content is not empty and we have a selected user
    if (!content || !currentChatUser) {
        if (!content) {
            messageInput.classList.add('error');
            setTimeout(() => messageInput.classList.remove('error'), 2000);
        }
        return;
    }
    
    // Clear input field immediately for better UX
    messageInput.value = '';
    
    try {
        // Add message to database
        const { data, error } = await supabaseClient
            .from('chat_messages')
            .insert([
                { 
                    sender: currentUser,
                    receiver: currentChatUser,
                    content: content
                }
            ]);
            
        if (error) {
            console.error('Error sending message:', error);
            alert('Error sending message. Please try again.');
            return;
        }
        
        console.log('Message sent successfully:', data);
        
        // Store the chat user for when we reload the page
        localStorage.setItem('lastChatUser', currentChatUser);
        
        // Indicate that we're doing a refresh after sending
        localStorage.setItem('refreshState', 'true');
        
        // Reload the page to show changes
        window.location.reload();
        
    } catch (e) {
        console.error('Exception sending message:', e);
        alert('An error occurred. Please try again.');
    }
}

// === SETUP REAL-TIME SUBSCRIPTION ===
function setupRealTimeSubscription() {
    const channelName = `chat-messages-${currentUser}`; // Name of the channel with username to avoid conflicts

    // Remove previous channel if it exists
    if (messageSubscription) {
        supabaseClient.removeChannel(messageSubscription);
        messageSubscription = null;
    }

    try {
        // Subscribe to messages where the current user is the receiver
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
                    setTimeout(setupRealTimeSubscription, 5000);
                }
            });
    } catch (error) {
        // Silently handle error
    }
}

// Function to handle new messages (both realtime and polling)
function handleNewMessage(msg) {
    // Update last check
    lastMessageCheck = Date.now();
    
    // Check if it's a system notification
    const isSystemNotification = msg.sender === 'system';
    
    // Store the sender as the current chat user if it's not a system notification
    if (!isSystemNotification) {
        localStorage.setItem('lastChatUser', msg.sender);
    }
    
    // If it's a system notification, mark the system user item
    if (isSystemNotification) {
        const systemUserItem = document.querySelector('.system-user');
        if (systemUserItem) {
            systemUserItem.classList.add('has-notifications');
        }
        
        // If we're viewing system notifications, show it immediately
        if (currentChatUser === 'system' && msg.receiver === currentUser) {
            showMessage(msg);
        } else {
            // Check if it's a project notification
            const isProjectNotification = msg.project_id != null;
            
            // Show appropriate toast notification
            if (isProjectNotification) {
                showToastNotification('Um projeto foi compartilhado com você!', true, msg.project_id);
            } else {
                showToastNotification('Nova notificação de sistema recebida!');
            }
        }
        
        // Update navigation notification indicator
        updateNavigationNotification();
    } else {
        // For regular messages, update notification and reload the page
        updateNavigationNotification();
        
        setTimeout(() => {
            window.location.reload();
        }, 100);
    }
}

// Function to show toast notification for new messages and system notifications
function showToastNotification(message, isProject = false, projectId = null) {
    // Remove any existing toast
    const existingToast = document.querySelector('.notification-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `notification-toast ${isProject ? 'project-toast' : ''}`;
    
    // Add content with appropriate icon
    let icon = isProject ? 'fa-folder-open' : 'fa-bell';
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    // Add view button for project notifications
    if (isProject && projectId) {
        const viewButton = document.createElement('a');
        viewButton.className = 'toast-action';
        viewButton.href = `client-dashboard.html?project=${projectId}`;
        viewButton.innerHTML = '<i class="fas fa-eye"></i> Ver';
        
        toast.appendChild(viewButton);
    }
    
    // Add to the document
    document.body.appendChild(toast);
    
    // Show the toast after a small delay (for animation)
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto-hide the toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 5000);
    
    // Play notification sound if available
    const notificationSound = document.getElementById('notification-sound');
    if (notificationSound) {
        notificationSound.play().catch(e => {
            // Silently fail if auto-play is blocked
            console.log('Notification sound could not be played:', e);
        });
    }
}

// Implement a polling fallback for realtime
function startMessagePolling() {
    // Check for new messages every 10 seconds
    setInterval(async () => {
        // Don't check if user was typing
        const inputActive = document.activeElement === document.getElementById('chat-input');
        if (inputActive) return;
        
        try {
            // Search for received messages after the last check
            const { data, error } = await supabaseClient
                .from('chat_messages')
                .select('*')
                .eq('receiver', currentUser)
                .gt('created_at', new Date(lastMessageCheck).toISOString())
                .order('created_at', { ascending: false })
                .limit(10); // Increased limit to catch system notifications too
                
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Process each message
                data.forEach(msg => {
                    handleNewMessage(msg);
                });
            }
        } catch (error) {
            // Silently handle error
            console.error("Polling error:", error);
        }
    }, 10000); // 10 seconds
}

// === FORMAT TIME ===
function formatTime(timestamp) {
    if (!timestamp) return '';
    try {
        const data = new Date(timestamp);
        // Format HH:MM
        return data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    } catch(e) {
        return '--:--';
    }
}

// === START EDITING MESSAGE ===
function startEditingMessage(messageId) {
    // If already editing another message, cancel editing
    if (isEditing) {
        cancelEditing();
    }
    
    isEditing = messageId;
    const messageElement = document.querySelector(`.message[data-message-id="${messageId}"]`);
    if (!messageElement) return;
    
    // Add editing class
    messageElement.classList.add('editing');
    
    // Get current message content
    const contentDiv = messageElement.querySelector('.message-content');
    const currentContent = contentDiv.textContent;
    
    // Create input for editing
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
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', () => saveMessageEdit(messageId, editInput.value));
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-button';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', cancelEditing);
    
    editActions.appendChild(cancelButton);
    editActions.appendChild(saveButton);
    
    editContainer.appendChild(editInput);
    editContainer.appendChild(editActions);
    
    // Replace content with edit form
    contentDiv.innerHTML = '';
    contentDiv.appendChild(editContainer);
    
    // Focus on input
    editInput.focus();
    
    // Allow saving with Enter
    editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveMessageEdit(messageId, editInput.value);
        }
    });
}

// === CANCEL EDITING MESSAGE ===
function cancelEditing() {
    if (!isEditing) return;
    
    const messageElement = document.querySelector(`.message[data-message-id="${isEditing}"]`);
    if (!messageElement) return;
    
    // Reload messages to restore original state
    messageElement.classList.remove('editing');
    isEditing = null;
    loadMessages();
}

// === SAVE EDITED MESSAGE ===
async function saveMessageEdit(messageId, newContent) {
    if (!newContent.trim()) {
        // Don't allow empty content
        return;
    }
    
    try {
        // Update message in database
        const { error } = await supabaseClient
            .from('chat_messages')
            .update({ 
                content: newContent,
                is_edited: true
            })
            .eq('id', messageId)
            .eq('sender', currentUser); // Ensure only the original user can edit their messages
        
        if (error) throw error;
        
        // Clear editing state
        isEditing = null;
        
        // Store the chat user for when we reload the page
        localStorage.setItem('lastChatUser', currentChatUser);
        
        // Indicate that we're doing a refresh after edit
        localStorage.setItem('refreshState', 'true');
        
        // Reload the page to show changes
        window.location.reload();
        
    } catch (error) {
        // Show error to user
        const errorToast = document.createElement('div');
        errorToast.className = 'error-toast';
        errorToast.innerText = 'Error editing message. Please try again.';
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

// === DELETE MESSAGE ===
async function deleteMessage(messageId) {
    // Confirm before deleting
    if (!confirm('Are you sure you want to delete this message?')) {
        return;
    }
    
    try {
        // Mark message as deleted in database
        const { error } = await supabaseClient
            .from('chat_messages')
            .update({ is_deleted: true })
            .eq('id', messageId)
            .eq('sender', currentUser); // Ensure only the original user can delete their messages
        
        if (error) throw error;
        
        // Store the chat user for when we reload the page
        localStorage.setItem('lastChatUser', currentChatUser);
        
        // Indicate that we're doing a refresh after deletion
        localStorage.setItem('refreshState', 'true');
        
        // Reload the page to show changes
        window.location.reload();
        
    } catch (error) {
        // Show error to user
        const errorToast = document.createElement('div');
        errorToast.className = 'error-toast';
        errorToast.innerText = 'Error deleting message. Please try again.';
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

// === SEND SYSTEM NOTIFICATION ===
async function sendSystemNotification(receiver, content, projectId = null) {
    try {
        // Add system notification to database
        const { data, error } = await supabaseClient
            .from('chat_messages')
            .insert([
                { 
                    sender: 'system',  // Using 'system' as the sender for notifications
                    receiver: receiver,
                    content: content,
                    project_id: projectId,
                    read: false
                }
            ]);
            
        if (error) {
            console.error('Error sending system notification:', error);
            return false;
        }
        
        console.log('System notification sent successfully:', data);
        return true;
        
    } catch (e) {
        console.error('Exception sending system notification:', e);
        return false;
    }
}

// Function to update the navigation notification indicator
function updateNavigationNotification() {
    // If in this window, try to update directly
    if (document.getElementById('fixed-chat-notification')) {
        // Check if checkUnreadMessages function exists (from navigation.js)
        if (typeof checkUnreadMessages === 'function') {
            checkUnreadMessages();
        }
    }
    
    // Set a flag in localStorage to tell other tabs to update
    localStorage.setItem('unreadMessagesUpdated', Date.now().toString());
}
