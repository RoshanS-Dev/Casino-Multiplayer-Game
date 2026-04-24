const socket = io();

let player = {};
let coins = 1000;
let roomCode = "";
let mode = "";

const diceIcons = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function enterGame() {
  const name = document.getElementById("playerName").value.trim();
  const gender = document.getElementById("gender").value;

  if (name === "" || gender === "") {
    alert("Please enter name and select gender");
    return;
  }

  player = { name, gender };

  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");

  document.getElementById("showName").innerText = name;
  document.getElementById("coins").innerText = coins;
}

function playWithBot() {
  mode = "bot";
  openGame("Mode: Playing With Bot");
}

function createRoom() {
  mode = "multi";
  socket.emit("createRoom", player);
}

function joinRoom() {
  const code = document.getElementById("roomInput").value.trim();

  if (code === "") {
    alert("Enter room code");
    return;
  }

  mode = "multi";
  roomCode = code.toUpperCase();

  socket.emit("joinRoom", {
    roomCode,
    player
  });
}

function openGame(title) {
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("gameScreen").classList.remove("hidden");

  document.getElementById("roomCodeText").innerText = title;
  document.getElementById("gameCoins").innerText = coins;
  document.getElementById("status").innerText = "Choose number, place bet, roll dice";

  resetDiceUI();
}

function playRound() {
  const choice = Number(document.getElementById("chosenNumber").value);
  const bet = Number(document.getElementById("betAmount").value);

  if (choice < 1 || choice > 12) {
    alert("Choose a number between 1 and 12");
    return;
  }

  if (bet <= 0) {
    alert("Enter valid bet amount");
    return;
  }

  if (bet > coins) {
    alert("Not enough coins");
    return;
  }

  animateDice();

  if (mode === "bot") {
    socket.emit("playBot", { choice, bet, coins });
  } else {
    socket.emit("playRound", { roomCode, choice, bet });
  }
}

function animateDice() {
  const d1 = document.getElementById("dice1");
  const d2 = document.getElementById("dice2");

  d1.classList.remove("roll-animation");
  d2.classList.remove("roll-animation");

  void d1.offsetWidth;
  void d2.offsetWidth;

  d1.classList.add("roll-animation");
  d2.classList.add("roll-animation");

  document.getElementById("status").innerText = "Rolling dice...";
}

function showDice(dice1, dice2, total) {
  setTimeout(() => {
    document.getElementById("dice1").innerText = diceIcons[dice1];
    document.getElementById("dice2").innerText = diceIcons[dice2];
    document.getElementById("diceTotal").innerText = total;
  }, 500);
}

function resetDiceUI() {
  document.getElementById("dice1").innerText = "⚀";
  document.getElementById("dice2").innerText = "⚀";
  document.getElementById("diceTotal").innerText = "0";
}

function goBack() {
  document.getElementById("gameScreen").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");

  document.getElementById("coins").innerText = coins;
}

socket.on("roomCreated", (data) => {
  roomCode = data.roomCode;
  openGame("Room Code: " + roomCode);
  document.getElementById("status").innerText = "Share this room code with your friend";
});

socket.on("roomUpdate", (room) => {
  openGame("Room Code: " + roomCode);
  document.getElementById("status").innerText =
    "Players joined: " + room.players.length + "/2";
});

socket.on("waiting", (msg) => {
  document.getElementById("status").innerText = msg;
});

socket.on("roundResult", (data) => {
  const me = data.players.find(p => p.name === player.name);

  if (!me) return;

  coins = me.coins;

  showDice(me.dice1, me.dice2, me.total);

  setTimeout(() => {
    document.getElementById("gameCoins").innerText = coins;
    document.getElementById("coins").innerText = coins;

    if (me.total === me.choice) {
      document.getElementById("status").innerText =
        `You won! Total ${me.total} matched your number ${me.choice}`;
    } else {
      document.getElementById("status").innerText =
        `You lost! Total was ${me.total}, your number was ${me.choice}`;
    }
  }, 650);
});

socket.on("botResult", (data) => {
  coins = data.coins;

  showDice(data.dice1, data.dice2, data.total);

  setTimeout(() => {
    document.getElementById("gameCoins").innerText = coins;
    document.getElementById("coins").innerText = coins;
    document.getElementById("status").innerText = data.message;
  }, 650);
});

socket.on("errorMessage", (msg) => {
  alert(msg);
});