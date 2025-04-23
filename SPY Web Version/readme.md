# Spy Game

A real-time multiplayer social deduction game where players try to identify the spy among them, while the spy attempts to figure out the secret location.

## 🌟 Features

- **Bilingual Support**: Full support for English and Persian languages  
- **Real-time Multiplayer**: Play with friends using Socket.IO  
- **Mobile Responsive**: Optimized for both desktop and mobile devices  
- **Customizable Settings**: Adjust number of spies and other game parameters  
- **Visual Timer**: Countdown timer with visual progress indicator  
- **Beautiful UI**: Modern, animated interface with intuitive controls  

## 🔧 Technologies

- **Frontend**: HTML5, CSS3, JavaScript  
- **Backend**: Node.js, Express  
- **Websockets**: Socket.IO  
- **Animations**: Animate.css  
- **Fonts**: Google Fonts (Poppins, Vazirmatn)  

## 📋 Prerequisites

- Node.js (v14.0.0 or higher)  
- npm (v6.0.0 or higher)  

## 🚀 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sinaaasghari/SPY Web Version
   cd spy-game
   
2. Install dependencies:
   ```bash
   npm install

4. Start the server:
   ```bash
   node server.js

6. Open your browser and navigate to:
  ```bash
  http://localhost:3000
  ```

## 🎮 How to Play

### Create or Join a Game:

- Start by selecting your language (English or Persian)
  
- Enter your name
  
- Create a new game or join an existing one with a Game ID

### In the Lobby:

- Share the Game ID with friends so they can join
  
- The game creator can adjust the number of spies
  
- Start the game when everyone is ready

### During Gameplay:

- Regular players receive a location card

- Spies receive a spy card but don’t know the location

- Players take turns asking questions to identify spies

- Spies must blend in while trying to figure out the location

### Game End Conditions:

- Players vote to accuse someone of being a spy

- Spies can guess the location at any time

- If players correctly identify all spies, players win

- If spies guess the correct location, spies win


## 🛠️ API Documentation

### Socket.IO Events

#### Client to Server:

- `createGame`: Create a new game session  
- `joinGame`: Join an existing game session  
- `startGame`: Start the game  
- `nextTurn`: End current player’s turn  
- `accusePlayer`: Accuse a player of being a spy  
- `castVote`: Vote on an accusation  
- `guessLocation`: Spy guesses the location  
- `setNumSpies`: Set the number of spies  

#### Server to Client:

- `gameCreated`: A new game has been created  
- `gameJoined`: Player has joined a game  
- `gameStateUpdate`: Game state has changed  
- `gameInfo`: Game information update  
- `numSpiesUpdated`: Number of spies has been updated  
- `error`: Error message

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository

2. Create your feature branch:

   ```bash
   git checkout -b feature/amazing-feature

3. Commit your changes:
   
   ```bash
   git commit -m 'Add some amazing feature'


5. Push to the branch:

   ```bash
   git push origin feature/amazing-feature

7. Open a Pull Request


📜 License  
This project is licensed under the MIT License - see the LICENSE file for details.

👏 Acknowledgments  
- Socket.IO for real-time communication  
- Animate.css for animations  
- Google Fonts for typography  
- All contributors and testers



