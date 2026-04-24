const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function calculateResult(choice, bet, coins) {
  const dice1 = rollDice();
  const dice2 = rollDice();
  const total = dice1 + dice2;

  let newCoins = coins;
  let message = "";

  if (total === choice) {
    const winAmount = bet * 5;
    newCoins += winAmount;
    message = `You won ${winAmount} coins! Dice total matched ${choice}`;
  } else {
    newCoins -= bet;
    message = `You lost ${bet} coins! Dice total was ${total}`;
  }

  return { dice1, dice2, total, coins: newCoins, message };
}

io.on("connection", (socket) => {
  socket.on("createRoom", (player) => {
    const roomCode = generateRoomCode();

    rooms[roomCode] = {
      players: [
        {
          id: socket.id,
          name: player.name,
          gender: player.gender,
          coins: 1000,
          choice: 0,
          bet: 0,
          dice1: 0,
          dice2: 0,
          total: 0,
          played: false
        }
      ]
    };

    socket.join(roomCode);
    socket.emit("roomCreated", { roomCode });
  });

  socket.on("joinRoom", ({ roomCode, player }) => {
    roomCode = roomCode.toUpperCase();

    if (!rooms[roomCode]) {
      socket.emit("errorMessage", "Room not found!");
      return;
    }

    if (rooms[roomCode].players.length >= 2) {
      socket.emit("errorMessage", "Room is full!");
      return;
    }

    rooms[roomCode].players.push({
      id: socket.id,
      name: player.name,
      gender: player.gender,
      coins: 1000,
      choice: 0,
      bet: 0,
      dice1: 0,
      dice2: 0,
      total: 0,
      played: false
    });

    socket.join(roomCode);
    io.to(roomCode).emit("roomUpdate", rooms[roomCode]);
  });

  socket.on("playBot", ({ choice, bet, coins }) => {
    if (choice < 1 || choice > 12) {
      socket.emit("errorMessage", "Choose a number between 1 and 12");
      return;
    }

    if (bet <= 0 || bet > coins) {
      socket.emit("errorMessage", "Invalid bet amount!");
      return;
    }

    const result = calculateResult(choice, bet, coins);
    socket.emit("botResult", result);
  });

  socket.on("playRound", ({ roomCode, choice, bet }) => {
    const room = rooms[roomCode];

    if (!room) {
      socket.emit("errorMessage", "Room not found!");
      return;
    }

    if (room.players.length < 2) {
      socket.emit("errorMessage", "Waiting for opponent...");
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    if (choice < 1 || choice > 12) {
      socket.emit("errorMessage", "Choose a number between 1 and 12");
      return;
    }

    if (bet <= 0 || bet > player.coins) {
      socket.emit("errorMessage", "Invalid bet amount!");
      return;
    }

    const result = calculateResult(choice, bet, player.coins);

    player.choice = choice;
    player.bet = bet;
    player.dice1 = result.dice1;
    player.dice2 = result.dice2;
    player.total = result.total;
    player.coins = result.coins;
    player.played = true;

    socket.emit("waiting", "Waiting for opponent to roll...");

    const allPlayed = room.players.every(p => p.played);

    if (allPlayed) {
      io.to(roomCode).emit("roundResult", {
        players: room.players
      });

      room.players.forEach(p => {
        p.choice = 0;
        p.bet = 0;
        p.dice1 = 0;
        p.dice2 = 0;
        p.total = 0;
        p.played = false;
      });
    }
  });

  socket.on("disconnect", () => {
    for (let code in rooms) {
      rooms[code].players = rooms[code].players.filter(p => p.id !== socket.id);

      if (rooms[code].players.length === 0) {
        delete rooms[code];
      } else {
        io.to(code).emit("roomUpdate", rooms[code]);
      }
    }
  });
});

server.listen(4000, () => {
  console.log("Server running: http://localhost:4000");
});