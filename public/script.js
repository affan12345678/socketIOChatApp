const socket = io("http://localhost:3000");
const messageInput = document.getElementById("message-input");
const messageForm = document.getElementById("message-form");
const chatHistoryContainer = document.getElementById("chat-history");
const roomsContainer = document.getElementById("rooms-list");

if (messageForm != null) {
  let rememberMe = false;

  const userName =
    (rememberMe && (localStorage.getItem("socket-id") || prompt("name"))) ||
    prompt("name");

  rememberMe && localStorage.setItem("socket-id", userName);
  socket.emit("new-user", roomName, userName);

  messageForm.addEventListener("submit", sendMessage);

  function sendMessage(event) {
    event.preventDefault();
    const message = messageInput.value;
    if (!message) return;
    updateChatHistory(`${message}`);
    socket.emit("user-message", roomName, message);
    messageInput.value = "";
  }

  function updateChatHistory(data, fromServer = false) {
    if (!fromServer) {
      const userMessageElement = document.createElement("p");
      const userMessage = document.createElement("span");

      if (data.name && data.message) {
        userMessage.innerText = data.message;
        userMessageElement.classList.add(
          "received",
          "me-auto",
          "my-1",
          "d-flex",
          "flex-column"
        );
        userMessage.classList.add("px-3", "py-2", "bg-primary", "rounded");
        userMessageElement.append(userMessage);
        // userMessageElement.innerHTML = `${data.name}: ${data.message}`;

        if (chatHistoryContainer.lastChild.id === data.name) {
          chatHistoryContainer.lastChild.remove();
          const userNameElement = document.createElement("span");
          userNameElement.id = data.name;
          userNameElement.innerText = `${data.name}`;
          chatHistoryContainer.append(userMessageElement);
          chatHistoryContainer.append(userNameElement);
          return;
        } else {
          const userNameElement = document.createElement("span");
          userNameElement.id = data.name;
          userNameElement.innerText = `${data.name}`;
          chatHistoryContainer.append(userMessageElement);
          chatHistoryContainer.append(userNameElement);
          return;
        }
      } else {
        userMessageElement.innerHTML = data;
        userMessageElement.classList.add(
          "sent",
          "ms-auto",
          "px-3",
          "py-2",
          "bg-primary",
          "rounded"
        );
        chatHistoryContainer.append(userMessageElement);
        return;
      }
      // userMessageElement.innerHTML =
      //   data.name && data.message ? `${data.name} said: ${data.message}` : data;
      // chatHistoryContainer.append(userMessageElement);
    }
    if (fromServer) {
      const serverMessageElement = document.createElement("p");
      serverMessageElement.innerHTML = data;
      serverMessageElement.classList.add("server-message", "mx-auto");
      chatHistoryContainer.append(serverMessageElement);
      return;
    }
  }
}

/*
<button type="button"
  class="list-group-item list-group-item-action d-flex gap-1 justify-content-between">
  <span id="room-name" class="text-truncate">Lorem ipsum dolor sitconblanditiis?</span>
  <a href="#">Join</a>
</button>
*/

socket.on("room-created", (room) => {
  if (roomsContainer) {
    const roomElement = document.createElement("div");
    roomElement.classList = [
      "list-group-item",
      "list-group-item-action",
      "d-flex",
      "gap-1",
      "justify-content-between",
    ];
    roomElement.id = room;
    const roomNameElement = document.createElement("span");
    roomNameElement.classList.add("text-truncate");
    roomNameElement.innerText = room;

    const roomLink = document.createElement("a");
    roomLink.href = `/${room}`;
    roomLink.innerHTML = "Join";

    roomElement.append(roomNameElement);
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
socket.on("error", (errorData) => {
  //handle error
  console.log(errorData);
});

const toggleTheme = () => {
  const htmlElement = document.querySelector("html");
  const currentTheme = htmlElement.getAttribute("data-bs-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  htmlElement.setAttribute("data-bs-theme", newTheme);
  localStorage.setItem("chat-app-theme-preference", newTheme);
};

const savedTheme = localStorage.getItem("chat-app-theme-preference");
if (savedTheme) {
  document.querySelector("html").setAttribute("data-bs-theme", savedTheme);
}
