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
    chatHistoryContainer.lastChild.scrollIntoView({
      behaviour: "smooth",
    });
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
        if (chatHistoryContainer.lastChild.id === data.name) {
          chatHistoryContainer.lastChild.remove();
          const userNameElement = document.createElement("span");
          userNameElement.id = data.name;
          userNameElement.innerText = `${data.name}`;
          chatHistoryContainer.append(userMessageElement);
          chatHistoryContainer.append(userNameElement);
          chatHistoryContainer.lastChild.scrollIntoView({
            behaviour: "smooth",
          });
          return;
        } else {
          const userNameElement = document.createElement("span");
          userNameElement.id = data.name;
          userNameElement.classList.add("align-self-start", "mb-3");
          userNameElement.innerText = `${data.name}`;
          chatHistoryContainer.append(userMessageElement);
          chatHistoryContainer.append(userNameElement);
          chatHistoryContainer.lastChild.scrollIntoView({
            behaviour: "smooth",
          });
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
        chatHistoryContainer.lastChild.scrollIntoView({ behaviour: "smooth" });
        return;
      }
    }
    if (fromServer) {
      const serverMessageElement = document.createElement("p");
      serverMessageElement.innerHTML = data;
      serverMessageElement.classList.add("server-message", "mx-auto", "mb-3");
      chatHistoryContainer.append(serverMessageElement);
      chatHistoryContainer.lastChild.scrollIntoView({ behaviour: "smooth" });
      return;
    }
  }
}

socket.on("room-created", (room) => {
  if (roomsContainer) {
    const roomElement = document.createElement("button");
    roomElement.type = "button";
    roomElement.id = room;
    roomElement.classList.add(
      "list-group-item",
      "list-group-item-action",
      "d-flex",
      "gap-1",
      "justify-content-between",
      "px-2"
    );
    const roomNameElement = document.createElement("span");
    roomNameElement.classList.add("text-truncate");
    roomNameElement.innerText = room;

    const div = document.createElement("div");
    div.classList.add("d-flex", "px-1", "gap-3", "align-items-center");

    const noOfUsersElement = document.createElement("span");
    noOfUsersElement.classList.add("badge", "text-bg-secondary");
    noOfUsersElement.id = `no-of-users-in-${room}`;

    const roomLink = document.createElement("a");
    roomLink.href = `/${room}`;
    roomLink.innerHTML = "Join";

    roomElement.append(roomNameElement);
    div.append(noOfUsersElement, roomLink);
    roomElement.append(div);
    roomsContainer.append(roomElement);
  }
});
socket.on("room-deleted", (room) => {
  if (roomsContainer) {
    const roomElement = roomsContainer.querySelector(`#${room}`);
    roomElement.remove();
  }
});

socket.on("new-user-connected", updateChatHistory);
socket.on("user-message", updateChatHistory);
socket.on("user-disconnected", updateChatHistory);
socket.on("error", (errorData) => {
  //handle error
  console.log(errorData);
});
socket.on("updateRooms", (rooms) => {
  Object.keys(rooms).forEach((room) => {
    if (roomsContainer.querySelector(`#no-of-users-in-${room}`)) {
      roomsContainer.querySelector(`#no-of-users-in-${room}`).innerText =
        Object.keys(rooms[room][Object.keys(rooms[room])]).length;
    }
  });
});

const setTheme = (theme) => {
  const htmlElement = document.querySelector("html");
  const currentTheme = htmlElement.getAttribute("data-bs-theme");
  if (currentTheme === theme) return;
  htmlElement.setAttribute("data-bs-theme", theme);
  document.querySelector(`#light-theme-button`).classList.remove("active") ||
    document
      .querySelector(`#${currentTheme}-theme-button`)
      ?.classList.remove("active");
  document.querySelector(`#${theme}-theme-button`).classList.add("active");
  document.querySelector(`#theme-dd-toggle`).innerText = `${theme}`;
  localStorage.setItem("chat-app-theme-preference", theme);
};

const savedTheme = localStorage.getItem("chat-app-theme-preference");
if (savedTheme) {
  document.querySelector("html").setAttribute("data-bs-theme", savedTheme);
  document.querySelector(`#${savedTheme}-theme-button`).classList.add("active");
  document.querySelector(`#theme-dd-toggle`).innerText = `${savedTheme}`;
} else {
  document.querySelector(`#light-theme-button`).classList.add("active");
  document.querySelector(`#theme-dd-toggle`).innerText = "light";
}
