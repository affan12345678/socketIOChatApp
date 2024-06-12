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
  res.render("chat", { room: req.params.room, rooms: rooms });
});

server.listen(3000);

io.on("connection", (socket) => {
  socket.on("new-user", (room, userName) => {
    if (!rooms[room]) {
      socket.emit("error", `Room ${room} does not exist`);
      return;
    }

    if (!userName) {
      userName = generateRandomName();
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

  socket.on("disconnect", () => {
    const userRooms = getUserRooms(socket);
    userRooms.forEach((room) => {
      const message = `${rooms[room].users[socket.id].name} left the chat`;
      socket.to(room).emit("user-disconnected", message, true);
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

function generateRandomName() {
  const adjectives = [
    "Autumn",
    "Hidden",
    "Bitter",
    "Misty",
    "Silent",
    "Empty",
    "Dry",
    "Dark",
    "Summer",
    "Icy",
    "Delicate",
    "Quiet",
    "White",
    "Cool",
    "Spring",
    "Winter",
    "Patient",
    "Twilight",
    "Dawn",
    "Crimson",
    "Wispy",
    "Weathered",
    "Blue",
    "Billowing",
    "Broken",
    "Cold",
    "Damp",
    "Falling",
    "Frosty",
    "Green",
    "Long",
    "Late",
    "Lingering",
    "Bold",
    "Little",
    "Morning",
    "Muddy",
    "Old",
    "Red",
    "Rough",
    "Still",
    "Small",
    "Sparkling",
    "Wandering",
    "Withered",
    "Wild",
    "Black",
    "Young",
    "Holy",
    "Solitary",
    "Fragrant",
    "Aged",
    "Snowy",
    "Proud",
    "Floral",
    "Restless",
    "Divine",
    "Polished",
    "Ancient",
    "Purple",
    "Lively",
    "Nameless",
    "Gentle",
    "Radiant",
    "Stormy",
    "Majestic",
    "Bright",
    "Golden",
    "Shimmering",
    "Mysterious",
    "Ethereal",
    "Enchanted",
    "Vibrant",
    "Serene",
    "Glorious",
    "Melancholic",
    "Graceful",
    "Fierce",
    "Blazing",
    "Mystic",
    "Whimsical",
    "Verdant",
    "Luminous",
    "Celestial",
    "Timeless",
    "Glimmering",
    "Charming",
    "Fiery",
    "Regal",
    "Enigmatic",
    "Crisp",
    "Harmonious",
    "Happy",
    "Sad",
    "Joyful",
    "Sorrowful",
    "Angry",
    "Peaceful",
    "Hopeful",
    "Anxious",
    "Content",
    "Fearful",
    "Euphoric",
    "Desperate",
    "Ecstatic",
    "Lonely",
    "Cheerful",
    "Depressed",
    "Excited",
    "Calm",
    "Tense",
    "Serene",
    "Frustrated",
  ];

  const nouns = [
    "Waterfall",
    "River",
    "Breeze",
    "Moon",
    "Rain",
    "Wind",
    "Sea",
    "Morning",
    "Snow",
    "Lake",
    "Sunset",
    "Pine",
    "Shadow",
    "Leaf",
    "Dawn",
    "Glitter",
    "Forest",
    "Hill",
    "Cloud",
    "Meadow",
    "Sun",
    "Glade",
    "Bird",
    "Brook",
    "Butterfly",
    "Bush",
    "Dew",
    "Dust",
    "Field",
    "Fire",
    "Flower",
    "Firefly",
    "Feather",
    "Grass",
    "Haze",
    "Mountain",
    "Night",
    "Pond",
    "Darkness",
    "Snowflake",
    "Silence",
    "Sound",
    "Sky",
    "Shape",
    "Surf",
    "Thunder",
    "Violet",
    "Water",
    "Wildflower",
    "Wave",
    "Resonance",
    "Sun",
    "Wood",
    "Dream",
    "Cherry",
    "Tree",
    "Fog",
    "Frost",
    "Voice",
    "Paper",
    "Frog",
    "Smoke",
    "Star",
    "Galaxy",
    "Whisper",
    "Pebble",
    "Moss",
    "Canyon",
    "Valley",
    "Blossom",
    "Aurora",
    "Echo",
    "Twilight",
    "Boulder",
    "Harbor",
    "Tide",
    "Aurora",
    "Icicle",
    "Petal",
    "Rainstorm",
    "Drift",
    "Lighthouse",
    "Grove",
    "Riverbank",
    "Shore",
    "Crescent",
    "Ember",
    "Zephyr",
    "Mirage",
    "Constellation",
    "Tempest",
    "Glacier",
    "Mirage",
    "Quarry",
    "Lagoon",
    "Vista",
    "Serenade",
    "Eclipse",
    "Labyrinth",
    "Cove",
    "Crescent",
    "Meander",
    "Cavern",
    "Meadow",
    "Fjord",
    "Sanctuary",
    "Wilderness",
    "Clearing",
    "Glimmer",
    "Oasis",
    "Savannah",
    "Cove",
    "Prairie",
    "Estuary",
    "Thicket",
    "Grove",
    "Brook",
    "Harbor",
    "Geyser",
    "Summit",
    "Range",
    "Plateau",
    "Stream",
  ];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return adjective + noun;
}
