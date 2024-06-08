const socket = io();
const messageInput = document.getElementById("message-input");
const messageForm = document.getElementById("message-form");
const chatHistoryContainer = document.getElementById("chat-history");
const roomsContainer = document.getElementById("rooms-list");

if (messageForm != null) {
  let rememberMe = false;

  const userName =
    (rememberMe && (localStorage.getItem("socket-id") || prompt("name"))) ||
    prompt("name");

  // const userName = localStorage.getItem("socket-id") || prompt("name");

  rememberMe && localStorage.setItem("socket-id", userName);
  socket.emit("new-user", roomName, userName);

  messageForm.addEventListener("submit", sendMessage);

  function sendMessage(event) {
    event.preventDefault();
    const message = messageInput.value;
    if (!message) return;
    updateChatHistory(`you said: ${message}`);
    socket.emit("user-message", roomName, message);
    messageInput.value = "";
  }

  function updateChatHistory(data, fromServer = false) {
    //set fromServer in server.js
    if (!fromServer) {
      const userMessageElement = document.createElement("p");

      if (data.name && data.message) {
        userMessageElement.innerHTML = `${data.name} said: ${data.message}`;
        userMessageElement.classList.add("incoming-message");
        chatHistoryContainer.append(userMessageElement);
        return;
      } else {
        userMessageElement.innerHTML = data;
        userMessageElement.classList.add("outgoing-message");
        chatHistoryContainer.append(userMessageElement);
      }
      // userMessageElement.innerHTML =
      //   data.name && data.message ? `${data.name} said: ${data.message}` : data;
      // chatHistoryContainer.append(userMessageElement);
    }
    if (fromServer) {
      const serverMessageElement = document.createElement("p");
      serverMessageElement.innerHTML = data;
      serverMessageElement.classList.add("server-message");
      chatHistoryContainer.append(serverMessageElement);
    }
  }
}

socket.on("room-created", (room) => {
  if (roomsContainer) {
    const roomElement = document.createElement("div");
    roomElement.id = room;
    roomElement.innerText = room;
    const roomLink = document.createElement("a");
    roomLink.href = `/${room}`;
    roomLink.innerHTML = "Join";

    roomElement.append(roomLink);
    roomsContainer.append(roomElement);
  }
});
socket.on("room-deleted", (room) => {
  if (roomsContainer) {
    roomsContainer.querySelector(`#${room}`).remove();
  }
});

socket.on("new-user-connected", updateChatHistory);
socket.on("user-message", updateChatHistory);
socket.on("user-disconnected", updateChatHistory);
