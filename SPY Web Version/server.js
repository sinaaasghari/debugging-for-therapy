// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { GameManager, LANGUAGES } = require('./spy-game-backend');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Game manager instance
const gameManager = new GameManager();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New connection:', socket.id);
  
  // Create a new game
  socket.on('createGame', ({ language, playerName }) => {
    try {
      const gameId = gameManager.createGame(language);
      const game = gameManager.getGame(gameId);
      
      // Add the player who created the game
      const player = game.addPlayer(socket.id, playerName);
      
      // Join the socket to a room with the game ID
      socket.join(gameId);
      socket.gameId = gameId;
      socket.playerId = socket.id;
      
      socket.emit('gameCreated', { 
        gameId, 
        playerId: socket.id,
        playerName 
      });
      
      // Broadcast to all players in the game
      updateGameState(gameId);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Add to socket.io event listeners
  socket.on('setNumSpies', ({ numSpies }) => {
    try {
      const gameId = socket.gameId;
      const game = gameManager.getGame(gameId);
      
      const actualNumSpies = game.setNumSpies(numSpies);
      
      // Broadcast the update to all players
      io.to(gameId).emit('numSpiesUpdated', { numSpies: actualNumSpies });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });


  // Join an existing game
  socket.on('joinGame', ({ gameId, playerName }) => {
    try {
      const game = gameManager.getGame(gameId);
      
      // Add the player to the game
      game.addPlayer(socket.id, playerName);
      
      // Join the socket to the game room
      socket.join(gameId);
      socket.gameId = gameId;
      socket.playerId = socket.id;
      
      socket.emit('gameJoined', { 
        gameId, 
        playerId: socket.id,
        playerName 
      });
      
      // Broadcast to all players in the game
      updateGameState(gameId);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Start the game
  socket.on('startGame', () => {
    try {
      const gameId = socket.gameId;
      const game = gameManager.getGame(gameId);
      
      game.startGame();
      updateGameState(gameId);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Next turn
  socket.on('nextTurn', () => {
    try {
      const gameId = socket.gameId;
      const game = gameManager.getGame(gameId);
      
      game.nextTurn();
      updateGameState(gameId);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Accuse a player
  socket.on('accusePlayer', ({ accusedId }) => {
    try {
      const gameId = socket.gameId;
      const game = gameManager.getGame(gameId);
      
      game.accusePlayer(socket.id, accusedId);
      updateGameState(gameId);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Cast vote during accusation
  socket.on('castVote', ({ vote }) => {
    try {
      const gameId = socket.gameId;
      const game = gameManager.getGame(gameId);
      
      const result = game.castVote(socket.id, vote);
      updateGameState(gameId);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Spy makes location guess
  socket.on('guessLocation', ({ locationGuess }) => {
    try {
      const gameId = socket.gameId;
      const game = gameManager.getGame(gameId);
      
      const result = game.makeLocationGuess(socket.id, locationGuess);
      updateGameState(gameId);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Change language
  socket.on('changeLanguage', ({ language }) => {
    try {
      const gameId = socket.gameId;
      const game = gameManager.getGame(gameId);
      
      game.changeLanguage(language);
      updateGameState(gameId);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    try {
      const gameId = socket.gameId;
      if (gameId) {
        const game = gameManager.getGame(gameId);
        game.removePlayer(socket.id);
        
        // If game is empty, remove it
        if (game.players.length === 0) {
          gameManager.removeGame(gameId);
        } else {
          updateGameState(gameId);
        }
      }
    } catch (error) {
      console.error('Error on disconnect:', error.message);
    }
  });

  function updateGameState(gameId) {
    const game = gameManager.getGame(gameId);
    
    // Send individual game state to each player
    game.players.forEach(player => {
      const playerView = game.getPlayerView(player.id);
      io.to(player.id).emit('gameStateUpdate', playerView);
    });
    
    // Also send a general game state (without secrets)
    io.to(gameId).emit('gameInfo', {
      gameId: game.gameId,
      players: game.players.map(p => ({ id: p.id, name: p.name })),
      status: game.status,
      currentPlayer: game.getCurrentPlayer().id,
      timeRemaining: game.getTimeRemaining()
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
