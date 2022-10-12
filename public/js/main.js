const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and rooms from URL
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', {username, room});

// get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});

// Messages from the server
socket.on('user-notifications', notification => {
    // console.log(notification);
    outputNotifications(notification);

    // Scroll down to see new messages
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Messages from the server users
socket.on('message', message => {
    // console.log(message);
    outputMessage(message);

    // Scroll down to see new messages
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // make message text variable
    const msg = e.target.elements.msg.value;

    // emit text message to users
    socket.emit('chatMessage', msg);

    // clearing the text input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output notifications to the DOM
function outputNotifications(notification){
    const div = document.createElement('div');
    div.classList.add('chat-notifications');
    div.innerHTML = `
                <p class="text">
                   ${notification}
                </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

// Output the messages to the DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
                <p class="meta">${message.username} <span>${message.time}</span></p>
				<p class="text">
					${message.text}
				</p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

// add rom name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

// add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}
