# 🎲 Dice Casino Royale (Multiplayer)

A real-time **online multiplayer casino game** built using **Node.js, Socket.IO, HTML, CSS, and JavaScript**.

Players can either compete against a **bot** or play with friends using a **room code system**. The game uses a virtual coin system and dice-based betting logic.

---

## 🚀 Features

- 🎮 Play with Bot (Single Player Mode)
- 🌐 Real-time Multiplayer (Room Code System)
- 🎲 Dice-based betting (Choose number 1–12)
- 💰 Virtual coin system
- ⚡ Live updates using Socket.IO
- 🎨 Modern casino-style UI (glassmorphism + animations)

---

## 🕹️ Game Rules

1. Player selects a number between **1 and 12**
2. Enters a **bet amount**
3. Two dice are rolled 🎲🎲
4. If the total matches chosen number:
   - Player wins **5× bet**
5. Otherwise:
   - Player loses bet amount

---

## 🧠 Multiplayer Flow

1. Player 1 creates a room → gets a **room code**
2. Player 2 joins using the same code
3. Both players place bets and choose numbers
4. Dice rolls → results are shown in real-time

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js
- **Realtime Communication:** Socket.IO
- **Server:** Express.js

---

https://casino-multiplayer-game.onrender.com
