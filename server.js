const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const rooms = {};

app.get("/", (req, res) => {
  res.render("index", { rooms: rooms });
});

app.post("/room", (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect("/");
  }
  rooms[req.body.room] = { users: {} };
  res.redirect(req.body.room);
  io.emit("room-created", req.body.room);
});

app.get("/:room", (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect("/");
  }
  res.render("chat", { room: req.params.room });
});

server.listen(3000);

io.on("connection", (socket) => {
  socket.on("new-user", (room, userName) => {
    if (!userName) {
      userName = "guest";
    }
    rooms[room].users[socket.id] = { name: userName };
    socket.join(room);
    socket.broadcast
      .to(room)
      .emit(
        "new-user-connected",
        `${userName} joined the chat`,
        (fromServer = true)
      );
  });

  socket.on("user-message", (room, message) => {
    if (!message || !rooms[room] || !rooms[room].users[socket.id]) return;
    const userMessage = `${message}`;
    socket.broadcast.to(room).emit("user-message", {
      message: userMessage,
      name: rooms[room].users[socket.id].name,
    });
  });

  socket.on("disconnecting", () => {
    // Any code needed before disconnecting, if necessary
  });

  socket.on("disconnect", () => {
    const userRooms = getUserRooms(socket);
    userRooms.forEach((room) => {
      const message = `${rooms[room].users[socket.id].name} left the chat`;
      socket.to(room).emit("user-disconnected", message);
      delete rooms[room].users[socket.id];

      // Check if the room is empty and delete it
      if (Object.keys(rooms[room].users).length === 0) {
        delete rooms[room];
        io.emit("room-deleted", room);
      }
    });
  });
});

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name);
    return names;
  }, []);
}
