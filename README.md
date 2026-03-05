SETUP INSTRUCTIONS:

Clone the repository from github

Open a terminal and type the following commands in sequence:
1. cd backend
2. npm install
3. node src/index.js

Open another terminal keeping this one running:
1. cd frontend
2. npm run dev
3. Open the link displayed on the terminal and you will be able to play the game.

Live URL- https://web3task-skribble-clone.vercel.app/



Architecture Overview :-

This project uses React for the frontend and Node.js + Socket.io for the backend.
Players connect to the server using WebSockets, which allows real-time communication between all users in a room.

The canvas is used for drawing. When the drawer moves the mouse, the drawing coordinates are sent to the server through WebSockets. The server then broadcasts these coordinates to all other players so everyone sees the drawing in real time.

The game logic (rounds, word selection, scoring, and timer) is handled on the backend. The server keeps track of players, decides whose turn it is to draw, checks guesses, updates scores, and sends updates to all players.



Code Walkthrough Readiness

The application is structured to keep responsibilities clear.
The frontend (React) handles the user interface, canvas drawing, and sending player actions to the server.
The backend (Node.js + Socket.io) manages rooms, game state, rounds, scoring, and real-time communication.

The typical flow is:

A player creates or joins a room.

The host starts the game.

The server selects a drawer and sends word choices.

The drawer selects a word and starts drawing on the canvas.

Drawing data is sent through WebSockets and displayed to other players.

Players send guesses, the server checks them, updates scores, and the round ends with an alert showing winner.