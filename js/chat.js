document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const user = getUser();
  const currentUserId = user._id || user.id;
  const socket = io(window.HJ_CONFIG ? window.HJ_CONFIG.SOCKET_URL : 'http://localhost:5000', {
    transports: ['websocket', 'polling'] // Force websocket with polling fallback
  });

  socket.on('connect', () => console.log('✅ Chat Socket Connected:', socket.id));
  socket.on('connect_error', (err) => console.error('❌ Chat Socket Error:', err));
  socket.on('disconnect', (reason) => console.warn('⚠️ Chat Socket Disconnected:', reason));
  
  let activeContact = null;
  let allOtherUsers = [];

  const contactsList = document.querySelector('.contacts-list');
  const messagesScroller = document.querySelector('.messages-scroller');
  const chatHeaderName = document.querySelector('.chat-user-meta h3');
  const chatHeaderAvatar = document.querySelector('.chat-user-info .avatar');
  const messageInput = document.querySelector('.floating-input input');
  const sendBtn = document.querySelector('.send-trigger');
  
  const searchInput = document.getElementById('search-conversations');
  const attachmentTrigger = document.getElementById('attachment-trigger');
  const photoUpload = document.getElementById('photo-upload');

  if (!contactsList || !messagesScroller) return;

  socket.emit('register', currentUserId);

  async function loadContacts() {
    contactsList.innerHTML = '<div style="padding:1.5rem; text-align:center; color:#999; font-size:0.8rem;">Searching for contacts...</div>';
    
    try {
      const allUsers = await apiFetch('/users');
      allOtherUsers = allUsers.filter(u => (u._id || u.id) !== currentUserId);
      
      if (allOtherUsers.length === 0) {
        contactsList.innerHTML = '<div style="padding:1.5rem; text-align:center; color:#999; font-size:0.8rem;">No other users found. Invite someone to start chatting!</div>';
        return;
      }

      renderContacts(allOtherUsers);

      // Deep Linking or Auto-select
      const urlParams = new URLSearchParams(window.location.search);
      const deepLinkUserId = urlParams.get('userId');
      if (deepLinkUserId) {
        const contactToSelect = allOtherUsers.find(u => (u._id || u.id) === deepLinkUserId);
        if (contactToSelect) selectContact(contactToSelect);
      } else if (allOtherUsers.length > 0) {
        // Optional: Auto-select first contact if no one is selected
        // selectContact(allOtherUsers[0]); 
      }
    } catch (err) {
      console.error(err);
      contactsList.innerHTML = '<div style="padding:1.5rem; text-align:center; color:red; font-size:0.8rem;">Failed to load contacts.</div>';
    }
  }

  function renderContacts(users) {
    contactsList.innerHTML = '';
    users.forEach(contact => {
      const contactId = contact._id || contact.id;
      const displayName = contact.name && contact.name.toLowerCase() !== 'google' ? contact.name : contact.email.split('@')[0];
      const initials = displayName.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase().substring(0, 2);
      
      const item = document.createElement('div');
      item.className = 'contact-item';
      item.dataset.id = contactId;
      if (activeContact && (activeContact._id || activeContact.id) === contactId) {
        item.classList.add('active');
      }
      item.innerHTML = `
        <div class="avatar-wrapper">
          <div class="avatar" style="background:#000; color:#EFFF00; font-size:0.8rem; font-weight:700; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">${initials || '?'}</div>
        </div>
        <div class="contact-info">
          <div class="name-row">
            <h4>${displayName}</h4>
            <span class="role-tag" style="font-size:0.6rem; color:#999; text-transform:uppercase;">${contact.role || 'USER'}</span>
          </div>
        </div>
      `;
      item.onclick = () => selectContact(contact);
      contactsList.appendChild(item);
    });
  }

  async function selectContact(contact) {
    activeContact = contact;
    const contactId = contact._id || contact.id;
    const displayName = contact.name && contact.name.toLowerCase() !== 'google' ? contact.name : contact.email.split('@')[0];
    const initials = displayName.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase().substring(0, 2);

    if (chatHeaderName) chatHeaderName.textContent = displayName;
    if (chatHeaderAvatar) chatHeaderAvatar.textContent = initials || '?';
    
    document.querySelectorAll('.contact-item').forEach(i => {
       i.classList.remove('active');
       if (i.dataset.id === contactId) i.classList.add('active');
    });

    messagesScroller.innerHTML = '<div style="padding:2rem; text-align:center; color:#999; font-size:0.8rem;">Loading messages...</div>';
    try {
      const messages = await apiFetch(`/messages/${currentUserId}/${contactId}`);
      renderMessages(messages);
    } catch (err) {
      console.error(err);
      messagesScroller.innerHTML = '<div style="padding:2rem; text-align:center; color:red; font-size:0.8rem;">Failed to load chat history.</div>';
    }
  }

  function renderMessages(messages) {
    messagesScroller.innerHTML = '';
    if (messages.length === 0) {
      messagesScroller.innerHTML = '<div style="padding:4rem 2rem; text-align:center; color:#999; font-size:0.85rem;">No messages yet. Send a greeting to start the conversation!</div>';
      return;
    }
    messages.forEach(addMessageToUI);
  }

  function addMessageToUI(msg) {
    const senderId = typeof msg.sender === 'object' ? (msg.sender._id || msg.sender.id) : msg.sender;
    const isMe = senderId === currentUserId;
    
    const node = document.createElement('div');
    node.className = `message ${isMe ? 'me' : 'them'}`;
    
    let contentHtml = `<p>${msg.text}</p>`;
    if (msg.imageUrl) {
      contentHtml += `<img src="${msg.imageUrl}" style="max-width:200px; border-radius:8px; margin-top:0.5rem; display:block;">`;
    }

    node.innerHTML = `
      <div class="bubble">
        ${contentHtml}
      </div>
      <span class="msg-meta">${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    `;
    messagesScroller.appendChild(node);
    scrollToBottom();
  }

  function scrollToBottom() { messagesScroller.scrollTop = messagesScroller.scrollHeight; }

  function sendMessage(text = '', imageUrl = '') {
    const msgText = text || messageInput.value.trim();
    
    if (!activeContact) {
      alert('Please select a contact from the sidebar first.');
      console.warn('Cannot send message: no active contact selected');
      return;
    }
    
    if (!msgText && !imageUrl) {
      return; // Do nothing for completely empty messages
    }
    
    const contactId = activeContact._id || activeContact.id;
    console.log('Emitting sendMessage:', { senderId: currentUserId, receiverId: contactId, text: msgText });
    socket.emit('sendMessage', { senderId: currentUserId, receiverId: contactId, text: msgText, imageUrl: imageUrl });
    messageInput.value = '';
  }

  if (sendBtn) sendBtn.onclick = () => sendMessage();
  if (messageInput) messageInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

  // Search Logic
  if (searchInput) {
    searchInput.oninput = (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = allOtherUsers.filter(u => 
        (u.name && u.name.toLowerCase().includes(term)) || 
        (u.email && u.email.toLowerCase().includes(term))
      );
      renderContacts(filtered);
    };
  }

  // Upload Photo
  if (attachmentTrigger) attachmentTrigger.onclick = () => photoUpload.click();
  if (photoUpload) {
    photoUpload.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const formData = new FormData();
      formData.append('image', file);
      
      try {
        const res = await apiFetch('/messages/upload', {
          method: 'POST',
          body: formData,
          headers: {} // apiFetch will handle it if we pass body as FormData
        });
        sendMessage('', res.imageUrl);
      } catch (err) {
        alert('Image upload failed');
        console.error(err);
      }
    };
  }

  socket.on('newMessage', (msg) => {
    console.log('Incoming newMessage:', msg);
    const senderId = typeof msg.sender === 'object' ? (msg.sender._id || msg.sender.id) : msg.sender;
    const activeId = activeContact ? (activeContact._id || activeContact.id) : null;
    if (activeId === senderId) {
      addMessageToUI(msg);
    }
    // Update contact list to show last message (optional enhancement)
  });

  socket.on('messageSent', (msg) => {
    console.log('Confirmation messageSent:', msg);
    addMessageToUI(msg);
  });

  socket.on('messageError', (data) => {
    console.error('Message Error:', data);
    alert('Failed to send message: ' + (data.error || 'Unknown error'));
  });
  
  socket.on('error', (err) => console.error('Socket Global Error:', err));
  
  loadContacts();
});
