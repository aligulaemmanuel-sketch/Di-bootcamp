const socket = io();

const loginForm = document.getElementById('login-form');
const chatContainer = document.getElementById('chat-container');
const messageForm = document.getElementById('message-form');
const messages = document.getElementById('messages');
const userList = document.getElementById('users');

let currentUser = "";

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    currentUser = document.getElementById('username').value;
    const room = document.getElementById('room').value;

    document.getElementById('login-screen').style.display = 'none';
    chatContainer.style.display = 'flex';

    socket.emit('join-room', { username: currentUser, room });
});

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('msg-input');
    if (input.value) {
        socket.emit('chat-message', input.value);
        input.value = '';
    }
});

socket.on('message', (data) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<strong>${data.user}:</strong> ${data.text}`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;

    // Browser Notification
    if (data.user !== currentUser && data.user !== 'System') {
        new Notification(`New message from ${data.user}`);
    }
});

socket.on('user-list', (users) => {
    userList.innerHTML = users.map(u => `<li>${u}</li>`).join('');
});

// Request notification permission
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}